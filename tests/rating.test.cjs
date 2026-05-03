const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, loadAllDomain } = require("./_loader.cjs");

function dom() {
  const w = makeSandbox();
  loadAllDomain(w);
  return w.WP;
}

test("calcularRatingSugerido retorna null para ciclo vazio", () => {
  const { Rating } = dom();
  assert.equal(Rating.calcularRatingSugerido({ resultados: [] }), null);
  assert.equal(Rating.calcularRatingSugerido(null), null);
  assert.equal(Rating.calcularRatingSugerido({}), null);
});

test("calcularRatingSugerido — bracket 1200 com taxa 60% sugere centro do bracket", () => {
  const { Rating } = dom();
  // 5 puzzles em 1200-1399, 3 acertos = 60% (alvo do algoritmo)
  const ciclo = { resultados: [
    { rating: 1200, correto: true },
    { rating: 1250, correto: true },
    { rating: 1300, correto: true },
    { rating: 1350, correto: false },
    { rating: 1390, correto: false },
  ] };
  const r = Rating.calcularRatingSugerido(ciclo);
  // Centro do bracket = 1200 + 100 = 1300, arredondado em 50pts
  assert.equal(r, 1300);
});

test("calcularRatingSugerido — bracket com taxa muito alta empurra pra cima", () => {
  const { Rating } = dom();
  // 4 acertos de 4 em 1200-1399 (100% — taxa > 0.80 → centro = 1200 + 170 = 1370 → 1350)
  const ciclo = { resultados: [
    { rating: 1200, correto: true },
    { rating: 1250, correto: true },
    { rating: 1300, correto: true },
    { rating: 1350, correto: true },
  ] };
  const r = Rating.calcularRatingSugerido(ciclo);
  assert.ok(r >= 1300 && r <= 1400, "esperado em 1300-1400, recebido " + r);
});

test("calcularRatingSugerido — clamp em 600 e 2800", () => {
  const { Rating } = dom();
  // Apenas erros baixos → fallback semNenhum
  const ciclo = { resultados: [
    { rating: 700, correto: false },
    { rating: 720, correto: false },
  ] };
  const r = Rating.calcularRatingSugerido(ciclo);
  assert.ok(r >= 600, "rating ≥ 600, recebido " + r);
});

test("ratingUnificado — sem dados retorna null", () => {
  const { Rating } = dom();
  assert.equal(Rating.ratingUnificado([], null), null);
});

test("ratingUnificado — combina ciclo + análise por peso (alta confidence)", () => {
  const { Rating } = dom();
  // peso de performance é min(1, total/30) e só entra se >= 0.2 — 6 puzzles = 0.2
  const resultados = [];
  for (let i = 0; i < 10; i++) resultados.push({ rating: 1300, correto: i < 6 });
  const ciclo = { numero: 3, data_fim: Date.now(), resultados: resultados };
  const programa = {
    suggested_rating: 1500,
    tactical_confidence: { level: "alta" },
    games_analyzed: 30,
  };
  const u = Rating.ratingUnificado([ciclo], programa);
  assert.equal(u.fontes.length, 2, "deveria ter 2 fontes (perf + análise)");
  assert.ok(u.rating >= 1400 && u.rating <= 1550, "rating combinado em faixa esperada, got " + u.rating);
  assert.ok(u.range[0] >= 600 && u.range[1] <= 2800);
});

test("ratingUnificado — calibração tem peso 1.2 (mais que performance)", () => {
  const { Rating } = dom();
  const calib = { numero: 1, calibracao: true, data_fim: Date.now(), resultados: [
    { rating: 1100, correto: true }, { rating: 1100, correto: true },
    { rating: 1100, correto: true }, { rating: 1100, correto: false },
    { rating: 1100, correto: false },
  ] };
  const u = Rating.ratingUnificado([calib], null);
  assert.ok(u.fontes.length >= 1);
  assert.equal(u.fontes[0].nome, "Calibração");
  assert.equal(u.fontes[0].peso, 1.2);
});

test("ratingPonderadoChesscom retorna null sem stats relevantes", () => {
  const { Rating } = dom();
  assert.equal(Rating.ratingPonderadoChesscom(null), null);
  assert.equal(Rating.ratingPonderadoChesscom({}), null);
  assert.equal(Rating.ratingPonderadoChesscom({ chess_daily: { last: { rating: 1500 } } }), null);
});

test("ratingPonderadoChesscom: rapid sozinho retorna o próprio rating arredondado em 50", () => {
  const { Rating } = dom();
  const r = Rating.ratingPonderadoChesscom({
    chess_rapid: { last: { rating: 1487 } },
  });
  assert.equal(r.rating, 1500);
  assert.equal(r.fontes.length, 1);
  assert.equal(r.fontes[0].time_class, "rapid");
});

test("ratingPonderadoChesscom: rapid > blitz > bullet (pesos 2.0/1.0/0.5)", () => {
  const { Rating } = dom();
  // rapid 1600 (peso 2.0) + blitz 1400 (peso 1.0) + bullet 1200 (peso 0.5)
  // média = (3200 + 1400 + 600) / 3.5 = 5200 / 3.5 ≈ 1485.7 → 1500
  const r = Rating.ratingPonderadoChesscom({
    chess_rapid:  { last: { rating: 1600 } },
    chess_blitz:  { last: { rating: 1400 } },
    chess_bullet: { last: { rating: 1200 } },
  });
  assert.equal(r.rating, 1500);
  assert.equal(r.fontes.length, 3);
  assert.equal(r.fontes[0].time_class, "rapid");
});

test("ratingPonderadoChesscom: ignora chess_daily mesmo se presente", () => {
  const { Rating } = dom();
  const r = Rating.ratingPonderadoChesscom({
    chess_blitz: { last: { rating: 1500 } },
    chess_daily: { last: { rating: 2200 } },
  });
  assert.equal(r.rating, 1500);
  assert.equal(r.fontes.length, 1);
  assert.equal(r.fontes[0].time_class, "blitz");
});

test("ratingPonderadoChesscom: clamp 600..2800", () => {
  const { Rating } = dom();
  const lo = Rating.ratingPonderadoChesscom({ chess_rapid: { last: { rating: 100 } } });
  assert.equal(lo.rating, 600);
  const hi = Rating.ratingPonderadoChesscom({ chess_rapid: { last: { rating: 3500 } } });
  assert.equal(hi.rating, 2800);
});
