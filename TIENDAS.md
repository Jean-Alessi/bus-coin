# Publicar Bus Coin en Google Play (y después App Store)

## Ya está listo en el código
- Manifest con íconos 192, 512 y maskable.
- Modo tienda: si la app se abre desde Google Play (TWA) o con `?origen=tienda`, se oculta el cartel "Instalá Bus Coin" y el botón Panel general.
- `privacidad.html` y `bases-premios.html`, enlazadas en la pantalla de entrada.
- `.nojekyll` y `.well-known/assetlinks.json` (plantilla).

## Falta completar antes de subir (marcado como COMPLETAR)
1. (Hecho) Correo de contacto y localidad en las páginas legales.
2. `assetlinks.json`: reemplazar `package_name` si cambia, y poner la huella SHA-256 que muestra Play Console (Integridad de la app → firma de la app).
3. Verificar con asesoría legal las bases de premios (en Argentina, si el premio dependiera del azar puede requerir autorización; acá se asigna por ranking de habilidad).

## Pasos
1. **Cuenta de Google Play** (USD 25, pago único). Cuenta personal: exige prueba cerrada con al menos 12 testers durante 14 días seguidos antes de producción.
2. **Empaquetar la web como app Android (TWA)** con PWABuilder (pwabuilder.com) o Bubblewrap, con la URL https://buscoin.busmac.com.ar y el package name elegido. Genera un archivo `.aab`.
3. **Prueba cerrada**: subir el `.aab`, sumar 12 testers y mantenerlo 14 días.
4. **Ficha de la tienda**: ver textos abajo, más ícono 512, gráfico 1024x500 y capturas de teléfono (mínimo 2).
5. **Formulario de seguridad de datos**: datos recopilados = nombre/apodo, actividad en la app; sin ubicación; no se venden a terceros; se pueden pedir borrar.
6. **Clasificación de contenido**: sin violencia ni apuestas con dinero. Hay premios por ranking.
7. **Producción**.

## Textos de la ficha
**Nombre:** Bus Coin
**Descripción corta (80 caracteres):** Juegos y desafíos con tu grupo durante el viaje en micro.
**Descripción larga:**
Bus Coin convierte las horas de viaje en micro en un momento divertido. Ingresá el código que te da el organizador y jugá con el resto de los pasajeros.

- Más de 10 juegos: Truco, Escoba, Chinchón, trivia, bingo, sudoku, ahorcado y más.
- Ranking del grupo en tiempo real.
- Ruleta del día para ganar monedas.
- Premios del viaje para los mejores del ranking.
- Ofertas de comercios del destino.

Participar es gratis. Necesitás el código de tu viaje, que te da la agencia organizadora.

## Más adelante: App Store (iPhone)
Apple pide una cuenta de desarrollador (USD 99 por año) y no acepta una web simple empaquetada: hay que envolverla en una app nativa (Capacitor) con alguna función propia, como notificaciones. Conviene hacerlo después de Google Play.
