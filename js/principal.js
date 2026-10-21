// Arranque y animación de la hoguera
(function () {
  const lienzo = document.getElementById("lienzo");
  let cuadricula, capaFondo;
  let tiempo = 0;
  let numeroCuadro = 0;

  // Recalcula todo según el tamaño de la ventana
  function configurar() {
    const tamano = Utilidades.limitar(window.innerWidth / 150, 6.5, 12);  // letra pequeña = más detalle
    Render.ajustar(lienzo, window.innerWidth, window.innerHeight, tamano);
    cuadricula = new Cuadricula(Render.columnas, Render.filas);
    capaFondo = new Cuadricula(Render.columnas, Render.filas);  // fondo y caballero en caché
    Iluminacion.iniciar(Render.columnas, Render.filas);
    Fuego.iniciar(Render.columnas, Render.filas);
    Fondo.generar(Render.columnas, Render.filas);
    Chispas.reiniciar();
  }

  // Un fotograma. El fondo y el caballero (lo más costoso) se redibujan por mitades de filas, alternando.
  function cuadro(dt) {
    tiempo += dt;

    // Viento suave natural + el que genera el usuario
    const viento = Utilidades.limitar(
      0.22 * Math.sin(tiempo * 0.7) + 0.12 * Math.sin(tiempo * 2.3) + Estado.ventoExtra, -1, 1);
    Estado.ventoExtra *= Math.max(0, 1 - 2.5 * dt);

    const paleta = PALETA;
    Fuego.actualizar(dt, viento, tiempo);
    Chispas.actualizar(dt, viento);

    const paridad = numeroCuadro++ & 1;
    capaFondo.limpiarFilas(paridad);
    Fondo.dibujar(capaFondo, tiempo, paridad);
    Personajes.dibujar(capaFondo, paridad);

    // Capas de atrás hacia adelante
    cuadricula.copiarDe(capaFondo);
    Cielo.dibujar(cuadricula, tiempo);
    Fondo.dibujarAntorchas(cuadricula, tiempo);
    Fuego.dibujar(cuadricula, paleta);
    Fuego.dibujarEspada(cuadricula);
    Fuego.dibujarTroncos(cuadricula, paleta);
    Fuego.dibujarBrasas(cuadricula, paleta, tiempo);
    Chispas.dibujar(cuadricula, paleta);
    Render.dibujar(cuadricula, paleta);
  }

  configurar();
  Controles.iniciar(lienzo);
  window.addEventListener("resize", configurar);
  Bucle.iniciar(CONFIG.fotogramas, cuadro);
})();
