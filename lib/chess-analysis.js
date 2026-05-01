// Orquestrador de análise tática de jogador (chess.com → puzzle_program).
// Expõe globalmente como window.ChessAnalysis.
//
// Dependências esperadas no escopo global:
//   Chess              (chess.js, qualquer versão >= 0.10)
//   TacticalThemes     (lib/tactical-themes.js)
//   TacticalAggregator (lib/tactical-aggregator.js)

(function (global) {
  "use strict";

  // ── Constantes de pipeline ──────────────────────────────────────────
  const GAMES_TARGET     = 30;
  const ENGINE_DEPTH     = 14;       // depth-based: estável e ~150–250ms/posição
  const MULTI_PV         = 2;        // top-2 candidatos por posição
  const MIN_PLIES        = 15;
  const LOSS_THRESHOLD   = 50;       // role A
  const LOSS_BLUNDER     = 100;      // role B/C
  const ANALYZE_TIMEOUT  = 12000;
  const ENGINE_INIT_TIMEOUT = 180000;
  const MATE_AS_CP       = 10000;

  // Local primeiro (Netlify same-origin), depois fallbacks de CDN.
  const STOCKFISH_URLS = [
    "lib/stockfish.js",
    "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js",
    "https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js",
    "https://unpkg.com/stockfish.js@10.0.2/stockfish.js",
  ];

  // ── IndexedDB ───────────────────────────────────────────────────────
  // v2: + store fen_evals (cache de avaliação por FEN) + store analysis_history
  const DB_NAME           = "woodpecker_analysis";
  const DB_VERSION        = 2;
  const STORE_PROGRAMS    = "puzzle_programs";
  const STORE_FEN_EVALS   = "fen_evals";
  const STORE_HISTORY     = "analysis_history";
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_PROGRAMS)) {
          db.createObjectStore(STORE_PROGRAMS, { keyPath: "username" });
        }
        if (!db.objectStoreNames.contains(STORE_FEN_EVALS)) {
          db.createObjectStore(STORE_FEN_EVALS, { keyPath: "fen" });
        }
        if (!db.objectStoreNames.contains(STORE_HISTORY)) {
          const s = db.createObjectStore(STORE_HISTORY, { keyPath: "id", autoIncrement: true });
          s.createIndex("by_username", "username", { unique: false });
          s.createIndex("by_analyzed_at", "analyzed_at", { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
    return dbPromise;
  }

  async function saveProgram(program) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PROGRAMS, STORE_HISTORY], "readwrite");
      tx.objectStore(STORE_PROGRAMS).put(program);
      // Histórico: snapshot leve sem o array completo de temas detalhados
      const snapshot = {
        username:           program.username,
        analyzed_at:        program.analyzed_at,
        suggested_rating:   program.suggested_rating,
        rating_range:       program.rating_range,
        tactical_confidence: program.tactical_confidence,
        themes:             (program.themes || []).map(t => ({
          theme: t.theme, priority: t.priority, source: t.source
        })),
        games_analyzed:     program.games_analyzed,
        games_breakdown:    program.games_breakdown,
      };
      tx.objectStore(STORE_HISTORY).add(snapshot);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  async function loadProgram(username) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROGRAMS, "readonly");
      const r  = tx.objectStore(STORE_PROGRAMS).get(username);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror   = () => reject(r.error);
    });
  }

  async function deleteProgram(username) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROGRAMS, "readwrite");
      tx.objectStore(STORE_PROGRAMS).delete(username);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  async function listPrograms() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROGRAMS, "readonly");
      const r  = tx.objectStore(STORE_PROGRAMS).getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror   = () => reject(r.error);
    });
  }

  async function listHistory(username) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORY, "readonly");
      const idx = tx.objectStore(STORE_HISTORY).index("by_username");
      const r = idx.getAll(IDBKeyRange.only(username));
      r.onsuccess = () => {
        const arr = r.result || [];
        arr.sort((a, b) => (b.analyzed_at || '').localeCompare(a.analyzed_at || ''));
        resolve(arr);
      };
      r.onerror = () => reject(r.error);
    });
  }

  // ── Cache FEN→eval ─────────────────────────────────────────────────
  // FEN normalizada: estabilizar pelo posicionamento + side-to-move + castling
  // + en-passant; remover meia-jogada/fullmove (irrelevantes pra avaliação).
  function fenKey(fen) {
    const parts = (fen || "").split(" ");
    return parts.slice(0, 4).join(" ");
  }

  async function getFenEval(fen, minDepth) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_FEN_EVALS, "readonly");
        const r = tx.objectStore(STORE_FEN_EVALS).get(fenKey(fen));
        r.onsuccess = () => {
          const v = r.result;
          if (v && v.depth >= (minDepth || 0)) resolve(v);
          else resolve(null);
        };
        r.onerror = () => reject(r.error);
      });
    } catch (_) { return null; }
  }

  async function putFenEval(fen, evalObj) {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_FEN_EVALS, "readwrite");
        const rec = Object.assign({ fen: fenKey(fen), cached_at: Date.now() }, evalObj);
        tx.objectStore(STORE_FEN_EVALS).put(rec);
        tx.oncomplete = () => resolve();
        tx.onerror    = () => reject(tx.error);
      });
    } catch (_) { /* silencioso */ }
  }

  async function clearFenCache() {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_FEN_EVALS, "readwrite");
        tx.objectStore(STORE_FEN_EVALS).clear();
        tx.oncomplete = () => resolve();
        tx.onerror    = () => reject(tx.error);
      });
    } catch (_) {}
  }

  async function fenCacheStats() {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_FEN_EVALS, "readonly");
        const r = tx.objectStore(STORE_FEN_EVALS).count();
        r.onsuccess = () => resolve({ count: r.result });
        r.onerror   = () => reject(r.error);
      });
    } catch (_) { return { count: 0 }; }
  }

  // ── Stockfish ──────────────────────────────────────────────────────
  // Tentamos same-origin (lib/stockfish.js) primeiro, instanciando o
  // Worker direto pela URL — assim o auto-init do stockfish.js consegue
  // resolver stockfish.wasm relativo ao próprio script (que está na
  // mesma origem do app, no Netlify). Fallback: blob+prelude com fetch
  // de CDN (versões publicadas em cdnjs/jsdelivr/unpkg que aceitam
  // locateFile via Module override).
  let SFWorker = null;
  let SFInitPromise = null;

  function uciHandshake() {
    return new Promise((resolve, reject) => {
      let stage = "waiting-uciok";
      const timer = setTimeout(() => {
        SFWorker.removeEventListener("message", handler);
        reject(new Error("engine não respondeu em " + (ENGINE_INIT_TIMEOUT/1000) + "s (estágio " + stage + ")"));
      }, ENGINE_INIT_TIMEOUT);
      const handler = (e) => {
        const line = typeof e.data === "string" ? e.data : "";
        if (line === "uciok") {
          stage = "waiting-readyok";
          SFWorker.postMessage("setoption name Hash value 64");
          SFWorker.postMessage("setoption name MultiPV value " + MULTI_PV);
          SFWorker.postMessage("isready");
        } else if (line === "readyok") {
          clearTimeout(timer);
          SFWorker.removeEventListener("message", handler);
          resolve();
        }
      };
      SFWorker.addEventListener("message", handler);
      SFWorker.onerror = (err) => {
        clearTimeout(timer);
        SFWorker.removeEventListener("message", handler);
        reject(new Error(err.message || ("worker erro (estágio " + stage + ")")));
      };
      SFWorker.postMessage("uci");
    });
  }

  async function initWorkerSameOrigin(url) {
    SFWorker = new Worker(url);
    return uciHandshake();
  }

  async function initWorkerViaBlob(cdnUrl) {
    const res = await fetch(cdnUrl, { cache: "force-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    if (!text.length) throw new Error("script vazio");
    const baseUrl = cdnUrl.replace(/[^/]+$/, "");
    const prelude =
      "self.Module = self.Module || {};" +
      "self.Module.locateFile = function(name){ return " + JSON.stringify(baseUrl) + " + name; };" +
      "self.Module.print = function(s){ self.postMessage(s); };" +
      "self.Module.printErr = function(s){ self.postMessage('ERR ' + s); };" +
      "\n";
    const blob = new Blob([prelude + text], { type: "application/javascript" });
    SFWorker = new Worker(URL.createObjectURL(blob));
    return uciHandshake();
  }

  function initStockfish() {
    if (SFInitPromise) return SFInitPromise;
    SFInitPromise = (async () => {
      const errors = [];
      for (const url of STOCKFISH_URLS) {
        try {
          if (/^https?:/.test(url)) {
            await initWorkerViaBlob(url);
          } else {
            await initWorkerSameOrigin(url);
          }
          return; // sucesso
        } catch (e) {
          errors.push((url.split("/").pop() || url) + ": " + (e.message || e));
          if (SFWorker) { try { SFWorker.terminate(); } catch (_) {} }
          SFWorker = null;
        }
      }
      throw new Error("Stockfish não inicializou em nenhum origem. " + errors.join(" | "));
    })();
    SFInitPromise.catch(() => { SFInitPromise = null; });
    return SFInitPromise;
  }

  function terminateStockfish() {
    if (SFWorker) { try { SFWorker.terminate(); } catch (_) {} }
    SFWorker = null;
    SFInitPromise = null;
  }

  function waitReadyOk(timeoutMs) {
    timeoutMs = timeoutMs || 5000;
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        SFWorker.removeEventListener("message", handler);
        reject(new Error("isready timeout"));
      }, timeoutMs);
      const handler = (e) => {
        if (typeof e.data === "string" && e.data.trim() === "readyok") {
          clearTimeout(t);
          SFWorker.removeEventListener("message", handler);
          resolve();
        }
      };
      SFWorker.addEventListener("message", handler);
      SFWorker.postMessage("isready");
    });
  }

  // Avalia uma posição com Stockfish (depth-based + Multi-PV).
  // Retorna { best_move, cp, mate, side_to_move, pv: [{move, cp, mate}], depth }.
  async function analyzePositionRaw(fen, depth) {
    await initStockfish();
    SFWorker.postMessage("stop");
    SFWorker.postMessage("ucinewgame");
    await waitReadyOk();
    return new Promise((resolve, reject) => {
      const stm = (fen.split(" ")[1] || "w").toLowerCase();
      // Mantém última linha de info por multipv index.
      const lastByPv = {};
      let lastDepth = 0;
      const timer = setTimeout(() => {
        SFWorker.removeEventListener("message", handler);
        reject(new Error("analyze timeout"));
      }, ANALYZE_TIMEOUT);
      const handler = (e) => {
        const line = typeof e.data === "string" ? e.data : "";
        if (line.startsWith("info ") && /score (cp|mate)/.test(line)) {
          const pvM   = line.match(/multipv (\d+)/);
          const pv    = pvM ? parseInt(pvM[1], 10) : 1;
          const depM  = line.match(/depth (\d+)/);
          if (depM) lastDepth = Math.max(lastDepth, parseInt(depM[1], 10));
          lastByPv[pv] = line;
        } else if (line.startsWith("bestmove")) {
          clearTimeout(timer);
          SFWorker.removeEventListener("message", handler);

          const parsed = [];
          const ks = Object.keys(lastByPv).map(n => parseInt(n,10)).sort((a,b) => a - b);
          for (const k of ks) {
            const info = lastByPv[k];
            const cpM  = info.match(/score cp (-?\d+)/);
            const matM = info.match(/score mate (-?\d+)/);
            const mvM  = info.match(/\spv\s+(\S+)/);
            let cp = null, mate = null;
            if (matM) {
              mate = parseInt(matM[1], 10);
              cp   = mate > 0 ? MATE_AS_CP : -MATE_AS_CP;
            } else if (cpM) {
              cp = parseInt(cpM[1], 10);
            }
            parsed.push({ move: mvM ? mvM[1] : null, cp: cp, mate: mate });
          }

          const best = parsed[0] || {};
          const bm = line.match(/bestmove\s+(\S+)/);
          if (bm && bm[1] !== "(none)" && !best.move) best.move = bm[1];

          resolve({
            best_move:    best.move || null,
            cp:           best.cp != null ? best.cp : null,
            mate:         best.mate,
            side_to_move: stm,
            pv:           parsed,
            depth:        lastDepth,
          });
        }
      };
      SFWorker.addEventListener("message", handler);
      SFWorker.postMessage("position fen " + fen);
      SFWorker.postMessage("go depth " + depth);
    });
  }

  // Wrapper com cache IndexedDB. Reaproveita avaliações de FENs já analisados
  // em ≥ depth solicitada (ganho real entre re-análises do mesmo jogador e
  // entre jogadores que compartilham aberturas).
  async function analyzePosition(fen, depth) {
    depth = depth || ENGINE_DEPTH;
    const cached = await getFenEval(fen, depth);
    if (cached) {
      return {
        best_move:    cached.best_move,
        cp:           cached.cp,
        mate:         cached.mate,
        side_to_move: (fen.split(" ")[1] || "w").toLowerCase(),
        pv:           cached.pv || [],
        depth:        cached.depth,
        cached:       true,
      };
    }
    const r = await analyzePositionRaw(fen, depth);
    await putFenEval(fen, {
      best_move: r.best_move, cp: r.cp, mate: r.mate,
      pv: r.pv, depth: r.depth,
    });
    return r;
  }

  // ── Chess.com fetch ─────────────────────────────────────────────────
  async function fetchArchives(username) {
    const u = "https://api.chess.com/pub/player/" + encodeURIComponent(username) + "/games/archives";
    const r = await fetch(u);
    if (!r.ok) throw new Error("Usuário não encontrado ou sem partidas (" + r.status + ")");
    const j = await r.json();
    return Array.isArray(j.archives) ? j.archives : [];
  }

  function plyCount(pgn) {
    // Conta plies sem chamar chess.js: conta tokens não-numéricos no movetext
    // Suficiente para filtrar partidas curtas no ranqueamento inicial.
    const txt = (pgn || "").split(/\n\n/).slice(1).join("\n\n").replace(/\{[^}]*\}/g, "").replace(/\([^)]*\)/g, "");
    const tokens = txt.split(/\s+/).filter(t => t && !/^\d+\.+$/.test(t) && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t));
    return tokens.length;
  }

  // Peek rápido: varre últimos N meses só pra contar partidas elegíveis
  // por time_class. Sem Stockfish, sem classificação. ~3–6s para 4 meses.
  async function peekCoverage(username, maxMonths) {
    maxMonths = maxMonths || 4;
    if (!username || !username.trim()) throw new Error("Username vazio");
    username = username.trim();
    const archives = await fetchArchives(username);
    if (!archives.length) return { counts: {}, total: 0, scanned: 0, archives: 0 };
    archives.reverse();
    const counts = { rapid: 0, blitz: 0, bullet: 0, daily: 0 };
    let scanned = 0, total = 0;
    const userLower = username.toLowerCase();
    for (const url of archives) {
      if (scanned >= maxMonths) break;
      let j;
      try {
        const r = await fetch(url);
        if (!r.ok) { scanned++; continue; }
        j = await r.json();
      } catch (_) { scanned++; continue; }
      const games = Array.isArray(j.games) ? j.games : [];
      for (const g of games) {
        if (!g.pgn || !g.time_class) continue;
        const wU = (g.white && g.white.username || "").toLowerCase();
        const bU = (g.black && g.black.username || "").toLowerCase();
        if (wU !== userLower && bU !== userLower) continue;
        const np = plyCount(g.pgn);
        if (np < MIN_PLIES) continue;
        counts[g.time_class] = (counts[g.time_class] || 0) + 1;
        total++;
      }
      scanned++;
    }
    return { counts: counts, total: total, scanned: scanned, archives: archives.length };
  }

  async function fetchGames(username, target) {
    const archives = await fetchArchives(username);
    if (!archives.length) return [];
    archives.reverse();
    const out = [];
    for (const url of archives) {
      const r = await fetch(url);
      if (!r.ok) continue;
      const j = await r.json();
      const games = Array.isArray(j.games) ? j.games : [];
      games.reverse(); // mais recentes do mês primeiro
      for (const g of games) {
        if (!g.pgn) continue;
        const tc = g.time_class || null;
        if (!tc) continue;
        const np = plyCount(g.pgn);
        if (np < MIN_PLIES) continue;
        const userLower = username.toLowerCase();
        const wU = (g.white && g.white.username || "").toLowerCase();
        const bU = (g.black && g.black.username || "").toLowerCase();
        let myColor = null, myRating = null, oppRating = null, result = null;
        if (wU === userLower) {
          myColor = "w";
          myRating = g.white.rating || null;
          oppRating = (g.black && g.black.rating) || null;
          result = g.white.result || null;
        } else if (bU === userLower) {
          myColor = "b";
          myRating = g.black.rating || null;
          oppRating = (g.white && g.white.rating) || null;
          result = g.black.result || null;
        } else {
          continue;
        }
        out.push({
          pgn: g.pgn,
          time_class: tc,
          my_color: myColor,
          my_rating: myRating,
          opponent_rating: oppRating,
          result: result,
          end_time: g.end_time || 0,
          n_plies: np,
        });
        if (out.length >= target) return out;
      }
    }
    return out;
  }

  // ── Extração de lances do PGN ──────────────────────────────────────
  function extractMoves(pgn, gameIndex, timeClass, myColor) {
    const c = new Chess();
    let ok = false;
    try { ok = c.load_pgn(pgn, { sloppy: true }); }
    catch (_) { ok = false; }
    if (!ok) {
      try { ok = c.load_pgn(pgn); } catch (_) { ok = false; }
    }
    if (!ok) return [];
    const history = c.history({ verbose: true });
    const fresh = new Chess();
    const moves = [];
    for (let i = 0; i < history.length; i++) {
      const h = history[i];
      const fen_before = fresh.fen();
      const stm = fresh.turn();
      const uci = h.from + h.to + (h.promotion || "");
      fresh.move(h);
      moves.push({
        game_index:   gameIndex,
        ply:          i,
        side_to_move: stm,
        fen_before:   fen_before,
        move_uci:     uci,
        move_san:     h.san,
        time_class:   timeClass,
        is_my_move:   (stm === myColor),
      });
    }
    return moves;
  }

  // ── Loss + role ─────────────────────────────────────────────────────
  function annotateLossAndRole(moves) {
    // 1. loss_cp[i] = max(0, cp[i] + cp[i+1])
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      const next = moves[i + 1];
      if (m.cp == null || !next || next.cp == null) {
        m.loss_cp = 0;
      } else {
        m.loss_cp = Math.max(0, m.cp + next.cp);
      }
    }
    // 2. atribuir role somente para meus lances
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      m.tactical_role = null;
      if (!m.is_my_move) continue;
      const loss = m.loss_cp || 0;
      if (loss < LOSS_THRESHOLD) continue;
      if (m.tactical_theme) {
        m.tactical_role = 'A';
        continue;
      }
      if (loss >= LOSS_BLUNDER) {
        const next = moves[i + 1];
        if (next && next.tactical_theme) {
          // copia tema da resposta do adversário para este lance (a fraqueza
          // é o padrão que ele deveria ter visto/evitado).
          m.tactical_theme  = next.tactical_theme;
          m.tactical_themes = next.tactical_themes;
          const lossOpp = next.loss_cp || 0;
          m.tactical_role = lossOpp < LOSS_BLUNDER ? 'B' : 'C';
        }
      }
    }
  }

  // ── analyzePlayer principal ─────────────────────────────────────────
  // onProgress({ stage, current, total, message })
  async function analyzePlayer(username, onProgress) {
    onProgress = onProgress || function () {};
    if (!username || !username.trim()) throw new Error("Username vazio");
    username = username.trim();

    // 1. Fetch games
    onProgress({ stage: 'fetch_games', current: 0, total: GAMES_TARGET,
                 message: 'Buscando partidas no chess.com...' });
    const games = await fetchGames(username, GAMES_TARGET);
    if (games.length === 0) throw new Error("Nenhuma partida elegível encontrada (mín. " + MIN_PLIES + " plies)");

    // Sanity check de cobertura
    const tcCounts = {};
    for (const g of games) tcCounts[g.time_class] = (tcCounts[g.time_class] || 0) + 1;
    const nRB = (tcCounts.rapid || 0) + (tcCounts.blitz || 0);
    const nB  = tcCounts.bullet || 0;
    if (nRB + nB === 0) {
      throw new Error("Amostra insuficiente — nenhuma partida rapid/blitz/bullet encontrada");
    }
    if (nRB < 8) {
      console.warn("[analise] cobertura tática baixa: rapid+blitz=" + nRB);
    }

    // 2. Tactical index + Stockfish em paralelo
    onProgress({ stage: 'init', message: 'Carregando índice tático e Stockfish...' });
    await Promise.all([
      TacticalThemes.loadTacticalIndex(),
      initStockfish(),
    ]);

    // 3. Para cada partida: extrair lances, analisar, classificar
    const allMoves = [];
    for (let gi = 0; gi < games.length; gi++) {
      const g = games[gi];
      onProgress({
        stage: 'analyze',
        current: gi,
        total: games.length,
        message: 'Analisando partida ' + (gi + 1) + '/' + games.length +
                 ' (' + g.time_class + ', ' + g.n_plies + ' lances)...'
      });
      const moves = extractMoves(g.pgn, gi, g.time_class, g.my_color);
      if (moves.length === 0) continue;

      for (let i = 0; i < moves.length; i++) {
        const m = moves[i];
        try {
          const eng = await analyzePosition(m.fen_before, ENGINE_DEPTH);
          m.cp        = eng.cp;
          m.best_move = eng.best_move;
        } catch (e) {
          m.cp = null;
          m.best_move = null;
          console.warn("[analise] stockfish falhou em ply " + i + ": " + e.message);
        }
        // Classifica somente posições onde é a vez do jogador OU resposta crítica.
        // Para simplificar, classificamos toda posição: o aggregator usa só
        // moves com tactical_role ≠ null.
        if (m.best_move) {
          const cls = TacticalThemes.classifyPosition(m.fen_before, m.best_move, m.move_uci);
          if (cls) {
            m.tactical_theme       = cls.theme || null;
            m.tactical_themes      = cls.themes || null;
            m.tactical_confidence  = cls.confidence || null;
          }
        }
      }

      annotateLossAndRole(moves);
      for (const m of moves) {
        if (m.is_my_move && m.tactical_role) allMoves.push(m);
      }
    }

    // 4. Agregação
    onProgress({ stage: 'aggregate', message: 'Agregando temas táticos...' });
    const profile = TacticalAggregator.aggregateTactical(allMoves);

    // 5. Avg rating
    const ratings = games.map(g => g.my_rating).filter(r => r);
    const avgRating = ratings.length
      ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
      : 1200;

    // 6. Programa (Modo 3 default — completo). Profile e avg_rating
    //    ficam disponíveis em program.profile pra re-derivação client-side
    //    em Modo 1 (chances perdidas) e Modo 2 (adversário).
    const program = TacticalAggregator.derivePuzzleProgram(profile, avgRating);
    program.username        = username;
    program.analyzed_at     = new Date().toISOString();
    program.games_analyzed  = games.length;
    program.games_breakdown = tcCounts;
    program.profile         = profile;
    program.avg_rating      = avgRating;

    // 7. Persistir
    try { await saveProgram(program); }
    catch (e) { console.warn("[analise] IndexedDB falhou: " + e.message); }

    onProgress({ stage: 'done', message: 'Pronto. ' + games.length + ' partidas analisadas.' });
    return program;
  }

  global.ChessAnalysis = {
    analyzePlayer:     analyzePlayer,
    peekCoverage:      peekCoverage,
    loadProgram:       loadProgram,
    saveProgram:       saveProgram,
    deleteProgram:     deleteProgram,
    listPrograms:      listPrograms,
    listHistory:       listHistory,
    clearFenCache:     clearFenCache,
    fenCacheStats:     fenCacheStats,
    terminateStockfish: terminateStockfish,
    GAMES_TARGET:      GAMES_TARGET,
    ENGINE_DEPTH:      ENGINE_DEPTH,
    MULTI_PV:          MULTI_PV,
    MIN_RB_GOOD:       15,
    MIN_RB_OK:         8,
  };
})(typeof window !== 'undefined' ? window : globalThis);
