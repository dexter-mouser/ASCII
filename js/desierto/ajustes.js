// Colores y ajustes de la escena del desierto con aurora
const PALETA_DESIERTO = {
  cielo: ["#01020c", "#0a1430"],
  estrella: [220, 225, 245],
  polvo: [90, 100, 150],                                                        // vía láctea
  // Aurora, del borde inferior a la punta de los rayos. El puntero mezcla las dos.
  auroraA: [[40, 255, 140], [40, 225, 195], [90, 140, 255], [190, 80, 230]],
  auroraB: [[255, 80, 150], [255, 150, 90], [200, 90, 255], [90, 60, 220]],
  meseta: [44, 40, 66],
  duna: [[40, 34, 64], [135, 108, 122], [230, 190, 165]],                       // de la sombra a la luz
  cactus: [[18, 36, 30], [60, 110, 72]],
  arena: [225, 190, 150]
};

const AJUSTES_DESIERTO = {
  granos: 70,      // granos de arena por segundo con viento máximo
  reflejo: 0.35    // cuánto tiñe la aurora a las dunas
};
