/* eslint-disable */
// Woodpecker — Home & Sets screens

function ScreenHome() {
  return (
    <WpFrame>
      <WpStatusBar />
      {/* Header */}
      <div style={{ padding: '14px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <WpMark size={22} />
          <span className="wp-mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--wp-text-3)', textTransform: 'uppercase' }}>woodpecker</span>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span className="wp-mono" style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>1547</span>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: 'var(--wp-surface-3)', color: 'var(--wp-accent)', fontSize: 12, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>R</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 24px 16px' }}>
        {/* Streak */}
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="wp-eyebrow" style={{ marginBottom: 6 }}>Constância</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="wp-mono" style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.03em', color: 'var(--wp-text)' }}>14</span>
              <span style={{ fontSize: 13, color: 'var(--wp-text-3)' }}>dias seguidos</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="wp-eyebrow" style={{ marginBottom: 6 }}>Hoje</div>
            <span className="wp-mono" style={{ fontSize: 14, color: 'var(--wp-text-2)' }}>00:18:42</span>
          </div>
        </div>

        {/* Calendar week */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {['S','T','Q','Q','S','S','D'].map((d, i) => {
            const done = i < 5;
            const today = i === 4;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--wp-text-4)', marginBottom: 6 }}>{d}</div>
                <div style={{
                  height: 28, borderRadius: 2,
                  background: done ? 'var(--wp-accent)' : 'var(--wp-surface-2)',
                  opacity: today ? 1 : (done ? 0.85 : 1),
                  border: today ? '1px solid var(--wp-accent)' : '1px solid transparent',
                }} />
              </div>
            );
          })}
        </div>

        <div className="wp-divider" style={{ margin: '24px 0' }} />

        {/* Continue card — current cycle */}
        <div className="wp-eyebrow" style={{ marginBottom: 12 }}>Em andamento</div>
        <div className="wp-card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 4 }}>Plano de melhoria</div>
              <div style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>Ciclo 2 de 5 · pacote 3</div>
            </div>
            <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-accent)', letterSpacing: '0.12em' }}>ATIVO</div>
          </div>

          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>34/100</span>
            <div style={{ flex: 1, height: 2, background: 'var(--wp-surface-3)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '34%', background: 'var(--wp-accent)' }} />
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 18, color: 'var(--wp-text-3)', fontSize: 12 }}>
            <span>Ciclo 1 <span className="wp-mono" style={{ color: 'var(--wp-text-2)' }}>14:32</span></span>
            <span>Ciclo 2 <span className="wp-mono" style={{ color: 'var(--wp-accent)' }}>04:12</span></span>
            <span style={{ marginLeft: 'auto', color: 'var(--wp-good)' }}>−71%</span>
          </div>

          <button className="wp-btn wp-btn-primary" style={{ width: '100%', marginTop: 18, padding: '14px' }}>
            Continuar — pacote 3
          </button>
        </div>

        {/* Other sets */}
        <div className="wp-eyebrow" style={{ marginTop: 28, marginBottom: 8 }}>Outros conjuntos</div>
        <div>
          <div className="wp-row">
            <div style={{ width: 32, textAlign: 'center' }}>
              <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>01</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Padrão diário</div>
              <div style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>Temas sortidos · 50 puzzles</div>
            </div>
            <WpTally total={5} done={3} />
            <WpIcon name="chevron_right" size={14} color="var(--wp-text-4)" />
          </div>
          <div className="wp-row">
            <div style={{ width: 32, textAlign: 'center' }}>
              <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>02</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>vs. <span className="wp-mono">@magnus_jr</span></div>
              <div style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>Específico · 80 puzzles</div>
            </div>
            <WpTally total={5} done={1} />
            <WpIcon name="chevron_right" size={14} color="var(--wp-text-4)" />
          </div>
          <div className="wp-row">
            <div style={{ width: 32, textAlign: 'center' }}>
              <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>03</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--wp-text-3)' }}>+ Novo conjunto</div>
              <div style={{ fontSize: 12, color: 'var(--wp-text-4)' }}>Padrão, plano ou adversário</div>
            </div>
          </div>
        </div>
      </div>

      <WpTabBar active="home" />
    </WpFrame>
  );
}

function ScreenSets() {
  const sets = [
    { n: '01', title: 'Plano de melhoria', sub: '100 puzzles · meio-jogo', cycles: [{r: 100, t: '14:32'},{r: 34, t: '04:12'}], active: true },
    { n: '02', title: 'Padrão diário', sub: '50 puzzles · sortido', cycles: [{r: 50, t: '08:11'},{r: 50, t: '05:42'},{r: 24, t: '02:30'}] },
    { n: '03', title: 'vs. @magnus_jr', sub: '80 puzzles · siciliana', cycles: [{r: 80, t: '22:08'},{r: 18, t: '03:50'}] },
  ];
  return (
    <WpFrame>
      <WpStatusBar />
      <div style={{ padding: '14px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="wp-display" style={{ fontSize: 26, fontWeight: 500, margin: 0 }}>Conjuntos</h1>
        <button className="wp-btn wp-btn-ghost" style={{ padding: '8px', border: 0 }}><WpIcon name="plus" /></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px 24px' }}>
        {sets.map((s, idx) => (
          <div key={s.n} className="wp-card" style={{ padding: 18, marginTop: idx === 0 ? 8 : 12, borderColor: s.active ? 'var(--wp-accent-soft)' : 'var(--wp-line-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>{s.n}</span>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{s.title}</span>
                  {s.active && <span className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-accent)', letterSpacing: '0.12em' }}>ATIVO</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>{s.sub}</div>
              </div>
            </div>

            {/* Cycle row — each cycle as a column */}
            <div style={{ marginTop: 18, display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
              {s.cycles.map((c, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                  <div style={{
                    height: `${(c.r / 100) * 100}%`,
                    background: i === s.cycles.length - 1 && s.active ? 'var(--wp-accent)' : 'var(--wp-surface-3)',
                    borderRadius: 1,
                  }} />
                  <div className="wp-mono" style={{ fontSize: 9, color: 'var(--wp-text-4)', textAlign: 'center', marginTop: 4 }}>{c.t}</div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 5 - s.cycles.length) }).map((_, i) => (
                <div key={`e-${i}`} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ height: 2, background: 'var(--wp-line-soft)' }} />
                  <div className="wp-mono" style={{ fontSize: 9, color: 'var(--wp-text-4)', textAlign: 'center', marginTop: 4 }}>—</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>
                Ciclo <span className="wp-mono" style={{ color: 'var(--wp-text)' }}>{s.cycles.length}</span> de <span className="wp-mono">5</span>
              </span>
              <button className="wp-btn" style={{ padding: '8px 14px', fontSize: 13 }}>
                {s.active ? 'Continuar' : 'Abrir'}
              </button>
            </div>
          </div>
        ))}

        <button className="wp-card" style={{
          width: '100%', marginTop: 14, padding: '22px',
          border: '1px dashed var(--wp-line)', background: 'transparent',
          color: 'var(--wp-text-2)', fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <WpIcon name="plus" size={14} /> Novo conjunto
        </button>
      </div>

      <WpTabBar active="sets" />
    </WpFrame>
  );
}

function ScreenNewSet() {
  const types = [
    { id: 'std', label: 'Padrão', desc: 'Temas sortidos no seu rating', n: '01', meta: '50 ou 100 puzzles' },
    { id: 'plan', label: 'Plano de melhoria', desc: 'Importa fraquezas do chess.com', n: '02', meta: 'Personalizado' },
    { id: 'foe', label: 'Adversário específico', desc: 'Aberturas e padrões dele', n: '03', meta: 'username + 100 puzzles' },
  ];
  return (
    <WpFrame>
      <WpStatusBar />
      <div style={{ padding: '14px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="wp-btn wp-btn-ghost" style={{ padding: '6px 8px', border: 0 }}><WpIcon name="close" /></button>
        <span className="wp-eyebrow">Novo conjunto</span>
        <div style={{ width: 30 }} />
      </div>

      <div style={{ flex: 1, padding: '32px 24px 24px' }}>
        <h2 className="wp-display" style={{ fontSize: 28, fontWeight: 500, margin: 0, lineHeight: 1.15 }}>
          Que tipo de<br/>treino?
        </h2>
        <p style={{ fontSize: 13, color: 'var(--wp-text-3)', marginTop: 10 }}>
          Cada conjunto será repetido por 5 ciclos.
        </p>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {types.map((t, i) => (
            <button key={t.id} className="wp-card" style={{
              textAlign: 'left', padding: 18, cursor: 'pointer',
              border: i === 1 ? '1px solid var(--wp-accent)' : '1px solid var(--wp-line-soft)',
              background: i === 1 ? 'var(--wp-accent-tint)' : 'var(--wp-surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>{t.n}</span>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{t.label}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--wp-text-2)', lineHeight: 1.45 }}>{t.desc}</div>
              <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-4)', marginTop: 10, letterSpacing: '0.06em' }}>{t.meta}</div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', position: 'absolute', bottom: 28, left: 24, right: 24 }}>
          <button className="wp-btn wp-btn-primary" style={{ width: '100%', padding: '14px' }}>Configurar</button>
        </div>
      </div>
    </WpFrame>
  );
}

Object.assign(window, { ScreenHome, ScreenSets, ScreenNewSet });
