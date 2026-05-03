// Geração de PNG do resumo de um ciclo via Canvas API. Pure-ish:
// recebe um canvas (DOM) + dados, renderiza e devolve. Usa cores
// das CSS variables se rodando em browser, fallback para hex fixos.
(function (global) {
  "use strict";

  function getCssVar(name, fallback) {
    if (typeof getComputedStyle === "undefined") return fallback;
    try {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim();
      return v || fallback;
    } catch (_) { return fallback; }
  }

  function fmtTempo(s) {
    s = Math.max(0, Math.floor(s));
    if (s < 60) return s + "s";
    const m = Math.floor(s / 60);
    if (m < 60) return m + "min " + (s % 60) + "s";
    return Math.floor(m / 60) + "h " + (m % 60) + "min";
  }

  // Renderiza no canvas. Retorna data URL PNG.
  function renderResumo(canvas, dados) {
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext("2d");
    const cor = {
      bg:    getCssVar("--header-bg", "#0d1520"),
      card:  getCssVar("--card", "#1f2d3f"),
      txt:   getCssVar("--txt", "#e6eef7"),
      mid:   getCssVar("--txt-mid", "#a3b9cc"),
      muted: getCssVar("--txt-muted", "#7c95ac"),
      gold:  getCssVar("--gold", "#d8b04a"),
      green: getCssVar("--green", "#52b878"),
      red:   getCssVar("--red", "#ea6868"),
    };

    // Fundo
    ctx.fillStyle = cor.bg;
    ctx.fillRect(0, 0, W, H);

    // Marca
    ctx.fillStyle = cor.gold;
    ctx.font = "bold 64px Georgia, serif";
    ctx.textBaseline = "top";
    ctx.fillText("♞", 50, 50);
    ctx.fillStyle = cor.red;
    ctx.beginPath();
    ctx.arc(120, 65, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = cor.txt;
    ctx.font = "bold 18px Courier, monospace";
    ctx.fillText("WOODPECKER", 150, 60);
    ctx.fillStyle = cor.muted;
    ctx.font = "11px Courier, monospace";
    ctx.fillText("MÉTODO TÁTICO", 150, 88);

    // Conjunto
    ctx.fillStyle = cor.muted;
    ctx.font = "11px Courier, monospace";
    ctx.fillText("CONJUNTO", 50, 170);
    ctx.fillStyle = cor.txt;
    ctx.font = "bold 24px Georgia, serif";
    ctx.fillText(dados.conjuntoNome || "—", 50, 190);

    // Ciclo número
    ctx.fillStyle = cor.muted;
    ctx.font = "11px Courier, monospace";
    ctx.fillText("CICLO " + (dados.numero || "?"), 50, 240);

    // Métricas grandes
    ctx.fillStyle = cor.muted;
    ctx.font = "11px Courier, monospace";
    ctx.fillText("TEMPO TOTAL", 50, 300);
    ctx.fillStyle = cor.txt;
    ctx.font = "bold 56px Courier, monospace";
    ctx.fillText(fmtTempo(dados.tempoTotal || 0), 50, 320);

    ctx.fillStyle = cor.muted;
    ctx.font = "11px Courier, monospace";
    ctx.fillText("ACERTOS", 50, 410);
    ctx.fillStyle = cor.green;
    ctx.font = "bold 36px Courier, monospace";
    ctx.fillText(dados.acertos + "/" + dados.total, 50, 430);

    // Razão vs baseline (se houver)
    if (dados.razaoBaseline != null) {
      ctx.fillStyle = cor.muted;
      ctx.font = "11px Courier, monospace";
      ctx.fillText("VS CICLO 1", W / 2, 410);
      const pct = Math.round(dados.razaoBaseline * 100);
      ctx.fillStyle = pct <= 50 ? cor.gold : (pct <= 85 ? cor.green : cor.mid);
      ctx.font = "bold 36px Courier, monospace";
      ctx.fillText(pct + "%", W / 2, 430);
      if (pct <= 50) {
        ctx.fillStyle = cor.gold;
        ctx.font = "12px Courier, monospace";
        ctx.fillText("HALVING", W / 2, 478);
      }
    }

    // Footer
    const data = dados.data || new Date().toLocaleDateString("pt-BR");
    ctx.fillStyle = cor.muted;
    ctx.font = "11px Courier, monospace";
    ctx.fillText(data, 50, H - 50);

    return canvas.toDataURL("image/png");
  }

  function baixarResumo(dados, filename) {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 600;
    const url = renderResumo(canvas, dados);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || ("woodpecker-ciclo-" + Date.now() + ".png");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return url;
  }

  global.WP = global.WP || {};
  global.WP.ResumoImagem = {
    renderResumo: renderResumo,
    baixarResumo: baixarResumo,
  };
})(typeof window !== "undefined" ? window : globalThis);
