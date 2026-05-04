// Áudio gerado via Web Audio API. Sem download de arquivo — sintetiza
// no browser. Opt-in via Chaves.AUDIO_ON. Seguro: try/catch em tudo,
// no-op se navegador sem suporte.
//
// Sons percussivos (mover/capturar) são feitos com ruído branco curto
// passado por bandpass — toque físico tem conteúdo de banda larga, não
// tom puro. Tons puros (acerto/erro) ficam pra feedback abstrato.
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

  let _ruido = null;
  function ruidoBuffer(c) {
    if (_ruido && _ruido.sampleRate === c.sampleRate) return _ruido;
    const dur = 0.4;
    const samples = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, samples, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < samples; i++) d[i] = Math.random() * 2 - 1;
    _ruido = buf;
    return buf;
  }

  // Tom único (oscilador) — pra feedback abstrato.
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
    } catch (_) {}
  }

  // Burst percussivo: ruído branco → bandpass → envelope exponencial.
  // freq = ressonância do "material" (alto = madeira fina, baixo = denso),
  // q = seletividade do filtro, dur em ms, vol pico.
  function clic(freq, q, durMs, vol, delay) {
    const c = ctx();
    if (!c) return;
    try {
      const t0 = c.currentTime + (delay || 0);
      const src = c.createBufferSource();
      src.buffer = ruidoBuffer(c);
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = freq;
      bp.Q.value = q;
      const lp = c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = Math.min(freq * 4, 8000);
      const gain = c.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);
      src.connect(bp);
      bp.connect(lp);
      lp.connect(gain);
      gain.connect(c.destination);
      src.start(t0);
      src.stop(t0 + durMs / 1000 + 0.02);
    } catch (_) {}
  }

  // Peça em madeira — duas ressonâncias curtas (transiente alto + corpo médio).
  function mover() {
    if (!estaLigado()) return;
    clic(2400, 6, 28, 0.35, 0);
    clic(900,  4, 55, 0.30, 0.002);
  }

  // Captura — impacto mais grave e levemente mais longo.
  function capturar() {
    if (!estaLigado()) return;
    clic(1800, 5, 30, 0.32, 0);
    clic(450,  3, 100, 0.45, 0.004);
    clic(180,  2, 130, 0.25, 0.008);
  }

  // Tabuleiro pronto — toque agudo bem leve ao iniciar puzzle.
  function pronto() {
    if (!estaLigado()) return;
    clic(3200, 8, 35, 0.18, 0);
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
    clic: clic,
  };
})(typeof window !== "undefined" ? window : globalThis);
