// Luciérnagas: vagan con un rumbo que cambia despacio, se encienden y se apagan,
// rodean al puntero cuando está cerca y se dispersan con un clic. Su luz ilumina lo que tienen alrededor.
const Luciernagas = {
  puntero: null,   // { x, y } en celdas, o null si el puntero no está sobre la escena
  lista: [],

  iniciar(columnas, filas) {
    this.C = columnas;
    this.F = filas;
    this.lista = Array.from({ length: AJUSTES_BOSQUE.luciernagas }, () => ({
      x: Math.random() * columnas, y: filas * (0.35 + Math.random() * 0.55), vx: 0, vy: 0,  // velocidad en filas por segundo
      fase: Math.random() * 6.28, ritmo: 1.2 + Math.random() * 1.8, semilla: Math.random() * 100, destello: 0
    }));
  },

  actualizar(dt, tiempo) {
    const F = this.F, alcance = F * AJUSTES_BOSQUE.atraccion, freno = 1 - Math.min(1, dt * 0.9);
    for (const l of this.lista) {
      const rumbo = Utilidades.ruidoSuave(l.semilla, tiempo * 0.25) * 12.57;
      let ax = Math.cos(rumbo) * 4, ay = Math.sin(rumbo) * 2.5;

      // Cerca del puntero: se acercan y giran a su alrededor
      if (this.puntero) {
        const dx = (this.puntero.x - l.x) * 0.6, dy = this.puntero.y - l.y, d = Math.sqrt(dx * dx + dy * dy) + 0.001;
        if (d < alcance) {
          const f = 9 * (1 - d / alcance) * (d < 3 ? -0.5 : 1);
          ax += (dx / d) * f - (dy / d) * f * 0.8;
          ay += (dy / d) * f + (dx / d) * f * 0.8;
        }
      }
      if (l.y < F * 0.3) ay += 4;
      if (l.y > F * 0.93) ay -= 4;

      l.vx = (l.vx + ax * dt) * freno;
      l.vy = (l.vy + ay * dt) * freno;
      l.x += (l.vx / 0.6) * dt;
      l.y += l.vy * dt;
      if (l.x < 0) l.x += this.C; else if (l.x >= this.C) l.x -= this.C;
      l.destello = Math.max(0, l.destello - dt * 0.8);
    }
  },

  // Un clic las empuja lejos del punto y las hace brillar de golpe
  dispersar(col, fila) {
    const radio = this.F * 0.35;
    for (const l of this.lista) {
      const dx = (l.x - col) * 0.6, dy = l.y - fila, d = Math.sqrt(dx * dx + dy * dy) + 0.001;
      if (d > radio) continue;
      const fuerza = 16 * (1 - d / radio);
      l.vx += (dx / d) * fuerza;
      l.vy += (dy / d) * fuerza;
      l.destello = 1;
    }
  },

  dibujar(cuadricula, tiempo) {
    const { caracteres, rojo, verde, azul, columnas: C, filas: F } = cuadricula;
    const colores = PALETA_BOSQUE.luciernaga, G = colores[1], salida = [0, 0, 0];
    for (const l of this.lista) {
      const b = Math.max(0.12 + 0.88 * Math.pow(Math.max(0, Math.sin(tiempo * l.ritmo + l.fase)), 2), l.destello);
      const cx = Math.round(l.x), cy = Math.round(l.y), radio = 1 + b * 2.5;

      // Halo: aclara lo que hay alrededor o pone un punto tenue en las celdas vacías
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const x = cx + dx, y = cy + dy, dist = Math.sqrt(dx * dx * 0.36 + dy * dy);
          if ((dx === 0 && dy === 0) || dist > radio || x < 0 || y < 0 || x >= C || y >= F) continue;
          const w = b * (1 - dist / radio), i = y * C + x;
          if (caracteres[i]) { rojo[i] += G[0] * w * 0.5; verde[i] += G[1] * w * 0.5; azul[i] += G[2] * w * 0.3; }
          else if (w > 0.35) cuadricula.poner(x, y, ".", G[0] * w * 0.6, G[1] * w * 0.6, G[2] * w * 0.4);
        }
      }

      const c = Utilidades.colorLlama(b, colores, salida);
      cuadricula.poner(cx, cy, b > 0.7 ? "*" : b > 0.35 ? "+" : ".", c[0], c[1], c[2]);
    }
  }
};
