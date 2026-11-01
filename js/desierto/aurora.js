// Aurora boreal: tres cortinas onduladas con rayos verticales. Cada cortina tiene el borde inferior
// brillante y se desvanece hacia arriba. Las cortinas se suman por celda y solo se dibujan en el cielo vacío.
const RAMPA_AURORA = " .':;!|I";   // letras verticales, para que se vean los rayos

const Aurora = {
  mezcla: 0,            // 0 = colores A, 1 = colores B
  objetivoMezcla: 0,
  pulso: 0,             // brillo extra tras un clic
  brillo: 0,            // intensidad media (sirve para teñir las dunas)

  iniciar(columnas, filas) {
    this.C = columnas;
    this.F = filas;
    this.techo = Math.floor(filas * 0.64);   // por debajo ya no hay cielo
    this.cortinas = [
      { base: 0.3, amp: 0.06, frec: 0.03, vel: 0.35, alto: 0.24, fase: 0, fuerza: 1 },
      { base: 0.2, amp: 0.05, frec: 0.045, vel: -0.25, alto: 0.17, fase: 2, fuerza: 0.7 },
      { base: 0.4, amp: 0.04, frec: 0.02, vel: 0.2, alto: 0.2, fase: 4, fuerza: 0.55 }
    ];
    const celdas = columnas * this.techo;
    this.valor = new Float32Array(celdas);
    this.sumaR = new Float32Array(celdas);
    this.sumaV = new Float32Array(celdas);
    this.sumaA = new Float32Array(celdas);
    this.tocadas = new Int32Array(celdas);
    this.colores = PALETA_DESIERTO.auroraA.map((c) => c.slice());
  },

  actualizar(dt) {
    this.mezcla += (this.objetivoMezcla - this.mezcla) * Math.min(1, dt * 2);
    this.pulso = Math.max(0, this.pulso - dt * 0.8);
    const A = PALETA_DESIERTO.auroraA, B = PALETA_DESIERTO.auroraB, m = this.mezcla;
    for (let i = 0; i < A.length; i++) {
      for (let c = 0; c < 3; c++) this.colores[i][c] = A[i][c] * (1 - m) + B[i][c] * m;
    }
  },

  dibujar(cuadricula, tiempo) {
    const C = this.C, F = this.F, techo = this.techo, salida = [0, 0, 0];
    const { valor, sumaR, sumaV, sumaA, tocadas } = this;
    let cuenta = 0, total = 0;

    for (const c of this.cortinas) {
      for (let x = 0; x < C; x++) {
        const borde = F * (c.base + Math.sin(x * c.frec + tiempo * c.vel + c.fase) * c.amp + Math.sin(x * c.frec * 2.3 - tiempo * c.vel * 1.6 + c.fase) * c.amp * 0.45);
        const alto = F * c.alto * (0.4 + 0.6 * Utilidades.ruidoSuave(x * 0.09 - tiempo * 0.3, c.fase + 7));  // rayos de distinto largo
        const rayos = Math.pow(0.5 + 0.5 * Math.sin(x * 0.8 + tiempo * 2.2 + c.fase * 3) * Math.sin(x * 0.23 - tiempo * 0.9), 2);
        const zona = Utilidades.limitar((Utilidades.ruidoSuave(x * 0.035 + tiempo * 0.12, c.fase) - 0.3) * 2, 0, 1);  // la cortina aparece y se corta a tramos
        const intensidad = c.fuerza * zona * rayos * (1 + this.pulso);
        total += intensidad;
        for (let y = Math.max(0, Math.floor(borde - alto)); y <= Math.min(techo - 1, Math.floor(borde + 1)); y++) {
          const k = (borde - y) / alto;   // 0 en el borde inferior, 1 en la punta de los rayos
          let v = k < 0 ? 1 + k / 0.15 : Math.pow(1 - k, 1.6) * (k < 0.06 ? 1.3 : 1);
          v *= intensidad;
          if (v <= 0.02) continue;
          const color = Utilidades.colorLlama(Math.max(0, k), this.colores, salida), celda = y * C + x;
          if (valor[celda] === 0) tocadas[cuenta++] = celda;
          valor[celda] += v;
          sumaR[celda] += color[0] * v; sumaV[celda] += color[1] * v; sumaA[celda] += color[2] * v;
        }
      }
    }
    this.brillo = total / (C * this.cortinas.length);

    const rampa = RAMPA_AURORA, tope = rampa.length - 1, caracteres = cuadricula.caracteres;
    for (let k = 0; k < cuenta; k++) {
      const celda = tocadas[k], v = valor[celda], b = Math.min(1, v * 1.8);
      if (!caracteres[celda] && b > 0.08) {   // las estrellas se siguen viendo a través de la aurora
        const m = (0.55 + 0.6 * b) / v;
        cuadricula.poner(celda % C, (celda / C) | 0, rampa[1 + Math.floor(b * (tope - 1))], sumaR[celda] * m, sumaV[celda] * m, sumaA[celda] * m);
      }
      valor[celda] = 0; sumaR[celda] = 0; sumaV[celda] = 0; sumaA[celda] = 0;  // listo para el próximo fotograma
    }
  },

  // Tiñe las dunas con el color del borde de la aurora, según cuánto brilla
  reflejar(cuadricula) {
    const reflejo = FondoDesierto.reflejo, { rojo, verde, azul } = cuadricula, c = this.colores[0];
    const k = this.brillo * AJUSTES_DESIERTO.reflejo;
    for (let i = 0; i < reflejo.length; i++) {
      const w = reflejo[i] * k;
      if (w <= 0.01) continue;
      rojo[i] += c[0] * w; verde[i] += c[1] * w; azul[i] += c[2] * w;
    }
  }
};
