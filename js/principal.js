// Arranque y bucle de animación
(function () {
  const lienzo = document.getElementById("lienzo");
  let cuadricula;
  let tiempo = 0;
  let previo = 0;

  // Recalcula todo según el tamaño de la ventana
  function configurar() {
    const tamano = Utilidades.limitar(window.innerWidth / 150, 6.5, 12);  // letra pequeña = más detalle
    Render.ajustar(lienzo, window.innerWidth, window.innerHeight, tamano);
    cuadricula = new Cuadricula(Render.columnas, Render.filas);
    Iluminacion.iniciar(Render.columnas, Render.filas);
    Fuego.iniciar(Render.columnas, Render.filas);
    Fondo.generar(Render.columnas, Render.filas);
    Chispas.reiniciar();
  }

  function bucle(ahora) {
    const dt = Math.min((ahora - previo) / 1000, 0.05);
    previo = ahora;
    tiempo += dt;

    // Viento suave natural + el que genera el usuario
    const viento = Utilidades.limitar(
      0.22 * Math.sin(tiempo * 0.7) + 0.12 * Math.sin(tiempo * 2.3) + Estado.ventoExtra, -1, 1);
    Estado.ventoExtra *= Math.max(0, 1 - 2.5 * dt);

    const paleta = PALETA;
    Fuego.actualizar(dt, viento, tiempo);
    Chispas.actualizar(dt, viento);

    // Capas de atrás hacia adelante
    cuadricula.limpiar();
    Fondo.dibujar(cuadricula, tiempo);
    Cielo.dibujar(cuadricula, tiempo);
    Personajes.dibujar(cuadricula);
    Fuego.dibujar(cuadricula, paleta);
    Fuego.dibujarEspada(cuadricula);
    Fuego.dibujarTroncos(cuadricula, paleta);
    Fuego.dibujarBrasas(cuadricula, paleta, tiempo);
    Chispas.dibujar(cuadricula, paleta);
    Render.dibujar(cuadricula, paleta);

    requestAnimationFrame(bucle);
  }

  configurar();
  Controles.iniciar(lienzo);
  window.addEventListener("resize", configurar);
  requestAnimationFrame((t) => { previo = t; bucle(t); });
})();
