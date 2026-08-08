let bingo = null;

const BINGO_MIN_NOMBRES = 9;
const BINGO_NOMBRES_EJEMPLO = ['Marcelo', 'Vos', 'Martín', 'Carmelo', 'Ana', 'Beto', 'Caro', 'Dani', 'Fede', 'Euge', 'Gonza', 'Male'];

function bingoTamanoCarton(cantidad){
  if(cantidad >= 25) return 5;
  if(cantidad >= 16) return 4;
  if(cantidad >= 9) return 3;
  return 0;
}

function iniciarBingo(){
  if(!bingo){
    bingo = { fase: 'config-nombres', nombres: [], cantidadCartones: 4, tamano: 0, cartones: [], bolsa: [], sorteados: [], ganadorLinea: null, ganadorCartonLleno: null };
  }
  renderBingo();
}

function bingoUsarNombresEjemplo(){
  const textarea = document.getElementById('bingo-nombres-input');
  if(textarea) textarea.value = BINGO_NOMBRES_EJEMPLO.join('\n');
}

function bingoConfirmarNombres(){
  const textarea = document.getElementById('bingo-nombres-input');
  const nombres = [...new Set(textarea.value.split('\n').map(n => n.trim()).filter(Boolean))];
  if(nombres.length < BINGO_MIN_NOMBRES){
    mostrarToast(`Cargá al menos ${BINGO_MIN_NOMBRES} nombres (llevás ${nombres.length})`);
    return;
  }
  bingo.nombres = nombres;
  bingo.fase = 'config-cartones';
  renderBingo();
}

function bingoVolverANombres(){
  bingo.fase = 'config-nombres';
  renderBingo();
}

const BINGO_MAX_CARTONES = 200;

function bingoActualizarCantidad(valor){
  const n = parseInt(valor, 10);
  bingo.cantidadCartones = isNaN(n) ? 1 : Math.min(BINGO_MAX_CARTONES, Math.max(1, n));
}

function bingoSetCantidad(n){
  bingo.cantidadCartones = Math.min(BINGO_MAX_CARTONES, Math.max(1, n));
  renderBingo();
}

function bingoArmarCartones(){
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
      marcados: new Set(),
    });
  }
  bingo.bolsa = barajar(bingo.nombres);
  bingo.sorteados = [];
  bingo.ganadorLinea = null;
  bingo.ganadorCartonLleno = null;
  bingo.fase = 'jugando';
  renderBingo();
}

// Línea = fila, columna o cualquiera de las dos diagonales completa.
function bingoTieneLinea(marcados, tamano){
  for(let f = 0; f < tamano; f++){
    let completa = true;
    for(let c = 0; c < tamano; c++){ if(!marcados.has(f * tamano + c)){ completa = false; break; } }
    if(completa) return true;
  }
  for(let c = 0; c < tamano; c++){
    let completa = true;
    for(let f = 0; f < tamano; f++){ if(!marcados.has(f * tamano + c)){ completa = false; break; } }
    if(completa) return true;
  }
  let diag1 = true, diag2 = true;
  for(let i = 0; i < tamano; i++){
    if(!marcados.has(i * tamano + i)) diag1 = false;
    if(!marcados.has(i * tamano + (tamano - 1 - i))) diag2 = false;
  }
  return diag1 || diag2;
}

function bingoSortear(){
  if(!bingo.bolsa.length) return;
  const nombre = bingo.bolsa.pop();
  bingo.sorteados.push(nombre);
  bingo.cartones.forEach(carton => {
    const idx = carton.nombres.indexOf(nombre);
    if(idx !== -1) carton.marcados.add(idx);
  });

  if(!bingo.ganadorLinea){
    const ganador = bingo.cartones.find(c => bingoTieneLinea(c.marcados, bingo.tamano));
    if(ganador){
      bingo.ganadorLinea = ganador.id;
      ganarFichas(5);
      mostrarToast(`¡Línea (chingüina) para ${ganador.nombre}! +5 fichas`);
    }
  }
  if(!bingo.ganadorCartonLleno){
    const ganadorFull = bingo.cartones.find(c => c.marcados.size === bingo.tamano * bingo.tamano);
    if(ganadorFull){
      bingo.ganadorCartonLleno = ganadorFull.id;
      ganarFichas(20);
      mostrarToast(`¡BINGO para ${ganadorFull.nombre}! +20 fichas`);
    }
  }
  renderBingo();
}

function bingoJugarDeNuevo(){
  bingo.fase = 'config-cartones';
  renderBingo();
}

function bingoCartonHTML(carton){
  const tamano = bingo.tamano;
  const badges = [];
  if(bingo.ganadorLinea === carton.id) badges.push('<span class="bingo-badge">Línea</span>');
  if(bingo.ganadorCartonLleno === carton.id) badges.push('<span class="bingo-badge bingo-badge-full">¡BINGO!</span>');
  return `
    <div class="bingo-carton">
      <div class="bingo-carton-titulo">${carton.nombre} ${badges.join(' ')}</div>
      <div class="bingo-grid" style="grid-template-columns:repeat(${tamano},1fr)">
        ${carton.nombres.map((n, i) => `<div class="bingo-celda ${carton.marcados.has(i) ? 'bingo-marcada' : ''}">${n}</div>`).join('')}
      </div>
    </div>`;
}

function renderBingo(){
  const container = document.getElementById('bingo-content');
  if(!container || !bingo) return;

  if(bingo.fase === 'config-nombres'){
    container.innerHTML = `
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
      <div class="hero" style="margin-top:8px;">
        <h2>¿Cuántos cartones armamos?</h2>
        <p>Se arman al azar con los ${bingo.nombres.length} nombres cargados (cartón de ${tamano}×${tamano}).</p>
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
  container.innerHTML = `
    ${terminado ? `<div class="hero" style="margin-top:8px;"><h2>¡BINGO!</h2><p>Ganó ${cartonGanador.nombre} con el cartón lleno.</p></div>` : ''}
    <div class="bingo-sorteo">
      <div class="bingo-ultimo">${bingo.sorteados.length ? bingo.sorteados[bingo.sorteados.length - 1] : '—'}</div>
      ${terminado
        ? `<button class="btn-primary" onclick="bingoJugarDeNuevo()">Jugar de nuevo</button>`
        : `<button class="btn-primary" onclick="bingoSortear()" ${bingo.bolsa.length === 0 ? 'disabled' : ''}>Sortear nombre</button>`}
    </div>
    <div class="section-label">Ya salieron (${bingo.sorteados.length}/${bingo.nombres.length})</div>
    <div class="bingo-historial">${bingo.sorteados.length
      ? bingo.sorteados.slice().reverse().map(n => `<span class="bingo-chip">${n}</span>`).join('')
      : '<span class="bingo-chip bingo-chip-vacio">Todavía nada</span>'}</div>
    <div class="section-label">Cartones</div>
    ${bingo.cartones.map(c => bingoCartonHTML(c)).join('')}`;
}
