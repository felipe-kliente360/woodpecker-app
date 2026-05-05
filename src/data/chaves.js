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
    // Marca que o usuário viu (e talvez pulou) o onboarding inicial.
    // Sem isso, modal reabriria toda vez que ele entra sem rating.
    ONBOARDING_VISTO: "wp_onboarding_visto",
    // Rating do usuário como entidade própria (não atributo do conjunto).
    // Definido via 2 caminhos: calibragem ou import chess.com.
    // Valores 'manual' podem aparecer em dados legados.
    RATING_USUARIO:           "wp_rating_usuario",
    RATING_FONTE:             "wp_rating_fonte",      // 'calibragem' | 'chesscom' (legado: 'manual')
    RATING_DATA:              "wp_rating_data",        // timestamp do último update
    RATING_CHESSCOM_USERNAME: "wp_rating_chesscom_username",
    // Beta: identificador anônimo local (fallback quando sem chess.com)
    BETA_ID:            "wp_beta_id",
    // Beta: usuário viu o disclosure de coleta de dados
    BETA_DISCLOSURE_OK: "wp_beta_disclosure_ok",
    // Beta: já migramos eventos antigos do beta_id pra chess username
    // (idempotente — roda apenas uma vez por beta_id)
    BETA_ID_MIGRADO:    "wp_beta_id_migrado",
  };
})(typeof window !== "undefined" ? window : globalThis);
