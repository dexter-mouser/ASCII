// Viento de arena: granos que salen de las crestas de las dunas y vuelan con el viento
const Arena = {
  viento: 0.5,       // -1 hacia la izquierda, 1 hacia la derecha
  objetivo: 0.5,
  rafaga: 0,         // fuerza extra tras un clic
  granos: [],

  iniciar(columnas, filas) {
    this.C = columnas;
    this.F = filas;
    this.granos = [];
  },

  actualizar(dt) {
    this.viento += (this.objetivo - this.viento) * Math.min(1, dt * 1.5);
    this.rafaga = Math.max(0, this.rafaga - dt * 0.7);
    const fuerza = Math.min(1.5, Math.abs(this.viento) + this.rafaga), sentido = this.viento < 0 ? -1 : 1;

    // Nacen en las crestas de las dunas media y cercana
    let nuevos = fuerza * AJUSTES_DESIERTO.granos * dt;
    while (nuevos > 0 && this.granos.length < 600) {
      if (nuevos < 1 && Math.random() > nuevos) break;
      nuevos--;
      const cresta = FondoDesierto.crestas[1 + Math.floor(Math.random() * 2)], x = Math.floor(Math.random() * this.C);
      const vida = 1 + Math.random() * 1.5;
      this.granos.push({ x: x, y: cresta[x] - 0.5, vx: sentido * fuerza * (10 + Math.random() * 14), vy: -(0.5 + Math.random()) * 1.5, vida: vida, total: vida });
    }

    for (let i = this.granos.length - 1; i >= 0; i--) {
      const g = this.granos[i];
      g.x += g.vx * dt;
      g.vy += 2.5 * dt;   // la gravedad los devuelve a la arena
      g.y += g.vy * dt;
      g.vida -= dt;
      if (g.vida <= 0 || g.x < -2 || g.x > this.C + 2 || g.y > this.F) this.granos.splice(i, 1);
    }
  },

  dibujar(cuadricula) {
    const c = PALETA_DESIERTO.arena;
    for (const g of this.granos) {
      const k = Math.min(1, g.vida / g.total * 2) * 0.8, rapido = Math.abs(g.vx) > 18;
      cuadricula.poner(g.x, g.y, rapido ? "-" : g.vy < 0 ? "'" : g.vida % 0.5 < 0.25 ? "." : ",", c[0] * k, c[1] * k, c[2] * k);
    }
  }
};
