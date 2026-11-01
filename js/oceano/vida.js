// Animales del océano: peces sueltos, un cardumen, medusas y una tortuga que cruza de vez en cuando.
// Los dibujos miran a la derecha; los que miran a la izquierda se obtienen con espejar().
const ESPEJO = { "(": ")", ")": "(", "/": "\\", "\\": "/", "<": ">", ">": "<", "{": "}", "}": "{", "[": "]", "]": "[" };

function espejar(lineas) {
  const ancho = Math.max(...lineas.map((l) => l.length));
  return lineas.map((l) => [...l.padEnd(ancho)].reverse().map((c) => ESPEJO[c] || c).join(""));
}

const PECES = [["><>"], ["><))°>"], ["><(((°>"], [">=}°>"]];
const PECES_IZQUIERDA = PECES.map(espejar);

const TORTUGA = [
  "   .----.",
  " _/_/__\\_\\__o",
  "   ^     ^"
];
const TORTUGA_IZQUIERDA = espejar(TORTUGA);

const MEDUSA = {
  abierta: [" .-^-.", "(_____)", " ) ( (", "( ) ) "],
  cerrada: ["  .-.", " (___)", "  )|(", "  (|)"]
};

const Vida = {
  iniciar(columnas, filas) {
    this.C = columnas;
    this.F = filas;
    this.peces = Array.from({ length: AJUSTES_OCEANO.peces }, () => this.nuevoPez(true));
    this.cardumen = {
      x: columnas * 0.3, y: filas * 0.4, dir: 1, reloj: Math.random() * 20, disperso: 0,
      miembros: Array.from({ length: AJUSTES_OCEANO.cardumen }, () => ({ dx: (Math.random() - 0.5) * 16, dy: (Math.random() - 0.5) * 6, fase: Math.random() * 6.28 }))
    };
    this.medusas = Array.from({ length: AJUSTES_OCEANO.medusas }, (_, i) => ({
      x: columnas * (0.2 + 0.6 * Math.random()), y: filas * (0.2 + 0.5 * Math.random()), fase: Math.random() * 6.28, color: PALETA_OCEANO.medusa[i % 2]
    }));
    this.tortuga = null;
    this.esperaTortuga = 5;
  },

  // Pez nuevo: dentro de la pantalla al empezar, o entrando por un borde
  nuevoPez(dentro) {
    const dir = Math.random() < 0.5 ? 1 : -1, tipo = Math.floor(Math.random() * PECES.length);
    return {
      tipo: tipo, dir: dir, susto: 0, fase: Math.random() * 6.28,
      x: dentro ? Math.random() * this.C : dir > 0 ? -8 : this.C + 8,
      base: this.F * (0.12 + Math.random() * 0.58),
      vel: 4 + Math.random() * 4 + tipo * 1.5,
      color: PALETA_OCEANO.peces[Math.floor(Math.random() * PALETA_OCEANO.peces.length)]
    };
  },

  actualizar(dt, tiempo, corriente) {
    const C = this.C, F = this.F;

    for (let i = 0; i < this.peces.length; i++) {
      const p = this.peces[i];
      p.x += p.dir * p.vel * (1 + p.susto * 2.5) * dt + corriente * 2 * dt;
      p.susto = Math.max(0, p.susto - dt * 0.7);
      if ((p.dir < 0 && p.x < -10) || (p.dir > 0 && p.x > C + 10)) this.peces[i] = this.nuevoPez(false);
    }

    // El cardumen sigue un recorrido suave por la pantalla y gira todo junto
    const c = this.cardumen;
    c.reloj += dt;
    const nx = C * (0.5 + 0.38 * Math.sin(c.reloj * 0.12)), ny = F * (0.38 + 0.15 * Math.sin(c.reloj * 0.23));
    if (Math.abs(nx - c.x) > 0.01) c.dir = nx > c.x ? 1 : -1;
    c.x = nx; c.y = ny;
    c.disperso = Math.max(0, c.disperso - dt * 0.6);

    // Las medusas suben al contraerse y se hunden despacio el resto del tiempo
    for (const m of this.medusas) {
      const pulso = Math.sin(tiempo * 1.6 + m.fase);
      m.y += (0.5 - Math.max(0, pulso) * 2.6) * dt;
      m.x += (corriente * 1.5 + Math.sin(tiempo * 0.3 + m.fase) * 0.4) * dt;
      if (m.y < -5) { m.y = F * 0.75; m.x = C * (0.1 + 0.8 * Math.random()); }
    }

    this.esperaTortuga -= dt;
    if (!this.tortuga && this.esperaTortuga <= 0) {
      const dir = Math.random() < 0.5 ? 1 : -1;
      this.tortuga = { x: dir > 0 ? -14 : C + 14, y: F * (0.15 + Math.random() * 0.3), dir: dir };
    }
    if (this.tortuga) {
      const t = this.tortuga;
      t.x += (t.dir * 3 + corriente) * dt;
      if (t.x < -16 || t.x > C + 16) { this.tortuga = null; this.esperaTortuga = 15 + Math.random() * 15; }
    }
  },

  // Un clic asusta a los peces cercanos: huyen del punto y nadan más rápido
  asustar(col, fila) {
    const radio = this.F * 0.3;
    for (const p of this.peces) {
      const dx = (p.x - col) * 0.6, dy = p.base - fila;
      if (dx * dx + dy * dy > radio * radio) continue;
      p.dir = p.x >= col ? 1 : -1;
      p.susto = 1;
    }
    const c = this.cardumen, dx = (c.x - col) * 0.6, dy = c.y - fila;
    if (dx * dx + dy * dy < radio * radio * 2) c.disperso = 1;
  },

  dibujar(cuadricula, tiempo) {
    for (const m of this.medusas) {
      const pulso = Math.sin(tiempo * 1.6 + m.fase), b = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(tiempo * 2 + m.fase));
      this.dibujarSprite(cuadricula, pulso > 0 ? MEDUSA.cerrada : MEDUSA.abierta, m.x, m.y, m.color, b);
    }

    if (this.tortuga) {
      const t = this.tortuga, paso = Math.floor(tiempo * 2) % 2;  // aletas que se alternan
      const dibujo = (t.dir > 0 ? TORTUGA : TORTUGA_IZQUIERDA).map((l, i) => i === 2 && paso ? l.replace(/\^/g, "-") : l);
      this.dibujarSprite(cuadricula, dibujo, t.x, t.y + Math.sin(tiempo) * 0.5, PALETA_OCEANO.tortuga[1], 0.9);
    }

    const c = this.cardumen, abrir = 1 + c.disperso * 2.5;
    for (const m of c.miembros) {
      const x = c.x + m.dx * abrir + Math.sin(tiempo * 2 + m.fase) * 0.8, y = c.y + m.dy * abrir + Math.sin(tiempo * 1.5 + m.fase) * 0.5;
      this.dibujarSprite(cuadricula, c.dir > 0 ? PECES[0] : PECES_IZQUIERDA[0], x, y, PALETA_OCEANO.peces[2], 0.85);
    }

    for (const p of this.peces) {
      const y = p.base + Math.sin(tiempo * 0.8 + p.fase) * 1.2;
      this.dibujarSprite(cuadricula, p.dir > 0 ? PECES[p.tipo] : PECES_IZQUIERDA[p.tipo], p.x, y, p.color, 0.85 + 0.15 * Math.sin(tiempo * 3 + p.fase));
    }
  },

  // Dibuja un dibujo de varias líneas centrado en (x, y); los espacios quedan transparentes
  dibujarSprite(cuadricula, lineas, x, y, color, brillo) {
    const x0 = Math.round(x - lineas[0].length / 2), y0 = Math.round(y - lineas.length / 2);
    const r = color[0] * brillo, g = color[1] * brillo, b = color[2] * brillo;
    for (let j = 0; j < lineas.length; j++) {
      for (let i = 0; i < lineas[j].length; i++) {
        if (lineas[j][i] !== " ") cuadricula.poner(x0 + i, y0 + j, lineas[j][i], r, g, b);
      }
    }
  }
};
