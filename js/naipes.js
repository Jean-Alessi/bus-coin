// Dibujo de cartas españolas en SVG propio (no son imágenes de un mazo real,
// para no reproducir el diseño de una editorial con derechos).

const PALO_COLOR = { oro: 'var(--orange)', copa: 'var(--orange)', espada: 'var(--navy)', basto: 'var(--navy)' };
const PALO_NOMBRE = { oro: 'ORO', copa: 'COPA', espada: 'ESPADA', basto: 'BASTO' };
const FIGURA_NOMBRE = { 10: 'SOTA', 11: 'CABALLO', 12: 'REY' };

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

// Figuras (Sota/Caballo/Rey): ilustración simple y propia, no calcada de ningún mazo comercial.
function figuraSVG(numero, palo, color){
  const cabeza = `<circle cx="50" cy="44" r="10" fill="${color}"/>`;
  const cuerpo = `<polygon points="33,58 67,58 60,104 40,104" fill="${color}"/>`;
  const pip = `<g transform="translate(50 76) scale(1.15) translate(-8,-13)">${pipSVG(palo, '#fff')}</g>`;

  if(numero === 10){ // Sota: gorro simple
    const gorro = `<rect x="38" y="30" width="24" height="7" rx="2.5" fill="${color}"/>`;
    return `${cuerpo}${gorro}${cabeza}${pip}`;
  }
  if(numero === 11){ // Caballo: cabeza de caballo por encima de la figura
    const caballo = `<path d="M38 40 Q34 26 47 22 Q60 19 63 29 Q65 36 57 38 L61 46 L49 43 Q40 45 37 52 Z" fill="${color}"/>
      <circle cx="55" cy="29" r="1.6" fill="#fff"/>`;
    return `${cuerpo}${caballo}${pip}`;
  }
  // Rey: corona simple
  const corona = `<polygon points="37,32 41,20 46,29 50,18 54,29 59,20 63,32" fill="${color}"/>`;
  return `${cuerpo}${corona}${cabeza}${pip}`;
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
    ? `<text x="50" y="122" font-size="9" font-weight="700" fill="${color}" font-family="Poppins, sans-serif" text-anchor="middle" letter-spacing="1">${FIGURA_NOMBRE[numero]}</text>`
    : '';
  return `<svg viewBox="0 0 100 140" width="100%" height="100%">
    <rect x="1.5" y="1.5" width="97" height="137" rx="9" fill="#fff" stroke="#ECE9E1" stroke-width="1.5"/>
    ${indiceEsquinaSVG(numero, palo, color)}
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
