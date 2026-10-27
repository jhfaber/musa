// Piezas de pantalla que comparten las vistas de Risk: dados en 3D, la mesa de una tirada y probabilidades.
import { probabilidades, explicarPareja, frase } from '../logica/dados.js';

// Texto seguro dentro del HTML (nombres que escribe la gente)
export const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const punto = color => `<span class="risk-punto" style="--equipo: ${color}"></span>`;

// Caras del cubo: 1 al frente, 6 atrás, 2 derecha, 5 izquierda, 3 arriba, 4 abajo (opuestas suman 7)
const PUNTOS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
// Giro del cubo para que la cara v quede al frente
const GIRO = { 1: '', 2: 'rotateY(-90deg)', 3: 'rotateX(-90deg)', 4: 'rotateX(90deg)', 5: 'rotateY(90deg)', 6: 'rotateY(180deg)' };

const cara = v => `<span class="cara cara-${v}">${Array.from({ length: 9 }, (_, i) => `<i class="${PUNTOS[v].includes(i) ? 'pip' : ''}"></i>`).join('')}</span>`;

// Un dado en 3D. lado: 'atq' (rojo) o 'def' (marfil). extra: atributos (p. ej. para tocarlo en el juez)
export const dado = (v, lado, extra = '') => `
  <span class="dado3d dado3d--${lado}" ${extra} aria-label="Dado: ${v}">
    <span class="dado3d-cubo" style="--giro: ${GIRO[v] || 'rotateX(0)'}">${[1, 2, 3, 4, 5, 6].map(cara).join('')}</span>
  </span>`;

// La mesa como duelos: una fila por pareja (el más alto contra el más alto, el segundo contra el segundo),
// con el dado del atacante a la izquierda, el del defensor a la derecha y la comparación en el medio.
// ocultar: sin ganador (para preguntar antes de mostrarlo). rodar: entran girando. tocables: para el simulador.
export function mesaDados(res, { ocultar = false, rodar = false, tocables = false } = {}) {
  const filas = Math.max(res.a.length, res.d.length);
  const atr = (lado, i) => (tocables ? `role="button" tabindex="0" data-ui="dado" data-lado="${lado}" data-i="${i}"` : '');
  const ORDEN = ['1.º', '2.º', '3.º'];
  const altura = i => (i === 0 ? 'más alto' : i === filas - 1 ? 'más bajo' : 'medio');
  const duelo = i => {
    const p = res.parejas[i];
    const a = res.a[i];
    const d = res.d[i];
    const clase = !p ? 'risk-duelo--solo' : ocultar ? '' : `risk-duelo--${p.gana}`;
    const signo = !p ? '' : p.a > p.d ? '&gt;' : p.a < p.d ? '&lt;' : '=';
    const centro = !p
      ? '<span class="risk-duelo-nada">sin pareja<br>no cuenta</span>'
      : `<span class="risk-duelo-cuenta">${ocultar ? `${p.a} <i>vs</i> ${p.d}` : `${p.a} ${signo} ${p.d}`}</span>
         ${ocultar ? '<span class="risk-duelo-quien">¿?</span>'
           : `<span class="risk-duelo-quien">${p.gana === 'atq' ? '⚔️ Gana ataque' : p.empate ? '🛡️ Empate: defensa' : '🛡️ Gana defensa'}</span>`}`;
    return `
      <div class="risk-duelo ${clase}">
        <span class="risk-duelo-orden">${ORDEN[i]}<small>${filas > 1 ? altura(i) : ''}</small></span>
        <span class="risk-duelo-dado ${p && !ocultar && p.gana === 'def' ? 'risk-duelo-dado--pierde' : ''}">${a ? dado(a, 'atq', atr('atq', i)) : '<span class="risk-duelo-vacio"></span>'}</span>
        <span class="risk-duelo-centro">${centro}</span>
        <span class="risk-duelo-dado ${p && !ocultar && p.gana === 'atq' ? 'risk-duelo-dado--pierde' : ''}">${d ? dado(d, 'def', atr('def', i)) : '<span class="risk-duelo-vacio"></span>'}</span>
      </div>`;
  };
  return `
    <div class="risk-mesa ${rodar ? 'risk-mesa--rodar' : ''}">
      <div class="risk-mesa-cabeza"><span>⚔️ Ataca</span><span>compara</span><span>🛡️ Defiende</span></div>
      <div class="risk-mesa-filas">
        ${filas > 1 ? '<span class="risk-mesa-flecha" aria-hidden="true"><b>mayor</b><i></i><b>menor</b></span>' : ''}
        ${Array.from({ length: filas }, (_, i) => duelo(i)).join('')}
      </div>
    </div>`;
}

export const resultado = res => `
  <p class="risk-resultado">${frase(res)}</p>
  <ul class="risk-explica">${res.parejas.map((p, i) => `<li class="risk-explica--${p.gana}">${explicarPareja(p, i)}</li>`).join('')}</ul>`;

export const barrasProb = (na, nd) => `
  <div class="risk-prob">
    <div class="risk-subtitulo">¿Qué tan probable es? (${na} contra ${nd})</div>
    ${probabilidades(na, nd).map(({ texto, p }, i, todos) => `
      <div class="risk-prob-fila risk-prob--${i === 0 ? 'atq' : i === todos.length - 1 ? 'def' : 'medio'}">
        <span>${texto}</span><b>${Math.round(p * 100)} %</b><i style="width: ${p * 100}%"></i>
      </div>`).join('')}
  </div>`;

// Selector de números como fichas (1, 2, 3…): data-ui="<ui>" data-n="<n>"
export const fichas = (valores, activo, ui, etiqueta = n => n) => `
  <div class="chips">${valores.map(n => `<button class="chip ${n === activo ? 'chip--activo' : ''}" data-ui="${ui}" data-n="${n}">${etiqueta(n)}</button>`).join('')}</div>`;
