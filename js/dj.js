let dj = null;

const COSTO_PRIORIZAR = 20;

const CANCIONES_INICIALES = [
  { id: 1, titulo: 'Un Beso y una Flor', artista: 'Nino Bravo', votos: 8 },
  { id: 2, titulo: 'La Bestia Pop', artista: 'Bandalos Chinos', votos: 6 },
  { id: 3, titulo: 'Persiana Americana', artista: 'Soda Stereo', votos: 5 },
  { id: 4, titulo: 'Flor de Loto', artista: 'Bandalos Chinos', votos: 3 },
  { id: 5, titulo: 'Zamba Para Olvidar', artista: 'Mercedes Sosa', votos: 2 },
];

// Todo el grupo comparte la misma cola de temas en vivo: no hace falta
// elegir un asiento, cualquier celular puede votar o priorizar.
let djListener = null;

function djRefEstado(){ return db.ref(`salas/${codigoViaje}/dj/estado`); }

function djGuardar(){
  djRefEstado().set(dj);
}

function iniciarDJ(){
  if(djListener) return;
  djListener = djRefEstado().on('value', snap => {
    const data = snap.val();
    if(!data){
      dj = { canciones: CANCIONES_INICIALES.map(c => ({ ...c })) };
      djGuardar();
      return;
    }
    dj = data;
    renderDJ();
  });
}

function ordenarCanciones(){
  return dj.canciones.slice().sort((a, b) => b.votos - a.votos);
}

function votarCancion(id){
  const cancion = dj.canciones.find(c => c.id === id);
  if(cancion) cancion.votos++;
  djGuardar();
}

function priorizarCancion(id){
  const cancion = dj.canciones.find(c => c.id === id);
  if(!cancion) return;
  if(!gastarFichas(COSTO_PRIORIZAR)) return;
  const maxVotos = Math.max(...dj.canciones.map(c => c.votos));
  cancion.votos = maxVotos + 5;
  mostrarToast(`"${cancion.titulo}" ahora suena antes`);
  djGuardar();
}

function djItemHTML(cancion, esSonando){
  const alcanza = alcanzanFichas(COSTO_PRIORIZAR);
  return `
    <div class="dj-item ${esSonando ? 'dj-sonando' : ''}">
      <div class="icon">${icono('musica', 20)}</div>
      <div class="txt">
        <h3>${cancion.titulo}</h3>
        <p>${cancion.artista} — ${cancion.votos} votos</p>
      </div>
      <div class="dj-acciones">
        <button class="btn-votar" onclick="votarCancion(${cancion.id})">▲ Votar</button>
        <button class="btn-priorizar" ${alcanza ? '' : 'disabled'} onclick="priorizarCancion(${cancion.id})">Priorizar (${COSTO_PRIORIZAR})</button>
      </div>
    </div>`;
}

function renderDJ(){
  const container = document.getElementById('dj-content');
  if(!container || !dj) return;
  const [sonando, ...resto] = ordenarCanciones();
  container.innerHTML = `
    <div class="section-label">Sonando ahora</div>
    ${djItemHTML(sonando, true)}
    <div class="section-label">Siguen en la cola</div>
    ${resto.map(c => djItemHTML(c, false)).join('')}
  `;
}
