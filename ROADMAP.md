# Roadmap — Woodpecker

Registro vivo de ideias para evolução do app. Itens concluídos vão pra
"Anterior"; pendentes ficam em "Em frente". Cada bloco organiza por
contexto, com tabela de item + descrição + referência (commit ou
estimativa). Não é compromisso de entrega — é mapa estratégico.

---

## Anterior — entregue

### Núcleo do método

| Item | Descrição | Commit |
|---|---|---|
| Ciclos com baseline + halving | Repetição em ciclos com tracking de baseline (Ciclo 1) e halving alvo (50%) | núcleo |
| Calibração por brackets | 30 puzzles em faixa ampla, sugere rating onde rende mais | núcleo |
| Modo espelho | Tabuleiro invertido pra combater memorização da posição | núcleo |
| Modo confirmar lance | Toggle pra calcular antes de comitar (default OFF) | núcleo |
| Sessão retomável | Sessão persistida; modal pergunta retomar/descartar ao voltar | núcleo |
| Backup JSON exportar/importar | Download manual + auto-backup opcional pós-ciclo | núcleo |

### Análise tática (chess.com)

| Item | Descrição | Commit |
|---|---|---|
| Modo 1 — Chances perdidas | Filtra Role A dominante; sem padding de heurística/rating | `62fe808` |
| Modo 2 — Adversário | Analisa oponente; ranqueia por B+C com C ponderado 2× (não-punidos) | `62fe808` |
| Modo 3 — Plano completo | Default; A + heurísticas + fundamentos por faixa | `62fe808` |
| Segmented control no input | "MELHORAR MEU JOGO / VENCER UM ADVERSÁRIO" decide tipo antes da análise | `c2ce8da` |
| Cobertura prévia | `peekCoverage` varre meses sem Stockfish, mostra contagem por time_class | — |
| Wake Lock | Mantém tela acesa durante análise (3-6 min) | — |
| Contagem real de puzzles por tema | Valida que tema sugerido tem material no banco | — |
| Histórico de análises | Timeline colapsável de análises anteriores do mesmo username | — |
| Cache FEN→eval (IndexedDB) | Re-análises e jogadores que compartilham aberturas pulam Stockfish | — |
| Stockfish local same-origin | `lib/stockfish.{js,wasm}` com fallback CDN | `e600773` |
| Clamp `suggested_rating` | GMs (>2800) e contas low (<600) caem nos limites do banco | `35d6d95` |

### Performance da análise

| Item | Descrição | Commit |
|---|---|---|
| MultiPV 2 → 1 | ~30% mais rápido; classificador só usa top-1 PV | `7369e7e` |
| Skip primeiros 12 plies | Aberturas são teoria, não geram sinal tático | `7369e7e` |
| Depth 14 → 12 | ~50% mais rápido; classificação por fingerprint não precisa de depth alto | `7369e7e` |
| Two-pass (shallow + deep) | Pass 1 depth 8 em todas; pass 2 depth 12 só nos candidatos | `7369e7e` |
| Skip opp moves sem contexto | Absorvido no two-pass via filtro de candidatos | `7369e7e` |

**Resultado agregado**: ~10 min → ~2-3 min para 30 partidas (4-5×).

### Identidade visual e UX

| Item | Descrição | Commit |
|---|---|---|
| Logo SVG + favicon | Knight dourado + strike vermelho (peck do pica-pau) | `1ae9613` |
| Numerais tabulares | Classes `.num` e `.num-display` com tabular-nums em ratings/timers | `0322023` |
| Tom de voz: princípios + glossário | 5 princípios em CLAUDE.md + auditoria de 7 strings | `0d3f7c0` |
| Onboarding 3-card chooser | Primeira visita escolhe entre rating/calibrar/username | `422583a` |
| Smith/Tikkanen presets | Mini 100×6, Reduzido 300×7, Standard 500×7, Full 1000×8 | `12e5a1e` |
| `.tela-container` 600/720/460 | Substitui 6 larguras hardcoded espalhadas | `da6bef4` |
| Contraste WCAG AA | 18/18 cores passam AA; texto principal AAA em ambos os temas | `3d8a73f` |
| System font stacks | `--font-serif` (Iowan Old Style + Charter + Georgia), `--font-mono` (SF Mono + Menlo + Cascadia) | `3d8a73f` |
| Focus-visible | Outline de 2px primary em buttons/inputs/choice-card | `3d8a73f` |
| Dark/light auto | Default segue `prefers-color-scheme` na primeira visita | `a029581` |

### Fluência de padrão (Eixo 3)

| Item | Descrição | Commit |
|---|---|---|
| Marcador "Vi de cara" | Toggle ☆/★ no acerto; métrica `visao_instantanea` separada de tempo | `a029581` |
| Sparkline por puzzle | Mini SVG mostrando tempo do puzzle em cada ciclo, em LinhaTeimoso | `1ebb561` |
| Heatmap por tema | Tabela tema×ciclo com taxa por célula (verde/gold/vermelho) | `f56434b` |
| Pattern Flash mode | Modo paralelo de reconhecimento instantâneo com setup/sessão/feedback | `00fd7ee` |

### Foto do progresso (Eixo 4)

| Item | Descrição | Commit |
|---|---|---|
| Calendário de streak | Heatmap GitHub-style 84 dias na TelaInicio | `1ebb561` |
| Personal Worst | Top 10 puzzles por tempo total agregado em TelaEvolucao | `1ebb561` |
| Comparador de ciclos | Selects A/B; lista 5 maiores melhorias e 5 piorias por puzzle | `f56434b` |
| Year-in-review automático | Card destaque após >=365 dias do 1º ciclo | `f56434b` |

### Estrutura ritual (Eixo 5)

| Item | Descrição | Commit |
|---|---|---|
| Ritual de início de ciclo | Overlay modal pra ciclo > 1: baseline + meta + halving + quote | `4cca480` |
| Reflexão a cada 50 | Modal automático com textarea opcional; persiste em `ciclo.reflexoes` | `4cca480` |
| "Aceitação do erro" | Mensagem contextual em ciclo 5+: "errar nessa altura é normal" | `a029581` |

### Experimentos selecionados (Eixo 6)

| Item | Descrição | Commit |
|---|---|---|
| Modo monge | UI minimalista (só board + timer texto + ações essenciais) | `a11e44e` |
| Companion áudio | Web Audio API; acerto/erro com tons sintetizados via OscillatorNode | `a11e44e` |

### Polimento (Eixo 7)

| Item | Descrição | Commit |
|---|---|---|
| Atalhos numéricos 1-6 + ? help | Vim-leve; help overlay lista atalhos do app + treino | `3cccb79` |
| Compartilhar PNG | Resumo do ciclo via Canvas API; lê cores das CSS vars | `3cccb79` |
| Onboarding nudges contextuais | Card progressivo na TelaInicio (0/1/2-4 ciclos) | `3cccb79` |

### Arquitetura em camadas (7 fases de refatoração)

| Item | Descrição | Fase |
|---|---|---|
| `src/data/{chaves,store}.js` | Única camada que toca `localStorage` | 1 |
| `src/domain/*.js` | Lógica pura, testável em Node | 2 |
| `src/hooks/*.js` | Hooks customizados consumindo domain + data | 3a |
| `useJogoPuzzle` | TelaTreinar reduzida de 654 → 301 linhas | 3b |
| `src/ui/*.jsx` externos | `Promocao.jsx`, `HistoricoAnalises.jsx` | 3c |
| `useCriarConjunto` | TelaCriar single-page com Smith/Tikkanen | 4 |
| `tests/` com `node:test` | 48/48 zero-deps | 5 |
| `src/styles/{tokens,base,components}.css` | CSS extraído do bloco inline | 7 |

### Outros

| Item | Descrição | Commit |
|---|---|---|
| Rating unificado | Combina calibração + performance + análise chess.com com pesos | — |
| SRS leve | Card "REVISÃO DEVIDA" na TelaInicio (puzzles teimosos parados >3d) | — |
| Princípios mantra | 5 perguntas em `CLAUDE.md` antes de mergear | — |

---

## Em frente — pendente

### Eixo 1 — Análise: derivações futuras

| Item | Descrição | Estimativa |
|---|---|---|
| Modo 2 v2 — janela estendida | Inspeciona PV 2-3 plies à frente; captura sacrifícios preparatórios | ~2h |
| Briefing pré-jogo | Modo 2 simplificado, 30s, mental note ("ele cai em garfos · cavalo central") | ~3h |
| Pós-mortem pareado | Link de partida específica; análise dual (eu perdi + ele expôs) | ~4h |
| Histórico cabeça-a-cabeça | Evolução das fraquezas do oponente entre análises (usa `analysis_history`) | ~3h |
| Rivalry mode | Trigger automático após partida vs username conhecido | ~4-6h |

### Eixo 2 — Pressão e velocidade (fidelidade ao livro)

| Item | Descrição | Estimativa |
|---|---|---|
| Pace Coach | Indicador ao vivo "+12s vs Ciclo 1" no timer durante o puzzle | ~2h |
| Speedrun Mode | Fullscreen, board e timer gigantes, sem sidebar; Esc dupla | ~3h |
| No-pause Mode | Sem pause até completar bloco; desistência formal com penalidade | ~2h |
| Bloco-de-25 | Ciclos divididos em blocos de 25/50/100 com micro-cerimônia | ~3h |

### Eixo 6 — Experimentos restantes

| Item | Descrição | Estimativa |
|---|---|---|
| "Aposte em si mesmo" | Estima tempo total antes do ciclo; compara depois | ~2h |
| Visão por dica | Após 3 erros no mesmo puzzle, app sussurra "olhe pra peça em e5" | ~3h |
| Reverse mode | Começa pela posição final, volta um lance; treina visão final | ~5h |
| Blindfold mode | Posição vista por N seg, depois só notação textual + lista de peças | ~6h |

---

## Ondas sugeridas

| Onda | Conteúdo | Total |
|---|---|---|
| A — Pressão Woodpecker | Pace Coach + Speedrun + No-pause + Bloco-25 | ~7-10h |
| B — Derivações Modo 2 | v2 janela + briefing + H2H + pós-mortem | ~8-10h |
| C — Experimentos | Aposte em si + Visão por dica + Reverse + Blindfold (escolher) | varia |
| D — Long-running | Rivalry mode | ~4-6h |

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
   código novo de Stockfish, zero novo classificador.
3. **Custo cognitivo na UI é proporcional ao ganho?** Speedrun, Modo
   monge e Pattern Flash são opt-in para evitar inflar a UI default.
