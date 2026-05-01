// Camada de persistência única. Centraliza acesso ao localStorage e
// expõe API observável (subscribe/publish) para reagir a mudanças de
// outras abas do mesmo app.
//
// Uso:
//   WP.Store.get(WP.Chaves.CONJUNTOS, [])
//   WP.Store.set(WP.Chaves.CONJUNTOS, novaLista)
//   WP.Store.remove(WP.Chaves.SESSAO)
//   const off = WP.Store.watch(WP.Chaves.CONJUNTOS, (novo) => ...)
//
// Migrations: chamar WP.Store.migrar() uma vez no boot. O Store traz
// um número de schema atual (SCHEMA_ATUAL) e aplica migrations
// idempotentes definidas no objeto MIGRATIONS.

(function (global) {
  "use strict";
  if (!global.WP || !global.WP.Chaves) {
    throw new Error("[Store] WP.Chaves precisa carregar antes de WP.Store");
  }

  const Chaves = global.WP.Chaves;
  const SCHEMA_ATUAL = 1;
  const watchers = new Map();   // chave → Set<fn>

  function _ler(chave) {
    try {
      const raw = localStorage.getItem(chave);
      if (raw == null) return undefined;
      return JSON.parse(raw);
    } catch (_) { return undefined; }
  }

  function _gravar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      _notificar(chave, valor);
      return true;
    } catch (e) {
      console.warn("[Store] falha ao gravar", chave, e);
      return false;
    }
  }

  function _remover(chave) {
    try {
      localStorage.removeItem(chave);
      _notificar(chave, undefined);
      return true;
    } catch (_) { return false; }
  }

  function _notificar(chave, valor) {
    const set = watchers.get(chave);
    if (!set || !set.size) return;
    for (const fn of set) {
      try { fn(valor); } catch (e) { console.warn("[Store] watcher", e); }
    }
  }

  function get(chave, fallback) {
    const v = _ler(chave);
    return v === undefined ? fallback : v;
  }

  function set(chave, valor) {
    return _gravar(chave, valor);
  }

  function remove(chave) {
    return _remover(chave);
  }

  function watch(chave, fn) {
    if (!watchers.has(chave)) watchers.set(chave, new Set());
    watchers.get(chave).add(fn);
    return function unsubscribe() {
      const set = watchers.get(chave);
      if (set) set.delete(fn);
    };
  }

  // ── Migrations ──────────────────────────────────────────────────────
  // Cada entrada migra de versão N para N+1. Idempotentes — pode rodar
  // múltiplas vezes sem efeito colateral. Entradas futuras seguem o padrão:
  //   1: function() { /* migra v1 → v2 */ },
  const MIGRATIONS = {
    // (vazio por enquanto — seed)
  };

  function migrar() {
    let v = get(Chaves.SCHEMA_VERSION, 0);
    if (v >= SCHEMA_ATUAL) return v;
    while (v < SCHEMA_ATUAL) {
      const m = MIGRATIONS[v];
      if (typeof m === "function") {
        try { m(); } catch (e) { console.warn("[Store] migration", v, e); break; }
      }
      v += 1;
      set(Chaves.SCHEMA_VERSION, v);
    }
    return v;
  }

  // Reescaneia todas as chaves wp_* que devem ser sincronizadas entre
  // abas. Útil após um import de backup em outra aba.
  function reler() {
    for (const chave of Object.values(Chaves)) {
      _notificar(chave, _ler(chave));
    }
  }

  // ── Compat: helpers usados pela UI antiga (loadLS/saveLS/clearLS) ──
  // Mantemos a API antiga apontando para o Store. Permite migrar
  // chamadas componente a componente sem big-bang.
  function loadLS(chave, fallback) { return get(chave, fallback); }
  function saveLS(chave, valor)    { return set(chave, valor); }
  function clearLS(chave)          { return remove(chave); }

  global.WP.Store = {
    SCHEMA_ATUAL: SCHEMA_ATUAL,
    get: get,
    set: set,
    remove: remove,
    watch: watch,
    migrar: migrar,
    reler: reler,
    // compat:
    loadLS: loadLS,
    saveLS: saveLS,
    clearLS: clearLS,
  };
})(typeof window !== "undefined" ? window : globalThis);
