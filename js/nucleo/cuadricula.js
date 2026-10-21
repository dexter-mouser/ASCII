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

  // Limpia solo las filas pares (0) o impares (1)
  limpiarFilas(paridad) {
    for (let y = paridad; y < this.filas; y += 2) {
      const inicio = y * this.columnas;
      for (let x = 0; x < this.columnas; x++) this.caracteres[inicio + x] = "";
    }
  }

  // Copia el contenido de otra cuadrícula del mismo tamaño
  copiarDe(otra) {
    for (let i = 0; i < this.caracteres.length; i++) this.caracteres[i] = otra.caracteres[i];
    this.rojo.set(otra.rojo);
    this.verde.set(otra.verde);
    this.azul.set(otra.azul);
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
