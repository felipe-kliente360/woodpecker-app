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
  const MOVETIME_MS      = 200;
  const MIN_PLIES        = 15;
  const LOSS_THRESHOLD   = 50;       // role A
  const LOSS_BLUNDER     = 100;      // role B/C
  const ANALYZE_TIMEOUT  = 8000;
  const ENGINE_INIT_TIMEOUT = 180000;
  const MATE_AS_CP       = 10000;

  const STOCKFISH_URLS = [
    "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js",
    "https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js",
    "https://unpkg.com/stockfish.js@10.0.2/stockfish.js",
  ];

  // ── IndexedDB cache simples ─────────────────────────────────────────
  const DB_NAME  = "woodpecker_analysis";
  const DB_STORE = "puzzle_programs";
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: "username" });
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
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(program);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  async function loadProgram(username) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const r  = tx.objectStore(DB_STORE).get(username);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror   = () => reject(r.error);
    });
  }

  async function deleteProgram(username) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).delete(username);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  async function listPrograms() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const r  = tx.objectStore(DB_STORE).getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror   = () => reject(r.error);
    });
  }

  // ── Stockfish (worker via Blob, idêntico ao chess-scout-prototipo) ──
  let SFWorker = null;
  let SFInitPromise = null;

  async function fetchStockfishScript() {
    const errors = [];
    for (const url of STOCKFISH_URLS) {
      try {
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const text = await res.text();
        if (!text.length) throw new Error("script vazio");
        return { text: text, baseUrl: url.replace(/[^/]+$/, "") };
      } catch (e) {
        errors.push(url.split("/")[2] + ": " + (e.message || e));
      }
    }
    throw new Error("Nenhum CDN de Stockfish acessível. " + errors.join(" | "));
  }

  function initStockfish() {
    if (SFInitPromise) return SFInitPromise;
    SFInitPromise = (async () => {
      const out = await fetchStockfishScript();
      const prelude =
        "self.Module = self.Module || {};" +
        "self.Module.locateFile = function(name){ return " + JSON.stringify(out.baseUrl) + " + name; };" +
        "self.Module.print = function(s){ self.postMessage(s); };" +
        "self.Module.printErr = function(s){ self.postMessage('ERR ' + s); };" +
        "\n";
      const blob = new Blob([prelude + out.text], { type: "application/javascript" });
      SFWorker = new Worker(URL.createObjectURL(blob));

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
          reject(new Error(err.message || ("worker erro (estágio " + stage + ")")));
        };
        SFWorker.postMessage("uci");
      });
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

  async function analyzePosition(fen, movetimeMs) {
    await initStockfish();
    SFWorker.postMessage("stop");
    SFWorker.postMessage("ucinewgame");
    await waitReadyOk();
    return new Promise((resolve, reject) => {
      const stm = (fen.split(" ")[1] || "w").toLowerCase();
      let lastInfo = null;
      const timer = setTimeout(() => {
        SFWorker.removeEventListener("message", handler);
        reject(new Error("analyze timeout"));
      }, ANALYZE_TIMEOUT);
      const handler = (e) => {
        const line = typeof e.data === "string" ? e.data : "";
        if (line.startsWith("info ") && /score (cp|mate)/.test(line)) {
          lastInfo = line;
        } else if (line.startsWith("bestmove")) {
          clearTimeout(timer);
          SFWorker.removeEventListener("message", handler);
          let best = null, cp = null, mate = null;
          const bm = line.match(/bestmove\s+(\S+)/);
          if (bm && bm[1] !== "(none)") best = bm[1];
          if (lastInfo) {
            const cpM   = lastInfo.match(/score cp (-?\d+)/);
            const matM  = lastInfo.match(/score mate (-?\d+)/);
            if (matM) {
              mate = parseInt(matM[1], 10);
              cp   = (mate > 0 ? MATE_AS_CP : -MATE_AS_CP);
            } else if (cpM) {
              cp = parseInt(cpM[1], 10);
            }
          }
          resolve({ best_move: best, cp: cp, mate: mate, side_to_move: stm });
        }
      };
      SFWorker.addEventListener("message", handler);
      SFWorker.postMessage("position fen " + fen);
      SFWorker.postMessage("go movetime " + movetimeMs);
    });
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
          const eng = await analyzePosition(m.fen_before, MOVETIME_MS);
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

    // 6. Programa
    const program = TacticalAggregator.derivePuzzleProgram(profile, avgRating);
    program.username      = username;
    program.analyzed_at   = new Date().toISOString();
    program.games_analyzed = games.length;
    program.games_breakdown = tcCounts;

    // 7. Persistir
    try { await saveProgram(program); }
    catch (e) { console.warn("[analise] IndexedDB falhou: " + e.message); }

    onProgress({ stage: 'done', message: 'Análise concluída.' });
    return program;
  }

  global.ChessAnalysis = {
    analyzePlayer:     analyzePlayer,
    loadProgram:       loadProgram,
    saveProgram:       saveProgram,
    deleteProgram:     deleteProgram,
    listPrograms:      listPrograms,
    terminateStockfish: terminateStockfish,
    GAMES_TARGET:      GAMES_TARGET,
    MOVETIME_MS:       MOVETIME_MS,
  };
})(typeof window !== 'undefined' ? window : globalThis);
