// Funciones auxiliares compartidas
const Utilidades = {
  limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
  },

  // Ruido determinista (0 a 1) a partir de dos coordenadas
  ruido(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  },

  // Ruido suave (interpolado) de 0 a 1
  ruidoSuave(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = x - xi, fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = Utilidades.ruido(xi, yi), b = Utilidades.ruido(xi + 1, yi);
    const c = Utilidades.ruido(xi, yi + 1), d = Utilidades.ruido(xi + 1, yi + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  },

  // Suma de tres capas de ruido (nubes, montañas)
  fbm(x, y) {
    const s = Utilidades.ruidoSuave;
    return (0.5 * s(x, y) + 0.25 * s(x * 2, y * 2) + 0.125 * s(x * 4, y * 4)) / 0.875;
  },

  // Interpola el degradado de la llama (valor 0 a 1) y guarda el color en "salida"
  colorLlama(valor, puntos, salida) {
    const pos = Utilidades.limitar(valor, 0, 1) * (puntos.length - 1);
    const i = Math.min(Math.floor(pos), puntos.length - 2);
    const f = pos - i;
    for (let c = 0; c < 3; c++) {
      salida[c] = puntos[i][c] + (puntos[i + 1][c] - puntos[i][c]) * f;
    }
    return salida;
  }
};
