// Dibujo de cartas españolas en SVG propio (no son imágenes de un mazo real,
// para no reproducir el diseño de una editorial con derechos).

const PALO_COLOR = { oro: 'var(--orange)', copa: 'var(--orange)', espada: 'var(--navy)', basto: 'var(--navy)' };
const PALO_NOMBRE = { oro: 'ORO', copa: 'COPA', espada: 'ESPADA', basto: 'BASTO' };
const FIGURA_NOMBRE = { 10: 'SOTA', 11: 'CABALLO', 12: 'REY' };
const CREMA = '#FBF6EA';

// Cada pip se dibuja en una caja local de 16x26 centrada en (8,13); se ubica
// en la carta con translate(x,y) + rotate + scale, así se puede repetir e
// invertir para imitar la simetría de las cartas reales.
function pipSVG(palo, color){
  if(palo === 'espada'){
    return `<rect x="6.5" y="1" width="3" height="16" rx="1.2" fill="${color}"/>
      <rect x="3" y="14.5" width="10" height="2.4" rx="1" fill="${color}"/>
      <circle cx="8" cy="21" r="2.3" fill="${color}"/>`;
  }
  if(palo === 'basto'){
    return `<rect x="5" y="1" width="6" height="20" rx="3" fill="${color}"/>
      <rect x="3.3" y="6.5" width="9.4" height="2" rx="1" fill="#fff" opacity=".35"/>
      <rect x="3.3" y="11.5" width="9.4" height="2" rx="1" fill="#fff" opacity=".35"/>`;
  }
  if(palo === 'oro'){
    return `<circle cx="8" cy="13" r="7" fill="${color}"/>
      <circle cx="8" cy="13" r="4.2" fill="none" stroke="#fff" stroke-width="1" opacity=".55"/>`;
  }
  return `<path d="M2 2 H14 L11.3 11.5 A3.5 3.5 0 0 1 4.7 11.5 Z" fill="${color}"/>
    <rect x="7" y="11" width="2" height="6.5" fill="${color}"/>
    <rect x="4" y="17.5" width="8" height="2" rx="1" fill="${color}"/>`;
}

function pipEnPosicionSVG(palo, color, x, y, rot, escala){
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${escala}) translate(-8,-13)">${pipSVG(palo, color)}</g>`;
}

const PIP_LAYOUTS = {
  1: [[50, 70, 0]],
  2: [[50, 38, 0], [50, 102, 180]],
  3: [[50, 32, 0], [50, 70, 0], [50, 108, 180]],
  4: [[34, 40, 0], [66, 40, 0], [34, 100, 180], [66, 100, 180]],
  5: [[34, 36, 0], [66, 36, 0], [50, 70, 0], [34, 104, 180], [66, 104, 180]],
  6: [[34, 30, 0], [66, 30, 0], [34, 70, 0], [66, 70, 0], [34, 110, 180], [66, 110, 180]],
  7: [[34, 26, 0], [66, 26, 0], [50, 48, 0], [34, 80, 0], [66, 80, 0], [34, 112, 180], [66, 112, 180]],
};
const PIP_ESCALA = { 1: 1.7, 2: 1.4, 3: 1.3, 4: 1.15, 5: 1.05, 6: 0.95, 7: 0.85 };

function pipsCartaSVG(numero, palo, color){
  const layout = PIP_LAYOUTS[numero] || [];
  const escala = PIP_ESCALA[numero] || 1;
  return layout.map(([x, y, rot]) => pipEnPosicionSVG(palo, color, x, y, rot, escala)).join('');
}

// Figuras (Sota/Caballo/Rey): ilustración propia por capas (capa, cuerpo,
// cuello, cabeza, cara, tocado) — no calcada de ningún mazo comercial.
function figuraSVG(numero, palo, color){
  const capa = `<path d="M27,64 Q30,92 34,113 L66,113 Q70,92 73,64 Q50,49 27,64 Z" fill="${color}" opacity=".16"/>`;
  const cuerpo = `<path d="M35,60 L65,60 L60,100 Q60,113 50,113 Q40,113 40,100 Z" fill="${color}"/>`;
  const cinturon = `<rect x="40" y="90" width="20" height="3" rx="1.4" fill="#fff" opacity=".3"/>`;
  const cuello = `<rect x="45" y="52" width="10" height="8" fill="${color}"/>`;
  const cabeza = `<circle cx="50" cy="45" r="9.5" fill="${color}"/>`;
  const ojos = `<circle cx="46.6" cy="44" r="1.1" fill="#fff"/><circle cx="53.4" cy="44" r="1.1" fill="#fff"/>`;
  const pip = `<g transform="translate(50 78) scale(1) translate(-8,-13)">${pipSVG(palo, '#fff')}</g>`;
  const base = `${capa}${cuerpo}${cinturon}${cuello}`;

  if(numero === 10){ // Sota: gorro con visera y pluma
    const sombrero = `<ellipse cx="50" cy="34" rx="14.5" ry="3.6" fill="${color}"/>
      <rect x="42.5" y="23" width="15" height="12" rx="3.5" fill="${color}"/>
      <path d="M57 25 Q68 19 65 9" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="65" cy="9" r="1.8" fill="${color}"/>`;
    const collar = `<path d="M43 55 Q50 60.5 57 55" stroke="#fff" stroke-width="1.6" fill="none" opacity=".45"/>`;
    return `${base}${sombrero}${cabeza}${ojos}${collar}${pip}`;
  }
  if(numero === 11){ // Caballo: cabeza de caballo asomando por detrás del jinete
    const caballo = `<path d="M35,44 Q28,27 43,20 Q59,14 66,27 Q70,38 59,42 L66,52 L50,47 Q39,49 35,58 Z" fill="${color}"/>
      <path d="M40,23 L36,18 M44,20 L41,15 M48,19 L46,14" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="57" cy="28" r="1.6" fill="#fff"/>
      <path d="M67 21 L79 8" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M79 8 L74 9.5 L77.5 13 Z" fill="${color}"/>`;
    return `${base}${caballo}${cabeza}${ojos}${pip}`;
  }
  // Rey: corona con joyas y bigote
  const corona = `<rect x="39" y="29" width="22" height="4.5" rx="1.5" fill="${color}"/>
    <polygon points="39,30 43,19 48,27 50,17 52,27 57,19 61,30" fill="${color}"/>
    <circle cx="43" cy="20.5" r="1.3" fill="#fff"/>
    <circle cx="50" cy="18.5" r="1.3" fill="#fff"/>
    <circle cx="57" cy="20.5" r="1.3" fill="#fff"/>`;
  const bigote = `<path d="M45.5 48.5 Q50 51.5 54.5 48.5" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".8"/>`;
  return `${base}${corona}${cabeza}${ojos}${bigote}${pip}`;
}

function indiceEsquinaSVG(numero, palo, color){
  const etiqueta = FIGURA_NOMBRE[numero] || numero;
  return `<g transform="translate(9 12)">
    <text x="0" y="0" font-size="13" font-weight="700" fill="${color}" font-family="Poppins, sans-serif" text-anchor="middle">${etiqueta}</text>
    <g transform="translate(-8 6) scale(0.55)">${pipSVG(palo, color)}</g>
  </g>`;
}

function naipeCaraSVG(carta){
  const { numero, palo } = carta;
  const color = PALO_COLOR[palo];
  const esFigura = numero >= 10;
  const dibujo = esFigura ? figuraSVG(numero, palo, color) : pipsCartaSVG(numero, palo, color);
  const etiquetaFigura = esFigura
    ? `<text x="50" y="124" font-size="9" font-weight="700" fill="${color}" font-family="Poppins, sans-serif" text-anchor="middle" letter-spacing="1">${FIGURA_NOMBRE[numero]}</text>`
    : '';
  const indice = indiceEsquinaSVG(numero, palo, color);
  return `<svg viewBox="0 0 100 140" width="100%" height="100%">
    <rect x="1.5" y="1.5" width="97" height="137" rx="9" fill="${CREMA}" stroke="var(--navy)" stroke-width="1.5"/>
    <rect x="5.5" y="5.5" width="89" height="129" rx="6" fill="none" stroke="${color}" stroke-width="0.8" opacity=".4"/>
    ${indice}
    <g transform="rotate(180 50 70)">${indice}</g>
    <g transform="translate(0 4)">${dibujo}</g>
    ${etiquetaFigura}
  </svg>`;
}

function naipeDorsoSVG(){
  return `<svg viewBox="0 0 100 140" width="100%" height="100%">
    <rect x="1.5" y="1.5" width="97" height="137" rx="9" fill="var(--navy)" stroke="var(--navy-light)" stroke-width="1.5"/>
    <rect x="10" y="10" width="80" height="120" rx="6" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".35"/>
    <circle cx="50" cy="70" r="18" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".35"/>
    <circle cx="50" cy="70" r="7" fill="#ffffff" opacity=".25"/>
  </svg>`;
}
