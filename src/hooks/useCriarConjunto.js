// Hook que encapsula o wizard de 3 passos da TelaCriar:
// (1) rating + variacao  (2) temas  (3) tamanho + nome → montar.
//
// Owns: passo, rating, variacao, temas, tamanho, nome,
//        montando, progresso, progPct, pieceLit, resultado, erro.
// Inputs: preset (opcional) com rating/variacao/temas/tamanho/nome.
// Função montar() chama window.WP.montarConjunto se setado pelo App,
// ou recebe via parâmetro montarFn (preferido — evita acoplamento global).
(function (global) {
  "use strict";
  const React = global.React;
  if (!React) throw new Error("[useCriarConjunto] React precisa estar carregado");
  const { useState, useMemo } = React;

  function useCriarConjunto(opts) {
    opts = opts || {};
    const preset = opts.preset || null;
    const montarFn = opts.montarFn;
    const traduzirTema = (global.WP && global.WP.WP_HELPERS)
      ? null
      : null;

    const [passo, setPasso]       = useState(preset ? 3 : 1);
    const [rating, setRating]     = useState(preset && preset.rating ? preset.rating : 1200);
    const [variacao, setVariacao] = useState(preset && preset.variacao ? preset.variacao : 200);
    const [temas, setTemas]       = useState(preset && preset.temas ? preset.temas : []);
    const [tamanho, setTamanho]   = useState(preset && preset.tamanho ? preset.tamanho : 1000);
    const [nome, setNome]         = useState(preset && preset.nome ? preset.nome : "");
    const [montando, setMontando] = useState(false);
    const [progresso, setProgresso] = useState("");
    const [progPct, setProgPct]   = useState(0);
    const [pieceLit, setPieceLit] = useState(0);
    const [resultado, setResultado] = useState(null);
    const [erro, setErro]         = useState(null);

    const helpers = global.WP_HELPERS || {};
    const nomeDefault = useMemo(() => {
      const _trad = helpers.traduzirTema || function (t) { return t; };
      const lbl = temas.length === 0 ? "Geral"
        : (temas.length <= 2 ? temas.map(_trad).join("+") : (temas.length + " temas"));
      return "Conjunto " + rating + " · " + lbl;
    }, [rating, temas]);
    const nomeFinal = nome.trim() || nomeDefault;

    const toggleTema = (t) => {
      setTemas(prev => prev.includes(t) ? prev.filter(x => x !== t) : prev.concat(t));
    };

    async function montar() {
      if (typeof montarFn !== "function") {
        setErro("montarFn não foi injetado pelo componente");
        return;
      }
      setMontando(true);
      setErro(null);
      setProgPct(8);
      setPieceLit(0);
      const pieceTimer = setInterval(() => setPieceLit(p => Math.min(6, p + 1)), 600);
      try {
        const r = await montarFn(rating, variacao, temas, tamanho, (msg) => {
          setProgresso(msg);
          setProgPct(p => Math.min(95, p + 12));
        });
        setProgPct(100);
        setResultado(r);
      } catch (e) {
        console.error(e);
        setErro(e.message || String(e));
      } finally {
        clearInterval(pieceTimer);
        setMontando(false);
      }
    }

    return {
      // wizard state
      passo: passo, setPasso: setPasso,
      rating: rating, setRating: setRating,
      variacao: variacao, setVariacao: setVariacao,
      temas: temas, setTemas: setTemas, toggleTema: toggleTema,
      tamanho: tamanho, setTamanho: setTamanho,
      nome: nome, setNome: setNome,
      nomeDefault: nomeDefault, nomeFinal: nomeFinal,
      // montagem
      montando: montando, progresso: progresso, progPct: progPct, pieceLit: pieceLit,
      resultado: resultado, erro: erro, setErro: setErro,
      montar: montar,
    };
  }

  global.WP = global.WP || {};
  global.WP.Hooks = global.WP.Hooks || {};
  global.WP.Hooks.useCriarConjunto = useCriarConjunto;
})(typeof window !== "undefined" ? window : globalThis);
