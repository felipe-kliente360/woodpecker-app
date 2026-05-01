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

  global.WP = global.WP || {};
  global.WP.Ciclo = {
    metricasAtividade: metricasAtividade,
    nivelDoRating: nivelDoRating,
  };
})(typeof window !== "undefined" ? window : globalThis);
