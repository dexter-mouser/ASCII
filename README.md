# Hoguera ASCII

Escena web animada en arte ASCII: una hoguera nocturna con llama ancha, chispas, troncos, una espada clavada y un caballero sentado junto al fuego. Todo se dibuja con caracteres sobre un `<canvas>`, con iluminación que cambia según el parpadeo de la llama.

## Utilidades

- Ambiente visual a pantalla completa (salvapantallas, fondo de escritorio, decoración).
- Escena interactiva: el mouse o el teclado alteran el viento y las chispas.
- Página de inicio en ASCII con un menú para elegir la escena.
- Funciona en PC y celular, sin instalar nada ni usar servidor.

## Funcionamiento general

Los colores son fijos y salen de un pixel art nocturno: cielo índigo, piedra cálida, pilar de piedra azul, acero gris y llama anaranjada. La luz de la luna tiñe todo de azul y la hoguera lo tiñe de naranja según la cercanía.

La escena es una cuadrícula de celdas. Cada celda guarda un **carácter** y un **color**. En cada fotograma se recalcula la cuadrícula y se dibuja en el canvas.

Orden de capas (de atrás hacia adelante):

1. **Cielo medieval:** degradado nocturno, luna con cráteres, nubes, estrellas parpadeantes, dos capas de montañas y un castillo lejano con torres almenadas, tejados cónicos, ventanas encendidas y gallardetes que ondean. Murciélagos cruzan el cielo y un dragón lo atraviesa cada cierto tiempo.
2. **Muro y suelo:** muro de ladrillos en ruinas con musgo, aspilleras, un pendón con emblema dorado y un nicho amplio para el caballero. Dos antorchas iluminan el muro con su propia luz. En primer plano hay un pilar tallado, un barril, una caja y un suelo de losas con hierba y guijarros. La luz de la hoguera define la letra de cada celda: más luz, letra más densa.
3. **Personajes:** caballero grande sentado en el nicho, formado por piezas (casco con penacho, gorjal, hombreras, peto, cinturón, brazos, piernas, botas, capa y escudo) sombreadas según la luz del fuego, con luz de relleno para que se vea siempre. A su lado hay una espada recostada con guarda y pomo dorados. En la hoguera, otra espada sobresale de la llama.
4. **Llama:** simulación de calor, la parte principal.
5. **Brasas, chispas y humo:** las brasas laten sobre el suelo; las chispas brillan y se apagan; el humo es tenue y solo se ve donde lo ilumina la llama.

### La llama

1. Existe una matriz de `calor` (valores de 0 a 1).
2. La fila inferior de la hoguera se alimenta con valores altos y aleatorios.
3. Cada celda toma el promedio de las celdas de abajo, menos un pequeño enfriamiento aleatorio.
4. Un viento suave (ruido) desplaza el calor hacia los lados para que ondule.
5. El valor de calor se convierte en carácter con una **rampa de densidad**: ` .:-=+*#%@` (poco calor = símbolo ligero).
6. El valor de calor también define el color: rojo oscuro → naranja → amarillo.

### Las chispas

- Nacen cerca del núcleo de la llama, de forma aleatoria.
- Cada una tiene posición, velocidad, vida y carácter (`+`, `*`, `'`).
- Suben con deriva lateral y se apagan al terminar su vida.

### La iluminación

- Se calcula la intensidad total de la llama en cada fotograma.
- El brillo de cada celda del fondo y de los personajes depende de la distancia a la hoguera y de esa intensidad.
- Cuando la llama sube, la piedra y el caballero se iluminan; cuando baja, se oscurecen.

## Estructura del proyecto

```
hoguera-ascii/
├── index.html
├── README.md
├── css/
│   └── style.css          # Diseño general y canvas a pantalla completa
└── js/
    ├── principal.js       # Arranque y bucle de animación
    ├── configuracion.js   # Constantes (tamaño de celda, rampa, velocidades)
    ├── nucleo/
    │   ├── cuadricula.js  # Matriz de celdas (carácter + color)
    │   ├── utilidades.js  # Ruido, límites y degradado de color
    │   └── render.js      # Dibuja las capas en el canvas
    ├── escena/
    │   ├── cielo.js       # Estrellas
    │   ├── fondo.js       # Escenario: cielo, castillo, muro, suelo y objetos
    │   ├── cielo.js       # Murciélagos y dragón
    │   ├── personajes.js  # Caballero y espada
    │   ├── fuego.js       # Simulación de calor y llama
    │   ├── chispas.js     # Sistema de partículas
    │   └── iluminacion.js # Brillo según distancia y llama
    └── interfaz/
        ├── controles.js   # Mouse, teclado y toques
```

## Página de inicio

- Fondo negro con el título «HOGUERA» en ASCII, que se revela con un efecto de descifrado, brilla como una brasa y deja subir chispas por la pantalla. En pantallas angostas el título se parte en dos líneas.
- Menú de escenas: se navega con ↑ ↓ y Enter, con el mouse o con toques. Las escenas que aún no existen aparecen como «próximamente».
- Al entrar, la pantalla se apaga un instante y se abre la escena. La hoguera tiene un botón «Inicio» para volver.
- Respeta la preferencia del sistema de reducir movimiento: en ese caso el título queda fijo y sin brasas.
- Para añadir una escena nueva, se agrega una entrada con su `destino` en la lista `OPCIONES` de `js/inicio/opciones.js`.

Archivos: `index.html` (inicio), `hoguera.html` (escena), `css/inicio.css`, `js/inicio/` (`opciones.js`, `portada.js`, `arranque.js`).

## Controles

| Acción | Efecto |
|---|---|
| Mover el mouse / deslizar el dedo | Empuja la llama y las chispas como viento |
| Clic / toque | Lanza una ráfaga de chispas |
| Tecla `F` | Pantalla completa |
| Botón inferior | Activa la pantalla completa (útil en celular) |

## Rendimiento

- Cada letra se dibuja una vez por color y se reutiliza (atlas en caché), lo que permite usar letras pequeñas y mucho detalle.
- El canvas se ajusta al tamaño de la ventana y la cuadrícula se recalcula al redimensionar.
- El fondo (muros, suelo, cielo) se genera una sola vez al abrir o redimensionar; en cada fotograma solo se vuelve a iluminar y se actualizan llama y chispas.
- Se usa `requestAnimationFrame` con tiempo transcurrido, para que la velocidad sea igual en cualquier pantalla.
- En celulares se reduce el número de celdas para mantener la fluidez.

## Tecnologías

HTML, CSS y JavaScript puro (sin librerías ni dependencias). Se abre directamente `index.html` en el navegador.
