let cuentoActual = null;
let cuentoReproduciendo = false;

const CUENTOS = [
  {
    titulo: 'El Familiar',
    duracion: '8 min',
    resumen: 'Una leyenda del norte argentino: en los viejos ingenios azucareros se decía que una criatura enorme y oculta rondaba los cañaverales, y que el dueño del ingenio le entregaba un peón cada zafra a cambio de que la cosecha rindiera.',
    texto: 'Cuentan los peones más viejos que, en las noches sin luna, se escuchaba un arrastre pesado entre las cañas, como de cadenas. El animal —nadie decía bien qué era, si perro, si víbora, si las dos cosas— vivía en un pozo bajo el galpón principal. El ingenio que tenía Familiar nunca sufría sequía ni plaga, pero cada tanto faltaba un trabajador y nadie preguntaba demasiado. Con los años la leyenda se usó también para explicar lo injusto: cuando algo no cerraba, cuando alguien desaparecía sin razón clara, la gente del interior decía simplemente "se lo llevó el Familiar".'
  },
  {
    titulo: 'La Telesita',
    duracion: '7 min',
    resumen: 'De Santiago del Estero: la historia de una joven que amaba bailar la chacarera y que, según la tradición, murió bailando junto al fuego. Desde entonces se la invoca para que los pies no fallen en una fiesta.',
    texto: 'Se dice que Telesita era una muchacha pobre, casi una niña, que no tenía otra alegría que el baile. Iba de fogón en fogón siguiendo la música hasta que una noche, girando demasiado cerca de las brasas, el vestido se le prendió fuego y murió bailando, sin dejar de sonreír. Desde entonces, antes de una fiesta grande, algunos paisanos le dejan una vela o le piden en voz baja que los acompañe: "Telesita, no me dejes plantado en la mitad del baile". Se volvió una santa del monte, no de la iglesia, patrona de los que bailan chacarera hasta el amanecer.'
  },
  {
    titulo: 'El Pombero',
    duracion: '9 min',
    resumen: 'Leyenda guaraní del monte correntino y misionero: un espíritu bajito y peludo que protege a los pájaros y castiga a los cazadores abusivos, y que se ofende si no le dejan miel o tabaco de regalo.',
    texto: 'El Pombero camina descalzo y silba distinto a cualquier pájaro conocido; los que saben del monte dicen que si escuchás un silbido raro al atardecer, mejor no contestar. Cuida el monte y a sus animales: al cazador que mata de más, sin necesidad, el Pombero le hace perder el rumbo durante horas, o le espanta la caza el resto de la temporada. Pero es manso con quien lo respeta. Las familias del litoral todavía dejan, en el fondo del patio, un platito con miel o un cigarro de chala como ofrenda, para que el Pombero cuide la casa en vez de hacer travesuras.'
  },
  {
    titulo: 'La Luz Mala',
    duracion: '6 min',
    resumen: 'Del campo pampeano: una luz amarillenta y flotante que aparece de noche en los pastizales, y de la que los paisanos aprendieron a alejarse sin correr, para no atraerla.',
    texto: 'Los reseros contaban que, cruzando el campo de madrugada, a veces se veía una lucecita bailando sobre el pasto, sin farol ni jinete que la sostuviera. La explicación de los abuelos era que se trataba de un alma que no había recibido sepultura cristiana y erraba buscando descanso. La regla del campo era simple: no correr, no gritar, no darle la espalda de golpe. Se caminaba despacio hacia el rancho más cercano, hablando bajito, hasta perderla de vista. Hoy se sabe que muchas veces era gas de los huesos en descomposición, pero en las noches de campo abierto, la explicación científica nunca alcanzó para bajar el miedo.'
  }
];

function iniciarCuento(){
  const dia = new Date().getDate();
  cuentoActual = CUENTOS[dia % CUENTOS.length];
  cuentoReproduciendo = false;
  renderCuento();
}

function toggleReproduccionCuento(){
  cuentoReproduciendo = !cuentoReproduciendo;
  renderCuento();
}

function renderCuento(){
  const container = document.getElementById('cuento-content');
  if(!container || !cuentoActual) return;
  container.innerHTML = `
    <div class="cuento-player">
      <div class="icon">${icono('auriculares', 24)}</div>
      <div class="txt"><h3>${cuentoActual.titulo}</h3><p>${cuentoActual.duracion} · leyenda argentina</p></div>
      <button class="btn-play" onclick="toggleReproduccionCuento()">${cuentoReproduciendo ? '❚❚' : '▶'}</button>
    </div>
    <div class="cuento-barra ${cuentoReproduciendo ? 'sonando' : ''}"><div class="cuento-barra-fill"></div></div>
    <div class="section-label">Sinopsis</div>
    <p class="cuento-texto">${cuentoActual.resumen}</p>
    <div class="section-label">Para seguir leyendo</div>
    <p class="cuento-texto">${cuentoActual.texto}</p>`;
}
