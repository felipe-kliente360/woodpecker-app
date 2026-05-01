// Atalhos de teclado globais. Ignora eventos de inputs/textareas para
// não competir com digitação. deps controlam renovação do handler — o
// chamador deve passar TODAS as variáveis de estado lidas dentro do
// handler pra evitar closures congeladas.
(function (global) {
  "use strict";
  const React = global.React;
  if (!React) throw new Error("[useKeyboardShortcuts] React precisa estar carregado");

  function useKeyboardShortcuts(handler, deps) {
    React.useEffect(() => {
      function onKey(e) {
        if (e.target) {
          const tag = e.target.tagName;
          if (tag === "INPUT" || tag === "TEXTAREA") return;
        }
        handler(e);
      }
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, deps);
  }

  global.WP = global.WP || {};
  global.WP.Hooks = global.WP.Hooks || {};
  global.WP.Hooks.useKeyboardShortcuts = useKeyboardShortcuts;
})(typeof window !== "undefined" ? window : globalThis);
