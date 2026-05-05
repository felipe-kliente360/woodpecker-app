const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, loadAllDomain } = require("./_loader.cjs");

function dom() {
  const w = makeSandbox({ semChess: true });
  loadAllDomain(w);
  return w.WP;
}

const DIA = 86400000;

// Helpers — usam fuso local pra casar com a chave da função.
function msLocal(y, m, d, h) {
  return new Date(y, m - 1, d, h || 12, 0, 0, 0).getTime();
}
function dataLocal(y, m, d, h) {
  return new Date(y, m - 1, d, h || 12, 0, 0, 0);
}

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
  // 4 ciclos espalhados em até 4 dias distintos (3 ou 4 dependendo
  // de onde "agora" cai no dia local).
  assert.ok(m.diasAtivos >= 2 && m.diasAtivos <= 4);
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

test("chaveLocal — YYYY-MM-DD no fuso local", () => {
  const { Ciclo } = dom();
  // 22h local → mesmo dia (ao contrário de UTC, que joga pra dia seguinte
  // em fusos negativos).
  assert.equal(Ciclo.chaveLocal(dataLocal(2026, 5, 15, 22)), "2026-05-15");
  assert.equal(Ciclo.chaveLocal(msLocal(2026, 1, 9, 3)), "2026-01-09");
});

test("streakPorDia — array tamanho dias, ordenado mais antigo → hoje", () => {
  const { Ciclo } = dom();
  const hoje = dataLocal(2026, 5, 15, 12);
  const r = Ciclo.streakPorDia([], 7, { hoje });
  assert.equal(r.length, 7);
  assert.equal(r[6].data, "2026-05-15");
  assert.equal(r[0].data, "2026-05-09");
  assert.equal(r[6].count, 0);
});

test("streakPorDia — conta puzzles por dia (resultados.finalizado_em)", () => {
  const { Ciclo } = dom();
  const hoje = dataLocal(2026, 5, 15, 12);
  const ciclos = [
    {
      data_fim: msLocal(2026, 5, 15, 18),
      resultados: [
        { tempo_s: 30, finalizado_em: msLocal(2026, 5, 15, 8) },
        { tempo_s: 45, finalizado_em: msLocal(2026, 5, 15, 20) },
        { tempo_s: 60, finalizado_em: msLocal(2026, 5, 13, 12) },
      ],
    },
  ];
  const r = Ciclo.streakPorDia(ciclos, 7, { hoje });
  assert.equal(r.find(e => e.data === "2026-05-15").count, 2);
  assert.equal(r.find(e => e.data === "2026-05-14").count, 0);
  assert.equal(r.find(e => e.data === "2026-05-13").count, 1);
});

test("streakPorDia — fallback pra data_fim quando puzzle não tem finalizado_em (legado)", () => {
  const { Ciclo } = dom();
  const hoje = dataLocal(2026, 5, 15, 12);
  const ciclos = [
    {
      data_fim: msLocal(2026, 5, 14, 18),
      tempo_total_s: 100,
      resultados: [{ tempo_s: 50 }, { tempo_s: 50 }], // sem finalizado_em
    },
  ];
  const r = Ciclo.streakPorDia(ciclos, 7, { hoje });
  // 2 puzzles agrupados no dia do data_fim
  assert.equal(r.find(e => e.data === "2026-05-14").count, 2);
});

test("streakPorDia — inclui sessão em andamento (resultados_parciais)", () => {
  const { Ciclo } = dom();
  const hoje = dataLocal(2026, 5, 15, 12);
  const sessao = {
    resultados_parciais: [
      { tempo_s: 20, finalizado_em: msLocal(2026, 5, 15, 11) },
      { tempo_s: 25, correto: false, finalizado_em: msLocal(2026, 5, 15, 11) },
    ],
  };
  const r = Ciclo.streakPorDia([], 7, { hoje, sessao });
  assert.equal(r.find(e => e.data === "2026-05-15").count, 2);
});

test("streakAtual — soma dia atual com 1 puzzle parcial (sem ciclo concluído)", () => {
  const { Ciclo } = dom();
  const hoje = dataLocal(2026, 5, 15, 12);
  const sessao = {
    resultados_parciais: [
      { tempo_s: 12, finalizado_em: msLocal(2026, 5, 15, 11) },
    ],
  };
  // Sem ciclos concluídos — só a sessão. Streak hoje = 1.
  assert.equal(Ciclo.streakAtual([], { hoje, sessao }), 1);
});

test("streakAtual — dias consecutivos misturando ciclos + sessão", () => {
  const { Ciclo } = dom();
  const hoje = dataLocal(2026, 5, 15, 12);
  const ciclos = [
    {
      data_fim: msLocal(2026, 5, 14, 18),
      resultados: [{ tempo_s: 30, finalizado_em: msLocal(2026, 5, 14, 18) }],
    },
    {
      data_fim: msLocal(2026, 5, 13, 18),
      resultados: [{ tempo_s: 30, finalizado_em: msLocal(2026, 5, 13, 18) }],
    },
  ];
  const sessao = {
    resultados_parciais: [{ tempo_s: 20, finalizado_em: msLocal(2026, 5, 15, 10) }],
  };
  assert.equal(Ciclo.streakAtual(ciclos, { hoje, sessao }), 3);
});

test("streakAtual — sem atividade hoje retorna 0", () => {
  const { Ciclo } = dom();
  const hoje = dataLocal(2026, 5, 15, 12);
  const ciclos = [{
    data_fim: msLocal(2026, 5, 14, 18),
    resultados: [{ tempo_s: 30, finalizado_em: msLocal(2026, 5, 14, 18) }],
  }];
  assert.equal(Ciclo.streakAtual(ciclos, { hoje }), 0);
});

test("tempoNoDia — soma puzzles do dia, ciclo + sessão", () => {
  const { Ciclo } = dom();
  const hoje = dataLocal(2026, 5, 15, 12);
  const ciclos = [
    {
      data_fim: msLocal(2026, 5, 15, 18),
      resultados: [
        { tempo_s: 30, finalizado_em: msLocal(2026, 5, 15, 8) },
        { tempo_s: 45, finalizado_em: msLocal(2026, 5, 14, 20) }, // ontem, não conta
      ],
    },
  ];
  const sessao = {
    resultados_parciais: [
      { tempo_s: 60, finalizado_em: msLocal(2026, 5, 15, 11) },
    ],
  };
  // 30 (ciclo, hoje) + 60 (sessão, hoje) = 90
  assert.equal(Ciclo.tempoNoDia(ciclos, sessao, hoje), 90);
});

test("tempoNoDia — fallback legado usa tempo_total_s do ciclo no data_fim", () => {
  const { Ciclo } = dom();
  const hoje = dataLocal(2026, 5, 15, 12);
  const ciclos = [{
    data_fim: msLocal(2026, 5, 15, 18),
    tempo_total_s: 200,
    resultados: [{ tempo_s: 100 }, { tempo_s: 100 }], // sem finalizado_em
  }];
  assert.equal(Ciclo.tempoNoDia(ciclos, null, hoje), 200);
});
