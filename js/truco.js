let truco = null;

const PALOS_TRUCO = ['espada', 'basto', 'oro', 'copa'];
const NUMEROS_TRUCO = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

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

function trucoNuevaMano(){
  const mazo = barajar(crearMazoTruco());
  const jugadoresPrevios = truco ? truco.jugadores : ['Jugador 1', 'Jugador 2'];
  const manosJugadasPrevias = truco ? truco.manosJugadas : 0;
  const liderAnterior = truco ? truco.liderInicial : undefined;
  const liderInicial = liderAnterior === undefined ? 0 : 1 - liderAnterior;

  truco = {
    jugadores: jugadoresPrevios,
    cartasEnMano: [mazo.slice(0, 3), mazo.slice(3, 6)],
    cartasJugadas: [[], []],
    cartasBazaActual: [null, null],
    resultadosBazas: [],
    bazaActual: 0,
    liderInicial,
    liderBaza: liderInicial,
    turno: liderInicial,
    fase: 'pase-jugar',
    ganadorMano: null,
    manosJugadas: manosJugadasPrevias + 1,
  };
  renderTruco();
}

function trucoJugarCarta(indiceCarta){
  const jugador = truco.turno;
  const carta = truco.cartasEnMano[jugador][indiceCarta];
  truco.cartasEnMano[jugador].splice(indiceCarta, 1);
  truco.cartasJugadas[jugador].push(carta);
  truco.cartasBazaActual[jugador] = carta;

  const otro = 1 - jugador;
  if(truco.cartasBazaActual[otro] === null){
    truco.turno = otro;
    truco.fase = 'pase-jugar';
  } else {
    trucoResolverBaza();
  }
  renderTruco();
}

function trucoResolverBaza(){
  const [c0, c1] = truco.cartasBazaActual;
  const p0 = poderCarta(c0);
  const p1 = poderCarta(c1);
  const resultado = p0 > p1 ? 0 : (p1 > p0 ? 1 : 'parda');
  truco.resultadosBazas.push(resultado);

  const ganador = evaluarGanadorMano(truco.resultadosBazas, truco.liderInicial);
  if(ganador !== null){
    truco.ganadorMano = ganador;
    truco.fase = 'fin-mano';
    return;
  }

  truco.bazaActual++;
  truco.cartasBazaActual = [null, null];
  truco.liderBaza = resultado === 'parda' ? truco.liderBaza : resultado;
  truco.turno = truco.liderBaza;
  truco.fase = 'pase-jugar';
}

function iniciarTruco(){
  if(!truco){
    trucoNuevaMano();
  } else {
    renderTruco();
  }
}

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

function trucoMesaHTML(){
  const [c0, c1] = truco.cartasBazaActual;
  return `
    <div class="section-label">Baza ${truco.bazaActual + 1} de 3</div>
    <div class="truco-mesa">
      <div class="truco-mesa-slot">
        <div class="truco-mesa-nombre">${truco.jugadores[0]}</div>
        ${c0 ? cartaHTML(c0) : cartaDorsoHTML()}
      </div>
      <div class="truco-mesa-slot">
        <div class="truco-mesa-nombre">${truco.jugadores[1]}</div>
        ${c1 ? cartaHTML(c1) : cartaDorsoHTML()}
      </div>
    </div>`;
}

function renderTruco(){
  const container = document.getElementById('truco-content');
  if(!container || !truco) return;

  if(truco.fase === 'pase-jugar'){
    const nombre = truco.jugadores[truco.turno];
    container.innerHTML = `
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
      ${trucoMesaHTML()}
      <div class="section-label">Tus cartas, ${truco.jugadores[jugador]}</div>
      <div class="truco-mano">
        ${cartas.map((c, i) => `<div onclick="trucoJugarCarta(${i})">${cartaHTML(c)}</div>`).join('')}
      </div>`;
    return;
  }

  if(truco.fase === 'fin-mano'){
    const ganador = truco.jugadores[truco.ganadorMano];
    container.innerHTML = `
      ${trucoMesaHTML()}
      <div class="hero" style="margin-top:8px;">
        <h2>Ganó ${ganador}</h2>
        <p>${truco.resultadosBazas.length} de 3 bazas jugadas esta mano.</p>
      </div>
      <button class="btn-primary" onclick="trucoNuevaMano()">Jugar otra mano</button>`;
    return;
  }
}

function trucoRevelarTurno(){
  truco.fase = 'jugando';
  renderTruco();
}
