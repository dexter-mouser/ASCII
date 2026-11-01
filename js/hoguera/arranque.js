// Arranque y animación de la hoguera
(function () {
  const lienzo = document.getElementById("lienzo");
  let cuadricula, capaFondo, tiempo = 0, numeroCuadro = 0;
  let vientoExtra = 0;   // el que genera el puntero; se calma solo

  // Recalcula todo según el tamaño de la ventana
  function configurar() {
    const ancho = window.innerWidth, alto = window.innerHeight;
    Render.ajustar(lienzo, ancho, alto, Utilidades.limitar(ancho / 130, 6.5, 12));  // letra pequeña = más detalle
    cuadricula = new Cuadricula(Render.columnas, Render.filas);
    capaFondo = new Cuadricula(Render.columnas, Render.filas);  // fondo y caballero en caché
    Iluminacion.iniciar(Render.columnas, Render.filas);
    Fuego.iniciar(Render.columnas, Render.filas);
    FondoHoguera.generar(Render.columnas, Render.filas);
    Cielo.iniciar(Render.columnas, Render.filas);
    Chispas.reiniciar();
  }

  // Un fotograma. El fondo y el caballero (lo más costoso) se redibujan por mitades de filas, alternando.
  function cuadro(dt) {
    tiempo += dt;

    // Viento suave natural + el que genera el usuario
    const viento = Utilidades.limitar(0.22 * Math.sin(tiempo * 0.7) + 0.12 * Math.sin(tiempo * 2.3) + vientoExtra, -1, 1);
    vientoExtra *= Math.max(0, 1 - 2.5 * dt);

    const paleta = PALETA_HOGUERA;
    Fuego.actualizar(dt, viento, tiempo);
    Chispas.actualizar(dt, viento);
    Cielo.actualizar(dt);

    const paridad = numeroCuadro++ & 1;
    capaFondo.limpiarFilas(paridad);
    FondoHoguera.dibujar(capaFondo, tiempo, paridad);
    Personajes.dibujar(capaFondo, paridad);

    // Capas de atrás hacia adelante
    cuadricula.copiarDe(capaFondo);
    Cielo.dibujarNiebla(cuadricula, tiempo);
    Cielo.dibujar(cuadricula, tiempo);
    FondoHoguera.dibujarAntorchas(cuadricula, tiempo);
    Fuego.dibujar(cuadricula, paleta);
    Fuego.dibujarEspada(cuadricula);
    Fuego.dibujarTroncos(cuadricula, paleta);
    Fuego.dibujarBrasas(cuadricula, paleta, tiempo);
    Chispas.dibujar(cuadricula, paleta);
    Render.dibujar(cuadricula, paleta);
  }

  // Controles: mover el puntero empuja la llama como viento; un clic aviva el fuego y lanza chispas
  let ultimoX = null;
  lienzo.addEventListener("pointermove", (e) => {
    if (ultimoX !== null) vientoExtra = Utilidades.limitar(vientoExtra + (e.clientX - ultimoX) / 30, -1, 1);
    ultimoX = e.clientX;
  });
  lienzo.addEventListener("pointerleave", () => { ultimoX = null; });
  lienzo.addEventListener("pointerup", () => { ultimoX = null; });
  lienzo.addEventListener("pointerdown", (e) => {
    ultimoX = e.clientX;
    Fuego.avivar();
    Chispas.emitir(25);
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
