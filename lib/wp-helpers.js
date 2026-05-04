// Utilitários puros do Woodpecker — extraídos de index.html para reduzir
// tamanho do bloco inline de babel e separar lógica não-React.
// Expõe namespace window.WP_HELPERS consumido por destructuring no topo do
// bloco babel. Nada aqui depende de React.

(function (global) {
  "use strict";

  const TEMAS = {
    fork:             "Garfo",
    pin:              "Cravada",
    skewer:           "Espeto",
    discoveredAttack: "Ataque Descoberto",
    discoveredCheck:  "Xeque Descoberto",
    doubleCheck:      "Xeque Duplo",
    mate:             "Mate",
    mateIn1:          "Mate em 1",
    mateIn2:          "Mate em 2",
    mateIn3:          "Mate em 3",
    backRankMate:     "Mate na Última Fileira",
    smotheredMate:    "Mate Sufocado",
    epauletteMate:    "Mate de Epaulete",
    cornerMate:       "Mate no Canto",
    arabianMate:      "Mate Árabe",
    hookMate:         "Mate em Gancho",
    blindSwineMate:   "Mate dos Porcos Cegos",
    killBoxMate:      "Mate da Caixa",
    hangingPiece:     "Peça Pendurada",
    trappedPiece:     "Peça Presa",
    exposedKing:      "Rei Exposto",
    sacrifice:        "Sacrifício",
    deflection:       "Desvio",
    decoy:            "Isca",
    attraction:       "Atração",
    interference:     "Interferência",
    clearance:        "Despejo de Linha",
    capturingDefender:"Remoção do Defensor",
    overloading:      "Sobrecarga",
    intermezzo:       "Intermezzo",
    xRayAttack:       "Raio X",
    collinearMove:    "Lance Colinear",
    kingsideAttack:   "Ataque ao Rei",
    queensideAttack:  "Ataque na Ala da Dama",
    attackingF2F7:    "Ataque em f2/f7",
    rookEndgame:      "Final de Torres",
    pawnEndgame:      "Final de Peões",
    promotion:        "Promoção",
    enPassant:        "En Passant",
    zugzwang:         "Zugzwang",
    endgame:          "Final",
    opening:          "Abertura",
    middlegame:       "Meio-jogo",
    long:             "Sequência Longa",
    short:            "Sequência Curta"
  };

  const TEMAS_INSTRUTIVOS = new Set([
    'fork', 'pin', 'skewer', 'discoveredAttack', 'discoveredCheck',
    'doubleCheck', 'deflection', 'attraction', 'decoy', 'interference',
    'clearance', 'capturingDefender', 'overloading', 'intermezzo',
    'sacrifice', 'kingsideAttack', 'queensideAttack', 'attackingF2F7',
    'backRankMate', 'smotheredMate', 'epauletteMate', 'cornerMate',
    'arabianMate', 'hookMate', 'rookEndgame', 'pawnEndgame',
    'promotion', 'enPassant', 'xRayAttack', 'trappedPiece',
    'hangingPiece', 'mateIn1', 'mateIn2', 'mateIn3', 'zugzwang',
  ]);

  const FAIXAS_ORDER = [
    ["600_800", 600, 800],
    ["800_1000", 800, 1000],
    ["1000_1200", 1000, 1200],
    ["1200_1400", 1200, 1400],
    ["1400_1600", 1400, 1600],
    ["1600_1800", 1600, 1800],
    ["1800_2000", 1800, 2000],
    ["2000_2800", 2000, 2800]
  ];

  const SRS_DIAS_REVISAO = 3;
  const SRS_MIN_ERROS    = 2;

  function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function formatarTempo(s) {
    s = Math.max(0, Math.floor(s));
    if (s < 60) return "0:" + pad(s);
    if (s < 3600) {
      const m = Math.floor(s / 60); const sec = s % 60;
      return pad(m) + ":" + pad(sec);
    }
    const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60);
    return h + ":" + pad(m) + ":" + pad(s % 60);
  }

  function formatarTempoLongo(s) {
    s = Math.max(0, Math.floor(s));
    if (s < 60) return s + "s";
    const m = Math.floor(s / 60);
    if (m < 60) return m + "min";
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm === 0 ? (h + "h") : (h + "h " + rm + "min");
  }

  function formatarNumero(n) {
    return n.toLocaleString('pt-BR');
  }

  function traduzirTema(chave) {
    return TEMAS[chave] || chave;
  }

  function faixaDeRating(rating) {
    if (rating < 800)  return "600_800";
    if (rating < 1000) return "800_1000";
    if (rating < 1200) return "1000_1200";
    if (rating < 1400) return "1200_1400";
    if (rating < 1600) return "1400_1600";
    if (rating < 1800) return "1600_1800";
    if (rating < 2000) return "1800_2000";
    return "2000_2800";
  }

  function faixasNoIntervalo(min, max) {
    const out = [];
    for (const tup of FAIXAS_ORDER) {
      const chave = tup[0], lo = tup[1], hi = tup[2];
      if (hi > min && lo <= max) out.push(chave);
    }
    return out.length ? out : [faixaDeRating(Math.round((min + max) / 2))];
  }

  function faixasNecessarias(rating, variacao) {
    return faixasNoIntervalo(rating - variacao, rating + variacao);
  }

  function loadLS(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function saveLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.warn("Falha ao salvar", key, e); }
  }

  function clearLS(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function ciclosDoConjunto(ciclos, conjuntoId) {
    return ciclos.filter(c => c.conjunto_id === conjuntoId)
      .sort((a, b) => a.numero - b.numero);
  }

  function ultimoCiclo(ciclos, conjuntoId) {
    const c = ciclosDoConjunto(ciclos, conjuntoId);
    return c.length ? c[c.length - 1] : null;
  }

  // Cache do nó de medição. Converte qualquer cor CSS válida (oklch, hex,
  // rgb, hsl) pra rgb()/rgba() — formato que Chart.js (canvas) consome.
  let _corMedidor = null;
  function _aRgb(color) {
    if (!color) return color;
    if (color.indexOf('rgb') === 0) return color;
    try {
      if (!_corMedidor) {
        _corMedidor = document.createElement('span');
        _corMedidor.style.display = 'none';
        document.body.appendChild(_corMedidor);
      }
      _corMedidor.style.color = '';
      _corMedidor.style.color = color;
      const c = getComputedStyle(_corMedidor).color;
      return c || color;
    } catch (e) { return color; }
  }
  function corCss(varName) {
    try {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      // Modern browsers podem expor oklch como literal — Chart.js (Color
      // parser) ainda não suporta. Converte via DOM pra rgb().
      return _aRgb(raw) || raw || '#888';
    } catch (e) { return '#888'; }
  }

  // Completa lista de temas pra exatamente N (default 5). Garante 5
  // temas mesmo quando análise rendeu menos. Fallback é uma lista de
  // temas táticos comuns que aparecem em qualquer faixa de rating.
  // Mantém a ordem dos temas detectados (priority alta primeiro) e só
  // adiciona do fallback se necessário, ignorando duplicatas.
  const FALLBACK_TEMAS = [
    'fork', 'pin', 'skewer', 'hangingPiece', 'mateIn2',
    'deflection', 'attraction', 'sacrifice', 'discoveredAttack',
    'capturingDefender', 'overloading', 'trappedPiece',
  ];
  function completarTemas(temas, n) {
    n = n || 5;
    const out = (temas || []).slice(0, n);
    for (const t of FALLBACK_TEMAS) {
      if (out.length >= n) break;
      if (!out.includes(t)) out.push(t);
    }
    return out.slice(0, n);
  }

  global.WP_HELPERS = {
    TEMAS: TEMAS,
    TEMAS_INSTRUTIVOS: TEMAS_INSTRUTIVOS,
    FAIXAS_ORDER: FAIXAS_ORDER,
    SRS_DIAS_REVISAO: SRS_DIAS_REVISAO,
    SRS_MIN_ERROS: SRS_MIN_ERROS,
    gerarId: gerarId,
    pad: pad,
    formatarTempo: formatarTempo,
    formatarTempoLongo: formatarTempoLongo,
    formatarNumero: formatarNumero,
    traduzirTema: traduzirTema,
    faixaDeRating: faixaDeRating,
    faixasNoIntervalo: faixasNoIntervalo,
    faixasNecessarias: faixasNecessarias,
    loadLS: loadLS,
    saveLS: saveLS,
    clearLS: clearLS,
    ciclosDoConjunto: ciclosDoConjunto,
    ultimoCiclo: ultimoCiclo,
    corCss: corCss,
    completarTemas: completarTemas,
  };
})(typeof window !== 'undefined' ? window : globalThis);
