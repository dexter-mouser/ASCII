// Matriz de celdas: cada una guarda un carácter y un color (rojo, verde, azul)
class Cuadricula {
  constructor(columnas, filas) {
    this.columnas = columnas;
    this.filas = filas;
    const total = columnas * filas;
    this.caracteres = new Array(total).fill("");
    this.rojo = new Uint8ClampedArray(total);  // limita solo a 0-255
    this.verde = new Uint8ClampedArray(total);
    this.azul = new Uint8ClampedArray(total);
  }

  limpiar() {
    this.caracteres.fill("");
  }

  // Escribe una celda; ignora lo que quede fuera de la pantalla
  poner(x, y, caracter, r, g, b) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.columnas || y >= this.filas) return;
    const i = y * this.columnas + x;
    this.caracteres[i] = caracter;
    this.rojo[i] = r;
    this.verde[i] = g;
    this.azul[i] = b;
  }
}
