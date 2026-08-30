// Tutti Frutti / Basta: se juega contra el resto de los pasajeros del mismo
// código de viaje (no contra el reloj solo), reusando el patrón de sala
// compartida por Firebase que ya usa Bingo. Cualquiera puede arrancar una
// ronda nueva (no hace falta PIN de organizador, es un juego casual). Todos
// ven la misma letra y el mismo cronómetro (arrancan del mismo timestamp
// guardado en la sala), y cualquiera puede tocar "¡BASTA!" para cortar la
// ronda para todos a la vez, como en el juego de mesa real.

const TUTI_CATEGORIAS = ['Nombre', 'Animal', 'Color', 'Comida', 'País', 'Cosa'];
// Se excluyen letras difíciles en español (K, Ñ, W, X, Y, Z) para que siempre
// se pueda completar alguna categoría.
const TUTI_LETRAS = ['A','B','C','D','E','F','G','H','I','J','L','M','N','O','P','Q','R','S','T','U','V'];
const TUTI_DURACION_SEG = 75;
const TUTI_PUNTOS_UNICA = 10;
const TUTI_PUNTOS_REPETIDA = 5;

let tuti = null;
let tutiRespuestas = {}; // respuestas de TODOS los pasajeros de la ronda actual, por asiento
let tutiMisRespuestas = {}; // borrador local (para no perder lo tipeado si el estado se actualiza)
let tutiTimerId = null;
let tutiRondaPuntuada = null; // evita sumar monedas dos veces por la misma ronda

function tutiEstadoVacio(){
  return { fase: 'esperando', letra: null, categorias: [], inicio: null, duracionSeg: TUTI_DURACION_SEG, ronda: 0 };
}

function tutiRefEstado(){ return db.ref(`salas/${codigoViaje}/tutifruti/estado`); }
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

function tutiEmpezarRonda(){
  if(!tuti || (tuti.fase !== 'esperando' && tuti.fase !== 'resultados')) return;
  const letra = TUTI_LETRAS[Math.floor(Math.random() * TUTI_LETRAS.length)];
  const nuevaRonda = (tuti.ronda || 0) + 1;
  tutiMisRespuestas = {};
  db.ref(`salas/${codigoViaje}/tutifruti/estado`).set({
    fase: 'jugando',
    letra,
    categorias: TUTI_CATEGORIAS,
    inicio: Date.now(),
    duracionSeg: TUTI_DURACION_SEG,
    ronda: nuevaRonda,
  });
}

function tutiActualizarRespuesta(categoria, valor){
  tutiMisRespuestas[categoria] = valor;
  if(!miAsiento) return;
  tutiRefRespuestas().child(String(miAsiento)).set({ nombre: miNombre, palabras: tutiMisRespuestas });
}

// Cualquier pasajero puede cortar la ronda para todos, igual que gritar
// "¡Basta!" en la mesa real.
function tutiBasta(){
  if(!tuti || tuti.fase !== 'jugando') return;
  tutiCerrarRonda();
}

function tutiCerrarRonda(){
  tutiRefEstado().child('fase').set('resultados');
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
      tutiCerrarRonda();
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

function renderTutifruti(){
  const cont = document.getElementById('tutifruti-content');
  if(!cont || !tuti) return;
  document.getElementById('tutifruti-sub').textContent =
    tuti.fase === 'esperando' ? 'Contra el resto del viaje' :
    tuti.fase === 'jugando' ? `Letra ${tuti.letra}` : 'Resultados de la ronda';

  if(tuti.fase === 'esperando'){
    cont.innerHTML = `
      <div class="hero">
        <h2>🔤 Tutti Frutti</h2>
        <p>Categorías: ${TUTI_CATEGORIAS.join(', ')}. Sale una letra al azar y competís contra el resto de los pasajeros de este viaje: si a alguien más se le ocurre la misma palabra, vale menos.</p>
      </div>
      <button class="btn-primary" onclick="tutiEmpezarRonda()">Empezar ronda</button>`;
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
      <button class="btn-primary tuti-basta" onclick="tutiBasta()">¡BASTA!</button>`;
    return;
  }

  // fase === 'resultados'
  const puntos = tutiCalcularPuntajes();
  tutiSumarMisMonedasSiCorresponde(puntos);
  const asientos = Object.keys(tutiRespuestas).sort((a,b) => (puntos[b]||0) - (puntos[a]||0));

  const filasHTML = asientos.length ? asientos.map(a => {
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
  }).join('') : '<p style="color:var(--gray);font-size:13px;">Nadie llegó a contestar esta ronda.</p>';

  cont.innerHTML = `
    <div class="hero" style="margin-top:8px;">
      <h2>Letra ${tuti.letra}</h2>
      <p>Categorías: ${(tuti.categorias || []).join(', ')}</p>
    </div>
    <div class="tuti-resultados">${filasHTML}</div>
    <button class="btn-primary" onclick="tutiEmpezarRonda()">Nueva ronda</button>`;
}
