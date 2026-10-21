// Lluvia en dos capas, ondas en los charcos y gotas que resbalan por el cristal
const Lluvia = {
  gotas: [],
  ondas: [],

  iniciar() {
    const total = Math.floor(Escenario.C * Escenario.F * AJUSTES.gotasPorCelda);
    this.gotas = Array.from({ length: total }, (_, i) => this.nueva(i % 5 < 2 ? 1 : 0, true));
    this.ondas = [];
  },

  // capa 0: lejana (tenue y lenta), capa 1: cercana (brillante y rápida)
  nueva(capa, inicial) {
    const C = Escenario.C, F = Escenario.F;
    return {
      x: Math.random() * C * 1.3 - C * 0.15,
      y: inicial ? Math.random() * F : -Math.random() * F * 0.3,
      vy: F * (capa ? 0.95 + Math.random() * 0.5 : 0.6 + Math.random() * 0.3),
      suelo: F * (capa ? 0.70 + Math.random() * 0.14 : 0.58 + Math.random() * 0.18),
      capa: capa
    };
  },

  actualizar(dt, viento) {
    const C = Escenario.C;
    for (const g of this.gotas) {
      g.x += viento * (g.capa ? 1 : 0.7) * dt;
      g.y += g.vy * dt;
      if (g.y < g.suelo) continue;
      const x = Math.round(g.x), y = Math.round(g.suelo);  // al llegar al suelo: onda en la calle
      if (g.capa && Math.random() < 0.3 && x >= 0 && x < C && Escenario.tipo[y * C + x] === 10) this.ondas.push({ x: x, y: y, edad: 0 });
      Object.assign(g, this.nueva(g.capa, false));
    }
    for (let i = this.ondas.length - 1; i >= 0; i--) {
      this.ondas[i].edad += dt;
      if (this.ondas[i].edad > 0.8) this.ondas.splice(i, 1);
    }
  },

  dibujar(cuadricula, viento, capa) {
    for (const g of this.gotas) {
      if (g.capa !== capa) continue;
      if (!Escenario.libre(g.x, g.y)) continue;
      const desvio = viento * (capa ? 1 : 0.7) / g.vy, ratio = desvio * 0.6;  // inclinación de la gota
      const caracter = Math.abs(ratio) < 0.12 ? "|" : ratio > 0 ? "\\" : "/";
      Luz.poner(cuadricula, g.x, g.y, caracter, PALETA_LLUVIA.lluvia, capa ? 1.1 : 0.55);
      if (capa && Escenario.libre(g.x - desvio, g.y - 1)) Luz.poner(cuadricula, g.x - desvio, g.y - 1, caracter, PALETA_LLUVIA.lluvia, 0.7);  // estela
    }
  },

  dibujarOndas(cuadricula) {
    for (const o of this.ondas) {
      const a = o.edad / 0.8, r = a * 6, brillo = (1 - a) * 1.2;
      if (r < 1) { Luz.poner(cuadricula, o.x, o.y, ".", PALETA_LLUVIA.gota, brillo); continue; }
      Luz.poner(cuadricula, o.x - r * 1.3, o.y, "(", PALETA_LLUVIA.gota, brillo);
      Luz.poner(cuadricula, o.x + r * 1.3, o.y, ")", PALETA_LLUVIA.gota, brillo);
    }
  }
};

// Gotas que resbalan por el cristal: avanzan a tirones y dejan una estela
const Cristal = {
  gotas: [],

  iniciar() {
    this.gotas = Array.from({ length: Math.floor(Escenario.C / 5) }, () => this.nueva(true));
  },

  nueva(inicial) {
    return {
      x: Escenario.pa + 1 + Math.random() * (Escenario.C - 2 * Escenario.pa - 2),
      y: inicial ? Math.random() * Escenario.repisa : -Math.random() * 10,
      vy: Escenario.F * (0.02 + Math.random() * 0.05),
      pausa: Math.random() * 2,
      grande: Math.random() < 0.3
    };
  },

  actualizar(dt) {
    for (const g of this.gotas) {
      g.pausa -= dt;
      if (g.pausa <= 0) {
        g.y += g.vy * dt * 3;
        if (Math.random() < dt * 0.8) g.pausa = 0.3 + Math.random() * 1.5;  // se detiene un momento
      }
      if (g.y > Escenario.repisa) Object.assign(g, this.nueva(false));
    }
  },

  dibujar(cuadricula) {
    const c = PALETA_LLUVIA.gota;
    for (const g of this.gotas) {
      if (!Escenario.libre(g.x, g.y)) continue;
      Luz.poner(cuadricula, g.x, g.y - 2, "'", c, 0.45);
      Luz.poner(cuadricula, g.x, g.y - 1, ".", c, 0.6);
      Luz.poner(cuadricula, g.x, g.y, g.grande ? "O" : "o", c, 1.2);
    }
  }
};
