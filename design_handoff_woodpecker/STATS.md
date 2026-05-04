# Handoff — Análises (3 níveis)

> Incremento ao handoff principal. Cobre **6 telas** organizadas em 3 níveis de análise: Geral, Conjuntos (com drill-in), Temas (com drill-in). Substitui a tela `Análises` original.
>
> Pré-requisito: design tokens, fontes, componentes (`WpFrame`, `WpStatusBar`, `WpTabBar`, `WpIcon`, `WpTally`, `Eyebrow`) já implementados conforme handoff principal.

## Arquivo de referência

`screens-stats.jsx` — JSX de todas as telas. Não copiar direto — usar como referência visual; portar para o framework do codebase.

## Filosofia das 3 abas

A IA do app responde a 3 perguntas distintas, separadas em abas:

| Aba | Pergunta que responde | Métrica-âncora |
|---|---|---|
| **Geral** | "Estou evoluindo? Estou constante?" | Velocidade vs. ciclo 1 |
| **Conjuntos** | "Qual conjunto está performando?" | Δ tempo médio entre ciclos |
| **Temas** | "Em que tipo de puzzle sou bom/ruim?" | Força relativa por tema |

Cada aba tem um nível 1 (lista/visão geral) e, onde faz sentido, um nível 2 (drill-in).

---

## Componentes compartilhados

### `StatsHeader({ active, title })`

Header das 3 abas top-level. Layout:
- Padding `14px 24px 0`
- Título "Análises" (Display 26px / weight 500)
- Segmented control horizontal de 3 abas: `Geral`, `Conjuntos`, `Temas`
  - Cada aba: flex 1, padding `10px 0`, fonte UI 12px / letter-spacing `0.04em` / uppercase
  - Ativa: `var(--wp-text)`, weight 600, `border-bottom: 1.5px solid var(--wp-accent)` (compensar com `margin-bottom: -1px` para alinhar à hairline geral)
  - Inativa: `var(--wp-text-3)`, weight 500, border transparente
- Hairline `1px solid var(--wp-line-soft)` no fundo do strip de tabs

### `StatsBackHeader({ title, kicker })`

Header de telas de detalhe (drill-in). Layout:
- Padding `14px 24px 0`, flex row align center gap 8
- Botão back (chevron_left 16px, ghost, padding `6px 8px`, margin-left `-8px` pra alinhar)
- Bloco direito:
  - Eyebrow (10px / mono / uppercase / `text-3`) — kicker contextual ex: "Plano · 500×7" ou "Tema tático"
  - Título Display 22px / weight 500 / letter-spacing `-0.02em`

---

## Aba 1 — Geral

`ScreenStats`. Aba default. Estrutura vertical:

### Headline number
- Eyebrow "Velocidade vs. ciclo 1"
- Big number mono **`2,4×`** — 56px / weight 500 / letter-spacing `-0.04em` / `var(--wp-accent)`
- Inline: "mais rápido" 14px `var(--wp-text-3)`

### Resumo · 3 cells
Grid 1fr 1fr 1fr com `gap: 1px` em `var(--wp-line-soft)` (hairlines aparecem como gaps). Cada cell:
- Background `var(--wp-bg)`, padding `14px 10px`
- Eyebrow 9.5px (Ciclos / Puzzles / Horas)
- Big mono 20px / 500
- Sub mono 10px `var(--wp-text-3)` (completos / resolvidos / totais)

Valores mock: `6 · 2.847 · 38h`

### Trend · 90 dias (sparkline)
Card padding 18, eyebrow + mono 11px "seg / puzzle". SVG width 100% height 80, viewBox `0 0 300 80`:
- 2 linhas horizontais de referência (y=20 e y=50, stroke `var(--wp-line-soft)` 0.5px dashed `2 2`)
- Polyline única em `var(--wp-accent)` 1.5px stroke (sem fill)
- Círculo 3px no ponto final

Footer 3 mono labels: tempo inicial / "hoje" / tempo atual.

> **Implementação:** dados reais via API `/stats/overall/timeline?range=90d` → array de `{date, avgSeconds}`. Normalizar para coordenadas SVG (mais antigo na esquerda, mais recente direita) — y invertido (menos tempo = ponto mais alto = melhor).

### Constância · 30 dias
Igual ao da versão anterior. Card 18, header eyebrow + mono `23 / 30` em `var(--wp-good)`. Grid 15 colunas × 2 linhas (30 cells), `paddingTop: 100%` cria quadrados, fill `oklch(0.72 0.13 55 / {intensity})` onde intensity ∈ {0, 0.6, 1}. Cells vazias `var(--wp-surface-2)`.

### Marcos recentes
Lista cronológica reversa. Cada linha (`wp-row`):
- Mono 11px `text-3` minWidth 64px ("há 4 dias")
- Texto 13px (descrição do marco)

Tipos de marco:
- "{N} dias consecutivos de treino" (na primeira ocorrência de threshold: 7, 14, 30, 60, 100)
- "Ciclo {N} de {nome} concluído"
- "Rating recalibrado · {novo} (+{delta})"
- "Conjunto {nome} criado"

---

## Aba 2 — Conjuntos

### 2A) Lista — `ScreenStatsSets`

Cabeçalho de página de lista pequeno: eyebrow "Toque para ver ciclos".

Cada conjunto vira um card padding 16:
- **Top row (flex justify between):**
  - Esquerda: nome 15px / weight 600 + meta mono 11px / `text-3` ("Plano · 500×7")
  - Direita (text-align right): delta mono 18px / weight 500 (cor `--wp-good` se < 0%, `--wp-warn` se entre 0 e -20%, `--wp-bad` se >= 0%) + sub mono 10px / `text-4` "vs. ciclo 1"
- **Mini-barras por ciclo** (margin-top 14):
  - Flex align flex-end gap 4 height 32
  - 1 barra por ciclo do conjunto (ex: 7 ciclos no protocolo → 7 barras)
  - Barra existente: `flex: 1`, height proporcional ao tempo médio (max 50s = 100%), cor `--wp-surface-3` ou `--wp-accent` (se for o ciclo atual)
  - Barra vazia: `border: 1px dashed --wp-line`, height 100%, sem fill
- **Footer row** (margin-top 8): mono 10px `text-3` esquerda "último ciclo · {time}" / direita "ciclo {N} de {total}"

### 2B) Detalhe — `ScreenStatsSetDetail`

`StatsBackHeader` com kicker do tipo do conjunto + título do nome.

#### Big number
- Eyebrow "Ciclo {atual} vs. ciclo 1"
- Big mono 48px / 500 / `--wp-accent` ("−71%")
- Inline 13px `text-3` ("tempo médio")

#### Gráfico de barras por ciclo (idêntico ao gráfico do Geral original)
Card padding 18, header eyebrow + mono "seg / puzzle". Flex align flex-end gap 14 height 110:
- Para cada ciclo (1..total):
  - Se já completado: tempo no topo (mono 10px), barra `--wp-surface-3` proporcional (max 50). Ciclo atual em `--wp-accent` com tempo também em ocre.
  - Se futuro: barra placeholder com `border: 1px dashed --wp-line`
- Label `c{N}` mono 10px `text-4` no rodapé

#### Tabela ciclo a ciclo
CSS Grid 5 colunas: `32px 1fr 56px 60px 60px`, fonte mono 12px:
- Header row (`Eyebrow` 9px): `# · Duração · Acerto · Médio · Δ` — duas últimas alinhadas à direita
- Para cada ciclo:
  - `border-top: 1px solid --wp-line-soft` em todas as células
  - `#`: número (cor `--wp-accent` se for ciclo atual, senão `text-3`)
  - `Duração`: HH:MM:SS total do ciclo
  - `Acerto`: percentual `text-2` (text-align right)
  - `Médio`: tempo médio por puzzle (ocre se ciclo atual)
  - `Δ`: delta vs. ciclo anterior (cor `--wp-good`, ou `text-4` se for o primeiro ciclo, mostrando "—")

#### Composição por tema
Eyebrow "Composição por tema". Para cada tema do conjunto:
- Top row: nome 13px / mono 11px `text-3` ({percentual}%)
- Barra 2px height fundo `--wp-surface-2`. Fill `--wp-accent-soft`. Width = `${v * 3}%` capped a 100% (multiplica por 3 só para escalar visualmente — ajustar conforme distribuição real).

> Diferente das barras de "força" da aba Temas: aqui é distribuição/composição (sempre ocre, monocromático), não performance.

### 2C) Empty state — `ScreenStatsSetEmpty`

Quando o conjunto tem só 1 ciclo completo.

- `StatsBackHeader` igual
- Big number simplificado: mono 36px do tempo médio ("03:50") + sub "tempo médio" — sem comparação porque não há base
- **Card central empty**:
  - `<WpTally total={7} done={3} />` no topo (passa o número de ciclos do conjunto e quantos foram feitos — neste exemplo 3 de 7, mas o copy diz "Conclua o ciclo 2", pegando apenas o caso "ciclo 1 completo, em progresso no 2")
  - Display 18px / 500 "Conclua o ciclo 2 para ver evolução"
  - Sub 12px `text-3`: "O método compara cada ciclo com o anterior. Sem o segundo ciclo, ainda não há base de comparação."
  - Mono 11px `--wp-accent`: "faltam {N} ciclos para completar o conjunto"
- Resumo do ciclo 1 em 3 cells (Duração / Acerto / Médio) — mesmo padrão de cells do Geral.

> **Quando usar este empty state:** sempre que `cycles.completed < 2`. A partir do ciclo 2 completo, mostrar `ScreenStatsSetDetail` normal (apenas com 2 colunas de barras pintadas, resto pontilhado).

---

## Aba 3 — Temas

### 3A) Lista — `ScreenStatsThemes`

Header da aba já tem o segmented. Sub-header dentro do scroll:
- Eyebrow "Mais fraco no topo" + botão ghost de ordenação ("Força ↓" + chevron_down) à direita

Cada tema:
- `padding-bottom: 14, margin-bottom: 14, border-bottom: 1px solid --wp-line-soft`
- **Top row**: nome 14px / 500 esquerda; direita flex gap 12 align baseline:
  - Count mono 11px `text-4` (número de puzzles desse tema no histórico)
  - Percentual mono 13px `text-2` / 500 / minWidth 32 / text-align right
  - Chevron right 13px `text-4`
- **Barra 2px** abaixo: fundo `--wp-surface-2`, fill `width: ${v}%`, cor por threshold:
  - `< 50%` → `--wp-bad` (vermelho)
  - `50-75%` → `--wp-warn` (amarelo)
  - `≥ 75%` → `--wp-accent` (ocre)

Toda a linha é tappable → leva para 3B.

#### Ordenação
3 modos selecionáveis pelo botão direito:
- Força ↓ (default — fraco no topo, motivacional)
- Força ↑ (forte no topo)
- Alfabético

### 3B) Detalhe — `ScreenStatsThemeDetail`

`StatsBackHeader` com kicker "Tema tático" + título do tema.

#### Força atual
- Eyebrow "Força atual"
- Big mono 48px / `--wp-bad` (cor pelo mesmo threshold da lista) ("38%")
- Bloco direita: mono 13px `--wp-good` "+12 pts" + sub mono 10px `text-3` "em 3 ciclos"

#### Trend line da força
Card padding 18. SVG width 100% height 80, viewBox `0 0 280 80`:
- 2 linhas de referência horizontais (dashed, mesma do Geral)
- Polyline conectando os pontos `(20+i*70, 80 - força/100*60 - 20)` para cada ciclo
- Círculos: `r=2.5` para passados (`fill: --wp-surface-3, stroke: --wp-accent`), `r=3.5` para o último (`fill: --wp-accent, sem stroke`)
- Labels `c1, c2, ...` mono 9px `text-4` text-anchor middle no y=76

#### Tempo neste tema vs. geral
Grid 2 colunas com hairline gap, mesmo padrão das 3 cells:
- "Tempo neste tema": mono 20px `--wp-bad` ("00:38")
- "Geral": mono 20px `text-2` ("00:18")

> Mostrar a discrepância visualmente. Se o usuário leva 2x mais tempo nesse tema, fica óbvio onde investir.

#### Erros recentes
Lista até 3-5 erros mais recentes nesse tema. Cada item flex gap 12 padding `10px 0`:
- **Mini-tabuleiro placeholder** 44×44: fundo é o mesmo `repeating-linear-gradient` do `wp-board`, border `1px solid var(--wp-board-edge)`, radius 2px. Em produção, substituir por SVG do board no estado do erro.
- Bloco texto: posição mono 12px ("Black to move · h6") + meta 11px `text-3` ("{conjunto} · ciclo {N}")
- Right: mono 10px `text-4` recência ("há 4 dias")
- Tap → replay do puzzle no estado do erro

#### CTA
- `wp-btn-primary` width 100%, text "Treinar só este tema"
- Sub centralizado 11px `text-4` margin-top 8: "Mini-pacote de 20 puzzles, fora do ciclo"

> **Comportamento "Treinar só este tema":** gera um mini-conjunto temporário de 20 puzzles do tema, fora dos ciclos oficiais. Não conta para protocolo. Métrica que importa: melhorar a "força" do tema na próxima medição. Considerar mostrar overlay "Treino livre — não afeta ciclos" durante o uso.

---

## Endpoints sugeridos

```
GET /stats/overall
  → { speedMultiplier, cyclesCompleted, puzzlesSolved, hoursTotal, milestones[] }

GET /stats/overall/timeline?range=90d
  → [ { date, avgSeconds } ]   // para o sparkline

GET /stats/streak
  → { current, days[]: [ { date, count } ] }   // últimos 30

GET /stats/sets
  → [ { id, name, kind, cycles: { completed, total, currentAvg, firstAvg }, deltaPct } ]

GET /stats/sets/{id}
  → { ...set, cycles: [ { n, totalSeconds, accuracyPct, avgSeconds, deltaPct } ],
      themeBreakdown: [ { theme, pct } ] }

GET /stats/themes
  → [ { theme, strengthPct, puzzleCount } ]

GET /stats/themes/{slug}
  → { theme, strengthPct, deltaPts, history: [ { cycleN, strengthPct } ],
      avgSecondsTheme, avgSecondsOverall, recentErrors: [ {puzzleId, fen, label, setName, cycleN, when} ] }

POST /train/free-theme
  body: { theme, count: 20 }
  → { sessionId }   // mini-pacote sem afetar ciclos
```

---

## Cores e thresholds

Usadas em barras de "força" e "delta":

| Range | Token | Significado |
|---|---|---|
| < 50% | `--wp-bad` | Atenção — tema fraco / regressão |
| 50–75% | `--wp-warn` | Médio — espaço para crescer |
| ≥ 75% | `--wp-accent` | Forte — domina o tema |

Para deltas de tempo (negativo é bom):
| Δ | Token |
|---|---|
| Δ ≤ −20% | `--wp-good` |
| −20% < Δ ≤ 0% | `--wp-warn` |
| Δ > 0% | `--wp-bad` |

---

## Mapeamento de telas → IDs

```
stats/stats-geral          — Geral (aba 1)
stats/stats-sets           — Conjuntos · lista (aba 2A)
stats/stats-set-detail     — Conjunto · detalhe (aba 2B)
stats/stats-set-empty      — Conjunto · empty (aba 2C, < 2 ciclos)
stats/stats-themes         — Temas · lista (aba 3A)
stats/stats-theme-detail   — Tema · detalhe (aba 3B)
stats/profile              — Perfil (existente, sem mudanças)
```

Comparar lado a lado com `Woodpecker.html`, seção "Análises".

---

## Tom de voz & copy

Manter alinhado ao resto do app: zen, factual, mono em qualquer número, sem emoji, sem exclamações, sem hype.

Bons exemplos das telas:
- "Mais fraco no topo" (informativo, não vergonhoso)
- "Sem ranking — só você contra você de ontem" (filosofia)
- "Conclua o ciclo 2 para ver evolução" (orientação, não bloqueio)
- "Treinar só este tema · Mini-pacote de 20 puzzles, fora do ciclo" (clareza sobre o impacto)

Evitar:
- "Parabéns!", "Incrível!", "🎉"
- "Você está dominando!" (especulativo)
- "Top 5%" / "Melhor que X% dos jogadores" (anti-filosofia do app)
