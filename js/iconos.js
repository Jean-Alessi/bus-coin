const ICONOS = {
  graduacion: '<path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="M6 10v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 8v6"/>',
  libro: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5c-.8 0-1.5-.7-1.5-1.5v-13Z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13Z"/>',
  casa: '<path d="M3 11 12 4l9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/>',
  corazon: '<path d="M12 20.5S3 14.8 3 8.9C3 5.9 5.3 4 7.8 4c1.6 0 3.1.8 4.2 2.3C13.1 4.8 14.6 4 16.2 4 18.7 4 21 5.9 21 8.9c0 5.9-9 11.6-9 11.6Z"/>',
  grupo: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15 6.5a3 3 0 1 1 0 6"/><path d="M15.5 14c2.5.3 4.5 2.5 4.5 6"/>',
  trivia: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 2Z"/>',
  musica: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  trofeo: '<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5a3 3 0 0 0 3 4"/><path d="M16 5h3a3 3 0 0 1-3 4"/><path d="M12 12v3"/><path d="M9 20h6"/><path d="M10 17h4v3h-4z"/>',
  auriculares: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  cartas: '<rect x="3.5" y="5" width="10" height="14" rx="1.5" transform="rotate(-8 8.5 12)"/><rect x="10.5" y="5" width="10" height="14" rx="1.5"/>',
  lupa: '<circle cx="10" cy="10" r="6"/><path d="m20 20-5.2-5.2"/>',
  chat: '<path d="M4 5h16v11H8l-4 4V5Z"/>',
  moneda: '<circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/>',
  espada: '<path d="M12 2v14"/><path d="M8 6h8"/><path d="M12 16l-2.5 5h5L12 16Z"/>',
  basto: '<path d="M12 3v18"/><path d="M8 7c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4Z"/>',
  oro: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/>',
  copa: '<path d="M6 4h12l-1 6a5 5 0 0 1-10 0L6 4Z"/><path d="M12 15v4"/><path d="M8 21h8"/>'
};

function icono(nombre, size){
  size = size || 20;
  const path = ICONOS[nombre] || ICONOS.trivia;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}
