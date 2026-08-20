// Fichas ganadas jugando (trivia, diferencias, bingo) y fichas compradas con
// dinero real quedan separadas a propósito: ningún juego de azar reparte algo
// que se haya pagado, para no parecerse a un juego de azar regulado.
let fichasJuego = 20;
let fichasCompradas = 100;

const EMOJIS_DISPONIBLES = ['😊', '😎', '🤩', '😜', '🥳', '😇', '🤠', '🧐', '🤓', '💃', '🕺', '😴'];

const TARJETAS_HOME = [
  { icon: "trivia", title: "Trivia", sub: "Elegí un tema y sumá puntos", view: "trivia" },
  { icon: "bingo", title: "Bingo", sub: "Números del 00 al 99, con su significado", view: "bingo" },
  { icon: "trofeo", title: "Ranking del micro", sub: "¿Quién va primero hoy?", view: "ranking" },
  { icon: "musica", title: "DJ en vivo", sub: "Votá y pagá el próximo tema", view: "dj" },
  { icon: "lupa", title: "Buscá las diferencias", sub: "Juego para todas las edades", view: "diferencias" },
  { icon: "auriculares", title: "Cuento del día", sub: "Leyendas argentinas, en audio", view: "cuento" },
];

// ---- Código de viaje: agrupa Bingo/Ranking/DJ bajo un mismo código, para
// poder arrancar un viaje nuevo (pasajeros y nombres nuevos) sin mezclarlo
// con datos de un viaje anterior, y para poder borrar viajes ya terminados. ----

let codigoViaje = '';

function leerCodigoViajeDeURL(){
  const params = new URLSearchParams(location.search);
  return (params.get('viaje') || '').toUpperCase().trim();
}

function generarCodigoViaje(){
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I para que no se confundan al leerlo
  let codigo = '';
  for(let i = 0; i < 5; i++) codigo += letras[Math.floor(Math.random() * letras.length)];
  document.getElementById('codigo-viaje-input').value = codigo;
  actualizarBotonCodigoViaje();
}

// Generar un código nuevo queda atrás del PIN: si cualquiera pudiera tocarlo,
// un pasajero se manda solo a un viaje vacío sin querer. Escribir un código
// ya existente, en cambio, lo puede hacer cualquiera (eso es "unirse").
let mostrandoPinCodigoNuevo = false;

function mostrarGenerarCodigo(){
  mostrandoPinCodigoNuevo = true;
  renderPinCodigoNuevo();
}

function renderPinCodigoNuevo(){
  const cont = document.getElementById('generar-codigo-content');
  if(!cont) return;
  if(!mostrandoPinCodigoNuevo){ cont.innerHTML = ''; return; }
  cont.innerHTML = `
    <div class="bingo-pin-box">
      <input type="password" id="pin-codigo-nuevo-input" class="bingo-input-numero" inputmode="numeric" maxlength="4" placeholder="PIN del organizador">
      <button class="btn-primary" onclick="confirmarGenerarCodigo()">Generar código nuevo</button>
      <p id="pin-codigo-nuevo-error" class="bingo-pin-error"></p>
    </div>`;
}

function confirmarGenerarCodigo(){
  const input = document.getElementById('pin-codigo-nuevo-input');
  const pin = input ? input.value.trim() : '';
  const error = document.getElementById('pin-codigo-nuevo-error');
  if(pin !== BINGO_PIN_ORGANIZADOR){
    if(error) error.textContent = 'PIN incorrecto';
    return;
  }
  localStorage.setItem('bingo-organizador', 'si');
  generarCodigoViaje();
  mostrandoPinCodigoNuevo = false;
  renderPinCodigoNuevo();
}

function actualizarBotonCodigoViaje(){
  const val = document.getElementById('codigo-viaje-input').value.trim();
  document.getElementById('btn-continuar-codigo').disabled = val.length === 0;
}

function confirmarCodigoViaje(){
  codigoViaje = document.getElementById('codigo-viaje-input').value.trim().toUpperCase();
  localStorage.setItem('codigo-viaje', codigoViaje);
  showView('onboard');
}

function copiarLinkViaje(){
  if(!codigoViaje) return;
  const url = `${location.origin}${location.pathname}?viaje=${encodeURIComponent(codigoViaje)}`;
  navigator.clipboard.writeText(url).then(() => mostrarToast('Link del viaje copiado'));
}

// ---- Administración de viajes: mismo PIN que el organizador del Bingo,
// para listar y borrar viajes ya terminados. ----

let adminMostrandoPin = false;

function mostrarAdminViajes(){
  adminMostrandoPin = true;
  renderAdminViajes();
}

function renderAdminViajes(){
  const cont = document.getElementById('admin-viajes-content');
  if(!cont) return;
  if(localStorage.getItem('bingo-organizador') !== 'si'){
    if(!adminMostrandoPin){ cont.innerHTML = ''; return; }
    cont.innerHTML = `
      <div class="bingo-pin-box">
        <input type="password" id="admin-pin-input" class="bingo-input-numero" inputmode="numeric" maxlength="4" placeholder="PIN de administrador">
        <button class="btn-primary" onclick="verificarPinAdmin()">Entrar</button>
        <p id="admin-pin-error" class="bingo-pin-error"></p>
      </div>`;
    return;
  }
  cont.innerHTML = '<p style="color:var(--gray);font-size:13px;">Cargando viajes...</p>';
  db.ref('salas').once('value').then(snap => {
    const datos = snap.val() || {};
    const codigos = Object.keys(datos);
    if(!codigos.length){
      cont.innerHTML = '<p style="color:var(--gray);font-size:13px;">Todavía no hay viajes guardados.</p>';
      return;
    }
    cont.innerHTML = `<div class="section-label">Viajes guardados</div>` + codigos.map(c => {
      const pasajeros = Object.keys((datos[c].ranking && datos[c].ranking.puntos) || {}).length;
      return `<div class="bingo-roster-item">
        <span>${c}</span>
        <span class="bingo-roster-derecha">
          <span>${pasajeros} pasajero${pasajeros === 1 ? '' : 's'}</span>
          <button class="btn-eliminar-pasajero" onclick="eliminarViaje('${c}')" title="Eliminar viaje">✕</button>
        </span>
      </div>`;
    }).join('');
  });
}

function verificarPinAdmin(){
  const input = document.getElementById('admin-pin-input');
  const pin = input ? input.value.trim() : '';
  const error = document.getElementById('admin-pin-error');
  if(pin !== BINGO_PIN_ORGANIZADOR){
    if(error) error.textContent = 'PIN incorrecto';
    return;
  }
  localStorage.setItem('bingo-organizador', 'si');
  renderAdminViajes();
}

function eliminarViaje(codigo){
  db.ref('salas/' + codigo).remove().then(() => renderAdminViajes());
}

// ---- Identidad y ranking compartido: cada celular dice su emoji, nombre y
// asiento una vez, y los puntos que gana se suman a una tabla en vivo en Firebase.
// Se guarda por asiento (no por nombre) para que dos pasajeros con el mismo
// nombre no se mezclen en una sola fila. ----

let miNombre = localStorage.getItem('mi-nombre') || '';
let miAsiento = localStorage.getItem('mi-asiento') || '';
let miEmoji = localStorage.getItem('mi-emoji') || '';
let rankingPuntos = {};
let rankingListener = null;

function rankingRefPuntos(){ return db.ref('salas/' + codigoViaje + '/ranking/puntos'); }

function rankingUnirse(){
  if(!miNombre || !miAsiento) return;
  const ref = rankingRefPuntos().child(String(miAsiento));
  ref.once('value').then(snap => {
    if(snap.val() == null) ref.set({ nombre: miNombre, pts: 0 });
  });
  if(!rankingListener){
    rankingListener = rankingRefPuntos().on('value', snap => {
      rankingPuntos = snap.val() || {};
      renderRanking();
    });
  }
}

function actualizarBotonContinuar(){
  const nombreOk = document.getElementById('mi-nombre-input').value.trim().length > 0;
  const asientoOk = Number(document.getElementById('mi-asiento-input').value) > 0;
  document.getElementById('btn-continuar').disabled = !(miEmoji && nombreOk && asientoOk);
}

function renderEmojiGrid(){
  const grid = document.getElementById('emoji-grid');
  if(!grid) return;
  grid.innerHTML = EMOJIS_DISPONIBLES.map(e =>
    `<button class="emoji-opcion${e === miEmoji ? ' selected' : ''}" data-emoji="${e}" onclick="seleccionarEmoji('${e}')">${e}</button>`
  ).join('');
}

function seleccionarEmoji(e){
  miEmoji = e;
  document.querySelectorAll('.emoji-opcion').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.emoji-opcion[data-emoji="${e}"]`).classList.add('selected');
  actualizarBotonContinuar();
}

function goHome(){
  miNombre = document.getElementById('mi-nombre-input').value.trim();
  miAsiento = document.getElementById('mi-asiento-input').value.trim();
  localStorage.setItem('mi-nombre', miNombre);
  localStorage.setItem('mi-asiento', miAsiento);
  localStorage.setItem('mi-emoji', miEmoji);
  rankingUnirse();
  bingoRegistrarPasajero(miAsiento, miNombre);
  showView('home');
  document.getElementById('tabbar').style.display = 'flex';
  renderHome();
}

function renderHome(){
  document.getElementById('home-saludo').textContent = `${miEmoji} Hola, ${miNombre}`;
  document.getElementById('home-viaje').textContent = `Viaje ${codigoViaje} · copiar link`;
  const container = document.getElementById('home-content');
  container.innerHTML = '<div class="section-label">Para vos</div>';
  TARJETAS_HOME.forEach(c=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.onclick = ()=> showView(c.view);
    div.innerHTML = `<div class="icon">${icono(c.icon)}</div><div class="txt"><h3>${c.title}</h3><p>${c.sub}</p></div>`;
    container.appendChild(div);
  });
}

function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  const tab = document.querySelector(`.tab[data-tab="${name}"]`);
  if(tab) tab.classList.add('active');
  if(name==='trivia'){ iniciarTrivia(); }
  if(name==='ranking'){ renderRanking(); }
  if(name==='dj'){ iniciarDJ(); }
  if(name==='diferencias'){ iniciarDiferencias(); }
  if(name==='cuento'){ iniciarCuento(); }
  if(name==='bingo'){ iniciarBingo(); }
}

function renderRanking(){
  const list = document.getElementById('ranking-list');
  if(!list) return;
  const filas = Object.keys(rankingPuntos)
    .map(asiento => ({ asiento, nombre: rankingPuntos[asiento].nombre, pts: rankingPuntos[asiento].pts, me: asiento === String(miAsiento) }))
    .sort((a,b)=> b.pts - a.pts);
  list.innerHTML = filas.length ? '' : '<p style="color:var(--gray);font-size:13px;">Todavía nadie sumó puntos.</p>';
  filas.forEach((r,i)=>{
    const div = document.createElement('div');
    div.className = 'rank-row' + (r.me ? ' me' : '');
    div.innerHTML = `<div class="rank-num">${i+1}</div><div class="rank-avatar">${r.nombre.slice(0,2).toUpperCase()}</div><div class="rank-name">${r.me ? 'Vos' : r.nombre} <span class="rank-asiento">· asiento ${r.asiento}</span></div><div class="rank-pts">${r.pts} pts</div>`;
    list.appendChild(div);
  });
}

function totalFichas(){
  return fichasJuego + fichasCompradas;
}

function alcanzanFichas(cantidad){
  return totalFichas() >= cantidad;
}

// Gasta primero las fichas ganadas jugando y recién después las compradas.
function gastarFichas(cantidad){
  if(!alcanzanFichas(cantidad)) return false;
  const deJuego = Math.min(fichasJuego, cantidad);
  fichasJuego -= deJuego;
  fichasCompradas -= (cantidad - deJuego);
  actualizarFichasEnPantalla();
  return true;
}

function actualizarFichasEnPantalla(){
  const elJuego = document.getElementById('fichas-juego-count');
  if(elJuego) elJuego.textContent = fichasJuego;
  const elCompradas = document.getElementById('fichas-compradas-count');
  if(elCompradas) elCompradas.textContent = fichasCompradas;
}

function ganarFichas(cantidad){
  fichasJuego += cantidad;
  actualizarFichasEnPantalla();
  if(miNombre && miAsiento){
    const asiento = String(miAsiento);
    const puntosActuales = (rankingPuntos[asiento] && rankingPuntos[asiento].pts) || 0;
    rankingPuntos[asiento] = { nombre: miNombre, pts: puntosActuales + cantidad };
    rankingRefPuntos().child(asiento).set(rankingPuntos[asiento]);
  }
}

function comprarFichas(cantidad){
  fichasCompradas += cantidad;
  actualizarFichasEnPantalla();
  mostrarToast(`Sumaste ${cantidad} fichas`);
}

function mostrarToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 1800);
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('[data-icon]').forEach(el=>{
    el.innerHTML = icono(el.dataset.icon);
  });
  renderEmojiGrid();
  const nombreInput = document.getElementById('mi-nombre-input');
  if(nombreInput && miNombre) nombreInput.value = miNombre;
  const asientoInput = document.getElementById('mi-asiento-input');
  if(asientoInput && miAsiento) asientoInput.value = miAsiento;
  actualizarBotonContinuar();

  const codigoURL = leerCodigoViajeDeURL();
  const codigoInput = document.getElementById('codigo-viaje-input');
  if(codigoURL){
    // Se abrió con un link compartido (?viaje=CODIGO): entra directo, sin pedir el código a mano.
    codigoViaje = codigoURL;
    localStorage.setItem('codigo-viaje', codigoViaje);
    showView('onboard');
  } else if(codigoInput){
    codigoInput.value = localStorage.getItem('codigo-viaje') || '';
    actualizarBotonCodigoViaje();
  }
});
