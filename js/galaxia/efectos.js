// Efectos ligeros: estrellas que titilan, estrellas fugaces y ondas de luz al hacer clic
const Efectos = {
  fugaces: [],
  pulsos: [],
  espera: 2,
  reducido: window.matchMedia("(prefers-reduced-motion: reduce)").matches,

  actualizar(dt) {
    this.espera -= dt;
    if (this.espera <= 0 && !this.reducido) this.lanzarFugaz();
    for (let i = this.fugaces.length - 1; i >= 0; i--) {
      const f = this.fugaces[i];
      f.x += f.vx * dt; f.y += f.vy * dt; f.vida -= dt;
      if (f.vida <= 0) this.fugaces.splice(i, 1);
    }
    for (let i = this.pulsos.length - 1; i >= 0; i--) {
      this.pulsos[i].edad += dt;
      if (this.pulsos[i].edad > 1.4) this.pulsos.splice(i, 1);
    }
  },

  lanzarFugaz() {
    const C = Galaxia.C, F = Galaxia.filas;
    this.espera = AJUSTES.fugazMin + Math.random() * (AJUSTES.fugazMax - AJUSTES.fugazMin);
    const haciaIzquierda = Math.random() < 0.5;
    this.fugaces.push({
      x: C * (0.2 + Math.random() * 0.7), y: F * Math.random() * 0.35,
      vx: (haciaIzquierda ? -1 : 1) * C * (0.35 + Math.random() * 0.2), vy: F * (0.35 + Math.random() * 0.2), vida: 0.8
    });
  },

  // Onda de luz que se expande desde una celda
  pulso(col, fila) {
    this.pulsos.push({ x: col, y: fila, edad: 0 });
  },

  dibujar(cuadricula, tiempo) {
    // Estrellas que titilan
    for (const s of FondoGalaxia.titilantes) {
      const b = 0.5 + 0.5 * Math.sin(tiempo * (2 + s.fase) + s.fase * 9);
      const k = 0.35 + 0.65 * b;
      cuadricula.poner(s.x, s.y, b > 0.8 ? "*" : b > 0.4 ? "+" : ".", s.c[0] * k, s.c[1] * k, s.c[2] * k);
    }

    // Estrellas fugaces: cabeza brillante y estela que se apaga
    const f0 = PALETA_GALAXIA.fugaz;
    for (const f of this.fugaces) {
      const caracter = Math.abs(f.vy) < Math.abs(f.vx) * 0.25 ? "-" : f.vx * f.vy > 0 ? "\\" : "/";
      for (let k = 0; k < 9; k++) {
        const b = (1 - k / 9) * Math.min(1, f.vida * 3);
        cuadricula.poner(f.x - f.vx * 0.02 * k, f.y - f.vy * 0.02 * k, k === 0 ? "*" : caracter, f0[0] * b, f0[1] * b, f0[2] * b);
      }
    }

    // Ondas de luz: un anillo que crece y se desvanece
    const colores = PALETA_GALAXIA.pulso, salida = [0, 0, 0];
    for (const p of this.pulsos) {
      const a = p.edad / 1.4, radio = p.edad * Galaxia.filas * 0.35, puntos = Math.max(12, Math.floor(6.283 * radio * 1.5));
      const c = Utilidades.colorLlama(a, colores, salida), b = 1 - a;
      for (let j = 0; j < puntos; j++) {
        const ang = (j / puntos) * 6.283;
        cuadricula.poner(p.x + radio * Math.cos(ang) / 0.6, p.y + radio * Math.sin(ang), a < 0.6 ? "*" : ".", c[0] * b, c[1] * b, c[2] * b);
      }
    }
  }
};
