// Hooks de timer. Pausável e compatível.
// Carregado como regular <script> — usa React.useState etc. em vez de
// destructuring (que só existe no escopo do bloco babel-standalone).
(function (global) {
  "use strict";
  const React = global.React;
  if (!React) throw new Error("[useTimer] React precisa estar carregado");

  function useTimerComPausa(rodando, pausado) {
    const [seg, setSeg] = React.useState(0);
    React.useEffect(() => {
      if (!rodando || pausado) return;
      const t = setInterval(() => setSeg(s => s + 1), 1000);
      return () => clearInterval(t);
    }, [rodando, pausado]);
    const reset = React.useCallback(() => setSeg(0), []);
    return [seg, reset];
  }

  function useTimer(rodando) {
    return useTimerComPausa(rodando, false);
  }

  global.WP = global.WP || {};
  global.WP.Hooks = global.WP.Hooks || {};
  global.WP.Hooks.useTimer = useTimer;
  global.WP.Hooks.useTimerComPausa = useTimerComPausa;
})(typeof window !== "undefined" ? window : globalThis);
