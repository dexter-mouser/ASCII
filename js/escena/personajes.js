// Caballero sentado en el nicho, hecho con formas elípticas sombreadas por la luz del fuego
// Cada forma: [centro x, centro y, radio x, radio y, brillo, material]  (y hacia arriba, de delante hacia atrás)
const FIGURAS = [
  [-1.0, 10.2, 0.5, 0.35, 0.1, "metal"],   // visera (zona oscura)
  [0.2, 10.4, 1.7, 2.0, 1.0, "metal"],     // casco
  [1.9, 12.3, 1.4, 0.9, 0.9, "tela"],      // penacho
  [0.3, 8.7, 1.3, 0.6, 1.0, "metal"],      // gorjal (protege el cuello)
  [-1.2, 7.7, 2.0, 1.4, 0.95, "metal"],    // hombrera izquierda
  [3.2, 7.6, 1.6, 1.2, 0.8, "metal"],      // hombrera derecha
  [-5.6, 3.3, 0.8, 0.7, 1.0, "metal"],     // guantelete
  [1.2, 2.7, 2.9, 0.45, 0.9, "cuero"],     // cinturón
  [1.2, 5.0, 3.0, 3.3, 1.0, "metal"],      // peto
  [-4.2, 2.7, 2.0, 0.85, 0.9, "metal"],    // antebrazo
  [-2.6, 4.0, 1.1, 2.0, 0.9, "metal"],     // brazo
  [-6.2, 2.5, 1.1, 1.3, 1.0, "metal"],     // rodilla
  [-2.8, 1.4, 3.6, 1.15, 0.95, "metal"],   // muslo
  [-7.0, 1.0, 0.9, 1.1, 0.85, "metal"],    // espinilla
  [-7.9, 0.45, 1.5, 0.55, 0.8, "cuero"],   // bota
  [-9.3, 2.3, 0.8, 2.3, 1.1, "escudo"],    // escudo apoyado
  [5.9, 13.4, 0.6, 0.5, 1.2, "oro"],       // pomo de la espada recostada
  [5.9, 12.6, 1.9, 0.4, 1.2, "oro"],       // guarda de la espada recostada
  [5.9, 6.4, 0.5, 6.4, 1.25, "acero"],     // hoja de la espada recostada
  [0.8, 1.0, 3.6, 1.0, 0.55, "metal"],     // pierna trasera
  [4.2, 4.2, 2.4, 4.2, 0.6, "tela"]        // capa
];

const Personajes = {
  dibujar(cuadricula) {
    const u = Iluminacion.unidad;           // unidad de medida (se adapta a la pantalla)
    const pies = Iluminacion.fy + 1;
    const ax = Fondo.nichoX;
    const rampa = CONFIG.rampa;

    for (let y = Math.floor(pies - 14.5 * u); y <= pies; y++) {
      for (let x = Math.floor(ax - 10.5 * u / 0.6); x <= Math.ceil(ax + 8 * u / 0.6); x++) {
        const lx = ((x - ax) * 0.6) / u, ly = (pies - y) / u;
        for (const f of FIGURAS) {
          const nx = (lx - f[0]) / f[2], ny = (ly - f[1]) / f[3], q = nx * nx + ny * ny;
          if (q > 1) continue;
          // Sombreado: la luz llega desde la izquierda (la hoguera) + luz de relleno para que se vea siempre
          const nz = Math.sqrt(1 - q);
          const lambert = Utilidades.limitar(-0.75 * nx + 0.1 * ny + 0.65 * nz, 0, 1);
          const luz = Iluminacion.luzEn(x, y) * lambert + 0.22;
          const brillo = (0.12 + luz * 1.1 + 0.08 * (1 - nz)) * f[4];
          const indice = Math.max(4, Math.floor(Utilidades.limitar(brillo, 0, 1) * (rampa.length - 1)));
          Iluminacion.poner(cuadricula, x, y, rampa[indice], PALETA[f[5]], f[4], luz);
          break;  // solo la forma que queda delante
        }
      }
    }
  }
};
