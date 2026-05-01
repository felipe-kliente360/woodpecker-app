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
- Suíte 44/44 `node:test` zero-deps.

### Análise tática (chess.com)
- **Modo 1 — Chances perdidas** (Role A dominante, sem padding) ✅ `62fe808`
- **Modo 2 — Análise de adversário** (B+C com C ponderado 2×) ✅ `62fe808`
- **Modo 3 — Plano completo** (default) ✅ `62fe808`
- Segmented control "Plano para EU · MELHORAR / VENCER UM ADVERSÁRIO"
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

### Arquitetura em camadas (refatoração 5+1 fases)
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

O Woodpecker original é uma sessão intensa, ininterrupta. Nosso UX
hoje é gentil demais.

- **Pace Coach**: indicador ao vivo no timer "+12s vs ciclo 1" durante
  o puzzle. Hoje só pós-puzzle. ~2h.
- **Speedrun Mode**: fullscreen, board e timer gigantes, sem sidebar.
  Esc pede confirmação dupla. ~3h.
- **No-pause Mode**: toggle por conjunto. Sem pause até completar bloco
  ou desistir formal (com penalidade visual no histórico). ~2h.
- **Bloco-de-25**: cada ciclo dividido em blocos de 25/50/100 com
  micro-cerimônia entre eles ("respira, água, segue"). ~3h.

---

## Eixo 3 — Fluência de padrão (objetivo profundo do método)

O livro insiste: o objetivo é intuição imediata, não cálculo.

- **Marcador "Vi de cara"**: após acerto, botão opcional pra marcar
  "saquei imediatamente". Métrica nova: % de reconhecimento
  instantâneo, separada de tempo. ~2h.
- **Pattern Flash**: modo paralelo. Mostra posição por 2s → tela em
  branco → input do lance. Calibra intuição sem cálculo. ~5h.
- **Heatmap por tema**: gráfico mostrando qual tema melhorou mais
  entre ciclos. ~3h.
- **Sparkline por puzzle**: na lista de teimosos, linha do tempo nele
  em cada ciclo. Diferencia "ficou rápido" de "decorou". ~2h.

---

## Eixo 4 — Foto do progresso (data → narrativa)

- **Calendário de streak**: heatmap estilo GitHub de ciclos por dia.
  Aciona vontade de manter o tracinho diário. ~3h.
- **Year-in-review automático**: a cada 365 dias do 1º ciclo, gera
  post-mortem visual. ~5h.
- **Comparador de ciclos lado a lado**: selecionar 2 ciclos do mesmo
  conjunto e ver as 5 maiores melhorias e 5 piorias por puzzle. ~3h.
- **Personal Worst**: lista dos 10 puzzles em que mais gastou tempo
  agregado. ~2h.

---

## Eixo 5 — Estrutura ritual

- **Reflexão a cada 50**: pop-up leve a cada 50 puzzles dentro de um
  ciclo: "1 frase: o que você notou?" (opt-out). ~3h.
- **Ritual de início de ciclo**: tela bridge entre conjuntos. Mostra
  histórico, qual ciclo começa, meta de tempo, quote do livro. ~2h.
- **"Aceitação do erro"**: em ciclo 5+, mensagens diferentes — "errar
  nessa altura é normal — está indo mais rápido". ~1h.

---

## Eixo 6 — Experimentos criativos (alto risco, alta recompensa)

- **Blindfold mode**: posição visível por N segundos, depois apenas
  notação textual + lista de peças. Lance digitado. Faixa expert. ~6h.
- **Reverse mode**: começa pela posição final (mate), volta um lance,
  usuário precisa encontrar o penúltimo. ~5h.
- **Visão por dica**: após 3 erros no mesmo puzzle ao longo de ciclos,
  app sussurra "olhe pra peça em e5". Não dá resposta, dá foco. ~3h.
- **Modo monge**: tela 100% preta, só timer texto. Sem badges, sem
  rating, sem temas — só posição+timer. ~2h.
- **Companion áudio (opt-in)**: tique de relógio leve durante puzzle.
  Sucesso = acorde. Erro = thud. ~3h.
- **"Aposte em si mesmo"**: antes do ciclo, usuário estima seu tempo
  total. Depois compara. Calibra autopercepção. ~2h.

---

## Eixo 7 — Polimento contínuo

- **Atalhos Vim-style desktop**: h/j/k/l + Enter para navegar tudo
  sem mouse. Power-user.
- **Compartilhar imagem do ciclo**: botão exporta resultado como PNG
  via canvas.
- **Onboarding interativo**: primeira visita guiada (criar conjunto
  pequeno, fazer 3 puzzles, ver evolução). Hoje temos o 3-card chooser
  estático — falta o passo-a-passo.
- **Dark/light auto**: seguir `prefers-color-scheme`. Hoje toggle
  manual.

---

## Próximas ondas sugeridas (ordem de execução)

### Onda A — Reforço da pressão Woodpecker (~6-8h)
1. Pace Coach — 2h
2. Marcador "Vi de cara" — 2h
3. Ritual de início de ciclo — 2h
4. "Aceitação do erro" (mensagens contextuais ciclo 5+) — 1h

### Onda B — Foto do progresso (~6-8h)
1. Calendário de streak — 3h
2. Sparkline por puzzle (em teimosos) — 2h
3. Comparador de ciclos lado a lado — 3h

### Onda C — Análise: derivações Modo 2 (~6-8h)
1. Modo 2 v2 — janela 2-3 plies — 2h
2. Briefing pré-jogo — 3h
3. Histórico cabeça-a-cabeça — 3h

### Onda D — Experimentos (escolher por afinidade)
1. Pattern Flash mode — 5h
2. "Aposte em si mesmo" — 2h
3. Modo monge — 2h
4. Heatmap por tema — 3h

### Backlog longo
- Pós-mortem pareado
- Reflexão a cada 50
- Year-in-review
- Personal Worst
- Blindfold / Reverse / Visão por dica
- Companion áudio
- Atalhos Vim
- Compartilhar imagem
- Onboarding interativo
- Dark/light auto
- Rivalry mode
- Speedrun Mode + No-pause Mode + Bloco-de-25 (toda a Eixo 2 que sobrou)

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
