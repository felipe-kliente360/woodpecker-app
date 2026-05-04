# Handoff: Woodpecker — Repaginação completa

## Overview

Repaginação completa do app **Woodpecker** (https://woodpecker-app.netlify.app/) — um treinador de táticas de xadrez baseado no Método Woodpecker (mesmo conjunto de puzzles, repetido em ciclos, até que o reconhecimento dos padrões fique automático).

A nova direção é **dark, zen, focada no método**, inspirada em chess.com e lichess mas com identidade própria. Cobre todo o app: onboarding/calibração, home, conjuntos, treino (resolver puzzles, a tela mais usada), análises e perfil.

## About the Design Files

Os arquivos deste pacote são **referências de design feitas em HTML/JSX** — protótipos que mostram a aparência e o comportamento pretendidos, **não código de produção para copiar e colar diretamente**.

A tarefa é **recriar esses designs no codebase do Woodpecker**, usando o framework, as bibliotecas e os padrões já estabelecidos no projeto. Se o codebase ainda não tem framework definido, sugira um (React + Vite ou Next.js são bons defaults para esta natureza de app web mobile-first).

Os arquivos JSX dependem de helpers internos da ferramenta de design (`DesignCanvas`, `DCSection`, `DCArtboard` em `design-canvas.jsx`) que **não devem ser portados** — eles existem só para mostrar todas as telas lado a lado em um canvas. O que importa são as telas em si (componentes `ScreenXxx`).

## Fidelity

**High-fidelity (hifi).** Cores, tipografia, espaçamentos, hierarquia, estados e microcopy estão definidos. O dev deve recriar pixel-perfect, mas adaptando para os componentes do design system existente (botões, inputs, cards) — se já houver. Se não houver, use os tokens em `styles.css` como base do design system.

---

## Design Tokens

Todos definidos como CSS custom properties em `styles.css`. Use `oklch()` para preservar a curva perceptual quando portar.

### Cores — Surfaces (warm charcoals)
| Token | Valor | Uso |
|---|---|---|
| `--wp-bg` | `oklch(0.16 0.008 60)` | Fundo principal do app |
| `--wp-surface` | `oklch(0.20 0.010 60)` | Cards |
| `--wp-surface-2` | `oklch(0.235 0.012 60)` | Cards elevados, hover |
| `--wp-surface-3` | `oklch(0.28 0.014 60)` | Inputs, bordas avatar |
| `--wp-line` | `oklch(0.32 0.012 60)` | Bordas fortes (inputs) |
| `--wp-line-soft` | `oklch(0.26 0.010 60)` | Hairlines (divisores, cards) |

### Cores — Foreground
| Token | Valor | Uso |
|---|---|---|
| `--wp-text` | `oklch(0.94 0.012 80)` | Texto principal (creme quente) |
| `--wp-text-2` | `oklch(0.78 0.012 70)` | Texto secundário |
| `--wp-text-3` | `oklch(0.58 0.014 65)` | Terciário, meta |
| `--wp-text-4` | `oklch(0.42 0.012 60)` | Faint, placeholders |

### Cores — Accent (woodpecker ochre)
| Token | Valor | Uso |
|---|---|---|
| `--wp-accent` | `oklch(0.72 0.13 55)` | Ocre principal — CTAs, ativo, gráficos |
| `--wp-accent-2` | `oklch(0.62 0.14 45)` | Variação mais terracotta |
| `--wp-accent-soft` | `oklch(0.40 0.08 50)` | Bordas dim, ocre apagado |
| `--wp-accent-tint` | `oklch(0.25 0.04 55)` | Wash de fundo (cards selecionados) |

### Cores — Semânticas (terrosas, nunca neon)
| Token | Valor | Uso |
|---|---|---|
| `--wp-good` | `oklch(0.72 0.10 145)` | Acertou, melhoria positiva (verde musgo) |
| `--wp-good-soft` | `oklch(0.30 0.04 145)` | Background de feedback positivo |
| `--wp-bad` | `oklch(0.62 0.14 28)` | Errou, regressão (vermelho terra) |
| `--wp-bad-soft` | `oklch(0.28 0.05 28)` | Background de feedback negativo |
| `--wp-warn` | `oklch(0.78 0.12 80)` | Quase, alerta (ouro velho) |

### Cores — Tabuleiro
| Token | Valor | Uso |
|---|---|---|
| `--wp-board-light` | `oklch(0.78 0.06 75)` | Casas claras (maple) |
| `--wp-board-dark` | `oklch(0.42 0.07 50)` | Casas escuras (walnut) |
| `--wp-board-edge` | `oklch(0.30 0.05 50)` | Borda externa do tabuleiro |

### Tipografia
| Família | Uso | Pesos usados |
|---|---|---|
| **Inter Tight** | UI principal (botões, labels, body) | 400, 500, 600, 700 |
| **JetBrains Mono** | Números, dados, ratings, tempos, usernames | 400, 500, 600 |
| **Fraunces** | Títulos display (headlines de telas, hero) | 500, 600 |

`font-feature-settings: 'tnum'` em todo elemento monospace (números tabulares).
`letter-spacing: -0.005em` em UI; `-0.02em` a `-0.04em` em display/big numbers.

### Escala tipográfica usada
- Display hero (welcome): 38px / line 1.05 / weight 500
- H1 tela (sets, stats, profile): 26–28px / line 1.15 / weight 500 (Fraunces)
- Big number (rating, headline metric): 38–64px mono / weight 500 / `-0.04em`
- Section title em card: 16–18px / weight 600
- Body: 14–15px / line 1.45–1.5
- Meta / caption: 12–13px
- Eyebrow (label superior): 10.5px / 0.14em / uppercase / weight 600
- Mono micro: 10–11px / 0.06–0.18em letter-spacing

### Espaçamento
Sem escala fixa rígida. Múltiplos de 4: **4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40**.
Padding lateral padrão das telas: **24px** (alguns 20px nas telas mais densas como puzzle).
Padding vertical interno em cards: **18–20px**.
Gap entre cards numa lista: **12px**.

### Border radius
| Token | Valor | Uso |
|---|---|---|
| `--radius` | `4px` | Botões, inputs, cards (geral) |
| `--radius-lg` | `8px` | (reservado) |
| Tabuleiro: `2px` | | Casas e wrapper |
| Avatares circulares: `50%` | | |

### Sombras
- Tabuleiro: `0 2px 12px rgba(0,0,0,.4), 0 0 0 1px var(--wp-board-edge)`
- Cards no design canvas: nenhum (apenas borda hairline)

---

## Motivo visual: Tally (woodpecker mark)

Marcas verticais finas (2px de largura, 14–28px de altura) que ecoam o bater do pica-pau. Usadas para:
- Indicar progresso de pacote (10 puzzles = 10 marcas)
- Substituir gamificação visual de progresso

```
||||| ||||| ||
^^^^^         ← 'on' (full opacity, accent color)
      ^^^^^   ← 'on'
            ^^← 'off' (opacity 0.5)
```

Implementação em `styles.css`:
```css
.wp-tally { display: inline-flex; gap: 3px; align-items: flex-end; }
.wp-tally i { display: block; width: 2px; height: 14px; background: currentColor; opacity: 0.5; }
.wp-tally i.on { opacity: 1; }
```

---

## Screens / Views

Quatro seções, **15 telas no total**. Mobile-first, frame de design 390×760. Web responsivo: as telas escalam até desktop com max-width ~440px, centralizadas; ou viram coluna lateral em layout desktop com sidebar de navegação substituindo a tab bar.

### Seção 1 — Onboarding & Calibração

#### 01 · Welcome (`ScreenWelcome`)
- **Propósito:** primeira impressão, comunicar o método em uma frase.
- **Layout:** flex column, padding `40px 28px 28px`, três blocos verticais (header / hero / CTAs).
- **Header:** logo Woodpecker (mark de 4 barras + nome em mono caps).
- **Hero:** display 38px Fraunces em 4 linhas, cor variando: `text` → `accent` (palavra-chave) → `text-3` (linha final).
- **Texto explicativo:** 15px / `text-2` / max-width 320px.
- **CTAs:** primary "Começar calibração" (full-width, ocre), ghost "Já tenho conta".

#### 02 · Calibrate — choose method (`ScreenCalibrate`)
- **Propósito:** escolher entre conectar chess.com, resolver 30 puzzles, ou inserir rating manual.
- **Layout:** header com back + "Passo 1/3", título Fraunces, 3 cards selecionáveis empilhados (gap 12px).
- **Card recomendado** (chess.com): borda `--wp-accent`, fundo `--wp-accent-tint`, badge mono "RECOMENDADO" no canto direito.
- **Cards alternativos:** borda `--wp-line-soft`, fundo `--wp-surface`.
- Cada card: título 15px/600, descrição 13px / `text-2` / line 1.45.

#### 03 · Username (`ScreenCalibrateUsername`)
- **Propósito:** entrar username chess.com e confirmar match.
- **Input:** prefix "@" em mono à esquerda; `padding-left: 32px`; valor em mono.
- **Confirmation card** abaixo: avatar circular (36px) com inicial em mono ocre; nome 14px/600; meta "Brasil · Rapid 1547" em mono 12px / `text-3`; check verde à direita.
- CTA primary "Importar e continuar" no rodapé.

#### 04 · Resolve 30 puzzles (`ScreenCalibratePuzzles`)
- **Propósito:** calibrar via 30 puzzles quando user não tem chess.com.
- **Header:** close, "Calibração" eyebrow centralizado, contador mono `12/30` à direita.
- **Progress bar:** 2px altura, `--wp-line-soft` fundo, `--wp-accent` fill.
- **Tabuleiro:** 314px centralizado, com peças em posição inicial alterada (exemplo de puzzle).
- **Meta abaixo:** "Brancas jogam · ~12s restantes".
- **CTAs:** "Não sei" (flex 1) + "Marcar lance" primary (flex 2).

#### 05 · Calibration result (`ScreenCalibrateResult`)
- **Propósito:** mostrar rating calibrado e explicar próximos passos.
- **Big number:** `1547` em mono 64px ocre.
- **Texto:** explica faixa "1450–1620" e que pode ajustar.
- **Mini-stats** (grid 2 col, gap 12): Acertos `22/30`, Tempo médio `00:24`.
- **CTA:** "Criar primeiro conjunto".

---

### Seção 2 — Home & Conjuntos

#### 01 · Home (`ScreenHome`)
A tela "voltar todo dia". Estrutura vertical scrollável + tab bar.

- **Header (14px 24px 8px):** logo + nome à esquerda, rating mono `1547` + avatar à direita.
- **Streak block:**
  - Eyebrow "CONSTÂNCIA"
  - Big number mono `14` 38px + label "dias seguidos" 13px `text-3`
  - À direita: eyebrow "HOJE" + tempo mono `00:18:42`
- **Calendar week:** grid 7 col, gap 6px. Cada dia = label letra (S T Q Q S S D em 10px `text-4`) + retângulo 28px alto. Dias feitos: `--wp-accent`. Hoje: borda `--wp-accent` mesmo se não feito.
- **Divider** (1px `--wp-line-soft`, margin 24px vertical).
- **Em andamento card:**
  - Título conjunto + subtítulo "Ciclo 2 de 5 · pacote 3"
  - Badge "ATIVO" mono ocre à direita
  - Progress bar com `34/100` mono à esquerda, fill ocre
  - Linha de comparação ciclos: "Ciclo 1 14:32 · Ciclo 2 04:12 · −71%" (delta em verde)
  - CTA primary full-width
- **Outros conjuntos** (lista de rows com border-bottom hairline):
  - Cada row: índice mono (`01`, `02`...) | título + descrição | tally mark | chevron
  - Última row é "+ Novo conjunto" em estilo placeholder (`text-3`)
- **Tab bar** fixa no rodapé.

#### 02 · Sets (`ScreenSets`)
Lista de conjuntos com visualização de ciclos.

- **Header:** título Fraunces "Conjuntos" 26px + botão `+` à direita.
- **Cada conjunto = card 18px padding:**
  - Linha 1: índice mono + título 16px/600 + badge "ATIVO" se aplicável
  - Linha 2: descrição 12px `text-3`
  - **Visualização de ciclos** (a parte chave): 5 colunas (1 por ciclo possível), altura 60px. Cada coluna = barra vertical com altura proporcional a `puzzles_resolvidos / 100`, cor `--wp-accent` se é o ciclo atual ativo, `--wp-surface-3` para ciclos completos passados. Ciclos não iniciados: linha de 2px sem barra. Embaixo de cada barra: tempo mono 9px (ou `—`).
  - Linha rodapé: "Ciclo X de 5" + botão "Continuar"/"Abrir".
- Ao final: card dashed "+ Novo conjunto".

#### 03 · New set (`ScreenNewSet`)
Modal/tela de criação.

- **Header:** close + "NOVO CONJUNTO" eyebrow.
- **Título Fraunces** "Que tipo de treino?" + subtítulo "Cada conjunto será repetido por 5 ciclos."
- **3 cards** (gap 10): Padrão / Plano de melhoria (selecionado, ocre) / Adversário específico. Cada um com índice mono, label 16px/600, descrição 13px, meta mono uppercase 11px no rodapé.
- CTA primary "Configurar".

---

### Seção 3 — Treino (a estrela)

#### 01 · Puzzle (`ScreenPuzzle` state="idle")
A tela mais usada do app. Estrutura compacta, foco no tabuleiro.

- **Top bar (10px 20px):** close | center { eyebrow "Plano de melhoria · Ciclo 2", contador `34/100` mono } | pause.
- **Tally row (0 24px):** 10 marcas verticais (4 acesas, ocre) à esquerda; meta mono "pacote 4 · puzzle 5" à direita.
- **Above-board (24px 20px 12px):** "BRANCAS JOGAM" eyebrow + instrução 20px/600 "Encontre a melhor jogada" à esquerda; tempo atual mono 11px ocre `00:14` + "antes 00:42" mono 10px `text-4` à direita.
- **Tabuleiro:** 350px largura, centralizado, com posição de exemplo, lastMove highlight (gold) em `d7-e6`.
- **Bottom (flex grow):** 2 botões "Dica" + "Desistir" com ícones 14px.

#### 02 · Puzzle correct (state="correct")
- Instrução troca para "Certo" em verde `--wp-good`.
- Highlight ocre em `d4` e `e6` (lance solução).
- Banner pequeno acima do tabuleiro: pill com fundo `--wp-good-soft`, borda `--wp-good`, padding `4px 12px`, texto mono notação "Nxe6" verde.
- Bottom: card de comparação (`Mais rápido que ciclo 1: −28s` em verde) + CTA primary "Próximo · puzzle 6".

#### 03 · Puzzle almost (state="almost")
- Instrução "Quase" em `--wp-warn`.
- Pill amarelo escuro `oklch(0.32 0.06 80)` + borda warn, texto "Nf5 — bom, mas há melhor".
- CTA primary "Próximo".

#### 04 · Puzzle wrong (state="wrong")
- Instrução "Errado" em `--wp-bad`.
- Pill com fundo `--wp-bad-soft`, borda `--wp-bad`, texto "Bxh7+ ?".
- CTA primary "Próximo".

#### 05 · Pack complete (`ScreenPackComplete`)
Celebração contida ao terminar pacote de 10 puzzles.

- **Eyebrow** "Pacote 4 / 10 concluído"
- **Tally grande:** 10 marcas, 4 acesas, height 28px, width 3px (maior que o tally inline normal)
- **Headline Fraunces 34px:** "Você está **2,4×** mais rápido que no ciclo 1." (com "2,4×" em ocre).
- **Grid 2x2 stats:** Acertos `9/10` (+1 vs c1) | Tempo `04:12` (−71% vs c1) | Mais rápido `Mate em 2 · 06s` | A revisitar `Garfo · 02:03` (em red).
- Estilo: cells separadas por hairlines de 1px `--wp-line-soft`, fundo `--wp-bg`.
- CTAs rodapé: "Pausa" (flex 1) + "Próximo pacote" primary (flex 2).

---

### Seção 4 — Análises & Perfil

#### 01 · Stats (`ScreenStats`)
Análises totais. Dropdown muda escopo (Total / Por conjunto / Individual ciclo).

- **Header:** título "Análises" + dropdown "Total ▾".
- **Headline number:** eyebrow "VELOCIDADE VS. CICLO 1" + número gigante mono ocre `2,4×` 56px + label "mais rápido".
- **Card "Tempo médio por ciclo":** gráfico de barras 110px alto, 5 colunas (c1...c5). Barras preenchidas para ciclos completos (`--wp-surface-3`), ciclo atual em `--wp-accent`, ciclos futuros em traço pontilhado. Tempo mono no topo de cada barra preenchida.
- **Card "Constância — 30 dias":** grid 15 col x 2 rows, cada cell paddingTop 100% (square). Cells com prática: ocre com opacidade variada (0.6 ou 1.0). Sem prática: `--wp-surface-2`.
- **Lista "Por conjunto":** rows hairline. Cada row: nome + último ciclo mono | delta mono em verde/warn | chevron.
- **Lista "Temas — força relativa":** barras horizontais, 2px altura. Cor: <50% `--wp-bad`, 50–75% `--wp-warn`, ≥75% `--wp-accent`.
- Tab bar.

#### 02 · Profile (`ScreenProfile`)
- **Header:** título "Perfil" + ícone settings.
- **User row:** avatar 56px circular ocre + nome 18px/600 + handle mono `text-3`.
- **Grid 3 stats** (rating / ciclos / streak), separados por hairlines de 1px.
- **Grupo Treino:** rows com label + valor mono à direita + chevron.
- **Grupo Conta:** "chess.com — conectado", "Privacidade", "Sobre o método", "Sair" (red).
- **Footer:** versão `WOODPECKER · v1.0` mono 10px `text-4` letter-spacing 0.14em.
- Tab bar.

---

## Components compartilhados

### Status bar (mock iOS)
44px alto, padding `0 24px 0 28px`, time 15px/600 esquerda, sinal+wifi+bateria SVGs à direita. **Remover ou substituir** pela barra de status real do device em prod.

### Tab bar
- Grid 4 colunas, border-top hairline, padding `8px 0 28px` (incluindo safe area iOS).
- 4 tabs: **Treino · Conjuntos · Análises · Perfil**.
- Cada tab: dot 4px (ocre se ativo, transparent se não) + label 11px / 0.04em / uppercase / weight 500.
- Ativa: cor `text`. Inativa: `text-3`.
- **Em web/desktop**, considerar substituir por sidebar à esquerda.

### Botões
```css
.wp-btn          /* outline ghost: border line, bg transparent */
.wp-btn-primary  /* fill ocre, texto escuro oklch(0.18 0.02 50), weight 600 */
.wp-btn-ghost    /* sem border, color text-2, hover surface */
```
Padding default `14px 18px`, font 14px/500, radius 4px. Hover do primary: `oklch(0.78 0.13 55)`. Transição 0.15s.

### Inputs
Background `--wp-surface`, border 1px `--wp-line`, padding `14px 16px`, radius 4px, font 15px. Focus: border `--wp-accent`. Placeholder `--wp-text-4`.

### Tabuleiro (`WpBoard`)
Componente SVG. Props:
- `size` (default 320)
- `position`: dict `{ 'e4': 'wK', 'd5': 'bP', ... }` — código de peça é cor (`w`/`b`) + tipo (`K`,`Q`,`R`,`B`,`N`,`P`)
- `lastMove`: array de squares `['d7', 'e6']` — destaque amarelo claro (`oklch(0.78 0.12 80)` opacity 0.30)
- `highlight`: array de squares — destaque ocre (`oklch(0.72 0.13 55)` opacity 0.40)
- `flipped`: bool — inverte perspectiva
- `showCoords`: bool — files (a–h) e ranks (1–8) mono 9px nos cantos das casas
- Casas claras `--wp-board-light` / escuras `--wp-board-dark`. Border outer `0 0 0 1px --wp-board-edge`.

**Peças:** glyphs Unicode sólidos do conjunto preto (`♚♛♜♝♞♟`) para AMBAS as cores. Brancas: fill `#f5f1e8` + stroke `#171210` 0.6px. Pretas: fill `#171210` sem stroke. Font-size = `cell * 0.92`. Font family: serif.

> Em produção, considere usar SVGs de peças de qualidade (ex: cburnett, neo, etc.) para um visual mais polido. Os glyphs Unicode são uma aproximação.

### Sparkline / Bars
Helpers em `wp-ui.jsx`. Use Recharts/Visx ou similar do codebase em prod.

---

## Interactions & Behavior

### Resolver puzzle (núcleo da experiência)
1. Tela carrega em `state=idle`. Timer começa imediatamente.
2. User clica em uma casa do tabuleiro → highlight da peça e dos lances legais.
3. User clica em outra casa para mover.
4. Se lance correto: `state=correct` (instant). Banner verde sobe acima do tabuleiro com notação algébrica do lance feito. Compara tempo com ciclo anterior se disponível.
5. Se lance "quase" (segundo melhor lance da engine): `state=almost`. Pill warn.
6. Se errado: `state=wrong`. Pill red. Engine pode mostrar refutação após 1.5s.
7. Botão "Próximo" avança. Tally avança 1.

### Transições entre estados
- Mudança de cor da instrução: `transition: color .3s`.
- Banner de feedback: fade-in 200ms + slight slide down (translateY 4px → 0).
- Avanço para próximo puzzle: cross-fade 200ms do tabuleiro.
- **Sem confetti, sem celebrações grandes.** Apenas textura de progresso silencioso.

### Pacote concluído
- Após o 10º puzzle de um pacote, navegar para `ScreenPackComplete`.
- Headline "X× mais rápido" deve usar dado real do ciclo anterior. Se é o ciclo 1, mostrar mensagem alternativa: "Linha de base estabelecida — X:XX por puzzle".
- "A revisitar" = puzzle mais lento ou último errado do pacote.

### Streak / Constância
- Contar dias consecutivos com ≥1 pacote completo.
- Reset à meia-noite local.
- Mostrar streak em Home + Profile + Stats.

### Calibração
- Conectar chess.com: chamar API `https://api.chess.com/pub/player/{username}` + `/stats` para puxar Rapid/Blitz rating. Usar média ou Rapid como base. Em paralelo importar últimos 50 jogos para análise de fraquezas.
- 30 puzzles: rating estimado por Glicko-like ajuste sequencial dos puzzles oferecidos.
- Manual: input numérico, range 400–2800.

### Criação de conjunto
1. **Padrão:** seleção de tamanho (50 ou 100) + seleção opcional de temas (sortido por padrão).
2. **Plano de melhoria:** importa fraquezas do chess.com (ou prompt para conectar). Mostra distribuição de temas que serão incluídos.
3. **Adversário:** input username + análise de últimas N partidas dele para extrair aberturas e padrões. Gera 80–100 puzzles dirigidos.

---

## State management

### Estado mínimo
```ts
type User = { id, name, handle?, chesscom?, rating: number, streak: number };
type PuzzleSet = {
  id, name, type: 'standard' | 'improvement' | 'opponent',
  size: number, // total puzzles
  puzzleIds: string[],
  cycles: Cycle[], // up to 5
  active: boolean,
};
type Cycle = {
  index: 1..5,
  startedAt, completedAt?,
  attempts: { puzzleId, result: 'correct'|'almost'|'wrong', timeMs, hint: bool }[],
  totalTimeMs,
};
type Puzzle = {
  id, fen, solution: string[], theme: string[], rating: number,
};
```

### Estado de UI
- `currentSetId`, `currentCycleIndex`, `currentPackIndex` (0–9), `currentPuzzleIndex` (0–9).
- `puzzleState: 'idle'|'correct'|'almost'|'wrong'`
- `puzzleStartedAt: timestamp`
- `boardOrientation`, `boardTheme` (settings)

### Persistência
- LocalStorage para sessão atual (resume after refresh).
- API/Firestore/Supabase para histórico de tentativas (necessário para calcular deltas entre ciclos).

---

## Responsividade

Frame de design: **390×760** (iPhone moderno). Mobile-first.

- **<480px**: layout exato dos artboards.
- **480–768px**: idêntico, max-width 440px centralizado, fundo `--wp-bg` em volta.
- **≥768px**: substituir tab bar por sidebar de 240px à esquerda; conteúdo central com max-width 480–560px; possível painel direito em telas de Stats com gráficos expandidos (opcional).

Tab bar mobile usa safe-area-inset-bottom.

---

## Tom de copy

Português BR, conciso, zen. **Evitar:**
- Exclamações ("Parabéns!!!", "Incrível!!!")
- Emojis
- Linguagem motivacional artificial ("Você é incrível! Vamos lá! 🚀")

**Preferir:**
- Frases curtas, factuais
- Comparações numéricas ("−71%", "2,4× mais rápido")
- Voz ativa, segunda pessoa quando necessária ("Encontre a melhor jogada")

Padrões úteis:
- Ações: "Continuar", "Marcar lance", "Próximo pacote"
- Estados: "Certo", "Quase", "Errado" (3 palavras, sempre)
- Meta: "ciclo 2 de 5", "pacote 4", "puzzle 5" — sempre minúsculas em meta

---

## Assets

- **Fontes:** Inter Tight, JetBrains Mono, Fraunces — todas Google Fonts. Já carregadas via `@import` no topo de `styles.css`.
- **Ícones:** SVG inline simples (stroke 1.6, viewBox 18). Definidos em `WpIcon` em `wp-ui.jsx`. Em produção, considerar usar lucide-react ou phosphor-icons que têm o mesmo "feel" minimalista.
- **Logo:** "WpMark" em `screens-onboarding.jsx` — 4 barras verticais ocre de alturas decrescentes + 1 cinza. É um placeholder / marca tipográfica. Substituir por logo real se houver.
- **Peças:** Unicode chess glyphs (placeholder). Em prod usar SVG de qualidade (cburnett, neo, alpha, etc.).
- **Sons:** não implementados nas mocks. Sugestão: click leve para movimento, tom curto para correto/errado.

---

## Files in this bundle

- `Woodpecker.html` — entrada principal, junta tudo no DesignCanvas
- `styles.css` — design tokens + utilities
- `wp-ui.jsx` — primitives: WpBoard, WpStatusBar, WpTabBar, WpTally, WpSparkline, WpBars, WpIcon, WpFrame, WpPiece
- `screens-onboarding.jsx` — 5 telas de onboarding + WpMark logo
- `screens-home.jsx` — Home, Sets, NewSet
- `screens-train.jsx` — Puzzle (4 estados), PackComplete
- `screens-stats.jsx` — Stats, Profile
- `design-canvas.jsx` — **NÃO PORTAR**, é só wrapper de apresentação

---

## Para o Claude Code

Ver `META_PROMPT.md` para o prompt sugerido a rodar dentro do projeto após copiar estes arquivos para uma pasta `/design-reference/` no repo.
