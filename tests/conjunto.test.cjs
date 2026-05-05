const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, loadInto } = require("./_loader.cjs");

function dom() {
  const w = makeSandbox({ semChess: true });
  loadInto(w, "src/domain/conjunto.js");
  return w.WP.Conjunto;
}

test("tipoDe: fallback para 'padrao' quando ausente", () => {
  const C = dom();
  assert.equal(C.tipoDe({}), "padrao");
  assert.equal(C.tipoDe({ tipo: "pessoal" }), "pessoal");
  assert.equal(C.tipoDe(null), "padrao");
});

test("conjuntosAtivos: filtra não-concluidos", () => {
  const C = dom();
  const lista = [
    { id: "a" },
    { id: "b", concluido: false },
    { id: "c", concluido: true },
  ];
  const a = C.conjuntosAtivos(lista);
  assert.equal(a.length, 2);
  assert.deepEqual(a.map(x => x.id), ["a", "b"]);
});

test("podeCriarNovo: limite estrito de 3 ativos", () => {
  const C = dom();
  assert.equal(C.podeCriarNovo([]), true);
  assert.equal(C.podeCriarNovo([{}, {}]), true);
  assert.equal(C.podeCriarNovo([{}, {}, {}]), false);
  // concluídos não contam
  assert.equal(C.podeCriarNovo([{}, {}, { concluido: true }]), true);
});

test("contagemPorTipo: conta só ativos por tipo", () => {
  const C = dom();
  const r = C.contagemPorTipo([
    { tipo: "padrao" },
    { tipo: "pessoal" },
    { tipo: "pessoal", concluido: true },
    { tipo: "adversario" },
  ]);
  assert.deepEqual(r, { padrao: 1, pessoal: 1, adversario: 1 });
});

test("prontoPraConcluir: padrao auto-conclui ao chegar em 5 ciclos", () => {
  const C = dom();
  const conj = { id: "a", tipo: "padrao" };
  const ciclos4 = Array.from({ length: 4 }).map((_, i) => ({
    conjunto_id: "a", numero: i + 1, tempo_total_s: 1000,
  }));
  assert.equal(C.prontoPraConcluir(conj, ciclos4).pronto, false);
  const ciclos5 = ciclos4.concat([{ conjunto_id: "a", numero: 5, tempo_total_s: 1000 }]);
  const r = C.prontoPraConcluir(conj, ciclos5);
  assert.equal(r.pronto, true);
  assert.equal(r.motivo, "meta");
});

test("prontoPraConcluir: pessoal pronto após 5 ciclos (meta canônica)", () => {
  const C = dom();
  const conj = { id: "a", tipo: "pessoal" };
  const ciclos5 = Array.from({ length: 5 }).map((_, i) => ({
    conjunto_id: "a", numero: i + 1, tempo_total_s: 1000,
  }));
  const r = C.prontoPraConcluir(conj, ciclos5);
  assert.equal(r.pronto, true);
  assert.equal(r.motivo, "meta");
});

test("prontoPraConcluir: halving NÃO dispara auto-conclusão (só meta de 5 ciclos)", () => {
  const C = dom();
  const conj = { id: "a", tipo: "pessoal" };
  const ciclos = [
    { conjunto_id: "a", numero: 1, tempo_total_s: 2000 }, // baseline
    { conjunto_id: "a", numero: 2, tempo_total_s: 800 },  // razão 0.4 → halving, mas não conclui
  ];
  assert.equal(C.prontoPraConcluir(conj, ciclos).pronto, false);
});

test("prontoPraConcluir: adversario também usa meta canônica (5 ciclos)", () => {
  const C = dom();
  const conj = { id: "a", tipo: "adversario" };
  const ciclos4 = Array.from({ length: 4 }).map((_, i) => ({
    conjunto_id: "a", numero: i + 1, tempo_total_s: 1000,
  }));
  assert.equal(C.prontoPraConcluir(conj, ciclos4).pronto, false);
  const ciclos5 = ciclos4.concat([{ conjunto_id: "a", numero: 5, tempo_total_s: 1000 }]);
  assert.equal(C.prontoPraConcluir(conj, ciclos5).pronto, true);
});

test("prontoPraConcluir: já concluido retorna false", () => {
  const C = dom();
  const conj = { id: "a", tipo: "pessoal", concluido: true };
  const ciclos5 = Array.from({ length: 5 }).map((_, i) => ({
    conjunto_id: "a", numero: i + 1, tempo_total_s: 1000,
  }));
  assert.equal(C.prontoPraConcluir(conj, ciclos5).pronto, false);
});

test("concluir: imutável, retorna novo objeto com flags", () => {
  const C = dom();
  const orig = { id: "a", tipo: "pessoal", nome: "X" };
  const res = C.concluir(orig, 1234567890);
  assert.equal(orig.concluido, undefined, "original não muta");
  assert.equal(res.concluido, true);
  assert.equal(res.data_concluido, 1234567890);
  assert.equal(res.id, "a");
});
