// Arranque de la página de inicio
(function () {
  const raiz = document.querySelector(".inicio");
  Portada.iniciar(document.getElementById("fondoInicio"), raiz);
  Menu.iniciar(raiz, document.getElementById("menu"));
})();
