# Roadmap — Woodpecker

Registro vivo de ideias para evolução do app, organizadas por afinidade
e por prioridade percebida. Não é compromisso de entrega — é mapa
estratégico. Riscar item indica conclusão (com referência ao commit).

## Estado atual (concluído)

- Núcleo do método Woodpecker: ciclos, baseline, halving, fadiga, modo
  espelho, calibração por brackets.
- Análise tática a partir do chess.com (Stockfish + classificação por
  fingerprint Lichess CC0).
- Persistência em `WP.Store` com chaves centralizadas.
- Domain puro testável (`src/domain/`, 33 casos `node:test`).
- Hooks customizados (`useJogoPuzzle`, `useCriarConjunto`,
  `useTimerComPausa`, `useKeyboardShortcuts`).
- UI parcialmente extraída (`Promocao`, `HistoricoAnalises`).
- SRS leve — card de revisão devida na TelaInicio.
- Rating unificado combinando calibração + performance + análise
  chess.com.

---

## Eixo 1 — Modos de análise (chess.com)

O analisador hoje produz Role A/B/C com janela de 1 ply após erro.
Modos abaixo reaproveitam 100% do pipeline; mudam apenas filtro de
output e copy.

### Modo 1 — Chances perdidas (auto-correção pura)
Filtra só temas A-dominantes (A > B+C). Remove fontes `heuristic` e
`rating` do `derivePuzzleProgram`. Resultado: "estas são as táticas
que estavam na sua frente e você não viu — sem maquiagem".

### Modo 2 — Análise de adversário
Input = username do oponente. Pipeline rerodá idêntico, mas resultado
é filtrado por (B+C) do oponente — pontos cegos que ele expõe.
Subdivisão útil: ponderar Role C 2× vs Role B 1× (não-punidos > já
punidos, porque os já punidos provavelmente foram corrigidos).
Conjunto sugerido: rating médio do oponente ± 100, top 5 temas.
Custo estimado: 3-4h.

#### Modo 2 v2 — janela estendida
Hoje só olhamos lance i+1. v2 estende pra 2-3 plies adiante usando o
PV que o Stockfish já retorna. Captura sacrifícios preparatórios e
combinações curtas. Custo: +2h após v1.

### Modo 3 — Plano completo (comportamento atual)
A + heurísticas por fase de erro + fundamentos por faixa de rating.
Mantém-se como default; Modos 1 e 2 são views especializadas sobre o
mesmo dado.

### UI de seleção
Sugestão pragmática: a tela mantém comportamento atual no primeiro
uso (Modo 3 default). Após resultado, dois botões secundários:
"Ver só meus erros" → Modo 1; "Trocar foco para um adversário" →
Modo 2 (pede outro username). Evita pré-decisão antes do usuário ver
o que tem.

### Derivações naturais do Modo 2

- **Briefing pré-jogo**: Modo 2 simplificado. 30 segundos olhando os
  top 3 temas do oponente. Não cria conjunto, cria mental note.
- **Pós-mortem pareado**: dado um link de partida específica entre
  você e oponente X, análise das 2 perspectivas no mesmo card —
  o que perdi + o que ele expôs.
- **Histórico cabeça-a-cabeça**: se você já analisou X antes, mostra
  evolução das fraquezas dele entre análises. "João corrigiu o
  fork-blindness, mas continua caindo em cravadas."
- **Rivalry mode**: trigger automático após cada partida contra
  username conhecido — "atualizar análise dele?".

---

## Eixo 2 — Pressão e velocidade (fidelidade ao livro)

O Woodpecker original é uma sessão intensa, ininterrupta. Nosso UX
hoje é gentil demais.

- **Pace Coach**: indicador ao vivo no timer "+12s vs ciclo 1" durante
  o puzzle. Hoje só pós-puzzle. ~2h.
- **Speedrun Mode**: fullscreen, board e timer gigantes, sem sidebar.
  Esc pede confirmação dupla. Pra sessões longas. ~3h.
- **No-pause Mode**: toggle por conjunto. Uma vez iniciado, sem
  pause até completar bloco ou desistir formal (com penalidade
  visual no histórico). ~2h.
- **Bloco-de-25**: cada ciclo dividido em blocos de 25/50/100 com
  micro-cerimônia entre eles ("respira, água, segue"). ~3h.

---

## Eixo 3 — Fluência de padrão (objetivo profundo do método)

O livro insiste: o objetivo é intuição imediata, não cálculo.

- **Marcador "Vi de cara"**: após acerto, botão opcional pra marcar
  "saquei imediatamente". Métrica nova: % de reconhecimento
  instantâneo, separada de tempo. Cognitivamente, 5s e 30s são
  diferentes. ~2h.
- **Pattern Flash**: modo paralelo (não substitui ciclo). Mostra
  posição por 2s → tela em branco → input do lance. Calibra
  intuição sem cálculo. ~5h.
- **Heatmap por tema**: gráfico mostrando qual tema melhorou mais
  entre ciclos. "Sua fork-recognition caiu 18% desde ciclo 3"
  reformula sentido da sessão. ~3h.
- **Sparkline por puzzle**: na lista de teimosos, linha do tempo nele
  em cada ciclo. Diferencia "ficou rápido" de "decorou". ~2h.

---

## Eixo 4 — Foto do progresso (data → narrativa)

- **Calendário de streak**: heatmap estilo GitHub de ciclos por dia.
  Aciona vontade de manter o tracinho diário. ~3h.
- **Year-in-review automático**: a cada 365 dias do 1º ciclo, gera
  post-mortem visual: ciclos completos, puzzles únicos vistos,
  halvings atingidos, tema mais melhorado. ~5h.
- **Comparador de ciclos lado a lado**: selecionar 2 ciclos do mesmo
  conjunto e ver as 5 maiores melhorias e 5 piores piorias por
  puzzle. ~3h.
- **Personal Worst**: lista dos 10 puzzles em que mais gastou tempo
  agregado. Pode ser ponto cego ou só puzzle complexo — usuário
  decide. ~2h.

---

## Eixo 5 — Estrutura ritual (o que diferencia o método)

- **Smith/Tikkanen presets na TelaCriar**: 3 botões — Mini Woodpecker
  (100×6), Standard (300×7), Full (1000×8). Pré-fixa tamanho E
  expectativa de número de ciclos. ~1h.
- **Reflexão a cada 50**: pop-up leve a cada 50 puzzles dentro de um
  ciclo: "1 frase: o que você notou?" (opt-out). Diário implícito.
  ~3h.
- **Ritual de início de ciclo**: tela bridge entre conjuntos. Mostra
  histórico, qual ciclo começa, meta de tempo, quote do livro.
  Onboarda mentalmente. ~2h.
- **"Aceitação do erro"**: em ciclo 5+, mensagens diferentes — "errar
  nessa altura é normal — está indo mais rápido. Continue." A culpa
  do erro tardio é fricção real do método. ~1h.

---

## Eixo 6 — Experimentos criativos (alto risco, alta recompensa)

- **Blindfold mode**: posição visível por N segundos, depois apenas
  notação textual + lista de peças. Lance digitado. Faixa expert.
  ~6h.
- **Reverse mode**: começa pela posição final (mate), volta um lance,
  usuário precisa encontrar o penúltimo. Treina visão final. ~5h.
- **Visão por dica**: após 3 erros no mesmo puzzle ao longo de
  ciclos, app sussurra "olhe pra peça em e5". Não dá resposta, dá
  foco. ~3h.
- **Modo monge**: tela 100% preta, só timer texto. Sem badges, sem
  rating, sem temas — só posição+timer. Reduz fricção mental. ~2h.
- **Companion áudio (opt-in)**: tique de relógio leve durante puzzle.
  Sucesso = acorde de fé. Erro = thud surdo. Pavlov leve. ~3h.
- **"Aposte em si mesmo"**: antes do ciclo, usuário estima seu tempo
  total. Depois compara. Calibra autopercepção. ~2h.

---

## Eixo 7 — Polimento contínuo

- **Atalhos Vim-style desktop**: h/j/k/l + Enter para navegar tudo
  sem mouse. Power-user.
- **Compartilhar imagem do ciclo**: botão exporta resultado como PNG
  via canvas. Permite postar progresso sem perfil público.
- **Onboarding interativo**: primeira visita guiada (criar conjunto
  pequeno, fazer 3 puzzles, ver evolução).
- **Dark/light auto**: seguir `prefers-color-scheme`. Hoje toggle
  manual.

---

## Próximas ondas sugeridas (ordem de execução)

### Onda 1 — Modos de análise (~6-8h, valor alto)
1. Modo 1 (chances perdidas) — 1-2h
2. Modo 2 v1 (adversário, janela 1 ply) — 3-4h
3. Reframing UI dos 3 modos — 2h

### Onda 2 — Reforço da pressão Woodpecker (~6-8h)
1. Pace Coach — 2h
2. Marcador "Vi de cara" — 2h
3. Smith/Tikkanen presets — 1h
4. Ritual de início de ciclo — 2h

### Onda 3 — Foto do progresso (~6-8h)
1. Calendário de streak — 3h
2. Sparkline por puzzle — 2h
3. Comparador de ciclos — 3h

### Onda 4 — Experimentos (escolher por afinidade)
1. Pattern Flash mode — 5h
2. Briefing pré-jogo (deriva do Modo 2) — 3h
3. "Aposte em si mesmo" — 2h

### Onda 5+ — Backlog longo
- Modo 2 v2 (janela 2-3 plies)
- Pós-mortem pareado
- Heatmap por tema
- Reflexão a cada 50
- "Aceitação do erro" (mensagens contextuais)
- Year-in-review
- Modo monge
- Blindfold / Reverse / Visão por dica

---

## Princípios de seleção

Toda nova feature passa pelas 5 perguntas mantra do CLAUDE.md antes
de mergear. Antes disso, passa também por:

1. **Tem fidelidade ao método ou abre exploração intencional?** Não
   adicionar feature genérica de chess training se não respeita a
   filosofia Woodpecker (repetição massiva, intuição, velocidade).
2. **Reaproveita pipeline existente?** Modos 1/2/3 são exemplo: zero
   código novo de Stockfish, zero novo classificador. Quando feature
   exige nova engine, repensar prioridade.
3. **Custo cognitivo na UI é proporcional ao ganho?** Speedrun e
   Modo monge são opt-in para evitar inflar a UI default.
