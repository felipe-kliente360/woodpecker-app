// Timeline colapsável de análises anteriores do mesmo username.
// Lê via WP.ChessAnalysis.listHistory; mostra delta de rating vs entrada
// anterior. Recebe formatarData como prop (helper local de TelaAnalisar).
(function (global) {
  "use strict";
  const React = global.React;
  const { useState, useEffect } = React;

  function HistoricoAnalises({ username, currentAnalyzedAt, formatarData }) {
    const TEMAS = (global.WP_HELPERS && global.WP_HELPERS.TEMAS) || {};
    const [historico, setHistorico] = useState([]);
    const [aberto, setAberto] = useState(false);

    useEffect(() => {
      if (!username || !global.ChessAnalysis || !global.ChessAnalysis.listHistory) return;
      let cancelado = false;
      (async () => {
        try {
          const arr = await global.ChessAnalysis.listHistory(username);
          if (!cancelado) setHistorico(arr || []);
        } catch (_) {}
      })();
      return () => { cancelado = true; };
    }, [username, currentAnalyzedAt]);

    if (historico.length <= 1) return null;

    return (
      <div className="card-soft mb-12" style={{ padding: "10px 12px" }}>
        <div className="between" style={{ cursor: "pointer" }} onClick={() => setAberto(a => !a)}>
          <div className="mono fs-11 ls-2 txt-mid">📜 HISTÓRICO ({historico.length} análises)</div>
          <div className="mono fs-11 txt-muted">{aberto ? "▴" : "▾"}</div>
        </div>
        {aberto && (
          <div className="vstack gap-8 mt-12">
            {historico.map((h, i) => {
              const prev = historico[i + 1];
              const deltaR = prev ? (h.suggested_rating - prev.suggested_rating) : 0;
              const temasH = (h.themes || []).slice(0, 3).map(t => TEMAS[t.theme] || t.theme).join(", ");
              return (
                <div key={h.id || i} className="vstack gap-4" style={{
                  borderLeft: i === 0 ? "3px solid var(--primary)" : "3px solid var(--border)",
                  paddingLeft: 10
                }}>
                  <div className="hstack gap-12 flex-wrap" style={{ alignItems: "baseline" }}>
                    <span className="mono fs-11 txt-mid">{formatarData(h.analyzed_at)}</span>
                    <span className="serif bold fs-13">{h.suggested_rating}</span>
                    {prev && deltaR !== 0 && (
                      <span className="mono fs-11" style={{
                        color: deltaR > 0 ? "var(--green)" : "var(--red)"
                      }}>
                        {deltaR > 0 ? "+" : ""}{deltaR}
                      </span>
                    )}
                    <span className="mono fs-10 txt-muted">
                      {h.tactical_confidence && h.tactical_confidence.level}
                      {h.games_analyzed && " · " + h.games_analyzed + "p"}
                    </span>
                  </div>
                  <div className="mono fs-10 txt-muted">{temasH}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  global.WP = global.WP || {};
  global.WP.UI = global.WP.UI || {};
  global.WP.UI.HistoricoAnalises = HistoricoAnalises;
})(typeof window !== "undefined" ? window : globalThis);
