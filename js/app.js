// Monedas Bus Coin: no se compran con plata, todos arrancan en cero. Solo suben
// jugando (respuesta correcta o ganar el Bingo); un error no resta nada, no
// hay riesgo, solo premio por acertar. Sirven para el ranking del viaje y
// para elegir premio al final. Como nadie paga para jugar, esto es una
// promoción de fidelización gratuita, no un juego de azar.
let monedasCoin = 0;

const EMOJIS_DISPONIBLES = ['😊', '😎', '🤩', '😜', '🥳', '😇', '🤠', '🧐', '🤓', '💃', '🕺', '😴'];

const TARJETAS_JUEGOS = [
  { icon: "trivia", title: "Trivia", sub: "Elegí un tema y sumá puntos", view: "trivia" },
  { icon: "interrogacion", title: "Acertijos", sub: "Pensá en grupo antes de rendirte", view: "acertijos" },
  { icon: "rompecabezas", title: "Pensamiento lateral", sub: "Resolvé el caso a puro sí o no", view: "pensamiento" },
  { icon: "libro", title: "Ahorcado", sub: "Adiviná la palabra letra por letra", view: "ahorcado" },
  { icon: "lupa", title: "4+1", sub: "4 imágenes, 1 palabra", view: "cuatrouno" },
  { icon: "valija", title: "Valija Express", sub: "20 segundos para armar la valija", view: "valija" },
  { icon: "letraA", title: "Tutti Frutti", sub: "Una letra, contra el resto del viaje", view: "tutifruti" },
  { icon: "bingo", title: "Bingo", sub: "Números del 00 al 99, con su significado", view: "bingo" },
];

const TARJETAS_HOME = TARJETAS_JUEGOS.concat([
  { icon: "trofeo", title: "Ranking del micro", sub: "¿Quién va primero hoy?", view: "ranking" },
]);

// ---- Código de viaje: agrupa Bingo/Ranking/DJ bajo un mismo código, para
// poder arrancar un viaje nuevo (pasajeros y nombres nuevos) sin mezclarlo
// con datos de un viaje anterior, y para poder borrar viajes ya terminados. ----

let codigoViaje = '';

function leerCodigoViajeDeURL(){
  const params = new URLSearchParams(location.search);
  return (params.get('viaje') || '').toUpperCase().trim();
}

function codigoAlAzar(){
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I para que no se confundan al leerlo
  let codigo = '';
  for(let i = 0; i < 5; i++) codigo += letras[Math.floor(Math.random() * letras.length)];
  return codigo;
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
      <input type="text" id="codigo-personalizado-input" class="bingo-input-numero" style="text-transform:uppercase;" placeholder="Código a elección (opcional)">
      <input type="password" id="pin-codigo-nuevo-input" class="bingo-input-numero" inputmode="numeric" maxlength="4" placeholder="PIN del organizador">
      <button class="btn-primary" onclick="confirmarGenerarCodigo()">Crear código de viaje</button>
      <p id="pin-codigo-nuevo-error" class="bingo-pin-error"></p>
    </div>`;
}

// El organizador puede elegir su propio código (ej. el nombre del viaje) o
// dejarlo vacío para que se genere uno al azar. Si el código elegido ya
// está en uso por otro viaje, avisa para que pruebe con otro.
function confirmarGenerarCodigo(){
  const pinInput = document.getElementById('pin-codigo-nuevo-input');
  const pin = pinInput ? pinInput.value.trim() : '';
  const error = document.getElementById('pin-codigo-nuevo-error');
  if(error) error.textContent = '';
  if(pin !== BINGO_PIN_ORGANIZADOR){
    if(error) error.textContent = 'PIN incorrecto';
    return;
  }
  const personalizadoInput = document.getElementById('codigo-personalizado-input');
  const personalizado = personalizadoInput ? personalizadoInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
  const codigo = personalizado || codigoAlAzar();

  db.ref('salas/' + codigo + '/creado').once('value').then(snap => {
    if(snap.val() != null){
      if(error) error.textContent = 'Ese código ya está en uso, elegí otro.';
      return;
    }
    localStorage.setItem('bingo-organizador', 'si');
    codigoViaje = codigo;
    localStorage.setItem('codigo-viaje', codigoViaje);
    db.ref('salas/' + codigoViaje + '/creado').set(Date.now());
    mostrandoPinCodigoNuevo = false;
    renderPinCodigoNuevo();
    showView('onboard');
  });
}

function actualizarBotonCodigoViaje(){
  const val = document.getElementById('codigo-viaje-input').value.trim();
  document.getElementById('btn-continuar-codigo').disabled = val.length === 0;
}

// Solo se puede entrar con un código que un organizador haya generado de
// verdad (marcado en Firebase con "creado"): así nadie tipea cualquier cosa
// y arranca sin querer un viaje fantasma separado del resto.
function confirmarCodigoViaje(){
  const codigo = document.getElementById('codigo-viaje-input').value.trim().toUpperCase();
  const error = document.getElementById('codigo-viaje-error');
  if(error) error.textContent = '';
  if(!codigo) return;

  db.ref('salas/' + codigo).once('value').then(snap => {
    if(!snap.exists() || snap.child('creado').val() == null){
      if(error) error.textContent = 'Ese código no existe. Pedile el código al organizador del viaje.';
      return;
    }
    if(snap.child('cerrado').val()){
      if(error) error.textContent = 'Este viaje ya terminó y dejó de estar disponible.';
      return;
    }
    codigoViaje = codigo;
    localStorage.setItem('codigo-viaje', codigoViaje);
    showView('onboard');
  });
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
      const cerrado = !!datos[c].cerrado;
      return `<div class="bingo-roster-item">
        <span>${c}${cerrado ? ' 🔒' : ''}</span>
        <span class="bingo-roster-derecha">
          <span>${pasajeros} pasajero${pasajeros === 1 ? '' : 's'}</span>
          <button class="btn-finalizar-viaje" onclick="toggleCerrarViaje('${c}',${!cerrado})">${cerrado ? 'Reabrir' : 'Finalizar'}</button>
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

// "Finalizar" no borra nada (así el ranking queda para entregar los premios
// después): solo marca la sala como cerrada, y desde ese momento nadie más
// puede entrar con ese código. "Reabrir" deshace eso, por si hace falta.
function toggleCerrarViaje(codigo, cerrar){
  db.ref('salas/' + codigo + '/cerrado').set(cerrar).then(() => renderAdminViajes());
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
  actualizarMonedasEnPantalla();
  renderHome();
}

function renderTarjetas(lista, contenedorId){
  const container = document.getElementById(contenedorId);
  lista.forEach(c=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.onclick = ()=> showView(c.view);
    div.innerHTML = `<div class="icon">${icono(c.icon)}</div><div class="txt"><h3>${c.title}</h3><p>${c.sub}</p></div>`;
    container.appendChild(div);
  });
}

function renderHome(){
  document.getElementById('home-saludo').textContent = `${miEmoji} Hola, ${miNombre}`;
  document.getElementById('home-viaje').textContent = `Viaje ${codigoViaje} · copiar link`;
  document.getElementById('home-content').innerHTML = '<div class="section-label">Para vos</div>';
  renderTarjetas(TARJETAS_HOME, 'home-content');
}

function renderJuegos(){
  document.getElementById('juegos-content').innerHTML = '';
  renderTarjetas(TARJETAS_JUEGOS, 'juegos-content');
}

// Trivia, Acertijos y Bingo se entran desde el menú "Juegos" del tabbar, así
// que esa pestaña queda marcada activa aunque ya estés adentro de uno de ellos.
const TABS_HIJOS_DE_JUEGOS = ['trivia', 'acertijos', 'pensamiento', 'ahorcado', 'cuatrouno', 'valija', 'tutifruti', 'bingo'];

function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  const tabName = TABS_HIJOS_DE_JUEGOS.includes(name) ? 'juegos' : name;
  const tab = document.querySelector(`.tab[data-tab="${tabName}"]`);
  if(tab) tab.classList.add('active');
  if(name==='juegos'){ renderJuegos(); }
  if(name==='trivia'){ iniciarTrivia(); }
  if(name==='acertijos'){ iniciarAcertijos(); }
  if(name==='pensamiento'){ iniciarPensamiento(); }
  if(name==='ahorcado'){ iniciarAhorcado(); }
  if(name==='cuatrouno'){ iniciarCuatrouno(); }
  if(name==='valija'){ iniciarValija(); }
  if(name==='tutifruti'){ iniciarTutifruti(); }
  if(name==='ranking'){ renderRanking(); }
  if(name==='bingo'){ iniciarBingo(); }
  if(name==='tienda'){ iniciarPremios(); }
}

const MEDALLAS_RANKING = ['🥇', '🥈', '🥉'];

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
    div.innerHTML = `<div class="rank-num">${MEDALLAS_RANKING[i] || i+1}</div><div class="rank-avatar">${r.nombre.slice(0,2).toUpperCase()}</div><div class="rank-name">${r.me ? 'Vos' : r.nombre} <span class="rank-asiento">· asiento ${r.asiento}</span></div><div class="rank-pts">${r.pts} pts</div>`;
    list.appendChild(div);
  });
}

function totalMonedas(){
  return monedasCoin;
}

function alcanzanMonedas(cantidad){
  return monedasCoin >= cantidad;
}

function gastarMonedas(cantidad){
  if(!alcanzanMonedas(cantidad)) return false;
  monedasCoin -= cantidad;
  actualizarMonedasEnPantalla();
  return true;
}

function actualizarMonedasEnPantalla(){
  const el = document.getElementById('monedas-coin-count');
  if(el) el.textContent = monedasCoin;
}

// Suma o resta monedas jugando (positivo si acertaste, negativo si no);
// nunca deja el saldo en negativo. Todos los juegos usan esto, Bingo incluido,
// y también actualiza el Ranking en vivo con el mismo número.
function ganarMonedas(cantidad){
  monedasCoin = Math.max(0, monedasCoin + cantidad);
  actualizarMonedasEnPantalla();
  if(!miNombre || !miAsiento) return;
  const asiento = String(miAsiento);
  const puntosActuales = (rankingPuntos[asiento] && rankingPuntos[asiento].pts) || 0;
  rankingPuntos[asiento] = { nombre: miNombre, pts: Math.max(0, puntosActuales + cantidad) };
  rankingRefPuntos().child(asiento).set(rankingPuntos[asiento]);
}


let toastTimer = null;

// tipo: 'gain' (sumaste monedas), 'loss' (perdiste monedas) o vacío (neutro).
// Dura más y se resalta con color para que dé tiempo a leerlo antes de
// pasar a la siguiente pregunta.
function mostrarToast(msg, tipo){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('toast-gain', 'toast-loss');
  if(tipo === 'gain') t.classList.add('toast-gain');
  if(tipo === 'loss') t.classList.add('toast-loss');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2600);
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
    // Se abrió con un link compartido (?viaje=CODIGO): valida contra Firebase
    // antes de entrar directo, por si el código ya no existe.
    db.ref('salas/' + codigoURL).once('value').then(snap => {
      if(snap.exists() && snap.child('creado').val() != null && !snap.child('cerrado').val()){
        codigoViaje = codigoURL;
        localStorage.setItem('codigo-viaje', codigoViaje);
        showView('onboard');
      } else if(codigoInput){
        codigoInput.value = codigoURL;
        actualizarBotonCodigoViaje();
        const error = document.getElementById('codigo-viaje-error');
        if(error) error.textContent = snap.exists() && snap.child('cerrado').val()
          ? 'Este viaje ya terminó y dejó de estar disponible.'
          : 'Ese código ya no existe. Pedile uno nuevo al organizador.';
      }
    });
  } else if(codigoInput){
    codigoInput.value = localStorage.getItem('codigo-viaje') || '';
    actualizarBotonCodigoViaje();
  }
});
