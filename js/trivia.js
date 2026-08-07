let qIndex = 0;
let preguntasSesion = [];
const PREGUNTAS_POR_SESION = 6;

const preguntas = [
  // ---- Generales (todos los segmentos) ----
  { cat:"CULTURA GENERAL", text:"¿En qué año se independizó Argentina?", opciones:["1810","1816","1853"], correcta:1, segmentos:["todos"] },
  { cat:"GEOGRAFÍA", text:"¿Cuál es la capital de Argentina?", opciones:["Córdoba","Rosario","Buenos Aires"], correcta:2, segmentos:["todos"] },
  { cat:"GEOGRAFÍA", text:"¿Cuál es el río más largo del mundo?", opciones:["Amazonas","Nilo","Paraná"], correcta:0, segmentos:["todos"] },
  { cat:"GEOGRAFÍA", text:"¿Cuál es la provincia más grande de Argentina por superficie?", opciones:["Buenos Aires","Santa Cruz","Chubut"], correcta:0, segmentos:["todos"] },
  { cat:"DEPORTES", text:"¿Qué selección ganó el Mundial de fútbol 2022?", opciones:["Francia","Brasil","Argentina"], correcta:2, segmentos:["todos"] },
  { cat:"DEPORTES", text:"¿Cómo le decían a Diego Maradona?", opciones:["El Diego","El Flaco","El Kun"], correcta:0, segmentos:["todos"] },
  { cat:"CINE Y SERIES", text:"¿Qué película argentina ganó el Oscar a Mejor Película Extranjera en 2010?", opciones:["Relatos Salvajes","El Secreto de sus Ojos","Nueve Reinas"], correcta:1, segmentos:["todos"] },
  { cat:"CURIOSIDADES", text:"¿Cuál es el ave nacional de Argentina?", opciones:["El hornero","El cóndor","El ñandú"], correcta:0, segmentos:["todos"] },
  { cat:"CURIOSIDADES", text:"¿Cuál es la moneda oficial de Argentina?", opciones:["Peso","Real","Sol"], correcta:0, segmentos:["todos"] },
  { cat:"DESTINO", text:"¿Qué provincia estamos por visitar?", opciones:["Córdoba","Mendoza","Santa Fe"], correcta:0, segmentos:["todos"] },

  // ---- Estudiantes ----
  { cat:"TECNOLOGÍA", text:"¿Qué significa la sigla 'IA'?", opciones:["Inteligencia Artificial","Internet Abierto","Informática Aplicada"], correcta:0, segmentos:["estudiantes"] },
  { cat:"TECNOLOGÍA", text:"¿Qué empresa creó el iPhone?", opciones:["Samsung","Apple","Google"], correcta:1, segmentos:["estudiantes"] },
  { cat:"MÚSICA", text:"¿De qué país es la cantante Shakira?", opciones:["México","Colombia","España"], correcta:1, segmentos:["estudiantes"] },
  { cat:"MÚSICA", text:"¿Con qué se mezclan canciones en vivo?", opciones:["Un bandoneón","Una controladora de DJ","Un violín"], correcta:1, segmentos:["estudiantes"] },
  { cat:"CULTURA POP", text:"¿Dónde se suelen ver maratones de series hoy en día?", opciones:["Plataformas de streaming","Radio AM","Fax"], correcta:0, segmentos:["estudiantes"] },
  { cat:"CULTURA GENERAL", text:"¿Desde qué edad se puede votar de forma optativa en Argentina?", opciones:["16 años","18 años","21 años"], correcta:0, segmentos:["estudiantes"] },
  { cat:"GEOGRAFÍA", text:"¿Cuál es la universidad pública más grande de Argentina por cantidad de estudiantes?", opciones:["UBA","UNC","UNLP"], correcta:0, segmentos:["estudiantes"] },
  { cat:"CURIOSIDADES", text:"¿Para qué sirve el wifi?", opciones:["Conexión a internet inalámbrica","Un tipo de batería","Una app de mensajes"], correcta:0, segmentos:["estudiantes"] },

  // ---- Jubilados ----
  { cat:"HISTORIA", text:"¿Quién fue el primer presidente bajo la Constitución de 1853?", opciones:["Bernardino Rivadavia","Justo José de Urquiza","Domingo Sarmiento"], correcta:1, segmentos:["jubilados"] },
  { cat:"HISTORIA", text:"¿En qué década se inauguró el subte de Buenos Aires, el primero de Latinoamérica?", opciones:["1910","1930","1950"], correcta:0, segmentos:["jubilados"] },
  { cat:"MÚSICA", text:"¿Quién es considerado el 'Zorzal Criollo' del tango?", opciones:["Carlos Gardel","Aníbal Troilo","Astor Piazzolla"], correcta:0, segmentos:["jubilados"] },
  { cat:"MÚSICA", text:"¿Qué instrumento es central en el tango?", opciones:["Bandoneón","Saxofón","Arpa"], correcta:0, segmentos:["jubilados"] },
  { cat:"CULTURA GENERAL", text:"¿Cómo se llamaba el medio por el que se transmitían novelas antes de la TV, muy popular a mediados del siglo XX?", opciones:["Radioteatro","Cine mudo","Telégrafo"], correcta:0, segmentos:["jubilados"] },
  { cat:"HISTORIA", text:"¿Qué medio conectaba históricamente a los pueblos del interior antes de las rutas asfaltadas?", opciones:["El ferrocarril","El subte","El avión"], correcta:0, segmentos:["jubilados"] },
  { cat:"COCINA", text:"¿Qué carne es la base tradicional del asado argentino?", opciones:["Vacuna","De cerdo","De cordero"], correcta:0, segmentos:["jubilados"] },
  { cat:"CULTURA GENERAL", text:"¿Cómo se le dice popularmente al descanso después del almuerzo?", opciones:["La siesta","El recreo","La merienda"], correcta:0, segmentos:["jubilados"] },

  // ---- Familia ----
  { cat:"ANIMALES", text:"¿Cuál es el animal terrestre más grande del mundo?", opciones:["Elefante africano","Rinoceronte","Jirafa"], correcta:0, segmentos:["familia"] },
  { cat:"ANIMALES", text:"¿Qué animal es conocido como 'el rey de la selva'?", opciones:["El tigre","El león","El leopardo"], correcta:1, segmentos:["familia"] },
  { cat:"DIBUJOS", text:"¿De qué color es Bob Esponja?", opciones:["Amarillo","Verde","Azul"], correcta:0, segmentos:["familia"] },
  { cat:"DIBUJOS", text:"¿Cómo se llama el ratón más famoso de Disney?", opciones:["Jerry","Mickey","Speedy Gonzales"], correcta:1, segmentos:["familia"] },
  { cat:"CUENTOS", text:"¿Cuántos cerditos hay en el cuento de 'Los tres chanchitos'?", opciones:["2","3","4"], correcta:1, segmentos:["familia"] },
  { cat:"CUENTOS", text:"¿Qué le pasaba a Pinocho cuando mentía?", opciones:["Le crecía la nariz","Le crecían las orejas","Se quedaba mudo"], correcta:0, segmentos:["familia"] },
  { cat:"GEOGRAFÍA FÁCIL", text:"¿En qué continente está Argentina?", opciones:["América","África","Europa"], correcta:0, segmentos:["familia"] },
  { cat:"CURIOSIDADES", text:"¿Cuántas patas tiene una araña?", opciones:["6","8","10"], correcta:1, segmentos:["familia"] },

  // ---- Pareja ----
  { cat:"CINE ROMÁNTICO", text:"¿Cómo se llama la película de 1997 sobre un romance en el Titanic?", opciones:["Titanic","Ghost","Náufrago"], correcta:0, segmentos:["pareja"] },
  { cat:"MÚSICA", text:"¿Qué género musical es típico para bailar en pareja en una milonga?", opciones:["Tango","Reggaetón","Heavy metal"], correcta:0, segmentos:["pareja"] },
  { cat:"CULTURA GENERAL", text:"¿Qué día se celebra tradicionalmente San Valentín?", opciones:["14 de febrero","14 de marzo","1 de mayo"], correcta:0, segmentos:["pareja"] },
  { cat:"CURIOSIDADES", text:"¿Qué flor se regala tradicionalmente como símbolo de amor?", opciones:["La rosa","El girasol","El jazmín"], correcta:0, segmentos:["pareja"] },
  { cat:"CULTURA GENERAL", text:"¿Cuál es el metal tradicional de los anillos de compromiso?", opciones:["Oro","Cobre","Aluminio"], correcta:0, segmentos:["pareja"] },
  { cat:"MÚSICA", text:"¿Qué instrumento se asocia tradicionalmente a las serenatas románticas?", opciones:["La guitarra","La batería","El bajo"], correcta:0, segmentos:["pareja"] },
  { cat:"CURIOSIDADES", text:"En Argentina, ¿en qué mano se usa tradicionalmente el anillo de casados?", opciones:["Derecha","Izquierda","Cualquiera"], correcta:0, segmentos:["pareja"] },
  { cat:"CULTURA GENERAL", text:"¿Qué número de aniversario de bodas se conoce como 'bodas de plata'?", opciones:["25","10","50"], correcta:0, segmentos:["pareja"] },
];

function barajar(lista){
  const copia = lista.slice();
  for(let i = copia.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function preguntasParaSegmento(seg){
  return preguntas.filter(p => p.segmentos.includes('todos') || p.segmentos.includes(seg));
}

function iniciarTrivia(){
  const pool = preguntasParaSegmento(segmento || 'estudiantes');
  preguntasSesion = barajar(pool).slice(0, PREGUNTAS_POR_SESION);
  qIndex = 0;
  renderPregunta();
}

function renderPregunta(){
  const p = preguntasSesion[qIndex];
  document.getElementById('trivia-sub').textContent = `Pregunta ${qIndex+1} de ${preguntasSesion.length}`;
  document.getElementById('trivia-progress').style.width = `${((qIndex+1)/preguntasSesion.length)*100}%`;
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
  const p = preguntasSesion[qIndex];
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
    if(qIndex < preguntasSesion.length - 1){
      qIndex++;
      renderPregunta();
    } else {
      showView('ranking');
    }
  }, 1200);
}
