// Helpers de manipulação de puzzles, FEN, UCI e SAN.
// Lógica pura (apenas Chess da chess.js como dependência global).
// Zero React, zero localStorage.
(function (global) {
  "use strict";

  const ChessLib = global.Chess;

  function embaralhar(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  function determinaCorJogador(fen) {
    const turno = (fen || "").split(" ")[1];
    return turno === "w" ? "Brancas jogam" : "Pretas jogam";
  }

  function corDoTabuleiro(fen) {
    const turno = (fen || "").split(" ")[1];
    return turno === "w" ? "white" : "black";
  }

  function lanceUciParaSan(uci, fenAntes) {
    if (!ChessLib) return uci;
    try {
      const c = new ChessLib(fenAntes);
      const m = c.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4] || "q",
      });
      return m ? m.san : uci;
    } catch (_) { return uci; }
  }

  function aplicarLanceSilencioso(chess, uci) {
    return chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4] || "q",
    });
  }

  function sequenciaSan(fenInicial, lances) {
    if (!ChessLib) return lances.slice();
    const c = new ChessLib(fenInicial);
    const sans = [];
    for (const uci of lances) {
      try {
        const m = c.move({
          from: uci.slice(0, 2),
          to: uci.slice(2, 4),
          promotion: uci[4] || "q",
        });
        sans.push(m ? m.san : uci);
      } catch (_) { sans.push(uci); }
    }
    return sans;
  }

  global.WP = global.WP || {};
  global.WP.Puzzle = {
    embaralhar: embaralhar,
    determinaCorJogador: determinaCorJogador,
    corDoTabuleiro: corDoTabuleiro,
    lanceUciParaSan: lanceUciParaSan,
    aplicarLanceSilencioso: aplicarLanceSilencioso,
    sequenciaSan: sequenciaSan,
  };
})(typeof window !== "undefined" ? window : globalThis);
