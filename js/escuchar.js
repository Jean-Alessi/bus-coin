// "Escuchar": para quien prefiere algo simple antes que jugar (pensado para
// pasajeros mayores, pero abierto a cualquiera). Nada de puntos, cronómetro
// ni competencia. Dos opciones: audiolibros clásicos de dominio público
// (LibriVox / Internet Archive) o una playlist de música tranquila.
//
// No hay contenido propio alojado acá: cada título abre su fuente gratuita
// real en una pestaña nueva. Los links fueron chequeados uno por uno antes
// de ponerlos (no vale inventar un link que después no funciona).

const ESCUCHAR_MUSICA_URL = 'https://www.youtube.com/results?search_query=m%C3%BAsica+relajante+instrumental+para+viajar';

const ESCUCHAR_AUDIOLIBROS = [
  {
    categoria: '📜 Historia y poesía argentina',
    items: [
      { titulo: 'Martín Fierro', autor: 'José Hernández · poema gauchesco completo', url: 'https://librivox.org/el-gaucho-martin-fierro-by-jose-hernandez/' },
      { titulo: 'Facundo', autor: 'Domingo F. Sarmiento · historia argentina', url: 'https://www.youtube.com/playlist?list=PLY0dyslFDAvPvJ1QZI3EfacEkrKFOtnim' },
      { titulo: 'Poemas de Alfonsina Storni', autor: '28 poemas, narrados por varias voces', url: 'https://archive.org/details/la.loba-alfonsina.storni-voz.luisa.pastor.martinez' },
      { titulo: 'Cuentos de la selva para los niños', autor: 'Horacio Quiroga · 8 cuentos narrados', url: 'https://librivox.org/cuentos-de-la-selva-para-los-ninos-by-horacio-quiroga/' },
    ],
  },
  {
    categoria: '🔍 Policial y misterio',
    items: [
      { titulo: 'Aventuras de Sherlock Holmes', autor: 'Arthur Conan Doyle', url: 'https://librivox.org/aventuras-de-sherlock-holmes-by-sir-arthur-conan-doyle/' },
      { titulo: 'El caso Leavenworth', autor: 'Anna Katharine Green', url: 'https://librivox.org/el-caso-leavenworth-by-anna-katharine-green/' },
      { titulo: 'Historias de Detectives', autor: 'Antología: Poe, Leroux, Baronesa Orczy y Mark Twain', url: 'https://librivox.org/historias-de-detectives/' },
    ],
  },
  {
    categoria: '📖 Novelas clásicas',
    items: [
      { titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes · primera parte', url: 'https://librivox.org/don-quijote-vol-1-by-miguel-de-cervantes-saavedra/' },
      { titulo: 'Crimen y castigo', autor: 'Fiódor Dostoievski', url: 'https://librivox.org/crimen-y-castigo-by-fyodor-dostoyevsky/' },
      { titulo: 'Fortunata y Jacinta', autor: 'Benito Pérez Galdós', url: 'https://librivox.org/?s=Fortunata+y+Jacinta' },
      { titulo: 'Cumbres Borrascosas', autor: 'Emily Brontë', url: 'https://librivox.org/cumbres-borrascosas-by-emily-bronte/' },
    ],
  },
  {
    categoria: '🚀 Aventura',
    items: [
      { titulo: '20.000 leguas de viaje submarino', autor: 'Julio Verne', url: 'https://librivox.org/20000-leguas-de-viaje-submarino-by-jules-verne/' },
      { titulo: 'La máquina exploradora del tiempo', autor: 'H.G. Wells', url: 'https://librivox.org/la-maquina-exploradora-del-tiempo-by-h-g-wells/' },
    ],
  },
];

function escucharAbrir(url){
  window.open(url, '_blank', 'noopener');
}

function iniciarEscuchar(){
  document.getElementById('escuchar-content').innerHTML = `
    <div class="hero-calma">
      <h2>🎧 Un ratito tranquilo</h2>
      <p>Sin puntos, sin reloj, sin nada que acertar. Elegí una opción; se abre en una pestaña aparte, así no perdés tu lugar en la app.</p>
    </div>

    <button class="opcion-grande" onclick="showView('audiolibros')">
      <span class="icono">📖</span>
      <div><h3>Audiolibros clásicos</h3><p>Cuentos y novelas ya narrados, gratis</p></div>
    </button>

    <button class="opcion-grande" onclick="escucharAbrir(ESCUCHAR_MUSICA_URL)">
      <span class="icono">🎵</span>
      <div><h3>Música tranquila</h3><p>Una lista de música relajada para el viaje</p></div>
    </button>`;
}

function renderAudiolibros(){
  const secciones = ESCUCHAR_AUDIOLIBROS.map(sec => `
    <div class="section-label">${sec.categoria}</div>
    ${sec.items.map(it => `
      <button class="fila-audio" onclick="escucharAbrir('${it.url}')">
        <span class="play">▶</span>
        <div class="txt"><h3>${it.titulo}</h3><p>${it.autor}</p></div>
      </button>`).join('')}
  `).join('');

  document.getElementById('audiolibros-content').innerHTML = `
    <div class="aviso-gratis">🔓 Todos gratis y de dominio público (LibriVox / Internet Archive)</div>
    ${secciones}`;
}
