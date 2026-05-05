# Strategy — Woodpecker

Tese de produto e go-to-market. Arquivo vivo: atualizar quando a
conversa produzir nova tese, não tratar como foto.

`ROADMAP.md` responde **"como e quando"**. Este arquivo responde
**"porquê e pra quem"**.

---

## Premissa atual

V1 funcional pronta para beta fechado. O método está implementado de
ponta a ponta (ciclos, baseline, halving, meta de 5), análise
chess.com → set ponderado funciona, onboarding existe, UX repaginada
e consistente. Decisão estratégica agora não é "o que construir" —
é **como crescer**.

---

## Benchmark competitivo

| Produto | Foco | Fraqueza crítica |
|---|---|---|
| **Chess.com Puzzles** | Volume + gamificação + streak diário | Nenhum método; sem pipeline análise→set; US$15/mês |
| **Lichess Puzzles** | Gratuito, rating calibrado, OSS | Zero método; sem ciclos; sem tracking de tempo por ciclo |
| **ChessTempo** | Sets personalizados, filtragem séria | UI de 2010; sem análise automática de partidas; sem conceito de ciclo |
| **Chessable** | SRS para aberturas/finais, courses | Foco em memorização de linhas, não tática pura; ~US$100/ano |
| **Puzzle Rush** (Chess.com) | Velocidade gamificada | Entretenimento, não método; zero transferência pra partida real |

**Conclusão:** ninguém fecha o loop **`analisa suas partidas →
detecta fraqueza → cria set ponderado → treina em ciclos com
halving`**. ChessTempo é o mais próximo em seriedade, mas anos-luz
atrás em UX e sem a análise automática.

---

## Diferenciais reais (não copywriting)

1. **O método implementado de ponta a ponta** — ciclo, baseline,
   halving, meta de 5. Axel Smith / Hans Tikkanen não tem app
   oficial; o Woodpecker ocupa esse vácuo.
2. **Pipeline análise → set ponderado** — único no mercado. "Você
   perde 70% das vezes para garfos → 40% do seu próximo set é
   garfo, peso invertido pela eficiência."
3. **Análise de adversário** — ninguém tem. "Antes de jogar contra
   X, veja onde ele peca taticamente."
4. **UX anti-gamificação** — o público-alvo (1200–1800 plateau)
   está farto de Chess.com com troféus, streaks de fogo e elogios
   automáticos. Tom de coach honesto é diferencial real, não
   estética.
5. **Zero cadastro / privacidade by design** — funciona offline
   após primeiro load, dados ficam no browser, nada de servidor.

---

## Público-alvo

Jogador de clube, **1200–1800 Elo**, no segmento de "plateau
frustrante":

- Sério o suficiente pra querer método (já ouviu falar do livro
  Woodpecker, já tentou seguir planilha)
- Casual o suficiente pra não ter tempo/disciplina de montar tudo
  sozinho
- Provavelmente já assina Chess.com Diamond ou Lichess Patron, mas
  sente que falta direção

Nicho secundário: **coaches** que querem prescrever sets aos
alunos sem perder tempo curando manualmente.

---

## Gaps para lançamento com credibilidade

| Item | Urgência | Por quê |
|---|---|---|
| **Suporte Lichess** | Alta | ~40% dos jogadores sérios estão lá; bloqueia aquisição |
| **Landing page estática** | Alta | Sem ela, nenhum link compartilhável fora do app |
| **Política de privacidade** | Alta | Pré-requisito pra qualquer divulgação pública / app store |
| **Import PGN manual** | Média | Resguarda usuários que não querem conectar conta |
| **PWA installable** | Média | Chess no mobile é 60M+ usuários no Chess.com; público usa |
| **Share PNG do ciclo** | Média | Viral loop: "Ciclo 3 — 47% mais rápido que baseline" |

---

## Estratégia de lançamento (3 fases)

### Fase 1 — Beta fechado (agora, sem mudanças adicionais)
- 10–20 jogadores de clube, distribuição pessoal
- Objetivo: validar que o loop análise → treino funciona pra outros
  além de quem construiu
- Coleta: onde confundem, onde abandonam, qual parte fideliza

### Fase 2 — Lançamento de comunidade (após Lichess + landing)
- Post em **r/chess** e **r/chessbeginners**: tom técnico, sem
  hype — *"Implementei o Woodpecker Method como webapp; analisa
  suas partidas e cria sets ponderados pelas fraquezas reais"*
- **YouTube**: parceria com canal médio (50–200k inscritos) pra
  tutorial/review honesto
- **Fóruns do livro Woodpecker Method** — leitores do Axel Smith
  são audiência cativa esperando exatamente isso
- **Discord** chess servers segmentados por rating

### Fase 3 — Monetização

Dois modelos viáveis. Recomendação: **opção B**.

**Opção A — Freemium clássico**
- Grátis: 1 set ativo, análise básica
- Premium US$6/mês: análise ilimitada, 3 sets, adversário,
  histórico completo

**Opção B — Lifetime deal (recomendado)**
- Grátis pra sempre na essência
- "Apoio o projeto" US$29 ou US$49 lifetime — acesso antecipado
  a features, badge no perfil, voz no roadmap
- **Razão:** o público que odeia gamificação também odeia
  assinatura. Pagamento único alinha com posicionamento de
  "coach honesto, sem armadilha". AppSumo tem exatamente esse
  perfil de comprador.

---

## Ondas de prioridade pré-lançamento

| Onda | Conteúdo | Impacto no GTM |
|---|---|---|
| **1 — Launch enablers** | Landing page + share PNG + política de privacidade | Necessário pra qualquer anúncio; sem isso, nada acontece |
| **2 — Aquisição** | Suporte Lichess + import PGN manual | Dobra o TAM acessível |
| **3 — Retenção** | PWA installable + nudge de ciclo atrasado | Retorno diário, hábito |
| **4 — Viral** | Share PNG do progresso + challenge compartilhável de adversário | Crescimento orgânico, custo zero |

---

## Risco principal

**Não é competição. É distribuição.**

O produto é melhor que o que existe pro nicho específico. O
problema é que ninguém sabe que existe. Landing page + post no
r/chess são o desbloqueador mais urgente — mais que qualquer
feature técnica adicional.

Se o lançamento na comunidade falhar (sem tração no r/chess), a
hipótese a revisar não é "o produto precisa de mais features", é
"o público-alvo está em outro lugar" (provavelmente coaches B2B,
não jogadores diretos).

---

## Princípios de tese (estável)

1. **Método > volume.** Não vamos competir com Chess.com em
   quantidade de puzzles. Vamos competir em **disciplina de
   prática**.
2. **Honestidade > engajamento.** Nenhum streak de fogo, nenhum
   "ótimo!". Cada interação respeita a inteligência do usuário.
3. **Pequeno > genérico.** Melhor servir 10k jogadores sérios
   do que 1M casuais. O nicho 1200–1800 sério é defensável.
4. **Privacidade > conversão.** Zero cadastro é diferencial e
   filosofia, não bug. Login social entra apenas se for opt-in
   pra recursos cross-device.
