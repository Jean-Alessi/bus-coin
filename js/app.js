let segmento = null;
let fichas = 120;

const contenidoPorSegmento = {
  estudiantes: {
    saludo: "Hola, Fede",
    cards: [
      { icon:"trivia", title:"Trivia veloz", sub:"Sumá puntos para el ranking", view:"trivia" },
      { icon:"musica", title:"DJ en vivo", sub:"Votá y pagá el próximo tema", view:"tienda" },
      { icon:"trofeo", title:"Ranking del micro", sub:"¿Quién va primero hoy?", view:"ranking" },
    ]
  },
  jubilados: {
    saludo: "Buen día",
    cards: [
      { icon:"auriculares", title:"Cuento del día", sub:"El Aleph — resumen en audio, 12 min", view:"trivia" },
      { icon:"trivia", title:"Trivia tranquila", sub:"Historia argentina, sin apuro", view:"trivia" },
      { icon:"cartas", title:"Truco con el grupo", sub:"Ranking cerrado, solo ustedes", view:"tienda" },
    ]
  },
  familia: {
    saludo: "Hola, familia",
    cards: [
      { icon:"lupa", title:"Buscá las diferencias", sub:"Juego para todas las edades", view:"trivia" },
      { icon:"trivia", title:"Desafío en pareja", sub:"Vos vs tu pareja", view:"trivia" },
      { icon:"trofeo", title:"Ranking familiar", sub:"Gómez vs Pérez", view:"ranking" },
    ]
  },
  pareja: {
    saludo: "Hola, ustedes dos",
    cards: [
      { icon:"chat", title:"Trivia en pareja", sub:"¿Cuánto se conocen de verdad?", view:"trivia" },
      { icon:"cartas", title:"Truco de a dos", sub:"Cartas rápidas para pasar el rato", view:"tienda" },
      { icon:"trofeo", title:"Su historial", sub:"Racha de victorias juntos", view:"ranking" },
    ]
  }
};

const ranking = [
  { name:"Marcelo", pts:340, me:false },
  { name:"Vos", pts:290, me:true },
  { name:"Martín", pts:210, me:false },
  { name:"Carmelo", pts:150, me:false },
];

function selectSegment(seg){
  segmento = seg;
  document.querySelectorAll('.segment-card').forEach(c=>c.classList.remove('selected'));
  document.querySelector(`.segment-card[data-seg="${seg}"]`).classList.add('selected');
  document.getElementById('btn-continuar').disabled = false;
}

function goHome(){
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
}

function renderRanking(){
  ranking.sort((a,b)=> b.pts - a.pts);
  const list = document.getElementById('ranking-list');
  list.innerHTML = '';
  ranking.forEach((r,i)=>{
    const div = document.createElement('div');
    div.className = 'rank-row' + (r.me ? ' me' : '');
    div.innerHTML = `<div class="rank-num">${i+1}</div><div class="rank-avatar">${r.name.slice(0,2).toUpperCase()}</div><div class="rank-name">${r.name}</div><div class="rank-pts">${r.pts} pts</div>`;
    list.appendChild(div);
  });
}

function ganarFichas(cantidad){
  fichas += cantidad;
  document.getElementById('fichas-count').textContent = fichas;
  const yo = ranking.find(r=>r.me);
  if(yo) yo.pts += cantidad;
}

function comprarFichas(cantidad){
  fichas += cantidad;
  document.getElementById('fichas-count').textContent = fichas;
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
});
