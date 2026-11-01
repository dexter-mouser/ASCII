// Fondo fijo del desierto: estrellas, vía láctea, mesetas lejanas, tres capas de dunas y cactus.
// Se dibuja una sola vez en una capa y después solo se copia. También guarda cuánto refleja
// cada celda de duna la luz de la aurora, para teñirla en cada fotograma.
const FondoDesierto = {
  generar(capa, columnas, filas) {
    capa.limpiar();
    const ruido = Utilidades.ruido, fbm = Utilidades.fbm, lim = Utilidades.limitar;
    const rampa = CONFIG.rampa, tope = rampa.length - 1, P = PALETA_DESIERTO, salida = [0, 0, 0];
    this.horizonte = filas * 0.62;
    this.reflejo = new Float32Array(columnas * filas);

    // Estrellas, más densas en la franja diagonal de la vía láctea
    for (let y = 0; y < this.horizonte; y++) {
      for (let x = 0; x < columnas; x++) {
        const linea = filas * 0.05 + (x / columnas) * filas * 0.45, bd = (y - linea) / (filas * 0.12);
        const denso = Math.exp(-bd * bd) * fbm(x * 0.05, y * 0.1);
        const r = ruido(x * 1.3, y * 0.7 + 5);
        if (r > 0.985 - denso * 0.08) {
          const k = 0.35 + 0.6 * ruido(x + 7, y), e = P.estrella;
          capa.poner(x, y, r > 0.996 ? "+" : r > 0.99 ? "'" : ".", e[0] * k, e[1] * k, e[2] * k);
        } else if (denso > 0.3 && ruido(x + 3, y) < denso * 0.3) {
          const k = denso * 0.6, c = P.polvo;
          capa.poner(x, y, ".", c[0] * k, c[1] * k, c[2] * k);
        }
      }
    }

    // Mesetas lejanas de cima plana
    for (let x = 0; x < columnas; x++) {
      const m = lim((fbm(x * 0.015 + 4, 2) - 0.5) * 10, 0, 1);
      const cima = this.horizonte - (m * m * (3 - 2 * m) * 0.11 + fbm(x * 0.08, 9) * 0.015) * filas, c = P.meseta;
      for (let y = Math.floor(cima); y < this.horizonte + 3; y++) {
        const k = 0.6 + 0.4 * (1 - (y - cima) / (filas * 0.15));
        capa.poner(x, y, rampa[Math.floor((0.12 + 0.18 * fbm(x * 0.2, y * 0.5)) * tope)], c[0] * k, c[1] * k, c[2] * k);
      }
    }

    // Dunas en tres capas: la luz llega desde arriba a la izquierda, así que brillan las laderas que miran hacia allá
    const capas = [
      { base: 0.64, amp: 0.03, frec: 0.035, luz: 0.5 },
      { base: 0.72, amp: 0.05, frec: 0.025, luz: 0.75 },
      { base: 0.84, amp: 0.065, frec: 0.018, luz: 1 }
    ];
    this.crestas = capas.map((d, j) => {
      const cresta = new Float32Array(columnas);
      for (let x = 0; x < columnas; x++) {
        cresta[x] = filas * (d.base + d.amp * Math.sin(x * d.frec + j * 2.1) + d.amp * 0.6 * Math.sin(x * d.frec * 2.7 + j)) + (fbm(x * 0.03, j * 5) - 0.5) * filas * 0.03;
      }
      for (let x = 0; x < columnas; x++) {
        const pendiente = cresta[Math.min(x + 1, columnas - 1)] - cresta[Math.max(x - 1, 0)];
        const lado = lim(0.55 - pendiente * 2.5, 0.15, 1);
        for (let y = Math.ceil(cresta[x]); y < filas; y++) {
          const prof = (y - cresta[x]) / (filas * 0.12);
          const onda = 0.08 * Math.sin(x * 0.5 + y * 2 + fbm(x * 0.04, y * 0.2) * 5);  // ondas del viento en la arena
          const luz = (0.2 + 0.8 * lim(lado * (1 - prof * 0.4) + onda, 0, 1)) * d.luz;
          const c = Utilidades.colorLlama(luz, P.duna, salida);
          capa.poner(x, y, rampa[Math.floor((0.15 + 0.55 * luz) * tope)], c[0], c[1], c[2]);
          this.reflejo[y * columnas + x] = luz * Math.max(0, 1 - prof) * 0.9;
        }
      }
      return cresta;
    });

    // Cactus sobre las dunas media y cercana
    for (let i = 0; i < 4; i++) {
      const j = i % 2 ? 1 : 2, x = Math.floor(columnas * (0.12 + i * 0.24 + ruido(i, 31) * 0.08));
      if (x + 4 >= columnas) continue;
      this.cactus(capa, x, Math.floor(this.crestas[j][x]) + 1, filas * (j === 2 ? 0.13 : 0.07) * (0.8 + ruido(i, 32) * 0.4));
    }
  },

  // Saguaro: tronco de dos columnas y dos brazos que suben
  cactus(capa, x, base, alto) {
    const [sombra, luz] = PALETA_DESIERTO.cactus, h = Math.round(alto);
    const poner = (cx, cy, claro, caracter) => {
      const c = claro ? luz : sombra;
      capa.poner(cx, cy, caracter || "#", c[0], c[1], c[2]);
    };
    for (let k = 0; k < h; k++) { poner(x, base - k, true); poner(x + 1, base - k, false); }
    poner(x, base - h, true, "n");
    const brazo = (lado, altura, largo) => {
      const y = base - Math.round(h * altura), x0 = lado < 0 ? x - 1 : x + 2;
      poner(x0, y, lado < 0, "=");
      poner(x0 + lado, y, lado < 0, "=");
      for (let k = 1; k <= Math.round(h * largo); k++) poner(x0 + lado, y - k, lado < 0);
    };
    brazo(-1, 0.45, 0.3);
    brazo(1, 0.6, 0.22);
  }
};
