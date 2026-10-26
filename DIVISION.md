# División de Bus Coin en dos apps

Decidido con Ale (2026-10-25). Problema: la app quedó sobrecargada (pasajeros que no encuentran lo que buscan, carga lenta, difícil de mantener) y se quiere poder ofrecer una parte a otras agencias.

## Las dos apps

| | **Busmac (viaje)** — servicios | **Bus Coin** — juegos |
|---|---|---|
| Qué es | Lo que sirve para el viaje en sí | El mundo de entretenimiento |
| Contenido | Código de viaje, comercios y descuentos, premios del viaje, vidriera, cartelera/recorrido, radio, kiosco, farmacia, coordinador, buzón, sorteo, promos de la agencia, lista de pasajeros, panel de organizador/agencia, superadmin | Avatar, plaza y sus paradas (estación, shopping de juegos, arcade, mesas, eventos, boliche, Selección), 11 videojuegos, juegos de mente, de cartas y de grupo, Bus-queda (escape), Padelbus, ranking, copa, citas |
| Marca | Una copia por agencia (`js/marca.js`): Busmac, Toscano | Una sola, neutra; toma el logo/nombre de la agencia del viaje |
| Toscano | Mantiene solo esta copia | Usa la de Bus Coin |

Decisiones: las casitas de servicio salen de la plaza (la plaza queda de juegos y social, con un acceso directo a la app del viaje). Nombres: Busmac (viaje) + Bus Coin (juegos).

## Cómo se comparten los datos

- Mismo proyecto de Firebase para las dos (`bus-coin-fb008`), así que monedas, avatar, ranking y viajes ya están compartidos. No hay migración.
- El código de viaje y el perfil (nombre, asiento, emoji, mayor de 12) viajan de una app a la otra por el link (`?viaje=CODIGO&...`), porque son sitios distintos y no comparten `localStorage`. `leerCodigoViajeDeURL()` ya lee `?viaje=`.

## Lo que encontré en el código (por qué no es solo "sacar pantallas")

- `app.js` (55 KB) es un concentrador: conoce a TODOS los juegos (el `showView` tiene ~40 `if(name===...) iniciarX()`), arma el home, el ranking, el onboarding y los paneles de administración. Hay que volverlo "una tabla de vistas" para poder cargar cada cosa por separado.
- Varios archivos de juegos son en realidad librerías compartidas disfrazadas:
  - `arcade.js` (líneas 10-112): `arcOtorgarMonedas`, `arcRR`, `arcLogo`, `arcEmoji`, `arcCartel`, `marcaCorta`, `logoAncho`, `ARC_LOGO`… los usan la plaza, Padelbus, el escape, el solitario, las categorías, etc.
  - `trivia.js`: `barajar`, `barajarOpciones` (los usan 14 archivos).
  - `bingo.js`: `bingoEsOrganizador`, `bingoPinHTML`, la constante del PIN (los usan cuento, dibujar, impostor, tienda, tutti frutti, trivia en vivo).
  - `plaza.js`/`mundo.js`: el estado `plz` y `PLZ`, que usan boliche, selección, micro, feria, padel…
- Todo es JavaScript clásico con variables globales (79 archivos, 1,6 MB sin minificar), cargados todos al abrir.

## Etapas (cada una se prueba y se sube sola; la app actual no se corta)

1. **Núcleo compartido.** Mover los ayudantes de arriba a un `js/nucleo.js` sin cambiar nada de comportamiento. Con tests de las 50 pantallas.
2. **Tabla de vistas + carga por partes.** `showView` pasa a leer una tabla `vista → módulo → función de inicio`; los scripts de cada juego se descargan al entrar. Mide el tamaño inicial antes y después.
3. **Dos puertas de entrada.** `index.html` (Bus Coin) y `viaje.html` (servicios) sobre el mismo código, cada uno con su lista de módulos y su `manifest`. Script de armado que produce una carpeta por app.
4. **Home y plaza de cada app.** Home simple de servicios; Bus Coin con la plaza sin las casitas de servicio y con acceso directo a la app del viaje. Enlaces de ida y vuelta con el código de viaje.
5. **Marca por viaje en Bus Coin.** Logo y nombre de la agencia leídos de `agencias/{id}` según el viaje.
6. **Despliegue.** Dónde se publica cada app (dominio/repos): lo decide Ale. Reglas de Firebase revisadas para las dos.

## Pendiente de decidir (de Ale)

- Dónde se publica la app de servicios de Busmac (otro subdominio de busmac.com.ar, o una ruta del mismo sitio).

## Avance

**Etapa 1 — hecha (2026-10-26).** Se creó `js/nucleo.js` (monedas por partida con tope diario, utilidades de canvas/logo, `barajar`, rol de organizador con PIN) y `js/naipes.js` (mazo español y palos). 33 símbolos se movieron sin perder ni duplicar ninguno (comparado antes/después). Probado: las 50 pantallas abren sin errores, los tests de arcade, escape, padel, mundo y copa pasan.

Lo que queda atado entre archivos (para la etapa 2: serán dependencias declaradas entre módulos):
- `triviaVivo.js` y `copa.js` usan `TEMAS`/`responder` de `trivia.js` → dependen del módulo trivia.
- `impostor.js` y `dibujar.js` usan `palabras.js`; `cuento`, `dibujar` e `impostor` usan `grupos.js`.
- `truco.js` usa `copa.js`; `copa.js` usa `cursos.js` y `puntos.js`.
- El mundo (plaza, sectores, feria, mundo, estacion, micro, mesas, tunel, boliche, seleccion, cartitas, padel, escape) es un bloque que se carga junto; `plaza3d` y `plaza3dmod` solo al tocar 🧊.
- `app.js` sigue sabiendo de todos los juegos (el `showView` con ~40 `if`): se vuelve tabla en la etapa 2.

**Etapa 2 — hecha (2026-10-26).** Carga por partes.
- `js/modulos.js` es ahora la tabla de verdad: 36 módulos (`MODULOS`), qué módulo necesita cada pantalla (`MODULOS_VISTAS`) y las funciones de entrada que se pueden llamar antes de cargar (`MODULOS_FUNCIONES`). Los `?v=N` de los archivos perezosos se suben ahí, no en `index.html`.
- `showView` (app.js) ahora baja el módulo de la pantalla si hace falta y recién entonces la abre (si ya estaba, abre al instante como antes). El `if(name===…)` de ~40 líneas pasó a la tabla `INICIAR_VISTA`.
- Se carga siempre (22 archivos, 193 KB, antes 79 archivos y ~1,6 MB): firebase, marca, agencias, superadmin, iconos, escenas, sonido, nucleo, modulos, azar, grupos, ruleta, avatar, avatarcuerpo, mundo, puntos, cursos, pwa, naipes, analytics, listaPasajeros, app.
- En segundo plano, ya mostrado el inicio: Vidriera y Copa (con lo que necesitan), para que sus tarjetas y avisos aparezcan solos. Con ahorro de datos o 2G no se hace.
- El 3D de la plaza se baja recién al tocar 🧊 (o al entrar a la plaza si estaba prendido). La tarjeta "Subite al micro" del inicio pasó a `mundo.js`.
- Panel del organizador: `renderAdminViajes` baja el módulo `admin` (pedidos, comercios, vidriera, copa y plaza).
- Probado: las 50 pantallas, cada una en una página nueva y sola, sin errores; botones de administración; QR de comercio (`?canjear=1`) y cupón (`?cupon=1`); 3D por botón y por preferencia guardada.
- Para sumar un juego nuevo: crear el archivo, agregarlo a un módulo en `MODULOS`, la vista en `MODULOS_VISTAS`, y su arranque en `INICIAR_VISTA` (app.js).
