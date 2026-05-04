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
    AUTO_BACKUP:      "wp_auto_backup",
    ANALISE_USERNAME: "wp_analise_username",
    SCHEMA_VERSION:   "wp_schema_version",
    AUDIO_ON:         "wp_audio_on",
    // Tamanho do bloco da pausa-cerimônia: 25, 50 ou 100. Default 50.
    BLOCO_TAMANHO:    "wp_bloco_tamanho",
    // Rating do usuário como entidade própria (não atributo do conjunto).
    // Definido via 2 caminhos: calibragem ou import chess.com.
    // Valores 'manual' podem aparecer em dados legados.
    RATING_USUARIO:           "wp_rating_usuario",
    RATING_FONTE:             "wp_rating_fonte",      // 'calibragem' | 'chesscom' (legado: 'manual')
    RATING_DATA:              "wp_rating_data",        // timestamp do último update
    RATING_CHESSCOM_USERNAME: "wp_rating_chesscom_username",
  };
})(typeof window !== "undefined" ? window : globalThis);
