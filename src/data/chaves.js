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
    MODO_MONGE:       "wp_modo_monge",
    AUDIO_ON:         "wp_audio_on",
    // Rating do usuário como entidade própria (não atributo do conjunto).
    // Definido via 1 dos 3 caminhos: calibragem, import chess.com, manual.
    RATING_USUARIO:           "wp_rating_usuario",
    RATING_FONTE:             "wp_rating_fonte",      // 'calibragem' | 'chesscom' | 'manual'
    RATING_DATA:              "wp_rating_data",        // timestamp do último update
    RATING_CHESSCOM_USERNAME: "wp_rating_chesscom_username",
  };
})(typeof window !== "undefined" ? window : globalThis);
