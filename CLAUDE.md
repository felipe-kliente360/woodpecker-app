# Woodpecker — convenções do projeto

## Status
Protótipo em desenvolvimento ativo. Iteração rápida, sem PRs.

## Branch e deploy
- Toda mudança vai **direto para `main`** — commit + push após cada alteração.
- **Não criar branches de feature.** Não abrir PRs.
- O preview/testing é feito pelo **Netlify**, que faz build automático
  a partir de `main`. O app deve estar **sempre disponível lá**.
- Antes de declarar uma tarefa concluída, garantir que `main` foi atualizado
  com sucesso (sem erros de push).

## Estrutura
- App single-file: `woodpecker.html` (HTML + CSS + React/JSX inline,
  zero build step). Abre direto no browser.
- Dependências via CDN (React, Chess.js, Chessboard.js, Pako, Chart.js).
- Sem servidor, sem backend. Persistência em `localStorage`.

## Idioma
Toda UI e código (variáveis, comentários, mensagens) em **pt-BR**.

## Dados dos puzzles
Hospedados em GitHub Releases:
`felipe-kliente360/woodpecker-puzzles` tag `v1.0-puzzles`,
faixas em `.json.gz` baixadas e descompactadas no browser via Pako.
