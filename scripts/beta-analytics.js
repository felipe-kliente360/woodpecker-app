#!/usr/bin/env node
/* Beta analytics — Woodpecker.
   Busca eventos do Supabase e gera relatório formatado.
   Uso: node scripts/beta-analytics.js [num_convidados]
   Exemplo: node scripts/beta-analytics.js 20 */
'use strict';

const https = require('https');

const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6aXdwaWF4eWJ1dmdyYWJ0d2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzMzNTUsImV4cCI6MjA5MzU0OTM1NX0.OGPKtoJrLmYIw71JE3dQ4tEex-AQSO2iuwmIhNHIXbg';
const INVITED = parseInt(process.argv[2]) || 0;

const options = {
  hostname: 'rziwpiaxybuvgrabtwir.supabase.co',
  path: '/rest/v1/eventos?select=evento,user_id,identified,dados,criado_em&order=criado_em.asc&limit=10000',
  headers: { 'apikey': ANON, 'Authorization': 'Bearer ' + ANON },
};

https.get(options, res => {
  let raw = '';
  res.on('data', d => raw += d);
  res.on('end', () => {
    let events;
    try { events = JSON.parse(raw); }
    catch (e) { console.error('Parse error:', raw.slice(0, 300)); process.exit(1); }
    if (!Array.isArray(events)) { console.error('Erro Supabase:', raw.slice(0, 300)); process.exit(1); }
    if (events.length === 0) { console.log('\nNenhum evento ainda.\n'); return; }

    const setOf = (tipo) => new Set(events.filter(e => e.evento === tipo).map(e => e.user_id));
    const countOf = (tipo) => events.filter(e => e.evento === tipo).length;

    const allUsers = new Set(events.map(e => e.user_id));
    const identified = new Set(events.filter(e => e.identified).map(e => e.user_id));
    const anon = new Set([...allUsers].filter(u => !identified.has(u)));

    const abriram         = setOf('app_aberto');
    const criaramSet      = setOf('conjunto_criado');
    const ciclos_ok       = setOf('ciclo_concluido');
    const abriram_analise = setOf('analise_aberta');
    const rodaram_analise = setOf('analise_executada');
    const viram_evolucao  = setOf('evolucao_aberta');

    const opensByUser = {};
    events.filter(e => e.evento === 'app_aberto').forEach(e => {
      const day = e.criado_em.slice(0, 10);
      if (!opensByUser[e.user_id]) opensByUser[e.user_id] = new Set();
      opensByUser[e.user_id].add(day);
    });
    const voltaram = Object.values(opensByUser).filter(days => days.size > 1).length;

    const cicloEvts = events.filter(e => e.evento === 'ciclo_concluido');
    const totalPuzzles = cicloEvts.reduce((s, e) => s + (e.dados && e.dados.total || 0), 0);
    const avgAcc = cicloEvts.length > 0
      ? Math.round(cicloEvts.reduce((s, e) => {
          const d = e.dados || {};
          return s + (d.total > 0 ? d.acertos / d.total : 0);
        }, 0) / cicloEvts.length * 100)
      : 0;

    const conjEvts = events.filter(e => e.evento === 'conjunto_criado');
    const tipoCount = {};
    conjEvts.forEach(e => {
      const t = (e.dados && e.dados.tipo) || 'desconhecido';
      tipoCount[t] = (tipoCount[t] || 0) + 1;
    });
    const tipoStr = Object.entries(tipoCount).map(([t,c]) => t + ' ' + c).join(' · ');

    const datas = events.map(e => e.criado_em).sort();
    const inicio = datas[0] ? datas[0].slice(0, 10) : '—';
    const fim    = datas[datas.length - 1] ? datas[datas.length - 1].slice(0, 10) : '—';

    const pct = (n, d) => d > 0 ? ' (' + Math.round(n/d*100) + '%)' : '';
    const N = allUsers.size;

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
    console.log('  Abriram a tela        : ' + abriram_analise.size + pct(abriram_analise.size, N));
    console.log('  Rodaram análise nova  : ' + rodaram_analise.size + pct(rodaram_analise.size, N));
    console.log('  Total de aberturas    : ' + countOf('analise_aberta'));
    console.log('  Total de execuções    : ' + countOf('analise_executada'));
    console.log('');
    console.log('EVOLUÇÃO');
    console.log('  Viram evolução        : ' + viram_evolucao.size + pct(viram_evolucao.size, N));
    console.log('  Total de aberturas    : ' + countOf('evolucao_aberta'));
    console.log('');
    console.log('CONJUNTOS');
    console.log('  Criados (total)       : ' + countOf('conjunto_criado'));
    console.log('  Por tipo              : ' + (tipoStr || '—'));
    console.log('');
    console.log('RETENÇÃO');
    console.log('  Voltaram 1+ dia       : ' + voltaram + pct(voltaram, N));
    console.log('');
    console.log('SAÚDE DO BETA');
    const conv_onb   = abriram.size > 0 ? Math.round(criaramSet.size / abriram.size * 100) : 0;
    const conv_valor = criaramSet.size > 0 ? Math.round(ciclos_ok.size / criaramSet.size * 100) : 0;
    const ret_d1     = abriram.size > 0 ? Math.round(voltaram / abriram.size * 100) : 0;
    console.log('  Conversão onboarding  : ' + conv_onb + '% (abriu → criou conjunto)');
    console.log('  Conversão valor       : ' + conv_valor + '% (criou conjunto → completou ciclo)');
    console.log('  Retenção D1+          : ' + ret_d1 + '% (voltou em outro dia)');
    console.log('  Análise utilizada por : ' + (N > 0 ? Math.round(abriram_analise.size/N*100) : 0) + '% dos usuários');
    console.log('');
  });
}).on('error', e => { console.error('HTTP error:', e.message); process.exit(1); });
