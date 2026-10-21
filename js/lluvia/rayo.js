// Relámpagos: un destello que ilumina toda la escena y un rayo ramificado dibujado en ASCII
const Rayo = {
  espera: 2,     // segundos hasta el próximo relámpago
  vida: 0,       // tiempo que queda visible el rayo
  segundo: false,
  puntos: [],

  actualizar(dt) {
    this.espera -= dt;
    if (this.espera <= 0) this.disparar();
    Luz.destello = Math.max(0, Luz.destello - dt * 3.2);
    if (this.vida > 0) {
      this.vida -= dt;
      if (this.segundo && this.vida < 0.12) {  // segundo destello, más débil
        this.segundo = false;
        Luz.destello = Math.max(Luz.destello, 0.8);
      }
    }
  },

  disparar() {
    const C = Escenario.C, F = Escenario.F;
    this.espera = AJUSTES.rayoMin + Math.random() * (AJUSTES.rayoMax - AJUSTES.rayoMin);
    this.vida = 0.3;
    this.segundo = true;
    Luz.destello = 1;

    // Camino quebrado desde las nubes hasta el suelo, con hasta 3 ramas
    this.puntos = [];
    const ramas = [], yFin = F * (0.55 + 0.2 * Math.random()), deriva = (Math.random() - 0.5) * 0.8;
    let x = C * (0.15 + Math.random() * 0.7), y = 0;
    while (y < yFin) {
      const dx = Math.round(deriva + (Math.random() - 0.5) * 2.4);
      this.puntos.push({ x: x, y: y, c: dx > 0 ? "\\" : dx < 0 ? "/" : "|" });
      x += dx;
      y++;
      if (Math.random() < 0.07 && ramas.length < 3) ramas.push({ x: x, y: y, d: Math.random() < 0.5 ? -1 : 1 });
    }
    for (const r of ramas) {
      let rx = r.x, ry = r.y;
      for (let k = 6 + Math.floor(Math.random() * 10); k > 0; k--) {
        rx += Math.random() < 0.7 ? r.d : 0;
        ry += Math.random() < 0.6 ? 1 : 0;
        this.puntos.push({ x: rx, y: ry, c: r.d > 0 ? "\\" : "/" });
      }
    }
  },

  dibujar(cuadricula, t) {
    if (this.vida <= 0 || Math.sin(t * 70) < -0.4) return;  // parpadea mientras dura
    for (const p of this.puntos) {
      if (!Escenario.libre(p.x, p.y)) continue;
      Luz.poner(cuadricula, p.x, p.y, p.c, PALETA_LLUVIA.rayo, 2.2);
      Luz.poner(cuadricula, p.x - 1, p.y, ".", PALETA_LLUVIA.rayo, 1.2);
      Luz.poner(cuadricula, p.x + 1, p.y, ".", PALETA_LLUVIA.rayo, 1.2);
    }
  }
};
