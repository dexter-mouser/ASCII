// Elementos que se mueven en el cielo: murciélagos y un dragón que cruza de vez en cuando
const DRAGON = [
  String.raw`
  \\    //
   \\  //
 <==(oo)===>~`,
  String.raw`
 <==(oo)===>~
   //  \\
  //    \\`
].map((cuadro) => cuadro.split("\n").slice(1));

const Cielo = {
  dibujar(cuadricula, tiempo) {
    const columnas = cuadricula.columnas, filas = cuadricula.filas;

    // Murciélagos: cruzan la pantalla con un vuelo ondulado
    for (let n = 0; n < 7; n++) {
      const x = ((Utilidades.ruido(n, 1) * columnas + tiempo * (3 + 4 * Utilidades.ruido(n, 3))) % (columnas + 20)) - 10;
      const y = filas * (0.20 + 0.10 * Utilidades.ruido(n, 2)) + 2 * Math.sin(tiempo * (1.5 + 2 * Utilidades.ruido(n, 4)) + n);
      const c = PALETA.murcielago;
      cuadricula.poner(x, y, Math.floor(tiempo * 6 + n) % 2 ? "v" : "w", c[0], c[1], c[2]);
    }

    // Dragón: cruza el cielo cada 50 segundos
    const e = Math.max(1, Math.round(columnas / 120));  // escala según el tamaño de la pantalla
    const x0 = -30 * e + (tiempo % 50) * (columnas + 60 * e) / 22;
    if (x0 > columnas) return;
    const y0 = filas * 0.17 + Math.sin(tiempo * 0.8) * filas * 0.02;
    const cuadro = DRAGON[Math.floor(tiempo * 3) % 2], c = PALETA.dragon;
    cuadro.forEach((linea, j) => {
      for (let k = 0; k < linea.length; k++) {
        if (linea[k] === " ") continue;
        for (let a = 0; a < e; a++) for (let b = 0; b < e; b++) {
          cuadricula.poner(x0 + k * e + a, y0 + j * e + b, linea[k], c[0], c[1], c[2]);
        }
      }
    });
  }
};
