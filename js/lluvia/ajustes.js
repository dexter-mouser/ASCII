// Colores y ajustes de la escena de lluvia nocturna
const PALETA_LLUVIA = {
  cielo: [[5, 7, 14], [24, 32, 56]],   // degradado del cielo
  ambiente: [0.30, 0.38, 0.58],        // tinte de la noche (azul)
  destello: [1.0, 1.05, 1.2],          // tinte de los relámpagos
  nube: [66, 72, 98], mar: [36, 66, 104], roca: [80, 88, 104], piedra: [108, 112, 132],
  pino: [30, 66, 58], madera: [108, 70, 44], tejado: [100, 64, 60], pared: [98, 92, 108],
  calle: [68, 74, 94], ambar: [255, 176, 72], rosa: [255, 72, 170], cian: [72, 232, 255],
  tela: [170, 66, 58], lluvia: [150, 172, 212], gota: [190, 212, 242], rayo: [225, 235, 255],
  humo: [135, 140, 155], taza: [205, 185, 155], cera: [240, 226, 190], cuero: [110, 80, 50]
};

const AJUSTES = {
  gotasPorCelda: 1 / 55,   // cantidad de lluvia según el tamaño de la pantalla
  rayoMin: 3,              // segundos entre relámpagos
  rayoMax: 9,
  letrero: "TABERNA"       // texto del neón
};
