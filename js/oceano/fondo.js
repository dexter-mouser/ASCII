// Fondo fijo del océano: rocas lejanas, arena con ondas, rocas y corales.
// Se dibuja una sola vez en una capa y después solo se copia.
const FondoOceano = {
  generar(capa, columnas, filas) {
    capa.limpiar();
    const ruido = Utilidades.ruido, fbm = Utilidades.fbm, lim = Utilidades.limitar;
    const rampa = CONFIG.rampa, tope = rampa.length - 1, P = PALETA_OCEANO, salida = [0, 0, 0];

    // Altura del fondo en cada columna
    this.suelo = new Float32Array(columnas);
    for (let x = 0; x < columnas; x++) this.suelo[x] = filas * (0.8 + (fbm(x * 0.025, 3) - 0.5) * 0.14);

    // Rocas lejanas: una silueta azulada, casi perdida en el agua
    for (let x = 0; x < columnas; x++) {
      const cima = filas * (0.52 + (1 - fbm(x * 0.018 + 20, 1)) * 0.26);
      for (let y = Math.floor(cima); y < this.suelo[x]; y++) {
        if (ruido(x, y + 50) > 0.6) continue;
        const k = 0.45 + 0.55 * lim((y - cima) / (filas * 0.25), 0, 1), c = P.lejos;
        capa.poner(x, y, rampa[Math.floor((0.08 + 0.14 * fbm(x * 0.2, y * 0.3)) * tope)], c[0] * k, c[1] * k, c[2] * k);
      }
    }

    // Arena con ondas: más clara arriba, donde llega la luz
    for (let x = 0; x < columnas; x++) {
      for (let y = Math.floor(this.suelo[x]); y < filas; y++) {
        const prof = (y - this.suelo[x]) / (filas * 0.2);
        const onda = 0.12 * Math.sin(x * 0.45 + y * 1.6 + fbm(x * 0.05, y * 0.1) * 6);
        const luz = lim(0.85 - prof * 0.6 + onda + (ruido(x, y) - 0.5) * 0.15, 0, 1);
        const c = Utilidades.colorLlama(luz, P.arena, salida);
        capa.poner(x, y, rampa[Math.floor((0.2 + 0.6 * luz) * tope * 0.7)], c[0], c[1], c[2]);
      }
    }

    // Rocas grandes sobre la arena
    this.fuentes = [];
    for (let i = 0; i < 4; i++) {
      const cx = Math.floor(columnas * (0.08 + 0.26 * i + ruido(i, 1) * 0.1));
      const radio = filas * (0.05 + ruido(i, 2) * 0.05), cy = this.suelo[Math.min(cx, columnas - 1)] + radio * 0.35;
      this.roca(capa, cx, cy, radio);
      this.fuentes.push({ x: cx + (ruido(i, 3) - 0.5) * radio, y: cy - radio * 0.9 });  // grietas de donde salen burbujas
    }

    // Corales: ramificados y redondos, entre las rocas
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(columnas * (0.04 + i * 0.17 + ruido(i, 9) * 0.08));
      if (x >= columnas) continue;
      const y = this.suelo[x] + 1, color = P.coral[i % P.coral.length];
      if (i % 2 === 0) this.rama(capa, x, y, (ruido(i, 4) - 0.5) * 0.4, filas * (0.05 + ruido(i, 5) * 0.03), 3, color);
      else this.cerebro(capa, x, y, filas * (0.03 + ruido(i, 6) * 0.025), color);
    }

    // Algas: solo se guardan sus raíces, se dibujan en cada fotograma porque se mecen
    this.algas = [];
    for (let i = 0; i < AJUSTES_OCEANO.algas; i++) {
      const x = Math.floor(ruido(i, 14) * columnas);
      this.algas.push({ x: x, base: Math.floor(this.suelo[x]) + 1, alto: Math.floor(filas * (0.12 + ruido(i, 15) * 0.32)), fase: ruido(i, 16) * 6.28 });
    }
  },

  // Roca redondeada con borde irregular; la luz baja desde arriba
  roca(capa, cx, cy, radio) {
    const rampa = CONFIG.rampa, tope = rampa.length - 1, salida = [0, 0, 0];
    for (let y = Math.floor(cy - radio); y <= Math.ceil(cy + radio * 0.4); y++) {
      for (let x = Math.floor(cx - radio / 0.6); x <= Math.ceil(cx + radio / 0.6); x++) {
        const dx = (x - cx) * 0.6 / radio, dy = (y - cy) / radio, q = dx * dx + dy * dy;
        if (q > 0.75 + 0.5 * Utilidades.fbm(x * 0.3, y * 0.3)) continue;
        const luz = Utilidades.limitar(-0.3 * dx - 0.7 * dy + 0.3 * Math.sqrt(Math.max(0, 1 - q)) + 0.1, 0, 1);
        const c = Utilidades.colorLlama(luz, PALETA_OCEANO.roca, salida);
        capa.poner(x, y, rampa[Math.floor((0.3 + 0.6 * luz) * tope * 0.85)], c[0], c[1], c[2]);
      }
    }
  },

  // Coral ramificado: cada rama se parte en dos hasta llegar a las puntas
  rama(capa, x, y, angulo, largo, nivel, color) {
    const k = 0.45 + 0.15 * (3 - nivel);
    for (let paso = 0; paso < largo; paso += 0.7) {
      x += Math.sin(angulo) * 0.7 / 0.6;
      y -= Math.cos(angulo) * 0.7;
      const s = Math.sin(angulo), caracter = Math.abs(s) < 0.35 ? "|" : s > 0 ? "/" : "\\";
      capa.poner(x, y, caracter, color[0] * k, color[1] * k, color[2] * k);
    }
    if (nivel === 0) { capa.poner(x, y - 1, "o", color[0], color[1], color[2]); return; }
    const abrir = 0.4 + Utilidades.ruido(x, y) * 0.25;
    this.rama(capa, x, y, angulo - abrir, largo * 0.72, nivel - 1, color);
    this.rama(capa, x, y, angulo + abrir, largo * 0.72, nivel - 1, color);
  },

  // Coral redondo con surcos ondulados
  cerebro(capa, cx, base, radio, color) {
    for (let y = Math.floor(base - radio); y <= base; y++) {
      for (let x = Math.floor(cx - radio / 0.6); x <= Math.ceil(cx + radio / 0.6); x++) {
        const dx = (x - cx) * 0.6 / radio, dy = (y - base) / radio;
        if (dx * dx + dy * dy > 1) continue;
        const surco = Math.sin(x * 0.9 + Math.sin(y * 1.3) * 2) > 0.2, k = (surco ? 0.85 : 0.5) * (0.7 - 0.3 * dy);
        capa.poner(x, y, surco ? "@" : "%", color[0] * k, color[1] * k, color[2] * k);
      }
    }
  }
};
