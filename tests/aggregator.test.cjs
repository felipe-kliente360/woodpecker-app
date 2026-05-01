// Smoke do TacticalAggregator (lib/) — reutilizamos a mesma infra de
// teste do domain mesmo que o módulo more em lib/ (vendor-like).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function loadAggregator() {
  const w = {};
  new Function("window", fs.readFileSync(path.join(__dirname, "..", "lib/tactical-aggregator.js"), "utf8"))(w);
  return w.TacticalAggregator;
}

test("aggregateTactical: vazio", () => {
  const ag = loadAggregator();
  const r = ag.aggregateTactical([]);
  assert.deepEqual(r.weighted_top, []);
  assert.equal(r.tactical_confidence.level, "insuficiente");
});

test("aggregateTactical: pondera role A (1.5) > role C (0.6)", () => {
  const ag = loadAggregator();
  const moves = [
    { game_index: 0, time_class: "rapid", loss_cp: 80, tactical_role: "A",
      tactical_theme: "fork", tactical_themes: [{ theme: "fork", confidence: 0.9 }] },
    { game_index: 0, time_class: "rapid", loss_cp: 200, tactical_role: "C",
      tactical_theme: "pin", tactical_themes: [{ theme: "pin", confidence: 0.9 }] },
  ];
  const r = ag.aggregateTactical(moves);
  // fork (A=1.5, rapid=2, rf=1) = 3.0
  // pin  (C=0.6, rapid=2, rf=1) = 1.2
  const fork = r.weighted_top.find(t => t.theme === "fork");
  const pin  = r.weighted_top.find(t => t.theme === "pin");
  assert.ok(fork.score > pin.score, "fork deve ter score maior que pin");
});

test("derivePuzzleProgram: rating 1500 inclui fundamentos", () => {
  const ag = loadAggregator();
  const profile = ag.aggregateTactical([]);
  const p = ag.derivePuzzleProgram(profile, 1500);
  // Faixa 1400-1799: capturingDefender, skewer, kingsideAttack
  const temas = p.themes.map(t => t.theme);
  assert.ok(temas.includes("capturingDefender"));
  assert.equal(p.suggested_rating, 1500);
  assert.deepEqual(p.rating_range, [1400, 1600]);
});

test("derivePuzzleProgram: detected vem antes de rating", () => {
  const ag = loadAggregator();
  const profile = ag.aggregateTactical([
    { game_index: 0, time_class: "rapid", loss_cp: 80, tactical_role: "A",
      tactical_theme: "trappedPiece", tactical_themes: [{ theme: "trappedPiece", confidence: 0.9 }] },
    { game_index: 0, time_class: "rapid", loss_cp: 80, tactical_role: "A",
      tactical_theme: "trappedPiece", tactical_themes: [{ theme: "trappedPiece", confidence: 0.9 }] },
  ]);
  const p = ag.derivePuzzleProgram(profile, 1500);
  assert.equal(p.themes[0].source, "detected");
  assert.equal(p.themes[0].theme, "trappedPiece");
});
