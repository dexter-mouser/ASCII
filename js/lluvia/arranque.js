// Arranque y bucle de animación de la escena de lluvia
(function () {
  const lienzo = document.getElementById("lienzo");
  let cuadricula, capaFondo, tiempo = 0, ventoExtra = 0;

  // Recalcula todo según el tamaño de la ventana
  function configurar() {
    const ancho = window.innerWidth, alto = window.innerHeight;
    Render.ajustar(lienzo, ancho, alto, Utilidades.limitar(ancho / 150, 6.5, 12));  // letra pequeña = más detalle
    cuadricula = new Cuadricula(Render.columnas, Render.filas);
    capaFondo = new Cuadricula(Render.columnas, Render.filas);  // escenario en caché, se renueva por mitades
    Escenario.generar(Render.columnas, Render.filas);
    Lluvia.iniciar();
    Cristal.iniciar();
    Humo.reiniciar();
  }

  // Degradado del cielo, aclarado por los relámpagos
  function cielo(i) {
    const base = PALETA_LLUVIA.cielo[i], r = PALETA_LLUVIA.rayo, d = Luz.destello * 0.55;
    return "rgb(" + base.map((c, k) => Math.round(c + (r[k] * 0.6 - c) * d)).join(",") + ")";
  }

  function cuadro(dt) {
    tiempo += dt;

    // Viento natural (inclina la lluvia) + el que genera el usuario con el puntero
    const viento = 18 + 10 * Math.sin(tiempo * 0.5) + 8 * Math.sin(tiempo * 1.7) + ventoExtra * 30;
    ventoExtra *= Math.max(0, 1 - 2 * dt);

    Rayo.actualizar(dt);
    Lluvia.actualizar(dt, viento);
    Cristal.actualizar(dt);
    Humo.actualizar(dt, viento);

    // Capas de atrás hacia adelante
    Escenario.actualizarCapa(capaFondo, tiempo, viento);
    cuadricula.copiarDe(capaFondo);
    Humo.dibujar(cuadricula, false);
    Lluvia.dibujar(cuadricula, viento, 0);
    Rayo.dibujar(cuadricula, tiempo);
    Lluvia.dibujarOndas(cuadricula);
    Lluvia.dibujar(cuadricula, viento, 1);
    Cristal.dibujar(cuadricula);
    Escenario.dibujarObjetos(cuadricula, tiempo);
    Humo.dibujar(cuadricula, true);
    Render.dibujar(cuadricula, { cielo: [cielo(0), cielo(1)] });
  }

  // Controles: el puntero inclina la lluvia, el clic lanza un relámpago
  let ultimoX = null;
  lienzo.addEventListener("pointermove", (e) => {
    if (ultimoX !== null) ventoExtra = Utilidades.limitar(ventoExtra + (e.clientX - ultimoX) / 30, -1, 1);
    ultimoX = e.clientX;
  });
  lienzo.addEventListener("pointerleave", () => { ultimoX = null; });
  lienzo.addEventListener("pointerdown", () => Rayo.disparar());

  function pantallaCompleta() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  }
  window.addEventListener("keydown", (e) => { if (e.key.toLowerCase() === "f") pantallaCompleta(); });
  document.getElementById("btnRayo").addEventListener("click", () => Rayo.disparar());
  document.getElementById("btnPantalla").addEventListener("click", pantallaCompleta);

  configurar();
  window.addEventListener("resize", configurar);
  Bucle.iniciar(CONFIG.fotogramas, cuadro);
})();
