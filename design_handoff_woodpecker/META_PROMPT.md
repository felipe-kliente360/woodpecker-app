# Meta-prompt para Claude Code — Woodpecker Redesign

> Cole o conteúdo abaixo como mensagem inicial no Claude Code, dentro do repositório do app Woodpecker, **depois** de ter copiado a pasta `design_handoff_woodpecker/` para a raiz do projeto (ou para `/design-reference/`).

---

## Prompt

Você é o engenheiro responsável por implementar a **repaginação completa do app Woodpecker** no codebase deste repositório.

A pasta `design_handoff_woodpecker/` na raiz contém:
- `README.md` — documentação completa do redesign (tokens, telas, comportamento, copy)
- `Woodpecker.html` + `*.jsx` + `styles.css` — protótipos HTML/JSX de **referência** (não são código de produção; servem só como fonte da verdade visual)
- Este `META_PROMPT.md`

### Sua missão

Recriar todas as 15 telas descritas no README **adaptando ao framework e padrões já estabelecidos neste projeto** (não copiar os JSX; portar). Mantenha pixel-fidelity em cores, tipografia, espaçamentos e hierarquia — o design é high-fidelity.

### Faça nesta ordem

1. **Reconhecimento do codebase** (não pule):
   - Liste a stack: framework (React/Vue/Svelte/...), build, roteamento, state, estilo (CSS modules, styled-components, Tailwind, etc.), bibliotecas de chess (chess.js? chessboard.js? react-chessboard?).
   - Identifique onde ficam: rotas, componentes globais, design tokens existentes, layout/shell.
   - Relate o que encontrou em 1 parágrafo antes de mudar qualquer arquivo.

2. **Design tokens primeiro**:
   - Leia a seção "Design Tokens" do `design_handoff_woodpecker/README.md`.
   - Crie/atualize o arquivo de tokens do projeto com **todas** as variáveis CSS (`--wp-*`) ou seu equivalente (Tailwind config, theme.ts, etc.).
   - Garanta que `oklch()` é suportado (fallback para hex se necessário, mas mantenha oklch como fonte da verdade).
   - Carregue Inter Tight, JetBrains Mono e Fraunces (Google Fonts). Configure `font-feature-settings: 'tnum'` para mono.

3. **Componentes compartilhados**:
   - `Button` (3 variantes: default outline, primary ocre, ghost)
   - `Input`
   - `Card` (com variante "selected" usando `--wp-accent` border + `--wp-accent-tint` bg)
   - `Tally` (motivo visual de marcas verticais — reutilizado em várias telas)
   - `Eyebrow` (label superior uppercase / 0.14em)
   - `BigNumber` (mono, hierarquia tipográfica de número grande)
   - `TabBar` (mobile) — para desktop ≥768px, criar `Sidebar` equivalente com mesmas 4 entradas
   - `Chessboard` — **usar a biblioteca de tabuleiro já presente no projeto** se houver; caso não haja, sugiro `react-chessboard` (React) ou `chessground` (lichess, vanilla, mais polido). Adapte o tema aos tokens `--wp-board-*`. Use peças SVG de qualidade (cburnett ou neo) — **não** os glyphs Unicode do protótipo, que são só placeholder.
   - `WpIcon` (set de ícones stroke 1.6 — pode usar lucide-react se já estiver no projeto, com `strokeWidth={1.6}`)

4. **Telas, na ordem de impacto**:
   1. **Resolver puzzle** (`ScreenPuzzle`) + 4 estados — é a tela mais usada
   2. **Home** (`ScreenHome`) — entry point diário
   3. **Pacote concluído** (`ScreenPackComplete`)
   4. **Sets** + **NewSet**
   5. **Stats** + **Profile**
   6. **Onboarding completo** (5 telas)

   Para cada tela: leia a seção correspondente no README, monte usando os componentes compartilhados, valide visualmente comparando com o protótipo HTML (`open design_handoff_woodpecker/Woodpecker.html` no browser).

5. **Comportamento e estado**:
   - Veja a seção "Interactions & Behavior" + "State management" do README.
   - Garanta que delta de tempo entre ciclos é calculado a partir de dados reais (não hardcoded como nas mocks).
   - Streak, constância 30 dias, gráfico de tempo médio por ciclo: tudo deve vir do estado real do backend.

6. **Responsividade**:
   - Mobile-first (390px design width).
   - 480–768px: max-width 440px centrado.
   - ≥768px: tab bar vira sidebar à esquerda (240px); conteúdo central max-width ~520px.

7. **Copy em português BR**, tom zen. Sem emoji. Sem exclamações. Sem celebrações artificiais. Veja "Tom de copy" no README.

### Não faça

- Não copie os arquivos `.jsx` do handoff diretamente — eles dependem de helpers da ferramenta de design (`DesignCanvas`, `DCArtboard`) e usam estilo inline que não combina com o codebase. Use-os só como **referência visual e estrutural**.
- Não altere a lógica de negócio do método Woodpecker (5 ciclos, pacotes de 10, calibração, 3 tipos de conjunto) — só a apresentação.
- Não introduza animações grandes (confetti, fireworks). O tom é zen.
- Não use emojis em UI alguma.
- Não invente novos tokens de cor; se precisar de uma cor que não existe nos tokens, adicione ao arquivo de tokens com convenção `--wp-*` em `oklch()`.

### Checklist de "pronto"

- [ ] Tokens CSS/theme criados e usados em todas as telas
- [ ] Fontes carregadas (Inter Tight, JetBrains Mono, Fraunces)
- [ ] 15 telas implementadas e roteadas
- [ ] Tabuleiro com tema custom + peças SVG de qualidade
- [ ] 4 estados de puzzle (idle/correct/almost/wrong) com transições suaves
- [ ] Tab bar mobile + Sidebar desktop
- [ ] Gráficos de stats com dados reais
- [ ] Streak e constância funcionando
- [ ] Copy em português, tom zen, sem emoji
- [ ] Comparação lado-a-lado com `Woodpecker.html` (abrir no browser) sem desvios visuais

### Quando estiver em dúvida

Releia a seção correspondente do `design_handoff_woodpecker/README.md`. Ele é a fonte da verdade. Se ainda houver ambiguidade, pergunte ao usuário antes de inventar.

Comece pelo passo 1 (reconhecimento do codebase) e relate o que encontrou.
