// Colores y ajustes de la escena de la hoguera (pixel art nocturno: piedra cálida, piedra azul, acero y llama anaranjada)
const PALETA_HOGUERA = {
  cielo: ["#0a1026", "#1d2b57"],       // degradado del cielo
  estrella: [205, 215, 240],           // estrellas y luna
  nube: [100, 105, 170],               // nubes azul violáceo
  montana: [58, 78, 130],              // montañas y torre lejanas
  niebla: [120, 130, 175],             // niebla entre las montañas y el castillo
  piedra: [170, 136, 96],              // muro de ladrillos
  piedraAzul: [76, 106, 168],          // pilar tallado
  suelo: [152, 126, 92],               // losas del suelo
  hierba: [58, 88, 46],                // hierba y musgo
  metal: [165, 170, 185],              // armadura
  tela: [120, 64, 54],                 // capa y penacho
  cuero: [112, 82, 52],                // cinturón
  madera: [124, 78, 42],               // troncos
  espada: [150, 52, 26],               // espada dentro de la llama
  humo: [130, 130, 155],
  acero: [205, 212, 228],              // espadas y hierro
  oro: [225, 175, 70],                 // empuñaduras y emblemas
  escudo: [58, 90, 160],
  murcielago: [8, 6, 16],
  dragon: [12, 9, 24],
  fugaz: [255, 255, 255],
  ambiente: [0.42, 0.52, 0.85],        // tinte de la luz de luna (azul)
  calida: [1.0, 0.66, 0.32],           // tinte de la luz del fuego (naranja)
  llama: [[110, 25, 10], [200, 70, 15], [245, 130, 25], [255, 190, 55], [255, 235, 150]]
};

const AJUSTES_HOGUERA = {
  pasosFuego: 30,          // pasos de simulación por segundo
  chispasPorSegundo: 26,
  humoPorSegundo: 6,
  avivar: 1.6,             // segundos que la llama crece tras un clic
  fugazMin: 6,             // segundos entre estrellas fugaces
  fugazMax: 14
};
