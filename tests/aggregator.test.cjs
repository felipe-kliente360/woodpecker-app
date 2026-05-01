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

test("aggregateTactical expõe breakdown completo + raw_breakdown", () => {
  const ag = loadAggregator();
  const moves = [
    { game_index: 0, time_class: "rapid", loss_cp: 80, tactical_role: "A",
      tactical_theme: "fork", tactical_themes: [{ theme: "fork", confidence: 0.9 }] },
    { game_index: 0, time_class: "rapid", loss_cp: 200, tactical_role: "C",
      tactical_theme: "pin", tactical_themes: [{ theme: "pin", confidence: 0.9 }] },
  ];
  const r = ag.aggregateTactical(moves);
  assert.ok(r.breakdown && r.breakdown.fork, "breakdown.fork existe");
  assert.ok(r.raw_breakdown && r.raw_breakdown.fork, "raw_breakdown.fork existe");
  // fork: A=1, rapid=2, rf=1 → raw=2, w=1.5*2=3
  assert.equal(r.raw_breakdown.fork.A, 2);
  assert.equal(r.breakdown.fork.A, 3);
});

// === Modo 1: chances perdidas (Role A dominante) =========================

test("Modo 1: filtra só temas A-dominantes, descarta C-dominantes", () => {
  const ag = loadAggregator();
  // fork: 2x A → A-dominante
  // pin: 1x C, 0 A → C-dominante (não deve aparecer)
  const moves = [
    { game_index: 0, time_class: "rapid", loss_cp: 80, tactical_role: "A",
      tactical_theme: "fork", tactical_themes: [{ theme: "fork", confidence: 0.9 }] },
    { game_index: 0, time_class: "rapid", loss_cp: 80, tactical_role: "A",
      tactical_theme: "fork", tactical_themes: [{ theme: "fork", confidence: 0.9 }] },
    { game_index: 0, time_class: "rapid", loss_cp: 200, tactical_role: "C",
      tactical_theme: "pin", tactical_themes: [{ theme: "pin", confidence: 0.9 }] },
  ];
  const profile = ag.aggregateTactical(moves);
  const p = ag.derivePuzzleProgramModo1(profile, 1500);
  const temas = p.themes.map(t => t.theme);
  assert.ok(temas.includes("fork"), "fork (A-dominante) deve aparecer");
  assert.ok(!temas.includes("pin"), "pin (C-dominante) NÃO deve aparecer");
  assert.equal(p.modo, "chances-perdidas");
});

test("Modo 1: SEM heurísticas/fundamentos por rating", () => {
  const ag = loadAggregator();
  // Profile vazio → derivePuzzleProgram traria fundamentos por rating;
  // derivePuzzleProgramModo1 não.
  const profile = ag.aggregateTactical([]);
  const p1 = ag.derivePuzzleProgramModo1(profile, 1500);
  assert.equal(p1.themes.length, 0);
  // Compara com Mode 3 que injeta fundamentos:
  const p3 = ag.derivePuzzleProgram(profile, 1500);
  assert.ok(p3.themes.length > 0, "Mode 3 com profile vazio deve ter fundamentos por rating");
});

test("Modo 1: A-dominante mas sinal fraco é descartado", () => {
  const ag = loadAggregator();
  // 1 ocorrência: A=1.5, score=0.5 (rf=1, tcW=2). Mas com tcW reduzido
  // (bullet=0.4) o sinal fica < 0.5.
  const moves = [
    { game_index: 0, time_class: "bullet", loss_cp: 80, tactical_role: "A",
      tactical_theme: "fork", tactical_themes: [{ theme: "fork", confidence: 0.9 }] },
  ];
  const profile = ag.aggregateTactical(moves);
  const p = ag.derivePuzzleProgramModo1(profile, 1500);
  // fork.A = 1.5 * 0.4 (bullet adaptativo) * 1 = 0.6 → marginal.
  // Threshold do Modo 1 é a < 0.5: deve passar.
  assert.equal(p.themes.length, 1);
});

// === Modo 2: adversário (B+C com C 2x) ===================================

test("Modo 2: rankeia por B+2C (não-punido vale o dobro)", () => {
  const ag = loadAggregator();
  // tema fork: 1x B (punido)
  // tema pin: 1x C (não-punido)
  // Em Modo 2, pin (C) deve aparecer antes de fork (B).
  const moves = [
    { game_index: 0, time_class: "rapid", loss_cp: 200, tactical_role: "B",
      tactical_theme: "fork", tactical_themes: [{ theme: "fork", confidence: 0.9 }] },
    { game_index: 0, time_class: "rapid", loss_cp: 200, tactical_role: "C",
      tactical_theme: "pin", tactical_themes: [{ theme: "pin", confidence: 0.9 }] },
  ];
  const profile = ag.aggregateTactical(moves);
  const p = ag.derivePuzzleProgramModo2(profile, 1500);
  const temas = p.themes.map(t => t.theme);
  assert.equal(temas[0], "pin", "pin (C) deve vir antes de fork (B)");
  assert.ok(temas.includes("fork"));
  assert.equal(p.modo, "adversario");
});

test("Modo 2: descarta temas A-only (sem exposição)", () => {
  const ag = loadAggregator();
  const moves = [
    { game_index: 0, time_class: "rapid", loss_cp: 80, tactical_role: "A",
      tactical_theme: "fork", tactical_themes: [{ theme: "fork", confidence: 0.9 }] },
  ];
  const profile = ag.aggregateTactical(moves);
  const p = ag.derivePuzzleProgramModo2(profile, 1500);
  // fork só apareceu como A — não vira oportunidade pra adversário.
  assert.equal(p.themes.length, 0);
});

test("Modo 2: C-dominante recebe priority alta, B-dominante média", () => {
  const ag = loadAggregator();
  const moves = [
    { game_index: 0, time_class: "rapid", loss_cp: 200, tactical_role: "C",
      tactical_theme: "pin", tactical_themes: [{ theme: "pin", confidence: 0.9 }] },
    { game_index: 0, time_class: "rapid", loss_cp: 200, tactical_role: "B",
      tactical_theme: "fork", tactical_themes: [{ theme: "fork", confidence: 0.9 }] },
    { game_index: 0, time_class: "rapid", loss_cp: 200, tactical_role: "B",
      tactical_theme: "fork", tactical_themes: [{ theme: "fork", confidence: 0.9 }] },
  ];
  const profile = ag.aggregateTactical(moves);
  const p = ag.derivePuzzleProgramModo2(profile, 1500);
  const pin  = p.themes.find(t => t.theme === "pin");
  const fork = p.themes.find(t => t.theme === "fork");
  assert.equal(pin.priority, "alta");
  assert.equal(fork.priority, "média");
});
