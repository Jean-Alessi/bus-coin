let bingo = null;
let bingoPasajeros = {};
let bingoCartones = {};
let bingoSeleccion = [];
let bingoMostrandoPin = false;

// PIN para reclamar el rol de organizador. Es una traba simple, no seguridad
// real (el código es público) — alcanza para que ningún pasajero lo toque sin querer.
const BINGO_PIN_ORGANIZADOR = '2314';
const BINGO_CANTIDAD_CARTON = 9;
const BINGO_TAMANO_CARTON = 3;
// Si son menos de 9 pasajeros, se completa el cartón con números (0 al 99, como en un bingo real).
const BINGO_NUMEROS_EXTRA = Array.from({ length: 100 }, (_, i) => String(i));

// Cantos con onda: cada sorteo arma una frase al azar en vez de mostrar el nombre pelado.
const BINGO_LLAMADAS = [
  '¡Todos atentos, que se viene {nombre}!',
  'Directo del bolillero: ¡{nombre}!',
  '¡Aguante {nombre}, dale que va!',
  'La ruta dice su nombre... ¡{nombre}!',
  '¡Che, {nombre}! Justo vos.',
  'Salió {nombre}, ¡que no se achique nadie!',
  '¡Grande {nombre}!',
  'Y el micro canta fuerte: ¡{nombre}!',
  '¡{nombre} al humo!',
  'Marcá bien, que salió... ¡{nombre}!',
  '¡Ahí viene {nombre}, pisando fuerte!',
  'El cartón tiembla: ¡{nombre}!',
  '¡Todo el mundo mira su cartón... es {nombre}!',
  'Sonó y dijo bien clarito: ¡{nombre}!',
  '¡Vamo\' {nombre}, que hoy es tu día!',
];

function bingoArmarLlamada(nombre){
  const plantilla = BINGO_LLAMADAS[Math.floor(Math.random() * BINGO_LLAMADAS.length)];
  const nombreResaltado = `<span class="bingo-nombre-resaltado">${nombre.toUpperCase()}</span>`;
  return plantilla.replace('{nombre}', nombreResaltado);
}

// Línea = fila, columna o cualquiera de las dos diagonales completa (cartón fijo de 3x3).
function bingoTieneLinea(marcados){
  const t = BINGO_TAMANO_CARTON;
  for(let f = 0; f < t; f++){
    let completa = true;
    for(let c = 0; c < t; c++){ if(!marcados.includes(f * t + c)){ completa = false; break; } }
    if(completa) return true;
  }
  for(let c = 0; c < t; c++){
    let completa = true;
    for(let f = 0; f < t; f++){ if(!marcados.includes(f * t + c)){ completa = false; break; } }
    if(completa) return true;
  }
  let diag1 = true, diag2 = true;
  for(let i = 0; i < t; i++){
    if(!marcados.includes(i * t + i)) diag1 = false;
    if(!marcados.includes(i * t + (t - 1 - i))) diag2 = false;
  }
  return diag1 || diag2;
}

// ---- Multi-celular: cada pasajero entra con su nombre + asiento (ya elegidos
// al principio, en el onboarding) y arma su propio cartón eligiendo 9 nombres
// de la lista de todo el grupo. El organizador no puede empezar hasta que
// todos terminen. Ser organizador es una marca local del celular (vía PIN),
// no depende de quién llegó primero ni se pierde si se reinicia la partida. ----

function bingoRefEstado(){ return db.ref(`salas/${codigoViaje}/bingo/estado`); }
function bingoRefPasajeros(){ return db.ref(`salas/${codigoViaje}/bingo/pasajeros`); }
function bingoRefCartones(){ return db.ref(`salas/${codigoViaje}/bingo/cartones`); }

function bingoEstadoVacio(){
  return { fase: 'esperando', bolsa: [], sorteados: [], ultimaLlamada: null, ganadorLinea: null, ganadorCartonLleno: null };
}

function bingoGuardarEstado(){
  bingoRefEstado().set(bingo);
}

function bingoEsOrganizador(){
  return localStorage.getItem('bingo-organizador') === 'si';
}

// Deja de ser organizador en ESTE celular/navegador (útil para volver a probar
// la vista de pasajero, o si se marcó por error). No afecta a otros dispositivos.
function bingoCerrarSesionOrganizador(){
  localStorage.removeItem('bingo-organizador');
  renderBingo();
}

// Se llama una vez, al entrar a la app con nombre + asiento (ver goHome en app.js).
function bingoRegistrarPasajero(asiento, nombre){
  bingoRefPasajeros().child(String(asiento)).set(nombre);
}

// El organizador saca a quien se colgó o se arrepintió de jugar (solo antes de empezar).
function bingoEliminarPasajero(asiento){
  if(!bingoEsOrganizador()) return;
  bingoRefPasajeros().child(String(asiento)).remove();
  bingoRefCartones().child(String(asiento)).remove();
}

let bingoListenersListos = false;

function iniciarBingo(){
  if(!bingoListenersListos){
    bingoListenersListos = true;
    bingoRefEstado().on('value', snap => {
      // Firebase no guarda arrays vacíos ni null: se completan los campos que
      // falten con los valores por defecto para que el resto del código no rompa.
      bingo = Object.assign(bingoEstadoVacio(), snap.val() || {});
      renderBingo();
    });
    bingoRefPasajeros().on('value', snap => {
      bingoPasajeros = snap.val() || {};
      renderBingo();
    });
    bingoRefCartones().on('value', snap => {
      bingoCartones = snap.val() || {};
      renderBingo();
    });
  } else {
    renderBingo();
  }
}

function bingoMostrarPinOrganizador(){
  bingoMostrandoPin = true;
  renderBingo();
}

function bingoIntentarSerOrganizador(){
  const input = document.getElementById('bingo-pin-input');
  const pin = input ? input.value.trim() : '';
  const error = document.getElementById('bingo-pin-error');
  if(pin !== BINGO_PIN_ORGANIZADOR){
    if(error) error.textContent = 'PIN incorrecto';
    return;
  }
  localStorage.setItem('bingo-organizador', 'si');
  bingoMostrandoPin = false;
  renderBingo();
}

// Si dos pasajeros se llaman igual, se les suma el asiento para diferenciarlos
// (ej. "Ana (asiento 4)" y "Ana (asiento 9)"); si el nombre es único queda tal cual.
function bingoNombreConAsiento(asiento){
  const nombre = bingoPasajeros[asiento];
  const repetido = Object.keys(bingoPasajeros).filter(a => bingoPasajeros[a] === nombre).length > 1;
  return repetido ? `${nombre} (asiento ${asiento})` : nombre;
}

// La selección guarda tokens, no el texto final: "n:<asiento>" para nombres y
// "#<numero>" para números. Así, aunque dos pasajeros se llamen igual, elegir
// uno u otro nunca se confunde (se resuelven recién al confirmar el cartón).
function bingoToggleSeleccion(valor){
  const idx = bingoSeleccion.indexOf(valor);
  if(idx !== -1){
    bingoSeleccion.splice(idx, 1);
  } else if(bingoSeleccion.length < BINGO_CANTIDAD_CARTON){
    bingoSeleccion.push(valor);
  }
  renderBingo();
}

function bingoToggleNombre(asiento){
  bingoToggleSeleccion('n:' + asiento);
}

function bingoToggleNumero(numero){
  bingoToggleSeleccion('#' + numero);
}

function bingoConfirmarCarton(){
  if(bingoSeleccion.length !== BINGO_CANTIDAD_CARTON || !miAsiento) return;
  const nombres = barajar(bingoSeleccion.map(v => {
    if(v.startsWith('#')) return v.slice(1);
    return bingoNombreConAsiento(v.slice(2));
  }));
  bingoRefCartones().child(String(miAsiento)).set({ nombres, marcados: [] });
}

// La bolsa incluye a todos los pasajeros (con el asiento sumado si el nombre
// se repite) más cualquier número que alguien haya usado para completar su cartón.
function bingoArmarBolsa(){
  const items = new Set(Object.keys(bingoPasajeros).map(a => bingoNombreConAsiento(a)));
  Object.values(bingoCartones).forEach(c => (c.nombres || []).forEach(n => items.add(n)));
  return barajar([...items]);
}

// El organizador decide cuándo arrancar: no espera a que todos completen su
// cartón (por si son menos de 9, alguien se cuelga, o no quiere jugar).
// Quien no llegó a armar el suyo simplemente queda sin cartón, sin trabar al resto.
function bingoEmpezarJuego(){
  if(!bingoEsOrganizador()) return;
  const asientos = Object.keys(bingoPasajeros);
  if(!asientos.length) return;
  bingo.bolsa = bingoArmarBolsa();
  bingo.sorteados = [];
  bingo.ultimaLlamada = null;
  bingo.ganadorLinea = null;
  bingo.ganadorCartonLleno = null;
  bingo.fase = 'jugando';
  bingoGuardarEstado();
}

function bingoSortear(){
  if(!bingoEsOrganizador()) return;
  bingo.bolsa = bingo.bolsa || [];
  if(!bingo.bolsa.length) return;
  const nombre = bingo.bolsa.pop();
  bingo.sorteados = bingo.sorteados || [];
  bingo.sorteados.push(nombre);
  bingo.ultimaLlamada = bingoArmarLlamada(nombre);

  Object.keys(bingoCartones).forEach(asiento => {
    const carton = bingoCartones[asiento];
    carton.marcados = carton.marcados || [];
    const idx = carton.nombres.indexOf(nombre);
    if(idx !== -1 && !carton.marcados.includes(idx)) carton.marcados.push(idx);
  });

  if(!bingo.ganadorLinea){
    const asientoGanador = Object.keys(bingoCartones).find(a => bingoTieneLinea(bingoCartones[a].marcados || []));
    if(asientoGanador){
      bingo.ganadorLinea = asientoGanador;
      ganarFichas(5);
      mostrarToast(`¡Línea (chingüina) para ${bingoPasajeros[asientoGanador]}! +5 fichas`);
    }
  }
  if(!bingo.ganadorCartonLleno){
    const asientoGanador = Object.keys(bingoCartones).find(a => (bingoCartones[a].marcados || []).length === BINGO_CANTIDAD_CARTON);
    if(asientoGanador){
      bingo.ganadorCartonLleno = asientoGanador;
      ganarFichas(20);
      mostrarToast(`¡BINGO para ${bingoPasajeros[asientoGanador]}! +20 fichas`);
    }
  }
  bingoGuardarEstado();
  bingoRefCartones().set(bingoCartones);
}

// Repite el sorteo con los mismos cartones (no hace falta rearmarlos a mano de nuevo).
function bingoJugarDeNuevo(){
  if(!bingoEsOrganizador()) return;
  Object.values(bingoCartones).forEach(c => { c.marcados = []; });
  bingo.bolsa = bingoArmarBolsa();
  bingo.sorteados = [];
  bingo.ultimaLlamada = null;
  bingo.ganadorLinea = null;
  bingo.ganadorCartonLleno = null;
  bingo.fase = 'jugando';
  bingoGuardarEstado();
  bingoRefCartones().set(bingoCartones);
}

function bingoCartonHTML(asiento, titulo, carton){
  const marcados = carton.marcados || [];
  const badges = [];
  if(bingo.ganadorLinea === asiento) badges.push('<span class="bingo-badge">Línea</span>');
  if(bingo.ganadorCartonLleno === asiento) badges.push('<span class="bingo-badge bingo-badge-full">¡BINGO!</span>');
  return `
    <div class="bingo-carton">
      <div class="bingo-carton-titulo">${titulo} ${badges.join(' ')}</div>
      <div class="bingo-grid" style="grid-template-columns:repeat(${BINGO_TAMANO_CARTON},1fr)">
        ${carton.nombres.map((n, i) => `<div class="bingo-celda ${marcados.includes(i) ? 'bingo-marcada' : ''}">${n}</div>`).join('')}
      </div>
    </div>`;
}

function bingoPinHTML(){
  if(!bingoMostrandoPin){
    return `<button class="btn-organizador-link" onclick="bingoMostrarPinOrganizador()">👤 ¿Sos el organizador? Entrá acá</button>`;
  }
  return `
    <div class="bingo-pin-box">
      <input type="password" id="bingo-pin-input" class="bingo-input-numero" inputmode="numeric" maxlength="4" placeholder="PIN del organizador">
      <button class="btn-primary" onclick="bingoIntentarSerOrganizador()">Entrar como organizador</button>
      <p id="bingo-pin-error" class="bingo-pin-error"></p>
    </div>`;
}

function bingoOrdenAsientos(mapa){
  return Object.keys(mapa).sort((a, b) => Number(a) - Number(b));
}

function renderBingo(){
  const container = document.getElementById('bingo-content');
  if(!container || !bingo) return;

  if(bingoEsOrganizador()){
    renderBingoOrganizador(container);
    return;
  }
  renderBingoPasajero(container);
}

function renderBingoOrganizador(container){
  // El organizador no juega, así que no cuenta como "pasajero esperando armar cartón".
  const asientos = bingoOrdenAsientos(bingoPasajeros).filter(a => a !== String(miAsiento));
  const completos = asientos.filter(a => bingoCartones[a] && bingoCartones[a].nombres && bingoCartones[a].nombres.length === BINGO_CANTIDAD_CARTON);

  if(bingo.fase === 'esperando'){
    const listaHTML = asientos.length
      ? asientos.map(a => {
        const listo = bingoCartones[a] && bingoCartones[a].nombres && bingoCartones[a].nombres.length === BINGO_CANTIDAD_CARTON;
        return `<div class="bingo-roster-item ${listo ? 'bingo-roster-listo' : ''}">
          <span>Asiento ${a} — ${bingoPasajeros[a]}</span>
          <span class="bingo-roster-derecha">
            <span>${listo ? '✓ Listo' : 'Armando cartón...'}</span>
            <button class="btn-eliminar-pasajero" onclick="bingoEliminarPasajero('${a}')" title="Sacar del bingo">✕</button>
          </span>
        </div>`;
      }).join('')
      : '<p style="color:var(--gray);font-size:13px;">Todavía no entró nadie con su nombre y asiento.</p>';
    container.innerHTML = `
      <div class="section-label">Panel del organizador</div>
      <div class="hero" style="margin-top:8px;">
        <h2>Esperando los cartones</h2>
        <p>${completos.length} de ${asientos.length} pasajeros ya armaron su cartón de ${BINGO_CANTIDAD_CARTON} nombres. Empezá cuando quieras, no hace falta que estén todos.</p>
      </div>
      <div class="bingo-roster">${listaHTML}</div>
      <button class="btn-primary" onclick="bingoEmpezarJuego()" ${asientos.length ? '' : 'disabled'}>Empezar el bingo</button>
      <p class="link-chico" onclick="bingoCerrarSesionOrganizador()">Cerrar sesión de organizador</p>`;
    return;
  }

  // fase 'jugando'
  const terminado = !!bingo.ganadorCartonLleno;
  const bolsa = bingo.bolsa || [];
  const sorteados = bingo.sorteados || [];
  const historialHTML = sorteados.length
    ? sorteados.slice().reverse().map((n, i) => `<span class="bingo-chip${i === 0 ? ' bingo-chip-ultimo' : ''}">${n}</span>`).join('')
    : '<span class="bingo-chip bingo-chip-vacio">Todavía nada</span>';
  const bannerFinal = terminado ? `<div class="hero" style="margin-top:8px;"><h2>¡BINGO!</h2><p>Ganó ${bingoPasajeros[bingo.ganadorCartonLleno]} (asiento ${bingo.ganadorCartonLleno}) con el cartón lleno.</p></div>` : '';
  container.innerHTML = `
    <div class="section-label">Panel del organizador</div>
    ${bannerFinal}
    <div class="bingo-sorteo">
      <div class="bingo-ultimo">${bingo.ultimaLlamada || '—'}</div>
      ${terminado
        ? `<button class="btn-primary" onclick="bingoJugarDeNuevo()">Jugar de nuevo</button>`
        : `<button class="btn-primary" onclick="bingoSortear()" ${bolsa.length === 0 ? 'disabled' : ''}>Cantar nombre</button>`}
    </div>
    <div class="section-label">Ya salieron (${sorteados.length}/${Object.keys(bingoPasajeros).length})</div>
    <div class="bingo-historial">${historialHTML}</div>
    <p class="link-chico" onclick="bingoCerrarSesionOrganizador()">Cerrar sesión de organizador</p>`;
}

function renderBingoPasajero(container){
  if(!miAsiento || !miNombre){
    container.innerHTML = `<p style="color:var(--gray);font-size:13px;">Volvé al inicio y completá tu nombre y asiento para jugar.</p>`;
    return;
  }

  const miCarton = bingoCartones[String(miAsiento)];
  const tengoCartonCompleto = !!(miCarton && miCarton.nombres && miCarton.nombres.length === BINGO_CANTIDAD_CARTON);

  if(bingo.fase === 'esperando' && !tengoCartonCompleto){
    const asientosDisponibles = bingoOrdenAsientos(bingoPasajeros);
    const faltan = BINGO_CANTIDAD_CARTON - asientosDisponibles.length;
    const itemNombre = (asiento) => {
      const marcado = bingoSeleccion.includes('n:' + asiento);
      return `<div class="bingo-nombre-item ${marcado ? 'bingo-nombre-elegido' : ''}" onclick="bingoToggleNombre('${asiento}')">${bingoNombreConAsiento(asiento)}</div>`;
    };
    const itemNumero = (n) => {
      const marcado = bingoSeleccion.includes('#' + n);
      return `<div class="bingo-nombre-item ${marcado ? 'bingo-nombre-elegido' : ''}" onclick="bingoToggleNumero('${n}')">${n}</div>`;
    };
    const seccionNumeros = faltan > 0
      ? `<div class="section-label">Como son menos de ${BINGO_CANTIDAD_CARTON} pasajeros, completá con números</div>
         <div class="bingo-lista-nombres">${BINGO_NUMEROS_EXTRA.map(itemNumero).join('')}</div>`
      : '';
    container.innerHTML = `
      ${bingoPinHTML()}
      <div class="hero" style="margin-top:8px;">
        <h2>Armá tu cartón</h2>
        <p>Elegí exactamente ${BINGO_CANTIDAD_CARTON} nombres o números para tu cartón. Vas a jugar con el asiento ${miAsiento}.</p>
      </div>
      <div class="section-label">Elegidos: ${bingoSeleccion.length}/${BINGO_CANTIDAD_CARTON}</div>
      <div class="bingo-lista-nombres">${asientosDisponibles.length ? asientosDisponibles.map(itemNombre).join('') : '<p style="color:var(--gray);font-size:13px;">Todavía no hay otros pasajeros anotados.</p>'}</div>
      ${seccionNumeros}
      <button class="btn-primary" onclick="bingoConfirmarCarton()" ${bingoSeleccion.length === BINGO_CANTIDAD_CARTON ? '' : 'disabled'}>Confirmar mi cartón</button>`;
    return;
  }

  if(bingo.fase === 'esperando' && tengoCartonCompleto){
    const asientos = Object.keys(bingoPasajeros);
    const completos = asientos.filter(a => bingoCartones[a] && bingoCartones[a].nombres && bingoCartones[a].nombres.length === BINGO_CANTIDAD_CARTON);
    container.innerHTML = `
      ${bingoPinHTML()}
      <div class="hero" style="margin-top:8px;">
        <h2>Ya armaste tu cartón</h2>
        <p>Esperando a que el resto del grupo complete el suyo (${completos.length}/${asientos.length}).</p>
      </div>
      ${bingoCartonHTML(String(miAsiento), `Tu cartón (asiento ${miAsiento})`, miCarton)}`;
    return;
  }

  // fase 'jugando'
  const terminado = !!bingo.ganadorCartonLleno;
  const sorteados = bingo.sorteados || [];
  const historialHTML = sorteados.length
    ? sorteados.slice().reverse().map((n, i) => `<span class="bingo-chip${i === 0 ? ' bingo-chip-ultimo' : ''}">${n}</span>`).join('')
    : '<span class="bingo-chip bingo-chip-vacio">Todavía nada</span>';
  const bannerFinal = terminado ? `<div class="hero" style="margin-top:8px;"><h2>¡BINGO!</h2><p>Ganó ${bingoPasajeros[bingo.ganadorCartonLleno]} (asiento ${bingo.ganadorCartonLleno}) con el cartón lleno.</p></div>` : '';
  container.innerHTML = `
    ${bingoPinHTML()}
    <div class="section-label">Tu asiento es el ${miAsiento}</div>
    ${bannerFinal}
    <div class="bingo-sorteo">
      <div class="bingo-ultimo">${bingo.ultimaLlamada || '—'}</div>
      <p class="bingo-espera">${terminado ? 'Esperá a que el organizador arranque otra partida.' : 'El organizador va cantando los nombres.'}</p>
    </div>
    <div class="section-label">Ya salieron (${sorteados.length}/${Object.keys(bingoPasajeros).length})</div>
    <div class="bingo-historial">${historialHTML}</div>
    ${miCarton ? bingoCartonHTML(String(miAsiento), `Tu cartón (asiento ${miAsiento})`, miCarton) : ''}`;
}
