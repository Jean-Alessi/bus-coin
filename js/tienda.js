// Catálogo de premios: se pagan solo con fichas ganadas jugando (nunca con
// plata), pensado para que quieran volver a viajar con Busmac.
const CATALOGO_PREMIOS = [
  { id: 'desc5', nombre: '5% de descuento en tu próximo viaje', costo: 500 },
  { id: 'gorra', nombre: 'Gorra Busmac', costo: 700 },
  { id: 'desc10', nombre: '10% de descuento en tu próximo viaje', costo: 900 },
  { id: 'remera', nombre: 'Remera Busmac', costo: 1200 },
];

let ultimoCanje = null;

// Premios del podio: no se canjean con fichas, se ganan por puesto en el
// Ranking final del viaje (se entregan cuando el organizador cierra el viaje
// y arranca uno nuevo con otro código). Editable acá según lo que ofrezca
// Busmac en cada viaje.
const PREMIOS_RANKING = [
  { puesto: 1, medalla: '🥇', premio: 'Viaje gratis', detalle: 'A elección, para el próximo viaje' },
  { puesto: 2, medalla: '🥈', premio: '50% de descuento', detalle: 'En el viaje que elijas' },
  { puesto: 3, medalla: '🥉', premio: 'Remera Busmac', detalle: '' },
  { puesto: 4, medalla: '🎖️', premio: 'Caja de Bon o Bon', detalle: 'Premio consuelo' },
];

function renderTienda(){
  const cont = document.getElementById('tienda-content');
  if(!cont) return;
  cont.innerHTML = `
    <p class="tienda-nota">Jugar es gratis. Ganás fichas acertando en Trivia, Acertijos y Buscá las diferencias (y sumando en el Bingo), y las canjeás acá por premios reales.</p>
    ${ultimoCanje ? `
      <div class="canje-resultado">
        <h3>¡Canjeaste ${ultimoCanje.nombre}!</h3>
        <p>Mostrale este código al organizador: <strong>${ultimoCanje.codigo}</strong></p>
      </div>` : ''}
    <div class="section-label">Premios del ranking final</div>
    <p class="tienda-nota" style="margin-top:-6px;">Al terminar el viaje, los primeros puestos del Ranking se llevan estos premios.</p>
    ${PREMIOS_RANKING.map(p => `
      <div class="pack pack-podio">
        <div class="info"><h3>${p.medalla} ${p.puesto}° puesto — ${p.premio}</h3><p>${p.detalle}</p></div>
      </div>`).join('')}
    <div class="section-label">Catálogo de premios</div>
    ${CATALOGO_PREMIOS.map(p => {
      const alcanza = alcanzanFichas(p.costo);
      return `<div class="pack">
        <div class="info"><h3>${p.nombre}</h3><p>${p.costo} fichas</p></div>
        <button class="buy" ${alcanza ? '' : 'disabled'} onclick="canjearPremio('${p.id}')">Canjear</button>
      </div>`;
    }).join('')}
    <div class="section-label">Con tus fichas también podés</div>
    <div class="card" style="cursor:default;">
      <div class="icon" data-icon="musica"></div>
      <div class="txt"><h3>Priorizar un tema en el DJ</h3><p>20 fichas por canción</p></div>
    </div>`;
}

function canjearPremio(id){
  const premio = CATALOGO_PREMIOS.find(p => p.id === id);
  if(!premio) return;
  if(!gastarFichas(premio.costo)){
    mostrarToast('Todavía no juntaste suficientes fichas para este premio');
    return;
  }
  const codigo = 'BUS-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  ultimoCanje = { nombre: premio.nombre, codigo };
  mostrarToast(`¡Canjeaste ${premio.nombre}!`);
  renderTienda();
}
