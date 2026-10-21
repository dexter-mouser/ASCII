// Fondo fijo: nebulosas, estrellas, un planeta con anillos y una luna.
// Se dibuja una sola vez en una capa y después solo se copia (por eso es muy barato).
const FondoGalaxia = {
  titilantes: [],  // estrellas que sí cambian de brillo en cada fotograma

  generar(capa, columnas, filas) {
    capa.limpiar();
    this.titilantes = [];
    const ruido = Utilidades.ruido, fbm = Utilidades.fbm, lim = Utilidades.limitar;
    const rampa = CONFIG.rampa, tope = rampa.length - 1, P = PALETA_GALAXIA;

    // Nebulosas: nubes de polvo de dos colores, dispersas
    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < columnas; x++) {
        const d = lim((fbm(x * 0.02 + 3, y * 0.045) - 0.52) * 3, 0, 1);
        if (d > 0 && ruido(x, y) < d * 0.35) {
          const m = fbm(x * 0.015 + 9, y * 0.03), a = P.nebulosaA, b = P.nebulosaB, k = 0.35 + 0.4 * d;
          capa.poner(x, y, rampa[Math.floor(d * 0.2 * tope) + 1], (a[0] * (1 - m) + b[0] * m) * k, (a[1] * (1 - m) + b[1] * m) * k, (a[2] * (1 - m) + b[2] * m) * k);
        }
      }
    }

    // Estrellas: la mayoría fijas y unas pocas que titilan
    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < columnas; x++) {
        const r = ruido(x * 1.3, y * 0.7 + 5);
        if (r <= 0.975) continue;
        const c = P.estrellas[Math.floor(ruido(y, x) * 3)];
        if (r > 0.994) { this.titilantes.push({ x: x, y: y, c: c, fase: ruido(x, y * 2) * 6.28 }); continue; }
        const k = 0.35 + 0.5 * ruido(x + 7, y);
        capa.poner(x, y, r > 0.99 ? "+" : r > 0.983 ? "'" : ".", c[0] * k, c[1] * k, c[2] * k);
      }
    }

    // Planeta con anillos (abajo a la izquierda) y luna (arriba a la derecha)
    const radio = filas * 0.13, px = columnas * 0.17, py = filas * 0.74;
    this.anillo(capa, px, py, radio, true);                      // mitad trasera del anillo
    this.esfera(capa, px, py, radio, P.planeta, true);
    this.anillo(capa, px, py, radio, false);                     // mitad delantera del anillo
    this.esfera(capa, columnas * 0.86, filas * 0.16, filas * 0.035, P.luna, false);
  },

  // Esfera sombreada: la luz llega desde arriba a la izquierda
  esfera(capa, cx, cy, radio, colores, bandas) {
    const rampa = CONFIG.rampa, tope = rampa.length - 1, salida = [0, 0, 0];
    for (let y = Math.floor(cy - radio); y <= Math.ceil(cy + radio); y++) {
      for (let x = Math.floor(cx - radio / 0.6); x <= Math.ceil(cx + radio / 0.6); x++) {
        const dx = (x - cx) * 0.6 / radio, dy = (y - cy) / radio, q = dx * dx + dy * dy;
        if (q > 1) continue;
        const luz = Math.max(0, -0.5 * dx - 0.55 * dy + 0.67 * Math.sqrt(1 - q));
        const claridad = Utilidades.limitar(luz * 0.9 + 0.1 + (bandas ? 0.07 * Math.sin(dy * 14) : 0), 0, 1);
        const c = Utilidades.colorLlama(claridad, colores, salida);
        capa.poner(x, y, rampa[Math.floor((0.15 + 0.85 * luz) * 0.8 * tope)], c[0], c[1], c[2]);
      }
    }
  },

  // Anillo inclinado: "atras" dibuja la mitad que queda detrás del planeta, y si no la que queda delante
  anillo(capa, cx, cy, radio, atras) {
    const c = PALETA_GALAXIA.anillo, giro = -0.35, cg = Math.cos(giro), sg = Math.sin(giro);
    for (let rr = 1.35; rr <= 2.1; rr += 0.04) {
      for (let a = 0; a < 6.283; a += 0.02) {
        if ((Math.sin(a) < 0) !== atras) continue;
        const wx = rr * radio * Math.cos(a), wy = rr * radio * Math.sin(a) * 0.28;
        const col = Math.round(cx + (wx * cg - wy * sg) / 0.6), fila = Math.round(cy + wx * sg + wy * cg);
        const k = 0.55 + 0.35 * Math.sin(rr * 20);  // franjas del anillo
        capa.poner(col, fila, rr > 1.7 && rr < 1.78 ? "." : "=", c[0] * k, c[1] * k, c[2] * k);
      }
    }
  }
};
