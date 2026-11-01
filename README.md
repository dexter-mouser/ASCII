# Diferente: escenas ASCII

Colección de escenas web animadas en arte ASCII, con una portada que permite elegir entre ellas: una hoguera nocturna con un caballero, una galaxia espiral, un fondo marino, un bosque con luciérnagas y un desierto bajo la aurora. Todo se dibuja con caracteres sobre un `<canvas>`.

## Utilidades

- Ambiente visual a pantalla completa (salvapantallas, fondo de escritorio, decoración).
- Escenas interactivas: el puntero o el dedo cambian el viento, la galaxia, la corriente del mar o los colores de la aurora, y un clic o toque lanza efectos.
- Página de inicio en ASCII con un menú para elegir la escena.
- Funciona en PC y celular, sin instalar nada ni usar servidor.

## Funcionamiento general

Cada escena es una cuadrícula de celdas. Cada celda guarda un **carácter** y un **color**. En cada fotograma se recalcula la cuadrícula y se dibuja en el canvas. Todas las escenas comparten el núcleo de `js/nucleo/` (cuadrícula, render, bucle y utilidades).

El brillo de una celda se convierte en carácter con una **rampa de densidad** de 70 caracteres, de menos a más densa (`CONFIG.rampa` en `js/configuracion.js`): poca luz = símbolo ligero, mucha luz = símbolo denso. Algunas escenas usan una rampa propia para la luz (la galaxia y la aurora), sin letras del abecedario.

Todas las escenas siguen la misma estructura: una página HTML y una carpeta en `js/` con `ajustes.js` (paleta `PALETA_<ESCENA>` y ajustes `AJUSTES_<ESCENA>`), los módulos de la escena y `arranque.js`, que ajusta el tamaño, lleva el bucle y conecta los controles. El paisaje fijo se dibuja una sola vez en una capa y en cada fotograma solo se copia y se le suma lo que se mueve. En todas, `F` y el botón inferior activan la pantalla completa, e «Inicio» vuelve al menú.

## Página de inicio

- Fondo negro con el título «DIFERENTE» en ASCII, que se revela con un efecto de descifrado, brilla como una brasa y deja subir chispas por la pantalla. En pantallas angostas el título se parte en dos líneas.
- Menú de escenas: se navega con ↑ ↓ y Enter, con el mouse o con toques.
- Al entrar, la pantalla se apaga un instante y se abre la escena. Cada escena tiene un botón «Inicio» para volver.
- Respeta la preferencia del sistema de reducir movimiento: en ese caso el título queda fijo y sin brasas.
- Para añadir una escena nueva, se agrega una entrada con su `destino` en la lista `OPCIONES` de `js/inicio/opciones.js`. Las entradas con `destino: null` aparecen como «próximamente» y el menú las salta.

Archivos: `index.html`, `css/inicio.css` y `js/inicio/` (`opciones.js`, `portada.js`, `arranque.js`).

## Escena de la hoguera

Una hoguera nocturna con llama ancha, chispas, troncos, una espada clavada y un caballero sentado junto al fuego, con iluminación que cambia según el parpadeo de la llama.

Los colores son fijos y salen de un pixel art nocturno: cielo índigo, piedra cálida, pilar de piedra azul, acero gris y llama anaranjada. La luz de la luna tiñe todo de azul y la hoguera lo tiñe de naranja según la cercanía.

Orden de capas (de atrás hacia adelante):

1. **Cielo medieval:** degradado nocturno, luna con cráteres, nubes, estrellas parpadeantes, estrellas fugaces, dos capas de montañas y un castillo lejano de sillares con torres almenadas, tejados cónicos, ventanas encendidas y gallardetes que ondean. Una niebla avanza despacio entre las montañas y el castillo. Murciélagos cruzan el cielo y un dragón lo atraviesa cada cierto tiempo.
2. **Muro y suelo:** muro de ladrillos en ruinas con musgo, aspilleras, un pendón con emblema dorado y un nicho amplio para el caballero. Dos antorchas iluminan el muro con su propia luz. En primer plano hay un pilar tallado, un barril, una caja y un suelo de losas con hierba y guijarros. La luz de la hoguera define la letra de cada celda: más luz, letra más densa.
3. **Personajes:** caballero grande sentado en el nicho, formado por piezas (casco con penacho, gorjal, hombreras, peto, cinturón, brazos, piernas, botas, capa y escudo) sombreadas según la luz del fuego, con luz de relleno para que se vea siempre. A su lado hay una espada recostada con guarda y pomo dorados. En la hoguera, otra espada sobresale de la llama.
4. **Llama:** simulación de calor, la parte principal.
5. **Brasas, chispas y humo:** las brasas laten sobre el suelo; las chispas brillan y se apagan; el humo es tenue y solo se ve donde lo ilumina la llama.

### La llama

1. Existe una matriz de `calor` (valores de 0 a 1).
2. La fila inferior de la hoguera se alimenta con valores altos y aleatorios.
3. Cada celda toma el promedio de las celdas de abajo, menos un pequeño enfriamiento aleatorio.
4. Un viento suave (ruido) desplaza el calor hacia los lados para que ondule.
5. El valor de calor se convierte en carácter con la rampa de densidad (poco calor = símbolo ligero).
6. El valor de calor también define el color: rojo oscuro → naranja → amarillo.

### Las chispas

- Nacen cerca del núcleo de la llama, de forma aleatoria.
- Cada una tiene posición, velocidad y vida; su carácter cambia al envejecer (`*` → `+` → `.`).
- Suben con deriva lateral y se apagan al terminar su vida.

### La iluminación

- Se calcula la intensidad total de la llama en cada fotograma.
- El brillo de cada celda del fondo y de los personajes depende de la distancia a la hoguera y de esa intensidad.
- Cuando la llama sube, la piedra y el caballero se iluminan; cuando baja, se oscurecen.

### Controles

| Acción | Efecto |
|---|---|
| Mover el mouse / deslizar el dedo | Empuja la llama y las chispas como viento |
| Clic / toque | Aviva el fuego (la llama crece y alumbra más) y lanza una ráfaga de chispas |
| Tecla `F` | Pantalla completa |
| Botón inferior | Activa la pantalla completa (útil en celular) |
| «Inicio» | Vuelve al menú |

Archivos: `hoguera.html` y `js/hoguera/` (`ajustes.js`, `iluminacion.js`, `fondo.js`, `cielo.js`, `fuego.js`, `personajes.js`, `chispas.js`, `arranque.js`).

## Escena de la galaxia

Una galaxia espiral que gira lentamente en un cielo profundo, pensada para ser ligera:

- **Galaxia:** unas 5 000 partículas en tres brazos en espiral con un bulbo central brillante y un resplandor que sigue su inclinación. El centro gira más rápido que el borde y el color va del núcleo cálido a los brazos azules y el borde violeta.
- **Polvo y cúmulos:** franjas de polvo oscuro recorren el borde interior de los brazos (restan luz) y cúmulos rosas y azules marcan las zonas donde nacen estrellas.
- **Fondo:** nebulosas de polvo en dos colores, galaxias lejanas, estrellas fijas y otras que titilan, un planeta con anillos sombreado por la luz y una luna.
- **Efectos:** estrellas fugaces cada pocos segundos y ondas de luz que se expanden al hacer clic o tocar.

Controles: mover el puntero o el dedo inclina y gira la galaxia, un clic o toque lanza una onda de luz, `F` y el botón inferior activan la pantalla completa, y «Inicio» vuelve al menú.

Archivos: `galaxia.html` y `js/galaxia/` (`ajustes.js`, `fondo.js`, `galaxia.js`, `efectos.js`, `arranque.js`).

## Escena del océano submarino

Un fondo marino iluminado desde la superficie:

- **Agua:** superficie con olas, rayos de luz inclinados que se mueven, reflejos que bailan sobre la arena y motas que flotan.
- **Fondo:** rocas lejanas perdidas en el agua, arena con ondas, rocas grandes y corales ramificados y redondos.
- **Algas:** se mecen con la corriente; la punta se mueve más que la raíz.
- **Animales:** peces sueltos de varios tamaños, un cardumen que nada y gira junto, medusas que suben al contraerse y una tortuga que cruza de vez en cuando.
- **Burbujas:** salen solas de las grietas de las rocas y suben haciendo eses.

Controles: mover el puntero o el dedo cambia la corriente (algas, burbujas y peces), un clic o toque suelta burbujas y asusta a los peces cercanos, `F` y el botón inferior activan la pantalla completa, y «Inicio» vuelve al menú.

Archivos: `oceano.html` y `js/oceano/` (`ajustes.js`, `fondo.js`, `mar.js`, `vida.js`, `arranque.js`).

## Escena del bosque con luciérnagas

Un bosque de pinos en una noche de luna:

- **Cielo:** estrellas y una luna con cráteres y halo.
- **Bosque:** colinas lejanas y tres capas de pinos por pisos de ramas, más claros del lado de la luna. Entre las ramas, un búho parpadea de vez en cuando.
- **Suelo:** tierra, hongos y hierba que se mece con la brisa.
- **Niebla:** baja y avanza despacio; sobre los árboles los aclara.
- **Luciérnagas:** vagan, se encienden y se apagan, e iluminan las ramas y la niebla que tienen alrededor.

Controles: las luciérnagas se acercan al puntero y giran a su alrededor, un clic o toque las dispersa y las hace brillar, `F` y el botón inferior activan la pantalla completa, y «Inicio» vuelve al menú.

Archivos: `bosque.html` y `js/bosque/` (`ajustes.js`, `fondo.js`, `noche.js`, `luciernagas.js`, `arranque.js`).

## Escena del desierto y la aurora

Dunas bajo una aurora boreal:

- **Cielo:** estrellas, la franja de la vía láctea y tres cortinas de aurora con rayos verticales que ondulan, cambian de largo y aparecen y se cortan a tramos.
- **Paisaje:** mesetas lejanas, tres capas de dunas con ondas de viento (más claras en las laderas que miran a la luz) y cactus.
- **Reflejo:** las dunas se tiñen con el color de la aurora según cuánto brilla.
- **Arena:** el viento levanta granos de las crestas de las dunas.

Controles: mover el puntero o el dedo a los lados cambia la dirección y la fuerza del viento, y hacia arriba o abajo cambia los colores de la aurora (de verde y violeta a rosa y naranja); un clic o toque lanza una ráfaga de arena y aviva la aurora. `F` y el botón inferior activan la pantalla completa, y «Inicio» vuelve al menú.

Archivos: `desierto.html` y `js/desierto/` (`ajustes.js`, `fondo.js`, `aurora.js`, `arena.js`, `arranque.js`).

## Estructura del proyecto

```
hoguera-ascii-completo/
├── index.html             # Página de inicio
├── hoguera.html           # Escena de la hoguera
├── galaxia.html           # Escena de la galaxia
├── oceano.html            # Escena del océano submarino
├── bosque.html            # Escena del bosque con luciérnagas
├── desierto.html          # Escena del desierto y la aurora
├── README.md
├── css/
│   ├── inicio.css         # Diseño de la página de inicio
│   └── style.css          # Canvas a pantalla completa y panel de las escenas
└── js/
    ├── configuracion.js   # Constantes compartidas (rampa y fotogramas)
    ├── nucleo/            # Compartido por todas las escenas
    │   ├── cuadricula.js  # Matriz de celdas (carácter + color)
    │   ├── utilidades.js  # Ruido, límites y degradado de color
    │   ├── render.js      # Dibuja la cuadrícula en el canvas y realza colores
    │   └── bucle.js       # Bucle de animación con límite de fotogramas
    ├── inicio/            # Página de inicio
    │   ├── opciones.js    # Menú de escenas
    │   ├── portada.js     # Título ASCII y brasas
    │   └── arranque.js
    ├── hoguera/           # Escena de la hoguera
    │   ├── ajustes.js     # Paleta y ajustes
    │   ├── iluminacion.js # Brillo según distancia y llama
    │   ├── fondo.js       # Escenario: cielo, estrellas, castillo, muro, suelo y objetos
    │   ├── cielo.js       # Niebla, estrellas fugaces, murciélagos y dragón
    │   ├── fuego.js       # Simulación de calor y llama
    │   ├── personajes.js  # Caballero y espadas
    │   ├── chispas.js     # Chispas y humo
    │   └── arranque.js    # Bucle y controles
    ├── galaxia/           # Escena de la galaxia
    ├── oceano/            # Escena del océano submarino
    ├── bosque/            # Escena del bosque con luciérnagas
    └── desierto/          # Escena del desierto y la aurora
```

## Rendimiento

Para todas las escenas:

- La portada y las escenas se actualizan a 30 fotogramas por segundo con un bucle compartido (`js/nucleo/bucle.js`, valor `fotogramas` en `js/configuracion.js`).
- Se usa `requestAnimationFrame` con tiempo transcurrido, para que la velocidad sea igual en cualquier pantalla.
- Los colores se realzan con más saturación y contraste en un solo lugar (`REALCE` en `js/nucleo/render.js`).
- Cada letra se dibuja una vez por color y se reutiliza (atlas en caché), lo que permite usar letras pequeñas y mucho detalle.
- El canvas se ajusta al tamaño de la ventana y la cuadrícula se recalcula al redimensionar. El tamaño de letra depende del ancho de la pantalla, así que en celulares hay menos celdas.

Por escena:

- **Hoguera:** el fondo (muros, suelo, cielo) se genera una sola vez al abrir o redimensionar; en cada fotograma solo se vuelve a iluminar y se actualizan llama y chispas. El fondo y el caballero se redibujan por mitades de filas, alternando.
- **Galaxia:** el fondo se dibuja una sola vez y la galaxia solo recorre las celdas que ocupa; el resplandor del núcleo solo recorre su elipse.
- **Océano, bosque y desierto:** el paisaje se dibuja una sola vez; en cada fotograma solo se agregan el agua, la niebla, la aurora y lo que se mueve. Las algas y la hierba guardan solo su raíz y se recalculan al mecerse, y la aurora solo recorre las celdas que tocan sus cortinas.

## Tecnologías

HTML, CSS y JavaScript puro (sin librerías ni dependencias). Se abre directamente `index.html` en el navegador.
