// Estimadores de rating: por ciclo (calcularRatingSugerido — algoritmo
// de brackets) e unificado (combina performance + análise chess.com).
// Lógica pura. Zero React, zero localStorage, zero IndexedDB.
(function (global) {
  "use strict";

  // Estimador via brackets de 200 pts. Encontra a faixa cuja taxa de
  // acerto fica mais próxima do alvo (60%) e ajusta dentro do bracket.
  function calcularRatingSugerido(ciclo) {
    const r = (ciclo && ciclo.resultados) || [];
    if (r.length === 0) return null;
    const ALVO = 0.60;
    const W = 200;
    const corretos = r.filter(x => x.correto && x.rating);
    const semNenhum = corretos.length === 0;

    if (semNenhum) {
      const ratings = r.filter(x => x.rating).map(x => x.rating);
      if (!ratings.length) return null;
      return Math.max(600, Math.round((Math.min.apply(null, ratings) - 200) / 50) * 50);
    }

    const buckets = {};
    for (const x of r) {
      if (!x.rating) continue;
      const b = Math.floor(x.rating / W) * W;
      if (!buckets[b]) buckets[b] = { total: 0, ok: 0 };
      buckets[b].total += 1;
      if (x.correto) buckets[b].ok += 1;
    }

    let melhor = null, distMin = Infinity;
    for (const bStr in buckets) {
      const dados = buckets[bStr];
      if (dados.total < 3) continue;
      const taxa = dados.ok / dados.total;
      const dist = Math.abs(taxa - ALVO);
      if (dist < distMin) { distMin = dist; melhor = parseInt(bStr, 10); }
    }

    if (melhor !== null) {
      const taxa = buckets[melhor].ok / buckets[melhor].total;
      let centro = melhor + W / 2;
      if (taxa > 0.80) centro = melhor + W * 0.85;
      else if (taxa < 0.40) centro = melhor + W * 0.15;
      const sugerido = Math.round(centro / 50) * 50;
      return Math.max(600, Math.min(2800, sugerido));
    }

    // Fallback (poucos puzzles por bracket): média dos corretos com ajuste
    const ratings = corretos.map(x => x.rating);
    const media = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const taxa = corretos.length / r.length;
    let ajuste;
    if (taxa >= 0.85) ajuste = 150;
    else if (taxa >= 0.70) ajuste = 75;
    else if (taxa >= 0.50) ajuste = 0;
    else if (taxa >= 0.30) ajuste = -75;
    else ajuste = -150;
    const sugerido = Math.round((media + ajuste) / 50) * 50;
    return Math.max(600, Math.min(2800, sugerido));
  }

  // Combina:
  //  · Performance no app (último ciclo concluído + calibração se houver)
  //  · Análise chess.com (programa salvo em IndexedDB)
  // Cada fonte tem peso por confiança + tamanho da amostra.
  function ratingUnificado(ciclos, programaAtual) {
    const fontes = [];

    if (Array.isArray(ciclos) && ciclos.length > 0) {
      const ord = ciclos.slice().sort((a, b) => (b.data_fim || 0) - (a.data_fim || 0));
      let calib = null, ult = null;
      for (const c of ord) {
        if (c.calibracao && !calib) calib = c;
        if (!ult) ult = c;
        if (calib && ult) break;
      }
      if (calib) {
        const r = calcularRatingSugerido(calib);
        if (r != null) fontes.push({
          nome: "Calibração", valor: r, peso: 1.2, conf: "alta",
          detalhe: (calib.resultados || []).length + " puzzles",
        });
      }
      if (ult && (!calib || ult !== calib)) {
        const r = calcularRatingSugerido(ult);
        if (r != null) {
          const total = (ult.resultados || []).length;
          const peso = Math.min(1.0, total / 30);
          if (peso >= 0.2) fontes.push({
            nome: "Performance recente", valor: r, peso: peso, conf: "média",
            detalhe: total + " puzzles · ciclo " + (ult.numero || "?"),
          });
        }
      }
    }

    if (programaAtual && programaAtual.suggested_rating) {
      const lvl = (programaAtual.tactical_confidence || {}).level;
      const peso = lvl === "alta"  ? 1.5
                 : lvl === "média" ? 1.0
                 : lvl === "baixa" ? 0.5 : 0;
      if (peso > 0) fontes.push({
        nome: "Análise chess.com",
        valor: programaAtual.suggested_rating,
        peso: peso, conf: lvl,
        detalhe: (programaAtual.games_analyzed || "?") + " partidas",
      });
    }

    if (fontes.length === 0) return null;
    const totalP = fontes.reduce((a, f) => a + f.peso, 0);
    const rating = Math.round(
      fontes.reduce((a, f) => a + f.valor * f.peso, 0) / totalP / 50
    ) * 50;
    const valores = fontes.map(f => f.valor);
    const min = Math.max(600, Math.min.apply(null, valores) - 50);
    const max = Math.min(2800, Math.max.apply(null, valores) + 50);
    return {
      rating: Math.max(600, Math.min(2800, rating)),
      range: [min, max],
      fontes: fontes,
    };
  }

  global.WP = global.WP || {};
  global.WP.Rating = {
    calcularRatingSugerido: calcularRatingSugerido,
    ratingUnificado: ratingUnificado,
  };
})(typeof window !== "undefined" ? window : globalThis);
