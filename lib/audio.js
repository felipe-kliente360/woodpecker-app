// Áudio gerado via Web Audio API. Sem download de arquivo — sintetiza
// tons no browser. Opt-in via Chaves.AUDIO_ON. Seguro: try/catch em
// tudo, no-op se navegador sem suporte.
(function (global) {
  "use strict";

  const CHAVE_AUDIO = "wp_audio_on";

  function estaLigado() {
    try { return JSON.parse(global.localStorage.getItem(CHAVE_AUDIO)) === true; }
    catch (_) { return false; }
  }

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

  // Tom único — base para todos os sons compostos.
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

  // Peça movida — clique seco curto.
  function mover() {
    if (!estaLigado()) return;
    tom(320, 45, { type: "triangle", vol: 0.13 });
  }

  // Captura — impacto um pouco mais grave e longo.
  function capturar() {
    if (!estaLigado()) return;
    tom(200, 65, { type: "triangle", vol: 0.15 });
    tom(130, 80, { type: "triangle", vol: 0.08, delay: 0.025 });
  }

  // Tabuleiro pronto — ding discreto ao iniciar cada puzzle.
  function pronto() {
    if (!estaLigado()) return;
    tom(880, 70, { type: "sine", vol: 0.04 });
  }

  // Acerto: tríade ascendente curta (C-E-G).
  function acerto() {
    if (!estaLigado()) return;
    tom(523, 90, { vol: 0.07 });
    tom(659, 90, { vol: 0.07, delay: 0.07 });
    tom(784, 180, { vol: 0.08, delay: 0.14 });
  }

  // Erro: tom grave curto, levemente sujo.
  function erro() {
    if (!estaLigado()) return;
    tom(180, 220, { type: "sawtooth", vol: 0.10 });
  }

  // Tick de relógio — disponível pra extensões futuras.
  function tick() {
    if (!estaLigado()) return;
    tom(900, 25, { vol: 0.04 });
  }

  global.WP = global.WP || {};
  global.WP.Audio = {
    mover: mover,
    capturar: capturar,
    pronto: pronto,
    acerto: acerto,
    erro: erro,
    tick: tick,
    tom: tom,
  };
})(typeof window !== "undefined" ? window : globalThis);
