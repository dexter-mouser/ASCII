// Lo que se mueve en el bosque aparte de las luciérnagas: niebla, hierba y los ojos de un búho
const Noche = {
  iniciar(columnas, filas) {
    this.C = columnas;
    this.F = filas;
    this.parpadeo = 3;   // segundos hasta que el búho parpadea
    this.cerrado = 0;
  },

  actualizar(dt) {
    this.parpadeo -= dt;
    this.cerrado = Math.max(0, this.cerrado - dt);
    if (this.parpadeo <= 0) { this.cerrado = 0.18; this.parpadeo = 2 + Math.random() * 5; }
  },

  // Niebla baja que avanza despacio: en las celdas vacías se dibuja y sobre los árboles los aclara
  dibujarNiebla(cuadricula, tiempo) {
    const { caracteres, rojo, verde, azul } = cuadricula, C = this.C, F = this.F, N = PALETA_BOSQUE.niebla, rampa = CONFIG.rampa;
    for (let y = Math.floor(F * 0.56); y < F; y++) {
      const banda = 1 - Math.abs((y / F - 0.8) / 0.24);  // más densa cerca del suelo
      if (banda <= 0) continue;
      for (let x = 0; x < C; x++) {
        const d = (Utilidades.fbm(x * 0.03 - tiempo * 0.05, y * 0.12 + tiempo * 0.015) - 0.45) * 2.2 * banda;
        if (d <= 0.05) continue;
        const a = Math.min(0.6, d), i = y * C + x;
        if (caracteres[i]) {
          const m = a * 0.6;
          rojo[i] += (N[0] - rojo[i]) * m; verde[i] += (N[1] - verde[i]) * m; azul[i] += (N[2] - azul[i]) * m;
        } else if (d > 0.12) {
          cuadricula.poner(x, y, rampa[1 + Math.floor(a * 6)], N[0] * a, N[1] * a, N[2] * a);
        }
      }
    }
  },

  // Hierba que se mece con una brisa suave
  dibujarHierba(cuadricula, tiempo) {
    const H = PALETA_BOSQUE.hierba, salida = [0, 0, 0];
    for (const h of FondoBosque.hierba) {
      const lean = Math.sin(tiempo * 1.5 + h.x * 0.2) * 0.6 + Math.sin(tiempo * 0.4) * 0.3;
      const c = Utilidades.colorLlama(0.4 + 0.3 * Math.sin(h.x * 1.7), H, salida);
      for (let k = 0; k < h.alto; k++) {
        const caracter = lean > 0.3 ? "/" : lean < -0.3 ? "\\" : k === h.alto - 1 ? "'" : "|";
        cuadricula.poner(h.x + (k > 0 ? Math.round(lean) : 0), h.y - k, caracter, c[0], c[1], c[2]);
      }
    }
  },

  // Dos ojos amarillos entre las ramas que parpadean de vez en cuando
  dibujarOjos(cuadricula) {
    const o = FondoBosque.ojos, c = PALETA_BOSQUE.ojos, caracter = this.cerrado > 0 ? "-" : "o";
    cuadricula.poner(o.x - 1, o.y, caracter, c[0], c[1], c[2]);
    cuadricula.poner(o.x + 1, o.y, caracter, c[0], c[1], c[2]);
  }
};
