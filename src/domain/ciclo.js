// Métricas de atividade e nível de rating. Lógica pura.
// Zero React, zero localStorage.
(function (global) {
  "use strict";

  function metricasAtividade(ciclos) {
    if (!Array.isArray(ciclos) || !ciclos.length) {
      return { total: 0, diasAtivos: 0, ultimaMs: 0, diasDesde: null };
    }
    const sorted = ciclos.slice().sort((a, b) => (a.data_fim || 0) - (b.data_fim || 0));
    const dias = new Set();
    for (const c of sorted) {
      if (c.data_fim) dias.add(new Date(c.data_fim).toISOString().slice(0, 10));
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
  // cada elemento { data: 'YYYY-MM-DD', count: número de ciclos concluídos }.
  // Usado pra render heatmap estilo GitHub na home.
  function streakPorDia(ciclos, dias, hojeOpts) {
    const hoje = hojeOpts || new Date();
    const base = new Date(hoje);
    base.setHours(0, 0, 0, 0);
    const lookup = {};
    for (const c of (ciclos || [])) {
      if (!c.data_fim) continue;
      const k = new Date(c.data_fim).toISOString().slice(0, 10);
      lookup[k] = (lookup[k] || 0) + 1;
    }
    const out = [];
    for (let i = dias - 1; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      out.push({ data: k, count: lookup[k] || 0 });
    }
    return out;
  }

  // Streak atual em dias consecutivos com pelo menos 1 ciclo.
  // Conta a partir de hoje pra trás. Para no primeiro dia sem ciclo.
  function streakAtual(ciclos, hojeOpts) {
    const dias = streakPorDia(ciclos || [], 365, hojeOpts);
    let n = 0;
    for (let i = dias.length - 1; i >= 0; i--) {
      if (dias[i].count > 0) n += 1;
      else break;
    }
    return n;
  }

  global.WP = global.WP || {};
  global.WP.Ciclo = {
    metricasAtividade: metricasAtividade,
    nivelDoRating: nivelDoRating,
    streakPorDia: streakPorDia,
    streakAtual: streakAtual,
  };
})(typeof window !== "undefined" ? window : globalThis);
