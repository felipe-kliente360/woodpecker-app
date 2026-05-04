/* eslint-disable */
// Woodpecker — Training puzzle screens (the star)

function ScreenPuzzle({ state = 'idle' }) {
  // state: idle | correct | wrong | almost
  const isResult = state !== 'idle';
  const resultColor = state === 'correct' ? 'var(--wp-good)' : state === 'wrong' ? 'var(--wp-bad)' : 'var(--wp-warn)';
  const resultLabel = state === 'correct' ? 'Certo' : state === 'wrong' ? 'Errado' : 'Quase';

  return (
    <WpFrame>
      <WpStatusBar />
      {/* Top bar — set + cycle + close */}
      <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="wp-btn wp-btn-ghost" style={{ padding: '6px 8px', border: 0 }}><WpIcon name="close" size={16} /></button>
        <div style={{ textAlign: 'center' }}>
          <div className="wp-eyebrow" style={{ fontSize: 9.5 }}>Plano de melhoria · Ciclo 2</div>
          <div className="wp-mono" style={{ fontSize: 12, color: 'var(--wp-text-2)', marginTop: 2 }}>34 / 100</div>
        </div>
        <button className="wp-btn wp-btn-ghost" style={{ padding: '6px 8px', border: 0 }}><WpIcon name="pause" size={16} /></button>
      </div>

      {/* Progress dots — woodpecker tally for 10-puzzle pack */}
      <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="wp-tally" style={{ color: 'var(--wp-accent)' }}>
          {Array.from({length: 10}).map((_, i) => (
            <i key={i} className={i < 4 ? 'on' : ''} style={{ height: 18 }} />
          ))}
        </div>
        <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>pacote 4 · puzzle 5</div>
      </div>

      {/* Above-board stats */}
      <div style={{ padding: '24px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div className="wp-eyebrow" style={{ fontSize: 9.5 }}>Brancas jogam</div>
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, color: isResult ? resultColor : 'var(--wp-text)', transition: 'color .3s' }}>
            {state === 'idle' ? 'Encontre a melhor jogada' : resultLabel}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>00:14</div>
          <div className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-4)' }}>antes 00:42</div>
        </div>
      </div>

      {/* Board */}
      <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <WpBoard size={350}
            position={{
              'a8': 'bR', 'd8': 'bQ', 'g8': 'bK', 'h8': 'bR',
              'a7': 'bP', 'b7': 'bP', 'f7': 'bP', 'g7': 'bP', 'h7': 'bP',
              'd7': 'bN', 'c6': 'bP', 'e6': 'bP',
              'd5': 'bP',
              'e4': 'wP', 'd4': 'wN',
              'c3': 'wN',
              'a2': 'wP', 'b2': 'wP', 'd2': 'wQ', 'f2': 'wP', 'g2': 'wP', 'h2': 'wP',
              'c1': 'wB', 'e1': 'wR', 'g1': 'wK',
              'f1': 'wB',
            }}
            lastMove={['d7', 'e6']}
            highlight={state === 'correct' ? ['d4', 'e6'] : null}
          />
          {isResult && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                marginTop: 8,
                padding: '4px 12px', borderRadius: 2,
                background: state === 'correct' ? 'var(--wp-good-soft)' : state === 'wrong' ? 'var(--wp-bad-soft)' : 'oklch(0.32 0.06 80)',
                color: resultColor,
                fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em',
                border: `1px solid ${resultColor}`,
              }}>
                {state === 'correct' ? 'Nxe6' : state === 'wrong' ? 'Bxh7+ ?' : 'Nf5 — bom, mas há melhor'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom area — actions or feedback */}
      <div style={{ flex: 1, padding: '20px 20px 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {state === 'idle' ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="wp-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <WpIcon name="hint" size={14} /> Dica
            </button>
            <button className="wp-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <WpIcon name="flag" size={14} /> Desistir
            </button>
          </div>
        ) : (
          <div>
            {state === 'correct' && (
              <div className="wp-card" style={{ padding: 14, marginBottom: 10, borderColor: 'var(--wp-good-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--wp-text-2)' }}>Mais rápido que ciclo 1</span>
                  <span className="wp-mono" style={{ fontSize: 14, color: 'var(--wp-good)' }}>−28s</span>
                </div>
              </div>
            )}
            <button className="wp-btn wp-btn-primary" style={{ width: '100%', padding: '14px' }}>
              Próximo · puzzle 6
            </button>
          </div>
        )}
      </div>

      <div style={{ height: 20 }} />
    </WpFrame>
  );
}

function ScreenPackComplete() {
  return (
    <WpFrame>
      <WpStatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 28px 28px' }}>
        <div className="wp-eyebrow" style={{ marginBottom: 18 }}>Pacote 4 / 10 concluído</div>

        <div className="wp-tally" style={{ color: 'var(--wp-accent)', marginBottom: 28 }}>
          {Array.from({length: 10}).map((_, i) => (
            <i key={i} className={i < 4 ? 'on' : ''} style={{ height: 28, width: 3 }} />
          ))}
        </div>

        <h1 className="wp-display" style={{ fontSize: 34, fontWeight: 500, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Você está <span style={{ color: 'var(--wp-accent)' }}>2,4×</span> mais rápido que no ciclo 1.
        </h1>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--wp-line-soft)' }}>
          <div style={{ background: 'var(--wp-bg)', padding: '18px 16px' }}>
            <div className="wp-eyebrow" style={{ marginBottom: 8 }}>Acertos</div>
            <div className="wp-mono" style={{ fontSize: 26, fontWeight: 500 }}>9<span style={{ color: 'var(--wp-text-3)', fontSize: 14 }}>/10</span></div>
            <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-good)', marginTop: 4 }}>+1 vs c1</div>
          </div>
          <div style={{ background: 'var(--wp-bg)', padding: '18px 16px' }}>
            <div className="wp-eyebrow" style={{ marginBottom: 8 }}>Tempo</div>
            <div className="wp-mono" style={{ fontSize: 26, fontWeight: 500 }}>04:12</div>
            <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-good)', marginTop: 4 }}>−71% vs c1</div>
          </div>
          <div style={{ background: 'var(--wp-bg)', padding: '18px 16px' }}>
            <div className="wp-eyebrow" style={{ marginBottom: 8 }}>Mais rápido</div>
            <div className="wp-mono" style={{ fontSize: 16, color: 'var(--wp-text-2)' }}>Mate em 2 · 06s</div>
          </div>
          <div style={{ background: 'var(--wp-bg)', padding: '18px 16px' }}>
            <div className="wp-eyebrow" style={{ marginBottom: 8 }}>A revisitar</div>
            <div className="wp-mono" style={{ fontSize: 16, color: 'var(--wp-bad)' }}>Garfo · 02:03</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
          <button className="wp-btn" style={{ flex: 1 }}>Pausa</button>
          <button className="wp-btn wp-btn-primary" style={{ flex: 2 }}>Próximo pacote</button>
        </div>
      </div>
    </WpFrame>
  );
}

Object.assign(window, { ScreenPuzzle, ScreenPackComplete });
