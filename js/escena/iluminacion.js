// Calcula cuánta luz de la hoguera recibe cada celda y la convierte en color
const Iluminacion = {
  intensidad: 1,  // la modifica el fuego en cada fotograma

  iniciar(columnas, filas) {
    this.fx = Math.floor(columnas * 0.40);  // posición de la hoguera
    this.fy = Math.floor(filas * 0.86);     // fila del suelo
    this.radio = filas * 0.38;              // alcance de la luz
    this.unidad = Math.min(filas / 32, columnas * 0.6 / 30);  // tamaño base del caballero y su nicho
    this.extra = [];                        // luces adicionales (antorchas)
  },

  // Luz en una celda: más fuerte cerca de la hoguera
  luzEn(x, y) {
    const dx = (x - this.fx) * 0.6;  // las celdas son más altas que anchas
    const dy = y - this.fy;
    let luz = this.intensidad / (1 + (dx * dx + dy * dy) / (this.radio * this.radio));
    for (const f of this.extra) {
      const ex = (x - f.x) * 0.6, ey = y - f.y;
      luz += f.fuerza / (1 + (ex * ex + ey * ey) / (f.radio * f.radio));
    }
    return luz;
  },

  // Escribe una celda: color base del material, azulado de noche y anaranjado cerca del fuego
  poner(cuadricula, x, y, caracter, base, factor, luzPropia) {
    const luz = luzPropia === undefined ? this.luzEn(x, y) : luzPropia;
    const a = PALETA.ambiente, c = PALETA.calida;
    cuadricula.poner(x, y, caracter,
      base[0] * (a[0] + c[0] * luz) * factor,
      base[1] * (a[1] + c[1] * luz) * factor,
      base[2] * (a[2] + c[2] * luz) * factor);
  },

  // Igual, pero elige la letra según el brillo (más luz = letra más densa)
  ponerRampa(cuadricula, x, y, base, material, textura, factor) {
    const luz = this.luzEn(x, y);
    const brillo = (0.06 + luz) * material * textura * factor;
    const indice = Math.floor(Utilidades.limitar(brillo, 0, 1) * (CONFIG.rampa.length - 1));
    if (indice < 1) return;  // demasiado oscuro: no se dibuja
    this.poner(cuadricula, x, y, CONFIG.rampa[indice], base, material * (0.55 + 0.45 * textura), luz);
  }
};
