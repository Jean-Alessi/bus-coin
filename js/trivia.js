let temaActual = null;
let qIndex = 0;
let preguntasSesion = [];
const PREGUNTAS_POR_SESION = 20;

const TEMAS = {
  cultura: {
    nombre: 'Cultura',
    icono: 'estrella',
    preguntas: [
      { cat: 'CULTURA', text: '¿Cuál es la moneda oficial de Argentina?', opciones: ['Peso', 'Real', 'Sol'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Cómo se llamaba el medio por el que se transmitían novelas antes de la TV?', opciones: ['Radioteatro', 'Cine mudo', 'Telégrafo'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Cómo se le dice popularmente al descanso después del almuerzo?', opciones: ['La siesta', 'El recreo', 'La merienda'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Qué día se celebra tradicionalmente San Valentín?', opciones: ['14 de febrero', '14 de marzo', '1 de mayo'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Qué flor se regala tradicionalmente como símbolo de amor?', opciones: ['La rosa', 'El girasol', 'El jazmín'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Cuál es el metal tradicional de los anillos de compromiso?', opciones: ['Oro', 'Cobre', 'Aluminio'], correcta: 0 },
      { cat: 'CULTURA', text: 'En Argentina, ¿en qué mano se usa tradicionalmente el anillo de casados?', opciones: ['Derecha', 'Izquierda', 'Cualquiera'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Qué número de aniversario de bodas se conoce como "bodas de plata"?', opciones: ['25', '10', '50'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Desde qué edad se puede votar de forma optativa en Argentina?', opciones: ['16 años', '18 años', '21 años'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Qué bebida es típica compartir entre amigos en Argentina, tomada con bombilla?', opciones: ['El mate', 'El té', 'El café'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Cuál es el baile nacional de Argentina?', opciones: ['El tango', 'La cumbia', 'El vals'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Qué día se celebra el Día del Amigo en Argentina?', opciones: ['20 de julio', '1 de mayo', '25 de diciembre'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Cómo se llama la comida a base de carne asada típica de los domingos argentinos?', opciones: ['El asado', 'El puchero', 'La milanesa'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Qué escritor argentino escribió "El Aleph" y "Ficciones"?', opciones: ['Jorge Luis Borges', 'Julio Cortázar', 'Gabriel García Márquez'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Cómo se llama el pan típico de las fiestas de fin de año en Argentina?', opciones: ['Pan dulce', 'Pan de campo', 'Pan casero'], correcta: 0 },
      { cat: 'CULTURA', text: '¿En qué provincia se celebra la Fiesta Nacional de la Vendimia?', opciones: ['Mendoza', 'Salta', 'Córdoba'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Cómo se llama el gaucho protagonista del poema de José Hernández?', opciones: ['Martín Fierro', 'Facundo Quiroga', 'Juan Moreira'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Para qué se usa la palabra "che" en el habla argentina?', opciones: ['Para llamar la atención de alguien', 'Para nombrar un baile', 'Para nombrar una comida'], correcta: 0 },
      { cat: 'CULTURA', text: '¿En qué provincia está el santuario del Gauchito Gil, venerado popularmente?', opciones: ['Corrientes', 'Jujuy', 'Chubut'], correcta: 0 },
      { cat: 'CULTURA', text: '¿Qué significa la sigla "IA"?', opciones: ['Inteligencia Artificial', 'Internet Abierto', 'Informática Aplicada'], correcta: 0 },
    ]
  },
  deportes: {
    nombre: 'Deportes',
    icono: 'pelota',
    preguntas: [
      { cat: 'DEPORTES', text: '¿Qué selección ganó el Mundial de fútbol 2022?', opciones: ['Francia', 'Brasil', 'Argentina'], correcta: 2 },
      { cat: 'DEPORTES', text: '¿Cómo le decían a Diego Maradona?', opciones: ['El Diego', 'El Flaco', 'El Kun'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Cuántos jugadores tiene un equipo de fútbol en cancha?', opciones: ['11', '9', '13'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Cada cuántos años se juega el Mundial de fútbol?', opciones: ['4 años', '2 años', '6 años'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿En qué deporte se compite en Wimbledon?', opciones: ['Tenis', 'Golf', 'Rugby'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Qué tenista argentino ganó Roland Garros en 1977?', opciones: ['Guillermo Vilas', 'David Nalbandian', 'Juan Martín del Potro'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿En qué deporte compite Lionel Messi?', opciones: ['Fútbol', 'Básquet', 'Tenis'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Cuántos aros tiene el símbolo olímpico?', opciones: ['5', '4', '6'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Cada cuántos años se celebran los Juegos Olímpicos de verano?', opciones: ['4 años', '2 años', '3 años'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Cómo se conoce popularmente al club Racing Club?', opciones: ['La Academia', 'El Millonario', 'El Xeneize'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿En qué ciudad se juega el torneo de tenis de Wimbledon?', opciones: ['Londres', 'París', 'Nueva York'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Cuántos puntos vale un try en rugby?', opciones: ['5', '3', '7'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Cómo se llama la selección argentina de rugby?', opciones: ['Los Pumas', 'Los Cóndores', 'Los Teros'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿En qué deporte se usa un aro y una pelota naranja?', opciones: ['Básquet', 'Handball', 'Vóley'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Qué selección ganó más Mundiales de fútbol, Brasil o Argentina?', opciones: ['Brasil', 'Argentina', 'Están empatados'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Cómo se llama el estadio de Boca Juniors?', opciones: ['La Bombonera', 'El Monumental', 'El Cilindro'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Cómo se llama el estadio de River Plate?', opciones: ['El Monumental', 'La Bombonera', 'El Gigante de Arroyito'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿En qué carrera de ciclismo se compite durante varias etapas por Francia?', opciones: ['El Tour de Francia', 'La Vuelta a España', 'El Giro de Italia'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Cuántos sets hay que ganar para llevarse un partido de tenis a 3 sets?', opciones: ['2', '3', '1'], correcta: 0 },
      { cat: 'DEPORTES', text: '¿Qué deporte se juega en la arena de la playa, en equipos de 2, con una pelota y una red?', opciones: ['Vóley playa', 'Fútbol playa', 'Tenis playa'], correcta: 0 },
    ]
  },
  viajes: {
    nombre: 'Viajes',
    icono: 'avion',
    preguntas: [
      { cat: 'VIAJES', text: '¿Cuál es la capital de Argentina?', opciones: ['Córdoba', 'Rosario', 'Buenos Aires'], correcta: 2 },
      { cat: 'VIAJES', text: '¿Cuál es el río más largo del mundo?', opciones: ['Amazonas', 'Nilo', 'Paraná'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Cuál es la provincia más grande de Argentina por superficie?', opciones: ['Buenos Aires', 'Santa Cruz', 'Chubut'], correcta: 0 },
      { cat: 'VIAJES', text: '¿En qué continente está Argentina?', opciones: ['América', 'África', 'Europa'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Cuál es el pico más alto de América, ubicado en Mendoza?', opciones: ['Aconcagua', 'Everest', 'Kilimanjaro'], correcta: 0 },
      { cat: 'VIAJES', text: '¿En qué provincia argentina están las Cataratas del Iguazú?', opciones: ['Misiones', 'Corrientes', 'Chaco'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Cuál es la ciudad más austral del mundo, en Tierra del Fuego?', opciones: ['Ushuaia', 'Río Gallegos', 'Bariloche'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Qué país limita con Argentina cruzando la Cordillera de los Andes?', opciones: ['Chile', 'Brasil', 'Uruguay'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Cuántas provincias tiene Argentina?', opciones: ['23', '20', '26'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Qué idioma se habla en Brasil?', opciones: ['Portugués', 'Español', 'Francés'], correcta: 0 },
      { cat: 'VIAJES', text: '¿En qué país está el gran desierto salado llamado Salar de Uyuni?', opciones: ['Bolivia', 'Perú', 'Chile'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Qué océano baña la costa este de Argentina?', opciones: ['El Atlántico', 'El Pacífico', 'El Índico'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Cuál es la capital de Francia?', opciones: ['París', 'Londres', 'Roma'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Cuál es el país más grande de Sudamérica?', opciones: ['Brasil', 'Argentina', 'Perú'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Cómo se llama la región compartida entre Argentina y Chile, famosa por sus glaciares?', opciones: ['Patagonia', 'Amazonía', 'Pampa'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Cómo se llama la moneda de Chile?', opciones: ['Peso chileno', 'Sol', 'Real'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Qué avenida porteña es considerada una de las más anchas del mundo?', opciones: ['Avenida 9 de Julio', 'Avenida Corrientes', 'Avenida de Mayo'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Cuál es la capital de Perú?', opciones: ['Lima', 'Quito', 'Bogotá'], correcta: 0 },
      { cat: 'VIAJES', text: '¿En qué país está ubicada la Torre Eiffel?', opciones: ['Francia', 'Italia', 'España'], correcta: 0 },
      { cat: 'VIAJES', text: '¿Cuál es la capital de Uruguay?', opciones: ['Montevideo', 'Punta del Este', 'Colonia'], correcta: 0 },
    ]
  },
  historia: {
    nombre: 'Historia',
    icono: 'reloj',
    preguntas: [
      { cat: 'HISTORIA', text: '¿En qué año se independizó Argentina?', opciones: ['1810', '1816', '1853'], correcta: 1 },
      { cat: 'HISTORIA', text: '¿Quién fue el primer presidente bajo la Constitución de 1853?', opciones: ['Bernardino Rivadavia', 'Justo José de Urquiza', 'Domingo Sarmiento'], correcta: 1 },
      { cat: 'HISTORIA', text: '¿En qué década se inauguró el subte de Buenos Aires, el primero de Latinoamérica?', opciones: ['1910', '1930', '1950'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Qué medio conectaba históricamente los pueblos del interior antes de las rutas asfaltadas?', opciones: ['El ferrocarril', 'El subte', 'El avión'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Quién fue el libertador de Argentina, Chile y Perú?', opciones: ['José de San Martín', 'Manuel Belgrano', 'Simón Bolívar'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿En qué año se creó la bandera argentina?', opciones: ['1812', '1816', '1806'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Quién creó la bandera argentina?', opciones: ['Manuel Belgrano', 'José de San Martín', 'Bernardino Rivadavia'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿En qué fecha se celebra el Día de la Independencia argentina?', opciones: ['9 de julio', '25 de mayo', '20 de junio'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Qué hecho histórico se conmemora el 25 de mayo en Argentina?', opciones: ['La Revolución de Mayo', 'La Declaración de la Independencia', 'La Batalla de Maipú'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Cómo se conoce popularmente a la primera mujer presidenta de Argentina?', opciones: ['Isabel Perón', 'Evita', 'Cristina'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿En qué año terminó la Segunda Guerra Mundial?', opciones: ['1945', '1939', '1950'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Qué muro cayó en 1989, marcando el fin de la división de Alemania?', opciones: ['El Muro de Berlín', 'La Gran Muralla', 'El Muro de Adriano'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Quién fue el primer hombre en pisar la Luna?', opciones: ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿En qué año llegó Cristóbal Colón a América?', opciones: ['1492', '1500', '1450'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Cómo se llamó el conflicto bélico entre Argentina y Reino Unido en 1982?', opciones: ['Guerra de Malvinas', 'Guerra del Paraguay', 'Guerra de la Triple Alianza'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Con qué apodo popular se conoce a Eva Perón?', opciones: ['Evita', 'Chola', 'Coca'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿En qué siglo se produjo la Revolución Francesa?', opciones: ['Siglo XVIII', 'Siglo XVII', 'Siglo XIX'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Qué antigua civilización construyó las pirámides de Guiza?', opciones: ['El Antiguo Egipto', 'El Imperio Romano', 'Los Mayas'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Cómo se llamaba el barco que se hundió en 1912 tras chocar con un iceberg?', opciones: ['El Titanic', 'El Lusitania', 'El Bismarck'], correcta: 0 },
      { cat: 'HISTORIA', text: '¿Quién pintó la Mona Lisa?', opciones: ['Leonardo da Vinci', 'Pablo Picasso', 'Miguel Ángel'], correcta: 0 },
    ]
  },
  animales: {
    nombre: 'Animales',
    icono: 'pata',
    preguntas: [
      { cat: 'ANIMALES', text: '¿Cuál es el animal terrestre más grande del mundo?', opciones: ['Elefante africano', 'Rinoceronte', 'Jirafa'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Qué animal es conocido como "el rey de la selva"?', opciones: ['El tigre', 'El león', 'El leopardo'], correcta: 1 },
      { cat: 'ANIMALES', text: '¿Cuántas patas tiene una araña?', opciones: ['6', '8', '10'], correcta: 1 },
      { cat: 'ANIMALES', text: '¿Cuál es el animal más rápido en tierra?', opciones: ['El guepardo', 'El león', 'El caballo'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Cuál es el mamífero más grande del mundo?', opciones: ['La ballena azul', 'El elefante', 'El tiburón blanco'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Qué animal, símbolo de Australia, lleva a sus crías en una bolsa?', opciones: ['El canguro', 'El koala', 'El ornitorrinco'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Cómo se llama el ave no voladora más grande de Sudamérica, típica de la pampa?', opciones: ['El ñandú', 'El avestruz', 'El tero'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Cuántos corazones tiene un pulpo?', opciones: ['3', '1', '5'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Qué animal es considerado "el mejor amigo del hombre"?', opciones: ['El perro', 'El gato', 'El caballo'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Cuál es el felino más grande de América?', opciones: ['El jaguar', 'El puma', 'El ocelote'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Qué animal produce la miel?', opciones: ['La abeja', 'La avispa', 'La mariposa'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Cómo se llama el camélido andino usado como animal de carga?', opciones: ['La llama', 'La alpaca', 'La vicuña'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Qué animal cambia de color para camuflarse?', opciones: ['El camaleón', 'El lagarto', 'La iguana'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Cuál es el reptil más grande del mundo?', opciones: ['El cocodrilo marino', 'La tortuga marina', 'La serpiente pitón'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Qué animal tiene el cuello más largo del mundo?', opciones: ['La jirafa', 'El camello', 'El avestruz'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Cómo se llaman las crías de la vaca?', opciones: ['Terneros', 'Potrillos', 'Cabritos'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Qué ave es el ave nacional de Argentina?', opciones: ['El hornero', 'El cóndor', 'El ñandú'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Cuál es el único mamífero capaz de volar?', opciones: ['El murciélago', 'La ardilla voladora', 'El águila'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Qué animal teje telas para atrapar insectos?', opciones: ['La araña', 'La abeja', 'La hormiga'], correcta: 0 },
      { cat: 'ANIMALES', text: '¿Cuántas patas tiene un insecto?', opciones: ['6', '8', '4'], correcta: 0 },
    ]
  },
  cine_musica: {
    nombre: 'Cine y Música',
    icono: 'musica',
    preguntas: [
      { cat: 'CINE Y MÚSICA', text: '¿Qué película argentina ganó el Oscar a Mejor Película Extranjera en 2010?', opciones: ['Relatos Salvajes', 'El Secreto de sus Ojos', 'Nueve Reinas'], correcta: 1 },
      { cat: 'CINE Y MÚSICA', text: '¿De qué país es la cantante Shakira?', opciones: ['México', 'Colombia', 'España'], correcta: 1 },
      { cat: 'CINE Y MÚSICA', text: '¿Con qué se mezclan canciones en vivo?', opciones: ['Un bandoneón', 'Una controladora de DJ', 'Un violín'], correcta: 1 },
      { cat: 'CINE Y MÚSICA', text: '¿Dónde se suelen ver maratones de series hoy en día?', opciones: ['Plataformas de streaming', 'Radio AM', 'Fax'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿De qué color es Bob Esponja?', opciones: ['Amarillo', 'Verde', 'Azul'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿Cómo se llama el ratón más famoso de Disney?', opciones: ['Jerry', 'Mickey', 'Speedy Gonzales'], correcta: 1 },
      { cat: 'CINE Y MÚSICA', text: '¿Cuántos cerditos hay en el cuento de "Los tres chanchitos"?', opciones: ['2', '3', '4'], correcta: 1 },
      { cat: 'CINE Y MÚSICA', text: '¿Qué le pasaba a Pinocho cuando mentía?', opciones: ['Le crecía la nariz', 'Le crecían las orejas', 'Se quedaba mudo'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿Cómo se llama la película de 1997 sobre un romance en el Titanic?', opciones: ['Titanic', 'Ghost', 'Náufrago'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿Qué género musical se baila típicamente en una milonga?', opciones: ['Tango', 'Reggaetón', 'Heavy metal'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿Qué instrumento se asocia a las serenatas románticas?', opciones: ['La guitarra', 'La batería', 'El bajo'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿A quién se considera el "Zorzal Criollo" del tango?', opciones: ['Carlos Gardel', 'Aníbal Troilo', 'Astor Piazzolla'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿Qué instrumento es central en el tango?', opciones: ['El bandoneón', 'El saxofón', 'El arpa'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿A quién se conoce como el Rey del Pop?', opciones: ['Michael Jackson', 'Elvis Presley', 'Freddie Mercury'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿Qué banda argentina canta "De Música Ligera"?', opciones: ['Soda Stereo', 'Los Redonditos de Ricota', 'Sumo'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿En qué película animada un pez payaso busca a su hijo perdido?', opciones: ['Buscando a Nemo', 'Shrek', 'Ratatouille'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿Qué actor interpretó a Iron Man en las películas de Marvel?', opciones: ['Robert Downey Jr.', 'Chris Evans', 'Chris Hemsworth'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿En qué ciudad de Estados Unidos nació el jazz?', opciones: ['Nueva Orleans', 'Nueva York', 'Chicago'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: '¿En qué ciudad cordobesa se realiza el festival "Cosquín Rock"?', opciones: ['Cosquín', 'Villa Carlos Paz', 'Alta Gracia'], correcta: 0 },
      { cat: 'CINE Y MÚSICA', text: 'Además de la guitarra y la trompeta, ¿qué instrumento toca tradicionalmente un mariachi?', opciones: ['El violín', 'El bandoneón', 'La batería'], correcta: 0 },
    ]
  },
};

function barajar(lista){
  const copia = lista.slice();
  for(let i = copia.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function iniciarTrivia(){
  temaActual = null;
  renderSeleccionTema();
}

function renderSeleccionTema(){
  document.getElementById('trivia-sub').textContent = 'Elegí un tema';
  const cont = document.getElementById('trivia-content');
  cont.innerHTML = `
    <div class="section-label">Temas</div>
    ${Object.keys(TEMAS).map(id => {
      const t = TEMAS[id];
      return `<div class="card" onclick="elegirTema('${id}')">
        <div class="icon">${icono(t.icono)}</div>
        <div class="txt"><h3>${t.nombre}</h3><p>${t.preguntas.length} preguntas</p></div>
      </div>`;
    }).join('')}`;
}

function elegirTema(id){
  temaActual = id;
  preguntasSesion = barajar(TEMAS[id].preguntas).slice(0, PREGUNTAS_POR_SESION);
  qIndex = 0;
  renderPregunta();
}

function renderPregunta(){
  const p = preguntasSesion[qIndex];
  document.getElementById('trivia-sub').textContent = `${TEMAS[temaActual].nombre} — Pregunta ${qIndex + 1} de ${preguntasSesion.length}`;
  const cont = document.getElementById('trivia-content');
  cont.innerHTML = `
    <div class="progress-bar"><div class="progress-fill" style="width:${((qIndex + 1) / preguntasSesion.length) * 100}%"></div></div>
    <div class="question-box">
      <div class="qnum">${p.cat}</div>
      <h3>${p.text}</h3>
    </div>
    <div id="q-options">${p.opciones.map((op, i) => `<div class="option" onclick="responder(${i})">${op}</div>`).join('')}</div>`;
}

function responder(i){
  const p = preguntasSesion[qIndex];
  const opts = document.querySelectorAll('.option');
  opts.forEach((o, idx) => {
    o.onclick = null;
    if(idx === p.correcta) o.classList.add('correct');
    else if(idx === i) o.classList.add('wrong');
  });
  if(i === p.correcta){
    ganarFichas(5);
    mostrarToast('+5 fichas por acertar', 'gain');
  } else {
    mostrarToast('Esa no era... ¡a la próxima!');
  }
  setTimeout(() => {
    if(qIndex < preguntasSesion.length - 1){
      qIndex++;
      renderPregunta();
    } else {
      renderResultadoSesion();
    }
  }, 1800);
}

function renderResultadoSesion(){
  document.getElementById('trivia-sub').textContent = 'Elegí un tema';
  const cont = document.getElementById('trivia-content');
  cont.innerHTML = `
    <div class="hero" style="margin-top:8px;">
      <h2>¡Terminaste ${TEMAS[temaActual].nombre}!</h2>
      <p>Podés jugar este tema de nuevo o elegir otro.</p>
    </div>
    <button class="btn-primary" onclick="elegirTema('${temaActual}')">Jugar de nuevo este tema</button>
    <button class="btn-ghost" onclick="renderSeleccionTema()">Elegir otro tema</button>`;
}
