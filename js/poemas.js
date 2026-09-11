// "Poemas cortos": varios poetas, versos breves. Reproductor nativo del
// navegador, todo alojado adentro de la app (nada de abrir otra pestaña).
//
// Los audios están en /audio (bajados una sola vez): grabaciones de
// dominio público (LibriVox / Internet Archive), verificadas una por una
// antes de sumarlas. Se dejaron afuera a propósito autores que todavía
// tienen derechos vigentes (por ejemplo Mario Benedetti, fallecido en 2009:
// sus poemas van a seguir con derechos por muchas décadas más) — solo entran
// poetas cuya obra ya es legalmente libre.

const POEMAS_POR_AUTOR = [
  {
    autor: 'Alfonsina Storni',
    items: [
      { titulo: 'Voy a dormir', duracion: '0:51', url: 'audio/voy-a-dormir.mp3' },
      { titulo: 'Tú me quieres blanca', duracion: '1:50', url: 'audio/tu-me-quieres-blanca.mp3' },
      { titulo: 'La loba', duracion: '4:20', url: 'audio/la-loba.mp3' },
    ],
  },
  {
    autor: 'Federico García Lorca',
    items: [
      { titulo: 'Romance de la luna, luna', duracion: '2:21', url: 'audio/romance-de-la-luna.mp3' },
      { titulo: 'Romance sonámbulo', duracion: '3:29', url: 'audio/romance-sonambulo.mp3' },
      { titulo: 'La casada infiel', duracion: '2:19', url: 'audio/casada-infiel.mp3' },
    ],
  },
  {
    autor: 'Rubén Darío',
    items: [
      { titulo: 'A Roosevelt', duracion: '3:37', url: 'audio/a-roosevelt.mp3' },
    ],
  },
  {
    autor: 'Gustavo Adolfo Bécquer',
    items: [
      { titulo: 'Rimas (I a X)', duracion: '9:34', url: 'audio/rimas-becquer.mp3' },
    ],
  },
  {
    autor: 'César Vallejo',
    items: [
      { titulo: 'Los heraldos negros', duracion: '1:29', url: 'audio/heraldos-negros.mp3' },
      { titulo: 'El pan nuestro', duracion: '1:30', url: 'audio/el-pan-nuestro.mp3' },
      { titulo: 'Rosa blanca', duracion: '0:53', url: 'audio/rosa-blanca.mp3' },
    ],
  },
];

const POEMAS_TODO = POEMAS_POR_AUTOR.flatMap(sec => sec.items);

let poemasPistaActual = null;
let poemasAutoplay = false;

function iniciarPoemas(){
  poemasAutoplay = false;
  renderPoemas();
}

// Al volver a esta pantalla no arranca nada solo; tocar un poema sí lo
// arranca de una, porque ese toque ya es la interacción que el navegador
// pide para permitir el play.
function poemasElegir(url){
  const item = POEMAS_TODO.find(it => it.url === url);
  if(!item) return;
  poemasPistaActual = item;
  poemasAutoplay = true;
  renderPoemas();
}

function poemasFilaHTML(it){
  const activa = poemasPistaActual && poemasPistaActual.url === it.url;
  return `<button class="fila-audio ${activa ? 'fila-audio-activa' : ''}" onclick="poemasElegir('${it.url}')">
    <span class="play">${activa ? '🔊' : '▶'}</span>
    <div class="txt"><h3>${it.titulo}</h3><p>${it.duracion}</p></div>
  </button>`;
}

function renderPoemas(){
  const cont = document.getElementById('poemas-content');
  if(!cont) return;

  const reproductorHTML = poemasPistaActual ? `
    <div class="reproductor-fijo">
      <h3>${poemasPistaActual.titulo}</h3>
      <p>${poemasPistaActual.duracion}</p>
      <audio id="poemas-audio" controls ${poemasAutoplay ? 'autoplay' : ''} src="${poemasPistaActual.url}"></audio>
    </div>` : `
    <div class="hero-calma">
      <h2>📜 Poemas cortos</h2>
      <p>Varios poetas, versos breves. Tocá uno para escucharlo, todo adentro de la app.</p>
    </div>`;

  const listaHTML = POEMAS_POR_AUTOR.map(sec => `
    <div class="section-label">${sec.autor}</div>
    ${sec.items.map(poemasFilaHTML).join('')}`).join('');

  cont.innerHTML = `${reproductorHTML}${listaHTML}`;
}
