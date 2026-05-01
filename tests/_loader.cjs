// Carregador comum dos módulos do Woodpecker para testes node:test.
// Lê os arquivos de src/ + lib/ via fs e executa em sandbox window-like,
// expondo o namespace global.WP que os módulos populam.
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

function loadInto(win, relPath) {
  const src = fs.readFileSync(path.join(ROOT, relPath), "utf8");
  // IIFE espera (window) ou (window, ...). Os arquivos são tolerantes.
  new Function("window", "console", src)(win, console);
}

function makeSandbox(opts) {
  opts = opts || {};
  // localStorage in-memory
  const store = {};
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  };
  const win = {
    localStorage: localStorage,
    indexedDB: null,
    fetch: null,
    document: { documentElement: { setAttribute: () => {} } },
  };
  // Chess.js (carregado de lib/chess.js como UMD)
  if (!opts.semChess) {
    const chessSrc = fs.readFileSync(path.join(ROOT, "lib/chess.js"), "utf8");
    const mod = { exports: {} };
    new Function("module", "exports", chessSrc)(mod, mod.exports);
    win.Chess = mod.exports.Chess || mod.exports;
  }
  return win;
}

function loadAllDomain(win) {
  loadInto(win, "lib/wp-helpers.js");
  loadInto(win, "src/data/chaves.js");
  loadInto(win, "src/data/store.js");
  loadInto(win, "src/domain/puzzle.js");
  loadInto(win, "src/domain/ciclo.js");
  loadInto(win, "src/domain/rating.js");
  loadInto(win, "src/domain/srs.js");
}

module.exports = { makeSandbox: makeSandbox, loadInto: loadInto, loadAllDomain: loadAllDomain };
