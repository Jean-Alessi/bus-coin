let acertijoIndex = 0;
let acertijosSesion = [];
let acertijoFase = 'jugando'; // 'jugando' | 'confirmando' | 'revelado' | 'acertado'
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
  { pregunta: 'Tengo doce hermanos, pero ninguno dura lo mismo. ¿Qué soy?', respuesta: 'Un año' },
  { pregunta: 'Tengo teclas blancas y negras, pero no soy una computadora. ¿Qué soy?', respuesta: 'Un piano' },
  { pregunta: 'Tengo dos caras pero una sola cabeza. ¿Qué soy?', respuesta: 'Una moneda' },
  { pregunta: 'Tengo hojas pero no soy un árbol, tengo lomo pero no camino. ¿Qué soy?', respuesta: 'Un libro' },
  { pregunta: 'Cambio de color pero no me pinto, y todos me obedecen en la esquina. ¿Qué soy?', respuesta: 'Un semáforo' },
  { pregunta: 'Llego sin avisar, me voy con el sol y en el medio traigo estrellas. ¿Qué soy?', respuesta: 'La noche' },
  { pregunta: 'Tengo seis caras y ningún ojo, pero decido tu suerte en el juego. ¿Qué soy?', respuesta: 'Un dado' },
  { pregunta: 'Te dejo subir una sola vez, y después de usarme me tirás. ¿Qué soy?', respuesta: 'Un boleto de micro' },
  { pregunta: 'Cuanto más avanzás, más chico me pongo, hasta que desaparezco cuando llegás. ¿Qué soy?', respuesta: 'Lo que falta del viaje' },
];

// Acertijos con imagen: la pista es un emoji grande en vez de (o además de)
// texto, para que se pueda resolver mirando en vez de leyendo.
const ACERTIJOS_IMAGEN = [
  { imagen: '🚌🎫', pregunta: '¿Qué representa esta imagen?', respuesta: 'Un boleto de micro' },
  { imagen: '🗺️🧭', pregunta: '¿Qué representa esta imagen?', respuesta: 'Un mapa' },
  { imagen: '🔑🚪', pregunta: '¿Qué representa esta imagen?', respuesta: 'Una llave' },
  { imagen: '🌙⭐', pregunta: '¿Qué representa esta imagen?', respuesta: 'La noche' },
  { imagen: '☂️🌧️', pregunta: '¿Qué representa esta imagen?', respuesta: 'Un paraguas' },
  { imagen: '🎂⏳', pregunta: '¿Qué representa esta imagen?', respuesta: 'Un año' },
  { imagen: '☕🥐', pregunta: '¿Qué representa esta imagen?', respuesta: 'El desayuno' },
  { imagen: '🎒👕', pregunta: '¿Qué representa esta imagen?', respuesta: 'El equipaje' },
];

const TODOS_ACERTIJOS = ACERTIJOS.concat(ACERTIJOS_IMAGEN);

// Palabras que no aportan a la respuesta clave: artículos, preposiciones,
// pronombres y adjetivos numerales/de cantidad. Así "un secreto" también
// vale si escriben "el secreto", "secretos" (con "una" de más), etc., o si
// se cuelan de más palabras de relleno alrededor de la palabra importante.
const PALABRAS_VACIAS_ACERTIJO = [
  'el','la','los','las','un','una','unos','unas','al','del','lo',
  'a','ante','bajo','cabe','con','contra','de','desde','durante','en','entre','hacia','hasta','mediante','para','por','segun','sin','so','sobre','tras','excepto','salvo',
  'yo','tu','vos','ella','ello','nosotros','nosotras','vosotros','vosotras','ellos','ellas','me','te','se','nos','os','le','les','esto','eso','aquello','este','esta','estos','estas','ese','esa','esos','esas','aquel','aquella','aquellos','aquellas','que','quien','quienes','cual','cuales','cuyo','cuya','cuyos','cuyas','mi','mis','su','sus','nuestro','nuestra','nuestros','nuestras','vuestro','vuestra','vuestros','vuestras',
  'uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','primero','primera','segundo','segunda','tercero','tercera','cuarto','cuarta','quinto','quinta','mucho','mucha','muchos','muchas','poco','poca','pocos','pocas','varios','varias','algun','alguna','algunos','algunas','ningun','ninguna','ambos','ambas','cada','todo','toda','todos','todas','tanto','tanta','tantos','tantas',
];
const REGEX_PALABRAS_VACIAS_ACERTIJO = new RegExp('\\b(' + [...new Set(PALABRAS_VACIAS_ACERTIJO)].join('|') + ')\\b', 'g');

// Compara sin importar mayúsculas, tildes ni palabras de relleno (artículos,
// preposiciones, pronombres, numerales), y acepta que escriban solo la parte
// clave de la respuesta (ej. "boleto" alcanza para "Un boleto de micro").
function normalizarRespuestaAcertijo(s){
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(REGEX_PALABRAS_VACIAS_ACERTIJO, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function esRespuestaCorrecta(intento, respuesta){
  const a = normalizarRespuestaAcertijo(intento);
  const b = normalizarRespuestaAcertijo(respuesta);
  if(!a) return false;
  return a === b || b.includes(a) || a.includes(b);
}

function iniciarAcertijos(){
  acertijosSesion = barajar(TODOS_ACERTIJOS).slice(0, ACERTIJOS_POR_SESION);
  acertijoIndex = 0;
  acertijoFase = 'jugando';
  renderAcertijo();
}

function renderAcertijo(){
  const a = acertijosSesion[acertijoIndex];
  document.getElementById('acertijos-sub').textContent = `Acertijo ${acertijoIndex + 1} de ${acertijosSesion.length}`;
  const cont = document.getElementById('acertijos-content');

  let abajoHTML;
  if(acertijoFase === 'acertado'){
    abajoHTML = `
      <div class="acertijo-respuesta">
        <div class="section-label">¡Correcto!</div>
        <p>${a.respuesta}</p>
      </div>
      <button class="btn-primary" onclick="siguienteAcertijo()">Siguiente acertijo</button>`;
  } else if(acertijoFase === 'revelado'){
    abajoHTML = `
      <div class="acertijo-respuesta acertijo-respuesta-neutra">
        <div class="section-label">Respuesta</div>
        <p>${a.respuesta}</p>
      </div>
      <button class="btn-primary" onclick="siguienteAcertijo()">Siguiente acertijo</button>`;
  } else if(acertijoFase === 'confirmando'){
    abajoHTML = `
      <div class="hero" style="margin-top:8px;">
        <h2>${acertijoDesafioActual}</h2>
      </div>
      <div class="acertijo-botones">
        <button class="btn-primary" onclick="confirmarRevelarAcertijo()">Sí, mostrame la respuesta</button>
        <button class="btn-ghost" onclick="cancelarRevelarAcertijo()">No, seguimos pensando</button>
      </div>`;
  } else {
    abajoHTML = `
      <input type="text" id="acertijo-respuesta-input" class="bingo-input-numero" style="width:100%; margin-top:0;" placeholder="Escribí la respuesta" onkeydown="if(event.key==='Enter') comprobarAcertijo();">
      <button class="btn-primary" onclick="comprobarAcertijo()">Comprobar respuesta</button>
      <button class="btn-ghost" onclick="pedirRevelarAcertijo()">No sabemos, mostrar respuesta</button>`;
  }

  cont.innerHTML = `
    <div class="progress-bar"><div class="progress-fill" style="width:${((acertijoIndex + 1) / acertijosSesion.length) * 100}%"></div></div>
    <div class="question-box">
      <div class="qnum">PENSÁ EN GRUPO</div>
      ${a.imagen ? `<div class="acertijo-imagen">${a.imagen}</div>` : ''}
      <h3>${a.pregunta}</h3>
    </div>
    ${abajoHTML}`;

  if(acertijoFase === 'jugando'){
    const input = document.getElementById('acertijo-respuesta-input');
    if(input) input.focus();
  }
}

function comprobarAcertijo(){
  const input = document.getElementById('acertijo-respuesta-input');
  const intento = input ? input.value : '';
  const a = acertijosSesion[acertijoIndex];
  if(esRespuestaCorrecta(intento, a.respuesta)){
    ganarFichas(15);
    mostrarToast('+15 fichas, ¡la sacaron!', 'gain');
    acertijoFase = 'acertado';
  } else {
    ganarFichas(-5);
    mostrarToast('-5 fichas, esa no es... ¡probá de nuevo!', 'loss');
  }
  renderAcertijo();
}

function pedirRevelarAcertijo(){
  acertijoDesafioActual = ACERTIJO_DESAFIOS[Math.floor(Math.random() * ACERTIJO_DESAFIOS.length)];
  acertijoFase = 'confirmando';
  renderAcertijo();
}

function confirmarRevelarAcertijo(){
  acertijoFase = 'revelado';
  renderAcertijo();
}

function cancelarRevelarAcertijo(){
  acertijoFase = 'jugando';
  renderAcertijo();
}

function siguienteAcertijo(){
  acertijoFase = 'jugando';
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
