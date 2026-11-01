// Galaxia espiral hecha de partículas. Cada fotograma se proyecta cada partícula en la cuadrícula y se suma su
// brillo por celda; solo se recorren las celdas tocadas, así que el coste depende de las partículas, no del tamaño de la pantalla.
// Hay tres tipos de partícula: estrellas (suman luz), cúmulos (suman mucha luz rosa o azul) y polvo (resta luz: franjas oscuras).
const Galaxia = {
  cosI: 0.55,       // inclinación actual (1 = vista de frente, 0 = de canto)
  angulo: -0.4,     // giro de la galaxia sobre la pantalla
  objetivoCosI: 0.55,
  objetivoAngulo: -0.4,

  iniciar(columnas, filas) {
    const A = AJUSTES_GALAXIA, P = PALETA_GALAXIA, n = A.particulas, ruido = () => Math.random();
    this.C = columnas;
    this.filas = filas;
    this.cx = columnas * 0.56;
    this.cy = filas * 0.46;
    this.R = Math.min(filas * 0.44, columnas * 0.6 * 0.34);  // radio de la galaxia en filas

    this.radio = new Float32Array(n);
    this.fase = new Float32Array(n);   // ángulo inicial
    this.altura = new Float32Array(n);
    this.vel = new Float32Array(n);
    this.peso = new Float32Array(n);   // luz que aporta (negativa en el polvo)
    this.rojo = new Float32Array(n);
    this.verde = new Float32Array(n);
    this.azul = new Float32Array(n);
    const gauss = () => (ruido() + ruido() + ruido() - 1.5) / 1.5, color = [0, 0, 0];
    const centrosCumulos = Array.from({ length: 14 }, () => 0.25 + ruido() * 0.65);

    for (let i = 0; i < n; i++) {
      const brazo = (i % 3) * 2.094, tipo = ruido();
      const nucleo = i < n * 0.16;  // el 16 % forma el bulbo central
      let r, fase, peso;
      if (nucleo) {
        r = Math.pow(ruido(), 2.2) * 0.22;
        fase = ruido() * 6.283;
        peso = 0.4 + 0.6 * (1 - r);
        Utilidades.colorLlama(r, P.nucleo, color);
      } else if (tipo < A.cumulos) {
        r = centrosCumulos[i % centrosCumulos.length] + gauss() * 0.02;
        fase = brazo + r * 3.2 + gauss() * 0.05;
        peso = 1.1;
        const c = P.cumulos[i % 2];
        color[0] = c[0]; color[1] = c[1]; color[2] = c[2];
      } else if (tipo < A.cumulos + A.polvo) {
        r = 0.12 + Math.pow(ruido(), 1.2) * 0.75;
        fase = brazo + r * 3.2 - 0.16 + gauss() * 0.08;  // por el borde interior del brazo
        peso = -0.35;
        color[0] = 0; color[1] = 0; color[2] = 0;
      } else {
        r = 0.08 + Math.pow(ruido(), 1.3) * 0.92;
        fase = brazo + r * 3.2 + gauss() * (0.18 + 0.25 * r);  // 3 brazos en espiral
        peso = 0.35 + 0.65 * (1 - r);
        Utilidades.colorLlama(r, P.nucleo, color);
      }
      this.radio[i] = r;
      this.fase[i] = fase;
      this.altura[i] = gauss() * (nucleo ? 0.15 : 0.03);
      this.vel[i] = A.velocidad / (0.25 + r);  // el centro gira más rápido que el borde
      this.peso[i] = peso;
      this.rojo[i] = color[0]; this.verde[i] = color[1]; this.azul[i] = color[2];
    }

    const celdas = columnas * filas;
    this.densidad = new Float32Array(celdas);
    this.sumaPeso = new Float32Array(celdas);   // solo la luz positiva, para promediar el color
    this.sumaR = new Float32Array(celdas);
    this.sumaV = new Float32Array(celdas);
    this.sumaA = new Float32Array(celdas);
    this.marcada = new Uint8Array(celdas);
    this.tocadas = new Int32Array(n);
  },

  // Suaviza la inclinación y el giro hacia lo que indica el puntero
  actualizar(dt) {
    const k = Math.min(1, dt * 3);
    this.cosI += (this.objetivoCosI - this.cosI) * k;
    this.angulo += (this.objetivoAngulo - this.angulo) * k;
  },

  dibujar(cuadricula, tiempo) {
    this.dibujarHalo(cuadricula);

    const n = this.radio.length, C = this.C, F = this.filas;
    const ca = Math.cos(this.angulo), sa = Math.sin(this.angulo), cosI = this.cosI, senI = Math.sqrt(1 - cosI * cosI);
    const { densidad, sumaPeso, sumaR, sumaV, sumaA, marcada, tocadas, cx, cy, R } = this;
    let cuenta = 0;

    for (let i = 0; i < n; i++) {
      const th = this.fase[i] + tiempo * this.vel[i], r = this.radio[i];
      const px = r * Math.cos(th), py = r * Math.sin(th);
      const x = px * ca - py * sa;                                  // giro sobre la pantalla
      const y = (px * sa + py * ca) * cosI + this.altura[i] * senI; // inclinación
      const col = Math.round(cx + x * R / 0.6), fila = Math.round(cy + y * R);
      if (col < 0 || fila < 0 || col >= C || fila >= F) continue;
      const celda = fila * C + col, w = this.peso[i];
      if (!marcada[celda]) { marcada[celda] = 1; tocadas[cuenta++] = celda; }
      densidad[celda] += w;
      if (w > 0) {
        sumaPeso[celda] += w;
        sumaR[celda] += this.rojo[i] * w; sumaV[celda] += this.verde[i] * w; sumaA[celda] += this.azul[i] * w;
      }
    }

    const rampa = RAMPA_GALAXIA, tope = rampa.length - 1;
    for (let k = 0; k < cuenta; k++) {
      const celda = tocadas[k], d = densidad[celda], p = sumaPeso[celda];
      if (d > 0.05 && p > 0) {
        const brillo = 1 - Math.exp(-d * 0.7), m = (0.5 + 0.6 * brillo) / p;  // se satura suave, sin manchas macizas
        cuadricula.poner(celda % C, (celda / C) | 0, rampa[Math.max(1, Math.round(brillo * tope))], sumaR[celda] * m, sumaV[celda] * m, sumaA[celda] * m);
      }
      densidad[celda] = 0; sumaPeso[celda] = 0; sumaR[celda] = 0; sumaV[celda] = 0; sumaA[celda] = 0; marcada[celda] = 0;  // listo para el próximo fotograma
    }
  },

  // Resplandor elíptico alrededor del núcleo; sigue la inclinación de la galaxia
  dibujarHalo(cuadricula) {
    const rx = this.R * 0.55, ry = rx * (0.35 + 0.65 * this.cosI), h = PALETA_GALAXIA.halo, rampa = RAMPA_GALAXIA;
    const caracteres = cuadricula.caracteres, C = this.C;
    for (let y = Math.max(0, Math.floor(this.cy - ry)); y <= Math.min(this.filas - 1, this.cy + ry); y++) {
      for (let x = Math.max(0, Math.floor(this.cx - rx / 0.6)); x <= Math.min(C - 1, this.cx + rx / 0.6); x++) {
        const dx = (x - this.cx) * 0.6 / rx, dy = (y - this.cy) / ry, q = dx * dx + dy * dy;
        if (q >= 1 || caracteres[y * C + x]) continue;
        const v = (1 - q) * (1 - q) * 0.55;
        if (v < 0.06) continue;
        cuadricula.poner(x, y, rampa[1 + Math.floor(v * 4)], h[0] * v, h[1] * v, h[2] * v);
      }
    }
  }
};
