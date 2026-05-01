// Única fonte de verdade para chaves de persistência do Woodpecker.
// Toda referência a "wp_*" no app deve vir daqui — nunca string literal
// solta nos componentes ou domain.
(function (global) {
  "use strict";

  global.WP = global.WP || {};
  global.WP.Chaves = {
    CONJUNTOS:        "wp_conjuntos",
    CICLOS:           "wp_ciclos",
    SESSAO:           "wp_sessao",
    TEMA:             "wp_tema",
    AUTO_BACKUP:      "wp_auto_backup",
    ANALISE_USERNAME: "wp_analise_username",
    SCHEMA_VERSION:   "wp_schema_version",
  };
})(typeof window !== "undefined" ? window : globalThis);
