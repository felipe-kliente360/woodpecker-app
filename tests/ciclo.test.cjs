const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, loadAllDomain } = require("./_loader.cjs");

function dom() {
  const w = makeSandbox({ semChess: true });
  loadAllDomain(w);
  return w.WP;
}

const DIA = 86400000;

test("metricasAtividade — vazio", () => {
  const { Ciclo } = dom();
  assert.deepEqual(Ciclo.metricasAtividade([]), {
    total: 0, diasAtivos: 0, ultimaMs: 0, diasDesde: null,
  });
  assert.deepEqual(Ciclo.metricasAtividade(null), {
    total: 0, diasAtivos: 0, ultimaMs: 0, diasDesde: null,
  });
});

test("metricasAtividade — soma total e dias únicos", () => {
  const { Ciclo } = dom();
  const ag = Date.now();
  const m = Ciclo.metricasAtividade([
    { data_fim: ag - 5 * DIA, numero: 1 },
    { data_fim: ag - 2 * DIA, numero: 2 },
    { data_fim: ag - 2 * DIA - 3600000, numero: 3 }, // mesmo dia que numero 2
    { data_fim: ag, numero: 4 },
  ]);
  assert.equal(m.total, 4);
  assert.ok(m.diasAtivos >= 2 && m.diasAtivos <= 3, "dias únicos pode ser 2 ou 3 dependendo de UTC");
  assert.ok(m.diasDesde >= 0 && m.diasDesde < 1);
});

test("nivelDoRating — faixas em pt-BR", () => {
  const { Ciclo } = dom();
  assert.equal(Ciclo.nivelDoRating(900), "Iniciante");
  assert.equal(Ciclo.nivelDoRating(1100), "Básico");
  assert.equal(Ciclo.nivelDoRating(1300), "Intermediário");
  assert.equal(Ciclo.nivelDoRating(1500), "Avançado");
  assert.equal(Ciclo.nivelDoRating(1700), "Expert");
  assert.equal(Ciclo.nivelDoRating(2200), "Mestre");
});
