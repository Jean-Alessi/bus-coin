// Configuración de la empresa que usa esta copia de Bus Coin.
//
// Para dar de alta un cliente nuevo, este es EL archivo a tocar para todo
// lo que tiene que ver con su nombre y su PIN (además de reemplazar
// logo-empresa.png por el logo del cliente, y js/firebase-config.js por
// los datos de su propio proyecto de Firebase — ver ONBOARDING.md).
const MARCA = {
  // Como aparece en la barra de arriba, al lado del logo.
  marcaPrincipal: 'busmac',
  marcaSecundaria: 'viajes y turismo',

  // <title> de la pestaña del navegador.
  nombreCompleto: 'Busmac Viajes y Turismo',

  // Mensaje de bienvenida en la pantalla de "código de viaje".
  bienvenida: '¡Bienvenido a bordo! 🚌 Arrancamos esta nueva experiencia con Busmac',

  // PIN de 4 dígitos para reclamar el rol de organizador. Es una traba
  // simple, no seguridad real (el código corre en el navegador de
  // cualquiera) — alcanza para que ningún pasajero lo toque sin querer.
  // Nunca reusar el PIN de otro cliente.
  pinOrganizador: '2314',
};

// Aplica el nombre/mensaje de marca a los elementos ya presentes en el
// HTML. Este script se carga al final del body, así que el DOM ya existe
// y no hace falta esperar a DOMContentLoaded.
document.title = MARCA.nombreCompleto;
const elMarcaStatusbar = document.getElementById('marca-statusbar');
if(elMarcaStatusbar) elMarcaStatusbar.innerHTML = `${MARCA.marcaPrincipal} <em>${MARCA.marcaSecundaria}</em>`;
const elMarcaBienvenida = document.getElementById('marca-bienvenida');
if(elMarcaBienvenida) elMarcaBienvenida.textContent = MARCA.bienvenida;
