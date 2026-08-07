let diferencias = null;

const DIF_FILAS = 3;
const DIF_COLUMNAS = 4;
const DIF_CANTIDAD = 4;

function elegirIconoAlAzar(){
  const claves = Object.keys(ICONOS);
  return claves[Math.floor(Math.random() * claves.length)];
}

function iniciarDiferencias(){
  const total = DIF_FILAS * DIF_COLUMNAS;
  const base = [];
  for(let i = 0; i < total; i++){
    base.push(elegirIconoAlAzar());
  }
  const modificada = base.slice();
  const posiciones = barajar([...Array(total).keys()]).slice(0, DIF_CANTIDAD);
  posiciones.forEach(pos => {
    let nuevo;
    do { nuevo = elegirIconoAlAzar(); } while(nuevo === base[pos]);
    modificada[pos] = nuevo;
  });

  diferencias = { base, modificada, posiciones: new Set(posiciones), encontradas: new Set() };
  renderDiferencias();
}

function tocarCeldaDiferencia(pos){
  if(diferencias.encontradas.has(pos)) return;
  if(!diferencias.posiciones.has(pos)){
    mostrarToast('Ahí no hay diferencia');
    return;
  }
  diferencias.encontradas.add(pos);
  if(diferencias.encontradas.size === diferencias.posiciones.size){
    ganarFichas(15);
    mostrarToast('¡Las encontraste todas! +15 fichas');
  }
  renderDiferencias();
}

function difCeldaHTML(nombreIcono, pos){
  const encontrada = diferencias.encontradas.has(pos);
  return `<div class="dif-celda ${encontrada ? 'dif-encontrada' : ''}" onclick="tocarCeldaDiferencia(${pos})">${icono(nombreIcono, 22)}</div>`;
}

function renderDiferencias(){
  const container = document.getElementById('diferencias-content');
  if(!container || !diferencias) return;

  if(diferencias.encontradas.size === diferencias.posiciones.size){
    container.innerHTML = `
      <div class="hero" style="margin-top:8px;">
        <h2>¡Las encontraste todas!</h2>
        <p>${diferencias.posiciones.size} de ${diferencias.posiciones.size} diferencias.</p>
      </div>
      <button class="btn-primary" onclick="iniciarDiferencias()">Jugar de nuevo</button>`;
    return;
  }

  container.innerHTML = `
    <div class="section-label">Encontrás ${diferencias.encontradas.size} de ${diferencias.posiciones.size}</div>
    <div class="section-label">Imagen A</div>
    <div class="dif-grid">${diferencias.base.map((ic, i) => difCeldaHTML(ic, i)).join('')}</div>
    <div class="section-label">Imagen B</div>
    <div class="dif-grid">${diferencias.modificada.map((ic, i) => difCeldaHTML(ic, i)).join('')}</div>`;
}
