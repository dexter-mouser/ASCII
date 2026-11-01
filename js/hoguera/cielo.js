// Elementos que se mueven en el cielo: niebla entre las montañas, estrellas fugaces, murciélagos
// y un dragón que cruza de vez en cuando
const DRAGON = [
  String.raw`
  \\    //
   \\  //
 <==(oo)===>~`,
  String.raw`
 <==(oo)===>~
   //  \\
  //    \\`
].map((cuadro) => cuadro.split("\n").slice(1));

// Celdas del fondo que son cielo (vacío, estrella o nube) y que son montaña o castillo
const ES_CIELO = (tipo) => tipo === 0 || tipo === 1 || tipo === 8;
const ES_LEJOS = (tipo) => ES_CIELO(tipo) || tipo === 3;

const Cielo = {
  iniciar(columnas, filas) {
    this.C = columnas;
    this.F = filas;
    this.fugaces = [];
    this.espera = 3;
  },

  actualizar(dt) {
    this.espera -= dt;
    if (this.espera <= 0) {
      const a = AJUSTES_HOGUERA, izquierda = Math.random() < 0.5;
      this.espera = a.fugazMin + Math.random() * (a.fugazMax - a.fugazMin);
      this.fugaces.push({
        x: this.C * (0.2 + Math.random() * 0.6), y: this.F * Math.random() * 0.15,
        vx: (izquierda ? -1 : 1) * this.C * (0.35 + Math.random() * 0.2), vy: this.F * (0.2 + Math.random() * 0.15), vida: 0.7
      });
    }
    for (let i = this.fugaces.length - 1; i >= 0; i--) {
      const f = this.fugaces[i];
      f.x += f.vx * dt; f.y += f.vy * dt; f.vida -= dt;
      if (f.vida <= 0) this.fugaces.splice(i, 1);
    }
  },

  // Niebla que avanza despacio entre las montañas y el castillo: en el cielo vacío se dibuja y sobre lo lejano lo aclara
  dibujarNiebla(cuadricula, tiempo) {
    const { caracteres, rojo, verde, azul } = cuadricula, C = this.C, F = this.F, tipo = FondoHoguera.tipo;
    const N = PALETA_HOGUERA.niebla, rampa = CONFIG.rampa;
    for (let y = Math.floor(F * 0.2); y < F * 0.48; y++) {
      const banda = 1 - Math.abs((y / F - 0.34) / 0.14);
      if (banda <= 0) continue;
      for (let x = 0; x < C; x++) {
        const i = y * C + x;
        if (!ES_LEJOS(tipo[i])) continue;
        const d = (Utilidades.fbm(x * 0.025 - tiempo * 0.04, y * 0.15 + tiempo * 0.01) - 0.45) * 2.2 * banda;
        if (d <= 0.05) continue;
        const a = Math.min(0.55, d);
        if (caracteres[i]) {
          const m = a * 0.6;
          rojo[i] += (N[0] - rojo[i]) * m; verde[i] += (N[1] - verde[i]) * m; azul[i] += (N[2] - azul[i]) * m;
        } else if (d > 0.12) {
          cuadricula.poner(x, y, rampa[1 + Math.floor(a * 6)], N[0] * a, N[1] * a, N[2] * a);
        }
      }
    }
  },

  dibujar(cuadricula, tiempo) {
    const columnas = cuadricula.columnas, filas = cuadricula.filas;

    // Estrellas fugaces: solo sobre el cielo, nunca delante del muro
    const f0 = PALETA_HOGUERA.fugaz, tipo = FondoHoguera.tipo;
    for (const f of this.fugaces) {
      const caracter = f.vx * f.vy > 0 ? "\\" : "/";
      for (let k = 0; k < 8; k++) {
        const x = Math.round(f.x - f.vx * 0.02 * k), y = Math.round(f.y - f.vy * 0.02 * k);
        if (x < 0 || y < 0 || x >= columnas || y >= filas || !ES_CIELO(tipo[y * columnas + x])) continue;
        const b = (1 - k / 8) * Math.min(1, f.vida * 3);
        cuadricula.poner(x, y, k === 0 ? "*" : caracter, f0[0] * b, f0[1] * b, f0[2] * b);
      }
    }

    // Murciélagos: cruzan la pantalla con un vuelo ondulado
    for (let n = 0; n < 7; n++) {
      const x = ((Utilidades.ruido(n, 1) * columnas + tiempo * (3 + 4 * Utilidades.ruido(n, 3))) % (columnas + 20)) - 10;
      const y = filas * (0.20 + 0.10 * Utilidades.ruido(n, 2)) + 2 * Math.sin(tiempo * (1.5 + 2 * Utilidades.ruido(n, 4)) + n);
      const c = PALETA_HOGUERA.murcielago;
      cuadricula.poner(x, y, Math.floor(tiempo * 6 + n) % 2 ? "v" : "w", c[0], c[1], c[2]);
    }

    // Dragón: cruza el cielo cada 50 segundos
    const e = Math.max(1, Math.round(columnas / 120));  // escala según el tamaño de la pantalla
    const x0 = -30 * e + (tiempo % 50) * (columnas + 60 * e) / 22;
    if (x0 > columnas) return;
    const y0 = filas * 0.17 + Math.sin(tiempo * 0.8) * filas * 0.02;
    const cuadro = DRAGON[Math.floor(tiempo * 3) % 2], c = PALETA_HOGUERA.dragon;
    cuadro.forEach((linea, j) => {
      for (let k = 0; k < linea.length; k++) {
        if (linea[k] === " ") continue;
        for (let a = 0; a < e; a++) for (let b = 0; b < e; b++) {
          cuadricula.poner(x0 + k * e + a, y0 + j * e + b, linea[k], c[0], c[1], c[2]);
        }
      }
    });
  }
};
