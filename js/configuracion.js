// Constantes generales de la escena
const CONFIG = {
  // Rampa de 70 caracteres, de menos a más densa (da detalle y sombreado)
  rampa: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  pasosFuego: 30,        // pasos de simulación por segundo
  chispasPorSegundo: 26,
  humoPorSegundo: 6
};

// Estado que cambia mientras se usa la app
const Estado = { ventoExtra: 0 };

// Colores de la escena (pixel art nocturno: piedra cálida, piedra azul, acero y llama anaranjada)
const PALETA = {
  cielo: ["#0a1026", "#1d2b57"],       // degradado del cielo
  estrella: [205, 215, 240],           // estrellas y luna
  nube: [100, 105, 170],               // nubes azul violáceo
  montana: [58, 78, 130],              // montañas y torre lejanas
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
  ambiente: [0.42, 0.52, 0.85],        // tinte de la luz de luna (azul)
  calida: [1.0, 0.66, 0.32],           // tinte de la luz del fuego (naranja)
  llama: [[110, 25, 10], [200, 70, 15], [245, 130, 25], [255, 190, 55], [255, 235, 150]]
};
