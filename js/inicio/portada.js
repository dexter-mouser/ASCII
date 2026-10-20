// Lienzo de la portada: título ASCII que se revela como un descifrado, brilla como brasa y deja subir chispas
const LLAMA = [[110, 25, 10], [200, 70, 15], [245, 130, 25], [255, 190, 55], [255, 235, 150]];

// Letras del título: cada "#" es un bloque de 2 × 2 caracteres
const GLIFOS = {
  H: ["#   #", "#   #", "#####", "#   #", "#   #"],
  O: [" ### ", "#   #", "#   #", "#   #", " ### "],
  G: [" ####", "#    ", "# ###", "#   #", " ### "],
  U: ["#   #", "#   #", "#   #", "#   #", " ### "],
  E: ["#####", "#    ", "#### ", "#    ", "#####"],
  R: ["#### ", "#   #", "#### ", "#  # ", "#   #"],
  A: [" ### ", "#   #", "#####", "#   #", "#   #"]
};
const RUIDO = "01$&#%*+=-:.<>/|";

// Color de la llama (calor de 0 a 1) como texto para el canvas
function colorLlama(calor) {
  const pos = Math.max(0, Math.min(1, calor)) * (LLAMA.length - 1);
  const i = Math.min(Math.floor(pos), LLAMA.length - 2), f = pos - i;
  const c = LLAMA[i].map((a, k) => Math.round(a + (LLAMA[i + 1][k] - a) * f));
  return "rgb(" + c.join(",") + ")";
}

const Portada = {
  tiempo: 0,
  previo: 0,

  iniciar(lienzo, raiz) {
    this.lienzo = lienzo;
    this.raiz = raiz;
    this.contexto = lienzo.getContext("2d");
    this.quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.ajustar();
    window.addEventListener("resize", () => { this.ajustar(); if (this.quieto) this.dibujar(0); });
    if (this.quieto) { this.tiempo = 10; this.dibujar(0); return; }  // sin animación: título fijo
    requestAnimationFrame((t) => { this.previo = t; this.bucle(t); });
  },

  // Calcula el tamaño de letra, las celdas del título y las brasas según la ventana
  ajustar() {
    const ancho = window.innerWidth, alto = window.innerHeight, densidad = Math.min(window.devicePixelRatio || 1, 2);
    this.ancho = ancho;
    this.alto = alto;
    this.lienzo.width = ancho * densidad;
    this.lienzo.height = alto * densidad;
    this.contexto.setTransform(densidad, 0, 0, densidad, 0, 0);

    const lineas = ancho < 640 ? ["HOG", "UERA"] : ["HOGUERA"];  // en pantallas angostas el título va en dos líneas
    const columnas = Math.max(...lineas.map((l) => l.length * 6 - 1)) * 2;
    this.columnas = columnas;
    this.tamano = Math.max(7, Math.min(26, ancho * 0.86 / (columnas * 0.6)));
    this.celdaAncho = this.tamano * 0.6;
    const alturaLinea = 10, hueco = 3;
    this.filas = lineas.length * (alturaLinea + hueco) - hueco;
    this.x0 = (ancho - columnas * this.celdaAncho) / 2;
    this.y0 = Math.max(24, alto * 0.14);

    this.celdas = [];
    lineas.forEach((texto, l) => {
      const desplazamiento = Math.floor((columnas - (texto.length * 6 - 1) * 2) / 2);
      [...texto].forEach((letra, k) => GLIFOS[letra].forEach((fila, py) => [...fila].forEach((bloque, px) => {
        if (bloque !== "#") return;
        for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) {
          const col = desplazamiento + (k * 6 + px) * 2 + dx, filaLocal = py * 2 + dy;
          const calor = 1 - (filaLocal / (alturaLinea - 1)) * 0.65;  // más caliente abajo, como una brasa
          this.celdas.push({
            col: col, fila: l * (alturaLinea + hueco) + filaLocal, calor: calor,
            caracter: "+*#%@8"[Math.min(5, Math.floor((calor - 0.35) / 0.65 * 6))],
            retardo: Math.random() * 1.4 + col * 0.008,  // momento en que se revela
            semilla: Math.floor(Math.random() * RUIDO.length)
          });
        }
      })));
    });

    this.raiz.style.setProperty("--bajo", (this.y0 + this.filas * this.tamano + 28) + "px");
    this.brasas = Array.from({ length: Math.min(160, Math.floor(ancho * alto / 9000)) }, () => this.nuevaBrasa(true));
  },

  nuevaBrasa(inicial) {
    return {
      x: Math.random() * this.ancho,
      y: inicial ? Math.random() * this.alto : this.alto + 10,
      vy: 25 + Math.random() * 70,
      fase: Math.random() * 6.28,
      caracter: ".'*+"[Math.floor(Math.random() * 4)],
      aparece: 1 + Math.random() * 2.5  // las brasas empiezan a subir después del título
    };
  },

  bucle(ahora) {
    requestAnimationFrame((t) => this.bucle(t));
    const dt = Math.min((ahora - this.previo) / 1000, 0.05);
    this.previo = ahora;
    if (!this.raiz.getClientRects().length) return;  // oculta: no se dibuja
    this.tiempo += dt;
    this.dibujar(dt);
  },

  dibujar(dt) {
    const c = this.contexto, t = this.tiempo;
    c.fillStyle = "#000";
    c.fillRect(0, 0, this.ancho, this.alto);

    // Resplandor suave detrás del título
    const cx = this.ancho / 2, cy = this.y0 + (this.filas * this.tamano) / 2;
    const radio = this.columnas * this.celdaAncho * 0.6;
    const brillo = Math.min(1, t / 2.5) * (0.07 + 0.03 * Math.sin(t * 2));
    const resplandor = c.createRadialGradient(cx, cy, 0, cx, cy, radio);
    resplandor.addColorStop(0, "rgba(255,120,30," + brillo + ")");
    resplandor.addColorStop(1, "rgba(255,120,30,0)");
    c.fillStyle = resplandor;
    c.fillRect(0, 0, this.ancho, this.alto);

    // Título: ruido que se descifra, destello blanco y luego brillo de brasa con una ola de calor
    c.font = this.tamano + 'px "Courier New", Consolas, monospace';
    c.textBaseline = "top";
    const ola = (t * 14) % (this.columnas + 40) - 20;
    for (const celda of this.celdas) {
      let caracter = celda.caracter, color;
      if (t < celda.retardo) {
        caracter = RUIDO[(Math.floor(t * 16) + celda.semilla) % RUIDO.length];
        color = "rgb(80,48,30)";
      } else if (t < celda.retardo + 0.2) {
        color = "#fff";
      } else {
        const onda = Math.exp(-Math.pow(celda.col - ola, 2) / 40) * 0.3;
        color = colorLlama(celda.calor + 0.1 * Math.sin(t * 6 + celda.col * 0.35 + celda.fila * 0.8) + (this.quieto ? 0 : onda));
      }
      c.fillStyle = color;
      c.fillText(caracter, this.x0 + celda.col * this.celdaAncho, this.y0 + celda.fila * this.tamano);
    }

    // Brasas que suben por toda la pantalla
    c.font = Math.max(10, this.tamano * 0.7) + 'px "Courier New", Consolas, monospace';
    for (const b of this.brasas) {
      if (t < b.aparece || this.quieto) continue;
      b.y -= b.vy * dt;
      b.x += Math.sin(t * 1.3 + b.fase) * 12 * dt;
      if (b.y < -10) Object.assign(b, this.nuevaBrasa(false));
      const altura = Math.max(0, b.y / this.alto);  // 1 abajo, 0 arriba
      c.globalAlpha = Math.min(1, altura * 1.4 + 0.1) * (0.6 + 0.4 * Math.sin(t * 5 + b.fase));
      c.fillStyle = colorLlama(0.15 + 0.7 * altura);
      c.fillText(b.caracter, b.x, b.y);
    }
    c.globalAlpha = 1;
  }
};
