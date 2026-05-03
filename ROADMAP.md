# Roadmap — Woodpecker

Registro vivo de ideias para evolução do app, organizadas por afinidade
e por prioridade percebida. Não é compromisso de entrega — é mapa
estratégico. Itens concluídos saem dos eixos e ficam na seção
"Concluído" com referência ao commit.

---

## Concluído

### Núcleo do método
- Ciclos com baseline + halving + fadiga + modo espelho.
- Calibração por brackets de 200 pts.
- Persistência centralizada em `WP.Store` + chaves em `WP.Chaves`.
- Domain puro testável (`src/domain/{rating,srs,ciclo,puzzle}.js`).
- Hooks customizados (`useJogoPuzzle`, `useCriarConjunto`, `useTimer*`,
  `useKeyboardShortcuts`).
- Suíte 48/48 `node:test` zero-deps.

### Análise tática (chess.com)
- **Modo 1 — Chances perdidas** (Role A dominante, sem padding) ✅ `62fe808`
- **Modo 2 — Análise de adversário** (B+C com C ponderado 2×) ✅ `62fe808`
- **Modo 3 — Plano completo** (default) ✅ `62fe808`
- Segmented control "Plano para MELHORAR MEU JOGO / VENCER UM ADVERSÁRIO"
  acima do input ✅ `c2ce8da`
- Cobertura prévia (`peekCoverage`) ✅
- Wake Lock durante análise ✅
- Contagem real de puzzles por tema ✅
- Histórico de análises (timeline) ✅
- Cache FEN→eval em IndexedDB ✅
- Stockfish local (`lib/stockfish.{js,wasm}` same-origin) com fallback CDN ✅ `e600773`
- Clamp `suggested_rating` no teto/piso do banco (GMs / contas low) ✅ `35d6d95`

### Performance da análise
- MultiPV 2 → 1 ✅ `7369e7e`
- Skip primeiros 12 plies (abertura) ✅ `7369e7e`
- Depth 14 → 12 ✅ `7369e7e`
- Two-pass: shallow scan (depth 8) + deep nos candidatos (depth 12) ✅ `7369e7e`
- Skip opp moves não em contexto de blunder ✅ `7369e7e` (absorvido no two-pass)
- **Resultado**: ~10 min → ~2-3 min para 30 partidas (4-5×)

### Identidade visual e UX
- Logo SVG inline (knight dourado + strike vermelho) + favicon ✅ `1ae9613`
- Tipografia: classes `.num` e `.num-display` com tabular-nums + lining
  em ratings/timers/contagens ✅ `0322023`
- Tom de voz: 5 princípios + glossário canônico em `CLAUDE.md` +
  auditoria de 7 strings (acerto factual, sem "Correto!", longo > 60s,
  halving sem emoji, etc.) ✅ `0d3f7c0`
- Onboarding 3-card chooser na primeira visita (rating / calibrar /
  username) ✅ `422583a`
- Smith/Tikkanen presets (Mini 100×6 / Reduzido 300×7 / Standard 500×7
  / Full 1000×8) na TelaCriar single-page ✅ `12e5a1e`
- `.tela-container` (600/720/460px) substitui 6 larguras hardcoded ✅ `da6bef4`
- Contraste WCAG AA em ambas as paletas (todas 18 cores passam AA;
  texto principal AAA) ✅ `3d8a73f`
- System font stacks via `--font-serif` e `--font-mono` (Iowan Old
  Style, SF Mono, Cascadia, Liberation, etc.) ✅ `3d8a73f`
- Focus-visible para a11y de teclado ✅ `3d8a73f`
- Dark/light segue `prefers-color-scheme` na primeira visita ✅ `a029581`

### Fluência de padrão (Eixo 3)
- Marcador "Vi de cara" — toggle ☆/★ no acerto, métrica
  `visao_instantanea` separada de tempo ✅ `a029581`
- Sparkline por puzzle (em LinhaTeimoso) ✅ `1ebb561`
- Heatmap por tema — tabela tema×ciclo com taxa por célula
  (verde/gold/vermelho) ✅ `f56434b`
- **Pattern Flash mode** — modo paralelo de reconhecimento instantâneo
  com setup (conjunto/tempo/quantidade) e estado machine ✅ `00fd7ee`

### Foto do progresso (Eixo 4)
- Calendário de streak (heatmap GitHub-style 84 dias) ✅ `1ebb561`
- Personal Worst (top 10 puzzles por tempo total agregado) ✅ `1ebb561`
- Comparador de ciclos lado a lado ✅ `f56434b`
- Year-in-review automático (>= 365 dias do 1º ciclo) ✅ `f56434b`

### Estrutura ritual (Eixo 5)
- Ritual de início de ciclo — overlay modal pra ciclo > 1 com
  baseline + meta + halving + quote ✅ `4cca480`
- Reflexão a cada 50 — modal automático com textarea opcional;
  reflexões persistem em `ciclo.reflexoes` ✅ `4cca480`
- "Aceitação do erro" — mensagem contextual em ciclo 5+ ✅ `a029581`

### Experimentos (Eixo 6 — selecionados)
- **Modo monge** — UI minimalista (só board + timer texto + ações
  essenciais) ✅ `a11e44e`
- **Companion áudio** (opt-in) — Web Audio API, acerto/erro com tons
  sintetizados via OscillatorNode ✅ `a11e44e`

### Polimento (Eixo 7)
- Atalhos numéricos 1-6 + ? help overlay + Esc ✅ `3cccb79`
- Compartilhar PNG do resumo do ciclo (Canvas API) ✅ `3cccb79`
- Onboarding nudges contextual baseado em progresso (0/1/2-4 ciclos) ✅ `3cccb79`

### Arquitetura em camadas (refatoração 5+1+1 fases)
- `src/data/{chaves,store}.js` — única camada com `localStorage` ✅ Fase 1
- `src/domain/*.js` — lógica pura, testável em Node ✅ Fase 2
- `src/hooks/*.js` — hooks consomem domain + data ✅ Fase 3a
- `useJogoPuzzle` — TelaTreinar reduzida de 654 → 301 linhas ✅ Fase 3b
- Componentes JSX externos (`Promocao.jsx`, `HistoricoAnalises.jsx`) ✅ Fase 3c
- `useCriarConjunto` ✅ Fase 4
- `tests/` com node:test ✅ Fase 5
- CSS extraído em `src/styles/{tokens,base,components}.css` ✅ Fase 7

### Outros
- Rating unificado (calibração + performance + análise chess.com com
  pesos por confiança) ✅
- SRS leve — card "REVISÃO DEVIDA" na TelaInicio ✅
- Princípios mantra em `CLAUDE.md` (5 perguntas pré-merge) ✅

---

## Eixo 1 — Análise: derivações futuras

### Modo 2 v2 — janela estendida (2-3 plies)
Hoje só lance i+1. v2 inspeciona o PV que o Stockfish já retorna pra
captar combinações curtas e sacrifícios preparatórios que se desenvolvem
em 2-3 plies. Custo: +2h sobre v1.

### Briefing pré-jogo
Modo 2 simplificado, 30 segundos. Não cria conjunto, mostra mental note
("ele cai em garfos · procure cavalo centralizado"). Útil em torneio
ou pareamentos online.

### Pós-mortem pareado
Dado um link de partida específica entre você e oponente X, análise
das 2 perspectivas no mesmo card — o que você perdeu + o que ele
expôs. Fechamento didático.

### Histórico cabeça-a-cabeça
Se você já analisou X antes, mostra evolução das fraquezas dele entre
análises. "João corrigiu fork-blindness, mas continua caindo em
cravadas." Aproveita o `analysis_history` que já temos em IndexedDB.

### Rivalry mode
Trigger automático após cada partida contra username conhecido —
"atualizar análise dele?". Long-running.

---

## Eixo 2 — Pressão e velocidade (fidelidade ao livro)

O Woodpecker original é uma sessão intensa, ininterrupta. Vários
itens dessa frente já entraram via Modo Monge e Reflexão a cada 50;
o que falta é mais agressivo:

- **Pace Coach**: indicador ao vivo no timer "+12s vs ciclo 1" durante
  o puzzle. Hoje só pós-puzzle. ~2h.
- **Speedrun Mode**: fullscreen, board e timer gigantes, sem sidebar.
  Esc pede confirmação dupla. ~3h.
- **No-pause Mode**: toggle por conjunto. Sem pause até completar bloco
  ou desistir formal (com penalidade visual no histórico). ~2h.
- **Bloco-de-25**: cada ciclo dividido em blocos de 25/50/100 com
  micro-cerimônia entre eles ("respira, água, segue"). ~3h.

---

## Eixo 6 — Experimentos restantes

- **Blindfold mode**: posição visível por N segundos, depois apenas
  notação textual + lista de peças. Lance digitado. Faixa expert. ~6h.
  (NB: Pattern Flash já entrega versão "lite" desse conceito.)
- **Reverse mode**: começa pela posição final (mate), volta um lance,
  usuário precisa encontrar o penúltimo. ~5h.
- **Visão por dica**: após 3 erros no mesmo puzzle ao longo de ciclos,
  app sussurra "olhe pra peça em e5". Não dá resposta, dá foco. ~3h.
- **"Aposte em si mesmo"**: antes do ciclo, usuário estima seu tempo
  total. Depois compara. Calibra autopercepção. ~2h.

---

## Próximas ondas sugeridas

### Onda A — Pressão Woodpecker (~7-10h)
1. Pace Coach — 2h
2. Speedrun Mode — 3h
3. No-pause Mode — 2h
4. Bloco-de-25 — 3h

### Onda B — Análise: derivações Modo 2 (~8-10h)
1. Modo 2 v2 — janela 2-3 plies — 2h
2. Briefing pré-jogo — 3h
3. Histórico cabeça-a-cabeça — 3h
4. Pós-mortem pareado — 4h

### Onda C — Experimentos (escolher por afinidade)
1. "Aposte em si mesmo" — 2h
2. Visão por dica — 3h
3. Reverse mode — 5h
4. Blindfold mode — 6h

### Onda D — Long-running
1. Rivalry mode (auto-update análise H2H) — 4-6h

---

## Princípios de seleção

Toda nova feature passa pelas 5 perguntas mantra do `CLAUDE.md` antes
de mergear (domain isolado? persistência via Store? componente
razoável? teste do domain? cabe em arquivo único?). Antes disso, passa
também por:

1. **Tem fidelidade ao método ou abre exploração intencional?** Não
   adicionar feature genérica de chess training se não respeita a
   filosofia Woodpecker (repetição massiva, intuição, velocidade).
2. **Reaproveita pipeline existente?** Modos 1/2/3 são exemplo: zero
   código novo de Stockfish, zero novo classificador. Quando feature
   exige nova engine, repensar prioridade.
3. **Custo cognitivo na UI é proporcional ao ganho?** Speedrun e Modo
   monge são opt-in para evitar inflar a UI default.
