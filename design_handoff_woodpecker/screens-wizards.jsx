/* eslint-disable */
// Woodpecker — Wizards de criação de conjunto
// 3 fluxos: Padrão, Plano de melhoria, vs. Adversário.
// Compartilham a tela final de "tamanho do conjunto".

// ───────────────────────────────────────────────
// Header reutilizado em todos os passos do wizard
// ───────────────────────────────────────────────
function WizHeader({ step, total, title, onBack, onClose }) {
  return (
    <div style={{ padding: '14px 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="wp-btn wp-btn-ghost" style={{ padding: '6px 8px', border: 0 }} onClick={onBack}>
          <WpIcon name="arrow_left" />
        </button>
        <span className="wp-eyebrow">{title}</span>
        <button className="wp-btn wp-btn-ghost" style={{ padding: '6px 8px', border: 0 }} onClick={onClose}>
          <WpIcon name="close" size={16} />
        </button>
      </div>
      <div style={{ marginTop: 14, display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 2,
            background: i < step ? 'var(--wp-accent)' : 'var(--wp-line-soft)',
            borderRadius: 1,
          }} />
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Tela final compartilhada — Tamanho do conjunto
// (do print anexo do user)
// ───────────────────────────────────────────────
function ScreenWizSize({ flowName = 'Padrão', step = 2, total = 2 }) {
  const protocols = [
    { id: 'mini', label: 'Mini', size: '100×6', sub: 'Pré-treino. Conjunto de aquecimento.', meta: '~2h por ciclo' },
    { id: 'red', label: 'Reduzido', size: '300×7', sub: 'Mínimo útil pra ver o efeito do método.', meta: '~6h por ciclo' },
    { id: 'std', label: 'Standard', size: '500×7', sub: 'Recomendado para profissionais.', meta: '~10h por ciclo', recommended: true },
    { id: 'full', label: 'Full', size: '1000×8', sub: 'Protocolo do livro Woodpecker Method.', meta: '~20h por ciclo' },
  ];
  const selected = 'full';
  return (
    <WpFrame>
      <WpStatusBar />
      <WizHeader step={step} total={total} title={`Novo conjunto · ${flowName}`} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px 24px' }}>
        <div className="wp-eyebrow" style={{ marginBottom: 8 }}>Seu rating</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="wp-mono" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--wp-accent)' }}>1.350</span>
          <span style={{ fontSize: 14, color: 'var(--wp-text-2)' }}>Intermediário</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--wp-text-3)', marginTop: 4 }}>
          Puzzles de <span className="wp-mono">1.150</span> a <span className="wp-mono">1.550</span> · todos os temas táticos
        </div>

        <div className="wp-eyebrow" style={{ marginTop: 24, marginBottom: 10 }}>Protocolo</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {protocols.map((p) => {
            const isSel = p.id === selected;
            return (
              <button key={p.id} className="wp-card" style={{
                textAlign: 'left', padding: '16px 18px', cursor: 'pointer',
                border: isSel ? '1px solid var(--wp-accent)' : '1px solid var(--wp-line-soft)',
                background: 'var(--wp-surface)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                    <span className="wp-display" style={{ fontSize: 18, fontWeight: 600 }}>{p.label}</span>
                    <span className="wp-mono" style={{ fontSize: 14, color: 'var(--wp-text-2)' }}>{p.size}</span>
                    {p.recommended && (
                      <span className="wp-mono" style={{
                        fontSize: 10, color: 'var(--wp-accent)',
                        border: '1px solid var(--wp-accent-soft)',
                        padding: '2px 8px', borderRadius: 3, letterSpacing: '0.04em',
                      }}>recomendado</span>
                    )}
                  </div>
                  <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)', whiteSpace: 'nowrap' }}>{p.meta}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--wp-text-2)', marginTop: 6, lineHeight: 1.4 }}>{p.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        <button className="wp-btn wp-btn-primary" style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'serif', fontSize: 16, lineHeight: 1 }}>♟</span> Montar conjunto
        </button>
      </div>
    </WpFrame>
  );
}

// ───────────────────────────────────────────────
// Fluxo 1 — Padrão (1 passo: tamanho)
// (Reusa ScreenWizSize sozinha)
// ───────────────────────────────────────────────
function ScreenWizStandard() {
  return <ScreenWizSize flowName="Padrão" step={1} total={1} />;
}

// ───────────────────────────────────────────────
// Fluxo 2 — Plano de melhoria
// Passo 1: status da última análise (ou em andamento)
// Passo 2: tamanho
// ───────────────────────────────────────────────
function ScreenWizPlanStatus() {
  return (
    <WpFrame>
      <WpStatusBar />
      <WizHeader step={1} total={2} title="Plano de melhoria" />
      <div style={{ flex: 1, padding: '28px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <h2 className="wp-display" style={{ fontSize: 26, fontWeight: 500, margin: 0, lineHeight: 1.15 }}>
          Análise das suas<br />partidas
        </h2>
        <p style={{ fontSize: 13, color: 'var(--wp-text-3)', marginTop: 10, lineHeight: 1.5 }}>
          Identificamos seus padrões fracos para focar o conjunto.
        </p>

        <div className="wp-card" style={{ padding: 18, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="wp-eyebrow">Última análise</span>
            <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-good)' }}>● completa</span>
          </div>
          <div className="wp-mono" style={{ fontSize: 22, fontWeight: 500, marginTop: 10 }}>há 6 dias</div>
          <div style={{ fontSize: 12, color: 'var(--wp-text-3)', marginTop: 4 }}>
            <span className="wp-mono">50 partidas</span> · <span className="wp-mono">@rafa_silva</span>
          </div>

          <div className="wp-divider" style={{ margin: '16px 0' }} />

          <div className="wp-eyebrow" style={{ marginBottom: 10 }}>Pontos fracos detectados</div>
          {[
            { t: 'Final de torre', v: 38, count: 9 },
            { t: 'Sacrifício posicional', v: 54, count: 6 },
            { t: 'Mate em 3', v: 61, count: 4 },
          ].map((p) => (
            <div key={p.t} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{p.t}</span>
                <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>{p.v}% · {p.count} erros</span>
              </div>
              <div style={{ height: 2, background: 'var(--wp-surface-2)' }}>
                <div style={{ height: '100%', width: `${p.v}%`, background: p.v < 50 ? 'var(--wp-bad)' : 'var(--wp-warn)' }} />
              </div>
            </div>
          ))}
        </div>

        <button className="wp-btn" style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
          <WpIcon name="sparkle" size={13} /> Atualizar análise
        </button>

        <div style={{ marginTop: 'auto' }}>
          <button className="wp-btn wp-btn-primary" style={{ width: '100%', padding: '15px' }}>Avançar</button>
        </div>
      </div>
    </WpFrame>
  );
}

function ScreenWizPlanAnalyzing({ progress = 23, total = 50 }) {
  return (
    <WpFrame>
      <WpStatusBar />
      <WizHeader step={1} total={2} title="Plano de melhoria" />
      <div style={{ flex: 1, padding: '28px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <h2 className="wp-display" style={{ fontSize: 26, fontWeight: 500, margin: 0, lineHeight: 1.15 }}>
          Analisando<br />partidas…
        </h2>
        <p style={{ fontSize: 13, color: 'var(--wp-text-3)', marginTop: 10, lineHeight: 1.5 }}>
          Isso costuma levar 1–2 minutos.
        </p>

        <div style={{ marginTop: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span className="wp-mono wp-pulse" style={{ fontSize: 13, color: 'var(--wp-accent)' }}>analisando partida {progress} de {total}</span>
            <span className="wp-mono" style={{ fontSize: 13, color: 'var(--wp-text-2)' }}>{Math.round((progress / total) * 100)}%</span>
          </div>
          <div style={{ height: 2, background: 'var(--wp-line-soft)', overflow: 'hidden', borderRadius: 1 }}>
            <div style={{ height: '100%', width: `${(progress / total) * 100}%`, background: 'var(--wp-accent)', transition: 'width .4s' }} />
          </div>
        </div>

        <div className="wp-card" style={{ padding: 16, marginTop: 28 }}>
          <div className="wp-eyebrow" style={{ marginBottom: 12 }}>Detectado até agora</div>
          {[
            { t: 'Final de torre', v: 7 },
            { t: 'Sacrifício', v: 4 },
            { t: 'Mate em 3', v: 2 },
          ].map((p) => (
            <div key={p.t} className="wp-row" style={{ padding: '8px 0' }}>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--wp-text-2)' }}>{p.t}</span>
              <span className="wp-mono" style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>{p.v} erros</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="wp-btn" style={{ width: '100%', color: 'var(--wp-text-3)' }} disabled>
            Aguarde a análise
          </button>
        </div>
      </div>
    </WpFrame>
  );
}

// ───────────────────────────────────────────────
// Fluxo 3 — vs. Adversário
// Passo 1: escolher adversário (top + input)
// Passo 2: análise das partidas dele (progresso)
// Passo 3: tamanho
// ───────────────────────────────────────────────
function ScreenWizFoeChoose() {
  const top = [
    { handle: 'magnus_jr', games: 14, score: '4-9-1', last: 'há 2d' },
    { handle: 'pedro_xadrez', games: 9, score: '3-5-1', last: 'há 5d' },
    { handle: 'jane_doe_chess', games: 7, score: '2-4-1', last: 'há 12d' },
    { handle: 'ferreira_99', games: 6, score: '1-4-1', last: 'há 3sem' },
  ];
  return (
    <WpFrame>
      <WpStatusBar />
      <WizHeader step={1} total={3} title="vs. Adversário" />
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 24px 24px' }}>
        <h2 className="wp-display" style={{ fontSize: 26, fontWeight: 500, margin: 0, lineHeight: 1.15 }}>
          Quem você quer<br />vencer?
        </h2>
        <p style={{ fontSize: 13, color: 'var(--wp-text-3)', marginTop: 10, lineHeight: 1.5 }}>
          Vamos extrair aberturas e padrões dele para gerar puzzles específicos.
        </p>

        <div className="wp-eyebrow" style={{ marginTop: 28, marginBottom: 10 }}>Top adversários · chess.com</div>
        <div className="wp-card" style={{ overflow: 'hidden' }}>
          {top.map((o, i) => (
            <button key={o.handle} style={{
              width: '100%', textAlign: 'left', padding: '14px 16px', cursor: 'pointer',
              background: i === 0 ? 'var(--wp-accent-tint)' : 'transparent',
              border: 0, borderBottom: i < top.length - 1 ? '1px solid var(--wp-line-soft)' : 0,
              borderLeft: i === 0 ? '2px solid var(--wp-accent)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 12, color: 'var(--wp-text)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 16, background: 'var(--wp-surface-3)',
                color: 'var(--wp-text-2)', fontFamily: 'var(--font-mono)', fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{o.handle[0].toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="wp-mono" style={{ fontSize: 13, fontWeight: 500 }}>@{o.handle}</div>
                <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)', marginTop: 2 }}>
                  {o.games} jogos · {o.score} · {o.last}
                </div>
              </div>
              <WpIcon name="chevron_right" size={14} color="var(--wp-text-4)" />
            </button>
          ))}
        </div>

        <div className="wp-eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Ou outro adversário</div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--wp-text-4)', fontFamily: 'var(--font-mono)', fontSize: 15 }}>@</span>
          <input className="wp-input" placeholder="username chess.com" style={{ paddingLeft: 32, fontFamily: 'var(--font-mono)' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--wp-text-4)', marginTop: 6 }}>
          Buscaremos as últimas 30 partidas dele.
        </div>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        <button className="wp-btn wp-btn-primary" style={{ width: '100%', padding: '15px' }}>Avançar</button>
      </div>
    </WpFrame>
  );
}

function ScreenWizFoeAnalyzing({ progress = 18, total = 30 }) {
  return (
    <WpFrame>
      <WpStatusBar />
      <WizHeader step={2} total={3} title="vs. Adversário" />
      <div style={{ flex: 1, padding: '28px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <h2 className="wp-display" style={{ fontSize: 26, fontWeight: 500, margin: 0, lineHeight: 1.15 }}>
          Estudando<br /><span className="wp-mono" style={{ fontSize: 22, color: 'var(--wp-accent)', letterSpacing: '-0.02em' }}>@magnus_jr</span>
        </h2>

        <div style={{ marginTop: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span className="wp-mono wp-pulse" style={{ fontSize: 13, color: 'var(--wp-accent)' }}>analisando partida {progress} de {total}</span>
            <span className="wp-mono" style={{ fontSize: 13, color: 'var(--wp-text-2)' }}>{Math.round((progress / total) * 100)}%</span>
          </div>
          <div style={{ height: 2, background: 'var(--wp-line-soft)', overflow: 'hidden', borderRadius: 1 }}>
            <div style={{ height: '100%', width: `${(progress / total) * 100}%`, background: 'var(--wp-accent)' }} />
          </div>
        </div>

        <div className="wp-card" style={{ padding: 16, marginTop: 28 }}>
          <div className="wp-eyebrow" style={{ marginBottom: 12 }}>Padrões detectados</div>
          {[
            { t: 'Siciliana Najdorf · brancas', v: '8 jogos' },
            { t: 'Defesa Caro-Kann · pretas', v: '5 jogos' },
            { t: 'Sacrifício em h6/h3', v: '4 vezes' },
            { t: 'Trocas em casa central', v: '3 vezes' },
          ].map((p) => (
            <div key={p.t} className="wp-row" style={{ padding: '8px 0' }}>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--wp-text-2)' }}>{p.t}</span>
              <span className="wp-mono" style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>{p.v}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="wp-btn" style={{ width: '100%', color: 'var(--wp-text-3)' }} disabled>
            Aguarde a análise
          </button>
        </div>
      </div>
    </WpFrame>
  );
}

function ScreenWizFoeReady() {
  return (
    <WpFrame>
      <WpStatusBar />
      <WizHeader step={2} total={3} title="vs. Adversário" />
      <div style={{ flex: 1, padding: '28px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <h2 className="wp-display" style={{ fontSize: 26, fontWeight: 500, margin: 0, lineHeight: 1.15 }}>
          Análise pronta
        </h2>
        <p style={{ fontSize: 13, color: 'var(--wp-text-3)', marginTop: 10 }}>
          <span className="wp-mono">@magnus_jr</span> · 30 partidas analisadas
        </p>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--wp-line-soft)' }}>
          <div style={{ background: 'var(--wp-bg)', padding: '18px 16px' }}>
            <div className="wp-eyebrow" style={{ marginBottom: 8 }}>Aberturas</div>
            <div className="wp-mono" style={{ fontSize: 22, fontWeight: 500 }}>4</div>
            <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>frequentes</div>
          </div>
          <div style={{ background: 'var(--wp-bg)', padding: '18px 16px' }}>
            <div className="wp-eyebrow" style={{ marginBottom: 8 }}>Padrões</div>
            <div className="wp-mono" style={{ fontSize: 22, fontWeight: 500 }}>11</div>
            <div className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-3)' }}>recorrentes</div>
          </div>
        </div>

        <div className="wp-card" style={{ padding: 16, marginTop: 12 }}>
          <div className="wp-eyebrow" style={{ marginBottom: 12 }}>Foco do conjunto</div>
          {[
            'Sacrifício em h6/h3',
            'Finais de torre',
            'Trocas em casa central',
            'Najdorf — pretas',
          ].map((t, i) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-text-4)', width: 20 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: 13 }}>{t}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="wp-btn wp-btn-primary" style={{ width: '100%', padding: '15px' }}>Avançar — escolher tamanho</button>
        </div>
      </div>
    </WpFrame>
  );
}

// Wrappers nomeados para o canvas
function ScreenWizPlanSize() { return <ScreenWizSize flowName="Plano de melhoria" step={2} total={2} />; }
function ScreenWizFoeSize() { return <ScreenWizSize flowName="vs. @magnus_jr" step={3} total={3} />; }

Object.assign(window, {
  ScreenWizStandard,
  ScreenWizPlanStatus, ScreenWizPlanAnalyzing, ScreenWizPlanSize,
  ScreenWizFoeChoose, ScreenWizFoeAnalyzing, ScreenWizFoeReady, ScreenWizFoeSize,
  ScreenWizSize,
});
