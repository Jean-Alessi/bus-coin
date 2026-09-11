// Sopa de letras temática: destinos y cosas del micro/viaje, para buscar en
// una grilla de letras. Igual que Sudoku y Patrones, los puzzles ya vienen
// generados y verificados de antes (con un script de Node aparte que revisa
// que cada palabra esté realmente en la grilla) — acá no se genera nada al
// vuelo, solo se muestra y se juega.
//
// Para elegir una palabra se toca la primera letra y después la última
// (nada de arrastrar el dedo, para que funcione igual de bien en cualquier
// pantalla): si esas dos celdas forman una línea recta (horizontal,
// vertical o diagonal) y coinciden con una palabra pendiente —leída en
// cualquiera de los dos sentidos—, queda marcada como encontrada.

const SOPA_BANCO = {"facil":[{"size":8,"palabras":["PARANA","MICRO","GUARDA","BUTACA","SALTA","EQUIPAJE"],"grid":["AYOEXGWI","TIPJDUEQ","LVPARANA","AMXGGRFW","SDZIRDEO","EQUIPAJE","PACATUBQ","MICROFEO"],"posiciones":{"EQUIPAJE":{"inicio":[5,0],"fin":[5,7]},"PARANA":{"inicio":[2,2],"fin":[2,7]},"GUARDA":{"inicio":[0,5],"fin":[5,5]},"BUTACA":{"inicio":[6,6],"fin":[6,1]},"MICRO":{"inicio":[7,0],"fin":[7,4]},"SALTA":{"inicio":[4,0],"fin":[0,0]}}},{"size":8,"palabras":["CORDOBA","MALETA","USHUAIA","JUJUY","ALMOHADA","RUFINO"],"grid":["GABODROC","YYRILJEW","ADAHOMLA","ONIFURZV","USHUAIAU","ATELAMIK","WYUJUJYU","OUGUHMAG"],"posiciones":{"ALMOHADA":{"inicio":[2,7],"fin":[2,0]},"CORDOBA":{"inicio":[0,7],"fin":[0,1]},"USHUAIA":{"inicio":[4,0],"fin":[4,6]},"MALETA":{"inicio":[5,5],"fin":[5,0]},"RUFINO":{"inicio":[3,5],"fin":[3,0]},"JUJUY":{"inicio":[6,5],"fin":[6,1]}}},{"size":8,"palabras":["GUARDA","CORDOBA","FORMOSA","JUJUY","SALTA","MENDOZA"],"grid":["LMENDOZA","MLIDFEPQ","SLFBUCNG","VFORMOSA","NJUJUYRD","CORDOBAT","HGUARDAI","PYSALTAZ"],"posiciones":{"CORDOBA":{"inicio":[5,0],"fin":[5,6]},"FORMOSA":{"inicio":[3,1],"fin":[3,7]},"MENDOZA":{"inicio":[0,1],"fin":[0,7]},"GUARDA":{"inicio":[6,1],"fin":[6,6]},"JUJUY":{"inicio":[4,1],"fin":[4,5]},"SALTA":{"inicio":[7,2],"fin":[7,6]}}},{"size":8,"palabras":["MALETA","ROSARIO","CORDOBA","IGUAZU","TUCUMAN","BOLETO"],"grid":["OBOLETOO","DUZAUGII","BHHUDOER","GENOGOUA","TUCUMANS","ABODROCO","NVSBJAIR","LMALETAE"],"posiciones":{"ROSARIO":{"inicio":[6,7],"fin":[0,7]},"CORDOBA":{"inicio":[5,6],"fin":[5,0]},"TUCUMAN":{"inicio":[4,0],"fin":[4,6]},"MALETA":{"inicio":[7,1],"fin":[7,6]},"IGUAZU":{"inicio":[1,6],"fin":[1,1]},"BOLETO":{"inicio":[0,1],"fin":[0,6]}}},{"size":8,"palabras":["MICRO","TERMINAL","GUARDA","BUTACA","ROSARIO","VIAJE"],"grid":["XBBLAALQ","DJLOCDAB","TGQIARNE","BSMRTAIJ","KHQAUUMA","KZWSBGRI","BYNORJEV","MICROCTL"],"posiciones":{"TERMINAL":{"inicio":[7,6],"fin":[0,6]},"ROSARIO":{"inicio":[7,3],"fin":[1,3]},"GUARDA":{"inicio":[5,5],"fin":[0,5]},"BUTACA":{"inicio":[5,4],"fin":[0,4]},"MICRO":{"inicio":[7,0],"fin":[7,4]},"VIAJE":{"inicio":[6,7],"fin":[2,7]}}},{"size":8,"palabras":["CORDOBA","ALMOHADA","CINTURON","BUTACA","PARANA","EQUIPAJE"],"grid":["IENANYXA","LJWCODJL","MABORAYM","BPURUNIO","OITDTAXH","DUAONRSA","VQCBIALD","QEAACPZA"],"posiciones":{"ALMOHADA":{"inicio":[0,7],"fin":[7,7]},"CINTURON":{"inicio":[7,4],"fin":[0,4]},"EQUIPAJE":{"inicio":[7,1],"fin":[0,1]},"CORDOBA":{"inicio":[1,3],"fin":[7,3]},"BUTACA":{"inicio":[2,2],"fin":[7,2]},"PARANA":{"inicio":[7,5],"fin":[2,5]}}}],"dificil":[{"size":11,"palabras":["BUTACA","VENTANILLA","RUTA","JUJUY","MOCHILA","CORRIENTES","IGUAZU","CHOFER"],"grid":["HYUJUJJEOCK","GUZAUGINBRY","AMUFMBUTACA","SETNEIRROCI","IZIMUAOAGLP","YIUMOCHILAH","VRCHOFERADB","OURMUMTIUTA","ZTZDNWQJSMB","GAAVJBHBKWM","VENTANILLAM"],"posiciones":{"VENTANILLA":{"inicio":[10,0],"fin":[10,9]},"CORRIENTES":{"inicio":[3,9],"fin":[3,0]},"MOCHILA":{"inicio":[5,3],"fin":[5,9]},"BUTACA":{"inicio":[2,5],"fin":[2,10]},"IGUAZU":{"inicio":[1,6],"fin":[1,1]},"CHOFER":{"inicio":[6,2],"fin":[6,7]},"JUJUY":{"inicio":[0,5],"fin":[0,1]},"RUTA":{"inicio":[6,1],"fin":[9,1]}}},{"size":11,"palabras":["NEUQUEN","BUTACA","RUTA","RUFINO","PARANA","JUJUY","EQUIPAJE","MALETA"],"grid":["VKSISMALETA","DCKEBBMNYHI","ONIFUREMITO","NACATUBJZUS","IINRQQKMLBB","KMVUUVAKXLA","MOETOTPORHN","JNOUMMABPJA","RHDCLFAUSLR","ZTEQUIPAJEA","MUUJTJUJUYP"],"posiciones":{"EQUIPAJE":{"inicio":[9,2],"fin":[9,9]},"NEUQUEN":{"inicio":[7,1],"fin":[1,7]},"BUTACA":{"inicio":[3,6],"fin":[3,1]},"RUFINO":{"inicio":[2,5],"fin":[2,0]},"PARANA":{"inicio":[10,10],"fin":[5,10]},"MALETA":{"inicio":[0,5],"fin":[0,10]},"JUJUY":{"inicio":[10,5],"fin":[10,9]},"RUTA":{"inicio":[4,3],"fin":[7,6]}}},{"size":11,"palabras":["CORRIENTES","VIAJE","CATAMARCA","MENDOZA","TERMINAL","PARANA","ROSARIO","GUARDA"],"grid":["AZODNEMABDC","ADRAUGCPEVA","KOWTTROHSJT","UPYUTNROPKA","AOLHNOREJTM","NITERMINALA","ARTQNPEBGDR","RAPFOJNUHLC","ASSTXOTDNQA","POVIAJEECYR","NRPRBSSEFLM"],"posiciones":{"CORRIENTES":{"inicio":[1,6],"fin":[10,6]},"CATAMARCA":{"inicio":[0,10],"fin":[8,10]},"TERMINAL":{"inicio":[5,2],"fin":[5,9]},"MENDOZA":{"inicio":[0,6],"fin":[0,0]},"ROSARIO":{"inicio":[10,1],"fin":[4,1]},"PARANA":{"inicio":[9,0],"fin":[4,0]},"GUARDA":{"inicio":[1,5],"fin":[1,0]},"VIAJE":{"inicio":[9,2],"fin":[9,6]}}},{"size":11,"palabras":["GUARDA","RUTA","JUJUY","VENTANILLA","USHUAIA","BARILOCHE","ASIENTO","VIAJE"],"grid":["IIEOUBTBTRO","EXJVSQZARVT","BGAEHGNRACN","BBINUJWIJRE","YYVTAGMLUFI","FUJAIUIOJRS","WSDNAVKCUUA","ZCBIIMRHYTR","UVVLVXPEKAX","LYQLAHUJILW","KGUARDAZINN"],"posiciones":{"VENTANILLA":{"inicio":[1,3],"fin":[10,3]},"BARILOCHE":{"inicio":[0,7],"fin":[8,7]},"USHUAIA":{"inicio":[0,4],"fin":[6,4]},"ASIENTO":{"inicio":[6,10],"fin":[0,10]},"GUARDA":{"inicio":[10,1],"fin":[10,6]},"JUJUY":{"inicio":[3,8],"fin":[7,8]},"VIAJE":{"inicio":[4,2],"fin":[0,2]},"RUTA":{"inicio":[5,9],"fin":[8,9]}}},{"size":11,"palabras":["BOLETO","CORDOBA","MOCHILA","GUARDA","VENTANILLA","RUFINO","ALMOHADA","POSADAS"],"grid":["AGUARDAIOMX","LVSONIFURKC","LKAJUIGWPOL","IADJKCMGRAE","NLAWJOXDLHX","AISEGJOMLBM","THOEABOJOQO","NCPGAHTLAQW","EOZTATEYPRN","VMGDUTBUQYE","HAAYOOQNRJJ"],"posiciones":{"VENTANILLA":{"inicio":[9,0],"fin":[0,0]},"ALMOHADA":{"inicio":[3,9],"fin":[10,2]},"CORDOBA":{"inicio":[1,10],"fin":[7,4]},"MOCHILA":{"inicio":[9,1],"fin":[3,1]},"POSADAS":{"inicio":[7,2],"fin":[1,2]},"BOLETO":{"inicio":[5,9],"fin":[10,4]},"GUARDA":{"inicio":[0,1],"fin":[0,6]},"RUFINO":{"inicio":[1,8],"fin":[1,3]}}},{"size":11,"palabras":["JUJUY","BARILOCHE","MOCHILA","ASIENTO","EQUIPAJE","CORRIENTES","PASAJE","BOLETO"],"grid":["SROSITNCBGT","ZAENDHFOAAA","LWLEYSLRRSL","DDYUJUJRIII","IOVWNMQILEH","EQUIPAJEONC","EBOLETONCTO","TIQVYLDTHOM","UWODILYEEKQ","EJASAPCSZYU","KWKCPADSFNO"],"posiciones":{"CORRIENTES":{"inicio":[0,7],"fin":[9,7]},"BARILOCHE":{"inicio":[0,8],"fin":[8,8]},"EQUIPAJE":{"inicio":[5,0],"fin":[5,7]},"MOCHILA":{"inicio":[7,10],"fin":[1,10]},"ASIENTO":{"inicio":[1,9],"fin":[7,9]},"PASAJE":{"inicio":[9,5],"fin":[9,0]},"BOLETO":{"inicio":[6,1],"fin":[6,6]},"JUJUY":{"inicio":[3,6],"fin":[3,2]}}}]};

const SOPA_NOMBRE_NIVEL = { facil: 'Fácil', dificil: 'Difícil' };
const SOPA_PREMIO_PALABRA = 2;
const SOPA_PREMIO_COMPLETAR = { facil: 6, dificil: 9 };

let sopaNivel = null;
let sopaIndice = 0;
let sopaPuzzle = null;
let sopaEncontradas = new Set();
let sopaCeldasEncontradas = {};
let sopaInicio = null;

function iniciarSopa(){
  sopaNivel = null;
  renderSopa();
}

function sopaElegirNivel(nivel){
  sopaNivel = nivel;
  sopaIndice = Math.floor(Math.random() * SOPA_BANCO[nivel].length);
  sopaComenzar();
}

function sopaComenzar(){
  sopaPuzzle = SOPA_BANCO[sopaNivel][sopaIndice];
  sopaEncontradas = new Set();
  sopaCeldasEncontradas = {};
  sopaInicio = null;
  renderSopa();
}

function sopaOtroPuzzle(){
  sopaIndice = (sopaIndice + 1) % SOPA_BANCO[sopaNivel].length;
  sopaComenzar();
}

function sopaVolverANiveles(){
  sopaNivel = null;
  renderSopa();
}

function sopaClaveCelda(fila, col){ return `${fila}-${col}`; }

// Todas las celdas ya encontradas, para pintarlas distinto en la grilla.
function sopaCeldasEncontradasSet(){
  const set = new Set();
  Object.values(sopaCeldasEncontradas).forEach(celdas => celdas.forEach(([f,c]) => set.add(sopaClaveCelda(f,c))));
  return set;
}

function sopaTocarCelda(fila, col){
  if(!sopaInicio){
    sopaInicio = { fila, col };
    renderSopa();
    return;
  }
  const inicio = sopaInicio;
  sopaInicio = null;

  if(inicio.fila === fila && inicio.col === col){ renderSopa(); return; }

  const df = Math.sign(fila - inicio.fila);
  const dc = Math.sign(col - inicio.col);
  const distFila = Math.abs(fila - inicio.fila);
  const distCol = Math.abs(col - inicio.col);
  const esLineaRecta = df === 0 || dc === 0 || distFila === distCol;
  if(!esLineaRecta){ renderSopa(); return; }

  const largo = Math.max(distFila, distCol) + 1;
  let leida = '';
  const celdas = [];
  let f = inicio.fila, c = inicio.col;
  for(let i = 0; i < largo; i++){
    leida += sopaPuzzle.grid[f][c];
    celdas.push([f, c]);
    f += df; c += dc;
  }
  const invertida = leida.split('').reverse().join('');
  const palabra = sopaPuzzle.palabras.find(p => !sopaEncontradas.has(p) && (p === leida || p === invertida));

  if(palabra){
    sopaEncontradas.add(palabra);
    sopaCeldasEncontradas[palabra] = celdas;
    ganarMonedas(SOPA_PREMIO_PALABRA);
    reproducirTono('correcto');
    if(sopaEncontradas.size === sopaPuzzle.palabras.length){
      const premio = SOPA_PREMIO_COMPLETAR[sopaNivel];
      setTimeout(() => {
        ganarMonedas(premio);
        reproducirTono('bonus');
        mostrarToast(`¡Sopa completa! +${premio} monedas`, 'gain');
        renderSopa();
      }, 350);
    }
  }
  renderSopa();
}

function sopaCeldaHTML(fila, col, tamano){
  const letra = sopaPuzzle.grid[fila][col];
  const clave = sopaClaveCelda(fila, col);
  const encontrada = sopaCeldasEncontradasSet().has(clave);
  const seleccionada = sopaInicio && sopaInicio.fila === fila && sopaInicio.col === col;
  const clases = ['sopa-celda'];
  if(encontrada) clases.push('sopa-celda-encontrada');
  if(seleccionada) clases.push('sopa-celda-seleccionada');
  return `<button class="${clases.join(' ')}" style="width:${tamano}px;height:${tamano}px;font-size:${Math.round(tamano*0.42)}px;" onclick="sopaTocarCelda(${fila},${col})">${letra}</button>`;
}

function renderSopaNiveles(){
  const cont = document.getElementById('sopa-content');
  cont.innerHTML = `
    <div class="hero" style="margin-top:8px;">
      <h2>🔎 Sopa de letras</h2>
      <p>Destinos y cosas del micro y del viaje, escondidos en la grilla. Tocá la primera letra y después la última para marcar una palabra.</p>
    </div>
    <div class="section-label">Elegí un nivel</div>
    ${Object.keys(SOPA_NOMBRE_NIVEL).map(n => `<button class="btn-primary" style="margin-bottom:10px;" onclick="sopaElegirNivel('${n}')">${SOPA_NOMBRE_NIVEL[n]}</button>`).join('')}`;
}

function renderSopaJuego(){
  const cont = document.getElementById('sopa-content');
  const tamano = sopaPuzzle.size <= 8 ? 36 : 27;
  const filasHTML = sopaPuzzle.grid.map((_, fila) =>
    `<div class="sopa-fila">${sopaPuzzle.grid[fila].split('').map((_, col) => sopaCeldaHTML(fila, col, tamano)).join('')}</div>`
  ).join('');

  const listaHTML = sopaPuzzle.palabras.map(p =>
    `<span class="sopa-palabra ${sopaEncontradas.has(p) ? 'sopa-palabra-encontrada' : ''}">${p}</span>`
  ).join('');

  const completo = sopaEncontradas.size === sopaPuzzle.palabras.length;

  cont.innerHTML = `
    <div class="hero" style="margin-top:8px;">
      <h2>${completo ? '¡Completaste la sopa!' : `Nivel ${SOPA_NOMBRE_NIVEL[sopaNivel]}`}</h2>
      <p>${completo ? 'Encontraste las ' + sopaPuzzle.palabras.length + ' palabras.' : `Encontradas ${sopaEncontradas.size} de ${sopaPuzzle.palabras.length}`}</p>
    </div>
    <div class="sopa-grilla">${filasHTML}</div>
    <div class="sopa-lista-palabras">${listaHTML}</div>
    ${completo ? `<button class="btn-primary" onclick="sopaOtroPuzzle()">Jugar otra sopa</button>` : ''}
    <p class="link-chico" onclick="sopaVolverANiveles()">‹ Cambiar de nivel</p>`;
}

function renderSopa(){
  const cont = document.getElementById('sopa-content');
  if(!cont) return;
  document.getElementById('sopa-sub').textContent = sopaNivel ? `Nivel ${SOPA_NOMBRE_NIVEL[sopaNivel]}` : 'Elegí un nivel';
  if(sopaNivel && sopaPuzzle) renderSopaJuego();
  else renderSopaNiveles();
}
