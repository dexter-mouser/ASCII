// Colores y ajustes de la escena del océano submarino
const PALETA_OCEANO = {
  cielo: ["#010a14", "#04304a"],
  superficie: [130, 215, 240],
  rayo: [90, 175, 205],
  lejos: [26, 62, 88],                                           // rocas lejanas perdidas en el agua
  arena: [[38, 40, 56], [120, 104, 76], [205, 180, 125]],        // de la sombra a la luz
  roca: [[18, 28, 42], [62, 82, 98], [120, 140, 150]],
  coral: [[255, 105, 120], [255, 160, 85], [205, 95, 210], [255, 210, 120]],
  alga: [[20, 70, 40], [60, 150, 70], [150, 215, 95]],
  peces: [[255, 170, 60], [255, 225, 90], [110, 200, 255], [255, 120, 150], [180, 245, 205]],
  tortuga: [[70, 120, 70], [150, 190, 110]],
  medusa: [[190, 140, 255], [255, 170, 230]],
  burbuja: [195, 238, 255],
  mota: [120, 160, 170]
};

const AJUSTES_OCEANO = {
  peces: 14,               // peces sueltos (además del cardumen)
  cardumen: 12,            // peces pequeños que nadan juntos
  algas: 26,
  medusas: 3,
  burbujasPorSegundo: 5    // burbujas que salen solas del fondo
};
