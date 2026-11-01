// Colores y ajustes de la escena de la galaxia
const PALETA_GALAXIA = {
  cielo: ["#01020a", "#0b0b24"],
  // Color de la galaxia según la distancia al centro: núcleo cálido, brazos azules y borde violeta
  nucleo: [[255, 248, 225], [255, 214, 140], [170, 170, 255], [130, 110, 235], [110, 70, 190]],
  halo: [255, 210, 150],                                // resplandor alrededor del núcleo
  cumulos: [[255, 120, 175], [150, 205, 255]],          // zonas donde nacen estrellas (rosas y azules)
  estrellas: [[230, 235, 255], [170, 200, 255], [255, 225, 170]],
  nebulosaA: [40, 120, 140], nebulosaB: [140, 50, 120],
  lejanas: [150, 140, 200],                             // galaxias lejanas del fondo
  planeta: [[25, 30, 60], [140, 100, 80], [225, 180, 120], [255, 235, 190]],  // de la sombra a la luz
  luna: [[30, 32, 50], [120, 122, 140], [215, 215, 230]],
  anillo: [210, 190, 160],
  fugaz: [255, 255, 255],
  pulso: [[120, 220, 255], [170, 120, 255]]
};

// Letras de la galaxia, de tenue a brillante (sin letras del abecedario, para que se vea como luz)
const RAMPA_GALAXIA = " .'`:;~+=*xo%#@";

const AJUSTES_GALAXIA = {
  particulas: 5000,        // estrellas de la galaxia (más = más detalle, más trabajo)
  polvo: 0.2,              // parte de los brazos que es polvo oscuro (dibuja las franjas oscuras)
  cumulos: 0.06,           // parte de los brazos que son cúmulos brillantes
  velocidad: 0.11,         // rotación de la galaxia (radianes por segundo, en el centro)
  fugazMin: 4,             // segundos entre estrellas fugaces
  fugazMax: 9
};
