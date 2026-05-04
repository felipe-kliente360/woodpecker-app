/* eslint-disable */
// Woodpecker — Stats screens (3 levels: Geral / Conjuntos / Temas)

// ─────────────────────────────────────────────────────────────────────────────
// Shared header: title + segmented tabs

function StatsHeader({ active, title }) {
  return (
    <div style={{ padding: '14px 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="wp-display" style={{ fontSize: 26, fontWeight: 500, margin: 0 }}>{title || 'Análises'}</h1>
      </div>
      <div style={{ display: 'flex', gap: 0, marginTop: 16, borderBottom: '1px solid var(--wp-line-soft)' }}>
        {[
          { id: 'geral', label: 'Geral' },
          { id: 'sets', label: 'Conjuntos' },
          { id: 'themes', label: 'Temas' },
        ].map((t) => (
          <button key={t.id}
            style={{
              flex: 1, padding: '10px 0', background: 'transparent', border: 0,
              fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: active === t.id ? 'var(--wp-text)' : 'var(--wp-text-3)',
              fontWeight: active === t.id ? 600 : 500,
              borderBottom: active === t.id ? '1.5px solid var(--wp-accent)' : '1.5px solid transparent',
              marginBottom: -1, cursor: 'default',
            }}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatsBackHeader({ title, kicker }) {
  return (
    <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <button className="wp-btn wp-btn-ghost" style={{ padding: '6px 8px', border: 0, marginLeft: -8 }}>
        <WpIcon name="chevron_left" size={16} />
      </button>
      <div style={{ flex: 1 }}>
        {kicker && <div className="wp-eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>{kicker}</div>}
        <div className="wp-display" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>{title}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1) GERAL — overall evolution

function ScreenStats() {
  return (
    <WpFrame>
      <WpStatusBar />
      <StatsHeader active="geral" />

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 24px' }}>
        {/* Headline number */}
        <div className="wp-eyebrow" style={{ marginBottom: 12 }}>Velocidade vs. ciclo 1</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="wp-mono" style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--wp-accent)' }}>2,4×</span>
          <span style={{ fontSize: 14, color: 'var(--wp-text-3)' }}>mais rápido</span>
        </div>

        {/* Resumo 3 cells */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--wp-line-soft)' }}>
          {[
            ['Ciclos', '6', 'completos'],
            ['Puzzles', '2.847', 'resolvidos'],
            ['Horas', '38h', 'totais'],
          ].map(([k, v, sub]) => (
            <div key={k} style={{ background: 'var(--wp-bg)', padding: '14px 10px' }}>
              <div className="wp-eyebrow" style={{ fontSize: 9.5, marginBottom: 6 }}>{k}</div>
              <div className="wp-mono" style={{ fontSize: 20, fontWeight: 500 }}>{v}</div>
              <div className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-3)', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Trend 90 dias — sparkline */}
        <div className="wp-card" style={{ padding: 18, marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span className="wp-eyebrow">Tempo médio · 90 dias</span>
            <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>seg / puzzle</span>
          </div>
          <svg width="100%" height="80" viewBox="0 0 300 80" style={{ display: 'block' }}>
            {/* hairlines */}
            <line x1="0" y1="20" x2="300" y2="20" stroke="var(--wp-line-soft)" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="50" x2="300" y2="50" stroke="var(--wp-line-soft)" strokeWidth="0.5" strokeDasharray="2 2" />
            {/* trend line */}
            <polyline
              points="0,18 20,22 40,28 60,26 80,32 100,38 120,42 140,46 160,52 180,55 200,58 220,62 240,64 260,68 280,70 300,72"
              fill="none" stroke="var(--wp-accent)" strokeWidth="1.5" />
            {/* dot at end */}
            <circle cx="300" cy="72" r="3" fill="var(--wp-accent)" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-4)' }}>00:42</span>
            <span className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-4)' }}>hoje</span>
            <span className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-accent)' }}>00:18</span>
          </div>
        </div>

        {/* Constancia 30d */}
        <div className="wp-card" style={{ padding: 18, marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span className="wp-eyebrow">Constância — 30 dias</span>
            <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-good)' }}>23 / 30</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 4 }}>
            {Array.from({length: 30}).map((_, i) => {
              const filled = [0,1,2,3,5,6,7,8,9,11,12,13,14,16,17,18,19,21,22,23,24,26,27].includes(i);
              const intensity = filled ? (i % 3 === 0 ? 1 : 0.6) : 0;
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

        {/* Marcos */}
        <div className="wp-eyebrow" style={{ marginTop: 28, marginBottom: 8 }}>Marcos recentes</div>
        {[
          { d: 'há 4 dias',  t: '30 dias consecutivos de treino' },
          { d: 'há 6 dias',  t: 'Ciclo 2 de Padrão diário concluído' },
          { d: 'há 12 dias', t: 'Rating recalibrado · 1.547 (+82)' },
          { d: 'há 18 dias', t: 'Conjunto vs. @magnus_jr criado' },
        ].map((m, i) => (
          <div key={i} className="wp-row">
            <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)', minWidth: 64 }}>{m.d}</span>
            <span style={{ flex: 1, fontSize: 13 }}>{m.t}</span>
          </div>
        ))}
      </div>

      <WpTabBar active="stats" />
    </WpFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2A) CONJUNTOS — lista

function ScreenStatsSets() {
  const sets = [
    { name: 'Plano de melhoria', kind: 'Plano · 500×7', delta: '−71%', val: '04:12', cycles: 3, total: 7,
      spark: [42, 28, 12], color: 'var(--wp-good)' },
    { name: 'Padrão diário', kind: 'Padrão · 300×7', delta: '−48%', val: '05:42', cycles: 4, total: 7,
      spark: [38, 30, 22, 18, null, null, null], color: 'var(--wp-good)' },
    { name: 'vs. @magnus_jr', kind: 'Adversário · 300×7', delta: '−12%', val: '03:50', cycles: 1, total: 7,
      spark: [50], color: 'var(--wp-warn)' },
  ];
  return (
    <WpFrame>
      <WpStatusBar />
      <StatsHeader active="sets" />

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 24px' }}>
        <div className="wp-eyebrow" style={{ marginBottom: 12 }}>Toque para ver ciclos</div>
        {sets.map((s, idx) => (
          <div key={s.name} className="wp-card" style={{ padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{s.name}</div>
                <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)', marginTop: 2 }}>{s.kind}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="wp-mono" style={{ fontSize: 18, color: s.color, fontWeight: 500 }}>{s.delta}</div>
                <div className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-4)', marginTop: 2 }}>vs. ciclo 1</div>
              </div>
            </div>

            {/* mini bars per cycle */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 32, marginTop: 14 }}>
              {Array.from({ length: s.total }).map((_, i) => {
                const v = s.spark[i];
                const max = 50;
                const h = v ? (v / max) * 100 : 100;
                const isCur = v && i === s.cycles - 1;
                return (
                  <div key={i} style={{
                    flex: 1,
                    height: `${h}%`,
                    background: v ? (isCur ? 'var(--wp-accent)' : 'var(--wp-surface-3)') : 'transparent',
                    border: v ? 'none' : '1px dashed var(--wp-line)',
                    borderRadius: 1,
                  }} />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-3)' }}>último ciclo · {s.val}</span>
              <span className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-3)' }}>ciclo {s.cycles} de {s.total}</span>
            </div>
          </div>
        ))}
      </div>

      <WpTabBar active="stats" />
    </WpFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2B) CONJUNTO — detalhe (ciclos)

function ScreenStatsSetDetail() {
  const cycles = [
    { c: 1, total: '04:42:18', acc: 84, avg: '00:42', delta: '—' },
    { c: 2, total: '03:18:02', acc: 91, avg: '00:30', delta: '−29%' },
    { c: 3, total: '02:24:50', acc: 94, avg: '00:22', delta: '−27%' },
    { c: 4, total: '02:01:30', acc: 96, avg: '00:18', delta: '−18%', cur: true },
  ];
  const themes = [
    { t: 'Garfo', v: 32 },
    { t: 'Pino', v: 24 },
    { t: 'Sacrifício', v: 18 },
    { t: 'Mate em 2', v: 14 },
    { t: 'Final', v: 12 },
  ];
  return (
    <WpFrame>
      <WpStatusBar />
      <StatsBackHeader kicker="Plano · 500×7" title="Plano de melhoria" />

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 24px 24px' }}>
        {/* big number */}
        <div className="wp-eyebrow" style={{ marginBottom: 10 }}>Ciclo 4 vs. ciclo 1</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="wp-mono" style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--wp-accent)' }}>−71%</span>
          <span style={{ fontSize: 13, color: 'var(--wp-text-3)' }}>tempo médio</span>
        </div>

        {/* chart */}
        <div className="wp-card" style={{ padding: 18, marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span className="wp-eyebrow">Tempo médio por ciclo</span>
            <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>seg / puzzle</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 110 }}>
            {[
              { c: '1', v: 42, t: '00:42' },
              { c: '2', v: 30, t: '00:30' },
              { c: '3', v: 22, t: '00:22' },
              { c: '4', v: 18, t: '00:18', cur: true },
              { c: '5', v: null }, { c: '6', v: null }, { c: '7', v: null },
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

        {/* table */}
        <div className="wp-eyebrow" style={{ marginTop: 22, marginBottom: 8 }}>Ciclo a ciclo</div>
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 56px 60px 60px', rowGap: 0,
          fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          <div className="wp-eyebrow" style={{ fontSize: 9, padding: '6px 0' }}>#</div>
          <div className="wp-eyebrow" style={{ fontSize: 9, padding: '6px 0' }}>Duração</div>
          <div className="wp-eyebrow" style={{ fontSize: 9, padding: '6px 0', textAlign: 'right' }}>Acerto</div>
          <div className="wp-eyebrow" style={{ fontSize: 9, padding: '6px 0', textAlign: 'right' }}>Médio</div>
          <div className="wp-eyebrow" style={{ fontSize: 9, padding: '6px 0', textAlign: 'right' }}>Δ</div>
          {cycles.map((r) => (
            <React.Fragment key={r.c}>
              <div style={{ padding: '11px 0', borderTop: '1px solid var(--wp-line-soft)', color: r.cur ? 'var(--wp-accent)' : 'var(--wp-text-3)' }}>{r.c}</div>
              <div style={{ padding: '11px 0', borderTop: '1px solid var(--wp-line-soft)' }}>{r.total}</div>
              <div style={{ padding: '11px 0', borderTop: '1px solid var(--wp-line-soft)', textAlign: 'right', color: 'var(--wp-text-2)' }}>{r.acc}%</div>
              <div style={{ padding: '11px 0', borderTop: '1px solid var(--wp-line-soft)', textAlign: 'right', color: r.cur ? 'var(--wp-accent)' : 'var(--wp-text)' }}>{r.avg}</div>
              <div style={{ padding: '11px 0', borderTop: '1px solid var(--wp-line-soft)', textAlign: 'right', color: r.delta === '—' ? 'var(--wp-text-4)' : 'var(--wp-good)' }}>{r.delta}</div>
            </React.Fragment>
          ))}
        </div>

        {/* theme distribution */}
        <div className="wp-eyebrow" style={{ marginTop: 24, marginBottom: 12 }}>Composição por tema</div>
        {themes.map((t) => (
          <div key={t.t} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>{t.t}</span>
              <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>{t.v}%</span>
            </div>
            <div style={{ height: 2, background: 'var(--wp-surface-2)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${t.v * 3}%`, maxWidth: '100%', background: 'var(--wp-accent-soft)' }} />
            </div>
          </div>
        ))}
      </div>

      <WpTabBar active="stats" />
    </WpFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2C) CONJUNTO — empty state (1 ciclo só)

function ScreenStatsSetEmpty() {
  return (
    <WpFrame>
      <WpStatusBar />
      <StatsBackHeader kicker="Adversário · 300×7" title="vs. @magnus_jr" />

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 24px 24px' }}>
        <div className="wp-eyebrow" style={{ marginBottom: 10 }}>Ciclo atual</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="wp-mono" style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.03em' }}>03:50</span>
          <span style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>tempo médio</span>
        </div>

        {/* progress to cycle 2 */}
        <div className="wp-card" style={{ padding: 18, marginTop: 22, textAlign: 'center' }}>
          <WpTally total={7} done={3} />
          <div className="wp-display" style={{ fontSize: 18, fontWeight: 500, marginTop: 18 }}>
            Conclua o ciclo 2 para ver evolução
          </div>
          <div style={{ fontSize: 12, color: 'var(--wp-text-3)', marginTop: 8, lineHeight: 1.5 }}>
            O método compara cada ciclo com o anterior.<br/>Sem o segundo ciclo, ainda não há base de comparação.
          </div>
          <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-accent)', marginTop: 18 }}>
            faltam 4 ciclos para completar o conjunto
          </div>
        </div>

        <div className="wp-eyebrow" style={{ marginTop: 22, marginBottom: 8 }}>Ciclo 1 · resumo</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--wp-line-soft)' }}>
          {[
            ['Duração', '19h12'],
            ['Acerto', '78%'],
            ['Médio', '03:50'],
          ].map(([k, v]) => (
            <div key={k} style={{ background: 'var(--wp-bg)', padding: '14px 10px' }}>
              <div className="wp-eyebrow" style={{ fontSize: 9.5, marginBottom: 6 }}>{k}</div>
              <div className="wp-mono" style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <WpTabBar active="stats" />
    </WpFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3A) TEMAS — lista

function ScreenStatsThemes() {
  const themes = [
    { t: 'Final de torre', v: 38, n: 142 },
    { t: 'Sacrifício', v: 54, n: 89 },
    { t: 'Desvio', v: 62, n: 76 },
    { t: 'Mate em 2', v: 71, n: 234 },
    { t: 'Pino', v: 78, n: 198 },
    { t: 'Espeto', v: 84, n: 124 },
    { t: 'Garfo', v: 92, n: 312 },
  ];
  return (
    <WpFrame>
      <WpStatusBar />
      <StatsHeader active="themes" />

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <span className="wp-eyebrow">Mais fraco no topo</span>
          <button className="wp-btn wp-btn-ghost" style={{ padding: '4px 8px', fontSize: 11, border: 0 }}>
            Força ↓ <WpIcon name="chevron_down" size={11} />
          </button>
        </div>
        {themes.map((t) => (
          <div key={t.t} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--wp-line-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{t.t}</span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-4)' }}>{t.n}</span>
                <span className="wp-mono" style={{ fontSize: 13, color: 'var(--wp-text-2)', fontWeight: 500, minWidth: 32, textAlign: 'right' }}>{t.v}%</span>
                <WpIcon name="chevron_right" size={13} color="var(--wp-text-4)" />
              </div>
            </div>
            <div style={{ height: 2, background: 'var(--wp-surface-2)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${t.v}%`,
                background: t.v < 50 ? 'var(--wp-bad)' : t.v < 75 ? 'var(--wp-warn)' : 'var(--wp-accent)' }} />
            </div>
          </div>
        ))}
      </div>

      <WpTabBar active="stats" />
    </WpFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3B) TEMA — detalhe

function ScreenStatsThemeDetail() {
  const errors = [
    { pos: 'Black to move · h6', sets: 'Plano de melhoria · ciclo 3', when: 'há 4 dias' },
    { pos: 'White to move · Re5', sets: 'Plano de melhoria · ciclo 4', when: 'há 1 dia' },
    { pos: 'Black to move · Kg7', sets: 'Padrão diário · ciclo 4', when: 'há 6 dias' },
  ];
  return (
    <WpFrame>
      <WpStatusBar />
      <StatsBackHeader kicker="Tema tático" title="Final de torre" />

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 24px 24px' }}>
        {/* current strength */}
        <div className="wp-eyebrow" style={{ marginBottom: 10 }}>Força atual</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span className="wp-mono" style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--wp-bad)' }}>38%</span>
          <div>
            <div className="wp-mono" style={{ fontSize: 13, color: 'var(--wp-good)', fontWeight: 500 }}>+12 pts</div>
            <div className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-3)' }}>em 3 ciclos</div>
          </div>
        </div>

        {/* trend line */}
        <div className="wp-card" style={{ padding: 18, marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span className="wp-eyebrow">Evolução do tema</span>
            <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>% por ciclo</span>
          </div>
          <svg width="100%" height="80" viewBox="0 0 280 80" style={{ display: 'block' }}>
            <line x1="0" y1="20" x2="280" y2="20" stroke="var(--wp-line-soft)" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="50" x2="280" y2="50" stroke="var(--wp-line-soft)" strokeWidth="0.5" strokeDasharray="2 2" />
            <polyline
              points="20,62 90,54 160,46 230,38"
              fill="none" stroke="var(--wp-accent)" strokeWidth="1.5" />
            {[[20,62],[90,54],[160,46],[230,38]].map(([x,y], i) => (
              <circle key={i} cx={x} cy={y} r={i === 3 ? 3.5 : 2.5}
                fill={i === 3 ? 'var(--wp-accent)' : 'var(--wp-surface-3)'}
                stroke={i === 3 ? 'none' : 'var(--wp-accent)'} strokeWidth="1" />
            ))}
            {[1,2,3,4].map((c, i) => (
              <text key={c} x={20 + i*70} y={76} fontSize="9" fontFamily="var(--font-mono)"
                fill="var(--wp-text-4)" textAnchor="middle">c{c}</text>
            ))}
          </svg>
        </div>

        {/* time comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--wp-line-soft)', marginTop: 12 }}>
          <div style={{ background: 'var(--wp-bg)', padding: '14px 12px' }}>
            <div className="wp-eyebrow" style={{ fontSize: 9.5, marginBottom: 6 }}>Tempo neste tema</div>
            <div className="wp-mono" style={{ fontSize: 20, fontWeight: 500, color: 'var(--wp-bad)' }}>00:38</div>
          </div>
          <div style={{ background: 'var(--wp-bg)', padding: '14px 12px' }}>
            <div className="wp-eyebrow" style={{ fontSize: 9.5, marginBottom: 6 }}>Geral</div>
            <div className="wp-mono" style={{ fontSize: 20, fontWeight: 500, color: 'var(--wp-text-2)' }}>00:18</div>
          </div>
        </div>

        {/* recent errors */}
        <div className="wp-eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Erros recentes</div>
        {errors.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0',
            borderBottom: i < errors.length - 1 ? '1px solid var(--wp-line-soft)' : 'none' }}>
            <div style={{ width: 44, height: 44, flexShrink: 0,
              background: 'repeating-linear-gradient(45deg, var(--wp-board-light) 0 12.5%, var(--wp-board-dark) 12.5% 25%)',
              borderRadius: 2, border: '1px solid var(--wp-board-edge)' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="wp-mono" style={{ fontSize: 12, color: 'var(--wp-text)' }}>{e.pos}</div>
              <div style={{ fontSize: 11, color: 'var(--wp-text-3)', marginTop: 2 }}>{e.sets}</div>
            </div>
            <div className="wp-mono" style={{ fontSize: 10, color: 'var(--wp-text-4)', whiteSpace: 'nowrap' }}>{e.when}</div>
          </div>
        ))}

        {/* CTA */}
        <button className="wp-btn wp-btn-primary" style={{ width: '100%', marginTop: 22 }}>
          Treinar só este tema
        </button>
        <div style={{ fontSize: 11, color: 'var(--wp-text-4)', textAlign: 'center', marginTop: 8 }}>
          Mini-pacote de 20 puzzles, fora do ciclo
        </div>
      </div>

      <WpTabBar active="stats" />
    </WpFrame>
  );
}

Object.assign(window, {
  ScreenStats, ScreenStatsSets, ScreenStatsSetDetail, ScreenStatsSetEmpty,
  ScreenStatsThemes, ScreenStatsThemeDetail,
  ScreenProfile,
});

// ─────────────────────────────────────────────────────────────────────────────
// Profile (kept from previous version)

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
            ['Estilo do tabuleiro', 'Mogno'],
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
