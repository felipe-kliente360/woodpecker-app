// Áudio gerado via Web Audio API. Sem download de arquivo — sintetiza
// tons no browser. Opt-in via Chaves.AUDIO_ON. Seguro: try/catch em
// tudo, no-op se navegador sem suporte.
(function (global) {
  "use strict";

  let _ctx = null;
  function ctx() {
    if (_ctx) return _ctx;
    try {
      const Ctor = global.AudioContext || global.webkitAudioContext;
      if (!Ctor) return null;
      _ctx = new Ctor();
    } catch (_) { _ctx = null; }
    return _ctx;
  }

  // Tom único — useful para construir sons compostos.
  function tom(freq, durMs, opts) {
    opts = opts || {};
    const c = ctx();
    if (!c) return;
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.frequency.value = freq;
      osc.type = opts.type || "sine";
      const v = opts.vol != null ? opts.vol : 0.08;
      // envelope rápido pra evitar click
      const t0 = c.currentTime + (opts.delay || 0);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(v, t0 + 0.005);
      gain.gain.linearRampToValueAtTime(0, t0 + durMs / 1000);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + durMs / 1000 + 0.05);
    } catch (_) { /* silencioso */ }
  }

  // Acerto: tríade ascendente curta (C-E-G).
  function acerto() {
    tom(523, 90, { vol: 0.07 });
    tom(659, 90, { vol: 0.07, delay: 0.07 });
    tom(784, 180, { vol: 0.08, delay: 0.14 });
  }

  // Erro: tom grave curto, levemente sujo.
  function erro() {
    tom(180, 220, { type: "sawtooth", vol: 0.10 });
  }

  // Tick de relógio — beep agudo bem curto. Não usado por padrão, fica
  // disponível pra futuras extensões (modo speedrun / pace coach).
  function tick() {
    tom(900, 25, { vol: 0.04 });
  }

  global.WP = global.WP || {};
  global.WP.Audio = {
    acerto: acerto,
    erro: erro,
    tick: tick,
    tom: tom,
  };
})(typeof window !== "undefined" ? window : globalThis);
