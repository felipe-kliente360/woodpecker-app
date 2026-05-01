// Overlay de escolha de peça em promoção (TelaTreinar).
// Carregado como text/babel src — babel-standalone transpila no browser.
// Expõe via window.WP.UI.Promocao para o main inline destructurar.
(function (global) {
  "use strict";
  const React = global.React;

  function Promocao({ promoPicker, onEscolher, onCancelar }) {
    if (!promoPicker) return null;
    const branca = promoPicker.to[1] === "8";
    const pieces = [
      { ch: branca ? "♕" : "♛", code: "q", nome: "Dama" },
      { ch: branca ? "♖" : "♜", code: "r", nome: "Torre" },
      { ch: branca ? "♗" : "♝", code: "b", nome: "Bispo" },
      { ch: branca ? "♘" : "♞", code: "n", nome: "Cavalo" },
    ];
    return (
      <div className="modal-overlay" onClick={onCancelar}>
        <div className="modal-card" onClick={e => e.stopPropagation()}
          style={{ maxWidth: 320, padding: 24 }}>
          <div className="serif bold fs-15 mb-4 center">Escolha a peça de promoção</div>
          <div className="mono fs-11 txt-muted center mb-16">
            {promoPicker.from} → {promoPicker.to}
          </div>
          <div className="hstack gap-10" style={{ justifyContent: "center" }}>
            {pieces.map(p => (
              <button key={p.code}
                onClick={() => onEscolher(p.code)}
                title={p.nome}
                style={{
                  width: 56, height: 56,
                  fontSize: 36, lineHeight: 1,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: "var(--txt)",
                }}>
                {p.ch}
              </button>
            ))}
          </div>
          <div className="center mt-16">
            <button className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  global.WP = global.WP || {};
  global.WP.UI = global.WP.UI || {};
  global.WP.UI.Promocao = Promocao;
})(typeof window !== "undefined" ? window : globalThis);
