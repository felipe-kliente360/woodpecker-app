/* eslint-disable */
// Woodpecker — UI primitives (chessboard, tabbar, statusbar, icons)

const wpBoardSvg = (size, opts = {}) => {
  // Classic wood board, 8x8
  const cell = size / 8;
  const light = 'var(--wp-board-light)';
  const dark = 'var(--wp-board-dark)';
  const squares = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const isDark = (r + f) % 2 === 1;
      squares.push(
        <rect key={`${r}-${f}`} x={f * cell} y={r * cell} width={cell} height={cell}
          fill={isDark ? dark : light} />
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', borderRadius: 2 }}>
      {squares}
      {opts.highlight && opts.highlight.map(([f, r], i) => (
        <rect key={`h-${i}`} x={f * cell} y={r * cell} width={cell} height={cell}
          fill="oklch(0.72 0.13 55)" opacity="0.32" />
      ))}
      {opts.lastMove && opts.lastMove.map(([f, r], i) => (
        <rect key={`lm-${i}`} x={f * cell} y={r * cell} width={cell} height={cell}
          fill="oklch(0.78 0.12 80)" opacity="0.22" />
      ))}
    </svg>
  );
};

// Simple piece glyphs using Unicode chess symbols (works without assets)
// Coords: file 0..7 = a..h, rank 0..7 = 8..1 (top-down)
function WpPiece({ piece, x, y, size }) {
  // piece: 'wK','bN', etc.
  // Always use SOLID-FILLED glyphs (the "black" Unicode set) for both colors,
  // and tint by side. White pieces get a thin dark outline so they read on
  // light squares.
  const solid = {
    K: '\u265A', Q: '\u265B', R: '\u265C', B: '\u265D', N: '\u265E', P: '\u265F',
  };
  const isWhite = piece[0] === 'w';
  const ch = solid[piece[1]];
  return (
    <text
      x={x + size / 2}
      y={y + size / 2}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={size * 0.92}
      fill={isWhite ? '#f5f1e8' : '#171210'}
      stroke={isWhite ? '#171210' : 'transparent'}
      strokeWidth={isWhite ? 0.6 : 0}
      style={{ fontFamily: 'serif', userSelect: 'none', paintOrder: 'stroke' }}
    >{ch}</text>
  );
}

// Full board with pieces — accepts a position dict { 'e4': 'wK', ... }
function WpBoard({ size = 320, position = {}, lastMove = null, highlight = null, flipped = false, showCoords = true }) {
  const cell = size / 8;
  const files = 'abcdefgh'.split('');
  const ranks = [8,7,6,5,4,3,2,1];
  const fileOf = (sq) => files.indexOf(sq[0]);
  const rankOf = (sq) => 8 - parseInt(sq[1], 10);
  const sqToXY = (sq) => {
    const f = fileOf(sq), r = rankOf(sq);
    return flipped
      ? { x: (7 - f) * cell, y: (7 - r) * cell }
      : { x: f * cell, y: r * cell };
  };
  const squares = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const isDark = (r + f) % 2 === 1;
      squares.push(
        <rect key={`${r}-${f}`} x={f * cell} y={r * cell} width={cell} height={cell}
          fill={isDark ? 'var(--wp-board-dark)' : 'var(--wp-board-light)'} />
      );
    }
  }
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.4), 0 0 0 1px var(--wp-board-edge)' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        {squares}
        {lastMove && lastMove.map((sq, i) => {
          const { x, y } = sqToXY(sq);
          return <rect key={`lm-${i}`} x={x} y={y} width={cell} height={cell} fill="oklch(0.78 0.12 80)" opacity="0.30" />;
        })}
        {highlight && highlight.map((sq, i) => {
          const { x, y } = sqToXY(sq);
          return <rect key={`h-${i}`} x={x} y={y} width={cell} height={cell} fill="oklch(0.72 0.13 55)" opacity="0.40" />;
        })}
        {Object.entries(position).map(([sq, piece]) => {
          const { x, y } = sqToXY(sq);
          return <WpPiece key={sq} piece={piece} x={x} y={y} size={cell} />;
        })}
        {showCoords && (
          <g style={{ pointerEvents: 'none' }}>
            {ranks.map((rk, i) => {
              const r = flipped ? 7 - i : i;
              const isDarkSq = (r + 0) % 2 === 1;
              return (
                <text key={`rk-${rk}`} x={3} y={i * cell + 11}
                  fontSize={9} fontFamily="var(--font-mono)"
                  fill={isDarkSq ? 'var(--wp-board-light)' : 'var(--wp-board-dark)'}
                  opacity="0.7">{rk}</text>
              );
            })}
            {files.map((fl, i) => {
              const f = flipped ? 7 - i : i;
              const isDarkSq = (7 + f) % 2 === 1;
              return (
                <text key={`fl-${fl}`} x={i * cell + cell - 9} y={size - 4}
                  fontSize={9} fontFamily="var(--font-mono)"
                  fill={isDarkSq ? 'var(--wp-board-light)' : 'var(--wp-board-dark)'}
                  opacity="0.7">{fl}</text>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}

// Status bar (mock iOS)
function WpStatusBar({ time = '9:41', light = false }) {
  const c = light ? 'var(--wp-text)' : 'var(--wp-text)';
  return (
    <div className="wp-statusbar">
      <span>{time}</span>
      <span className="right" style={{ color: c }}>
        {/* signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="3" width="3" height="8" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>
        {/* wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 2c2.5 0 4.7 1 6.4 2.6l-1.5 1.5C11 4.8 9.3 4 7.5 4S4 4.8 2.6 6.1L1.1 4.6C2.8 3 5 2 7.5 2zm0 3c1.5 0 2.9.6 4 1.6L10 8.1c-.7-.7-1.5-1.1-2.5-1.1S5.7 7.4 5 8.1L3.5 6.6C4.6 5.6 6 5 7.5 5zm0 3c.7 0 1.3.3 1.8.7L7.5 10.5 5.7 8.7C6.2 8.3 6.8 8 7.5 8z"/></svg>
        {/* battery */}
        <svg width="25" height="11" viewBox="0 0 25 11" fill="none"><rect x="0.5" y="0.5" width="21" height="10" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="7" rx="1.2" fill="currentColor"/><rect x="22.5" y="3.5" width="1.5" height="4" rx="0.7" fill="currentColor" opacity="0.5"/></svg>
      </span>
    </div>
  );
}

// Tab bar — 4 tabs, active state dot
function WpTabBar({ active = 'home', onTab }) {
  const tabs = [
    { id: 'home', label: 'Treino' },
    { id: 'sets', label: 'Conjuntos' },
    { id: 'stats', label: 'Análises' },
    { id: 'me', label: 'Perfil' },
  ];
  return (
    <div className="wp-tabbar">
      {tabs.map(t => (
        <button key={t.id} className={active === t.id ? 'active' : ''} onClick={() => onTab && onTab(t.id)}>
          <span className="dot" />
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Tally bars — used as woodpecker motif (mark the puzzles done)
function WpTally({ total, done }) {
  return (
    <div className="wp-tally" aria-label={`${done} de ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <i key={i} className={i < done ? 'on' : ''} />
      ))}
    </div>
  );
}

// Sparkline (SVG)
function WpSparkline({ data = [], color = 'var(--wp-accent)', height = 40, fill = false }) {
  if (!data.length) return null;
  const w = 200, h = height, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    pad + (i * (w - pad * 2)) / (data.length - 1),
    h - pad - ((v - min) / range) * (h - pad * 2)
  ]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${d} L${pts[pts.length-1][0]},${h} L${pts[0][0]},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="wp-spark">
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.2" fill={color} />
    </svg>
  );
}

// Bars chart
function WpBars({ data, current = -1 }) {
  const max = Math.max(...data);
  return (
    <div className="wp-bars">
      {data.map((v, i) => (
        <div key={i} className={`b ${i === current ? 'cur' : ''}`} style={{ height: `${(v/max)*100}%` }} />
      ))}
    </div>
  );
}

// Icon — minimal stroke icons
function WpIcon({ name, size = 18, color = 'currentColor', strokeWidth = 1.6 }) {
  const paths = {
    arrow_left: <path d="M11 3L5 9l6 6" />,
    arrow_right: <path d="M7 3l6 6-6 6" />,
    chevron_right: <path d="M7 4l4 4-4 4" />,
    chevron_down: <path d="M4 7l4 4 4-4" />,
    close: <><path d="M3 3l12 12" /><path d="M15 3L3 15" /></>,
    plus: <><path d="M9 3v12" /><path d="M3 9h12" /></>,
    pause: <><path d="M6 3v12" /><path d="M12 3v12" /></>,
    play: <path d="M5 3l9 6-9 6V3z" fill={color} />,
    flag: <><path d="M4 14V3" /><path d="M4 3h8l-2 3 2 3H4" /></>,
    hint: <><path d="M9 13v-1" /><path d="M9 9c0-1.5 1-2 1-3a2 2 0 10-4 0" /><circle cx="9" cy="14.5" r="0.5" fill={color}/></>,
    target: <><circle cx="9" cy="9" r="6" /><circle cx="9" cy="9" r="2.5" /></>,
    flame: <path d="M9 16c-3 0-5-2-5-4.5 0-2 1.5-3 2-4.5C7 9 9 7 8 3c2 1 6 4 6 8.5C14 14 12 16 9 16z" />,
    check: <path d="M3 9l4 4 8-9" />,
    settings: <><circle cx="9" cy="9" r="2" /><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" /></>,
    user: <><circle cx="9" cy="6" r="3" /><path d="M3 16c0-3 3-5 6-5s6 2 6 5" /></>,
    chart: <><path d="M3 15V7" /><path d="M8 15V3" /><path d="M13 15V10" /></>,
    clock: <><circle cx="9" cy="9" r="6.5" /><path d="M9 5v4l2.5 2" /></>,
    swords: <><path d="M3 3l5 5M3 13l5-5M13 3l-5 5M13 13l-5-5" /></>,
    book: <><path d="M3 3h5l1 2v10l-1-1H3z" /><path d="M15 3h-5l-1 2v10l1-1h5z" /></>,
    grid: <><path d="M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM10 10h5v5h-5z" /></>,
    sparkle: <path d="M9 1l1.5 5.5L16 9l-5.5 2.5L9 17l-1.5-5.5L2 9l5.5-2.5L9 1z" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
}

// Mobile frame for design canvas
function WpFrame({ children, height = 760, bg = 'var(--wp-bg)' }) {
  return (
    <div className="wp-app" style={{ width: '100%', height, background: bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

Object.assign(window, {
  WpBoard, WpStatusBar, WpTabBar, WpTally, WpSparkline, WpBars, WpIcon, WpFrame, WpPiece,
});
