// Arranque y animación de la galaxia
(function () {
  const lienzo = document.getElementById("lienzo");
  let cuadricula, capaFondo, tiempo = 0;

  // Recalcula todo según el tamaño de la ventana
  function configurar() {
    const ancho = window.innerWidth, alto = window.innerHeight;
    Render.ajustar(lienzo, ancho, alto, Utilidades.limitar(ancho / 100, 8, 14));  // letra no muy pequeña = menos celdas
    cuadricula = new Cuadricula(Render.columnas, Render.filas);
    capaFondo = new Cuadricula(Render.columnas, Render.filas);
    FondoGalaxia.generar(capaFondo, Render.columnas, Render.filas);
    Galaxia.iniciar(Render.columnas, Render.filas);
  }

  function cuadro(dt) {
    tiempo += dt;

    Galaxia.actualizar(dt);
    Efectos.actualizar(dt);

    cuadricula.copiarDe(capaFondo);   // fondo ya dibujado
    Galaxia.dibujar(cuadricula, tiempo);
    Efectos.dibujar(cuadricula, tiempo);
    Render.dibujar(cuadricula, { cielo: PALETA_GALAXIA.cielo });
  }

  // Controles: el puntero inclina y gira la galaxia; un clic lanza una onda de luz
  lienzo.addEventListener("pointermove", (e) => {
    Galaxia.objetivoCosI = 0.35 + 0.6 * (e.clientY / window.innerHeight);
    Galaxia.objetivoAngulo = -0.4 + (e.clientX / window.innerWidth - 0.5) * 1.0;
  });
  lienzo.addEventListener("pointerdown", (e) => Efectos.pulso(e.clientX / Render.celdaAncho, e.clientY / Render.tamano));

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
