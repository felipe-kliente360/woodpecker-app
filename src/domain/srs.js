// SRS leve: identifica puzzles teimosos (errados em ≥ N ciclos) cujo
// último encontro foi há mais de M dias, agrupados por conjunto.
// Lógica pura. Zero React, zero localStorage.
//
// Constantes default vêm de WP.WP_HELPERS para que sejam ajustáveis num
// só lugar; podem ser sobrescritas via parâmetros opts pra testes.
(function (global) {
  "use strict";

  function ciclosDoConjunto(ciclos, conjuntoId) {
    return ciclos.filter(c => c.conjunto_id === conjuntoId)
      .sort((a, b) => a.numero - b.numero);
  }

  function puzzlesDevidoRevisao(ciclos, conjuntos, opts) {
    opts = opts || {};
    const helpers = global.WP_HELPERS || {};
    const minErros  = opts.minErros  != null ? opts.minErros  : (helpers.SRS_MIN_ERROS    != null ? helpers.SRS_MIN_ERROS    : 2);
    const diasReview = opts.diasReview != null ? opts.diasReview : (helpers.SRS_DIAS_REVISAO != null ? helpers.SRS_DIAS_REVISAO : 3);
    const agora = opts.agora != null ? opts.agora : Date.now();
    const horizonteMs = diasReview * 24 * 3600 * 1000;
    const porConjunto = {};

    for (const conj of (conjuntos || [])) {
      const cs = ciclosDoConjunto(ciclos || [], conj.id);
      if (cs.length < 2) continue;
      const porPuzzle = {};
      for (const ciclo of cs) {
        for (const r of (ciclo.resultados || [])) {
          const p = porPuzzle[r.puzzle_id] || (porPuzzle[r.puzzle_id] = {
            erros: 0, ultimoEncontro: 0
          });
          if (!r.correto) p.erros += 1;
          if (ciclo.data_fim && ciclo.data_fim > p.ultimoEncontro) {
            p.ultimoEncontro = ciclo.data_fim;
          }
        }
      }
      let devidos = 0;
      for (const id in porPuzzle) {
        const p = porPuzzle[id];
        if (p.erros < minErros) continue;
        if (!p.ultimoEncontro) continue;
        if ((agora - p.ultimoEncontro) < horizonteMs) continue;
        devidos += 1;
      }
      if (devidos > 0) porConjunto[conj.id] = { devidos: devidos, conjunto: conj };
    }
    return porConjunto;
  }

  global.WP = global.WP || {};
  global.WP.SRS = {
    puzzlesDevidoRevisao: puzzlesDevidoRevisao,
  };
})(typeof window !== "undefined" ? window : globalThis);
