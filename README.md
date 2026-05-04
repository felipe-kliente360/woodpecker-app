# Woodpecker

**Repetição massiva de padrões táticos.** Você resolve o mesmo conjunto
de puzzles várias vezes. A meta é cortar o tempo total pela metade —
*halving* — a cada ciclo. Padrões que demoravam minutos viram
reconhecimento instantâneo.

App de chess training inspirado no **Woodpecker Method** (Hans Tikkanen
& Axel Smith). Standalone, roda no navegador. Sem login, sem
assinatura, dados locais.

---

## O método em uma linha

> Resolva um conjunto de puzzles. Resolva de novo. Resolva mais rápido.
> Repita até o tempo cair pela metade. É o sinal de que o padrão virou
> intuição.

Diferente da rotina de "puzzles novos todo dia", a chave aqui é o
mesmo conjunto, várias vezes. O método não treina cálculo bruto — treina
o **fingerprint do padrão**: você passa a *ver* a tática antes de
calcular.

---

## Como funciona

1. **Define seu rating** — calibragem (30 puzzles em faixa ampla) ou
   import lite do chess.com (média ponderada de rapid/blitz/bullet).
2. **Cria um conjunto** — 100, 300, 500 ou 1000 puzzles na sua faixa.
3. **Resolve.** Ciclo 1 é a baseline; todo ciclo seguinte compete
   contra ele.
4. **Repete.** Ciclo 2, 3, 4… até bater o halving (50 % do tempo do
   Ciclo 1).

---

## Tipos de conjunto

- **Padrão** — manutenção tática, puzzles aleatórios na sua faixa.
- **Plano pessoal** — análise das suas últimas partidas (Stockfish
  in-browser); foca nas suas fraquezas reais.
- **Contra adversário** — analisa um oponente específico, foca nos
  padrões que ele expõe (incluindo os que ninguém costuma punir).

---

## Features

### Núcleo do método
- Ciclos com baseline + tracking de halving
- Calibração por brackets — 30 puzzles em faixa ampla, sugere o
  rating onde você rende mais
- Sessão retomável (interrompeu? volta exatamente onde parou)
- Backup/import JSON, com auto-backup opcional pós-ciclo

### Treino
- Status bar única: nro/total · tempo do puzzle · tempo acumulado ·
  pace coach (vs Ciclo 1)
- Feedback compacto em 2 linhas; botão "Próximo" sempre acima
- Lance errado **fica visível** no tabuleiro com highlight vermelho —
  você vê o que jogou em vez de um snap-back que esconde o erro
- Pulso animado na borda + na casa de destino a cada acerto/erro
- Bolinhas indicando lances possíveis ao tocar ou segurar uma peça
- **Regra dos 3 erros**: a solução só aparece no 3º erro do mesmo
  puzzle (no mesmo conjunto, somando ciclos anteriores). Antes disso,
  "errou — próximo": força você a reler o padrão na próxima passada.
- **★ Vi de cara**: badge automático quando cada lance é resolvido em
  ≤ 3s — métrica de fluência separada do tempo total
- **Visão por dica**: após 3 erros históricos no mesmo puzzle, um
  sussurro discreto aponta a casa-fonte do lance correto (não a
  solução, só direciona o olhar)
- Notas inline por conjunto

### Análise de partidas (chess.com)
- Stockfish WASM rodando localmente — sem mandar partidas pra servidor
- **3 modos**: chances perdidas (Mode 1), adversário (Mode 2,
  ponderado 2× pra padrões impunes), plano completo (Mode 3, default)
- Sugestão automática dos **5 adversários mais enfrentados** dos
  últimos 3 meses (score ponderado rapid > blitz > bullet)
- Cobertura prévia (peek) varre meses **sem** rodar Stockfish
- Cache FEN→eval em IndexedDB — re-análises e jogadores que
  compartilham aberturas pulam o engine
- Two-pass shallow + deep, MultiPV otimizado, skip de aberturas:
  análise de 30 partidas em ~2-3 min
- Wake Lock pra manter a tela acesa durante a análise
- Histórico colapsável de análises do mesmo username

### Estrutura ritual
- Ritual de início de ciclo (baseline + meta + halving) a partir do
  Ciclo 2
- Bloco-de-N (25 / 50 / 100): pausa-cerimônia + reflexão escrita
  opcional
- "Aceitação do erro" no Ciclo 5+: errar nessa altura é normal —
  você está indo mais rápido, continue.

### Evolução (foto do progresso)
- 3 abas: **Total · Por tipo · Individual**
- Calendário de streak (heatmap GitHub-style, 84 dias)
- Heatmap por tema (tema × ciclo, taxa por célula)
- Comparador de ciclos A/B — top 5 maiores melhorias e 5 piorias por
  puzzle
- Sparkline por puzzle teimoso
- Personal Worst — top 10 puzzles em que você gastou mais tempo total
- Year-in-review automático após 365 dias do 1º ciclo

### Onboarding guiado
- Primeiro acesso: import do chess.com → conjunto inicial de **5
  puzzles** → 3 ciclos curtos pra sentir o método na pele
- Modal final oferece calibrar pra ajustar o rating e excluir o
  conjunto inicial se quiser

---

## Stack

- **Zero build.** React 18 via CDN, Babel Standalone transpilando no
  browser. Sem Vite, sem npm install em produção.
- **chess.js + chessboard.js** pra regras e UI do tabuleiro.
- **Stockfish WASM** — versão local em `lib/`, fallback CDN.
- **Puzzles**: Lichess CC0, hospedados no próprio repo em
  `puzzles/*.json.gz`, descomprimidos no browser via Pako.
- **Persistência**: `localStorage` (conjuntos, ciclos, sessão, rating)
  + IndexedDB (cache FEN, programas de análise).
- **Domain isolado** em `src/domain/` — lógica pura, testável em Node
  sem dependências.

Arquitetura em camadas:

```
src/
├── data/      — adapters de persistência (única camada que toca localStorage)
├── domain/    — lógica pura (rating, conjunto, ciclo, puzzle, ...)
├── hooks/     — React hooks customizados
├── ui/        — componentes JSX
└── styles/    — tokens, base, components
```

---

## Rodar local

```sh
git clone <repo>
cd woodpecker-app
python3 -m http.server 8000   # ou qualquer servidor estático
open http://localhost:8000
```

Não tem `npm install`. Não tem build step. O `index.html` se vira.

## Testes

Domain layer roda em Node sem dependências:

```sh
node --test tests/*.test.cjs
```

---

## Princípios

- **Direto, não bajulador.** "✓ 8s" em vez de "Ótimo! Você acertou em 8s 🎉".
- **Honesto sobre lentidão.** Acertar em 90s um puzzle 1200 não é
  vitória — marca como longo.
- **Vocabulário do método é identidade.** "ciclo", "baseline",
  "halving", "padrão" — sem traduzir pra "round" ou "best time".
- **Coach, não amigo.** Frases curtas, factuais, sem emoji decorativo.

Detalhes em [`CLAUDE.md`](CLAUDE.md).

## Roadmap

[`ROADMAP.md`](ROADMAP.md) — entregue (extenso) + em frente.
