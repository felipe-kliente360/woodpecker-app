// Agregador tático: port direto do código JS especificado em
// woodpecker-impl-prompt.md (chess-scout-prototipo).
// Expõe globalmente como window.TacticalAggregator.

(function (global) {
  "use strict";

  const TC_WEIGHTS = { rapid: 2.0, blitz: 1.0, bullet: 0.0, daily: 0.0 };
  const ROLE_WEIGHTS = { A: 1.5, B: 1.2, C: 0.6 };
  const RANK_FACTOR  = [1.0, 0.5, 0.25];
  const MIN_RB_FOR_BULLET_ZERO = 15;

  const CANONICAL_THEMES = {
    fork:               "garfo — uma peça ataca duas ao mesmo tempo",
    pin:                "cravada — peça presa que não pode mover sem expor outra",
    skewer:             "espeto — força a peça da frente a sair, capturando a de trás",
    discoveredAttack:   "ataque descoberto — uma peça sai e revela ataque de outra",
    doubleCheck:        "xeque duplo — duas peças dão xeque, rei obrigado a mover",
    deflection:         "desvio — força peça defensora a sair de função",
    attraction:         "atração — atrai peça para casa ruim (isca)",
    capturingDefender:  "remoção do defensor — captura ou afasta quem protege",
    backRankMate:       "mate na fila do fundo — rei sem fuga na 1ª/8ª linha",
    smotheredMate:      "mate sufocado — cavalo dá mate com peças próprias bloqueando",
    sacrifice:          "sacrifício — entregar material por vantagem maior",
    intermezzo:         "lance intermediário (intermezzo) — forçante antes do esperado",
    kingsideAttack:     "ataque ao rei — sacrifícios em h7/g7, abrir colunas",
    attackingF2F7:      "ataque em f2/f7 — armadilha de abertura em casa fraca",
    rookEndgame:        "final de torres — Lucena, Philidor, atividade da torre",
    pawnEndgame:        "final de peões — oposição, regra do quadrado",
    mateIn1:            "mate em 1",
    mateIn2:            "mate em 2 — sequência forçada",
    overloading:        "sobrecarga — peça defensora com tarefas demais",
    trappedPiece:       "peça presa — sem escapatória sem perda material",
    xRayAttack:         "raio X — ataque que atravessa peça intermediária",
    queensideAttack:    "ataque na ala da dama",
    promotion:          "promoção — peão chega à 8ª fileira",
    enPassant:          "en passant",
  };

  function aggregateTactical(moves) {
    const gameTimeClasses = {};
    for (const m of moves) gameTimeClasses[m.game_index] = m.time_class;

    const tcCounts = {};
    for (const tc of Object.values(gameTimeClasses))
      tcCounts[tc] = (tcCounts[tc] || 0) + 1;

    const nRapidBlitz = (tcCounts.rapid || 0) + (tcCounts.blitz || 0);
    const nBullet     = tcCounts.bullet || 0;
    const bulletW     = nRapidBlitz >= MIN_RB_FOR_BULLET_ZERO ? 0.0
                      : nBullet > 0 ? 0.4 : 0.0;
    const weightsAdapted    = bulletW > 0;
    const effectiveWeights  = Object.assign({}, TC_WEIGHTS, { bullet: bulletW });

    const weighted      = {};
    const breakdown     = {}; // breakdown ponderado (A=1.5, B=1.2, C=0.6)
    const raw_breakdown = {}; // breakdown sem peso de role — pra Modo 2 reponderar
    const roleTotals    = { A: 0, B: 0, C: 0 };

    const flagged = moves.filter(m =>
      m.tactical_role &&
      m.tactical_theme &&
      (m.loss_cp || 0) >= 50
    );

    for (const m of flagged) {
      const role  = m.tactical_role || 'B';
      const tc    = m.time_class    || 'blitz';
      const tcW   = effectiveWeights[tc] != null ? effectiveWeights[tc] : 0;
      if (tcW === 0) continue;

      const roleW = ROLE_WEIGHTS[role] || 1.0;

      let themeEntries = [];
      if (Array.isArray(m.tactical_themes) && m.tactical_themes.length) {
        themeEntries = m.tactical_themes.slice(0, 3).map((t, i) => ({
          theme: typeof t === 'string' ? t : t.theme,
          rf: RANK_FACTOR[i] != null ? RANK_FACTOR[i] : 0.25,
        }));
      } else if (m.tactical_theme) {
        themeEntries = [{ theme: m.tactical_theme, rf: 1.0 }];
      }

      for (const e of themeEntries) {
        const theme = e.theme; const rf = e.rf;
        if (!theme) continue;
        const baseW = tcW * rf;          // sem role weight — pra reponderação por modo
        const w     = roleW * baseW;
        weighted[theme]  = (weighted[theme]  || 0) + w;
        if (!breakdown[theme])     breakdown[theme]     = { A: 0, B: 0, C: 0 };
        if (!raw_breakdown[theme]) raw_breakdown[theme] = { A: 0, B: 0, C: 0 };
        breakdown[theme][role]     += w;
        raw_breakdown[theme][role] += baseW;
        roleTotals[role] = (roleTotals[role] || 0) + w;
      }
    }

    // Top 10 por score ponderado padrão (Modo 3). Modos 1 e 2 olham
    // breakdown completo via tacticalProfile.breakdown.
    const top10 = Object.entries(weighted)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([theme, score]) => ({
        theme,
        score:         Math.round(score * 100) / 100,
        breakdown:     breakdown[theme],
        raw_breakdown: raw_breakdown[theme],
      }));

    const totalWeighted = Object.values(weighted).reduce((a, b) => a + b, 0);
    let level, note;
    if (nRapidBlitz >= 15 && totalWeighted > 0) {
      level = 'alta';        note = '';
    } else if (nRapidBlitz >= 8) {
      level = 'média';       note = nRapidBlitz + ' partidas rapid/blitz — ranking pode variar com mais dados.';
    } else if (totalWeighted > 0) {
      level = 'baixa';
      note  = weightsAdapted
        ? 'Apenas ' + nRapidBlitz + ' rapid/blitz — bullet incluído com peso reduzido (0.4). Resultado indicativo.'
        : 'Amostra dominada por daily — análise tática limitada.';
    } else {
      level = 'insuficiente'; note = 'Sem partidas rapid/blitz/bullet analisáveis.';
    }

    return {
      weighted_top:        top10,
      breakdown:           breakdown,       // mapa completo: tema → {A,B,C}
      raw_breakdown:       raw_breakdown,   // sem role weight — pra reponderação
      role_totals:         roleTotals,
      tactical_confidence: { level: level, n_rapid_blitz: nRapidBlitz, weights_adapted: weightsAdapted, note: note },
    };
  }

  function derivePuzzleProgram(tacticalProfile, avgRating, errorsByPhase) {
    errorsByPhase = errorsByPhase || {};
    const rating = avgRating || 1200;
    const seen   = new Set();
    const themes = [];

    // 1. Fraquezas detectadas nas partidas (fonte mais confiável)
    for (const entry of (tacticalProfile.weighted_top || []).slice(0, 4)) {
      if (!entry.theme || seen.has(entry.theme)) continue;
      const roleA    = (entry.breakdown && entry.breakdown.A) || 0;
      const priority = roleA >= entry.score * 0.5 ? 'alta' : 'média';
      themes.push({
        theme:    entry.theme,
        priority: priority,
        source:   'detected',
        label:    CANONICAL_THEMES[entry.theme] || entry.theme,
      });
      seen.add(entry.theme);
    }

    // 2. Heurísticas por fase
    const total = Math.max(1,
      (errorsByPhase.opening    || 0) +
      (errorsByPhase.middlegame || 0) +
      (errorsByPhase.endgame    || 0));
    if ((errorsByPhase.endgame || 0) / total >= 0.4) {
      for (const t of ['rookEndgame', 'pawnEndgame']) {
        if (!seen.has(t)) {
          themes.push({ theme: t, priority: 'alta', source: 'heuristic', label: CANONICAL_THEMES[t] || t });
          seen.add(t);
        }
      }
    }
    if ((errorsByPhase.middlegame || 0) / total >= 0.4 && !seen.has('fork')) {
      themes.push({ theme: 'fork', priority: 'alta', source: 'heuristic', label: CANONICAL_THEMES.fork });
      seen.add('fork');
    }

    // 3. Fundamentos por faixa de rating
    const byRating =
      rating < 1000 ? [['fork','alta'],['pin','alta'],['backRankMate','média']] :
      rating < 1400 ? [['discoveredAttack','alta'],['deflection','média'],['backRankMate','média']] :
      rating < 1800 ? [['capturingDefender','alta'],['skewer','média'],['kingsideAttack','média']] :
                      [['intermezzo','alta'],['overloading','média'],['sacrifice','média']];

    for (const pair of byRating) {
      const t = pair[0], pr = pair[1];
      if (!seen.has(t)) {
        themes.push({ theme: t, priority: pr, source: 'rating', label: CANONICAL_THEMES[t] || t });
        seen.add(t);
      }
    }

    return {
      suggested_rating:    rating,
      rating_range:        [Math.max(400, rating - 100), Math.min(2800, rating + 100)],
      tactical_confidence: tacticalProfile.tactical_confidence,
      themes:              themes.slice(0, 8),
      modo:                'completo',
    };
  }

  // ── Modo 1: Chances perdidas (auto-correção pura) ───────────────────
  // Filtra só temas onde Role A é dominante (A > B+C). Sem heurísticas
  // por fase nem fundamentos por rating — só o que o jogador deixou
  // passar nas próprias posições. Resposta direta a "no que eu falhei".
  function derivePuzzleProgramModo1(tacticalProfile, avgRating) {
    const rating = avgRating || 1200;
    const seen   = new Set();
    const themes = [];

    for (const entry of (tacticalProfile.weighted_top || [])) {
      if (!entry.theme || seen.has(entry.theme)) continue;
      const a  = (entry.breakdown && entry.breakdown.A) || 0;
      const bc = ((entry.breakdown && entry.breakdown.B) || 0) +
                 ((entry.breakdown && entry.breakdown.C) || 0);
      // A precisa dominar e ter sinal mínimo (filtra ruído de poucos lances)
      if (a <= bc) continue;
      if (a < 0.5) continue;
      const priority = a >= entry.score * 0.7 ? 'alta' : 'média';
      themes.push({
        theme:    entry.theme,
        priority: priority,
        source:   'detected',
        label:    CANONICAL_THEMES[entry.theme] || entry.theme,
      });
      seen.add(entry.theme);
    }

    return {
      suggested_rating:    rating,
      rating_range:        [Math.max(400, rating - 100), Math.min(2800, rating + 100)],
      tactical_confidence: tacticalProfile.tactical_confidence,
      themes:              themes.slice(0, 6),
      modo:                'chances-perdidas',
    };
  }

  // ── Modo 2: Análise de adversário ──────────────────────────────────
  // Espera profile gerado a partir das partidas do OPONENTE. B+C dele =
  // padrões que ele expõe quando erra. Pondera C=2, B=1 (não-punido vale
  // mais — é blindspot que adversários não estão explorando). Itera pelo
  // breakdown completo (não só weighted_top) pra não perder temas com
  // raw score baixo mas concentração alta em C.
  function derivePuzzleProgramModo2(tacticalProfile, avgRating) {
    const rating = avgRating || 1200;
    const breakdown = tacticalProfile.breakdown || {};
    const raw       = tacticalProfile.raw_breakdown || {};

    const candidates = [];
    for (const theme in breakdown) {
      const rawB = (raw[theme] && raw[theme].B) || 0;
      const rawC = (raw[theme] && raw[theme].C) || 0;
      const blindspot = rawB * 1 + rawC * 2;
      if (blindspot <= 0) continue;
      candidates.push({
        theme:         theme,
        blindspot:     Math.round(blindspot * 100) / 100,
        breakdown:     breakdown[theme],
        raw_breakdown: raw[theme],
      });
    }
    candidates.sort((a, b) => b.blindspot - a.blindspot);

    const seen   = new Set();
    const themes = [];
    for (const c of candidates.slice(0, 8)) {
      if (seen.has(c.theme)) continue;
      const rawC = (c.raw_breakdown && c.raw_breakdown.C) || 0;
      const rawB = (c.raw_breakdown && c.raw_breakdown.B) || 0;
      // C dominante = ponto cego não-punido (ouro) → alta
      const priority = rawC >= rawB ? 'alta' : 'média';
      themes.push({
        theme:     c.theme,
        priority:  priority,
        source:    'detected-adversario',
        label:     CANONICAL_THEMES[c.theme] || c.theme,
        breakdown: c.breakdown,
      });
      seen.add(c.theme);
    }

    return {
      suggested_rating:    rating,
      rating_range:        [Math.max(400, rating - 100), Math.min(2800, rating + 100)],
      tactical_confidence: tacticalProfile.tactical_confidence,
      themes:              themes.slice(0, 6),
      modo:                'adversario',
    };
  }

  global.TacticalAggregator = {
    aggregateTactical:        aggregateTactical,
    derivePuzzleProgram:      derivePuzzleProgram,
    derivePuzzleProgramModo1: derivePuzzleProgramModo1,
    derivePuzzleProgramModo2: derivePuzzleProgramModo2,
    CANONICAL_THEMES:         CANONICAL_THEMES,
  };
})(typeof window !== 'undefined' ? window : globalThis);
