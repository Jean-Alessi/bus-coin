let qIndex = 0;

const preguntas = [
  { cat:"CULTURA GENERAL", text:"¿En qué año se independizó Argentina?", opciones:["1810","1816","1853"], correcta:1 },
  { cat:"DESTINO", text:"¿Qué provincia estamos por visitar?", opciones:["Córdoba","Mendoza","Santa Fe"], correcta:0 },
  { cat:"CULTURA GENERAL", text:"¿Cuál es el río más largo del mundo?", opciones:["Amazonas","Nilo","Paraná"], correcta:0 }
];

function renderPregunta(){
  const p = preguntas[qIndex];
  document.getElementById('trivia-sub').textContent = `Pregunta ${qIndex+1} de ${preguntas.length}`;
  document.getElementById('trivia-progress').style.width = `${((qIndex+1)/preguntas.length)*100}%`;
  document.getElementById('q-cat').textContent = p.cat;
  document.getElementById('q-text').textContent = p.text;
  const opts = document.getElementById('q-options');
  opts.innerHTML = '';
  p.opciones.forEach((op,i)=>{
    const div = document.createElement('div');
    div.className = 'option';
    div.textContent = op;
    div.onclick = ()=> responder(i);
    opts.appendChild(div);
  });
}

function responder(i){
  const p = preguntas[qIndex];
  const opts = document.querySelectorAll('.option');
  opts.forEach((o,idx)=>{
    o.onclick = null;
    if(idx===p.correcta) o.classList.add('correct');
    else if(idx===i) o.classList.add('wrong');
  });
  if(i===p.correcta){
    ganarFichas(10);
    mostrarToast('+10 fichas por acertar');
  } else {
    mostrarToast('Esa no era... seguí sumando en la próxima');
  }
  setTimeout(()=>{
    if(qIndex < preguntas.length - 1){
      qIndex++;
      renderPregunta();
    } else {
      showView('ranking');
    }
  }, 1200);
}
