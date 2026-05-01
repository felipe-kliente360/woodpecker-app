const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, loadAllDomain } = require("./_loader.cjs");

function dom() {
  const w = makeSandbox();
  loadAllDomain(w);
  return { WP: w.WP, Chess: w.Chess };
}

test("embaralhar mantém comprimento e tem mesmos elementos", () => {
  const { WP } = dom();
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const out = WP.Puzzle.embaralhar(orig);
  assert.equal(out.length, orig.length);
  assert.deepEqual(out.slice().sort((a, b) => a - b), orig);
  // Não muta original
  assert.deepEqual(orig, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test("determinaCorJogador identifica brancas/pretas via FEN", () => {
  const { WP } = dom();
  assert.equal(WP.Puzzle.determinaCorJogador("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"), "Brancas jogam");
  assert.equal(WP.Puzzle.determinaCorJogador("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"), "Pretas jogam");
});

test("corDoTabuleiro retorna white/black para chessboardjs", () => {
  const { WP } = dom();
  assert.equal(WP.Puzzle.corDoTabuleiro("8 w - - 0 1"), "white");
  assert.equal(WP.Puzzle.corDoTabuleiro("8 b - - 0 1"), "black");
});

test("lanceUciParaSan converte UCI em notação SAN", () => {
  const { WP } = dom();
  const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  assert.equal(WP.Puzzle.lanceUciParaSan("e2e4", fen), "e4");
  assert.equal(WP.Puzzle.lanceUciParaSan("g1f3", fen), "Nf3");
});

test("sequenciaSan converte série de UCIs em SANs encadeados", () => {
  const { WP } = dom();
  const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const sans = WP.Puzzle.sequenciaSan(fen, ["e2e4", "e7e5", "g1f3"]);
  assert.deepEqual(sans, ["e4", "e5", "Nf3"]);
});

test("aplicarLanceSilencioso muta chess corretamente", () => {
  const { WP, Chess } = dom();
  const c = new Chess();
  const m = WP.Puzzle.aplicarLanceSilencioso(c, "e2e4");
  assert.ok(m, "movimento legal retorna objeto");
  assert.match(c.fen(), /\sb\s/, "side-to-move agora preto");
});
