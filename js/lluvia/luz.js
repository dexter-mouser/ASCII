// Iluminación: la noche es azul, los relámpagos lo iluminan todo y la vela y el neón dan luz local
const CERO = [0, 0, 0];

const Luz = {
  destello: 0,   // intensidad del relámpago (0 a 1)
  luces: [],     // luces locales: { x, y, radio, fuerza, color }
  temporal: [0, 0, 0],

  // Luz local acumulada en una celda (vela, neón)
  local(x, y) {
    const t = this.temporal;
    t[0] = t[1] = t[2] = 0;
    for (const l of this.luces) {
      const dx = (x - l.x) * 0.6, dy = y - l.y;
      const k = l.fuerza / (1 + (dx * dx + dy * dy) / (l.radio * l.radio));
      t[0] += l.color[0] * k; t[1] += l.color[1] * k; t[2] += l.color[2] * k;
    }
    return t;
  },

  // Escribe una celda: color base teñido por la noche, el relámpago y la luz local
  poner(cuadricula, x, y, caracter, base, factor, local) {
    const a = PALETA_LLUVIA.ambiente, f = PALETA_LLUVIA.destello, d = this.destello * 1.6, l = local || CERO;
    cuadricula.poner(x, y, caracter,
      base[0] * (a[0] + f[0] * d + l[0]) * factor,
      base[1] * (a[1] + f[1] * d + l[1]) * factor,
      base[2] * (a[2] + f[2] * d + l[2]) * factor);
  },

  // Igual, pero la letra se elige según el brillo (más luz = letra más densa)
  ponerRampa(cuadricula, x, y, base, material, textura, factor, usaLocal) {
    const l = usaLocal ? this.local(x, y) : CERO;
    const brillo = (0.2 + this.destello * 1.1 + (l[0] + l[1] + l[2]) / 3) * material * textura * factor;
    const indice = Math.floor(Utilidades.limitar(brillo, 0, 1) * (CONFIG.rampa.length - 1));
    if (indice < 1) return;  // demasiado oscuro: no se dibuja
    this.poner(cuadricula, x, y, CONFIG.rampa[indice], base, material * (0.55 + 0.45 * textura), l);
  }
};
