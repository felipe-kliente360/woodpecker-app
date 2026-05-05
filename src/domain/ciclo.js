// Métricas de atividade e nível de rating. Lógica pura.
// Zero React, zero localStorage.
//
// Atividade = qualquer puzzle finalizado (acerto, erro ou pulado).
// Não exige ciclo concluído. Datas SEMPRE em fuso local — toISOString()
// dá UTC e bagunça streak/contagens pra usuários fora do GMT.
(function (global) {
  "use strict";

  // Chave YYYY-MM-DD no fuso local (Date ou ms).
  function chaveLocal(d) {
    const dt = (d instanceof Date) ? d : new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + dd;
  }

  // Itera resultados (ciclos concluídos + sessão em andamento) chamando
  // cb(finalizado_em_ms, tempo_s) por puzzle. Fallback pra schemas antigos
  // sem finalizado_em por puzzle: usa ciclo.data_fim e tempo_total_s.
  function _forEachResultado(ciclos, sessao, cb) {
    for (const c of (ciclos || [])) {
      const resultados = c.resultados || [];
      let cobriu = false;
      for (const r of resultados) {
        if (r && r.finalizado_em) {
          cb(r.finalizado_em, r.tempo_s || 0);
          cobriu = true;
        }
      }
      if (!cobriu && c.data_fim) {
        // Schema legado: agrupa o ciclo inteiro no dia em que foi fechado.
        const tempoTotal = c.tempo_total_s ||
          resultados.reduce((s, r) => s + (r && r.tempo_s || 0), 0);
        const n = resultados.length || 1;
        for (let i = 0; i < n; i++) {
          cb(c.data_fim, tempoTotal / n);
        }
      }
    }
    if (sessao && Array.isArray(sessao.resultados_parciais)) {
      for (const r of sessao.resultados_parciais) {
        if (r && r.finalizado_em) cb(r.finalizado_em, r.tempo_s || 0);
      }
    }
  }

  function metricasAtividade(ciclos) {
    if (!Array.isArray(ciclos) || !ciclos.length) {
      return { total: 0, diasAtivos: 0, ultimaMs: 0, diasDesde: null };
    }
    const sorted = ciclos.slice().sort((a, b) => (a.data_fim || 0) - (b.data_fim || 0));
    const dias = new Set();
    for (const c of sorted) {
      if (c.data_fim) dias.add(chaveLocal(c.data_fim));
    }
    const ultima = sorted[sorted.length - 1];
    const ultimaMs = ultima ? (ultima.data_fim || 0) : 0;
    const diasDesde = ultimaMs ? (Date.now() - ultimaMs) / 86400000 : null;
    return { total: sorted.length, diasAtivos: dias.size, ultimaMs: ultimaMs, diasDesde: diasDesde };
  }

  function nivelDoRating(r) {
    if (r < 1000) return "Iniciante";
    if (r < 1200) return "Básico";
    if (r < 1400) return "Intermediário";
    if (r < 1600) return "Avançado";
    if (r < 1800) return "Expert";
    return "Mestre";
  }

  // Streak por dia: array dos últimos `dias` dias (mais antigo → hoje),
  // cada elemento { data: 'YYYY-MM-DD' (local), count: nº puzzles do dia }.
  // opts: { sessao?, hoje? } — sessao em andamento conta puzzles parciais;
  //        hoje opcional pra testes determinísticos.
  function streakPorDia(ciclos, dias, opts) {
    opts = opts || {};
    const hoje = opts.hoje || new Date();
    const sessao = opts.sessao || null;
    const base = new Date(hoje);
    base.setHours(0, 0, 0, 0);
    const lookup = {};
    _forEachResultado(ciclos, sessao, (ms) => {
      const k = chaveLocal(ms);
      lookup[k] = (lookup[k] || 0) + 1;
    });
    const out = [];
    for (let i = dias - 1; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const k = chaveLocal(d);
      out.push({ data: k, count: lookup[k] || 0 });
    }
    return out;
  }

  // Streak atual: dias consecutivos com pelo menos 1 puzzle finalizado.
  // Conta de hoje pra trás. opts.sessao incluída pra que o dia atual
  // já some assim que o usuário joga 1 puzzle (mesmo sem terminar ciclo).
  function streakAtual(ciclos, opts) {
    const dias = streakPorDia(ciclos || [], 365, opts);
    let n = 0;
    for (let i = dias.length - 1; i >= 0; i--) {
      if (dias[i].count > 0) n += 1;
      else break;
    }
    return n;
  }

  // Tempo total (segundos) de puzzles finalizados num dado dia (default: hoje),
  // somando ciclos concluídos + sessão em andamento. Fuso local.
  function tempoNoDia(ciclos, sessao, hojeOpts) {
    const k = chaveLocal(hojeOpts || new Date());
    let total = 0;
    _forEachResultado(ciclos, sessao, (ms, tempo) => {
      if (chaveLocal(ms) === k) total += tempo;
    });
    return total;
  }

  global.WP = global.WP || {};
  global.WP.Ciclo = {
    chaveLocal: chaveLocal,
    metricasAtividade: metricasAtividade,
    nivelDoRating: nivelDoRating,
    streakPorDia: streakPorDia,
    streakAtual: streakAtual,
    tempoNoDia: tempoNoDia,
  };
})(typeof window !== "undefined" ? window : globalThis);
