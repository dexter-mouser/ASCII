// Colores y ajustes de la escena del bosque con luciérnagas
const PALETA_BOSQUE = {
  cielo: ["#02040a", "#0c1a2a"],
  estrella: [205, 215, 240],
  luna: [[70, 78, 96], [200, 205, 215], [252, 248, 230]],
  halo: [120, 135, 170],
  colinas: [26, 38, 60],
  arboles: [[28, 48, 70], [38, 78, 76], [54, 112, 82]],  // de la capa lejana a la cercana
  tronco: [58, 42, 34],
  suelo: [[14, 20, 18], [42, 60, 36]],
  hierba: [[28, 66, 38], [80, 135, 66]],
  hongo: [[190, 60, 50], [235, 215, 195]],
  ojos: [255, 210, 80],
  niebla: [130, 150, 175],
  luciernaga: [[110, 150, 40], [205, 255, 90], [255, 255, 205]]  // de apagada a encendida
};

const AJUSTES_BOSQUE = {
  luciernagas: 80,
  atraccion: 0.45   // alcance del puntero sobre las luciérnagas (en fracción del alto de la pantalla)
};
