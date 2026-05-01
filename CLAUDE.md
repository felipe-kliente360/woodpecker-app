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

### Arquitetura em camadas (pós-refatoração)
- `index.html` — shell + tags `<script>` + render root. Bloco babel-standalone
  apenas para o `App.render()`.
- `lib/` — vendor (chess.js, chart.umd.js, stockfish.js/.wasm, etc.) e
  features standalone que já são modulares (chess-analysis, tactical-*).
- `src/data/` — adapters de persistência (única camada que toca
  `localStorage`/IndexedDB).
- `src/domain/` — lógica pura, zero React, zero `localStorage`. Testável em
  Node sem dependências.
- `src/hooks/` — hooks React customizados que compõem domain + data.
- `src/ui/` — componentes JSX. Recebem props ou consomem hooks. **Zero**
  acesso direto a `localStorage` ou domain logic inline.
- `tests/` — `node:test` zero-deps para domain.

### Zero build
- Sem Vite, sem TypeScript build, sem npm install em produção.
- React + Babel via CDN, transpile no browser.
- Múltiplos arquivos servidos same-origin pelo Netlify continuam single-deploy.
- Single-file deploy: o app abre direto no Netlify, mas pode ser desenvolvido
  com qualquer servidor estático local.

## Idioma
Toda UI e código (variáveis, comentários, mensagens) em **pt-BR**.

## Dados dos puzzles
Hospedados em `puzzles/` no próprio repo (Netlify same-origin), faixas em
`.json.gz` descompactadas no browser via Pako. Mirror em GitHub Releases
`felipe-kliente360/woodpecker-puzzles` tag `v1.0-puzzles`.

## Princípios para feature daqui pra frente (mantra)

Cada feature deve responder **sim** a estas 5 perguntas antes de ir pra `main`:

1. **Domain isolado?** Lógica pura mora em `src/domain/`. Não foi parar
   dentro de um componente React.
2. **Persistência via Store?** Acesso a `localStorage`/IndexedDB **só**
   através de `WP.Store` (ou wrappers em `src/data/`). Zero
   `localStorage.getItem` em UI ou domain.
3. **Componente razoável?** Regra de polegar: ≤ 150 linhas, ≤ 5 `useState`
   por componente. Acima disso, extrair para hook ou subcomponente.
4. **Teste do domain?** Pelo menos os caminhos críticos do domain ganham
   um caso em `tests/`. Bug de cálculo precisa ser detectável fora do
   browser.
5. **Cabe em arquivo único?** Tela > 200 linhas vira **pasta** com
   subcomponentes (`src/ui/TelaX/index.jsx` + irmãos).

Quando a resposta for "não", a feature é refatorada antes de mergear, ou o
débito é registrado como TODO de roadmap — nunca silencioso.

## Tom de voz

5 princípios para qualquer copy nova ou alterada:

1. **Direto, não bajulador.** "✓ 8s" em vez de "Ótimo! Você acertou em 8s 🎉".
   Deixa o número falar.
2. **Honesto sobre lentidão.** Acertar em 90s um puzzle 1200 não é vitória —
   marcar com "longo". Não premiar mediocridade.
3. **Vocabulário do método é identidade.** "ciclo", "baseline", "halving",
   "padrão" — manter crus, sem traduzir pra "round", "best time", etc.
4. **Coach, não amigo.** Frases curtas, factuais, sem emoji decorativo.
   Emojis só quando carregam significado (✓ ✗ ⏭ ⚠ 🔍 ⚔).
5. **Não explicar o óbvio.** Se o ícone é ✓ verde, dispensa "Correto!".

### Glossário canônico

| Contexto | Forma a usar |
|---|---|
| Acerto rápido | `✓ 8s` |
| Acerto lento (>60s em puzzle ≤1500) | `✓ 1m45s · longo` |
| Erro | `✗ — solução:` |
| Pulado | `⏭ pulado — solução:` |
| Análise pronta | `Pronto. {N} partidas analisadas.` |
| Empty state — sem conjuntos | `Sem conjuntos. O método começa com um.` |
| Halving atingido | `Halving. 50% do baseline.` |
| Confirmar reanalise | `Reanalisar {usuario}? Leva alguns minutos.` |
| Loading genérico | `Carregando...` (não "Aguarde", não "...") |
