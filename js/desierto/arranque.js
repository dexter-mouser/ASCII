// Arranque y animación del desierto con aurora
(function () {
  const lienzo = document.getElementById("lienzo");
  let cuadricula, capaFondo, tiempo = 0;

  // Recalcula todo según el tamaño de la ventana
  function configurar() {
    const ancho = window.innerWidth, alto = window.innerHeight;
    Render.ajustar(lienzo, ancho, alto, Utilidades.limitar(ancho / 120, 7, 13));
    cuadricula = new Cuadricula(Render.columnas, Render.filas);
    capaFondo = new Cuadricula(Render.columnas, Render.filas);
    FondoDesierto.generar(capaFondo, Render.columnas, Render.filas);
    Aurora.iniciar(Render.columnas, Render.filas);
    Arena.iniciar(Render.columnas, Render.filas);
  }

  function cuadro(dt) {
    tiempo += dt;

    Aurora.actualizar(dt);
    Arena.actualizar(dt);

    cuadricula.copiarDe(capaFondo);   // fondo ya dibujado
    Aurora.dibujar(cuadricula, tiempo);
    Aurora.reflejar(cuadricula);
    Arena.dibujar(cuadricula);
    Render.dibujar(cuadricula, { cielo: PALETA_DESIERTO.cielo });
  }

  // Controles: el puntero cambia el viento (horizontal) y los colores de la aurora (vertical);
  // un clic lanza una ráfaga de arena y aviva la aurora
  lienzo.addEventListener("pointermove", (e) => {
    Arena.objetivo = (e.clientX / window.innerWidth - 0.5) * 2;
    Aurora.objetivoMezcla = Utilidades.limitar(e.clientY / window.innerHeight, 0, 1);
  });
  lienzo.addEventListener("pointerdown", () => {
    Arena.rafaga = 1.5;
    Aurora.pulso = 1;
  });

  function pantallaCompleta() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  }
  window.addEventListener("keydown", (e) => { if (e.key.toLowerCase() === "f") pantallaCompleta(); });
  document.getElementById("btnPantalla").addEventListener("click", pantallaCompleta);

  configurar();
  window.addEventListener("resize", configurar);
  Bucle.iniciar(CONFIG.fotogramas, cuadro);
})();
