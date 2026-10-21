// Galaxia espiral hecha de partículas. Cada fotograma se proyecta cada partícula en la cuadrícula y se suma su
// brillo por celda; solo se recorren las celdas tocadas, así que el coste depende de las partículas, no del tamaño de la pantalla.
const Galaxia = {
  cosI: 0.55,       // inclinación actual (1 = vista de frente, 0 = de canto)
  angulo: -0.4,     // giro de la galaxia sobre la pantalla
  objetivoCosI: 0.55,
  objetivoAngulo: -0.4,

  iniciar(columnas, filas) {
    const n = AJUSTES.particulas, ruido = () => Math.random();
    this.C = columnas;
    this.cx = columnas * 0.56;
    this.cy = filas * 0.46;
    this.R = Math.min(filas * 0.44, columnas * 0.6 * 0.34);  // radio de la galaxia en filas

    this.radio = new Float32Array(n);
    this.fase = new Float32Array(n);   // ángulo inicial
    this.altura = new Float32Array(n);
    this.vel = new Float32Array(n);
    this.peso = new Float32Array(n);
    this.rojo = new Float32Array(n);
    this.verde = new Float32Array(n);
    this.azul = new Float32Array(n);
    const gauss = () => (ruido() + ruido() + ruido() - 1.5) / 1.5, color = [0, 0, 0];

    for (let i = 0; i < n; i++) {
      const nucleo = i < n * 0.18;  // el 18 % forma el bulbo central
      const r = nucleo ? Math.pow(ruido(), 2.2) * 0.22 : 0.08 + Math.pow(ruido(), 1.3) * 0.92;
      this.radio[i] = r;
      this.fase[i] = nucleo ? ruido() * 6.283 : (i % 3) * 2.094 + r * 3.2 + gauss() * (0.18 + 0.25 * r);  // 3 brazos en espiral
      this.altura[i] = gauss() * (nucleo ? 0.15 : 0.03);
      this.vel[i] = AJUSTES.velocidad / (0.25 + r);  // el centro gira más rápido que el borde
      this.peso[i] = 0.35 + 0.65 * (1 - r);
      Utilidades.colorLlama(r, PALETA_GALAXIA.nucleo, color);
      this.rojo[i] = color[0]; this.verde[i] = color[1]; this.azul[i] = color[2];
    }

    const celdas = columnas * filas;
    this.densidad = new Float32Array(celdas);
    this.sumaR = new Float32Array(celdas);
    this.sumaV = new Float32Array(celdas);
    this.sumaA = new Float32Array(celdas);
    this.tocadas = new Int32Array(n);
    this.filas = filas;
  },

  // Suaviza la inclinación y el giro hacia lo que indica el puntero
  actualizar(dt) {
    const k = Math.min(1, dt * 3);
    this.cosI += (this.objetivoCosI - this.cosI) * k;
    this.angulo += (this.objetivoAngulo - this.angulo) * k;
  },

  dibujar(cuadricula, tiempo) {
    const n = this.radio.length, C = this.C, F = this.filas;
    const ca = Math.cos(this.angulo), sa = Math.sin(this.angulo), cosI = this.cosI, senI = Math.sqrt(1 - cosI * cosI);
    const { densidad, sumaR, sumaV, sumaA, tocadas, cx, cy, R } = this;
    let cuenta = 0;

    for (let i = 0; i < n; i++) {
      const th = this.fase[i] + tiempo * this.vel[i], r = this.radio[i];
      const px = r * Math.cos(th), py = r * Math.sin(th);
      const x = px * ca - py * sa;                                  // giro sobre la pantalla
      const y = (px * sa + py * ca) * cosI + this.altura[i] * senI; // inclinación
      const col = Math.round(cx + x * R / 0.6), fila = Math.round(cy + y * R);
      if (col < 0 || fila < 0 || col >= C || fila >= F) continue;
      const celda = fila * C + col, w = this.peso[i];
      if (densidad[celda] === 0) tocadas[cuenta++] = celda;
      densidad[celda] += w;
      sumaR[celda] += this.rojo[i] * w; sumaV[celda] += this.verde[i] * w; sumaA[celda] += this.azul[i] * w;
    }

    const rampa = CONFIG.rampa, tope = rampa.length - 1;
    for (let k = 0; k < cuenta; k++) {
      const celda = tocadas[k], d = densidad[celda];
      const brillo = Math.min(1, d * 0.45), m = (0.55 + 0.45 * brillo) / d;
      cuadricula.poner(celda % C, (celda / C) | 0, rampa[Math.max(1, Math.floor(brillo * tope * 0.95))], sumaR[celda] * m, sumaV[celda] * m, sumaA[celda] * m);
      densidad[celda] = 0; sumaR[celda] = 0; sumaV[celda] = 0; sumaA[celda] = 0;  // se deja listo para el próximo fotograma
    }
  }
};
