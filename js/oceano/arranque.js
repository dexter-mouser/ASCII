// Arranque y animación del océano submarino
(function () {
  const lienzo = document.getElementById("lienzo");
  let cuadricula, capaFondo, tiempo = 0;

  // Recalcula todo según el tamaño de la ventana
  function configurar() {
    const ancho = window.innerWidth, alto = window.innerHeight;
    Render.ajustar(lienzo, ancho, alto, Utilidades.limitar(ancho / 120, 7, 13));
    cuadricula = new Cuadricula(Render.columnas, Render.filas);
    capaFondo = new Cuadricula(Render.columnas, Render.filas);
    FondoOceano.generar(capaFondo, Render.columnas, Render.filas);
    Mar.iniciar(Render.columnas, Render.filas);
    Vida.iniciar(Render.columnas, Render.filas);
  }

  function cuadro(dt) {
    tiempo += dt;

    Mar.actualizar(dt, tiempo);
    Vida.actualizar(dt, tiempo, Mar.corriente);

    cuadricula.copiarDe(capaFondo);   // fondo ya dibujado
    Mar.dibujarAgua(cuadricula, tiempo);
    Mar.dibujarAlgas(cuadricula, tiempo);
    Vida.dibujar(cuadricula, tiempo);
    Mar.dibujarBurbujas(cuadricula);
    Render.dibujar(cuadricula, { cielo: PALETA_OCEANO.cielo });
  }

  // Controles: el puntero mueve la corriente; un clic suelta burbujas y asusta a los peces
  lienzo.addEventListener("pointermove", (e) => {
    Mar.objetivo = (e.clientX / window.innerWidth - 0.5) * 2;
  });
  lienzo.addEventListener("pointerdown", (e) => {
    const col = e.clientX / Render.celdaAncho, fila = e.clientY / Render.tamano;
    Mar.soltar(col, fila, 25);
    Vida.asustar(col, fila);
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
