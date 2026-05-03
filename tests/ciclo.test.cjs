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

test("streakPorDia — array com tamanho dias, ordenado mais antigo → hoje", () => {
  const { Ciclo } = dom();
  const hoje = new Date('2026-05-15T12:00:00Z');
  const r = Ciclo.streakPorDia([], 7, hoje);
  assert.equal(r.length, 7);
  assert.equal(r[6].data, '2026-05-15');
  assert.equal(r[0].data, '2026-05-09');
  assert.equal(r[6].count, 0);
});

test("streakPorDia — conta ciclos por dia corretamente", () => {
  const { Ciclo } = dom();
  const hoje = new Date('2026-05-15T12:00:00Z');
  const ciclos = [
    { data_fim: new Date('2026-05-15T08:00:00Z').getTime() },
    { data_fim: new Date('2026-05-15T20:00:00Z').getTime() },
    { data_fim: new Date('2026-05-13T12:00:00Z').getTime() },
  ];
  const r = Ciclo.streakPorDia(ciclos, 7, hoje);
  const hojeEntry = r.find(e => e.data === '2026-05-15');
  const ontem = r.find(e => e.data === '2026-05-14');
  const antes = r.find(e => e.data === '2026-05-13');
  assert.equal(hojeEntry.count, 2);
  assert.equal(ontem.count, 0);
  assert.equal(antes.count, 1);
});

test("streakAtual — conta dias consecutivos a partir de hoje", () => {
  const { Ciclo } = dom();
  const hoje = new Date('2026-05-15T12:00:00Z');
  const dia = (d) => new Date('2026-05-' + String(d).padStart(2, '0') + 'T12:00:00Z').getTime();
  // Hoje, ontem e anteontem com ciclo; antes não → streak 3
  const ciclos = [
    { data_fim: dia(15) }, { data_fim: dia(14) }, { data_fim: dia(13) },
    { data_fim: dia(11) }, // gap em 12 → não conta antes
  ];
  assert.equal(Ciclo.streakAtual(ciclos, hoje), 3);
});

test("streakAtual — sem ciclo hoje retorna 0", () => {
  const { Ciclo } = dom();
  const hoje = new Date('2026-05-15T12:00:00Z');
  const ciclos = [
    { data_fim: new Date('2026-05-14T12:00:00Z').getTime() },
  ];
  assert.equal(Ciclo.streakAtual(ciclos, hoje), 0);
});
