// Fondo fijo del bosque: estrellas, luna con halo, colinas, tres capas de pinos, suelo y hongos.
// Se dibuja una sola vez en una capa y después solo se copia.
const FondoBosque = {
  generar(capa, columnas, filas) {
    capa.limpiar();
    this.ojos = null;
    const ruido = Utilidades.ruido, fbm = Utilidades.fbm, lim = Utilidades.limitar;
    const rampa = CONFIG.rampa, tope = rampa.length - 1, P = PALETA_BOSQUE, salida = [0, 0, 0];

    this.suelo = new Float32Array(columnas);
    for (let x = 0; x < columnas; x++) this.suelo[x] = filas * (0.86 + (fbm(x * 0.02, 5) - 0.5) * 0.06);

    // Estrellas
    for (let y = 0; y < filas * 0.6; y++) {
      for (let x = 0; x < columnas; x++) {
        const r = ruido(x * 1.7, y * 0.9 + 3);
        if (r <= 0.985) continue;
        const k = 0.35 + 0.55 * ruido(x + 4, y), e = P.estrella;
        capa.poner(x, y, r > 0.996 ? "+" : r > 0.99 ? "'" : ".", e[0] * k, e[1] * k, e[2] * k);
      }
    }

    // Luna con halo (arriba a la derecha)
    const lx = columnas * 0.78, ly = filas * 0.17, lr = filas * 0.075;
    this.luna = { x: lx, y: ly, radio: lr };
    for (let y = Math.floor(ly - lr * 3); y <= ly + lr * 3; y++) {
      for (let x = Math.floor(lx - lr * 5); x <= lx + lr * 5; x++) {
        const dx = (x - lx) * 0.6 / lr, dy = (y - ly) / lr, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1) {
          const crater = fbm(x * 0.25, y * 0.4) > 0.6 ? 0.3 : 0;
          const luz = lim(0.7 + 0.3 * Math.sqrt(1 - d * d) - crater, 0, 1);
          const c = Utilidades.colorLlama(luz, P.luna, salida);
          capa.poner(x, y, rampa[Math.floor((0.5 + 0.45 * luz) * tope)], c[0], c[1], c[2]);
        } else if (d < 3 && ruido(x, y + 9) < (3 - d) * 0.2) {
          const k = (3 - d) / 2 * 0.6, h = P.halo;
          capa.poner(x, y, ".", h[0] * k, h[1] * k, h[2] * k);
        }
      }
    }

    // Colinas lejanas
    for (let x = 0; x < columnas; x++) {
      const cima = filas * (0.5 + (1 - fbm(x * 0.012, 2)) * 0.2), c = P.colinas;
      for (let y = Math.floor(cima); y < this.suelo[x]; y++) {
        if (ruido(x, y + 30) > 0.7) continue;
        const k = 0.6 + 0.4 * fbm(x * 0.1, y * 0.2);
        capa.poner(x, y, rampa[Math.floor((0.12 + 0.15 * k) * tope)], c[0] * k, c[1] * k, c[2] * k);
      }
    }

    // Pinos en tres capas, de la más lejana a la más cercana
    const capas = [
      { cada: 6, alto: [0.16, 0.26], base: 0.68, color: P.arboles[0], luz: 0.45 },
      { cada: 10, alto: [0.26, 0.4], base: 0.78, color: P.arboles[1], luz: 0.7 },
      { cada: 17, alto: [0.42, 0.66], base: 0, color: P.arboles[2], luz: 1 }
    ];
    capas.forEach((c, j) => {
      const n = Math.ceil(columnas / c.cada);
      for (let i = 0; i < n; i++) {
        const x = Math.round((i + 0.2 + ruido(i, j) * 0.6) * c.cada);
        if (x >= columnas || (j > 0 && Math.abs(x - lx) < lr / 0.6 * 1.6)) continue;  // deja ver la luna
        const alto = filas * (c.alto[0] + ruido(i, j + 3) * (c.alto[1] - c.alto[0]));
        const base = j === 2 ? this.suelo[x] + 1 : filas * c.base + (ruido(i, j + 7) - 0.5) * filas * 0.04;
        this.pino(capa, x, base, alto, c);
        if (j === 2 && !this.ojos && x > columnas * 0.15 && x < columnas * 0.5) this.ojos = { x: x, y: Math.round(base - alto * 0.55) };
      }
    });
    if (!this.ojos) this.ojos = { x: Math.round(columnas * 0.3), y: Math.round(filas * 0.5) };

    // Suelo del bosque
    for (let x = 0; x < columnas; x++) {
      for (let y = Math.floor(this.suelo[x]); y < filas; y++) {
        const luz = lim(0.3 + 0.5 * fbm(x * 0.1, y * 0.3) - (y - this.suelo[x]) * 0.03, 0, 1);
        const c = Utilidades.colorLlama(luz, P.suelo, salida);
        capa.poner(x, y, rampa[Math.floor((0.15 + 0.35 * luz) * tope)], c[0], c[1], c[2]);
      }
    }

    // Hongos sobre el suelo
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(columnas * (0.05 + i * 0.16 + ruido(i, 21) * 0.08));
      if (x + 1 >= columnas) continue;
      const y = Math.floor(this.suelo[x]), a = P.hongo[0], b = P.hongo[1];
      capa.poner(x - 1, y - 2, "(", a[0], a[1], a[2]);
      capa.poner(x, y - 2, "o", b[0], b[1], b[2]);
      capa.poner(x + 1, y - 2, ")", a[0], a[1], a[2]);
      capa.poner(x, y - 1, "|", b[0] * 0.7, b[1] * 0.7, b[2] * 0.7);
    }

    // Hierba: solo se guarda dónde crece, se dibuja en cada fotograma porque se mece
    this.hierba = [];
    for (let x = 0; x < columnas; x++) {
      if (ruido(x, 11) < 0.2) continue;
      this.hierba.push({ x: x, y: Math.floor(this.suelo[x]) - 1, alto: ruido(x, 12) > 0.55 ? 2 : 1 });
    }
  },

  // Pino por pisos de ramas; la luna está a la derecha, así que ese lado es más claro
  pino(capa, cx, base, alto, c) {
    const lim = Utilidades.limitar, rampa = CONFIG.rampa, tope = rampa.length - 1, t0 = PALETA_BOSQUE.tronco;
    const tronco = Math.max(1, Math.round(alto * 0.12)), copa = alto - tronco, ancho = alto * 0.28, arriba = base - alto;
    for (let k = 0; k < copa; k++) {
      const t = k / copa, piso = (k % 5) / 5, y = Math.round(arriba + k);
      const semi = (0.08 + 0.92 * t) * ancho * (0.6 + 0.4 * piso) / 0.6;   // medio ancho en columnas
      const izq = Math.round(cx - semi), der = Math.round(cx + semi);
      if (izq === der) { capa.poner(cx, y, "^", c.color[0] * c.luz, c.color[1] * c.luz, c.color[2] * c.luz); continue; }
      for (let x = izq; x <= der; x++) {
        const s = (x - cx) / semi;
        const luz = lim(0.35 + 0.35 * s - 0.2 * (1 - piso) + (Utilidades.ruido(x, y) - 0.5) * 0.3, 0, 1) * c.luz;
        const k2 = 0.55 + 0.9 * luz;
        capa.poner(x, y, x === izq ? "/" : x === der ? "\\" : rampa[Math.floor((0.25 + 0.4 * luz) * tope)], c.color[0] * k2, c.color[1] * k2, c.color[2] * k2);
      }
    }
    for (let k = 0; k < tronco; k++) capa.poner(cx, Math.round(base - tronco + k), "|", t0[0] * c.luz, t0[1] * c.luz, t0[2] * c.luz);
  }
};
