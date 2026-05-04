/* eslint-disable */
// Woodpecker — Stats & Profile screens

function ScreenStats() {
  return (
    <WpFrame>
      <WpStatusBar />
      <div style={{ padding: '14px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="wp-display" style={{ fontSize: 26, fontWeight: 500, margin: 0 }}>Análises</h1>
        <button className="wp-btn wp-btn-ghost" style={{ padding: '6px 8px', border: 0, fontSize: 12 }}>
          Total <WpIcon name="chevron_down" size={12} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 24px' }}>
        {/* Headline number — improvement */}
        <div className="wp-eyebrow" style={{ marginBottom: 12 }}>Velocidade vs. ciclo 1</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="wp-mono" style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--wp-accent)' }}>2,4×</span>
          <span style={{ fontSize: 14, color: 'var(--wp-text-3)' }}>mais rápido</span>
        </div>

        {/* Cycles trend */}
        <div className="wp-card" style={{ padding: 18, marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span className="wp-eyebrow">Tempo médio por ciclo</span>
            <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>seg / puzzle</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 110 }}>
            {[
              { c: '1', v: 42, t: '00:42' },
              { c: '2', v: 18, t: '00:18', cur: true },
              { c: '3', v: null, t: '—' },
              { c: '4', v: null, t: '—' },
              { c: '5', v: null, t: '—' },
            ].map((d, i) => {
              const max = 50;
              const h = d.v ? (d.v / max) * 100 : 4;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  {d.v && <div className="wp-mono" style={{ fontSize: 10, color: d.cur ? 'var(--wp-accent)' : 'var(--wp-text-3)', marginBottom: 6 }}>{d.t}</div>}
                  <div style={{
                    width: '100%',
                    height: `${h}%`,
                    background: d.v ? (d.cur ? 'var(--wp-accent)' : 'var(--wp-surface-3)') : 'transparent',
                    borderTop: d.v ? 'none' : '1px dashed var(--wp-line)',
                    borderRadius: 1,
                    minHeight: d.v ? 8 : 1,
                  }} />
                  <div className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-4)', marginTop: 6 }}>c{d.c}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Constancia */}
        <div className="wp-card" style={{ padding: 18, marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span className="wp-eyebrow">Constância — 30 dias</span>
            <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-good)' }}>23 / 30</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 4 }}>
            {Array.from({length: 30}).map((_, i) => {
              const filled = [0,1,2,3,5,6,7,8,9,11,12,13,14,16,17,18,19,21,22,23,24,26,27].includes(i);
              const intensity = filled ? (Math.random() > 0.5 ? 1 : 0.6) : 0;
              return (
                <div key={i} style={{
                  paddingTop: '100%',
                  background: intensity ? `oklch(0.72 0.13 55 / ${intensity})` : 'var(--wp-surface-2)',
                  borderRadius: 1,
                }} />
              );
            })}
          </div>
        </div>

        {/* By set type */}
        <div className="wp-eyebrow" style={{ marginTop: 28, marginBottom: 8 }}>Por conjunto</div>
        {[
          { name: 'Plano de melhoria', delta: '−71%', val: '04:12', deltaColor: 'var(--wp-good)' },
          { name: 'Padrão diário', delta: '−48%', val: '05:42', deltaColor: 'var(--wp-good)' },
          { name: 'vs. @magnus_jr', delta: '−12%', val: '03:50', deltaColor: 'var(--wp-warn)' },
        ].map((s) => (
          <div key={s.name} className="wp-row">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
              <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)', marginTop: 2 }}>último ciclo {s.val}</div>
            </div>
            <span className="wp-mono" style={{ fontSize: 14, color: s.deltaColor, fontWeight: 500 }}>{s.delta}</span>
            <WpIcon name="chevron_right" size={14} color="var(--wp-text-4)" />
          </div>
        ))}

        {/* Themes */}
        <div className="wp-eyebrow" style={{ marginTop: 22, marginBottom: 12 }}>Temas — força relativa</div>
        {[
          { t: 'Garfo', v: 92 },
          { t: 'Pino', v: 78 },
          { t: 'Mate em 2', v: 71 },
          { t: 'Sacrifício', v: 54 },
          { t: 'Final de torre', v: 38 },
        ].map((t) => (
          <div key={t.t} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>{t.t}</span>
              <span className="wp-mono" style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>{t.v}%</span>
            </div>
            <div style={{ height: 2, background: 'var(--wp-surface-2)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${t.v}%`, background: t.v < 50 ? 'var(--wp-bad)' : t.v < 75 ? 'var(--wp-warn)' : 'var(--wp-accent)' }} />
            </div>
          </div>
        ))}
      </div>

      <WpTabBar active="stats" />
    </WpFrame>
  );
}

function ScreenProfile() {
  return (
    <WpFrame>
      <WpStatusBar />
      <div style={{ padding: '14px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="wp-display" style={{ fontSize: 26, fontWeight: 500, margin: 0 }}>Perfil</h1>
        <button className="wp-btn wp-btn-ghost" style={{ padding: '6px 8px', border: 0 }}><WpIcon name="settings" size={16} /></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--wp-surface-3)', color: 'var(--wp-accent)', fontFamily: 'var(--font-mono)', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>R</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Rafa Silva</div>
            <div className="wp-mono" style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>@rafa_silva · chess.com</div>
          </div>
        </div>

        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--wp-line-soft)' }}>
          <div style={{ background: 'var(--wp-bg)', padding: '18px 12px' }}>
            <div className="wp-eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>Rating</div>
            <div className="wp-mono" style={{ fontSize: 22, fontWeight: 500 }}>1547</div>
            <div className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-good)', marginTop: 4 }}>+82</div>
          </div>
          <div style={{ background: 'var(--wp-bg)', padding: '18px 12px' }}>
            <div className="wp-eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>Ciclos</div>
            <div className="wp-mono" style={{ fontSize: 22, fontWeight: 500 }}>6</div>
            <div className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-3)', marginTop: 4 }}>completos</div>
          </div>
          <div style={{ background: 'var(--wp-bg)', padding: '18px 12px' }}>
            <div className="wp-eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>Streak</div>
            <div className="wp-mono" style={{ fontSize: 22, fontWeight: 500 }}>14</div>
            <div className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-3)', marginTop: 4 }}>dias</div>
          </div>
        </div>

        <div className="wp-eyebrow" style={{ marginTop: 28, marginBottom: 4 }}>Treino</div>
        <div>
          {[
            ['Estilo do tabuleiro', 'Madeira'],
            ['Som de movimento', 'Suave'],
            ['Mostrar dica após', '60s'],
            ['Lembretes diários', '07:30'],
          ].map(([k, v]) => (
            <div key={k} className="wp-row">
              <span style={{ flex: 1, fontSize: 14 }}>{k}</span>
              <span className="wp-mono" style={{ fontSize: 13, color: 'var(--wp-text-3)' }}>{v}</span>
              <WpIcon name="chevron_right" size={14} color="var(--wp-text-4)" />
            </div>
          ))}
        </div>

        <div className="wp-eyebrow" style={{ marginTop: 22, marginBottom: 4 }}>Conta</div>
        <div>
          {['chess.com — conectado', 'Privacidade', 'Sobre o método', 'Sair'].map((k) => (
            <div key={k} className="wp-row">
              <span style={{ flex: 1, fontSize: 14, color: k === 'Sair' ? 'var(--wp-bad)' : 'var(--wp-text)' }}>{k}</span>
              <WpIcon name="chevron_right" size={14} color="var(--wp-text-4)" />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <span className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-4)', letterSpacing: '0.14em' }}>WOODPECKER · v1.0</span>
        </div>
      </div>

      <WpTabBar active="me" />
    </WpFrame>
  );
}

Object.assign(window, { ScreenStats, ScreenProfile });
