// "Instalá la app": ofrece agregar Bus Coin a la pantalla de inicio del
// celular. En Android/Chrome se puede disparar el instalador nativo
// (evento beforeinstallprompt, que exige un service worker registrado);
// en iPhone (Safari) esa API no existe, así que se muestran los pasos
// manuales (compartir > agregar a inicio). Se puede cerrar y no vuelve a
// insistir (se guarda en este celular).

let pwaDeferredPrompt = null;
let pwaPromptListo = false;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  pwaDeferredPrompt = e;
  pwaPromptListo = true;
  if(document.getElementById('view-home')?.classList.contains('active')) renderHome();
});

window.addEventListener('appinstalled', () => {
  pwaDeferredPrompt = null;
  localStorage.setItem('pwa-instalar-oculto', 'si');
});

if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// App de tienda (Google Play via TWA): Android abre la TWA con un referrer
// "android-app://..." -- se recuerda en este celular porque las navegaciones
// internas lo pierden. En esa versión no se ofrece "Instalá la app" (ya está
// instalada) ni se muestra el Panel general del dueño.
function esAppDeTienda(){
  try {
    if(document.referrer && document.referrer.indexOf('android-app://') === 0) localStorage.setItem('modo-tienda', 'si');
    if(new URLSearchParams(location.search).get('origen') === 'tienda') localStorage.setItem('modo-tienda', 'si');
    return localStorage.getItem('modo-tienda') === 'si' || !!window.Capacitor;
  } catch(e){ return !!window.Capacitor; }
}
if(esAppDeTienda()) document.documentElement.classList.add('modo-tienda');

function pwaYaInstalada(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function pwaEsIOS(){
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function pwaOcultarAviso(){
  localStorage.setItem('pwa-instalar-oculto', 'si');
  renderHome();
}

function pwaInstalar(){
  if(!pwaDeferredPrompt) return;
  pwaDeferredPrompt.prompt();
  pwaDeferredPrompt.userChoice.finally(() => { pwaDeferredPrompt = null; });
}

function pwaInstalarHTML(){
  if(esAppDeTienda() || pwaYaInstalada() || localStorage.getItem('pwa-instalar-oculto') === 'si') return '';

  if(pwaPromptListo){
    return `
      <div class="card" onclick="pwaInstalar()">
        <div class="icon">📲</div>
        <div class="txt"><h3>Instalá Bus Coin</h3><p>Tocá para sumarla a tu pantalla de inicio</p></div>
      </div>
      <p class="link-chico" onclick="pwaOcultarAviso()">Ahora no</p>`;
  }

  if(pwaEsIOS()){
    return `
      <div class="card">
        <div class="icon">📲</div>
        <div class="txt"><h3>Instalá Bus Coin</h3><p>Tocá compartir (⬆️) y elegí "Agregar a inicio"</p></div>
      </div>
      <p class="link-chico" onclick="pwaOcultarAviso()">Ahora no</p>`;
  }

  // Chrome/Android no siempre dispara "beforeinstallprompt" enseguida (pide
  // algo de interacción previa con el sitio, que en un viaje de micro puede
  // no llegar a darse), así que mientras tanto se deja igual el paso a paso
  // manual — el menú del navegador siempre puede instalar si la app cumple
  // los requisitos, aunque el cartel automático no haya aparecido.
  return `
    <div class="card">
      <div class="icon">📲</div>
      <div class="txt"><h3>Instalá Bus Coin</h3><p>Menú ⋮ del navegador → "Instalar aplicación" (o "Agregar a pantalla de inicio")</p></div>
    </div>
    <p class="link-chico" onclick="pwaOcultarAviso()">Ahora no</p>`;
}
