// Colores y ajustes de la escena de la galaxia
const PALETA_GALAXIA = {
  cielo: ["#01020a", "#0b0b24"],
  // Color de la galaxia según la distancia al centro: núcleo cálido, brazos azules y borde violeta
  nucleo: [[255, 248, 225], [255, 214, 140], [170, 170, 255], [130, 110, 235], [110, 70, 190]],
  estrellas: [[230, 235, 255], [170, 200, 255], [255, 225, 170]],
  nebulosaA: [40, 120, 140], nebulosaB: [140, 50, 120],
  planeta: [[25, 30, 60], [140, 100, 80], [225, 180, 120], [255, 235, 190]],  // de la sombra a la luz
  luna: [[30, 32, 50], [120, 122, 140], [215, 215, 230]],
  anillo: [210, 190, 160],
  fugaz: [255, 255, 255],
  pulso: [[120, 220, 255], [170, 120, 255]]
};

const AJUSTES = {
  particulas: 3200,        // estrellas de la galaxia (más = más detalle, más trabajo)
  velocidad: 0.11,         // rotación de la galaxia (radianes por segundo, en el centro)
  fugazMin: 4,             // segundos entre estrellas fugaces
  fugazMax: 9
};
