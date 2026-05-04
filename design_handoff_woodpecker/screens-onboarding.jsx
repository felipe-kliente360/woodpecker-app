/* eslint-disable */
// Woodpecker — Onboarding screens (calibração)

function ScreenWelcome() {
  const variant = (typeof window !== 'undefined' && window.__wpWelcomeVariant) || 'method';
  const COPIES = {
    method: {
      eyebrow: 'O método',
      title: <React.Fragment>Repetir<br/>até reconhecer.<br/><span style={{ color: 'var(--wp-accent)' }}>Reconhecer</span><br/><span style={{ color: 'var(--wp-text-3)' }}>até dominar.</span></React.Fragment>,
      sub: 'Cada ciclo é o mesmo conjunto, resolvido mais rápido. Constância é o sinal — não a primeira solução.',
    },
    speed: {
      eyebrow: 'Método Woodpecker',
      title: <React.Fragment>O mesmo conjunto.<br/><span style={{ color: 'var(--wp-accent)' }}>Cinco vezes</span><br/>mais rápido.</React.Fragment>,
      sub: 'Resolva 500 puzzles. Repita até virar reflexo. Em 6 ciclos, você enxerga em segundos o que antes levava minutos.',
    },
    rating: {
      eyebrow: 'Para quem joga sério',
      title: <React.Fragment>Seu rating<br/>não cresce<br/><span style={{ color: 'var(--wp-accent)' }}>por sorte.</span></React.Fragment>,
      sub: 'Treino tático deliberado, com ciclos mensuráveis. O método que MGs usam para sair do platô — agora cronometrado, comparado, persistente.',
    },
    discipline: {
      eyebrow: 'Prática deliberada',
      title: <React.Fragment>Padrões<br/>antes de<br/><span style={{ color: 'var(--wp-accent)' }}>cálculo.</span></React.Fragment>,
      sub: 'Forks, pinos, sacrifícios. O que separa um clube de um mestre é reconhecer o tema em três segundos, não em três minutos.',
    },
    minimal: {
      eyebrow: 'Woodpecker',
      title: <React.Fragment>Treine como<br/>quem estuda.<br/><span style={{ color: 'var(--wp-accent)' }}>Evolua</span> como<br/>quem mede.</React.Fragment>,
      sub: 'Conjuntos repetíveis. Tempo cronometrado. Comparação entre ciclos. Sem ranking, sem distração — só você contra você de ontem.',
    },
  };
  const copy = COPIES[variant] || COPIES.method;
  return (
    <WpFrame>
      <WpStatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 28px 28px', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <WpMark size={28} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.18em', color: 'var(--wp-text-3)', textTransform: 'uppercase' }}>woodpecker</span>
          </div>
        </div>

        <div>
          <div className="wp-eyebrow" style={{ marginBottom: 16 }}>{copy.eyebrow}</div>
          <h1 className="wp-display" style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.05, margin: 0, color: 'var(--wp-text)', letterSpacing: '-0.025em' }}>
            {copy.title}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--wp-text-2)', lineHeight: 1.5, marginTop: 28, maxWidth: 320 }}>
            {copy.sub}
          </p>
        </div>

        <div>
          <button className="wp-btn wp-btn-primary" style={{ width: '100%', padding: '16px' }}>Começar calibração</button>
          <button className="wp-btn wp-btn-ghost" style={{ width: '100%', marginTop: 8 }}>Já tenho conta</button>
        </div>
      </div>
    </WpFrame>
  );
}

function ScreenCalibrate() {
  return (
    <WpFrame>
      <WpStatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 28px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <button className="wp-btn wp-btn-ghost" style={{ padding: '6px 8px', border: 0 }}>
            <WpIcon name="arrow_left" />
          </button>
          <span className="wp-eyebrow">Passo 1 / 3</span>
        </div>

        <div className="wp-eyebrow" style={{ marginBottom: 14 }}>Calibrar rating</div>
        <h2 className="wp-display" style={{ fontSize: 32, fontWeight: 500, margin: 0, lineHeight: 1.1, color: 'var(--wp-text)' }}>
          Como prefere começar?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--wp-text-3)', marginTop: 12, lineHeight: 1.5 }}>
          Precisamos do seu nível para escolher os puzzles certos.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
          <button className="wp-card" style={{ textAlign: 'left', padding: 20, cursor: 'pointer', border: '1px solid var(--wp-accent)', background: 'var(--wp-accent-tint)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--wp-text)' }}>Conectar chess.com</span>
              <span className="wp-mono" style={{ fontSize: 11, color: 'var(--wp-accent)', letterSpacing: '0.12em' }}>RECOMENDADO</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--wp-text-2)', lineHeight: 1.45 }}>
              Importamos seu rating e suas últimas 50 partidas para sugerir temas de melhoria.
            </div>
          </button>

          <button className="wp-card" style={{ textAlign: 'left', padding: 20, cursor: 'pointer' }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Resolver 30 puzzles</div>
            <div style={{ fontSize: 13, color: 'var(--wp-text-2)', lineHeight: 1.45 }}>
              Calibração offline. Cerca de 12 minutos.
            </div>
          </button>

          <button className="wp-card" style={{ textAlign: 'left', padding: 20, cursor: 'pointer' }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Definir manualmente</div>
            <div style={{ fontSize: 13, color: 'var(--wp-text-2)', lineHeight: 1.45 }}>
              Use o seu rating se já souber o número.
            </div>
          </button>
        </div>

        <div style={{ flex: 1 }} />
      </div>
    </WpFrame>
  );
}

function ScreenCalibrateUsername() {
  return (
    <WpFrame>
      <WpStatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 28px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <button className="wp-btn wp-btn-ghost" style={{ padding: '6px 8px', border: 0 }}>
            <WpIcon name="arrow_left" />
          </button>
          <span className="wp-eyebrow">Passo 2 / 3</span>
        </div>

        <div className="wp-eyebrow" style={{ marginBottom: 14 }}>chess.com</div>
        <h2 className="wp-display" style={{ fontSize: 28, fontWeight: 500, margin: 0, lineHeight: 1.15 }}>
          Qual seu username?
        </h2>

        <div style={{ marginTop: 28 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--wp-text-4)', fontFamily: 'var(--font-mono)', fontSize: 15 }}>@</span>
            <input className="wp-input" defaultValue="rafa_silva" style={{ paddingLeft: 32, fontFamily: 'var(--font-mono)' }} />
          </div>

          <div className="wp-card" style={{ marginTop: 16, padding: 16, background: 'var(--wp-surface)', border: '1px solid var(--wp-line-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--wp-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--wp-accent)' }}>R</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>rafa_silva</div>
                <div style={{ fontSize: 12, color: 'var(--wp-text-3)' }}>Brasil · Rapid 1547</div>
              </div>
              <WpIcon name="check" size={18} color="var(--wp-good)" />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="wp-btn wp-btn-primary" style={{ width: '100%', padding: '16px' }}>Importar e continuar</button>
        </div>
      </div>
    </WpFrame>
  );
}

function ScreenCalibratePuzzles({ progress = 12 }) {
  return (
    <WpFrame>
      <WpStatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 28px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="wp-btn wp-btn-ghost" style={{ padding: '6px 8px', border: 0 }}><WpIcon name="close" /></button>
          <div style={{ textAlign: 'center' }}>
            <div className="wp-eyebrow">Calibração</div>
          </div>
          <span className="wp-mono" style={{ fontSize: 13, color: 'var(--wp-text-2)' }}>{progress}/30</span>
        </div>

        <div style={{ marginTop: 18, height: 2, background: 'var(--wp-line-soft)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(progress/30)*100}%`, background: 'var(--wp-accent)' }} />
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <WpBoard size={314} position={{
            'a8': 'bR', 'd8': 'bQ', 'e8': 'bK', 'h8': 'bR',
            'a7': 'bP', 'b7': 'bP', 'c7': 'bP', 'f7': 'bP', 'g7': 'bP', 'h7': 'bP',
            'd6': 'bP', 'f6': 'bN',
            'e4': 'wP',
            'c3': 'wN', 'f3': 'wN',
            'a2': 'wP', 'b2': 'wP', 'c2': 'wP', 'd2': 'wP', 'f2': 'wP', 'g2': 'wP', 'h2': 'wP',
            'a1': 'wR', 'c1': 'wB', 'd1': 'wQ', 'e1': 'wK', 'f1': 'wB', 'h1': 'wR',
          }} />
          <div style={{ marginTop: 18, fontSize: 13, color: 'var(--wp-text-2)' }}>
            Brancas jogam · <span className="wp-mono" style={{ color: 'var(--wp-text-3)' }}>~12s restantes</span>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
          <button className="wp-btn" style={{ flex: 1 }}>Não sei</button>
          <button className="wp-btn wp-btn-primary" style={{ flex: 2 }}>Marcar lance</button>
        </div>
      </div>
    </WpFrame>
  );
}

function ScreenCalibrateResult() {
  return (
    <WpFrame>
      <WpStatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 28px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span className="wp-eyebrow">Passo 3 / 3</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="wp-eyebrow" style={{ marginBottom: 18 }}>Seu rating de calibração</div>
          <div className="wp-bignum" style={{ color: 'var(--wp-accent)' }}>1547</div>
          <div style={{ fontSize: 14, color: 'var(--wp-text-2)', marginTop: 14, lineHeight: 1.5 }}>
            Vamos sugerir puzzles entre <span className="wp-mono" style={{ color: 'var(--wp-text)' }}>1450–1620</span>. Você poderá ajustar a qualquer momento.
          </div>

          <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="wp-card" style={{ padding: 14 }}>
              <div className="wp-eyebrow" style={{ marginBottom: 8 }}>Acertos</div>
              <div className="wp-mono" style={{ fontSize: 22, fontWeight: 500 }}>22<span style={{ color: 'var(--wp-text-3)', fontSize: 14 }}> / 30</span></div>
            </div>
            <div className="wp-card" style={{ padding: 14 }}>
              <div className="wp-eyebrow" style={{ marginBottom: 8 }}>Tempo médio</div>
              <div className="wp-mono" style={{ fontSize: 22, fontWeight: 500 }}>00:24</div>
            </div>
          </div>
        </div>

        <button className="wp-btn wp-btn-primary" style={{ width: '100%', padding: '16px' }}>Criar primeiro conjunto</button>
      </div>
    </WpFrame>
  );
}

// Mark / logo — woodpecker silhouette using primitives only (vertical hashes + diamond)
function WpMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="2" height="12" fill="var(--wp-accent)" />
      <rect x="6" y="3" width="2" height="18" fill="var(--wp-accent)" opacity="0.7" />
      <rect x="10" y="6" width="2" height="12" fill="var(--wp-accent)" opacity="0.5" />
      <rect x="14" y="9" width="2" height="6" fill="var(--wp-text-2)" opacity="0.6" />
      <rect x="18" y="11" width="2" height="2" fill="var(--wp-text-2)" opacity="0.4" />
    </svg>
  );
}

Object.assign(window, { ScreenWelcome, ScreenCalibrate, ScreenCalibrateUsername, ScreenCalibratePuzzles, ScreenCalibrateResult, WpMark });
