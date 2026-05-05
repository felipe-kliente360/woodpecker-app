/* Telemetria de beta — Woodpecker.
   Envia eventos para Supabase (anon key + RLS INSERT-only).
   Identificação: chess.com username se disponível, senão wp_beta_id
   gerado localmente. Fire-and-forget; nunca bloqueia a UI. */
(function (global) {
  'use strict';

  const ENDPOINT = 'https://rziwpiaxybuvgrabtwir.supabase.co/rest/v1/eventos';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6aXdwaWF4eWJ1dmdyYWJ0d2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzMzNTUsImV4cCI6MjA5MzU0OTM1NX0.OGPKtoJrLmYIw71JE3dQ4tEex-AQSO2iuwmIhNHIXbg';

  global.WP = global.WP || {};

  let _betaId = null;
  let _queue  = [];
  let _timer  = null;

  function _betaIdGet() {
    if (_betaId) return _betaId;
    var Store  = global.WP.Store;
    var Chaves = global.WP.Chaves;
    if (!Store || !Chaves) return 'anon';
    var id = Store.get(Chaves.BETA_ID, null);
    if (!id) {
      id = Math.random().toString(36).slice(2, 8) +
           Math.random().toString(36).slice(2, 8);
      Store.set(Chaves.BETA_ID, id);
    }
    _betaId = id;
    return id;
  }

  function _userId() {
    var Store  = global.WP.Store;
    var Chaves = global.WP.Chaves;
    if (!Store || !Chaves) return { user_id: 'anon', identified: false };
    var chess = Store.get(Chaves.RATING_CHESSCOM_USERNAME, null);
    if (chess) return { user_id: chess, identified: true };
    return { user_id: _betaIdGet(), identified: false };
  }

  function _flush() {
    _timer = null;
    if (_queue.length === 0) return Promise.resolve();
    var batch = _queue.splice(0);
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'apikey':        ANON_KEY,
        'Authorization': 'Bearer ' + ANON_KEY,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify(batch),
      keepalive: true,
    }).catch(function () { /* silently drop */ });
  }

  function registrar(evento, dados) {
    var u = _userId();
    _queue.push({
      evento:     evento,
      user_id:    u.user_id,
      identified: u.identified,
      dados:      dados || null,
    });
    if (!_timer) _timer = setTimeout(_flush, 3000);
  }

  // Identifica o usuário: re-atribui eventos históricos do beta_id para a
  // chess.com username. Idempotente — roda apenas 1× por beta_id.
  // Chamado quando o usuário configura chess.com pela primeira vez.
  function identificar(chessUsername) {
    if (!chessUsername) return;
    var Store  = global.WP.Store;
    var Chaves = global.WP.Chaves;
    if (!Store || !Chaves) return;

    var betaId = Store.get(Chaves.BETA_ID, null);
    if (!betaId) return;
    if (betaId === chessUsername) return;

    // Reescreve eventos pendentes desta sessão pro novo user_id —
    // sem isso eles iriam pra DB com beta_id e dependeriam do UPDATE
    // do servidor pra unificar (sujeito a race com o INSERT).
    for (var i = 0; i < _queue.length; i++) {
      if (_queue[i].user_id === betaId) {
        _queue[i].user_id    = chessUsername;
        _queue[i].identified = true;
      }
    }

    if (Store.get(Chaves.BETA_ID_MIGRADO, false)) return;

    // Migração de eventos persistidos em sessões anteriores. Espera o
    // flush completar antes do UPDATE — senão o UPDATE pode rodar antes
    // do INSERT chegar no Postgres e zerar a migração.
    _flush().then(function () {
      return fetch('https://rziwpiaxybuvgrabtwir.supabase.co/rest/v1/rpc/migrar_user_id', {
        method: 'POST',
        headers: {
          'apikey':        ANON_KEY,
          'Authorization': 'Bearer ' + ANON_KEY,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ old_id: betaId, new_id: chessUsername }),
      });
    }).then(function (res) {
      if (res && res.ok) Store.set(Chaves.BETA_ID_MIGRADO, true);
    }).catch(function () { /* silent */ });
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') _flush();
    });
  }

  global.WP.Telemetria = { registrar: registrar, flush: _flush, identificar: identificar };
})(typeof window !== 'undefined' ? window : globalThis);
