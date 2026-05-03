// Domínio de conjunto: tipos, ciclo de vida (ativo → pronto → concluído),
// metas por tipo e regras de "limite de 3 ativos". Lógica pura, zero
// React, zero localStorage.
(function (global) {
  "use strict";

  // 3 tipos canônicos. Cada um tem propósito distinto e cadência própria.
  const TIPOS = {
    PADRAO:     "padrao",      // manutenção/aquecimento, open-ended
    PESSOAL:    "pessoal",     // foco em suas fraquezas (chess.com Modo 3)
    ADVERSARIO: "adversario",  // prep contra alguém (chess.com Modo 2)
  };

  // Nomes em pt-BR pra UI.
  const NOMES_TIPOS = {
    padrao:     "Padrão",
    pessoal:    "Plano pessoal",
    adversario: "Contra adversário",
  };

  const ICONES_TIPOS = {
    padrao:     "♞",
    pessoal:    "🎯",
    adversario: "⚔",
  };

  // Meta de ciclos por tipo. Padrão é open-ended (null) — usuário marca
  // manualmente. Pessoal segue Smith/Tikkanen (6-7). Adversário é prep
  // pontual (3-4).
  const META_CICLOS = {
    padrao:     null,
    pessoal:    7,
    adversario: 4,
  };

  // Limite máximo de conjuntos ativos simultâneos. Estrito.
  const LIMITE_ATIVOS = 3;

  // Determina tipo de um conjunto, com fallback compatível com schema
  // antigo (sem campo `tipo`).
  function tipoDe(conjunto) {
    if (!conjunto) return TIPOS.PADRAO;
    return conjunto.tipo || TIPOS.PADRAO;
  }

  // Lista conjuntos ativos (não concluídos). Aceita tanto conjuntos com
  // `concluido: true` explícito quanto schemas antigos sem o campo.
  function conjuntosAtivos(conjuntos) {
    return (conjuntos || []).filter(c => !c.concluido);
  }

  function conjuntosConcluidos(conjuntos) {
    return (conjuntos || []).filter(c => !!c.concluido);
  }

  // Pode criar mais um? Limite estrito de LIMITE_ATIVOS.
  function podeCriarNovo(conjuntos) {
    return conjuntosAtivos(conjuntos).length < LIMITE_ATIVOS;
  }

  // Razão entre tempo total do ciclo atual e baseline (Ciclo 1).
  // Usado pra detectar halving (razão <= 0.5).
  function razaoBaseline(ciclos) {
    if (!ciclos || ciclos.length < 2) return null;
    const ord = ciclos.slice().sort((a, b) => a.numero - b.numero);
    const baseline = ord[0];
    const ultimo = ord[ord.length - 1];
    if (!baseline || !baseline.tempo_total_s) return null;
    if (!ultimo || !ultimo.tempo_total_s) return null;
    return ultimo.tempo_total_s / baseline.tempo_total_s;
  }

  // Está pronto pra concluir? Regras por tipo:
  //   padrao:     nunca automático (usuário decide)
  //   pessoal:    >= meta_ciclos OR halving (razão <= 0.5)
  //   adversario: >= meta_ciclos OR halving
  // Retorna { pronto: bool, motivo: 'meta' | 'halving' | null }.
  function prontoPraConcluir(conjunto, ciclos) {
    if (!conjunto || conjunto.concluido) return { pronto: false, motivo: null };
    const t = tipoDe(conjunto);
    if (t === TIPOS.PADRAO) return { pronto: false, motivo: null };
    const cs = (ciclos || []).filter(c => c.conjunto_id === conjunto.id);
    if (cs.length === 0) return { pronto: false, motivo: null };
    const meta = META_CICLOS[t];
    if (meta && cs.length >= meta) return { pronto: true, motivo: "meta" };
    const r = razaoBaseline(cs);
    if (r != null && r <= 0.5) return { pronto: true, motivo: "halving" };
    return { pronto: false, motivo: null };
  }

  // Marca conjunto como concluído. Função pura: retorna novo objeto, não
  // muta o original. data_concluido capturada no momento da chamada.
  function concluir(conjunto, agoraOpts) {
    const agora = agoraOpts || Date.now();
    return Object.assign({}, conjunto, {
      concluido: true,
      data_concluido: agora,
    });
  }

  // Conta conjuntos ativos por tipo. Útil pra UI ("você já tem 1 plano
  // pessoal ativo"). Não impede criar — só informa.
  function contagemPorTipo(conjuntos) {
    const ativos = conjuntosAtivos(conjuntos);
    const out = { padrao: 0, pessoal: 0, adversario: 0 };
    for (const c of ativos) {
      const t = tipoDe(c);
      if (out[t] != null) out[t] += 1;
    }
    return out;
  }

  global.WP = global.WP || {};
  global.WP.Conjunto = {
    TIPOS:               TIPOS,
    NOMES_TIPOS:         NOMES_TIPOS,
    ICONES_TIPOS:        ICONES_TIPOS,
    META_CICLOS:         META_CICLOS,
    LIMITE_ATIVOS:       LIMITE_ATIVOS,
    tipoDe:              tipoDe,
    conjuntosAtivos:     conjuntosAtivos,
    conjuntosConcluidos: conjuntosConcluidos,
    podeCriarNovo:       podeCriarNovo,
    razaoBaseline:       razaoBaseline,
    prontoPraConcluir:   prontoPraConcluir,
    concluir:            concluir,
    contagemPorTipo:     contagemPorTipo,
  };
})(typeof window !== "undefined" ? window : globalThis);
