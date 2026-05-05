-- ============================================================================
-- Beta Analytics — Woodpecker
-- Rodar no SQL Editor do Supabase. Output de cada query responde uma das
-- perguntas do beta. Cole o resultado na conversa pra interpretação.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. SETUP — função de migração de identidade (rodar 1x, idempotente)
-- ----------------------------------------------------------------------------
-- Chamada pelo client quando usuário configura chess.com pela primeira vez.
-- Re-atribui eventos do beta_id (anônimo) pra chess username.
create or replace function migrar_user_id(old_id text, new_id text)
returns void
language plpgsql
security definer
as $$
begin
  update eventos
  set user_id = new_id, identified = true
  where user_id = old_id;
end;
$$;

grant execute on function migrar_user_id(text, text) to anon;


-- ----------------------------------------------------------------------------
-- 1. FUNIL DE ATIVAÇÃO — onboarding funciona?
-- analise_aberta = abriu a tela (cacheado ou novo); analise_executada = rodou de fato.
-- ----------------------------------------------------------------------------
with funil as (
  select
    count(distinct user_id) filter (where evento = 'app_aberto')        as abriram,
    count(distinct user_id) filter (where evento = 'conjunto_criado')   as criaram,
    count(distinct user_id) filter (where evento = 'ciclo_concluido')   as completaram,
    count(distinct user_id) filter (where evento = 'analise_aberta')    as abriram_analise,
    count(distinct user_id) filter (where evento = 'analise_executada') as rodaram_analise,
    count(distinct user_id) filter (where evento = 'evolucao_aberta')   as viram_evolucao
  from eventos
)
select etapa, usuarios,
       coalesce(conv || '%', '—') as conv_etapa_anterior
from (
  select 1 as ord, '1. Abriram app'           as etapa, abriram         as usuarios, null::int as conv from funil
  union all select 2, '2. Criaram conjunto',     criaram,         round(criaram::numeric         / nullif(abriram,0) * 100)::int from funil
  union all select 3, '3. Completaram ciclo',    completaram,     round(completaram::numeric     / nullif(criaram,0) * 100)::int from funil
  union all select 4, '4. Abriram análise',      abriram_analise, round(abriram_analise::numeric / nullif(abriram,0) * 100)::int from funil
  union all select 5, '5. Rodaram análise',      rodaram_analise, round(rodaram_analise::numeric / nullif(abriram_analise,0) * 100)::int from funil
  union all select 6, '6. Viram evolução',       viram_evolucao,  round(viram_evolucao::numeric  / nullif(abriram,0) * 100)::int from funil
) f
order by ord;


-- ----------------------------------------------------------------------------
-- 2. VISÃO POR USUÁRIO — quem fez o quê
-- ----------------------------------------------------------------------------
select
  user_id,
  bool_or(identified)                                               as identified,
  count(distinct criado_em::date)                                   as dias_ativos,
  count(*) filter (where evento = 'conjunto_criado')                as conjuntos,
  count(*) filter (where evento = 'ciclo_concluido')                as ciclos,
  sum((dados->>'total')::int) filter (where evento = 'ciclo_concluido') as puzzles,
  round(avg((dados->>'acertos')::numeric / nullif((dados->>'total')::numeric, 0))
        filter (where evento = 'ciclo_concluido') * 100)            as acuracia_pct,
  count(*) filter (where evento = 'analise_executada')              as analises,
  min(criado_em)::date                                              as primeiro_dia,
  max(criado_em)::date                                              as ultimo_dia
from eventos
group by user_id
order by puzzles desc nulls last;


-- ----------------------------------------------------------------------------
-- 3. ATIVIDADE POR DIA — quem volta?
-- ----------------------------------------------------------------------------
select
  criado_em::date                                       as dia,
  count(distinct user_id)                               as usuarios_unicos,
  count(*) filter (where evento = 'app_aberto')         as aberturas,
  count(*) filter (where evento = 'ciclo_concluido')    as ciclos,
  count(*) filter (where evento = 'conjunto_criado')    as conjuntos_criados
from eventos
group by criado_em::date
order by dia desc;


-- ----------------------------------------------------------------------------
-- 4. RETENÇÃO D1 / D7 — quem volta em outro dia
-- ----------------------------------------------------------------------------
with primeiro_dia as (
  select user_id, min(criado_em::date) as d0
  from eventos
  where evento = 'app_aberto'
  group by user_id
),
retornos as (
  select
    p.user_id,
    bool_or(e.criado_em::date - p.d0 between 1 and 1) as voltou_d1,
    bool_or(e.criado_em::date - p.d0 between 1 and 7) as voltou_em_7d
  from primeiro_dia p
  left join eventos e
    on e.user_id = p.user_id and e.evento = 'app_aberto'
  group by p.user_id
)
select
  count(*)                                                                                as total_usuarios,
  count(*) filter (where voltou_d1)                                                       as voltaram_d1,
  round(count(*) filter (where voltou_d1)::numeric / nullif(count(*), 0) * 100) || '%'    as ret_d1,
  count(*) filter (where voltou_em_7d)                                                    as voltaram_em_7d,
  round(count(*) filter (where voltou_em_7d)::numeric / nullif(count(*), 0) * 100) || '%' as ret_d7
from retornos;


-- ----------------------------------------------------------------------------
-- 5. CONJUNTOS POR TIPO — preferência de uso
-- ----------------------------------------------------------------------------
select
  coalesce(dados->>'tipo', 'desconhecido')         as tipo,
  count(*)                                         as quantidade,
  round(avg((dados->>'tamanho')::numeric))         as tamanho_medio,
  round(avg((dados->>'temas_count')::numeric), 1)  as temas_medio
from eventos
where evento = 'conjunto_criado'
group by 1
order by 2 desc;


-- ----------------------------------------------------------------------------
-- 6. LOOP DE VALOR — quem está realmente treinando
-- ----------------------------------------------------------------------------
select
  user_id,
  count(*)                                                                              as ciclos,
  sum((dados->>'total')::int)                                                           as puzzles,
  round(avg((dados->>'acertos')::numeric / nullif((dados->>'total')::numeric, 0)) * 100) as acuracia_media,
  round(avg((dados->>'tempo_total_s')::numeric / nullif((dados->>'total')::numeric, 0))) as tempo_medio_por_puzzle_s,
  max((dados->>'ciclo_numero')::int)                                                    as ciclo_max,
  count(*) filter (where (dados->>'apenas_erros')::boolean)                             as ciclos_so_erros
from eventos
where evento = 'ciclo_concluido'
group by user_id
order by puzzles desc nulls last;
