// Dibuja la cuadrícula en el canvas usando un atlas de letras en caché
const Render = {
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

  dibujar(cuadricula, paleta) {
    const c = this.contexto;
    const degradado = c.createLinearGradient(0, 0, 0, this.alto);
    degradado.addColorStop(0, paleta.cielo[0]);
    degradado.addColorStop(0.6, paleta.cielo[1]);
    degradado.addColorStop(1, paleta.cielo[0]);
    c.fillStyle = degradado;
    c.fillRect(0, 0, this.ancho, this.alto);

    const { caracteres, rojo, verde, azul, columnas } = cuadricula;
    const anchoMini = (Math.ceil(this.celdaAncho * this.densidad) + 1) / this.densidad;
    const altoMini = (Math.ceil(this.tamano * this.densidad) + 1) / this.densidad;
    for (let i = 0; i < caracteres.length; i++) {
      if (!caracteres[i]) continue;  // celda vacía
      const mini = this.glifo(caracteres[i], rojo[i], verde[i], azul[i]);
      c.drawImage(mini, (i % columnas) * this.celdaAncho, Math.floor(i / columnas) * this.tamano, anchoMini, altoMini);
    }
  }
};
