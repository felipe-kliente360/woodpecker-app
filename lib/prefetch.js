// Prefetch utilitário pra otimizar criação de conjuntos.
//
// (1) topAdversarios — leve, cacheia em sessionStorage com TTL 1h.
//     Roda imediatamente quando o username chess.com é confirmado.
// (2) analyzePlayer — pesado (Stockfish, 2-3 min). Agendado via
//     requestIdleCallback pra não competir com a CPU dos puzzles. Cache
//     nativo em IndexedDB via ChessAnalysis.loadProgram/saveProgram.
//
// Tudo silencioso a falhas — prefetch é otimização, não bloqueia nada.
(function (global) {
  "use strict";

  const TTL_ADV_MS = 60 * 60 * 1000; // 1h
  const TTL_ANALISE_MS = 24 * 60 * 60 * 1000; // 24h
  const KEY_PREFIX = "wp_pref_";

  function chaveAdv(u) { return KEY_PREFIX + "adv_" + u.toLowerCase(); }

  function lerAdv(username) {
    if (!username) return null;
    try {
      const raw = global.sessionStorage.getItem(chaveAdv(username));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.ts || (Date.now() - obj.ts) > TTL_ADV_MS) return null;
      return obj.lista;
    } catch (_) { return null; }
  }

  function gravarAdv(username, lista) {
    if (!username) return;
    try {
      global.sessionStorage.setItem(chaveAdv(username), JSON.stringify({
        ts: Date.now(), lista: lista,
      }));
    } catch (_) {}
  }

  let _emCurso = {};
  // Retorna lista (cacheada ou recém-fetchada). null em caso de erro.
  async function adversarios(username, opts) {
    if (!username) return null;
    const k = username.toLowerCase();
    const cached = lerAdv(username);
    if (cached) return cached;
    if (_emCurso[k]) return _emCurso[k];
    const CA = global.ChessAnalysis;
    if (!CA || !CA.topAdversarios) return null;
    _emCurso[k] = (async () => {
      try {
        const lista = await CA.topAdversarios(
          username, opts || { maxMonths: 6, top: 5, minGames: 3 }
        );
        gravarAdv(username, lista);
        return lista;
      } catch (_) { return null; }
      finally { delete _emCurso[k]; }
    })();
    return _emCurso[k];
  }

  // Idade da última análise salva (em ms) ou null. Usa o campo
  // analyzed_at do programa em IndexedDB.
  async function idadeAnalise(username) {
    if (!username) return null;
    const CA = global.ChessAnalysis;
    if (!CA || !CA.loadProgram) return null;
    try {
      const p = await CA.loadProgram(username);
      if (!p || !p.analyzed_at) return null;
      const t = new Date(p.analyzed_at).getTime();
      if (isNaN(t)) return null;
      return Date.now() - t;
    } catch (_) { return null; }
  }

  // Agenda análise em background. Skipa se já existe uma recente (< TTL).
  // Usa requestIdleCallback quando disponível pra não pisar na CPU
  // durante interação do usuário.
  let _analiseAgendada = {};
  function agendarAnalise(username) {
    if (!username) return;
    const k = username.toLowerCase();
    if (_analiseAgendada[k]) return;
    _analiseAgendada[k] = true;
    const CA = global.ChessAnalysis;
    if (!CA || !CA.analyzePlayer) { delete _analiseAgendada[k]; return; }
    const dispara = async () => {
      try {
        const idade = await idadeAnalise(username);
        if (idade !== null && idade < TTL_ANALISE_MS) return;
        await CA.analyzePlayer(username, function () {});
      } catch (_) {}
      finally { delete _analiseAgendada[k]; }
    };
    if (typeof global.requestIdleCallback === "function") {
      global.requestIdleCallback(dispara, { timeout: 8000 });
    } else {
      setTimeout(dispara, 1500);
    }
  }

  // Limpa caches do username (após reanálise manual, p.ex.).
  function invalidar(username) {
    if (!username) return;
    try { global.sessionStorage.removeItem(chaveAdv(username)); } catch (_) {}
  }

  global.WP = global.WP || {};
  global.WP.Prefetch = {
    adversarios:    adversarios,
    lerAdversarios: lerAdv,
    agendarAnalise: agendarAnalise,
    idadeAnalise:   idadeAnalise,
    invalidar:      invalidar,
  };
})(typeof window !== "undefined" ? window : globalThis);
