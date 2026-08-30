// Tutti Frutti / Basta: se juega contra el resto de los pasajeros del mismo
// código de viaje, reusando el patrón de sala compartida por Firebase que ya
// usa Bingo. Los pasajeros se anotan en una lista (como en Bingo), y es el
// organizador quien decide cuándo cerrar la anotación y arrancar, quien corta
// la ronda tocando "¡BASTA!", y quien puede terminar el juego en cualquier
// momento. El organizador no juega, solo administra — igual que en Bingo.

const TUTI_CATEGORIAS = ['Nombre', 'Animal', 'Color', 'Comida', 'País', 'Cosa'];
// Se excluyen solo las letras realmente difíciles en español (Ñ, W, X).
const TUTI_LETRAS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','Y','Z'];
const TUTI_DURACION_SEG = 75;
const TUTI_PUNTOS_UNICA = 10;
const TUTI_PUNTOS_REPETIDA = 5;
const TUTI_SORTEO_INTERVALO_MS = 90;

let tuti = null;
let tutiAnotados = {}; // { asiento: nombre } de quienes se anotaron para jugar
let tutiRespuestas = {}; // respuestas de TODOS los pasajeros de la ronda actual, por asiento
let tutiMisRespuestas = {}; // borrador local (para no perder lo tipeado si el estado se actualiza)
let tutiTimerId = null;
let tutiRondaPuntuada = null; // evita sumar monedas dos veces por la misma ronda
let tutiSorteoTimerId = null;
let tutiLetraSorteo = null; // letra que se ve "pasando" en el cartel, mientras el organizador no para el sorteo

function tutiEstadoVacio(){
  return { fase: 'lobby', letra: null, categorias: [], inicio: null, duracionSeg: TUTI_DURACION_SEG, ronda: 0, usadas: [] };
}

// Letras que todavía no salieron en este juego. Si ya salieron todas, se
// vuelve a barajar el mazo completo en vez de trabarse sin letras.
function tutiLetrasDisponibles(){
  const usadas = (tuti && tuti.usadas) || [];
  const disponibles = TUTI_LETRAS.filter(l => !usadas.includes(l));
  return disponibles.length ? disponibles : TUTI_LETRAS.slice();
}

function tutiRefEstado(){ return db.ref(`salas/${codigoViaje}/tutifruti/estado`); }
function tutiRefAnotados(){ return db.ref(`salas/${codigoViaje}/tutifruti/anotados`); }
function tutiRefRespuestas(){ return db.ref(`salas/${codigoViaje}/tutifruti/rondas/${tuti ? tuti.ronda : 0}/respuestas`); }

// Sin tildes/mayúsculas, para comparar palabras de forma justa aunque las
// escriban distinto (con o sin acento).
function tutiNormalizar(txt){
  return (txt || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

let tutiListenersListos = false;

function iniciarTutifruti(){
  if(!tutiListenersListos){
    tutiListenersListos = true;
    tutiRefEstado().on('value', snap => {
      const anterior = tuti;
      tuti = Object.assign(tutiEstadoVacio(), snap.val() || {});
      if(anterior && anterior.ronda !== tuti.ronda){
        tutiMisRespuestas = {};
        tutiRespuestas = {};
      }
      if(tuti.fase === 'jugando') tutiEscucharRespuestas();
      tutiTickTimer();
      renderTutifruti();
    });
    tutiRefAnotados().on('value', snap => {
      tutiAnotados = snap.val() || {};
      renderTutifruti();
    });
  } else {
    renderTutifruti();
  }
}

function tutiEscucharRespuestas(){
  tutiRefRespuestas().on('value', snap => {
    tutiRespuestas = snap.val() || {};
    if(tuti && tuti.fase === 'resultados') renderTutifruti();
  });
}

function tutiAnotarme(){
  if(!miAsiento) return;
  tutiRefAnotados().child(String(miAsiento)).set(miNombre);
}

// El organizador puede sacar a alguien de la lista antes de arrancar, igual
// que en Bingo.
function tutiSacarAnotado(asiento){
  if(!bingoEsOrganizador()) return;
  tutiRefAnotados().child(String(asiento)).remove();
}

// El organizador manda a sortear: pasa a la fase "sorteando" (los pasajeros
// ven que se está por elegir letra) y en SU pantalla arranca el cartel con
// las letras pasando rápido, listo para que las pare cuando quiera.
function tutiIniciarSorteo(){
  if(!bingoEsOrganizador()) return;
  if(!tuti || (tuti.fase !== 'lobby' && tuti.fase !== 'resultados')) return;
  tutiRefEstado().child('fase').set('sorteando');
}

// Arranca (o retoma, si el organizador salió y volvió a entrar) la animación
// local del cartel. Es solo visual: no se sincroniza entre celulares, cada
// organizador ve su propio cartel pasando hasta que lo para.
function tutiAsegurarSorteoAnimado(){
  if(tutiSorteoTimerId) return;
  const disponibles = tutiLetrasDisponibles();
  tutiLetraSorteo = disponibles[Math.floor(Math.random() * disponibles.length)];
  tutiSorteoTimerId = setInterval(() => {
    const vistaActiva = document.querySelector('.view.active');
    if(!vistaActiva || vistaActiva.id !== 'view-tutifruti' || !tuti || tuti.fase !== 'sorteando'){
      clearInterval(tutiSorteoTimerId);
      tutiSorteoTimerId = null;
      return;
    }
    const disp = tutiLetrasDisponibles();
    tutiLetraSorteo = disp[Math.floor(Math.random() * disp.length)];
    renderTutifruti();
  }, TUTI_SORTEO_INTERVALO_MS);
}

// El organizador para el cartel: la letra que haya quedado a la vista es la
// que arranca la ronda para todos, y queda marcada como usada para que no
// vuelva a salir hasta que se termine el mazo de letras.
function tutiPararSorteo(){
  if(!bingoEsOrganizador()) return;
  if(!tuti || tuti.fase !== 'sorteando') return;
  clearInterval(tutiSorteoTimerId);
  tutiSorteoTimerId = null;
  const disponibles = tutiLetrasDisponibles();
  const letra = (tutiLetraSorteo && disponibles.includes(tutiLetraSorteo)) ? tutiLetraSorteo : disponibles[Math.floor(Math.random() * disponibles.length)];
  // Si tutiLetrasDisponibles() tuvo que rebarajar el mazo completo, arranca
  // la lista de usadas de cero; si no, sigue sumando a la que ya había.
  const usadasPrevias = disponibles.length === TUTI_LETRAS.length ? [] : (tuti.usadas || []);
  const nuevaRonda = (tuti.ronda || 0) + 1;
  db.ref(`salas/${codigoViaje}/tutifruti/estado`).set({
    fase: 'jugando',
    letra,
    categorias: TUTI_CATEGORIAS,
    inicio: Date.now(),
    duracionSeg: TUTI_DURACION_SEG,
    ronda: nuevaRonda,
    usadas: [...usadasPrevias, letra],
  });
}

function tutiActualizarRespuesta(categoria, valor){
  tutiMisRespuestas[categoria] = valor;
  if(!miAsiento) return;
  tutiRefRespuestas().child(String(miAsiento)).set({ nombre: miNombre, palabras: tutiMisRespuestas });
}

// Solo el organizador corta la ronda para todos, igual que gritar "¡Basta!"
// en la mesa real siendo quien maneja el juego.
function tutiBasta(){
  if(!bingoEsOrganizador()) return;
  if(!tuti || tuti.fase !== 'jugando') return;
  tutiCerrarRonda();
}

function tutiCerrarRonda(){
  tutiRefEstado().child('fase').set('resultados');
}

// El organizador puede terminar el juego en cualquier momento: se borra todo
// (anotados, ronda actual e historial) y vuelve a quedar un lobby vacío.
function tutiTerminarJuego(){
  if(!bingoEsOrganizador()) return;
  db.ref(`salas/${codigoViaje}/tutifruti`).remove();
}

function tutiTiempoRestante(){
  if(!tuti || !tuti.inicio) return tuti ? tuti.duracionSeg : TUTI_DURACION_SEG;
  const transcurrido = Math.floor((Date.now() - tuti.inicio) / 1000);
  return Math.max(0, tuti.duracionSeg - transcurrido);
}

function tutiTickTimer(){
  clearInterval(tutiTimerId);
  if(!tuti || tuti.fase !== 'jugando') return;
  tutiTimerId = setInterval(() => {
    const vistaActiva = document.querySelector('.view.active');
    if(!vistaActiva || vistaActiva.id !== 'view-tutifruti'){
      clearInterval(tutiTimerId);
      return;
    }
    const restante = tutiTiempoRestante();
    if(restante <= 0){
      clearInterval(tutiTimerId);
      // Solo el organizador cierra la ronda: si es el celular de un pasajero,
      // se limita a esperar a que el estado cambie solo por Firebase.
      if(bingoEsOrganizador()) tutiCerrarRonda();
      return;
    }
    if(restante <= 5) reproducirTono('tick');
    renderTutifruti();
  }, 1000);
}

// Palabra válida: no vacía y arranca con la letra de la ronda (sin importar
// tilde/mayúscula). Entre las válidas de una misma categoría, si nadie más
// escribió lo mismo suma el puntaje completo; si se repite con otro
// pasajero, suma la mitad (como en el juego real, donde empatar resta).
function tutiCalcularPuntajes(){
  const letra = tutiNormalizar(tuti.letra);
  const asientos = Object.keys(tutiRespuestas);
  const puntos = {};
  asientos.forEach(a => { puntos[a] = 0; });

  (tuti.categorias || []).forEach(categoria => {
    const porAsiento = asientos.map(a => {
      const palabra = (tutiRespuestas[a].palabras || {})[categoria] || '';
      const norm = tutiNormalizar(palabra);
      const valida = norm.length > 0 && norm.startsWith(letra);
      return { asiento: a, palabra, norm, valida };
    });
    porAsiento.forEach(entrada => {
      if(!entrada.valida) return;
      const repetida = porAsiento.some(otra => otra.asiento !== entrada.asiento && otra.valida && otra.norm === entrada.norm);
      puntos[entrada.asiento] += repetida ? TUTI_PUNTOS_REPETIDA : TUTI_PUNTOS_UNICA;
    });
  });
  return puntos;
}

function tutiSumarMisMonedasSiCorresponde(puntos){
  if(!miAsiento || tutiRondaPuntuada === tuti.ronda) return;
  tutiRondaPuntuada = tuti.ronda;
  const total = puntos[String(miAsiento)] || 0;
  if(total > 0) ganarMonedas(total);
}

function tutiOrdenAsientos(mapa){
  return Object.keys(mapa).sort((a, b) => Number(a) - Number(b));
}

function renderTutifruti(){
  const cont = document.getElementById('tutifruti-content');
  if(!cont || !tuti) return;
  document.getElementById('tutifruti-sub').textContent =
    tuti.fase === 'lobby' ? 'Contra el resto del viaje' :
    tuti.fase === 'sorteando' ? 'Sorteando la letra...' :
    tuti.fase === 'jugando' ? `Letra ${tuti.letra}` : 'Resultados de la ronda';

  if(bingoEsOrganizador()){
    renderTutifrutiOrganizador(cont);
    return;
  }
  renderTutifrutiPasajero(cont);
}

function tutiUsadasHTML(){
  const usadas = (tuti && tuti.usadas) || [];
  if(!usadas.length) return '';
  return `<p class="tienda-nota">Letras que ya salieron: ${usadas.join(', ')}</p>`;
}

function tutiListaAnotadosHTML(conBotonSacar){
  const asientos = tutiOrdenAsientos(tutiAnotados);
  if(!asientos.length) return '<p style="color:var(--gray);font-size:13px;">Todavía no se anotó nadie.</p>';
  return `<div class="bingo-roster">${asientos.map(a => `
    <div class="bingo-roster-item">
      <span>Asiento ${a} — ${tutiAnotados[a]}</span>
      ${conBotonSacar ? `<span class="bingo-roster-derecha"><button class="btn-eliminar-pasajero" onclick="tutiSacarAnotado('${a}')" title="Sacar de la lista">✕</button></span>` : ''}
    </div>`).join('')}</div>`;
}

function renderTutifrutiOrganizador(cont){
  if(tuti.fase === 'lobby'){
    const asientos = Object.keys(tutiAnotados);
    cont.innerHTML = `
      <div class="section-label">Panel del organizador</div>
      <div class="hero" style="margin-top:8px;">
        <h2>🔤 Tutti Frutti</h2>
        <p>Categorías: ${TUTI_CATEGORIAS.join(', ')}. Los pasajeros se anotan acá abajo; arrancá cuando estén todos.</p>
      </div>
      ${tutiListaAnotadosHTML(true)}
      <button class="btn-primary" onclick="tutiIniciarSorteo()" ${asientos.length ? '' : 'disabled'}>Cerrar anotación y sortear letra</button>`;
    return;
  }

  if(tuti.fase === 'sorteando'){
    tutiAsegurarSorteoAnimado();
    cont.innerHTML = `
      <div class="section-label">Panel del organizador</div>
      <p class="tienda-nota">Mirá el cartel y pará cuando quieras — esa letra es la de la ronda.</p>
      <div class="tuti-sorteo">
        <div class="tuti-sorteo-letra">${tutiLetraSorteo || '?'}</div>
        <button class="btn-primary" onclick="tutiPararSorteo()">¡Parar acá!</button>
      </div>
      ${tutiUsadasHTML()}`;
    return;
  }

  if(tuti.fase === 'jugando'){
    const restante = tutiTiempoRestante();
    const urgente = restante <= 5;
    cont.innerHTML = `
      <div class="section-label">Panel del organizador</div>
      <div class="valija-topbar">
        <div class="valija-topbar-info">
          <span class="valija-topbar-emoji">🔤</span>
          <span class="valija-topbar-destino">Con la letra ${tuti.letra}</span>
        </div>
        <div class="valija-timer ${urgente ? 'valija-timer-urgente' : ''}">${restante}</div>
      </div>
      <p class="tienda-nota">Los pasajeros están completando sus categorías. Cortá cuando quieras.</p>
      <button class="btn-primary tuti-basta" onclick="tutiBasta()">¡BASTA!</button>
      <p class="link-chico" onclick="tutiTerminarJuego()">Terminar el juego</p>`;
    return;
  }

  // fase === 'resultados'
  const puntos = tutiCalcularPuntajes();
  const asientos = Object.keys(tutiRespuestas).sort((a,b) => (puntos[b]||0) - (puntos[a]||0));
  cont.innerHTML = `
    <div class="section-label">Panel del organizador</div>
    <div class="hero" style="margin-top:8px;">
      <h2>Letra ${tuti.letra}</h2>
      <p>Categorías: ${(tuti.categorias || []).join(', ')}</p>
    </div>
    <div class="tuti-resultados">${tutiFilasResultadosHTML(asientos, puntos)}</div>
    <button class="btn-primary" onclick="tutiIniciarSorteo()">Sortear letra para otra ronda</button>
    ${tutiUsadasHTML()}
    <p class="link-chico" onclick="tutiTerminarJuego()">Terminar el juego</p>`;
}

function renderTutifrutiPasajero(cont){
  if(tuti.fase === 'lobby'){
    const anotado = miAsiento && tutiAnotados[String(miAsiento)] != null;
    cont.innerHTML = `
      ${bingoPinHTML()}
      <div class="hero" style="margin-top:8px;">
        <h2>🔤 Tutti Frutti</h2>
        <p>Categorías: ${TUTI_CATEGORIAS.join(', ')}. Sale una letra al azar y competís contra el resto de los pasajeros de este viaje: si a alguien más se le ocurre la misma palabra, vale menos.</p>
      </div>
      ${anotado
        ? '<p class="tienda-nota">Ya estás anotado. Esperá a que el organizador arranque la ronda.</p>'
        : `<button class="btn-primary" onclick="tutiAnotarme()">Anotarme para jugar</button>`}
      ${tutiListaAnotadosHTML(false)}`;
    return;
  }

  if(tuti.fase === 'sorteando'){
    cont.innerHTML = `
      <div class="hero" style="margin-top:8px;">
        <h2>🎲 Sorteando la letra...</h2>
        <p>El organizador está eligiendo con qué letra arranca esta ronda.</p>
      </div>
      ${tutiUsadasHTML()}`;
    return;
  }

  if(tuti.fase === 'jugando'){
    const restante = tutiTiempoRestante();
    const urgente = restante <= 5;
    const categoriasHTML = (tuti.categorias || []).map(cat => {
      const valor = tutiMisRespuestas[cat] || '';
      return `
        <div class="tuti-categoria">
          <label>${cat}</label>
          <input type="text" value="${valor.replace(/"/g,'&quot;')}" placeholder="${tuti.letra}..." oninput="tutiActualizarRespuesta('${cat}', this.value)">
        </div>`;
    }).join('');
    cont.innerHTML = `
      <div class="valija-topbar">
        <div class="valija-topbar-info">
          <span class="valija-topbar-emoji">🔤</span>
          <span class="valija-topbar-destino">Con la letra ${tuti.letra}</span>
        </div>
        <div class="valija-timer ${urgente ? 'valija-timer-urgente' : ''}">${restante}</div>
      </div>
      <div class="tuti-categorias">${categoriasHTML}</div>
      <p class="tienda-nota">El organizador corta la ronda cuando quiera con "¡Basta!".</p>`;
    return;
  }

  // fase === 'resultados'
  const puntos = tutiCalcularPuntajes();
  tutiSumarMisMonedasSiCorresponde(puntos);
  const asientos = Object.keys(tutiRespuestas).sort((a,b) => (puntos[b]||0) - (puntos[a]||0));

  cont.innerHTML = `
    <div class="hero" style="margin-top:8px;">
      <h2>Letra ${tuti.letra}</h2>
      <p>Categorías: ${(tuti.categorias || []).join(', ')}</p>
    </div>
    <div class="tuti-resultados">${tutiFilasResultadosHTML(asientos, puntos)}</div>
    <p class="tienda-nota">Esperá a que el organizador arranque otra ronda.</p>`;
}

function tutiFilasResultadosHTML(asientos, puntos){
  if(!asientos.length) return '<p style="color:var(--gray);font-size:13px;">Nadie llegó a contestar esta ronda.</p>';
  return asientos.map(a => {
    const nombre = tutiRespuestas[a].nombre || `Asiento ${a}`;
    const esMio = a === String(miAsiento);
    const detalle = (tuti.categorias || []).map(cat => {
      const palabra = (tutiRespuestas[a].palabras || {})[cat] || '—';
      return `<span class="tuti-resultado-palabra">${palabra}</span>`;
    }).join('');
    return `
      <div class="rank-row ${esMio ? 'me' : ''}">
        <div class="rank-avatar">${nombre.slice(0,2).toUpperCase()}</div>
        <div class="rank-name">${esMio ? 'Vos' : nombre}<span class="tuti-resultado-detalle">${detalle}</span></div>
        <div class="rank-pts">${puntos[a] || 0} pts</div>
      </div>`;
  }).join('');
}
