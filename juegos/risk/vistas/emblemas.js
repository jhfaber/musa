// Emblema de cada equipo (spec 007): escudo dibujado en SVG con el color del equipo, o un emoji en un medallón.
// El estilo lo fija risk.js en cada pintado con usarEstilo(aj.emblema). Sin imágenes externas.
import { colorDe, BANDO_POR_DEFECTO } from '../logica/reglas.js';

let estilo = 'escudo';
let siguienteId = 0;
export const usarEstilo = e => { estilo = e; };

// Cada dibujo va en un escudo de 64×72 (centro ≈ 32,36). "c" = color claro del dibujo, "h" = hueco (color del escudo)
const ICONOS = {
  guerreros: `
    <g transform="rotate(45 32 36)"><path d="M30 14 L32 9 L34 14 V40 H30 Z" fill="c"/><rect x="25" y="40" width="14" height="3.5" rx="1.5" fill="c"/><rect x="30.5" y="43" width="3" height="8" fill="c"/><circle cx="32" cy="53" r="2.6" fill="c"/></g>
    <g transform="rotate(-45 32 36)"><path d="M30 14 L32 9 L34 14 V40 H30 Z" fill="c"/><rect x="25" y="40" width="14" height="3.5" rx="1.5" fill="c"/><rect x="30.5" y="43" width="3" height="8" fill="c"/><circle cx="32" cy="53" r="2.6" fill="c"/></g>`,
  orcos: `
    <path d="M20 27 L8 21 L19 36 Z M44 27 L56 21 L45 36 Z" fill="c"/>
    <path d="M20 24 Q32 12 44 24 L46 40 Q32 56 18 40 Z" fill="c"/>
    <path d="M22 31 L30 33.5 L22 36 Z M42 31 L34 33.5 L42 36 Z" fill="h"/>
    <path d="M24 43 Q32 48 40 43 L39 46 Q32 51 25 46 Z" fill="h"/>
    <path d="M26 46 L24.5 37 L29.5 44 Z M38 46 L39.5 37 L34.5 44 Z" fill="c" stroke="h" stroke-width="1.2" stroke-linejoin="round"/>`,
  arqueros: `
    <path d="M22 13 Q48 36 22 59" fill="none" stroke="c" stroke-width="4" stroke-linecap="round"/>
    <path d="M22 13 L22 59" stroke="c" stroke-width="1.2"/>
    <path d="M14 36 H47" stroke="c" stroke-width="2.6"/>
    <path d="M46 30 L56 36 L46 42 Z" fill="c"/>
    <path d="M18 36 L12 30 M18 36 L12 42 M22 36 L16 30 M22 36 L16 42" stroke="c" stroke-width="2" stroke-linecap="round"/>`,
  enanos: `
    <rect x="30" y="11" width="4" height="48" rx="1.5" fill="c"/>
    <path d="M34 17 Q50 12 52 26 Q50 39 34 33 Z M30 17 Q14 12 12 26 Q14 39 30 33 Z" fill="c"/>
    <path d="M36 21 Q46 19 47 26 Q46 32 36 29 Z M28 21 Q18 19 17 26 Q18 32 28 29 Z" fill="h" opacity=".35"/>
    <circle cx="32" cy="10" r="3" fill="c"/>`,
  magos: `
    <path d="M35 9 Q31 30 19 47 H45 Q38 32 35 9 Z" fill="c"/>
    <ellipse cx="32" cy="48" rx="19" ry="4.5" fill="c"/>
    <path d="M31 30 L32.8 34 L37 34.3 L33.8 37 L34.8 41.2 L31 39 L27.2 41.2 L28.2 37 L25 34.3 L29.2 34 Z" fill="h"/>
    <circle cx="44" cy="17" r="1.8" fill="c"/><circle cx="20" cy="22" r="1.3" fill="c"/>`,
  jinetes: `
    <path d="M20 57 V35 A12 12 0 0 1 44 35 V57" fill="none" stroke="c" stroke-width="8"/>
    <path d="M14 57 H26 M38 57 H50" stroke="c" stroke-width="4" stroke-linecap="round"/>
    <circle cx="20" cy="38" r="1.5" fill="h"/><circle cx="20" cy="47" r="1.5" fill="h"/><circle cx="44" cy="38" r="1.5" fill="h"/><circle cx="44" cy="47" r="1.5" fill="h"/>
    <circle cx="25" cy="27" r="1.5" fill="h"/><circle cx="39" cy="27" r="1.5" fill="h"/>`,
  trolls: `
    <g transform="rotate(28 32 36)">
      <path d="M29.5 60 L29.5 36 Q23 24 32 11 Q41 24 34.5 36 L34.5 60 Z" fill="c"/>
      <path d="M24 20 L19 18 M40 20 L45 18 M23 28 L18 28 M41 28 L46 28 M32 11 L32 6" stroke="c" stroke-width="3" stroke-linecap="round"/>
      <circle cx="30" cy="22" r="1.4" fill="h"/><circle cx="34.5" cy="27" r="1.4" fill="h"/><circle cx="30.5" cy="31" r="1.4" fill="h"/>
    </g>`,
  'no-muertos': `
    <path d="M32 13 C19 13 15 23 15 31 C15 38 19 40 22 42 V49 H42 V42 C45 40 49 38 49 31 C49 23 45 13 32 13 Z" fill="c"/>
    <circle cx="25" cy="31" r="5" fill="h"/><circle cx="39" cy="31" r="5" fill="h"/>
    <path d="M32 36 L29.3 41 H34.7 Z" fill="h"/>
    <path d="M27 44 V49 M32 44 V49 M37 44 V49" stroke="h" stroke-width="1.6"/>
    <path d="M22 55 L42 59 M42 55 L22 59" stroke="c" stroke-width="3.5" stroke-linecap="round"/>`,
  dragones: `
    <path d="M32 9 C37 21 48 26 46 41 C45 52 38 59 32 59 C25 59 18 52 18 43 C18 34 25 31 25 24 C29 29 30 33 32 36 C35 29 30 20 32 9 Z" fill="c"/>
    <path d="M32 33 C35 40 40 43 39 50 C38 55 35 57 32 57 C28 57 25 54 25 50 C25 45 29 44 29 40 C31 43 32 44 32 46 C33 42 31 38 32 33 Z" fill="h" opacity=".55"/>`,
  reyes: `
    <path d="M15 46 L13 21 L24 32 L32 14 L40 32 L51 21 L49 46 Z" fill="c"/>
    <rect x="15" y="46" width="34" height="7" rx="1.5" fill="c"/>
    <circle cx="13" cy="20" r="2.6" fill="c"/><circle cx="32" cy="13" r="2.8" fill="c"/><circle cx="51" cy="20" r="2.6" fill="c"/>
    <circle cx="24" cy="49.5" r="1.8" fill="h"/><circle cx="32" cy="49.5" r="1.8" fill="h"/><circle cx="40" cy="49.5" r="1.8" fill="h"/>`
};

// Claro u oscuro según el color del escudo (el blanco y el amarillo llevan el dibujo oscuro)
const luz = hex => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; };

// equipo: { id, color } (o solo { color }, como en el registro de ganadores). tam: ancho en px
export function emblema(equipo, tam = 24) {
  const c = colorDe(equipo);
  const color = (c && c.color) || equipo.color;
  if (!c) return `<span class="risk-punto" style="--equipo: ${color}"></span>`;
  if (estilo === 'emoji') {
    return `<span class="risk-emblema risk-emblema--emoji" style="--t: ${tam}px; --equipo: ${color}" aria-hidden="true">${c.emoji}</span>`;
  }
  const dibujo = luz(color) > 0.62 ? '#24242c' : '#fff6d5';
  const id = `risk-escudo-${++siguienteId}`;
  return `<span class="risk-emblema" style="--t: ${tam}px" aria-hidden="true"><svg viewBox="0 0 64 72">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="color-mix(in srgb, ${color} 75%, #fff)"/><stop offset=".55" stop-color="${color}"/>
      <stop offset="1" stop-color="color-mix(in srgb, ${color} 65%, #000)"/></linearGradient></defs>
    <path d="M32 2 L60 10 V34 C60 53 47 64 32 70 C17 64 4 53 4 34 V10 Z" fill="url(#${id})" stroke="#f2c46b" stroke-width="3"/>
    ${ICONOS[c.bando].replace(/"c"/g, `"${dibujo}"`).replace(/"h"/g, `"${color}"`)}</svg></span>`;
}

// URL absoluta de la imagen de fondo del bando (absoluta para que funcione dentro de una variable CSS);
// sin equipo, la imagen por defecto que se pida
export const imagenDe = (equipo, porDefecto = BANDO_POR_DEFECTO) => {
  const nombre = colorDe(equipo)?.bando || porDefecto;
  return new URL(`juegos/risk/img/${nombre}.webp`, location.href).href;
};

export const faccionDe = colorDe;
