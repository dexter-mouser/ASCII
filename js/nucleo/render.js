// Realce de color aplicado a todas las escenas: más saturación y más contraste
const REALCE = { saturacion: 1.45, contraste: 1.15, pivote: 80 };

// Dibuja la cuadrícula en el canvas usando un atlas de letras en caché
const Render = {
  // Tabla de contraste: oscurece lo que está bajo el pivote y aclara lo que está sobre él
  tabla: (() => {
    const t = new Uint8ClampedArray(256);
    for (let i = 0; i < 256; i++) t[i] = (i - REALCE.pivote) * REALCE.contraste + REALCE.pivote;
    return t;
  })(),

  atlas: new Map(),     // letra + color -> mini canvas ya dibujado
  indices: new Map(),   // letra -> número

  // Ajusta el canvas al tamaño de la ventana y calcula columnas y filas
  ajustar(lienzo, ancho, alto, tamano) {
    const densidad = Math.min(window.devicePixelRatio || 1, 2);
    lienzo.width = ancho * densidad;
    lienzo.height = alto * densidad;
    lienzo.style.width = ancho + "px";
    lienzo.style.height = alto + "px";
    this.contexto = lienzo.getContext("2d");
    this.contexto.setTransform(densidad, 0, 0, densidad, 0, 0);
    this.densidad = densidad;
    this.ancho = ancho;
    this.alto = alto;
    this.tamano = tamano;
    this.celdaAncho = tamano * 0.6;  // ancho típico de una fuente monoespaciada
    this.columnas = Math.floor(ancho / this.celdaAncho);
    this.filas = Math.floor(alto / tamano);
    this.atlas.clear();
  },

  // Devuelve la letra ya dibujada con ese color (agrupado en 32 niveles por canal)
  glifo(caracter, r, g, b) {
    let numero = this.indices.get(caracter);
    if (numero === undefined) {
      numero = this.indices.size;
      this.indices.set(caracter, numero);
    }
    const clave = (numero << 15) | ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    let mini = this.atlas.get(clave);
    if (!mini) {
      if (this.atlas.size > 8000) this.atlas.clear();
      mini = document.createElement("canvas");
      mini.width = Math.ceil(this.celdaAncho * this.densidad) + 1;
      mini.height = Math.ceil(this.tamano * this.densidad) + 1;
      const c = mini.getContext("2d");
      c.scale(this.densidad, this.densidad);
      c.font = this.tamano + 'px "Courier New", Consolas, monospace';
      c.textBaseline = "top";
      c.fillStyle = "rgb(" + ((r >> 3) * 8 + 4) + "," + ((g >> 3) * 8 + 4) + "," + ((b >> 3) * 8 + 4) + ")";
      c.fillText(caracter, 0, 0);
      this.atlas.set(clave, mini);
    }
    return mini;
  },

  // Aplica el realce a un color (devuelve [r, g, b])
  realzar(r0, g0, b0) {
    const s = REALCE.saturacion, t = this.tabla, gris = 0.299 * r0 + 0.587 * g0 + 0.114 * b0;
    const r = gris + (r0 - gris) * s, g = gris + (g0 - gris) * s, b = gris + (b0 - gris) * s;
    return [t[r < 0 ? 0 : r > 255 ? 255 : r | 0], t[g < 0 ? 0 : g > 255 ? 255 : g | 0], t[b < 0 ? 0 : b > 255 ? 255 : b | 0]];
  },

  // Igual, pero para un color de texto ("#rrggbb" o "rgb(r,g,b)")
  realzarTexto(texto) {
    const v = texto[0] === "#" ? [1, 3, 5].map((k) => parseInt(texto.substr(k, 2), 16)) : texto.match(/\d+/g).map(Number);
    return "rgb(" + this.realzar(v[0], v[1], v[2]).join(",") + ")";
  },

  dibujar(cuadricula, paleta) {
    const c = this.contexto;
    const degradado = c.createLinearGradient(0, 0, 0, this.alto);
    degradado.addColorStop(0, this.realzarTexto(paleta.cielo[0]));
    degradado.addColorStop(0.6, this.realzarTexto(paleta.cielo[1]));
    degradado.addColorStop(1, this.realzarTexto(paleta.cielo[0]));
    c.fillStyle = degradado;
    c.fillRect(0, 0, this.ancho, this.alto);

    const { caracteres, rojo, verde, azul, columnas } = cuadricula, s = REALCE.saturacion, tabla = this.tabla;
    const anchoMini = (Math.ceil(this.celdaAncho * this.densidad) + 1) / this.densidad;
    const altoMini = (Math.ceil(this.tamano * this.densidad) + 1) / this.densidad;
    for (let i = 0; i < caracteres.length; i++) {
      if (!caracteres[i]) continue;  // celda vacía
      const r0 = rojo[i], g0 = verde[i], b0 = azul[i], gris = 0.299 * r0 + 0.587 * g0 + 0.114 * b0;  // realce de color
      const r = gris + (r0 - gris) * s, g = gris + (g0 - gris) * s, b = gris + (b0 - gris) * s;
      const mini = this.glifo(caracteres[i], tabla[r < 0 ? 0 : r > 255 ? 255 : r | 0], tabla[g < 0 ? 0 : g > 255 ? 255 : g | 0], tabla[b < 0 ? 0 : b > 255 ? 255 : b | 0]);
      c.drawImage(mini, (i % columnas) * this.celdaAncho, Math.floor(i / columnas) * this.tamano, anchoMini, altoMini);
    }
  }
};
