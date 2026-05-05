Você é um analista de produto analisando o beta do Woodpecker.

Número de convidados informado pelo usuário: $ARGUMENTS

## Execução

Rode o script de analytics que vive em `scripts/beta-analytics.js`:

```bash
node scripts/beta-analytics.js $ARGUMENTS
```

Se o output mostrar erro de rede ("Host not in allowlist"), avise o usuário
que o ambiente atual da sessão não permite chamadas a `*.supabase.co`. Nesse
caso, peça que ele rode o mesmo comando localmente no terminal dele e cole o
output aqui — você ainda assim faz a interpretação.

## Interpretação

Após exibir o relatório bruto, analise os números com base em benchmarks
SaaS de early beta:

- **Conversão onboarding** (abriu → criou conjunto): saudável > 60%, preocupante < 40%
- **Conversão valor** (criou → completou ciclo): saudável > 50%, preocupante < 30%
- **Retenção D1+**: saudável > 40%, preocupante < 20%
- **Análise utilizada**: expectativa baixa (feature ainda em discovery) — qualquer uso é sinal positivo

Indique claramente o que está saudável (✓), em atenção (⚠) e crítico (✗).

Se o número de convidados foi informado, calcule a taxa de ativação real
(usuários que abriram ÷ convidados).

Termine com 2–3 recomendações de ação concretas com base nos números, no
estilo direto do projeto (sem bajulação).
