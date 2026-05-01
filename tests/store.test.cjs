const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, loadInto } = require("./_loader.cjs");

function novoStore() {
  const w = makeSandbox({ semChess: true });
  loadInto(w, "src/data/chaves.js");
  loadInto(w, "src/data/store.js");
  return w.WP;
}

test("Store.get retorna fallback quando chave ausente", () => {
  const { Store, Chaves } = novoStore();
  assert.deepEqual(Store.get(Chaves.CONJUNTOS, []), []);
  assert.equal(Store.get(Chaves.TEMA, "escuro"), "escuro");
});

test("Store.set + get round-trip JSON arbitrário", () => {
  const { Store, Chaves } = novoStore();
  const valor = [{ id: "a", nome: "X", n: 42, ativo: true }];
  Store.set(Chaves.CONJUNTOS, valor);
  assert.deepEqual(Store.get(Chaves.CONJUNTOS, []), valor);
});

test("Store.watch dispara em set, undefined em remove, e off interrompe", () => {
  const { Store, Chaves } = novoStore();
  const recebidos = [];
  const off = Store.watch(Chaves.TEMA, (v) => recebidos.push(v));
  Store.set(Chaves.TEMA, "claro");
  Store.set(Chaves.TEMA, "escuro");
  Store.remove(Chaves.TEMA);
  off();
  Store.set(Chaves.TEMA, "claro"); // não deve notificar
  assert.deepEqual(recebidos, ["claro", "escuro", undefined]);
});

test("Store.migrar é idempotente — schema v1 fica em v1", () => {
  const { Store, Chaves } = novoStore();
  Store.migrar();
  assert.equal(Store.get(Chaves.SCHEMA_VERSION, 0), 1);
  Store.migrar();
  assert.equal(Store.get(Chaves.SCHEMA_VERSION, 0), 1);
});

test("Compat: loadLS/saveLS/clearLS roteam para o Store", () => {
  const { Store, Chaves } = novoStore();
  Store.saveLS(Chaves.AUTO_BACKUP, true);
  assert.equal(Store.loadLS(Chaves.AUTO_BACKUP, false), true);
  Store.clearLS(Chaves.AUTO_BACKUP);
  assert.equal(Store.loadLS(Chaves.AUTO_BACKUP, false), false);
});

test("Chaves: nenhuma duplicata + começam com wp_", () => {
  const { Chaves } = novoStore();
  const valores = Object.values(Chaves);
  assert.equal(valores.length, new Set(valores).size, "duplicata em Chaves");
  for (const v of valores) {
    assert.match(v, /^wp_/, `chave ${v} deve começar com wp_`);
  }
});
