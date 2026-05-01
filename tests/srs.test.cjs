const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, loadAllDomain } = require("./_loader.cjs");

function dom() {
  const w = makeSandbox({ semChess: true });
  loadAllDomain(w);
  return w.WP;
}

const DIA = 86400000;

test("puzzlesDevidoRevisao — sem ciclos retorna vazio", () => {
  const { SRS } = dom();
  assert.deepEqual(SRS.puzzlesDevidoRevisao([], []), {});
  assert.deepEqual(SRS.puzzlesDevidoRevisao(null, null), {});
});

test("puzzlesDevidoRevisao — um único ciclo nunca produz teimoso", () => {
  const { SRS } = dom();
  const ag = Date.now();
  const r = SRS.puzzlesDevidoRevisao(
    [{ conjunto_id: "c1", numero: 1, data_fim: ag - 10 * DIA, resultados: [
      { puzzle_id: "p1", correto: false },
    ] }],
    [{ id: "c1" }],
    { agora: ag }
  );
  assert.deepEqual(r, {});
});

test("puzzlesDevidoRevisao — 2 erros em 2 ciclos com >3 dias = devido", () => {
  const { SRS } = dom();
  const ag = Date.now();
  const r = SRS.puzzlesDevidoRevisao(
    [
      { conjunto_id: "c1", numero: 1, data_fim: ag - 10 * DIA, resultados: [
        { puzzle_id: "p1", correto: false },
        { puzzle_id: "p2", correto: true },
      ] },
      { conjunto_id: "c1", numero: 2, data_fim: ag - 5 * DIA, resultados: [
        { puzzle_id: "p1", correto: false },
        { puzzle_id: "p2", correto: true },
      ] },
    ],
    [{ id: "c1", nome: "X" }],
    { agora: ag }
  );
  assert.equal(r.c1.devidos, 1);
});

test("puzzlesDevidoRevisao — só 1 erro NÃO produz teimoso", () => {
  const { SRS } = dom();
  const ag = Date.now();
  const r = SRS.puzzlesDevidoRevisao(
    [
      { conjunto_id: "c1", numero: 1, data_fim: ag - 10 * DIA, resultados: [
        { puzzle_id: "p1", correto: false }, { puzzle_id: "p2", correto: true },
      ] },
      { conjunto_id: "c1", numero: 2, data_fim: ag - 5 * DIA, resultados: [
        { puzzle_id: "p1", correto: true }, { puzzle_id: "p2", correto: true },
      ] },
    ],
    [{ id: "c1" }],
    { agora: ag }
  );
  assert.deepEqual(r, {});
});

test("puzzlesDevidoRevisao — teimoso encontrado HOJE não é devido (< 3 dias)", () => {
  const { SRS } = dom();
  const ag = Date.now();
  const r = SRS.puzzlesDevidoRevisao(
    [
      { conjunto_id: "c1", numero: 1, data_fim: ag - 10 * DIA, resultados: [
        { puzzle_id: "p1", correto: false },
      ] },
      { conjunto_id: "c1", numero: 2, data_fim: ag - 1 * 3600 * 1000, resultados: [
        { puzzle_id: "p1", correto: false },
      ] },
    ],
    [{ id: "c1" }],
    { agora: ag }
  );
  assert.deepEqual(r, {});
});

test("puzzlesDevidoRevisao — opts.minErros=1 e opts.diasReview=0 captura tudo", () => {
  const { SRS } = dom();
  const ag = Date.now();
  const r = SRS.puzzlesDevidoRevisao(
    [
      { conjunto_id: "c1", numero: 1, data_fim: ag - 10 * DIA, resultados: [
        { puzzle_id: "p1", correto: false },
      ] },
      { conjunto_id: "c1", numero: 2, data_fim: ag - 1 * DIA, resultados: [
        { puzzle_id: "p2", correto: false },
      ] },
    ],
    [{ id: "c1" }],
    { agora: ag, minErros: 1, diasReview: 0 }
  );
  assert.equal(r.c1.devidos, 2);
});

test("puzzlesDevidoRevisao — múltiplos conjuntos agrupados separadamente", () => {
  const { SRS } = dom();
  const ag = Date.now();
  const ciclos = [
    { conjunto_id: "c1", numero: 1, data_fim: ag - 10 * DIA, resultados: [{ puzzle_id: "p1", correto: false }] },
    { conjunto_id: "c1", numero: 2, data_fim: ag - 5 * DIA, resultados: [{ puzzle_id: "p1", correto: false }] },
    { conjunto_id: "c2", numero: 1, data_fim: ag - 10 * DIA, resultados: [{ puzzle_id: "p9", correto: false }] },
    { conjunto_id: "c2", numero: 2, data_fim: ag - 5 * DIA, resultados: [{ puzzle_id: "p9", correto: false }] },
  ];
  const r = SRS.puzzlesDevidoRevisao(ciclos, [{ id: "c1" }, { id: "c2" }], { agora: ag });
  assert.equal(Object.keys(r).length, 2);
  assert.equal(r.c1.devidos, 1);
  assert.equal(r.c2.devidos, 1);
});
