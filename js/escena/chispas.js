// Partículas que suben desde la llama: chispas (brillan) y humo (tenue)
const Chispas = {
  lista: [],
  pendiente: 0,
  pendienteHumo: 0,
  temporal: [0, 0, 0],

  reiniciar() {
    this.lista = [];
  },

  emitir(cantidad, humo) {
    const escala = Fuego.alto / 20;  // la velocidad se adapta al tamaño de la llama
    for (let n = 0; n < cantidad; n++) {
      const vida = humo ? 3 + Math.random() * 2 : 0.8 + Math.random() * 1.6;
      this.lista.push({
        x: Iluminacion.fx + (Math.random() - 0.5) * Fuego.ancho * (humo ? 0.3 : 0.5),
        y: Fuego.y0 + Fuego.alto * (humo ? 0.15 : 0.45),
        vx: (Math.random() - 0.5) * (humo ? 1.5 : 4),
        vy: -(humo ? 2 + Math.random() * 3 : 5 + Math.random() * 10) * escala,
        vida: vida,
        vidaMaxima: vida,
        humo: !!humo
      });
    }
  },

  actualizar(dt, viento) {
    // Ritmo de nacimiento según la intensidad de la llama
    this.pendiente += CONFIG.chispasPorSegundo * Iluminacion.intensidad * dt;
    this.pendienteHumo += CONFIG.humoPorSegundo * dt;
    const nuevas = Math.floor(this.pendiente), nuevoHumo = Math.floor(this.pendienteHumo);
    this.pendiente -= nuevas;
    this.pendienteHumo -= nuevoHumo;
    this.emitir(nuevas, false);
    this.emitir(nuevoHumo, true);

    for (let i = this.lista.length - 1; i >= 0; i--) {
      const p = this.lista[i];
      p.vx += ((Math.random() - 0.5) * 10 + viento * 6) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vida -= dt;
      if (p.vida <= 0 || p.y < 0) this.lista.splice(i, 1);
    }
  },

  dibujar(cuadricula, paleta) {
    const rampa = CONFIG.rampa, tope = rampa.length - 1;
    for (const p of this.lista) {
      const resto = p.vida / p.vidaMaxima;
      if (p.humo) {
        // El humo solo se ve donde lo ilumina la llama
        const luz = Iluminacion.luzEn(p.x, p.y);
        const indice = Math.floor(Utilidades.limitar(0.32 * resto * (0.25 + luz), 0, 1) * tope);
        if (indice < 1) continue;
        Iluminacion.poner(cuadricula, p.x, p.y, rampa[indice], PALETA.humo, 0.9, luz);
      } else {
        const caracter = resto > 0.6 ? "*" : resto > 0.3 ? "+" : ".";
        const color = Utilidades.colorLlama(0.3 + 0.7 * resto, paleta.llama, this.temporal);
        cuadricula.poner(p.x, p.y, caracter, color[0], color[1], color[2]);
      }
    }
  }
};
