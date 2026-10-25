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
