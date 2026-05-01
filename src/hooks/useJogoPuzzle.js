// Hook que encapsula toda a state machine de execução de um ciclo de
// puzzles (era o coração da TelaTreinar). Retorna API limpa para a UI
// renderizar tabuleiro + feedback + promoção sem conhecer Chess.js.
//
// Inputs:
//   puzzles: array do ciclo (idx 0..n-1)
//   sessao:  sessão salva ({ index_atual, resultados_parciais }) ou null
//   conjunto, ciclo: contexto pra persistência e modo espelho
//   ciclosAnteriores: usado pra calcular ritmoVsBaseline
//   onConcluirCiclo(resultados): chamado quando idx ultrapassa total
//   onSalvarSessao(s): chamado a cada mudança de progresso
//
// Saída: ver bloco final.
(function (global) {
  "use strict";
  const React = global.React;
  if (!React) throw new Error("[useJogoPuzzle] React precisa estar carregado");
  const { useState, useEffect, useRef } = React;

  function useJogoPuzzle(opts) {
    const {
      puzzles, sessao, conjunto, ciclo, ciclosAnteriores,
      onConcluirCiclo, onSalvarSessao,
    } = opts || {};

    const Chess = global.Chess;
    const Puzzle = (global.WP && global.WP.Puzzle) || {};
    const Hooks  = (global.WP && global.WP.Hooks)  || {};
    const useTimerComPausa  = Hooks.useTimerComPausa;
    const useKeyboardShortcuts = Hooks.useKeyboardShortcuts;

    const [idx, setIdx] = useState(sessao ? sessao.index_atual : 0);
    const [resultados, setResultados] = useState(sessao ? (sessao.resultados_parciais || []) : []);
    const [estado, setEstado] = useState("jogando"); // jogando | feedback
    const [feedback, setFeedback] = useState(null);
    const [uciInput, setUciInput] = useState("");
    const [rodando, setRodando] = useState(true);
    const [pausado, setPausado] = useState(false);
    const [seg, resetTimer] = useTimerComPausa(rodando, pausado);

    const chessRef = useRef(null);
    const expectedIdxRef = useRef(1);
    const fenInicialJogadorRef = useRef("");
    const orientacaoRef = useRef("white");
    const segRef = useRef(0);
    useEffect(() => { segRef.current = seg; }, [seg]);

    const [fenAtual, setFenAtual] = useState("");
    const [ultimoLanceErrado, setUltimoLanceErrado] = useState(null);
    const [ultimoLanceAdv, setUltimoLanceAdv] = useState(null);
    const [lancePendente, setLancePendente] = useState(null);
    const [promoPicker, setPromoPicker]   = useState(null);
    const [casaSelecionada, setCasaSelecionada] = useState(null);
    const [modoConfirmar, setModoConfirmar] = useState(false);
    const [erroPuzzle, setErroPuzzle] = useState(null);

    const puzzle = puzzles && puzzles[idx];
    const total  = puzzles ? puzzles.length : 0;
    const acertos = resultados.filter(r => r.correto).length;
    const erros = resultados.filter(r => !r.correto).length;
    const restantes = total - resultados.length;
    const tempoConcluidos = resultados.reduce((a, r) => a + (r.tempo_s || 0), 0);
    const tempoAcumulado = tempoConcluidos + (estado === "jogando" ? seg : 0);

    // Indicador vs Ciclo 1 em tempo real
    const baselineCiclo = (ciclosAnteriores && ciclosAnteriores.length > 0 && ciclo && ciclo.numero > 1)
      ? ciclosAnteriores[0]
      : null;
    const tempoBaselineAteAqui = (baselineCiclo && baselineCiclo.resultados)
      ? baselineCiclo.resultados.slice(0, resultados.length).reduce((a, r) => a + (r.tempo_s || 0), 0)
      : null;
    const ritmoVsBaseline = tempoBaselineAteAqui !== null
      ? tempoAcumulado - tempoBaselineAteAqui
      : null;

    // Inicia/recarrega cada puzzle
    useEffect(() => {
      if (!puzzle) return;
      try {
        if (typeof Chess === "undefined") {
          throw new Error("Biblioteca Chess não carregou (CDN bloqueada?)");
        }
        const c = new Chess(puzzle.fen);
        const lances = puzzle.lances || puzzle.moves || [];
        if (lances[0]) {
          try { Puzzle.aplicarLanceSilencioso(c, lances[0]); } catch (e) {
            console.warn("Lance inicial inválido:", lances[0], e);
          }
        }
        setUltimoLanceAdv(null);
        chessRef.current = c;
        expectedIdxRef.current = 1;
        fenInicialJogadorRef.current = c.fen();
        const corNatural = Puzzle.corDoTabuleiro(c.fen());
        orientacaoRef.current = (conjunto && conjunto.espelho)
          ? (corNatural === "white" ? "black" : "white")
          : corNatural;
        setFenAtual(c.fen());
        setEstado("jogando");
        setFeedback(null);
        setUciInput("");
        setUltimoLanceErrado(null);
        setErroPuzzle(null);
        setLancePendente(null);
        setPromoPicker(null);
        setCasaSelecionada(null);
        setPausado(false);
        segRef.current = 0;
        resetTimer();
        setRodando(true);
      } catch (e) {
        console.error("Falha ao inicializar puzzle:", e);
        setErroPuzzle(e.message || String(e));
      }
    }, [idx, puzzle && (puzzle.id || puzzle.puzzleId)]);

    // Limpa seleção fora do estado 'jogando'
    useEffect(() => {
      if (estado !== "jogando") setCasaSelecionada(null);
    }, [estado]);

    // Persiste sessão a cada mudança de progresso
    useEffect(() => {
      if (!conjunto || !ciclo || !onSalvarSessao) return;
      const s = {
        conjunto_id: conjunto.id,
        ciclo_numero: ciclo.numero,
        apenas_erros: ciclo.apenas_erros,
        puzzle_ids_ciclo: puzzles.map(p => p.id || p.puzzleId),
        index_atual: idx,
        resultados_parciais: resultados,
        iniciado_em: ciclo.iniciado_em || Date.now(),
      };
      onSalvarSessao(s);
    }, [idx, resultados]);

    function ehPromocao(c, from, to) {
      const piece = c.get(from);
      if (!piece || piece.type !== "p") return false;
      return to[1] === "8" || to[1] === "1";
    }

    function processarLance(from, to, promo) {
      if (estado !== "jogando") return false;
      if (pausado) return false;
      if (lancePendente) return false;
      const c = chessRef.current;
      if (!c) return false;
      if (!promo && ehPromocao(c, from, to)) {
        setPromoPicker({ from: from, to: to });
        return false;
      }
      if (modoConfirmar) {
        let m;
        try { m = c.move({ from: from, to: to, promotion: promo || "q" }); }
        catch (e) { return false; }
        if (!m) return false;
        setFenAtual(c.fen());
        setLancePendente({ from: from, to: to, promo: promo || "q", san: m.san });
        return true;
      }
      return avaliarLance(from, to, promo);
    }

    function avaliarLance(from, to, promo) {
      const c = chessRef.current;
      if (!c) return false;
      let m;
      try { m = c.move({ from: from, to: to, promotion: promo || "q" }); }
      catch (e) { return false; }
      if (!m) return false;

      const lances = puzzle.lances || puzzle.moves || [];
      const expectedUci = lances[expectedIdxRef.current];
      const playedUci = from + to + (m.promotion ? m.promotion : "");
      const playedNoPromo = from + to;
      const ok = expectedUci && (
        expectedUci === playedUci ||
        expectedUci === playedNoPromo ||
        expectedUci.slice(0, 4) === playedNoPromo
      );

      if (!ok) {
        const tempo = segRef.current;
        setRodando(false);
        const sans = Puzzle.sequenciaSan(fenInicialJogadorRef.current, lances.slice(1));
        setFeedback({ correto: false, tempo_s: tempo, sans: sans, lance_jogado_san: m.san });
        setUltimoLanceErrado(m.san);
        c.undo();
        setFenAtual(c.fen());
        setEstado("feedback");
        setResultados(rs => rs.concat([{
          puzzle_id: puzzle.id || puzzle.puzzleId, correto: false,
          tempo_s: tempo, temas: puzzle.temas || puzzle.themes || [], rating: puzzle.rating,
        }]));
        return true;
      }

      expectedIdxRef.current += 1;
      setFenAtual(c.fen());
      setUltimoLanceAdv(null);

      const respIdx = expectedIdxRef.current;
      if (lances[respIdx]) {
        setTimeout(() => {
          try { Puzzle.aplicarLanceSilencioso(c, lances[respIdx]); } catch (e) {}
          expectedIdxRef.current = respIdx + 1;
          setFenAtual(c.fen());
          setUltimoLanceAdv({ from: lances[respIdx].slice(0, 2), to: lances[respIdx].slice(2, 4) });
          if (expectedIdxRef.current >= lances.length) {
            concluirCorreto();
          }
        }, 500);
        return true;
      }

      concluirCorreto();
      return true;
    }

    function confirmarPendente() {
      if (!lancePendente) return;
      const lp = lancePendente;
      const c = chessRef.current;
      try { c.undo(); } catch (e) {}
      setLancePendente(null);
      avaliarLance(lp.from, lp.to, lp.promo);
    }

    function cancelarPendente() {
      if (!lancePendente) return;
      const c = chessRef.current;
      try { c.undo(); } catch (e) {}
      setFenAtual(c.fen());
      setLancePendente(null);
    }

    function escolherPromocao(piece) {
      if (!promoPicker) return;
      const pp = promoPicker;
      setPromoPicker(null);
      processarLance(pp.from, pp.to, piece);
    }

    function cancelarPromocao() {
      setPromoPicker(null);
    }

    function concluirCorreto() {
      const tempo = segRef.current;
      setRodando(false);
      const lances = puzzle.lances || puzzle.moves || [];
      const sans = Puzzle.sequenciaSan(fenInicialJogadorRef.current, lances.slice(1));
      setFeedback({ correto: true, tempo_s: tempo, sans: sans });
      setEstado("feedback");
      setResultados(rs => rs.concat([{
        puzzle_id: puzzle.id || puzzle.puzzleId, correto: true,
        tempo_s: tempo, temas: puzzle.temas || puzzle.themes || [], rating: puzzle.rating,
      }]));
    }

    function pular() {
      if (estado !== "jogando") return;
      const tempo = segRef.current;
      setRodando(false);
      const lances = puzzle.lances || puzzle.moves || [];
      const sans = Puzzle.sequenciaSan(fenInicialJogadorRef.current, lances.slice(1));
      setFeedback({ correto: false, tempo_s: tempo, sans: sans, pulado: true });
      setEstado("feedback");
      setResultados(rs => rs.concat([{
        puzzle_id: puzzle.id || puzzle.puzzleId, correto: false,
        tempo_s: tempo, temas: puzzle.temas || puzzle.themes || [], rating: puzzle.rating,
      }]));
    }

    function avancar() {
      const novoResultados = resultados;
      if (idx + 1 >= total) {
        onConcluirCiclo && onConcluirCiclo(novoResultados);
      } else {
        setIdx(idx + 1);
      }
    }

    function confirmarUci() {
      const v = uciInput.trim().toLowerCase();
      if (v.length < 4) return;
      const from = v.slice(0, 2);
      const to = v.slice(2, 4);
      const promo = v[4];
      processarLance(from, to, promo);
      setUciInput("");
    }

    const onDrop = (source, target) => {
      if (estado !== "jogando") return false;
      setCasaSelecionada(null);
      return processarLance(source, target);
    };

    const onSquareClick = (sq) => {
      if (estado !== "jogando" || pausado || lancePendente || promoPicker) return;
      const c = chessRef.current;
      if (!c) return;
      if (!casaSelecionada) {
        const piece = c.get(sq);
        if (!piece || piece.color !== c.turn()) return;
        setCasaSelecionada(sq);
        return;
      }
      if (casaSelecionada === sq) {
        setCasaSelecionada(null);
        return;
      }
      const r = processarLance(casaSelecionada, sq);
      if (r === false) {
        const piece = c.get(sq);
        setCasaSelecionada(piece && piece.color === c.turn() ? sq : null);
      } else {
        setCasaSelecionada(null);
      }
    };

    // Atalhos de teclado: handler se renova a cada mudança das deps lidas.
    useKeyboardShortcuts((e) => {
      if (promoPicker) {
        if (e.key === "Escape") { e.preventDefault(); cancelarPromocao(); }
        else if (e.key === "q" || e.key === "Q") { e.preventDefault(); escolherPromocao("q"); }
        else if (e.key === "r" || e.key === "R") { e.preventDefault(); escolherPromocao("r"); }
        else if (e.key === "b" || e.key === "B") { e.preventDefault(); escolherPromocao("b"); }
        else if (e.key === "n" || e.key === "N") { e.preventDefault(); escolherPromocao("n"); }
        return;
      }
      if (estado === "jogando" && lancePendente) {
        if (e.key === "Enter") { e.preventDefault(); confirmarPendente(); }
        else if (e.key === "Escape") { e.preventDefault(); cancelarPendente(); }
        return;
      }
      if (estado === "jogando") {
        if (e.key === " ") { e.preventDefault(); pular(); }
        else if (e.key === "p" || e.key === "P") { e.preventDefault(); setPausado(p => !p); }
        return;
      }
      if (estado === "feedback") {
        if (e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); avancar(); }
        return;
      }
    }, [estado, lancePendente, promoPicker, idx, pausado]);

    return {
      // Posição corrente
      idx: idx,
      total: total,
      puzzle: puzzle,
      fenAtual: fenAtual,
      orientacao: orientacaoRef.current,
      fenInicialJogador: fenInicialJogadorRef.current,
      // Acúmulos
      resultados: resultados,
      acertos: acertos,
      erros: erros,
      restantes: restantes,
      tempoAcumulado: tempoAcumulado,
      ritmoVsBaseline: ritmoVsBaseline,
      // Estado de jogo
      estado: estado,
      feedback: feedback,
      lancePendente: lancePendente,
      promoPicker: promoPicker,
      casaSelecionada: casaSelecionada,
      ultimoLanceAdv: ultimoLanceAdv,
      ultimoLanceErrado: ultimoLanceErrado,
      erroPuzzle: erroPuzzle,
      // Timer
      seg: seg,
      pausado: pausado,
      // Modos
      modoConfirmar: modoConfirmar,
      uciInput: uciInput,
      // Ações
      onDrop: onDrop,
      onSquareClick: onSquareClick,
      confirmarPendente: confirmarPendente,
      cancelarPendente: cancelarPendente,
      escolherPromocao: escolherPromocao,
      cancelarPromocao: cancelarPromocao,
      pular: pular,
      avancar: avancar,
      confirmarUci: confirmarUci,
      setUciInput: setUciInput,
      setModoConfirmar: setModoConfirmar,
      setPausado: setPausado,
      pularPuzzleErro: () => setIdx(idx + 1),
    };
  }

  global.WP = global.WP || {};
  global.WP.Hooks = global.WP.Hooks || {};
  global.WP.Hooks.useJogoPuzzle = useJogoPuzzle;
})(typeof window !== "undefined" ? window : globalThis);
