// Premios del viaje: el organizador define hasta 4 premios para ese viaje
// puntual y, cuando quiere, habilita la elección. En orden de ranking
// (1° a 4°) cada uno va eligiendo el premio que quiera de los que van
// quedando; al último ya no le queda otra opción que el que sobró. Todo se
// sincroniza en Firebase para que cada pasajero vea su turno en su celular.

const PREMIOS_DEFAULT = ['Viaje gratis', '50% de descuento en tu próximo viaje', 'Remera Busmac', 'Caja de Bon o Bon'];

let premiosState = { lista: PREMIOS_DEFAULT.slice(), habilitado: false, orden: null, elecciones: {} };
let premiosListenersListos = false;

function premiosRef(){ return db.ref('salas/' + codigoViaje + '/premios'); }

function iniciarPremios(){
  if(premiosListenersListos){ renderPremiosViaje(); return; }
  premiosListenersListos = true;
  premiosRef().on('value', snap => {
    const val = snap.val() || {};
    premiosState = {
      lista: (val.lista && val.lista.length === 4) ? val.lista : PREMIOS_DEFAULT.slice(),
      habilitado: !!val.habilitado,
      orden: val.orden || null,
      elecciones: val.elecciones || {},
    };
    renderPremiosViaje();
  });
}

function guardarListaPremios(){
  const valores = [0, 1, 2, 3].map(i => {
    const el = document.getElementById('premio-input-' + i);
    const v = el ? el.value.trim() : '';
    return v || PREMIOS_DEFAULT[i];
  });
  premiosRef().child('lista').set(valores);
  mostrarToast('Premios guardados');
}

// Congela quiénes son el 1° a 4° puesto en este momento, para que el orden
// de elección no cambie aunque alguien siga sumando monedas mientras eligen.
// Lee el ranking directo de Firebase (no el caché local) para no quedarse
// con datos viejos si justo llegó un punto nuevo.
function habilitarEleccionPremios(){
  if(!bingoEsOrganizador()) return;
  rankingRefPuntos().once('value').then(snap => {
    const puntos = snap.val() || {};
    const orden = Object.keys(puntos)
      .filter(a => puntos[a])
      .sort((a, b) => (puntos[b].pts || 0) - (puntos[a].pts || 0))
      .slice(0, 4);
    if(!orden.length){
      mostrarToast('Todavía no hay nadie en el ranking');
      return;
    }
    premiosRef().update({ habilitado: true, orden });
  });
}

function elegirPremio(indexPremio){
  const turnoIndex = Object.keys(premiosState.elecciones).length;
  const turnoAsiento = premiosState.orden ? premiosState.orden[turnoIndex] : null;
  if(String(turnoAsiento) !== String(miAsiento)) return;
  if(premiosState.elecciones[String(miAsiento)] != null) return;
  premiosRef().child('elecciones').child(String(miAsiento)).set(indexPremio);
}

function renderPremiosViaje(){
  const cont = document.getElementById('tienda-content');
  if(!cont) return;

  const lista = premiosState.lista;
  const esOrganizador = bingoEsOrganizador();

  if(!premiosState.habilitado){
    const editorHTML = esOrganizador ? `
      <div class="section-label">Editá los premios de este viaje</div>
      ${lista.map((p, i) => `<input type="text" id="premio-input-${i}" class="bingo-input-numero" style="width:100%;" value="${p.replace(/"/g, '&quot;')}">`).join('')}
      <button class="btn-ghost" onclick="guardarListaPremios()">Guardar premios</button>
      <button class="btn-primary" onclick="habilitarEleccionPremios()">Habilitar elección de premios</button>` : '';

    cont.innerHTML = `
      <p class="tienda-nota">Jugá y sumá monedas en Trivia, Acertijos y Bingo. Al terminar el viaje, del 1° al 4° puesto del ranking eligen premio en orden.</p>
      <div class="section-label">Premios de este viaje</div>
      ${lista.map(p => `<div class="pack pack-podio"><div class="info"><h3>${p}</h3></div></div>`).join('')}
      ${editorHTML}`;
    return;
  }

  const orden = premiosState.orden || [];
  const turnoIndex = Object.keys(premiosState.elecciones).length;
  const turnoAsiento = orden[turnoIndex];
  const elegidosIdx = new Set(Object.keys(premiosState.elecciones).map(a => premiosState.elecciones[a]));

  const filasHTML = orden.map((asiento, i) => {
    const nombre = (rankingPuntos[asiento] && rankingPuntos[asiento].nombre) || ('Asiento ' + asiento);
    const eligio = premiosState.elecciones[asiento];
    let estado;
    if(eligio != null) estado = `Eligió: ${lista[eligio]}`;
    else if(i === turnoIndex) estado = 'Eligiendo ahora...';
    else estado = 'Esperando su turno';
    return `<div class="bingo-roster-item ${eligio != null ? 'bingo-roster-listo' : ''}">
      <span>${MEDALLAS_RANKING[i] || (i + 1) + '°'} ${nombre}</span>
      <span class="bingo-roster-derecha"><span>${estado}</span></span>
    </div>`;
  }).join('');

  let miTurnoHTML = '';
  if(turnoAsiento != null && String(turnoAsiento) === String(miAsiento) && premiosState.elecciones[String(miAsiento)] == null){
    const disponibles = lista.map((p, i) => ({ p, i })).filter(o => !elegidosIdx.has(o.i));
    miTurnoHTML = `
      <div class="hero" style="margin-top:8px;">
        <h2>¡Te tocó elegir!</h2>
        <p>${disponibles.length === 1 ? 'Te queda el último premio disponible.' : 'Elegí el premio que quieras de los que quedan.'}</p>
      </div>
      ${disponibles.map(o => `<button class="btn-primary" style="margin-top:8px;" onclick="elegirPremio(${o.i})">${o.p}</button>`).join('')}`;
  }

  const terminado = Object.keys(premiosState.elecciones).length >= orden.length;

  cont.innerHTML = `
    <div class="section-label">Elección de premios</div>
    ${miTurnoHTML}
    <div class="bingo-roster">${filasHTML}</div>
    ${terminado ? '<p class="tienda-nota">Ya eligieron todos. ¡Felicitaciones a los ganadores!</p>' : ''}`;
}
