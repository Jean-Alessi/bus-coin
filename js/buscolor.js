// BusColor: nuestro propio juego de cartas de colores, para 2 a 6 jugadores.
// Mismo espíritu que el clásico juego de cartas de colores (números 0-9,
// saltar turno, cambiar el sentido, +2, comodín y comodín +4) pero con
// nombre y mazo propios de Busmac. El dorso de la carta lleva el logo B,
// igual que en Escoba/Chinchón/Truco. Usa el mismo sistema de "mesas" que
// esos juegos: varias mesas pueden convivir dentro del mismo código de viaje.
//
// Simplificaciones a propósito, para no complicar de más: no hay que "decir"
// la última carta (la app avisa sola y así nadie puede hacer trampa ni
// discutir), y los +2/+4 no se acumulan entre sí (el que le toca, roba y
// pierde el turno, sin poder pasarle la carga al siguiente).

const BUSCOLOR_COLORES = ['rojo', 'amarillo', 'verde', 'azul'];
const BUSCOLOR_COLOR_HEX = { rojo: '#C22F2F', amarillo: '#E3A916', verde: '#2A8A4A', azul: '#2258A8' };
const BUSCOLOR_COLOR_NOMBRE = { rojo: 'Rojo', amarillo: 'Amarillo', verde: 'Verde', azul: 'Azul' };

function buscolorCrearMazo(){
  const mazo = [];
  BUSCOLOR_COLORES.forEach(color => {
    mazo.push({ color, tipo: 'numero', numero: 0 });
    for(let n = 1; n <= 9; n++){
      mazo.push({ color, tipo: 'numero', numero: n });
      mazo.push({ color, tipo: 'numero', numero: n });
    }
    ['saltar', 'reversa', '+2'].forEach(tipo => {
      mazo.push({ color, tipo });
      mazo.push({ color, tipo });
    });
  });
  for(let i = 0; i < 4; i++){
    mazo.push({ color: null, tipo: 'comodin' });
    mazo.push({ color: null, tipo: 'comodin+4' });
  }
  return barajar(mazo);
}

// Reparte 7 cartas a cada jugador y da vuelta la primera del descarte. Si esa
// primera carta es un comodín, se vuelve a barajar (así el color inicial de
// la mesa siempre está definido).
function buscolorRepartirMano(jugadores){
  let mazo = buscolorCrearMazo();
  const mano = {};
  jugadores.forEach(a => { mano[a] = mazo.splice(0, 7); });
  let primera = mazo.pop();
  while(!primera.color){
    mazo = barajar(mazo.concat([primera]));
    primera = mazo.pop();
  }
  return {
    mano, mazo, descarte: [primera],
    colorActual: primera.color, tipoActual: primera.tipo,
    numeroActual: primera.tipo === 'numero' ? primera.numero : null,
  };
}

let buscolorMesas = {};
let buscolorMesaIdActual = null;
let buscolorCapacidadElegida = 2;
let buscolorEligiendoIndice = null;

function buscolorRefMesas(){ return db.ref(`salas/${codigoViaje}/buscolor/mesas`); }

let buscolorListenersListos = false;

function iniciarBuscolor(){
  if(!buscolorListenersListos){
    buscolorListenersListos = true;
    buscolorRefMesas().on('value', snap => {
      buscolorMesas = snap.val() || {};
      if(buscolorMesaIdActual) buscolorRevisarUltimaCarta(buscolorMesas[buscolorMesaIdActual]);
      renderBuscolor();
    });
  } else {
    renderBuscolor();
  }
}

function buscolorMesaActual(){
  return buscolorMesaIdActual ? buscolorMesas[buscolorMesaIdActual] : null;
}

function buscolorElegirCapacidad(n){
  buscolorCapacidadElegida = n;
  renderBuscolor();
}

function buscolorCrearMesa(){
  if(!miAsiento) return;
  const ref = buscolorRefMesas().push();
  ref.set({
    jugadores: [String(miAsiento)],
    nombres: { [miAsiento]: miNombre },
    capacidad: buscolorCapacidadElegida,
    fase: 'esperando',
  });
  buscolorMesaIdActual = ref.key;
}

function buscolorUnirseAMesa(mesaId){
  if(!miAsiento) return;
  const mesa = buscolorMesas[mesaId];
  if(!mesa || mesa.fase !== 'esperando' || mesa.jugadores.includes(String(miAsiento)) || mesa.jugadores.length >= mesa.capacidad) return;
  const jugadores = mesa.jugadores.concat([String(miAsiento)]);
  const nombres = Object.assign({}, mesa.nombres, { [miAsiento]: miNombre });
  const updates = { jugadores, nombres };

  if(jugadores.length === mesa.capacidad){
    const rep = buscolorRepartirMano(jugadores);
    Object.assign(updates, rep, { sentido: 1, turno: jugadores[0], robado: false, fase: 'jugando' });
  }
  buscolorRefMesas().child(mesaId).update(updates);
  buscolorMesaIdActual = mesaId;
}

function buscolorVolverAlLobby(){
  buscolorMesaIdActual = null;
  buscolorEligiendoIndice = null;
  renderBuscolor();
}

function buscolorTerminarMesa(mesaId){
  buscolorRefMesas().child(mesaId).remove();
  if(buscolorMesaIdActual === mesaId) buscolorVolverAlLobby();
}

function buscolorSiguienteAsiento(mesa, asiento, sentido){
  const idx = mesa.jugadores.indexOf(String(asiento));
  const n = mesa.jugadores.length;
  return mesa.jugadores[(idx + sentido + n) % n];
}

function buscolorPuedeJugarCarta(carta, mesa){
  if(!carta.color) return true;
  if(carta.color === mesa.colorActual) return true;
  if(carta.tipo !== 'numero' && carta.tipo === mesa.tipoActual) return true;
  if(carta.tipo === 'numero' && mesa.tipoActual === 'numero' && carta.numero === mesa.numeroActual) return true;
  return false;
}

// Saca una carta del mazo. Si el mazo se queda vacío, recicla el descarte
// (menos la carta de arriba, que se queda ahí) barajándolo como mazo nuevo.
function buscolorRobarUnaCarta(mazo, descarte){
  if(mazo.length){
    const nuevoMazo = mazo.slice();
    const carta = nuevoMazo.pop();
    return { carta, mazo: nuevoMazo, descarte };
  }
  if(descarte.length > 1){
    const tope = descarte[descarte.length - 1];
    const reciclado = barajar(descarte.slice(0, -1));
    const carta = reciclado.pop();
    return { carta, mazo: reciclado, descarte: [tope] };
  }
  return { carta: null, mazo: [], descarte };
}

function buscolorCalcularSiguienteTurno(mesa, jugadorQueJugo, carta){
  let sentido = mesa.sentido || 1;
  let saltos = 1;
  let jugadorPenalizado = null;
  let cartasPenalizado = 0;
  if(carta.tipo === 'reversa'){
    if(mesa.jugadores.length === 2){ saltos = 2; }
    else { sentido = -sentido; }
  } else if(carta.tipo === 'saltar'){
    saltos = 2;
  } else if(carta.tipo === '+2'){
    saltos = 2; jugadorPenalizado = buscolorSiguienteAsiento(mesa, jugadorQueJugo, sentido); cartasPenalizado = 2;
  } else if(carta.tipo === 'comodin+4'){
    saltos = 2; jugadorPenalizado = buscolorSiguienteAsiento(mesa, jugadorQueJugo, sentido); cartasPenalizado = 4;
  }
  let asiento = jugadorQueJugo;
  for(let i = 0; i < saltos; i++) asiento = buscolorSiguienteAsiento(mesa, asiento, sentido);
  return { sentido, siguienteTurno: asiento, jugadorPenalizado, cartasPenalizado };
}

function buscolorLevantar(){
  const mesa = buscolorMesaActual();
  if(!mesa || mesa.fase !== 'jugando' || String(mesa.turno) !== String(miAsiento) || mesa.robado) return;
  const r = buscolorRobarUnaCarta((mesa.mazo || []).slice(), (mesa.descarte || []).slice());
  if(!r.carta) return;
  const mano = (mesa.mano[String(miAsiento)] || []).concat([r.carta]);
  buscolorRefMesas().child(buscolorMesaIdActual).update({
    mazo: r.mazo, descarte: r.descarte, [`mano/${miAsiento}`]: mano, robado: true,
  });
}

function buscolorPasarTurno(){
  const mesa = buscolorMesaActual();
  if(!mesa || mesa.fase !== 'jugando' || String(mesa.turno) !== String(miAsiento) || !mesa.robado) return;
  const siguiente = buscolorSiguienteAsiento(mesa, String(miAsiento), mesa.sentido || 1);
  buscolorRefMesas().child(buscolorMesaIdActual).update({ turno: siguiente, robado: false });
}

// Tocar una carta de tu mano intenta jugarla directo (como en Escoba), sin
// botón aparte. Si es comodín, primero hay que elegir de qué color sigue.
function buscolorTocarCarta(indice){
  const mesa = buscolorMesaActual();
  if(!mesa || mesa.fase !== 'jugando' || String(mesa.turno) !== String(miAsiento)) return;
  const carta = (mesa.mano[String(miAsiento)] || [])[indice];
  if(!carta || !buscolorPuedeJugarCarta(carta, mesa)) return;
  if(!carta.color){
    buscolorEligiendoIndice = indice;
    renderBuscolor();
    return;
  }
  buscolorJugarCarta(indice, null);
}

function buscolorElegirColorComodin(color){
  if(buscolorEligiendoIndice == null) return;
  buscolorJugarCarta(buscolorEligiendoIndice, color);
  buscolorEligiendoIndice = null;
}

function buscolorJugarCarta(indice, colorElegido){
  const mesa = buscolorMesaActual();
  if(!mesa || mesa.fase !== 'jugando' || String(mesa.turno) !== String(miAsiento)) return;
  const miMano = (mesa.mano[String(miAsiento)] || []).slice();
  const carta = miMano[indice];
  if(!carta || !buscolorPuedeJugarCarta(carta, mesa)) return;
  if(!carta.color && !colorElegido) return;

  const nuevaMano = miMano.filter((_, i) => i !== indice);
  const descarte = (mesa.descarte || []).concat([carta]);
  const colorActual = carta.color || colorElegido;
  buscolorEligiendoIndice = null;

  if(nuevaMano.length === 0){
    buscolorRefMesas().child(buscolorMesaIdActual).update({
      [`mano/${miAsiento}`]: nuevaMano, descarte,
      colorActual, tipoActual: carta.tipo, numeroActual: carta.tipo === 'numero' ? carta.numero : null,
      fase: 'terminado', ganador: String(miAsiento), robado: false,
    });
    return;
  }

  const { sentido, siguienteTurno, jugadorPenalizado, cartasPenalizado } = buscolorCalcularSiguienteTurno(mesa, String(miAsiento), carta);
  const updates = {
    [`mano/${miAsiento}`]: nuevaMano, descarte,
    colorActual, tipoActual: carta.tipo, numeroActual: carta.tipo === 'numero' ? carta.numero : null,
    sentido, turno: siguienteTurno, robado: false,
  };

  if(cartasPenalizado && jugadorPenalizado){
    let mazo = (mesa.mazo || []).slice();
    let descarteTrabajo = descarte.slice();
    const manoPenalizado = (mesa.mano[jugadorPenalizado] || []).slice();
    for(let i = 0; i < cartasPenalizado; i++){
      const r = buscolorRobarUnaCarta(mazo, descarteTrabajo);
      mazo = r.mazo; descarteTrabajo = r.descarte;
      if(r.carta) manoPenalizado.push(r.carta);
    }
    updates[`mano/${jugadorPenalizado}`] = manoPenalizado;
    updates.mazo = mazo;
    updates.descarte = descarteTrabajo;
  }

  buscolorRefMesas().child(buscolorMesaIdActual).update(updates);
}

let buscolorPremiadoMesa = null;

function buscolorPremiarSiCorresponde(mesa){
  if(!miAsiento || !mesa || mesa.fase !== 'terminado' || !mesa.ganador) return;
  if(buscolorPremiadoMesa === buscolorMesaIdActual) return;
  if(!mesa.jugadores.includes(String(miAsiento))) return;
  buscolorPremiadoMesa = buscolorMesaIdActual;
  if(String(mesa.ganador) === String(miAsiento)){
    ganarMonedas(25);
    mostrarToast('¡BusColor! Te quedaste sin cartas primero. +25 monedas', 'gain');
  } else {
    mostrarToast(`Ganó ${mesa.nombres[mesa.ganador]}, se quedó sin cartas primero.`);
  }
}

// Aviso transparente (nadie puede discutir "no dijiste BusColor"): apenas
// alguien queda con 1 sola carta, la app le avisa a todos sola.
let buscolorUltimaBaseline = {};

function buscolorRevisarUltimaCarta(mesa){
  if(!mesa || mesa.fase !== 'jugando' || !mesa.jugadores) return;
  const clave = buscolorMesaIdActual;
  if(!buscolorUltimaBaseline[clave]) buscolorUltimaBaseline[clave] = {};
  const base = buscolorUltimaBaseline[clave];
  mesa.jugadores.forEach(a => {
    const cant = ((mesa.mano || {})[a] || []).length;
    const antes = base[a];
    if(antes !== undefined && antes > 1 && cant === 1){
      const quien = String(a) === String(miAsiento) ? 'Te quedaste' : `${mesa.nombres[a]} se quedó`;
      mostrarToast(`🔔 ${quien} con 1 carta — ¡BusColor!`);
    }
    base[a] = cant;
  });
}

function buscolorCartaHTML(carta, seleccionada, onclick){
  const claseColor = carta.color ? `buscolor-carta-${carta.color}` : 'buscolor-carta-negra';
  let contenido;
  if(carta.tipo === 'numero') contenido = `<span class="buscolor-carta-simbolo">${carta.numero}</span>`;
  else if(carta.tipo === 'saltar') contenido = `<span class="buscolor-carta-simbolo">🚫</span>`;
  else if(carta.tipo === 'reversa') contenido = `<span class="buscolor-carta-simbolo">🔁</span>`;
  else if(carta.tipo === '+2') contenido = `<span class="buscolor-carta-simbolo">+2</span>`;
  else if(carta.tipo === 'comodin') contenido = `<span class="buscolor-carta-comodin-icono"></span>`;
  else contenido = `<span class="buscolor-carta-comodin-icono"></span><span class="buscolor-carta-mas4">+4</span>`;
  return `<button class="buscolor-carta ${claseColor} ${seleccionada ? 'buscolor-carta-seleccionada' : ''}" ${onclick ? `onclick="${onclick}"` : 'disabled'}>${contenido}</button>`;
}

function renderBuscolorLobby(){
  const cont = document.getElementById('buscolor-content');
  const mesasArray = Object.keys(buscolorMesas).map(id => Object.assign({ id }, buscolorMesas[id]));
  const listaHTML = mesasArray.length ? mesasArray.map(m => {
    const nombres = m.jugadores.map(a => m.nombres[a]).join(', ');
    const estado = m.fase === 'esperando' ? `Esperando jugadores (${m.jugadores.length}/${m.capacidad})` : m.fase === 'jugando' ? 'Jugando' : 'Terminada';
    const puedoUnirme = m.fase === 'esperando' && m.jugadores.length < m.capacidad && !m.jugadores.includes(String(miAsiento));
    const puedoEntrar = m.jugadores.includes(String(miAsiento));
    return `<div class="bingo-roster-item">
      <span>${nombres}<br><span style="font-size:11px;color:var(--gray);">${estado}</span></span>
      <span class="bingo-roster-derecha">
        ${puedoEntrar ? `<button class="btn-eliminar-pasajero" style="width:auto;border-radius:10px;padding:4px 10px;" onclick="buscolorMesaIdActual='${m.id}'; renderBuscolor();">Entrar</button>` : ''}
        ${puedoUnirme ? `<button class="btn-eliminar-pasajero" style="width:auto;border-radius:10px;padding:4px 10px;background:#3B9B5A;color:#fff;border-color:#3B9B5A;" onclick="buscolorUnirseAMesa('${m.id}')">Unirme</button>` : ''}
        ${puedoEntrar ? `<button class="btn-eliminar-pasajero" onclick="buscolorTerminarMesa('${m.id}')" title="Eliminar mesa">✕</button>` : ''}
      </span>
    </div>`;
  }).join('') : '<p style="color:var(--gray);font-size:13px;">Todavía no hay mesas. ¡Armá la primera!</p>';

  cont.innerHTML = `
    <div class="hero" style="margin-top:8px;">
      <h2>🎨 BusColor</h2>
      <p>De 2 a 6 jugadores. Jugá una carta que combine en color, número o símbolo con la de arriba. El primero en quedarse sin cartas gana.</p>
    </div>
    <div class="section-label">¿Con cuántos jugadores?</div>
    <div class="chip-row" style="margin-bottom:14px;">
      ${[2, 3, 4, 5, 6].map(n => `<div class="chip ${buscolorCapacidadElegida === n ? 'selected' : ''}" onclick="buscolorElegirCapacidad(${n})">${n}</div>`).join('')}
    </div>
    <button class="btn-primary" onclick="buscolorCrearMesa()">Crear mesa nueva</button>
    <div class="section-label" style="margin-top:16px;">Mesas</div>
    ${listaHTML}`;
}

function renderBuscolorMesa(){
  const cont = document.getElementById('buscolor-content');
  const mesa = buscolorMesaActual();
  if(!mesa){ buscolorVolverAlLobby(); return; }

  if(mesa.fase === 'esperando'){
    cont.innerHTML = `
      <div class="hero" style="margin-top:8px;"><h2>Esperando jugadores...</h2><p>${mesa.jugadores.length} de ${mesa.capacidad}. Compartí la app para que se sumen los que falten.</p></div>
      <p class="link-chico" onclick="buscolorVolverAlLobby()">‹ Volver a la lista de mesas</p>
      <p class="link-chico" onclick="buscolorTerminarMesa('${buscolorMesaIdActual}')">Cancelar esta mesa</p>`;
    return;
  }

  const marcadorHTML = `<div class="escoba-marcador">${mesa.jugadores.map(a =>
    `<div>${String(a) === String(miAsiento) ? '🫲 Vos' : mesa.nombres[a]}: ${((mesa.mano || {})[a] || []).length} cartas</div>`
  ).join('')}</div>`;

  if(mesa.fase === 'terminado'){
    cont.innerHTML = `
      ${marcadorHTML}
      <div class="hero" style="margin-top:8px;">
        <h2>🏁 ${String(mesa.ganador) === String(miAsiento) ? '¡Ganaste!' : `Ganó ${mesa.nombres[mesa.ganador]}`}</h2>
        <p>Se quedó sin cartas primero.</p>
      </div>
      <button class="btn-primary" onclick="buscolorTerminarMesa('${buscolorMesaIdActual}')">Cerrar esta mesa</button>
      <p class="link-chico" onclick="buscolorVolverAlLobby()">‹ Volver a la lista de mesas</p>`;
    buscolorPremiarSiCorresponde(mesa);
    return;
  }

  const soyTurno = String(mesa.turno) === String(miAsiento);
  const miMano = (mesa.mano && mesa.mano[String(miAsiento)]) || [];
  const descarteTope = (mesa.descarte || [])[(mesa.descarte || []).length - 1];
  const puedeLevantar = soyTurno && !mesa.robado;
  const mazoLen = (mesa.mazo || []).length;

  if(soyTurno && buscolorEligiendoIndice != null){
    cont.innerHTML = `
      ${marcadorHTML}
      <div class="hero" style="margin-top:8px;"><h2>Elegí de qué color sigue</h2><p>Jugaste un comodín: elegí el color con el que continúa la mesa.</p></div>
      <div class="buscolor-elegir-color">
        ${BUSCOLOR_COLORES.map(c => `<button style="background:${BUSCOLOR_COLOR_HEX[c]};" onclick="buscolorElegirColorComodin('${c}')" title="${BUSCOLOR_COLOR_NOMBRE[c]}"></button>`).join('')}
      </div>`;
    return;
  }

  const mazoSeVePuedeUsar = puedeLevantar && mazoLen;
  const mazoHTML = `<div style="text-align:center;">
    <button class="escoba-carta escoba-carta-dorso" style="${mazoSeVePuedeUsar ? '' : 'opacity:.4;filter:grayscale(.6);cursor:not-allowed;'}" ${mazoSeVePuedeUsar ? `onclick="buscolorLevantar()"` : 'disabled'}></button>
    <div style="font-size:10px;color:#EAF3EC;">Mazo (${mazoLen})</div>
  </div>`;
  const descarteHTML = descarteTope ? `<div style="text-align:center;">
    ${buscolorCartaHTML(descarteTope, false, null)}
    <div style="font-size:10px;color:#EAF3EC;">Descarte</div>
  </div>` : '<p style="font-size:12px;">Sin descarte todavía</p>';

  const colorActualHTML = `<div class="buscolor-color-actual"><span class="buscolor-color-punto" style="background:${BUSCOLOR_COLOR_HEX[mesa.colorActual]};"></span>Color actual: ${BUSCOLOR_COLOR_NOMBRE[mesa.colorActual]}</div>`;

  const hayJugada = miMano.some(c => buscolorPuedeJugarCarta(c, mesa));

  let accionesHTML = '';
  if(soyTurno && mesa.robado){
    accionesHTML = `<button class="btn-primary" onclick="buscolorPasarTurno()">🚫 Pasar turno, no tengo con qué jugar</button>`;
  }

  const otros = mesa.jugadores.filter(a => a !== String(miAsiento));
  const otrosAbanicoHTML = otros.map(a => {
    const cant = ((mesa.mano || {})[a] || []).length;
    return `<div class="section-label">Cartas de ${mesa.nombres[a]} (${cant})</div>${chinchonAbanicoHTML(cant)}`;
  }).join('');

  // Las cartas que no combinan se muestran apagadas y sin acción: así queda
  // claro de un vistazo cuáles sirven, en vez de tocar y que no pase nada.
  const manoHTML = miMano.map((c, i) => {
    const jugable = soyTurno && buscolorPuedeJugarCarta(c, mesa);
    return buscolorCartaHTML(c, false, jugable ? `buscolorTocarCarta(${i})` : null);
  }).join('');

  let mensajeTurno;
  if(!soyTurno) mensajeTurno = `Turno de ${mesa.nombres[mesa.turno]}`;
  else if(hayJugada) mensajeTurno = 'Tu turno';
  else if(!mesa.robado) mensajeTurno = 'Tu turno — sin jugada';
  else mensajeTurno = 'Tu turno — seguís sin jugada';

  let mensajeAyuda;
  if(!soyTurno) mensajeAyuda = 'Tocá una carta tuya que combine, o tocá el mazo para levantar.';
  else if(hayJugada) mensajeAyuda = 'Tocá una carta tuya que combine, o tocá el mazo para levantar.';
  else if(!mesa.robado) mensajeAyuda = 'Ninguna de tus cartas combina. Tocá el mazo para levantar una.';
  else mensajeAyuda = 'Levantaste y seguís sin ninguna que combine. Tocá "Pasar turno" para seguir.';

  cont.innerHTML = `
    ${marcadorHTML}
    <div class="hero" style="margin-top:8px;">
      <h2>${mensajeTurno}</h2>
      <p>${mensajeAyuda}</p>
    </div>
    ${otrosAbanicoHTML}
    <div class="section-label">Mesa</div>
    <div class="tapete-mesa">
      <div class="escoba-fila">${mazoHTML}${descarteHTML}</div>
      <p>${colorActualHTML}</p>
    </div>
    ${accionesHTML}
    <div class="section-label">Tu mano</div>
    <div class="escoba-fila">${manoHTML}</div>
    <p class="link-chico" onclick="buscolorTerminarMesa('${buscolorMesaIdActual}')">Abandonar esta mesa</p>`;
}

function renderBuscolor(){
  const cont = document.getElementById('buscolor-content');
  if(!cont) return;
  document.getElementById('buscolor-sub').textContent = buscolorMesaIdActual ? 'En una mesa' : 'Elegí o creá una mesa';
  if(buscolorMesaIdActual && buscolorMesas[buscolorMesaIdActual]) renderBuscolorMesa();
  else { buscolorMesaIdActual = null; renderBuscolorLobby(); }
}
