// Humo de la chimenea de la cabaña y vapor de la taza
const Humo = {
  lista: [],
  acumulado: [0, 0],

  reiniciar() {
    this.lista = [];
  },

  actualizar(dt, viento) {
    const fuentes = [Escenario.chimenea, { x: Escenario.taza.x, y: Escenario.taza.y - 3 }], ritmos = [5, 6];
    fuentes.forEach((f, k) => {
      this.acumulado[k] += ritmos[k] * dt;
      while (this.acumulado[k] >= 1) {
        this.acumulado[k]--;
        const vida = k === 0 ? 4 + Math.random() * 2 : 1 + Math.random() * 0.8;
        this.lista.push({ x: f.x + (Math.random() - 0.5) * 1.5, y: f.y, vy: -(k === 0 ? 2.5 : 3.5) * Escenario.F / 60, vida: vida, maximo: vida, vapor: k === 1 });
      }
    });
    for (let i = this.lista.length - 1; i >= 0; i--) {
      const p = this.lista[i];
      p.x += (viento * 0.12 + (Math.random() - 0.5) * 2) * dt;
      p.y += p.vy * dt;
      p.vida -= dt;
      if (p.vida <= 0) this.lista.splice(i, 1);
    }
  },

  // vapor = false: humo de la chimenea (detrás de la lluvia); true: vapor de la taza (delante del marco)
  dibujar(cuadricula, vapor) {
    for (const p of this.lista) {
      if (p.vapor !== vapor) continue;
      const resto = p.vida / p.maximo;
      Luz.poner(cuadricula, p.x, p.y, resto > 0.6 ? ":" : resto > 0.3 ? "'" : ".", PALETA_LLUVIA.humo,
        resto * (vapor ? 1.3 : 0.9), vapor ? Luz.local(p.x, p.y) : undefined);
    }
  }
};
