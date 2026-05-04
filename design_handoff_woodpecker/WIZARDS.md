# Handoff — Wizards de criação de conjunto

> Incremento ao handoff principal. Cobre **8 telas novas** distribuídas em 3 fluxos (Padrão, Plano de melhoria, vs. Adversário) que terminam todos na mesma tela compartilhada de "tamanho do conjunto".
>
> Pré-requisito: design tokens, fontes, componentes (`Button`, `Input`, `Card`, `Tally`, `Eyebrow`, `Chessboard`, `WpIcon`) já implementados conforme `README.md` principal.

> **Update — paleta do tabuleiro:** decidido pela direção **Mogno claro**. Os tokens `--wp-board-*` no `styles.css` já refletem essa escolha (`light: oklch(0.82 0.05 75)`, `dark: oklch(0.55 0.055 50)`, `edge: oklch(0.34 0.05 50)`). Substitui o "walnut" original — melhora o contraste das peças pretas mantendo a identidade quente.

## Arquivo de referência

`screens-wizards.jsx` — todos os componentes JSX dos wizards. **Não copiar direto** — usar como referência visual; portar para o framework do codebase.

## Componente compartilhado: `WizHeader`

Header padrão de todos os passos. Layout:

```
[← back]    [EYEBROW · TÍTULO DO FLUXO]    [×]
[==========              ]   ← barra segmentada
```

- Padding: `14px 24px 0`
- Botões back/close: ghost, sem borda, padding `6px 8px`
- Título: eyebrow style (10.5px / 0.14em / uppercase / `--wp-text-3` / weight 600)
- **Barra segmentada** (margin-top 14px): `total` segmentos de 2px com `gap: 4`. Os primeiros `step` segmentos em `--wp-accent`, restantes em `--wp-line-soft`.

Props: `step` (current, 1-based), `total`, `title`, `onBack`, `onClose`.

---

## Tela compartilhada — Tamanho do conjunto (`ScreenWizSize`)

A tela do print enviado pelo user. **Final de todos os 3 fluxos.**

### Layout

1. `WizHeader` (com flowName dinâmico: "Novo conjunto · Padrão", "Novo conjunto · Plano de melhoria", "Novo conjunto · vs. @magnus_jr")
2. **Bloco de rating** (padding `24px 24px 0`):
   - Eyebrow "SEU RATING"
   - Big number mono `1.350` 44px / weight 500 / `--wp-accent` / letter-spacing `-0.04em`
   - Inline ao lado: "Intermediário" 14px `--wp-text-2`
   - Linha meta abaixo (12px / `--wp-text-3`): "Puzzles de `1.150` a `1.550` · todos os temas táticos" — números em mono.
3. **Eyebrow "PROTOCOLO"** (margin-top 24px)
4. **4 cards de protocolo** (gap 8px). Estrutura de cada card:
   - Padding `16px 18px`, radius 4px, fundo `--wp-surface`, border 1px `--wp-line-soft`.
   - **Selecionado**: border 1px `--wp-accent` (sem mudar fundo).
   - Linha 1 (flex justify between):
     - Esquerda: `<Display 18px/600>{label}</Display>` + `<mono 14px text-2>{size}</mono>` + opcional badge `recomendado` (mono 10px / ocre / border 1px `--wp-accent-soft` / padding `2px 8px` / radius 3px).
     - Direita: meta mono 11px `--wp-text-3` ex: `~10h por ciclo`.
   - Linha 2: descrição 13px `--wp-text-2` line-height 1.4.
5. **CTA full-width** (padding `15px`, primary ocre):
   - Texto "Montar conjunto" precedido de glyph serif `♟` 16px.

### Dados dos 4 protocolos

| id | label | size | descrição | meta | recomendado |
|---|---|---|---|---|---|
| `mini` | Mini | 100×6 | Pré-treino. Conjunto de aquecimento. | ~2h por ciclo | — |
| `red` | Reduzido | 300×7 | Mínimo útil pra ver o efeito do método. | ~6h por ciclo | — |
| `std` | Standard | 500×7 | Recomendado para profissionais. | ~10h por ciclo | ✓ |
| `full` | Full | 1000×8 | Protocolo do livro Woodpecker Method. | ~20h por ciclo | — |

> Notação `100×6` significa: 100 puzzles repetidos por 6 ciclos.

---

## Fluxo 1 — Padrão (1 passo)

`ScreenWizStandard` → renderiza `ScreenWizSize` direto com `flowName="Padrão"`, `step=1`, `total=1`.

Não há análise prévia. Usuário escolhe protocolo e clica "Montar conjunto" — backend monta o conjunto com puzzles sortidos no rating do usuário.

---

## Fluxo 2 — Plano de melhoria (2 passos)

### Passo 1A — Última análise (estado: "completa")

`ScreenWizPlanStatus` — quando já existe análise.

- WizHeader `step=1, total=2`, título "Plano de melhoria"
- Headline Fraunces 26px: "Análise das suas\npartidas"
- Texto 13px `--wp-text-3`: "Identificamos seus padrões fracos para focar o conjunto."
- **Card "Última análise"** (padding 18):
  - Eyebrow + status-pill mono 11px `--wp-good` ("● completa")
  - Big text mono 22px / weight 500: "há 6 dias"
  - Meta 12px `--wp-text-3`: "50 partidas · @rafa_silva" (mono)
  - Divider hairline
  - Eyebrow "PONTOS FRACOS DETECTADOS"
  - 3 linhas de tema cada uma com:
    - Top row (flex justify between): nome do tema 13px + meta mono 11px `text-3` "{v}% · {count} erros"
    - Barra horizontal 2px de fundo `--wp-surface-2` com fill colorido por threshold (<50 `--wp-bad`, 50–75 `--wp-warn`, ≥75 `--wp-accent`)
- **Botão secundário** "Atualizar análise" (com ícone sparkle 13px). Ao clicar → vai para passo 1B.
- **CTA primary** "Avançar" (sticky bottom). Ao clicar → vai para passo 2.

### Passo 1B — Análise em andamento

`ScreenWizPlanAnalyzing` — também usado quando user clica refresh ou nunca analisou.

- WizHeader igual (`step=1, total=2`)
- Headline "Analisando\npartidas…"
- Texto pequeno: "Isso costuma levar 1–2 minutos."
- **Bloco de progresso** (margin-top 36):
  - Top row (flex justify between):
    - Esquerda: `<mono 13px accent class="wp-pulse">analisando partida {progress} de {total}</mono>`
    - Direita: `<mono 13px text-2>{percent}%</mono>`
  - Barra fina 2px (`--wp-line-soft` fundo, fill `--wp-accent`, transição `width .4s`)
- **Card "Detectado até agora"** que cresce em tempo real:
  - Linhas: tema + count mono "{N} erros" à direita
- CTA disabled "Aguarde a análise" no rodapé (cor `--wp-text-3`).

### Passo 2 — Tamanho

`ScreenWizPlanSize` → `ScreenWizSize` com `flowName="Plano de melhoria"`, `step=2`, `total=2`.

---

## Fluxo 3 — vs. Adversário (3 passos)

### Passo 1 — Escolher adversário

`ScreenWizFoeChoose`.

- WizHeader `step=1, total=3`, título "vs. Adversário"
- Headline Fraunces 26px: "Quem você quer\nvencer?"
- Texto 13px: "Vamos extrair aberturas e padrões dele para gerar puzzles específicos."
- **Eyebrow "TOP ADVERSÁRIOS · CHESS.COM"**
- **Card-list** (`--wp-surface` fundo, radius 4px, overflow hidden) com 4 itens:
  - Cada item: `<button>` flex row, padding `14px 16px`, `border-bottom: 1px --wp-line-soft` exceto último.
  - **Item selecionado (primeiro por default)**: fundo `--wp-accent-tint` + `border-left: 2px solid --wp-accent`. Demais: border-left transparent 2px.
  - Layout interno: avatar 32px circular (cor `--wp-surface-3`, inicial em mono ocre) + bloco de texto (handle mono 13px/500, meta mono 11px text-3 "{games} jogos · {score} · {recência}") + chevron right 14px.
- **Eyebrow "OU OUTRO ADVERSÁRIO"** (margin-top 22)
- Input com prefix `@` (igual ao username do onboarding).
- Hint 11px text-4: "Buscaremos as últimas 30 partidas dele."
- CTA primary "Avançar" no rodapé.

#### Dados dos top adversários (mock)
```js
[
  { handle: 'magnus_jr',      games: 14, score: '4-9-1', last: 'há 2d'   },
  { handle: 'pedro_xadrez',   games:  9, score: '3-5-1', last: 'há 5d'   },
  { handle: 'jane_doe_chess', games:  7, score: '2-4-1', last: 'há 12d'  },
  { handle: 'ferreira_99',    games:  6, score: '1-4-1', last: 'há 3sem' },
]
```
Score = vitórias-derrotas-empates do **usuário** contra esse oponente. Ordenar por número de jogos desc; mostrar até 4 adversários com ≥5 jogos. Se houver menos de 4, ocultar grupo.

### Passo 2A — Análise das partidas em andamento

`ScreenWizFoeAnalyzing`.

- WizHeader `step=2, total=3`
- Headline "Estudando\n@magnus_jr" — handle em mono 22px `--wp-accent` na segunda linha.
- Mesmo padrão de barra de progresso do plano de melhoria.
- Card "Padrões detectados" preenche em tempo real:
  - Linhas: padrão + meta mono à direita (ex: "Siciliana Najdorf · brancas" / "8 jogos"; "Sacrifício em h6/h3" / "4 vezes")
- CTA disabled "Aguarde a análise" no rodapé.

### Passo 2B — Análise pronta

`ScreenWizFoeReady`.

- WizHeader `step=2, total=3`
- Headline "Análise pronta"
- Subtítulo "@magnus_jr · 30 partidas analisadas"
- **Grid 2x1 stats**: "Aberturas frequentes" `4` / "Padrões recorrentes" `11`. Mesmo estilo do PackComplete grid (cells `--wp-bg` separadas por hairlines de 1px `--wp-line-soft`).
- **Card "Foco do conjunto"**: lista numerada dos temas que serão usados, formato `01  Sacrifício em h6/h3`. Index mono 11px `text-4` em coluna fixa de 20px.
- CTA primary "Avançar — escolher tamanho" no rodapé.

### Passo 3 — Tamanho

`ScreenWizFoeSize` → `ScreenWizSize` com `flowName="vs. @magnus_jr"`, `step=3`, `total=3`.

---

## Estado e comportamento

### Estado do wizard

```ts
type WizardFlow = 'standard' | 'improvement' | 'opponent';
type WizardState = {
  flow: WizardFlow;
  step: number;
  // Por fluxo:
  improvement?: {
    lastAnalysisAt?: Date;
    lastAnalysisGameCount?: number;
    weaknesses: { theme: string; score: number; errorCount: number }[];
    isAnalyzing: boolean;
    analysisProgress?: { current: number; total: number };
    analysisLive?: { theme: string; count: number }[]; // detecções acumulando
  };
  opponent?: {
    selectedHandle?: string;
    customHandle?: string;
    isAnalyzing: boolean;
    analysisProgress?: { current: number; total: number };
    analysisLive?: { pattern: string; meta: string }[];
    ready?: {
      openings: number;
      patterns: number;
      focus: string[];
    };
  };
  size?: 'mini' | 'red' | 'std' | 'full';
};
```

### Backend

- **Plano de melhoria — analisar:** endpoint que pega últimas 50 partidas do user no chess.com, roda Stockfish lite ou heurísticas para classificar erros por tema tático. Retorna lista ordenada por score crescente (mais fraco primeiro).
- **vs. Adversário — top:** endpoint que cruza histórico de partidas do user e agrupa por oponente.
- **vs. Adversário — analisar:** mesmo motor de análise, mas focado nas partidas **do oponente** (não só nas dele contra o user). Extrai aberturas frequentes (ECO codes) e padrões táticos recorrentes.
- **Streaming de progresso:** preferir SSE ou WebSocket para mandar updates em tempo real ao invés de polling. Cada partida processada → emit `{current, total, newDetections: [...]}`.

### Transições

- Entre passos do wizard: cross-fade horizontal 200ms (slide left).
- Análise em andamento → completa: o card de progresso colapsa em altura (200ms ease-out), o CTA muda de disabled "Aguarde" para enabled "Avançar" com fade-in.
- Pulse no texto "analisando partida X de N": animação `wp-pulse` (já em styles.css) — opacity 0.55 ↔ 1 em 2.4s ease-in-out infinite.

### Validações

- Standard: nenhuma — sempre clicável.
- Plano: bloqueia "Avançar" se nunca analisou. Forçar passo 1B.
- Adversário: bloqueia se nem top selecionado nem custom preenchido. Validar custom como handle válido do chess.com (regex `[a-zA-Z0-9_-]{3,20}`) antes de avançar — mostrar erro inline se inválido.

---

## Copy — referência completa

| Tela | Cópia |
|---|---|
| `WizHeader · Padrão` | "Novo conjunto · Padrão" |
| `WizHeader · Plano` | "Novo conjunto · Plano de melhoria" |
| `WizHeader · Adversário` | "Novo conjunto · vs. @{handle}" |
| Plano headline | "Análise das suas\npartidas" |
| Plano explainer | "Identificamos seus padrões fracos para focar o conjunto." |
| Plano última | "Última análise" / "● completa" / "há {N} dias" |
| Plano refresh btn | "Atualizar análise" |
| Plano analisando | "Analisando\npartidas…" / "Isso costuma levar 1–2 minutos." |
| Foe headline | "Quem você quer\nvencer?" |
| Foe explainer | "Vamos extrair aberturas e padrões dele para gerar puzzles específicos." |
| Foe analisando | "Estudando\n@{handle}" |
| Foe pronta | "Análise pronta" / "@{handle} · {N} partidas analisadas" |
| Foe foco | "Foco do conjunto" |
| Tamanho rating | "Seu rating" / "{rating}" / "{nivel}" |
| Tamanho faixa | "Puzzles de {min} a {max} · todos os temas táticos" |
| Tamanho protocolo | "Protocolo" |
| Recomendado | "recomendado" |
| CTA tamanho | "♟ Montar conjunto" |
| CTA disabled | "Aguarde a análise" |
| CTA avançar foe | "Avançar — escolher tamanho" |
| CTA outros | "Avançar" |

Tom: zen, factual, sem emoji, sem exclamações. Mono em qualquer número/handle/notação.

---

## Mapeamento de telas → IDs

```
wiz-std/std-size       — Padrão · Tamanho
wiz-plan/plan-status   — Plano · Última análise
wiz-plan/plan-running  — Plano · Em andamento
wiz-plan/plan-size     — Plano · Tamanho
wiz-foe/foe-choose     — Adversário · Escolher
wiz-foe/foe-running    — Adversário · Em andamento
wiz-foe/foe-ready      — Adversário · Análise pronta
wiz-foe/foe-size       — Adversário · Tamanho
```

Comparar lado a lado com `Woodpecker.html` (seções "Wizard · Padrão", "Wizard · Plano de melhoria", "Wizard · vs. Adversário").
