// El agua: rayos de luz, superficie con olas, reflejos sobre la arena, motas, algas y burbujas
const Mar = {
  corriente: 0,       // corriente actual (-1 izquierda, 1 derecha)
  objetivo: 0,        // corriente que marca el puntero
  burbujas: [],
  motas: [],
  espera: 0,

  iniciar(columnas, filas) {
    this.C = columnas;
    this.F = filas;
    this.burbujas = [];
    this.motas = Array.from({ length: Math.floor(columnas * filas / 160) }, () => ({
      x: Math.random() * columnas, y: Math.random() * filas, v: 0.3 + Math.random() * 0.7, fase: Math.random() * 6.28
    }));
  },

  actualizar(dt, tiempo) {
    this.corriente += (this.objetivo - this.corriente) * Math.min(1, dt * 1.5);

    // Burbujas que salen solas de las grietas de las rocas
    this.espera -= dt;
    if (this.espera <= 0) {
      const f = FondoOceano.fuentes[Math.floor(Math.random() * FondoOceano.fuentes.length)];
      this.soltar(f.x, f.y, 1 + Math.floor(Math.random() * 3));
      this.espera = (0.5 + Math.random()) / AJUSTES_OCEANO.burbujasPorSegundo;
    }

    for (let i = this.burbujas.length - 1; i >= 0; i--) {
      const b = this.burbujas[i];
      b.y -= b.vel * dt;
      b.x += (Math.sin(tiempo * 3 + b.fase) * 0.8 + this.corriente * 4) * dt;
      if (b.y < 2) this.burbujas.splice(i, 1);  // revienta al llegar a la superficie
    }

    for (const m of this.motas) {
      m.y += m.v * dt * 0.6;
      m.x += (this.corriente * 2 + Math.sin(tiempo * 0.5 + m.fase) * 0.3) * dt;
      if (m.y >= this.F) m.y = 0;
      if (m.x < 0) m.x += this.C; else if (m.x >= this.C) m.x -= this.C;
    }
  },

  // Suelta burbujas desde una celda (las grandes suben más rápido)
  soltar(x, y, cantidad) {
    for (let i = 0; i < cantidad && this.burbujas.length < 300; i++) {
      const tam = Math.random();
      this.burbujas.push({ x: x + (Math.random() - 0.5) * 3, y: y + Math.random() * 2, vel: this.F * (0.07 + tam * 0.09), fase: Math.random() * 6.28, tam: tam });
    }
  },

  // Rayos de luz, superficie y motas (solo en celdas vacías) y reflejos que se mueven sobre la arena
  dibujarAgua(cuadricula, tiempo) {
    const { caracteres, rojo, verde, azul } = cuadricula, C = this.C, F = this.F, P = PALETA_OCEANO, rampa = CONFIG.rampa;

    const limite = Math.floor(F * 0.85), R = P.rayo;
    for (let y = 3; y < limite; y++) {
      const caida = 1 - y / limite;
      for (let x = 0; x < C; x++) {
        if (caracteres[y * C + x]) continue;
        const u = x * 0.6 + y * 0.55;  // rayos inclinados
        const v = Math.sin(u * 0.16 + Math.sin(tiempo * 0.35) * 1.5) * Math.sin(u * 0.05 - tiempo * 0.12);
        const b = (v - 0.45) * 1.6 * caida;
        if (b < 0.06 || Utilidades.ruido(x, y) > 0.35 + b) continue;  // rayos tenues y deshilachados
        cuadricula.poner(x, y, rampa[1 + Math.floor(b * 5)], R[0] * b, R[1] * b, R[2] * b);
      }
    }

    const S = P.superficie;
    for (let x = 0; x < C; x++) {
      const h = 1.6 + Math.sin(x * 0.12 + tiempo * 1.3) * 0.7 + Math.sin(x * 0.31 - tiempo * 1.9) * 0.4;
      for (let y = 0; y <= h; y++) {
        const borde = h - y < 1, b = borde ? 0.8 + 0.2 * Math.sin(x * 0.7 + tiempo * 4) : 0.45;
        cuadricula.poner(x, y, borde ? "~" : "=", S[0] * b, S[1] * b, S[2] * b);
      }
    }

    // Reflejos de la superficie que bailan sobre la arena
    for (let x = 0; x < C; x++) {
      for (let y = Math.floor(FondoOceano.suelo[x]); y < F; y++) {
        const v = Math.sin(x * 0.3 + tiempo * 1.1 + Math.sin(y * 0.5 + tiempo)) * Math.sin(y * 0.8 - tiempo * 0.9 + x * 0.1);
        if (v < 0.4) continue;
        const i = y * C + x, luz = (v - 0.4) * 90;
        rojo[i] += luz * 0.6; verde[i] += luz * 0.9; azul[i] += luz;
      }
    }

    const M = P.mota;
    for (const m of this.motas) {
      const x = Math.round(m.x), y = Math.round(m.y);
      if (y < 0 || y >= F || x < 0 || x >= C || caracteres[y * C + x]) continue;
      cuadricula.poner(x, y, ".", M[0] * 0.6, M[1] * 0.6, M[2] * 0.6);
    }
  },

  // Algas que se mecen con la corriente: la punta se mueve más que la raíz
  dibujarAlgas(cuadricula, tiempo) {
    const colores = PALETA_OCEANO.alga, salida = [0, 0, 0];
    for (const a of FondoOceano.algas) {
      let previo = a.x;
      for (let k = 0; k < a.alto; k++) {
        const f = k / a.alto;
        const x = a.x + (Math.sin(tiempo * 1.1 + a.fase + k * 0.3) * 0.5 + this.corriente) * Math.pow(f, 1.3) * a.alto * 0.25;
        const d = x - previo;
        previo = x;
        const c = Utilidades.colorLlama(0.25 + 0.75 * f, colores, salida);
        cuadricula.poner(x, a.base - k, d > 0.3 ? "/" : d < -0.3 ? "\\" : k % 2 ? "(" : ")", c[0], c[1], c[2]);
        if (k % 4 === 2 && k < a.alto - 2) cuadricula.poner(x + (k % 8 === 2 ? 1 : -1), a.base - k, "~", c[0] * 0.8, c[1] * 0.8, c[2] * 0.8);  // hojas
      }
    }
  },

  dibujarBurbujas(cuadricula) {
    const c = PALETA_OCEANO.burbuja;
    for (const b of this.burbujas) {
      const k = 0.6 + 0.4 * b.tam;
      cuadricula.poner(b.x, b.y, b.tam > 0.75 ? "O" : b.tam > 0.4 ? "o" : b.tam > 0.15 ? "°" : ".", c[0] * k, c[1] * k, c[2] * k);
    }
  }
};
