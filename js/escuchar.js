// "Escuchar": audiolibros y música cortos, para quien prefiere algo simple
// antes que jugar (pensado para pasajeros mayores, pero abierto a
// cualquiera). Todo se reproduce ADENTRO de la app con el reproductor
// nativo del navegador — nada de abrir YouTube o LibriVox aparte, porque
// eso ya lo puede hacer cualquiera sin la app.
//
// Los audios están guardados en /audio (bajados una sola vez, no se
// generan ni se piden a ningún lado en vivo): poemas y cuentos cortos de
// dominio público (LibriVox / Internet Archive) y música instrumental con
// licencia CC0. Se eligieron piezas cortas a propósito para no hacer
// pesada la app — nada de novelas enteras de varias horas.

const ESCUCHAR_MUSICA = [
  { titulo: 'Horizon Flare', autor: 'Instrumental tranquilo (CC0) · 1:42', url: 'audio/horizon-flare.mp3' },
  { titulo: 'Campo de girasoles', autor: 'Instrumental tranquilo (CC0) · 1:58', url: 'audio/campo-de-girasoles.mp3' },
];

const ESCUCHAR_AUDIOLIBROS = [
  {
    categoria: '📜 Poesía argentina',
    items: [
      { titulo: 'Voy a dormir', autor: 'Alfonsina Storni · 0:51', url: 'audio/voy-a-dormir.mp3' },
      { titulo: 'Tú me quieres blanca', autor: 'Alfonsina Storni · 1:50', url: 'audio/tu-me-quieres-blanca.mp3' },
      { titulo: 'La loba', autor: 'Alfonsina Storni · 4:20', url: 'audio/la-loba.mp3' },
    ],
  },
  {
    categoria: '🔍 Policial y misterio',
    items: [
      { titulo: 'La desaparición de Honorato Subrac', autor: 'Guillaume Apollinaire · 10:35', url: 'audio/honorato-subrac.mp3' },
    ],
  },
  {
    categoria: '📖 Cuentos de la selva',
    items: [
      { titulo: 'Las medias de los flamencos', autor: 'Horacio Quiroga · 10:47', url: 'audio/medias-de-los-flamencos.mp3' },
      { titulo: 'La tortuga gigante', autor: 'Horacio Quiroga · 11:27', url: 'audio/tortuga-gigante.mp3' },
    ],
  },
];

const ESCUCHAR_TODO = ESCUCHAR_MUSICA.concat(ESCUCHAR_AUDIOLIBROS.flatMap(sec => sec.items));

let escucharPistaActual = null;
let escucharAutoplay = false;

function iniciarEscuchar(){
  escucharAutoplay = false;
  renderEscuchar();
}

// Al volver a esta pantalla no arranca solo nada (nadie quiere un audio a
// los gritos de sorpresa); tocar una pista sí la arranca de una, porque ese
// toque ya es la interacción que el navegador pide para permitir el play.
function escucharElegir(url){
  const item = ESCUCHAR_TODO.find(it => it.url === url);
  if(!item) return;
  escucharPistaActual = item;
  escucharAutoplay = true;
  renderEscuchar();
}

function escucharFilaHTML(it){
  const activa = escucharPistaActual && escucharPistaActual.url === it.url;
  return `<button class="fila-audio ${activa ? 'fila-audio-activa' : ''}" onclick="escucharElegir('${it.url}')">
    <span class="play">${activa ? '🔊' : '▶'}</span>
    <div class="txt"><h3>${it.titulo}</h3><p>${it.autor}</p></div>
  </button>`;
}

function renderEscuchar(){
  const cont = document.getElementById('escuchar-content');
  if(!cont) return;

  const reproductorHTML = escucharPistaActual ? `
    <div class="reproductor-fijo">
      <h3>${escucharPistaActual.titulo}</h3>
      <p>${escucharPistaActual.autor}</p>
      <audio id="escuchar-audio" controls ${escucharAutoplay ? 'autoplay' : ''} src="${escucharPistaActual.url}"></audio>
    </div>` : `
    <div class="hero-calma">
      <h2>🎧 Un ratito tranquilo</h2>
      <p>Sin puntos, sin reloj, sin nada que acertar. Tocá algo de la lista para escucharlo, todo adentro de la app.</p>
    </div>`;

  const musicaHTML = `
    <div class="section-label">🎵 Música tranquila</div>
    ${ESCUCHAR_MUSICA.map(escucharFilaHTML).join('')}`;

  const audiolibrosHTML = ESCUCHAR_AUDIOLIBROS.map(sec => `
    <div class="section-label">${sec.categoria}</div>
    ${sec.items.map(escucharFilaHTML).join('')}`).join('');

  cont.innerHTML = `${reproductorHTML}${musicaHTML}${audiolibrosHTML}`;
}
