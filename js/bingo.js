let bingo = null;
let bingoPasajeros = {};
let bingoCartones = {};
let bingoSeleccion = [];
let bingoMostrandoPin = false;

// PIN para reclamar el rol de organizador. Es una traba simple, no seguridad
// real (el código es público) — alcanza para que ningún pasajero lo toque sin querer.
const BINGO_PIN_ORGANIZADOR = '2314';
const BINGO_CANTIDAD_CARTON = 12;
const BINGO_TAMANO_CARTON = 3;
// Números del cartón: 00 al 99, como en un bingo/lotería tradicional.
const BINGO_NUMEROS = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'));

// Significado de cada número al estilo de las loterías populares (libro de los
// sueños): se canta el número y, al lado, su significado.
const BINGO_SIGNIFICADOS = [
  'el huevo', 'el sol', 'la luna', 'el gato', 'la casa', 'el perro', 'la serpiente', 'la suerte',
  'el dinero', 'el viaje', 'el pez', 'los mellizos', 'el reloj', 'la mala suerte', 'la fiesta', 'la niña',
  'el vino', 'la discusión', 'el engaño', 'el cura', 'el político', 'el marinero', 'el loco', 'la mujer',
  'el toro', 'el auto', 'la mentira', 'el general', 'el casamiento', 'el café', 'el árbol', 'el rey',
  'el avión', 'la cruz', 'el corazón', 'la abeja', 'el cementerio', 'el barco', 'el ladrón', 'el sombrero',
  'el caballo', 'el policía', 'el pan', 'el fuego', 'los dientes', 'la lluvia', 'el vecino', 'el preso',
  'el muerto', 'el chancho', 'el tren', 'la bandera', 'el baile', 'la carta', 'el dinero perdido', 'el tesoro',
  'el robo', 'el regalo', 'el barrio', 'el teléfono', 'la vejez', 'el mar', 'la tormenta', 'la escuela',
  'el trabajo', 'la familia', 'el chisme', 'el terreno', 'el vestido', 'el amor', 'el fantasma', 'la sorpresa',
  'el regreso', 'el pájaro', 'el puente', 'el sueño', 'el espejo', 'la suerte doble', 'el paraguas', 'el camino',
  'la montaña', 'el río', 'el desierto', 'la estrella', 'el reloj de arena', 'el fuego lento', 'el invierno', 'el verano',
  'el manantial', 'el otoño', 'la primavera', 'el anillo', 'la boda', 'el bebé', 'la escalera', 'el puerto',
  'la brújula', 'el faro', 'el ancla', 'el horizonte',
];

function bingoArmarLlamada(numero){
  const significado = BINGO_SIGNIFICADOS[Number(numero)] || '';
  return `<span class="bingo-numero-resaltado">${numero}</span><span class="bingo-numero-significado">${significado}</span>`;
}

// ---- Multi-celular: cada pasajero entra con su nombre + asiento (ya elegidos
// al principio, en el onboarding) y arma su propio cartón eligiendo
// BINGO_CANTIDAD_CARTON números del 00 al 99. El organizador puede empezar
// cuando quiera, sin esperar a que todos completen. Ser organizador es una
// marca local del celular (vía PIN), no depende de quién llegó primero ni se
// pierde si se reinicia la partida.
//
// El marcado del cartón es manual: cada uno toca sus propios números a
// medida que van saliendo (no se marcan solos). Para que nadie pueda tocar
// un número que no salió y "ganar" por error, bingoTocarNumero() solo
// acepta el toque si ese número ya está en bingo.sorteados — así, si el
// sistema detecta un cartón lleno, es matemáticamente imposible que sea un
// falso positivo: todo lo marcado fue, sin excepción, validado contra lo
// que realmente se cantó. ----

function bingoRefEstado(){ return db.ref(`salas/${codigoViaje}/bingo/estado`); }
function bingoRefPasajeros(){ return db.ref(`salas/${codigoViaje}/bingo/pasajeros`); }
function bingoRefCartones(){ return db.ref(`salas/${codigoViaje}/bingo/cartones`); }

function bingoEstadoVacio(){
  return { fase: 'esperando', bolsa: [], sorteados: [], ultimaLlamada: null, ganadorCartonLleno: null };
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
      const anterior = bingo;
      bingo = Object.assign(bingoEstadoVacio(), snap.val() || {});
      // El sonido se dispara acá (no en bingoSortear) para que suene en el
      // celular de cada pasajero cuando le llega el número nuevo, no solo en
      // el del organizador que lo sorteó.
      if(anterior){
        if((bingo.sorteados || []).length > (anterior.sorteados || []).length) reproducirTono('tick');
        if(bingo.ganadorCartonLleno && !anterior.ganadorCartonLleno) reproducirTono('bonus');
      }
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
  if(typeof renderImpostor === 'function') renderImpostor();
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
  // El mismo PIN también da el rol de director en El Impostor — si esa
  // pantalla está abierta (o se abrió antes en esta sesión), se refresca
  // también para que aparezcan sus controles sin tener que ir y volver.
  if(typeof renderImpostor === 'function') renderImpostor();
}

function bingoToggleNumero(numero){
  const idx = bingoSeleccion.indexOf(numero);
  if(idx !== -1){
    bingoSeleccion.splice(idx, 1);
  } else if(bingoSeleccion.length < BINGO_CANTIDAD_CARTON){
    bingoSeleccion.push(numero);
  }
  renderBingo();
}

function bingoConfirmarCarton(){
  if(bingoSeleccion.length !== BINGO_CANTIDAD_CARTON || !miAsiento) return;
  const numeros = barajar(bingoSeleccion.slice());
  bingoRefCartones().child(String(miAsiento)).set({ nombres: numeros, marcados: [] });
}

function bingoEmpezarJuego(){
  if(!bingoEsOrganizador()) return;
  const asientos = Object.keys(bingoPasajeros);
  if(!asientos.length) return;
  bingo.bolsa = barajar(BINGO_NUMEROS.slice());
  bingo.sorteados = [];
  bingo.ultimaLlamada = null;
  bingo.ganadorCartonLleno = null;
  bingo.fase = 'jugando';
  bingoGuardarEstado();
}

function bingoSortear(){
  if(!bingoEsOrganizador()) return;
  bingo.bolsa = bingo.bolsa || [];
  if(!bingo.bolsa.length) return;
  const numero = bingo.bolsa.pop();
  bingo.sorteados = bingo.sorteados || [];
  bingo.sorteados.push(numero);
  bingo.ultimaLlamada = bingoArmarLlamada(numero);
  bingoGuardarEstado();
}

// Cada pasajero toca sus propios números a medida que van saliendo. Solo se
// acepta si el número ya fue cantado (si no, no hace nada — así no hay
// forma de marcar por error algo que no salió). Tocar de nuevo un número ya
// marcado lo desmarca, por si alguien se confunde de casillero.
function bingoTocarNumero(indice){
  if(!miAsiento) return;
  if(!bingo || bingo.fase !== 'jugando') return;
  const miCarton = bingoCartones[String(miAsiento)];
  if(!miCarton || !miCarton.nombres) return;
  const numero = miCarton.nombres[indice];
  if(!(bingo.sorteados || []).includes(numero)) return;

  const marcados = (miCarton.marcados || []).slice();
  const idx = marcados.indexOf(indice);
  if(idx !== -1) marcados.splice(idx, 1);
  else marcados.push(indice);
  miCarton.marcados = marcados;
  bingoRefCartones().child(String(miAsiento)).child('marcados').set(marcados);

  // Como cada marca ya está validada contra lo realmente sorteado, un
  // cartón lleno acá es un bingo genuino — se declara desde el propio
  // celular del ganador, así las monedas se acreditan a quien corresponde.
  if(marcados.length === BINGO_CANTIDAD_CARTON && !bingo.ganadorCartonLleno){
    bingo.ganadorCartonLleno = String(miAsiento);
    bingoGuardarEstado();
    ganarMonedas(100);
    mostrarToast('¡BINGO! +100 monedas', 'gain');
  }
}

// Repite el sorteo con los mismos cartones (no hace falta rearmarlos a mano de nuevo).
function bingoJugarDeNuevo(){
  if(!bingoEsOrganizador()) return;
  Object.values(bingoCartones).forEach(c => { c.marcados = []; });
  bingo.bolsa = barajar(BINGO_NUMEROS.slice());
  bingo.sorteados = [];
  bingo.ultimaLlamada = null;
  bingo.ganadorCartonLleno = null;
  bingo.fase = 'jugando';
  bingoGuardarEstado();
  bingoRefCartones().set(bingoCartones);
}

// interactivo = true solo cuando se muestra el propio cartón durante la
// partida: ahí cada celda se puede tocar. Antes de empezar (armando el
// cartón) o mostrándole a alguien un cartón ajeno, queda solo de lectura.
function bingoCartonHTML(asiento, titulo, carton, interactivo){
  const marcados = carton.marcados || [];
  const sorteados = (bingo && bingo.sorteados) || [];
  const badges = [];
  if(bingo.ganadorCartonLleno === asiento) badges.push('<span class="bingo-badge bingo-badge-full">¡BINGO!</span>');
  return `
    <div class="bingo-carton">
      <div class="bingo-carton-titulo">${titulo} ${badges.join(' ')}</div>
      <div class="bingo-grid" style="grid-template-columns:repeat(${BINGO_TAMANO_CARTON},1fr)">
        ${carton.nombres.map((n, i) => {
          const marcado = marcados.includes(i);
          const disponible = !marcado && sorteados.includes(n);
          const clases = ['bingo-celda'];
          if(marcado) clases.push('bingo-marcada');
          if(interactivo && disponible) clases.push('bingo-celda-disponible');
          if(interactivo) clases.push('bingo-celda-clickeable');
          const onclick = interactivo ? ` onclick="bingoTocarNumero(${i})"` : '';
          return `<div class="${clases.join(' ')}"${onclick}>${n}</div>`;
        }).join('')}
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
        <p>${completos.length} de ${asientos.length} pasajeros ya armaron su cartón de ${BINGO_CANTIDAD_CARTON} números. Empezá cuando quieras, no hace falta que estén todos.</p>
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
  // Con cartones de 12 números puede pasar que se canten los 100 y nadie
  // complete el suyo — sin esto, el botón quedaba en "Cantar número"
  // deshabilitado para siempre, sin ninguna forma de arrancar de nuevo.
  const bolsaAgotada = !terminado && bolsa.length === 0;
  const historialHTML = sorteados.length
    ? sorteados.slice().reverse().map((n, i) => `<span class="bingo-chip${i === 0 ? ' bingo-chip-ultimo' : ''}">${n}</span>`).join('')
    : '<span class="bingo-chip bingo-chip-vacio">Todavía nada</span>';
  const bannerFinal = terminado
    ? `<div class="hero" style="margin-top:8px;"><h2>¡BINGO!</h2><p>Ganó ${bingoPasajeros[bingo.ganadorCartonLleno]} (asiento ${bingo.ganadorCartonLleno}) con el cartón lleno.</p></div>`
    : bolsaAgotada
      ? `<div class="hero" style="margin-top:8px;"><h2>Se cantaron los 100 números</h2><p>Nadie completó el cartón esta vez.</p></div>`
      : '';
  container.innerHTML = `
    <div class="section-label">Panel del organizador</div>
    ${bannerFinal}
    <div class="bingo-sorteo">
      <div class="bingo-ultimo">${bingo.ultimaLlamada || '—'}</div>
      ${terminado || bolsaAgotada
        ? `<button class="btn-primary" onclick="bingoJugarDeNuevo()">Jugar de nuevo</button>`
        : `<button class="btn-primary" onclick="bingoSortear()" ${bolsa.length === 0 ? 'disabled' : ''}>Cantar número</button>`}
    </div>
    <div class="section-label">Ya salieron (${sorteados.length}/${BINGO_NUMEROS.length})</div>
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

  // Sin el chequeo de fase, alguien que todavía no armó su cartón cuando el
  // organizador ya arrancó (o volvió a jugar) quedaba trabado para siempre,
  // sin ninguna forma de sumarse — ahora puede armarlo en cualquier momento
  // y arranca directo tocando los números que ya salieron.
  if(!tengoCartonCompleto){
    const itemNumero = (n) => {
      const marcado = bingoSeleccion.includes(n);
      return `<div class="bingo-nombre-item ${marcado ? 'bingo-nombre-elegido' : ''}" onclick="bingoToggleNumero('${n}')">${n}</div>`;
    };
    container.innerHTML = `
      ${bingoPinHTML()}
      <div class="hero" style="margin-top:8px;">
        <h2>Armá tu cartón</h2>
        <p>Elegí exactamente ${BINGO_CANTIDAD_CARTON} números del 00 al 99. Vas a jugar con el asiento ${miAsiento}.</p>
      </div>
      <div class="section-label">Elegidos: ${bingoSeleccion.length}/${BINGO_CANTIDAD_CARTON}</div>
      <div class="bingo-lista-nombres">${BINGO_NUMEROS.map(itemNumero).join('')}</div>
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
      ${bingoCartonHTML(String(miAsiento), `Tu cartón (asiento ${miAsiento})`, miCarton, false)}`;
    return;
  }

  // fase 'jugando'
  const terminado = !!bingo.ganadorCartonLleno;
  const bolsaAgotada = !terminado && (bingo.bolsa || []).length === 0;
  const sorteados = bingo.sorteados || [];
  const historialHTML = sorteados.length
    ? sorteados.slice().reverse().map((n, i) => `<span class="bingo-chip${i === 0 ? ' bingo-chip-ultimo' : ''}">${n}</span>`).join('')
    : '<span class="bingo-chip bingo-chip-vacio">Todavía nada</span>';
  const bannerFinal = terminado
    ? `<div class="hero" style="margin-top:8px;"><h2>¡BINGO!</h2><p>Ganó ${bingoPasajeros[bingo.ganadorCartonLleno]} (asiento ${bingo.ganadorCartonLleno}) con el cartón lleno.</p></div>`
    : bolsaAgotada
      ? `<div class="hero" style="margin-top:8px;"><h2>Se cantaron los 100 números</h2><p>Nadie completó el cartón esta vez.</p></div>`
      : '';
  container.innerHTML = `
    ${bingoPinHTML()}
    <div class="section-label">Tu asiento es el ${miAsiento}</div>
    ${bannerFinal}
    <div class="bingo-sorteo">
      <div class="bingo-ultimo">${bingo.ultimaLlamada || '—'}</div>
      <p class="bingo-espera">${terminado || bolsaAgotada ? 'Esperá a que el organizador arranque otra partida.' : 'El organizador va cantando los números.'}</p>
    </div>
    <div class="section-label">Ya salieron (${sorteados.length}/${BINGO_NUMEROS.length})</div>
    <div class="bingo-historial">${historialHTML}</div>
    ${miCarton ? bingoCartonHTML(String(miAsiento), `Tu cartón (asiento ${miAsiento})`, miCarton, !terminado && !bolsaAgotada) : ''}
    ${!terminado && !bolsaAgotada ? '<p class="bingo-espera">Tocá tus números a medida que van saliendo.</p>' : ''}`;
}
