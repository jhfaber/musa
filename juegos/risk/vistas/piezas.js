// Piezas de pantalla que comparten las vistas de Risk: dados en 3D, la mesa de una tirada y probabilidades.
import { probabilidades, explicarPareja, frase } from '../logica/dados.js';
import { emblema } from './emblemas.js';
import { ordenTurnos, estadisticas, equipoActual, totalReclamo, proximoReclamo, continentesDeEquipo } from '../logica/reglas.js';

// Texto seguro dentro del HTML (nombres que escribe la gente)
export const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);


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

// "3 turnos · 52 tropas": lo que lleva un equipo en la partida
export function resumenEquipo(eq) {
  const { jugados, reclamadas } = estadisticas(eq);
  return `${jugados} ${jugados === 1 ? 'turno' : 'turnos'} · ${reclamadas} tropas`;
}

// Cola de turnos: todos los equipos en el orden en que van a jugar (con los que recuperan su turno)
// y al final los ausentes. Cada fila: lugar, nombre, lo que lleva, sus continentes y las tropas que va a reclamar.
// desde: 0 = empieza en el que juega; 1 = en el que sigue. tocable: cada fila abre su panel de continentes.
export function colaTurnos(p, aj, { desde = 0, titulo = 'Orden de los turnos', tocable = false } = {}) {
  const orden = ordenTurnos(p, aj).slice(desde);
  const ausentes = p.equipos.filter(e => e.ausente);
  const estado = (eq, lugar) => {
    if (eq.ausente) return 'ausente';
    if (lugar === 0) return 'juega ahora';
    const recupera = p.pendientes.includes(eq.id) ? ' · recupera su turno' : '';
    return (lugar === 1 ? 'sigue · ¡prepárense!' : `${lugar + 1}.º en jugar`) + recupera;
  };
  const fila = (eq, lugar) => {
    const conts = continentesDeEquipo(p, aj, eq);
    const tropas = eq === equipoActual(p) ? totalReclamo(p, aj) : proximoReclamo(p, aj, eq);
    const clase = eq.ausente ? 'risk-cola--ausente' : lugar === 0 ? 'risk-cola--ahora' : lugar === 1 ? 'risk-cola--sigue' : '';
    const cuerpo = `
      <span class="risk-cola-num">${eq.ausente ? '💤' : lugar + 1}</span>
      <span class="risk-cola-nombre">
        <b>${emblema(eq)} ${esc(eq.nombre)}</b>
        <em>${estado(eq, lugar)}</em>
        <em>${resumenEquipo(eq)}</em>
        ${conts.length ? `<em class="risk-cola-conts">${conts.map(c => `${c.simbolo} ×${c.mult}`).join('  ')}</em>` : ''}
      </span>
      ${eq.ausente ? '' : `<span class="risk-cola-tropas"><b>${tropas}</b><small>${lugar === 0 ? 'reclama' : 'reclamará'}</small></span>`}`;
    return `
      <li class="${clase}" style="--equipo: ${eq.color}">
        ${tocable ? `<button class="risk-cola-fila" data-ui="equipo" data-equipo="${eq.id}" aria-label="${esc(eq.nombre)}: continentes y estado">${cuerpo}</button>`
          : `<div class="risk-cola-fila">${cuerpo}</div>`}
        ${eq.ausente && tocable ? `<button class="risk-accion risk-volvio" data-accion="volvio" data-equipo="${eq.id}">↩ Volvió</button>` : ''}
      </li>`;
  };
  return `
    <section class="risk-cola" aria-label="${titulo}">
      <div class="risk-subtitulo">${titulo}</div>
      <ol>${orden.map((eq, i) => fila(eq, i + desde)).join('')}${ausentes.map(eq => fila(eq, null)).join('')}</ol>
      ${tocable ? '<p class="risk-nota risk-cola-pista">Toca un equipo para darle o quitarle continentes, o marcarlo ausente.</p>' : ''}
    </section>`;
}
