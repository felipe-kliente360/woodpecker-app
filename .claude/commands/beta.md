Você é um analista de produto analisando o beta do Woodpecker.

Número de convidados informado pelo usuário: $ARGUMENTS

## Setup

Leia a service role key do Supabase da variável de ambiente SUPABASE_SERVICE_KEY.
Se não estiver definida, exiba:
  "⚠ SUPABASE_SERVICE_KEY não encontrada. Execute: export SUPABASE_SERVICE_KEY=eyJ..."
e encerre.

## Execução

Execute o seguinte pipeline de análise usando o Bash tool:

```bash
node -e "
const https = require('https');
const KEY = process.env.SUPABASE_SERVICE_KEY;
const INVITED = parseInt(process.argv[1]) || 0;

if (!KEY) { console.error('SUPABASE_SERVICE_KEY não definida'); process.exit(1); }

const options = {
  hostname: 'rziwpiaxybuvgrabtwir.supabase.co',
  path: '/rest/v1/eventos?select=evento,user_id,identified,dados,criado_em&order=criado_em.asc&limit=10000',
  headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY },
};

https.get(options, res => {
  let raw = '';
  res.on('data', d => raw += d);
  res.on('end', () => {
    const events = JSON.parse(raw);
    if (!Array.isArray(events)) { console.error('Erro Supabase:', raw.slice(0, 300)); process.exit(1); }

    // --- helpers ---
    const setOf = (tipo) => new Set(events.filter(e => e.evento === tipo).map(e => e.user_id));
    const countOf = (tipo) => events.filter(e => e.evento === tipo).length;

    // --- usuários únicos ---
    const allUsers = new Set(events.map(e => e.user_id));
    const identified = new Set(events.filter(e => e.identified).map(e => e.user_id));
    const anon = new Set([...allUsers].filter(u => !identified.has(u)));

    // --- funil ---
    const abriram    = setOf('app_aberto');
    const criaramSet = setOf('conjunto_criado');
    const ciclos_ok  = setOf('ciclo_concluido');
    const analisaram = setOf('analise_executada');

    // --- retenção: voltou em dia diferente do primeiro acesso ---
    const opensByUser = {};
    events.filter(e => e.evento === 'app_aberto').forEach(e => {
      const day = e.criado_em.slice(0, 10);
      if (!opensByUser[e.user_id]) opensByUser[e.user_id] = new Set();
      opensByUser[e.user_id].add(day);
    });
    const voltaram = Object.values(opensByUser).filter(days => days.size > 1).length;

    // --- ciclos: stats ---
    const cicloEvts = events.filter(e => e.evento === 'ciclo_concluido');
    const totalPuzzles = cicloEvts.reduce((s, e) => s + (e.dados && e.dados.total || 0), 0);
    const avgAcc = cicloEvts.length > 0
      ? Math.round(cicloEvts.reduce((s, e) => {
          const d = e.dados || {};
          return s + (d.total > 0 ? d.acertos / d.total : 0);
        }, 0) / cicloEvts.length * 100)
      : 0;

    // --- conjuntos: breakdown por tipo ---
    const conjEvts = events.filter(e => e.evento === 'conjunto_criado');
    const tipoCount = {};
    conjEvts.forEach(e => {
      const t = (e.dados && e.dados.tipo) || 'desconhecido';
      tipoCount[t] = (tipoCount[t] || 0) + 1;
    });
    const tipoStr = Object.entries(tipoCount).map(([t,c]) => t + ' ' + c).join(' · ');

    // --- período ---
    const datas = events.map(e => e.criado_em).sort();
    const inicio = datas[0] ? datas[0].slice(0, 10) : '—';
    const fim    = datas[datas.length - 1] ? datas[datas.length - 1].slice(0, 10) : '—';

    // --- pct helper ---
    const pct = (n, d) => d > 0 ? ' (' + Math.round(n/d*100) + '%)' : '';
    const N = allUsers.size;

    // --- output ---
    console.log('');
    console.log('=== BETA ANALYTICS — WOODPECKER ===');
    console.log('Período  : ' + inicio + ' → ' + fim);
    console.log('Convidados: ' + (INVITED || '?') + '  |  Usuários no sistema: ' + N + pct(N, INVITED || N));
    console.log('');
    console.log('AQUISIÇÃO');
    console.log('  Unique users          : ' + N + (INVITED ? pct(N, INVITED) : ''));
    console.log('  Identificados (cc)    : ' + identified.size + pct(identified.size, N));
    console.log('  Anônimos              : ' + anon.size + pct(anon.size, N));
    console.log('');
    console.log('ONBOARDING');
    console.log('  Abriram o app         : ' + abriram.size);
    console.log('  Criaram 1+ conjunto   : ' + criaramSet.size + pct(criaramSet.size, abriram.size));
    console.log('');
    console.log('LOOP DE VALOR');
    console.log('  Completaram 1+ ciclo  : ' + ciclos_ok.size + pct(ciclos_ok.size, criaramSet.size || abriram.size));
    console.log('  Total de ciclos       : ' + countOf('ciclo_concluido'));
    console.log('  Total de puzzles      : ' + totalPuzzles);
    console.log('  Acurácia média        : ' + avgAcc + '%');
    console.log('');
    console.log('ANÁLISE CHESS.COM');
    console.log('  Usaram análise        : ' + analisaram.size + pct(analisaram.size, N));
    console.log('  Total de análises     : ' + countOf('analise_executada'));
    console.log('');
    console.log('CONJUNTOS');
    console.log('  Criados (total)       : ' + countOf('conjunto_criado'));
    console.log('  Por tipo              : ' + (tipoStr || '—'));
    console.log('');
    console.log('RETENÇÃO');
    console.log('  Voltaram 1+ dia       : ' + voltaram + pct(voltaram, N));
    console.log('');
    console.log('SAÚDE DO BETA');
    const engajamento   = ciclos_ok.size;
    const conv_onb      = abriram.size > 0 ? Math.round(criaramSet.size / abriram.size * 100) : 0;
    const conv_valor    = criaramSet.size > 0 ? Math.round(ciclos_ok.size / criaramSet.size * 100) : 0;
    const ret_d1        = abriram.size > 0 ? Math.round(voltaram / abriram.size * 100) : 0;
    console.log('  Conversão onboarding  : ' + conv_onb + '% (abriu → criou conjunto)');
    console.log('  Conversão valor       : ' + conv_valor + '% (criou conjunto → completou ciclo)');
    console.log('  Retenção D1+          : ' + ret_d1 + '% (voltou em outro dia)');
    console.log('  Análise utilizada por : ' + (N > 0 ? Math.round(analisaram.size/N*100) : 0) + '% dos usuários');
    console.log('');
  });
}).on('error', e => { console.error('HTTP error:', e.message); process.exit(1); });
" $ARGUMENTS
```

## Interpretação

Após exibir o relatório bruto, analise os números com base em benchmarks SaaS de early beta:

- **Conversão onboarding** (abriu → criou conjunto): saudável > 60%, preocupante < 40%
- **Conversão valor** (criou → completou ciclo): saudável > 50%, preocupante < 30%
- **Retenção D1+**: saudável > 40%, preocupante < 20%
- **Análise utilizada**: expectativa baixa (feature ainda em discovery) — qualquer uso é sinal positivo

Indique claramente o que está saudável (✓), em atenção (⚠) e crítico (✗).

Se o número de convidados foi informado, calcule também a taxa de ativação real (usuários que abriram ÷ convidados).

Termine com 2–3 recomendações de ação concretas com base nos números, no estilo direto do projeto (sem bajulação).
