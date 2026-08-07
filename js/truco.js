let truco = null;

const PALOS_TRUCO = ['espada', 'basto', 'oro', 'copa'];
const NUMEROS_TRUCO = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
const PUNTOS_PARTIDA = 15;
const COSTO_APUESTA_FICHAS = 10;

const TRUCO_NOMBRES = { 0: 'Truco', 1: 'Retruco', 2: 'Vale cuatro' };
const TRUCO_VALORES = { 1: 2, 2: 3, 3: 4 };
const TRUCO_VALOR_NO_QUIERO = { 1: 1, 2: 2, 3: 3 };

const ENVIDO_NIVELES = ['envido', 'real-envido', 'falta-envido'];
const ENVIDO_NOMBRES = { envido: 'Envido', 'real-envido': 'Real envido', 'falta-envido': 'Falta envido' };
const ENVIDO_INCREMENTOS = { envido: 2, 'real-envido': 3, 'falta-envido': 'falta' };

function crearMazoTruco(){
  const mazo = [];
  PALOS_TRUCO.forEach(palo => {
    NUMEROS_TRUCO.forEach(numero => {
      mazo.push({ numero, palo });
    });
  });
  return mazo;
}

// Jerarquía del truco: cuanto más alto el número devuelto, más fuerte la carta.
function poderCarta(carta){
  const { numero, palo } = carta;
  if(numero === 1 && palo === 'espada') return 14;
  if(numero === 1 && palo === 'basto') return 13;
  if(numero === 7 && palo === 'espada') return 12;
  if(numero === 7 && palo === 'oro') return 11;
  if(numero === 3) return 10;
  if(numero === 2) return 9;
  if(numero === 1) return 8;
  if(numero === 12) return 7;
  if(numero === 11) return 6;
  if(numero === 10) return 5;
  if(numero === 7) return 4;
  if(numero === 6) return 3;
  if(numero === 5) return 2;
  return 1;
}

// Valor de envido de una carta: figuras (10/11/12) valen 0, el resto su número.
function calcularPuntosEnvido(cartas){
  const porPalo = {};
  cartas.forEach(c => {
    const valor = c.numero >= 10 ? 0 : c.numero;
    (porPalo[c.palo] = porPalo[c.palo] || []).push(valor);
  });
  let mejor = 0;
  Object.values(porPalo).forEach(valores => {
    if(valores.length >= 2){
      valores.sort((a, b) => b - a);
      mejor = Math.max(mejor, 20 + valores[0] + valores[1]);
    }
  });
  if(mejor === 0){
    mejor = Math.max(...cartas.map(c => c.numero >= 10 ? 0 : c.numero));
  }
  return mejor;
}

// En equipos de 2, el envido del equipo es el mejor de sus dos integrantes.
function calcularPuntosEnvidoEquipo(equipo){
  const jugadoresDelEquipo = truco.equipoDe
    .map((eq, i) => (eq === equipo ? i : null))
    .filter(i => i !== null);
  return Math.max(...jugadoresDelEquipo.map(i => calcularPuntosEnvido(truco.cartasOriginales[i])));
}

function trucoNombreEquipo(equipo){
  return truco.jugadores.filter((_, i) => truco.equipoDe[i] === equipo).join(' y ');
}

function evaluarGanadorMano(resultadosBazas, liderInicial){
  const conteo = { 0: 0, 1: 0 };
  resultadosBazas.forEach(r => { if(r !== 'parda') conteo[r]++; });
  if(conteo[0] >= 2) return 0;
  if(conteo[1] >= 2) return 1;
  if(resultadosBazas.length >= 2){
    if(resultadosBazas[0] === 'parda' && resultadosBazas[1] !== 'parda') return resultadosBazas[1];
    if(resultadosBazas[0] !== 'parda' && resultadosBazas[1] === 'parda') return resultadosBazas[0];
  }
  if(resultadosBazas.length === 3){
    if(resultadosBazas[2] !== 'parda') return resultadosBazas[2];
    return liderInicial;
  }
  return null;
}

// modo: 'dos' (2 jugadores, cada uno su propio equipo) o 'equipos' (4 jugadores, 2 parejas alternadas en la mesa).
function trucoConfigurarPartida(modo){
  const numJugadores = modo === 'equipos' ? 4 : 2;
  const jugadores = numJugadores === 4
    ? ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4']
    : ['Jugador 1', 'Jugador 2'];
  const equipoDe = numJugadores === 4 ? [0, 1, 0, 1] : [0, 1];
  truco = {
    modo,
    numJugadores,
    jugadores,
    equipoDe,
    puntosPartida: [0, 0],
    liderInicial: undefined,
    manosJugadas: 0,
  };
  trucoNuevaMano();
}

function trucoNuevaMano(){
  const numJugadores = truco.numJugadores;
  const mazo = barajar(crearMazoTruco());
  const liderAnterior = truco.liderInicial;
  const liderInicial = liderAnterior === undefined ? 0 : (liderAnterior + 1) % numJugadores;

  const cartasEnMano = [];
  for(let i = 0; i < numJugadores; i++){
    cartasEnMano.push(mazo.slice(i * 3, i * 3 + 3));
  }

  truco = {
    modo: truco.modo,
    numJugadores,
    jugadores: truco.jugadores,
    equipoDe: truco.equipoDe,
    puntosPartida: truco.puntosPartida,
    partidaTerminada: false,
    cartasOriginales: cartasEnMano.map(m => m.slice()),
    cartasEnMano,
    cartasJugadas: cartasEnMano.map(() => []),
    cartasBazaActual: new Array(numJugadores).fill(null),
    resultadosBazas: [],
    bazaActual: 0,
    liderInicial,
    liderBaza: liderInicial,
    turno: liderInicial,
    fase: 'elegir-apuesta',
    ganadorMano: null,
    motivoFinMano: null,
    trucoEstado: { nivelAceptado: 0, valorActual: 1 },
    envido: { estado: 'nada' },
    pendiente: null,
    envidoResultado: null,
    apuestaFichas: 0,
    manosJugadas: truco.manosJugadas + 1,
  };
  renderTruco();
}

function trucoNuevaPartida(){
  truco = {
    modo: truco.modo,
    numJugadores: truco.numJugadores,
    jugadores: truco.jugadores,
    equipoDe: truco.equipoDe,
    puntosPartida: [0, 0],
    liderInicial: undefined,
    manosJugadas: 0,
  };
  trucoNuevaMano();
}

function trucoVerificarFinPartida(){
  if(truco.puntosPartida[0] >= PUNTOS_PARTIDA || truco.puntosPartida[1] >= PUNTOS_PARTIDA){
    truco.partidaTerminada = true;
  }
}

// El equipo 0 (siempre Jugador 1 y su compañero) es el dueño de las fichas de este celular.
function trucoApostarFichas(){
  if(fichas < COSTO_APUESTA_FICHAS) return;
  fichas -= COSTO_APUESTA_FICHAS;
  actualizarFichasEnPantalla();
  truco.apuestaFichas = COSTO_APUESTA_FICHAS;
  truco.fase = 'pase-jugar';
  renderTruco();
}

function trucoOmitirApuesta(){
  truco.apuestaFichas = 0;
  truco.fase = 'pase-jugar';
  renderTruco();
}

function trucoLiquidarApuestaFichas(){
  if(!truco.apuestaFichas) return;
  if(truco.ganadorMano === 0){
    fichas += truco.apuestaFichas * 2;
    mostrarToast(`¡Ganaste ${truco.apuestaFichas} fichas apostadas!`);
  } else {
    mostrarToast(`Perdiste las ${truco.apuestaFichas} fichas apostadas`);
  }
  actualizarFichasEnPantalla();
  truco.apuestaFichas = 0;
}

function actualizarFichasEnPantalla(){
  const el = document.getElementById('fichas-count');
  if(el) el.textContent = fichas;
}

function trucoJugarCarta(indiceCarta){
  const jugador = truco.turno;
  const carta = truco.cartasEnMano[jugador][indiceCarta];
  truco.cartasEnMano[jugador].splice(indiceCarta, 1);
  truco.cartasJugadas[jugador].push(carta);
  truco.cartasBazaActual[jugador] = carta;

  const todosJugaron = truco.cartasBazaActual.every(c => c !== null);
  if(todosJugaron){
    trucoResolverBaza();
  } else {
    truco.turno = (jugador + 1) % truco.numJugadores;
    truco.fase = 'pase-jugar';
  }
  renderTruco();
}

function trucoResolverBaza(){
  const jugadas = truco.cartasBazaActual
    .map((c, i) => (c ? { jugador: i, poder: poderCarta(c) } : null))
    .filter(Boolean);
  const maxPoder = Math.max(...jugadas.map(j => j.poder));
  const mejores = jugadas.filter(j => j.poder === maxPoder);
  const equiposMejores = [...new Set(mejores.map(j => truco.equipoDe[j.jugador]))];

  let resultado, jugadorGanadorBaza;
  if(equiposMejores.length > 1){
    resultado = 'parda';
    jugadorGanadorBaza = null;
  } else {
    resultado = equiposMejores[0];
    jugadorGanadorBaza = mejores.find(j => truco.equipoDe[j.jugador] === resultado).jugador;
  }
  truco.resultadosBazas.push(resultado);

  const ganador = evaluarGanadorMano(truco.resultadosBazas, truco.equipoDe[truco.liderInicial]);
  if(ganador !== null){
    truco.ganadorMano = ganador;
    truco.puntosPartida[ganador] += truco.trucoEstado.valorActual;
    truco.motivoFinMano = { texto: 'Ganó las bazas de la mano', puntos: truco.trucoEstado.valorActual };
    truco.fase = 'fin-mano';
    trucoLiquidarApuestaFichas();
    trucoVerificarFinPartida();
    return;
  }

  truco.bazaActual++;
  truco.cartasBazaActual = new Array(truco.numJugadores).fill(null);
  if(resultado !== 'parda'){
    truco.liderBaza = jugadorGanadorBaza;
  }
  truco.turno = truco.liderBaza;
  truco.fase = 'pase-jugar';
}

// ---- Apuestas: Truco / Retruco / Vale cuatro ----

function trucoCantarTruco(){
  const proximoNivel = truco.trucoEstado.nivelAceptado + 1;
  if(proximoNivel > 3) return;
  truco.pendiente = { tipo: 'truco', nivel: proximoNivel, cantadoPor: truco.turno, respondePor: (truco.turno + 1) % truco.numJugadores };
  truco.fase = 'pase-respuesta';
  renderTruco();
}

function trucoSubirTruco(){
  const p = truco.pendiente;
  truco.pendiente = { tipo: 'truco', nivel: p.nivel + 1, cantadoPor: p.respondePor, respondePor: p.cantadoPor };
  truco.fase = 'pase-respuesta';
  renderTruco();
}

function trucoResponderTruco(quiero){
  const p = truco.pendiente;
  if(quiero){
    truco.trucoEstado = { nivelAceptado: p.nivel, valorActual: TRUCO_VALORES[p.nivel] };
    truco.pendiente = null;
    truco.fase = 'pase-jugar';
    renderTruco();
    return;
  }
  const puntos = TRUCO_VALOR_NO_QUIERO[p.nivel];
  truco.puntosPartida[truco.equipoDe[p.cantadoPor]] += puntos;
  truco.ganadorMano = truco.equipoDe[p.cantadoPor];
  truco.motivoFinMano = { texto: `${truco.jugadores[p.respondePor]} no quiso el ${TRUCO_NOMBRES[p.nivel - 1]}`, puntos };
  truco.pendiente = null;
  truco.fase = 'fin-mano';
  trucoLiquidarApuestaFichas();
  trucoVerificarFinPartida();
  renderTruco();
}

// ---- Apuestas: Envido / Real envido / Falta envido ----

function trucoCantarEnvido(nivel){
  truco.envido.estado = 'en-curso';
  truco.pendiente = { tipo: 'envido', nivel, cantadoPor: truco.turno, respondePor: (truco.turno + 1) % truco.numJugadores, acumuladoPrevio: 0 };
  truco.fase = 'pase-respuesta';
  renderTruco();
}

function trucoSubirEnvido(nuevoNivel){
  const p = truco.pendiente;
  const incrementoActual = ENVIDO_INCREMENTOS[p.nivel];
  const nuevoAcumulado = p.acumuladoPrevio + incrementoActual;
  truco.pendiente = { tipo: 'envido', nivel: nuevoNivel, cantadoPor: p.respondePor, respondePor: p.cantadoPor, acumuladoPrevio: nuevoAcumulado };
  truco.fase = 'pase-respuesta';
  renderTruco();
}

function trucoResponderEnvido(quiero){
  const p = truco.pendiente;
  if(quiero){
    const incremento = ENVIDO_INCREMENTOS[p.nivel];
    const p0 = calcularPuntosEnvidoEquipo(0);
    const p1 = calcularPuntosEnvidoEquipo(1);
    const liderEquipo = truco.equipoDe[truco.liderInicial];
    const ganador = p0 === p1 ? liderEquipo : (p0 > p1 ? 0 : 1);
    const puntosGanados = incremento === 'falta'
      ? PUNTOS_PARTIDA - truco.puntosPartida[1 - ganador]
      : p.acumuladoPrevio + incremento;
    truco.puntosPartida[ganador] += puntosGanados;
    truco.envido = { estado: 'resuelto' };
    truco.envidoResultado = { ganador, puntosPropios: [p0, p1], puntosGanados };
    truco.pendiente = null;
    truco.fase = 'envido-resultado';
    trucoVerificarFinPartida();
    renderTruco();
    return;
  }
  const puntos = Math.max(p.acumuladoPrevio, 1);
  truco.puntosPartida[truco.equipoDe[p.cantadoPor]] += puntos;
  truco.envido = { estado: 'declinado' };
  truco.envidoResultado = { declinadoPor: p.respondePor, cantadoPor: p.cantadoPor, puntos };
  truco.pendiente = null;
  truco.fase = 'envido-resultado';
  trucoVerificarFinPartida();
  renderTruco();
}

function trucoResponder(quiero){
  if(truco.pendiente.tipo === 'truco') trucoResponderTruco(quiero);
  else trucoResponderEnvido(quiero);
}

function trucoRevelarRespuesta(){
  truco.fase = 'respondiendo';
  renderTruco();
}

function trucoContinuarTrasEnvido(){
  truco.fase = 'pase-jugar';
  renderTruco();
}

function iniciarTruco(modo){
  if(!truco){
    trucoConfigurarPartida(modo || 'dos');
  } else if(modo && modo !== truco.modo){
    trucoConfigurarPartida(modo);
  } else {
    renderTruco();
  }
}

// ---- Render ----

function cartaHTML(carta){
  const colorPalo = (carta.palo === 'oro' || carta.palo === 'copa') ? 'var(--orange)' : 'var(--navy)';
  return `<div class="carta-truco" style="color:${colorPalo}">
    <div class="carta-num">${carta.numero}</div>
    <div class="carta-palo">${icono(carta.palo, 18)}</div>
  </div>`;
}

function cartaDorsoHTML(){
  return `<div class="carta-truco carta-dorso"></div>`;
}

function trucoMarcadorHTML(){
  const apuestaTxt = truco.apuestaFichas
    ? `<div class="truco-apuesta-activa">${truco.apuestaFichas} fichas en juego esta mano</div>`
    : '';
  return `<div class="truco-marcador">
    <span>${trucoNombreEquipo(0)} ${truco.puntosPartida[0]}</span>
    <span class="truco-marcador-meta">a ${PUNTOS_PARTIDA}</span>
    <span>${truco.puntosPartida[1]} ${trucoNombreEquipo(1)}</span>
  </div>${apuestaTxt}`;
}

function trucoMesaHTML(){
  const slots = truco.cartasBazaActual.map((c, i) => `
      <div class="truco-mesa-slot">
        <div class="truco-mesa-nombre">${truco.jugadores[i]}</div>
        ${c ? cartaHTML(c) : cartaDorsoHTML()}
      </div>`).join('');
  return `
    <div class="section-label">Baza ${truco.bazaActual + 1} de 3</div>
    <div class="truco-mesa">${slots}</div>`;
}

function trucoApuestasRowHTML(){
  if(truco.ganadorMano !== null || truco.pendiente !== null) return '';
  const botones = [];
  if(truco.trucoEstado.nivelAceptado < 3){
    botones.push(`<button class="btn-apuesta" onclick="trucoCantarTruco()">${TRUCO_NOMBRES[truco.trucoEstado.nivelAceptado]}</button>`);
  }
  if(truco.envido.estado === 'nada' && truco.bazaActual === 0){
    ENVIDO_NIVELES.forEach(n => botones.push(`<button class="btn-apuesta secondary" onclick="trucoCantarEnvido('${n}')">${ENVIDO_NOMBRES[n]}</button>`));
  }
  return botones.length ? `<div class="apuestas-row">${botones.join('')}</div>` : '';
}

function renderTruco(){
  const container = document.getElementById('truco-content');
  if(!container || !truco) return;

  if(truco.fase === 'elegir-apuesta'){
    const alcanza = fichas >= COSTO_APUESTA_FICHAS;
    container.innerHTML = `
      ${trucoMarcadorHTML()}
      <div class="hero" style="margin-top:8px;">
        <h2>¿Apuestan fichas esta mano?</h2>
        <p>Tenés ${fichas} fichas. Si gana ${trucoNombreEquipo(0)}, duplican las ${COSTO_APUESTA_FICHAS} que arriesguen.</p>
      </div>
      <div class="apuestas-row">
        ${alcanza
          ? `<button class="btn-apuesta" onclick="trucoApostarFichas()">Apostar ${COSTO_APUESTA_FICHAS} fichas</button>`
          : `<button class="btn-apuesta" disabled style="opacity:.5;cursor:not-allowed;">No alcanzan las fichas</button>`}
        <button class="btn-apuesta secondary" onclick="trucoOmitirApuesta()">Jugar sin apostar</button>
      </div>`;
    return;
  }

  if(truco.fase === 'pase-jugar'){
    const nombre = truco.jugadores[truco.turno];
    container.innerHTML = `
      ${trucoMarcadorHTML()}
      ${trucoMesaHTML()}
      <div class="hero" style="margin-top:8px;">
        <h2>Pasale el celular a ${nombre}</h2>
        <p>Que nadie más mire la pantalla hasta que toque.</p>
      </div>
      <button class="btn-primary" onclick="trucoRevelarTurno()">Ver mis cartas</button>`;
    return;
  }

  if(truco.fase === 'jugando'){
    const jugador = truco.turno;
    const cartas = truco.cartasEnMano[jugador];
    container.innerHTML = `
      ${trucoMarcadorHTML()}
      ${trucoMesaHTML()}
      <div class="section-label">Tus cartas, ${truco.jugadores[jugador]}</div>
      <div class="truco-mano">
        ${cartas.map((c, i) => `<div onclick="trucoJugarCarta(${i})">${cartaHTML(c)}</div>`).join('')}
      </div>
      ${trucoApuestasRowHTML()}`;
    return;
  }

  if(truco.fase === 'pase-respuesta'){
    const nombre = truco.jugadores[truco.pendiente.respondePor];
    const tipoTexto = truco.pendiente.tipo === 'truco' ? TRUCO_NOMBRES[truco.pendiente.nivel - 1] : ENVIDO_NOMBRES[truco.pendiente.nivel];
    container.innerHTML = `
      ${trucoMarcadorHTML()}
      ${trucoMesaHTML()}
      <div class="hero" style="margin-top:8px;">
        <h2>Pasale el celular a ${nombre}</h2>
        <p>${truco.jugadores[truco.pendiente.cantadoPor]} cantó ${tipoTexto}.</p>
      </div>
      <button class="btn-primary" onclick="trucoRevelarRespuesta()">Ver la apuesta</button>`;
    return;
  }

  if(truco.fase === 'respondiendo'){
    const p = truco.pendiente;
    const tipoTexto = p.tipo === 'truco' ? TRUCO_NOMBRES[p.nivel - 1] : ENVIDO_NOMBRES[p.nivel];
    let botonesSubir = '';
    if(p.tipo === 'truco' && p.nivel < 3){
      botonesSubir = `<button class="btn-apuesta" onclick="trucoSubirTruco()">${TRUCO_NOMBRES[p.nivel]}</button>`;
    }
    if(p.tipo === 'envido'){
      const idxActual = ENVIDO_NIVELES.indexOf(p.nivel);
      botonesSubir = ENVIDO_NIVELES.slice(idxActual + 1)
        .map(n => `<button class="btn-apuesta" onclick="trucoSubirEnvido('${n}')">${ENVIDO_NOMBRES[n]}</button>`)
        .join('');
    }
    container.innerHTML = `
      ${trucoMarcadorHTML()}
      ${trucoMesaHTML()}
      <div class="hero" style="margin-top:8px;">
        <h2>${truco.jugadores[p.cantadoPor]} cantó ${tipoTexto}</h2>
        <p>¿Qué decís, ${truco.jugadores[p.respondePor]}?</p>
      </div>
      <div class="apuestas-row">
        <button class="btn-apuesta" onclick="trucoResponder(true)">Quiero</button>
        <button class="btn-apuesta secondary" onclick="trucoResponder(false)">No quiero</button>
        ${botonesSubir}
      </div>`;
    return;
  }

  if(truco.fase === 'envido-resultado'){
    const r = truco.envidoResultado;
    let texto;
    if(r.puntosPropios){
      const ganadorNombre = trucoNombreEquipo(r.ganador);
      texto = `<h2>Envido para ${ganadorNombre}</h2>
        <p>${trucoNombreEquipo(0)} tenía ${r.puntosPropios[0]}, ${trucoNombreEquipo(1)} tenía ${r.puntosPropios[1]}. +${r.puntosGanados} puntos.</p>`;
    } else {
      texto = `<h2>${truco.jugadores[r.cantadoPor]} gana el envido</h2>
        <p>${truco.jugadores[r.declinadoPor]} dijo no quiero. +${r.puntos} puntos.</p>`;
    }
    const boton = truco.partidaTerminada
      ? `<button class="btn-primary" onclick="trucoNuevaPartida()">Nueva partida</button>`
      : `<button class="btn-primary" onclick="trucoContinuarTrasEnvido()">Seguir jugando</button>`;
    container.innerHTML = `
      ${trucoMarcadorHTML()}
      ${trucoMesaHTML()}
      <div class="hero" style="margin-top:8px;">${texto}</div>
      ${boton}`;
    return;
  }

  if(truco.fase === 'fin-mano'){
    const ganador = trucoNombreEquipo(truco.ganadorMano);
    const boton = truco.partidaTerminada
      ? `<button class="btn-primary" onclick="trucoNuevaPartida()">Nueva partida</button>`
      : `<button class="btn-primary" onclick="trucoNuevaMano()">Jugar otra mano</button>`;
    const bannerPartida = truco.partidaTerminada ? `<p style="font-weight:700;">¡${ganador} ganó la partida!</p>` : '';
    container.innerHTML = `
      ${trucoMarcadorHTML()}
      ${trucoMesaHTML()}
      <div class="hero" style="margin-top:8px;">
        <h2>Ganó ${ganador}</h2>
        <p>${truco.motivoFinMano.texto} (+${truco.motivoFinMano.puntos} pts)</p>
        ${bannerPartida}
      </div>
      ${boton}`;
    return;
  }
}

function trucoRevelarTurno(){
  truco.fase = 'jugando';
  renderTruco();
}
