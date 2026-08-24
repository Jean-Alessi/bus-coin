let acertijoIndex = 0;
let acertijosSesion = [];
let acertijoRevelado = false;
let acertijoConfirmando = false;
let acertijoDesafioActual = '';
const ACERTIJOS_POR_SESION = 8;

const ACERTIJO_DESAFIOS = [
  '¿Ya te das por vencido?',
  '¿Tan rápido tiran la toalla?',
  '¿Seguro que no le piensan un toque más?',
  '¿En serio ya se rinden?',
  'Después no vale decir que lo sabían... ¿mostramos la respuesta?',
  'Quedan unos segundos más de gloria. ¿Los van a jugar?',
  '¿Tiran la bandera blanca tan pronto?',
  'Una pista: pensarlo en grupo ayuda más que rendirse. ¿Seguimos?',
];

const ACERTIJOS = [
  { pregunta: 'Tengo ciudades sin casas, montañas sin piedras y ríos sin una gota de agua. ¿Qué soy?', respuesta: 'Un mapa' },
  { pregunta: 'Cuanto más tiempo paso encendida, más chica me pongo. ¿Qué soy?', respuesta: 'Una vela' },
  { pregunta: 'Hablo sin boca y contesto sin pensar. Vivo en las montañas y en los túneles. ¿Qué soy?', respuesta: 'El eco' },
  { pregunta: 'Tengo manos pero no aplaudo, tengo cara pero no sonrío, y camino sin moverme del lugar. ¿Qué soy?', respuesta: 'Un reloj' },
  { pregunta: 'Te acompaño todo el día, desaparezco de noche y nunca digo una palabra. ¿Qué soy?', respuesta: 'La sombra' },
  { pregunta: 'Cuando salís, me abrís; cuando volvés, me cerrás. Si me olvidás, me mojo. ¿Qué soy?', respuesta: 'Un paraguas' },
  { pregunta: 'Tengo dientes, pero nunca mastico. ¿Qué soy?', respuesta: 'Un peine' },
  { pregunta: 'Subo y bajo todo el día, sin moverme nunca del mismo lugar. ¿Qué soy?', respuesta: 'Una escalera' },
  { pregunta: 'Cuanto más me buscás, más ruido hacés para encontrarme. ¿Qué soy?', respuesta: 'El silencio' },
  { pregunta: 'Abro puertas sin ser una mano, y me guardás en el bolsillo. ¿Qué soy?', respuesta: 'Una llave' },
  { pregunta: 'Te muestro tal cual sos, pero nunca te toco. ¿Qué soy?', respuesta: 'Un espejo' },
  { pregunta: 'No tengo cuerpo pero muevo las hojas, no tengo voz pero silbo. ¿Qué soy?', respuesta: 'El viento' },
  { pregunta: 'Cuantas más capas me sacan, más lágrimas provoco. ¿Qué soy?', respuesta: 'Una cebolla' },
  { pregunta: 'Cuantas más bocas me guardan, menos tiempo duro. ¿Qué soy?', respuesta: 'Un secreto' },
  { pregunta: 'Cuanto más me contestás, más aparezco. ¿Qué soy?', respuesta: 'Una pregunta' },
  { pregunta: 'Tengo doce hermanos, pero ninguno dura lo mismo. ¿Qué soy?', respuesta: 'Un año (los meses)' },
  { pregunta: 'Tengo teclas blancas y negras, pero no soy una computadora. ¿Qué soy?', respuesta: 'Un piano' },
  { pregunta: 'Tengo dos caras pero una sola cabeza. ¿Qué soy?', respuesta: 'Una moneda' },
  { pregunta: 'Tengo hojas pero no soy un árbol, tengo lomo pero no camino. ¿Qué soy?', respuesta: 'Un libro' },
  { pregunta: 'Cambio de color pero no me pinto, y todos me obedecen en la esquina. ¿Qué soy?', respuesta: 'Un semáforo' },
  { pregunta: 'Llego sin avisar, me voy con el sol y en el medio traigo estrellas. ¿Qué soy?', respuesta: 'La noche' },
  { pregunta: 'Tengo seis caras y ningún ojo, pero decido tu suerte en el juego. ¿Qué soy?', respuesta: 'Un dado' },
  { pregunta: 'Te dejo subir una sola vez, y después de usarme me tirás. ¿Qué soy?', respuesta: 'Un boleto de micro' },
  { pregunta: 'Cuanto más avanzás, más chico me pongo, hasta que desaparezco cuando llegás. ¿Qué soy?', respuesta: 'Lo que falta del viaje' },
];

function iniciarAcertijos(){
  acertijosSesion = barajar(ACERTIJOS).slice(0, ACERTIJOS_POR_SESION);
  acertijoIndex = 0;
  acertijoRevelado = false;
  acertijoConfirmando = false;
  renderAcertijo();
}

function renderAcertijo(){
  const a = acertijosSesion[acertijoIndex];
  document.getElementById('acertijos-sub').textContent = `Acertijo ${acertijoIndex + 1} de ${acertijosSesion.length}`;
  const cont = document.getElementById('acertijos-content');

  let abajoHTML;
  if(acertijoRevelado){
    abajoHTML = `
      <div class="acertijo-respuesta">
        <div class="section-label">Respuesta</div>
        <p>${a.respuesta}</p>
      </div>
      <div class="acertijo-botones">
        <button class="btn-primary" onclick="responderAcertijo(true)">✅ Lo sacamos</button>
        <button class="btn-ghost" onclick="responderAcertijo(false)">😅 Nos ganó este</button>
      </div>`;
  } else if(acertijoConfirmando){
    abajoHTML = `
      <div class="hero" style="margin-top:8px;">
        <h2>${acertijoDesafioActual}</h2>
      </div>
      <div class="acertijo-botones">
        <button class="btn-primary" onclick="confirmarRevelarAcertijo()">Sí, mostrame la respuesta</button>
        <button class="btn-ghost" onclick="cancelarRevelarAcertijo()">No, seguimos pensando</button>
      </div>`;
  } else {
    abajoHTML = `<button class="btn-primary" onclick="pedirRevelarAcertijo()">Mostrar respuesta</button>`;
  }

  cont.innerHTML = `
    <div class="progress-bar"><div class="progress-fill" style="width:${((acertijoIndex + 1) / acertijosSesion.length) * 100}%"></div></div>
    <div class="question-box">
      <div class="qnum">PENSÁ EN GRUPO</div>
      <h3>${a.pregunta}</h3>
    </div>
    ${abajoHTML}`;
}

function pedirRevelarAcertijo(){
  acertijoDesafioActual = ACERTIJO_DESAFIOS[Math.floor(Math.random() * ACERTIJO_DESAFIOS.length)];
  acertijoConfirmando = true;
  renderAcertijo();
}

function confirmarRevelarAcertijo(){
  acertijoConfirmando = false;
  acertijoRevelado = true;
  renderAcertijo();
}

function cancelarRevelarAcertijo(){
  acertijoConfirmando = false;
  renderAcertijo();
}

function responderAcertijo(acerto){
  if(acerto){
    ganarFichas(10);
    mostrarToast('+10 fichas por acertarlo');
  }
  acertijoRevelado = false;
  if(acertijoIndex < acertijosSesion.length - 1){
    acertijoIndex++;
    renderAcertijo();
  } else {
    renderResultadoAcertijos();
  }
}

function renderResultadoAcertijos(){
  document.getElementById('acertijos-sub').textContent = 'Acertijos';
  document.getElementById('acertijos-content').innerHTML = `
    <div class="hero" style="margin-top:8px;">
      <h2>¡Se acabó esta tanda!</h2>
      <p>¿Van por otra ronda de acertijos?</p>
    </div>
    <button class="btn-primary" onclick="iniciarAcertijos()">Jugar otra tanda</button>`;
}
