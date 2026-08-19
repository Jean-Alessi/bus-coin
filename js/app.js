let segmento = null;

// Fichas ganadas jugando (trivia, diferencias, bingo) y fichas compradas con
// dinero real quedan separadas a propósito: ningún juego de azar reparte algo
// que se haya pagado, para no parecerse a un juego de azar regulado.
let fichasJuego = 20;
let fichasCompradas = 100;

const contenidoPorSegmento = {
  estudiantes: {
    saludo: "Hola, Fede",
    cards: [
      { icon:"trivia", title:"Trivia veloz", sub:"Sumá puntos para el ranking", view:"trivia" },
      { icon:"musica", title:"DJ en vivo", sub:"Votá y pagá el próximo tema", view:"dj" },
      { icon:"trofeo", title:"Ranking del micro", sub:"¿Quién va primero hoy?", view:"ranking" },
      { icon:"bingo", title:"Bingo de nombres", sub:"Sorteo con los pasajeros del micro", view:"bingo" },
    ]
  },
  jubilados: {
    saludo: "Buen día",
    cards: [
      { icon:"auriculares", title:"Cuento del día", sub:"Leyendas argentinas, en audio", view:"cuento" },
      { icon:"trivia", title:"Trivia tranquila", sub:"Historia argentina, sin apuro", view:"trivia" },
      { icon:"bingo", title:"Bingo de nombres", sub:"Sorteo con los pasajeros del micro", view:"bingo" },
    ]
  },
  familia: {
    saludo: "Hola, familia",
    cards: [
      { icon:"lupa", title:"Buscá las diferencias", sub:"Juego para todas las edades", view:"diferencias" },
      { icon:"trivia", title:"Desafío en pareja", sub:"Vos vs tu pareja", view:"trivia" },
      { icon:"trofeo", title:"Ranking familiar", sub:"Gómez vs Pérez", view:"ranking" },
      { icon:"bingo", title:"Bingo de nombres", sub:"Sorteo con los pasajeros del micro", view:"bingo" },
    ]
  },
  pareja: {
    saludo: "Hola, ustedes dos",
    cards: [
      { icon:"chat", title:"Trivia en pareja", sub:"¿Cuánto se conocen de verdad?", view:"trivia" },
      { icon:"trofeo", title:"Su historial", sub:"Racha de victorias juntos", view:"ranking" },
      { icon:"bingo", title:"Bingo de nombres", sub:"Sorteo con los pasajeros del micro", view:"bingo" },
    ]
  }
};

// ---- Identidad y ranking compartido: cada celular dice su nombre una vez,
// y los puntos que gana se suman a una tabla en vivo en Firebase. ----

let miNombre = localStorage.getItem('mi-nombre') || '';
let rankingPuntos = {};
let rankingListener = null;

function rankingClave(nombre){
  return nombre.trim().replace(/[.#$\[\]\/]/g, '_');
}

function rankingRefPuntos(){ return db.ref('salas/ranking-grupo/puntos'); }

function rankingUnirse(){
  if(!miNombre) return;
  const ref = rankingRefPuntos().child(rankingClave(miNombre));
  ref.once('value').then(snap => {
    if(snap.val() == null) ref.set(0);
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
  document.getElementById('btn-continuar').disabled = !(segmento && nombreOk);
}

function selectSegment(seg){
  segmento = seg;
  document.querySelectorAll('.segment-card').forEach(c=>c.classList.remove('selected'));
  document.querySelector(`.segment-card[data-seg="${seg}"]`).classList.add('selected');
  actualizarBotonContinuar();
}

function goHome(){
  miNombre = document.getElementById('mi-nombre-input').value.trim();
  localStorage.setItem('mi-nombre', miNombre);
  rankingUnirse();
  showView('home');
  document.getElementById('tabbar').style.display = 'flex';
  renderHome();
}

function renderHome(){
  const data = contenidoPorSegmento[segmento] || contenidoPorSegmento.estudiantes;
  document.getElementById('home-saludo').textContent = data.saludo;
  const container = document.getElementById('home-content');
  container.innerHTML = '<div class="section-label">Para vos</div>';
  data.cards.forEach(c=>{
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
  const miClave = rankingClave(miNombre);
  const filas = Object.keys(rankingPuntos)
    .map(clave => ({ nombre: clave, pts: rankingPuntos[clave], me: clave === miClave }))
    .sort((a,b)=> b.pts - a.pts);
  list.innerHTML = filas.length ? '' : '<p style="color:var(--gray);font-size:13px;">Todavía nadie sumó puntos.</p>';
  filas.forEach((r,i)=>{
    const div = document.createElement('div');
    div.className = 'rank-row' + (r.me ? ' me' : '');
    div.innerHTML = `<div class="rank-num">${i+1}</div><div class="rank-avatar">${r.nombre.slice(0,2).toUpperCase()}</div><div class="rank-name">${r.me ? 'Vos' : r.nombre}</div><div class="rank-pts">${r.pts} pts</div>`;
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
  if(miNombre){
    const clave = rankingClave(miNombre);
    rankingPuntos[clave] = (rankingPuntos[clave] || 0) + cantidad;
    rankingRefPuntos().child(clave).set(rankingPuntos[clave]);
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
  const nombreInput = document.getElementById('mi-nombre-input');
  if(nombreInput && miNombre) nombreInput.value = miNombre;
});
