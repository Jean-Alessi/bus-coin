let bingo = null;

const BINGO_MIN_NOMBRES = 9;
const BINGO_MAX_CARTONES = 200;
// PIN para reclamar el rol de organizador. Es una traba simple, no seguridad
// real (el código es público) — alcanza para que ningún pasajero lo toque sin querer.
const BINGO_PIN_ORGANIZADOR = '1234';
const BINGO_NOMBRES_EJEMPLO = ['Marcelo', 'Vos', 'Martín', 'Carmelo', 'Ana', 'Beto', 'Caro', 'Dani', 'Fede', 'Euge', 'Gonza', 'Male'];

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

function bingoTamanoCarton(cantidad){
  if(cantidad >= 25) return 5;
  if(cantidad >= 16) return 4;
  if(cantidad >= 9) return 3;
  return 0;
}

// Línea = fila, columna o cualquiera de las dos diagonales completa.
// marcados es un array de índices (no un Set: tiene que poder guardarse en Firebase).
function bingoTieneLinea(marcados, tamano){
  for(let f = 0; f < tamano; f++){
    let completa = true;
    for(let c = 0; c < tamano; c++){ if(!marcados.includes(f * tamano + c)){ completa = false; break; } }
    if(completa) return true;
  }
  for(let c = 0; c < tamano; c++){
    let completa = true;
    for(let f = 0; f < tamano; f++){ if(!marcados.includes(f * tamano + c)){ completa = false; break; } }
    if(completa) return true;
  }
  let diag1 = true, diag2 = true;
  for(let i = 0; i < tamano; i++){
    if(!marcados.includes(i * tamano + i)) diag1 = false;
    if(!marcados.includes(i * tamano + (tamano - 1 - i))) diag2 = false;
  }
  return diag1 || diag2;
}

// ---- Multi-celular: un organizador maneja el sorteo (no un pasajero cualquiera);
// el resto de los celulares solo elige su cartón y mira los nombres en vivo. ----

const BINGO_ROOM_ID = 'bingo-grupo';
let miCarton = null;
let bingoListenerEstado = null;
let bingoListenerAsientos = null;
let cartonesAsignados = {};

function bingoRefEstado(){ return db.ref(`salas/${BINGO_ROOM_ID}/estado`); }
function bingoRefAsientos(){ return db.ref(`salas/${BINGO_ROOM_ID}/asientos`); }

function bingoEstadoVacio(){
  return { fase: 'sin-organizador', organizadorId: null, nombres: [], cantidadCartones: 4, tamano: 0, cartones: [], bolsa: [], sorteados: [], ultimaLlamada: null, ganadorLinea: null, ganadorCartonLleno: null };
}

function bingoGuardar(){
  bingoRefEstado().set(bingo);
}

function bingoEsOrganizador(){
  return !!bingo && bingo.organizadorId === idDispositivo();
}

function iniciarBingo(){
  if(bingoListenerEstado){
    if(bingo) renderBingo();
    return;
  }
  const guardado = localStorage.getItem('bingo-carton-' + BINGO_ROOM_ID);
  miCarton = guardado === null ? null : Number(guardado);

  bingoListenerAsientos = bingoRefAsientos().on('value', snap => {
    cartonesAsignados = snap.val() || {};
    if(miCarton !== null && cartonesAsignados[miCarton] && cartonesAsignados[miCarton] !== idDispositivo()){
      miCarton = null;
      localStorage.removeItem('bingo-carton-' + BINGO_ROOM_ID);
    }
    if(bingo) renderBingo();
  });

  bingoListenerEstado = bingoRefEstado().on('value', snap => {
    // Firebase no guarda arrays vacíos ni null: se completan los campos que
    // falten con los valores por defecto para que el resto del código no rompa.
    bingo = Object.assign(bingoEstadoVacio(), snap.val() || {});
    renderBingo();
  });
}

function bingoSerOrganizador(){
  const input = document.getElementById('bingo-pin-input');
  const pin = input ? input.value.trim() : '';
  const error = document.getElementById('bingo-pin-error');
  if(pin !== BINGO_PIN_ORGANIZADOR){
    if(error) error.textContent = 'PIN incorrecto';
    return;
  }
  bingo.organizadorId = idDispositivo();
  bingo.fase = 'config-nombres';
  bingoGuardar();
}

function bingoElegirCarton(id){
  bingoRefAsientos().child(id).set(idDispositivo()).then(() => {
    miCarton = id;
    localStorage.setItem('bingo-carton-' + BINGO_ROOM_ID, id);
    renderBingo();
  });
}

function bingoUsarNombresEjemplo(){
  const textarea = document.getElementById('bingo-nombres-input');
  if(textarea) textarea.value = BINGO_NOMBRES_EJEMPLO.join('\n');
}

function bingoConfirmarNombres(){
  if(!bingoEsOrganizador()) return;
  const textarea = document.getElementById('bingo-nombres-input');
  const nombres = [...new Set(textarea.value.split('\n').map(n => n.trim()).filter(Boolean))];
  if(nombres.length < BINGO_MIN_NOMBRES){
    mostrarToast(`Cargá al menos ${BINGO_MIN_NOMBRES} nombres (llevás ${nombres.length})`);
    return;
  }
  bingo.nombres = nombres;
  bingo.fase = 'config-cartones';
  bingoGuardar();
}

function bingoVolverANombres(){
  if(!bingoEsOrganizador()) return;
  bingo.fase = 'config-nombres';
  bingoGuardar();
}

function bingoActualizarCantidad(valor){
  const n = parseInt(valor, 10);
  bingo.cantidadCartones = isNaN(n) ? 1 : Math.min(BINGO_MAX_CARTONES, Math.max(1, n));
}

function bingoSetCantidad(n){
  if(!bingoEsOrganizador()) return;
  bingo.cantidadCartones = Math.min(BINGO_MAX_CARTONES, Math.max(1, n));
  renderBingo();
}

function bingoArmarCartones(){
  if(!bingoEsOrganizador()) return;
  const tamano = bingoTamanoCarton(bingo.nombres.length);
  if(!tamano){
    mostrarToast('Faltan nombres para armar el cartón');
    return;
  }
  bingo.tamano = tamano;
  bingo.cartones = [];
  for(let i = 1; i <= bingo.cantidadCartones; i++){
    bingo.cartones.push({
      id: i,
      nombre: `Cartón ${i}`,
      nombres: barajar(bingo.nombres).slice(0, tamano * tamano),
      marcados: [],
    });
  }
  bingo.bolsa = barajar(bingo.nombres);
  bingo.sorteados = [];
  bingo.ultimaLlamada = null;
  bingo.ganadorLinea = null;
  bingo.ganadorCartonLleno = null;
  bingo.fase = 'jugando';
  bingoGuardar();
}

function bingoSortear(){
  if(!bingoEsOrganizador()) return;
  bingo.bolsa = bingo.bolsa || [];
  if(!bingo.bolsa.length) return;
  const nombre = bingo.bolsa.pop();
  bingo.sorteados = bingo.sorteados || [];
  bingo.sorteados.push(nombre);
  bingo.ultimaLlamada = bingoArmarLlamada(nombre);
  bingo.cartones.forEach(carton => {
    carton.marcados = carton.marcados || [];
    const idx = carton.nombres.indexOf(nombre);
    if(idx !== -1 && !carton.marcados.includes(idx)) carton.marcados.push(idx);
  });

  if(!bingo.ganadorLinea){
    const ganador = bingo.cartones.find(c => bingoTieneLinea(c.marcados || [], bingo.tamano));
    if(ganador){
      bingo.ganadorLinea = ganador.id;
      ganarFichas(5);
      mostrarToast(`¡Línea (chingüina) para ${ganador.nombre}! +5 fichas`);
    }
  }
  if(!bingo.ganadorCartonLleno){
    const ganadorFull = bingo.cartones.find(c => (c.marcados || []).length === bingo.tamano * bingo.tamano);
    if(ganadorFull){
      bingo.ganadorCartonLleno = ganadorFull.id;
      ganarFichas(20);
      mostrarToast(`¡BINGO para ${ganadorFull.nombre}! +20 fichas`);
    }
  }
  bingoGuardar();
}

function bingoJugarDeNuevo(){
  if(!bingoEsOrganizador()) return;
  bingo.fase = 'config-cartones';
  bingoGuardar();
  bingoRefAsientos().remove();
}

function bingoCartonHTML(carton){
  const tamano = bingo.tamano;
  const marcados = carton.marcados || [];
  const badges = [];
  if(bingo.ganadorLinea === carton.id) badges.push('<span class="bingo-badge">Línea</span>');
  if(bingo.ganadorCartonLleno === carton.id) badges.push('<span class="bingo-badge bingo-badge-full">¡BINGO!</span>');
  return `
    <div class="bingo-carton">
      <div class="bingo-carton-titulo">${carton.nombre} ${badges.join(' ')}</div>
      <div class="bingo-grid" style="grid-template-columns:repeat(${tamano},1fr)">
        ${carton.nombres.map((n, i) => `<div class="bingo-celda ${marcados.includes(i) ? 'bingo-marcada' : ''}">${n}</div>`).join('')}
      </div>
    </div>`;
}

function bingoRenderElegirCarton(){
  const container = document.getElementById('bingo-content');
  if(!container) return;
  container.innerHTML = `
    <div class="hero" style="margin-top:8px;">
      <h2>¿Cuál es tu cartón?</h2>
      <p>Elegí un número del 1 al ${bingo.cantidadCartones}. Cada celular sigue el suyo.</p>
    </div>
    <input type="number" id="bingo-mi-carton-input" class="bingo-input-numero" min="1" max="${bingo.cantidadCartones}" value="1">
    <button class="btn-primary" onclick="bingoConfirmarMiCarton()">Ver este cartón</button>
    <p id="bingo-carton-error" style="color:var(--orange);font-size:13px;"></p>`;
}

function bingoConfirmarMiCarton(){
  const input = document.getElementById('bingo-mi-carton-input');
  const id = parseInt(input.value, 10);
  const error = document.getElementById('bingo-carton-error');
  if(isNaN(id) || id < 1 || id > bingo.cantidadCartones){
    error.textContent = `Elegí un número entre 1 y ${bingo.cantidadCartones}`;
    return;
  }
  if(cartonesAsignados[id] && cartonesAsignados[id] !== idDispositivo()){
    error.textContent = 'Ese cartón ya lo eligió otro celular, probá con otro número';
    return;
  }
  bingoElegirCarton(id);
}

function renderBingo(){
  const container = document.getElementById('bingo-content');
  if(!container || !bingo) return;

  if(bingo.fase === 'sin-organizador'){
    container.innerHTML = `
      <div class="hero" style="margin-top:8px;">
        <h2>Bingo del micro</h2>
        <p>Todavía nadie armó la partida. Si sos quien organiza el juego, ingresá el PIN para arrancar; el resto de los celulares se va a actualizar solo apenas empiece.</p>
      </div>
      <input type="password" id="bingo-pin-input" class="bingo-input-numero" inputmode="numeric" maxlength="4" placeholder="PIN del organizador">
      <button class="btn-primary" onclick="bingoSerOrganizador()">Soy el organizador, armar el bingo</button>
      <p id="bingo-pin-error" class="bingo-pin-error"></p>`;
    return;
  }

  if(bingo.fase === 'config-nombres' || bingo.fase === 'config-cartones'){
    if(!bingoEsOrganizador()){
      container.innerHTML = `
        <div class="hero" style="margin-top:8px;">
          <h2>El organizador está armando el bingo</h2>
          <p>Esperá un toque, esta pantalla se actualiza sola apenas esté listo.</p>
        </div>`;
      return;
    }
  }

  if(bingo.fase === 'config-nombres'){
    container.innerHTML = `
      <div class="section-label">Panel del organizador</div>
      <div class="hero" style="margin-top:8px;">
        <h2>¿Quiénes viajan hoy?</h2>
        <p>Anotá los nombres o apodos de los pasajeros, uno por línea. Necesitás al menos ${BINGO_MIN_NOMBRES}.</p>
      </div>
      <textarea id="bingo-nombres-input" class="bingo-textarea" rows="8" placeholder="Marcelo&#10;Martín&#10;Carmelo&#10;...">${bingo.nombres.join('\n')}</textarea>
      <button class="btn-ghost" onclick="bingoUsarNombresEjemplo()">Usar nombres de ejemplo</button>
      <button class="btn-primary" onclick="bingoConfirmarNombres()">Continuar</button>`;
    return;
  }

  if(bingo.fase === 'config-cartones'){
    const tamano = bingoTamanoCarton(bingo.nombres.length);
    container.innerHTML = `
      <div class="section-label">Panel del organizador</div>
      <div class="hero" style="margin-top:8px;">
        <h2>¿Cuántos cartones armamos?</h2>
        <p>Se arman al azar con los ${bingo.nombres.length} nombres cargados (cartón de ${tamano}×${tamano}). Cada celular después elige el suyo.</p>
      </div>
      <input type="number" id="bingo-cantidad-input" class="bingo-input-numero" min="1" max="${BINGO_MAX_CARTONES}" value="${bingo.cantidadCartones}" oninput="bingoActualizarCantidad(this.value)">
      <div class="bingo-presets">
        ${[10, 20, 40, 60].map(n => `<button class="btn-ghost-chico" onclick="bingoSetCantidad(${n})">${n}</button>`).join('')}
      </div>
      <button class="btn-primary" onclick="bingoArmarCartones()">Armar cartones y jugar</button>
      <button class="btn-ghost" onclick="bingoVolverANombres()">Editar nombres</button>`;
    return;
  }

  // fase 'jugando' (incluye el estado de partida terminada con cartón lleno)
  const terminado = !!bingo.ganadorCartonLleno;
  const cartonGanador = terminado ? bingo.cartones.find(c => c.id === bingo.ganadorCartonLleno) : null;
  const bolsa = bingo.bolsa || [];
  const sorteados = bingo.sorteados || [];
  const historialHTML = sorteados.length
    ? sorteados.slice().reverse().map((n, i) => `<span class="bingo-chip${i === 0 ? ' bingo-chip-ultimo' : ''}">${n}</span>`).join('')
    : '<span class="bingo-chip bingo-chip-vacio">Todavía nada</span>';
  const bannerFinal = terminado ? `<div class="hero" style="margin-top:8px;"><h2>¡BINGO!</h2><p>Ganó ${cartonGanador.nombre} con el cartón lleno.</p></div>` : '';

  if(bingoEsOrganizador()){
    container.innerHTML = `
      <div class="section-label">Panel del organizador</div>
      ${bannerFinal}
      <div class="bingo-sorteo">
        <div class="bingo-ultimo">${bingo.ultimaLlamada || '—'}</div>
        ${terminado
          ? `<button class="btn-primary" onclick="bingoJugarDeNuevo()">Jugar de nuevo</button>`
          : `<button class="btn-primary" onclick="bingoSortear()" ${bolsa.length === 0 ? 'disabled' : ''}>Cantar nombre</button>`}
      </div>
      <div class="section-label">Ya salieron (${sorteados.length}/${bingo.nombres.length})</div>
      <div class="bingo-historial">${historialHTML}</div>`;
    return;
  }

  if(miCarton === null){
    bingoRenderElegirCarton();
    return;
  }

  const miCartonData = bingo.cartones.find(c => c.id === miCarton);
  container.innerHTML = `
    <div class="section-label">Tu cartón es el ${miCarton}</div>
    ${bannerFinal}
    <div class="bingo-sorteo">
      <div class="bingo-ultimo">${bingo.ultimaLlamada || '—'}</div>
      <p class="bingo-espera">${terminado ? 'Esperá a que el organizador arranque otra partida.' : 'El organizador va cantando los nombres.'}</p>
    </div>
    <div class="section-label">Ya salieron (${sorteados.length}/${bingo.nombres.length})</div>
    <div class="bingo-historial">${historialHTML}</div>
    ${miCartonData ? bingoCartonHTML(miCartonData) : ''}`;
}
