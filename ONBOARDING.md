# Onboarding de un cliente nuevo (empresa de micros)

Bus Coin se vende como producto (queda "Bus Coin" como marca visible), pero
cada cliente tiene su **propia base de datos y su propio despliegue** —
esto es lo que garantiza que los viajes/pasajeros de una empresa nunca se
mezclen ni queden accesibles desde el config de otra. En la práctica, dar
de alta un cliente nuevo es: clonar este repo, cambiar lo de abajo, y
desplegar en su propio dominio.

## 1. Firebase (aislamiento de datos — hacer esto primero)

1. Crear un proyecto nuevo en https://console.firebase.google.com (uno por
   cliente, nunca reusar el de otro).
2. Activar **Realtime Database** en ese proyecto.
3. Pegar las reglas de este mismo repo (`database.rules.json`) en
   Firebase Console → Realtime Database → Reglas → Publicar.
4. Ir a Configuración del proyecto → tus apps → agregar app Web → copiar el
   objeto `firebaseConfig` que te da.
5. Pegar ese objeto completo en **`js/firebase-config.js`**, reemplazando
   el que está (son los datos del proyecto de Busmac, no sirven para
   otro cliente).

## 2. PIN del organizador

- Archivo: **`js/bingo.js`**, línea con `const BINGO_PIN_ORGANIZADOR`.
- Poner un PIN de 4 dígitos distinto para este cliente (nunca reusar el de
  otro cliente, aunque ahora cada uno ya tiene su propia base de datos:
  es la clave que usa el organizador de esa empresa para administrar sus
  viajes, cargar premios y ver el panel de admin).

## 3. Marca del cliente (qué cambiar, archivo por archivo)

El ícono "B" de Bus Coin (`icons/icon-192.png` y el resto de `icons/`)
**se queda igual siempre** — es el ícono del producto, no de la empresa
cliente. Lo que sí cambia es el logo y el nombre de la empresa que opera
ese viaje:

- **`logo-empresa.png`** — reemplazar el archivo por el logo de la nueva
  empresa (mismo nombre de archivo, para no tener que tocar código).
- **`index.html`**:
  - `<title>` (línea ~6): nombre de la empresa.
  - `<span class="statusbar-brand">` (línea ~21): texto que aparece al
    lado del logo en la barra de arriba.
  - Texto de bienvenida en `view-codigo-viaje` (línea ~27): "Bienvenido a
    esta nueva experiencia con [Empresa]".
- **`manifest.json`**: `"name"` y `"short_name"` si el cliente quiere ver
  otro nombre al instalar la PWA (por defecto dice "Bus Coin", se puede
  dejar así si el cliente no pide lo contrario).
- **`CNAME`**: dominio propio del cliente, si va a tener uno (o se puede
  quedar en el subdominio que dé GitHub Pages / Firebase Hosting).

## 4. Contenido de los juegos (revisar, no siempre hay que tocarlo)

La mayoría del contenido (trivia, sopa de letras, cartas, etc.) es
genérico y sirve para cualquier cliente sin cambios. Lo único puntual a
revisar caso por caso:

- `js/tienda.js` → `PREMIOS_DEFAULT`: son solo textos de ejemplo
  ("Ej: ...") en el campo donde el organizador carga sus premios, no hace
  falta tocarlos.
- Si el cliente pide contenido específico de su empresa/región (ej. otros
  destinos en la Sopa de letras), se arma aparte — no es parte del
  onboarding estándar.

## 5. Desplegar

- Mismo mecanismo que ya usa Busmac: sitio estático (GitHub Pages u otro
  hosting estático), sin backend propio — todo el estado en vivo vive en
  el Firebase Realtime Database de ese cliente.
- Recordar bumpear los `?v=N` de `index.html` si se toca algo del código
  compartido, para que no quede cacheado en los celulares.

## 6. Legal / comercial (fuera del código)

- Esto no lo resuelve el código: hace falta un acuerdo de servicio simple
  con cada cliente (qué incluye, precio, quién es responsable de qué con
  los datos de sus pasajeros). Recomendado pasarlo por un abogado antes de
  firmarlo — puedo ayudar a armar un primer borrador si querés, pero no
  reemplaza la revisión legal real.
