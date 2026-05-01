# Testes — Woodpecker

Suíte de testes do domain + data layer usando o `node:test` builtin.
Zero dependências externas (sem npm install).

## Rodar

```bash
node --test 'tests/*.test.cjs'
```

Ou um arquivo específico:

```bash
node --test tests/rating.test.cjs
```

## Cobertura atual

| Arquivo | Casos |
|---|---|
| `store.test.cjs` | 6 — fallback, round-trip JSON, watch/unwatch, migrar idempotente, compat loadLS/saveLS/clearLS, integridade de chaves |
| `rating.test.cjs` | 7 — calcularRatingSugerido (vazio, bracket alvo, taxa alta, clamp), ratingUnificado (sem dados, combinado, calibração) |
| `srs.test.cjs` | 7 — vazio, ciclo único, teimoso após 2 ciclos + 5 dias, único erro não conta, encontro recente não vence, opts custom, múltiplos conjuntos |
| `puzzle.test.cjs` | 6 — embaralhar, determinaCorJogador, corDoTabuleiro, lanceUciParaSan, sequenciaSan, aplicarLanceSilencioso |
| `ciclo.test.cjs` | 3 — metricasAtividade vazio/total/dias, nivelDoRating |
| `aggregator.test.cjs` | 4 — aggregateTactical, derivePuzzleProgram fundamentos por rating, ordem detected→rating |

**Total: 33 casos.**

## Loader

`_loader.cjs` carrega os módulos do projeto em sandbox `window`-like
para que o domain (que escreve em `window.WP.*`) funcione fora do
browser. `localStorage` é mockado em memória.

## O que NÃO está coberto

- Componentes React (precisa runner JSX — fora do escopo zero-deps).
- IndexedDB de chess-analysis.js (mock IDB seria outro projeto).
- Stockfish worker (irrelevante em CI).
- Layout/CSS (test visual — fora do escopo).

Estes seriam alvos de evolução futura caso surjam regressões.
