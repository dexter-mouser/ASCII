// Arranque y animación del bosque con luciérnagas
(function () {
  const lienzo = document.getElementById("lienzo");
  let cuadricula, capaFondo, tiempo = 0;

  // Recalcula todo según el tamaño de la ventana
  function configurar() {
    const ancho = window.innerWidth, alto = window.innerHeight;
    Render.ajustar(lienzo, ancho, alto, Utilidades.limitar(ancho / 120, 7, 13));
    cuadricula = new Cuadricula(Render.columnas, Render.filas);
    capaFondo = new Cuadricula(Render.columnas, Render.filas);
    FondoBosque.generar(capaFondo, Render.columnas, Render.filas);
    Noche.iniciar(Render.columnas, Render.filas);
    Luciernagas.iniciar(Render.columnas, Render.filas);
  }

  function cuadro(dt) {
    tiempo += dt;

    Noche.actualizar(dt);
    Luciernagas.actualizar(dt, tiempo);

    cuadricula.copiarDe(capaFondo);   // fondo ya dibujado
    Noche.dibujarOjos(cuadricula);
    Noche.dibujarNiebla(cuadricula, tiempo);
    Noche.dibujarHierba(cuadricula, tiempo);
    Luciernagas.dibujar(cuadricula, tiempo);
    Render.dibujar(cuadricula, { cielo: PALETA_BOSQUE.cielo });
  }

  // Controles: las luciérnagas rodean al puntero; un clic las dispersa
  const aCelda = (e) => ({ x: e.clientX / Render.celdaAncho, y: e.clientY / Render.tamano });
  lienzo.addEventListener("pointermove", (e) => { Luciernagas.puntero = aCelda(e); });
  lienzo.addEventListener("pointerleave", () => { Luciernagas.puntero = null; });
  lienzo.addEventListener("pointerdown", (e) => {
    const p = aCelda(e);
    Luciernagas.dispersar(p.x, p.y);
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
