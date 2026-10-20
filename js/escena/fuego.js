// Simulación de calor: genera la llama, la espada y la intensidad de luz
const TRONCOS = String.raw`
    _\=#=#=#=#=#=/_
  _(#=#=#=#=#=#=#=#)_
 (=#=#=#=#=#=#=#=#=#=)`.split("\n").slice(1);

const Fuego = {
  acumulado: 0,
  temporal: [0, 0, 0],  // color reutilizable (evita crear objetos)

  iniciar(columnas, filas) {
    this.ancho = Math.max(14, Math.floor(columnas * 0.085));
    this.alto = Math.floor(filas * 0.40);
    this.x0 = Iluminacion.fx - Math.floor(this.ancho / 2);
    this.y0 = Iluminacion.fy - 1 - this.alto;  // la base de la llama queda sobre los troncos
    this.calor = new Float32Array(this.ancho * this.alto);
    this.brasas = [];  // brasas sueltas alrededor de la hoguera
    for (let n = 0; n < 16; n++) {
      this.brasas.push({
        x: Iluminacion.fx + Math.round((Math.random() - 0.5) * this.ancho * 2.6),
        y: Iluminacion.fy + 1 + Math.floor(Math.random() * 3),
        fase: Math.random() * 6.28
      });
    }
  },

  actualizar(dt, viento, tiempo) {
    this.acumulado += dt;
    const paso = 1 / CONFIG.pasosFuego;
    while (this.acumulado >= paso) {
      this.simular(viento);
      this.acumulado -= paso;
    }

    // La luz sube y baja con el calor de la mitad inferior, más un parpadeo
    const desde = Math.floor(this.alto / 2) * this.ancho;
    let suma = 0;
    for (let i = desde; i < this.calor.length; i++) suma += this.calor[i];
    const media = suma / (this.calor.length - desde);
    const parpadeo = 0.93 + 0.07 * Math.sin(tiempo * 13 + Math.sin(tiempo * 3) * 4);
    const objetivo = Utilidades.limitar(media / 0.3, 0.6, 1.25) * parpadeo;
    Iluminacion.intensidad += (objetivo - Iluminacion.intensidad) * 0.2;
  },

  // Un paso: alimenta la base y propaga el calor hacia arriba
  simular(viento) {
    const { ancho, alto, calor } = this;
    const centro = (ancho - 1) / 2;
    const base = (alto - 1) * ancho;

    for (let x = 0; x < ancho; x++) {
      const dist = Math.abs(x - centro) / centro;
      calor[base + x] = Math.max(0, 1 - dist * dist) * (0.75 + 0.25 * Math.random());
    }

    for (let y = 0; y < alto - 1; y++) {
      const filaAbajo = (y + 1) * ancho;
      for (let x = 0; x < ancho; x++) {
        // El viento desplaza el calor hacia un lado
        const desvio = Math.random() < Math.abs(viento) ? Math.sign(viento) : 0;
        const xs = Utilidades.limitar(x + desvio, 0, ancho - 1);
        const izq = calor[filaAbajo + Math.max(xs - 1, 0)];
        const med = calor[filaAbajo + xs];
        const der = calor[filaAbajo + Math.min(xs + 1, ancho - 1)];
        const lejos = y + 2 < alto ? calor[(y + 2) * ancho + xs] : med;
        const borde = Math.abs(x - centro) / centro;
        const enfriamiento = Math.random() * (2.0 / alto) * (1 + borde * 1.5);
        calor[y * ancho + x] = Math.max(0, (izq + med + der + lejos) / 4 - enfriamiento);
      }
    }
  },

  dibujar(cuadricula, paleta) {
    const rampa = CONFIG.rampa, tope = rampa.length - 1;
    for (let y = 0; y < this.alto; y++) {
      for (let x = 0; x < this.ancho; x++) {
        const valor = this.calor[y * this.ancho + x];
        if (valor < 0.04) continue;
        const color = Utilidades.colorLlama(valor, paleta.llama, this.temporal);
        const caracter = rampa[Math.floor(Math.pow(valor, 0.85) * tope)];
        cuadricula.poner(this.x0 + x, this.y0 + y, caracter, color[0], color[1], color[2]);
      }
    }
  },

  // Espada clavada en la hoguera: sobresale de la llama, con pomo y guarda dorados
  dibujarEspada(cuadricula) {
    const x = Iluminacion.fx;
    const punta = Math.floor(this.y0 + this.alto * 0.12);
    Iluminacion.poner(cuadricula, x, punta, "O", PALETA.oro, 1.3);  // pomo
    for (let k = 1; k <= 2; k++) Iluminacion.poner(cuadricula, x, punta + k, "#", PALETA.cuero, 1.3);  // empuñadura
    for (let k = -2; k <= 2; k++) Iluminacion.poner(cuadricula, x + k, punta + 3, "<=+=>"[k + 2], PALETA.oro, 1.3);  // guarda
    for (let y = punta + 4; y < Iluminacion.fy; y++) {  // hoja rojiza con filo brillante
      Iluminacion.poner(cuadricula, x, y, "|", PALETA.espada, 1.3);
      Iluminacion.poner(cuadricula, x + 1, y, ":", PALETA.acero, 1.0);
    }
  },

  // Brasas que laten sobre el suelo
  dibujarBrasas(cuadricula, paleta, tiempo) {
    for (const b of this.brasas) {
      const pulso = 0.5 + 0.5 * Math.sin(tiempo * 2.5 + b.fase);
      if (pulso < 0.25) continue;
      const color = Utilidades.colorLlama(0.15 + 0.45 * pulso, paleta.llama, this.temporal);
      cuadricula.poner(b.x, b.y, pulso > 0.7 ? "*" : ".", color[0], color[1], color[2]);
    }
  },

  // Troncos en la base, delante de la llama
  dibujarTroncos(cuadricula, paleta) {
    TRONCOS.forEach((linea, j) => {
      const x0 = Iluminacion.fx - Math.floor(linea.length / 2);
      for (let k = 0; k < linea.length; k++) {
        const c = linea[k];
        if (c === " ") continue;
        Iluminacion.poner(cuadricula, x0 + k, Iluminacion.fy - 2 + j, c, PALETA.madera, c === "#" ? 0.55 : 1.0);
      }
    });
  }
};
