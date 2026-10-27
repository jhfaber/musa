// Preparar la partida: qué equipos juegan (de los 10 colores), en qué orden, sus nombres y quién empieza.
import { COLORES } from '../logica/reglas.js';
import { dadoAlAzar } from '../logica/dados.js';
import { esc, punto } from './piezas.js';

// elegidos: ids de color en el orden de los turnos. propios: nombres escritos, por id. empieza: id.
export const preparar = { elegidos: ['azul', 'rojo', 'verde'], nombres: 'colores', propios: {}, empieza: 'azul', sorteo: null };

const color = id => COLORES.find(c => c.id === id);
const lugar = id => preparar.elegidos.indexOf(id);
const nombrePorDefecto = id => (preparar.nombres === 'colores' ? `Equipo ${color(id).nombre}` : `Equipo ${lugar(id) + 1}`);
const nombre = id => preparar.propios[id] || nombrePorDefecto(id);

// Lo que necesita la acción { tipo: 'empezar' }
export const datosPartida = aj => ({
  equipos: preparar.elegidos.map(id => ({ id, nombre: nombre(id), color: color(id).color })),
  inicio: Math.max(0, lugar(preparar.empieza)),
  mapa: aj.mapa
});

// Cada equipo tira un dado; si empatan los más altos, vuelven a tirar
function sortear() {
  if (preparar.elegidos.length < 2) return;
  let tiros;
  do {
    tiros = preparar.elegidos.map(() => dadoAlAzar());
  } while (tiros.filter(t => t === Math.max(...tiros)).length > 1);
  preparar.sorteo = Object.fromEntries(preparar.elegidos.map((id, i) => [id, tiros[i]]));
  preparar.empieza = preparar.elegidos[tiros.indexOf(Math.max(...tiros))];
}

function mover(id, paso) {
  const lista = preparar.elegidos;
  const i = lista.indexOf(id);
  const j = i + paso;
  if (j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
}

function alternar(id) {
  const lista = preparar.elegidos;
  if (lista.includes(id)) preparar.elegidos = lista.filter(x => x !== id);
  else lista.push(id);
  if (!preparar.elegidos.includes(preparar.empieza)) preparar.empieza = preparar.elegidos[0] || null;
  preparar.sorteo = null;
}

// Cambios de la pantalla (data-ui): devuelve true si hay que repintar
export function alTocar(b) {
  const { ui, n } = b.dataset;
  if (ui === 'elegir') alternar(n);
  else if (ui === 'subir') mover(n, -1);
  else if (ui === 'bajar') mover(n, 1);
  else if (ui === 'nombres') { preparar.nombres = n; preparar.propios = {}; }
  else if (ui === 'inicio') { preparar.empieza = n; preparar.sorteo = null; }
  else if (ui === 'sortear') sortear();
  else return false;
  return true;
}

export const alEscribir = campo => { if (campo.dataset.nombre) preparar.propios[campo.dataset.nombre] = campo.value.trim(); };

function filaElegido(id, i, total) {
  const c = color(id);
  const empieza = preparar.empieza === id;
  return `
    <li class="risk-orden-fila ${empieza ? 'risk-lista--empieza' : ''}" style="--equipo: ${c.color}">
      <span class="risk-orden-num">${i + 1}</span>
      <div class="risk-orden-mover">
        <button class="boton-icono" data-ui="subir" data-n="${id}" ${i ? '' : 'disabled'} aria-label="Subir ${esc(nombre(id))}">▲</button>
        <button class="boton-icono" data-ui="bajar" data-n="${id}" ${i < total - 1 ? '' : 'disabled'} aria-label="Bajar ${esc(nombre(id))}">▼</button>
      </div>
      <div class="risk-orden-cuerpo">
        <div class="risk-orden-linea">
          ${punto(c.color)}
          <input class="risk-nombre" data-nombre="${id}" value="${esc(nombre(id))}" aria-label="Nombre del equipo ${c.nombre}">
        </div>
        <div class="risk-orden-linea">
          <button class="chip ${empieza ? 'chip--activo' : ''}" data-ui="inicio" data-n="${id}">${empieza ? '★ Empieza' : 'Empieza'}</button>
          ${preparar.sorteo ? `<span class="risk-sorteo">🎲 ${preparar.sorteo[id]}</span>` : ''}
          <button class="risk-orden-quitar" data-ui="elegir" data-n="${id}" aria-label="Quitar ${esc(nombre(id))}">✕ Quitar</button>
        </div>
      </div>
    </li>`;
}

export function pintarPreparar(aj) {
  const mapa = aj.mapas[aj.mapa];
  const { elegidos } = preparar;
  return `
    <div class="risk">
      <div class="ronda">Nueva partida</div>
      <article class="carta risk-preparar">
        <div class="risk-preparar-arte" aria-hidden="true">⚔️</div>
        <h3 class="carta-titulo">Risk Relámpago</h3>

        <div class="risk-subtitulo">1 · ¿Qué ejércitos juegan?</div>
        <div class="risk-colores">
          ${COLORES.map(c => {
            const elegido = elegidos.includes(c.id);
            return `
              <button class="risk-color ${elegido ? 'risk-color--elegido' : ''}" data-ui="elegir" data-n="${c.id}" aria-pressed="${elegido}" style="--equipo: ${c.color}">
                <span class="risk-color-muestra">${elegido ? lugar(c.id) + 1 : ''}</span>${c.nombre}
              </button>`;
          }).join('')}
        </div>

        <div class="risk-subtitulo">2 · Orden de los turnos <small>(${elegidos.length} ${elegidos.length === 1 ? 'equipo' : 'equipos'})</small></div>
        ${elegidos.length ? `
          <ol class="risk-orden">${elegidos.map((id, i) => filaElegido(id, i, elegidos.length)).join('')}</ol>`
          : '<p class="risk-nota-oscura">Toca arriba los colores que van a jugar.</p>'}
        ${elegidos.length >= 2 ? '<button class="boton boton--secundario risk-ancho" data-ui="sortear">🎲 Sortear quién empieza (dado mayor)</button>' : ''}

        <div class="risk-subtitulo">Nombres</div>
        <div class="chips">
          <button class="chip ${preparar.nombres === 'colores' ? 'chip--activo' : ''}" data-ui="nombres" data-n="colores">Por colores</button>
          <button class="chip ${preparar.nombres === 'numeros' ? 'chip--activo' : ''}" data-ui="nombres" data-n="numeros">Por números</button>
        </div>

        <p class="risk-preparar-mapa">Mapa: <b>${esc(mapa.nombre)}</b> · ${mapa.continentes.length} continentes
          <button class="risk-mini" data-ui="ajustes">Cambiar en ⚙</button></p>
        <details class="risk-antes">
          <summary>Antes de empezar, en el tablero</summary>
          <ol>
            <li>Repartir las cartas parejas (las que sobran, a los últimos turnos) y poner 1 soldado en cada territorio.</li>
            <li>Cada equipo reparte sus unidades iniciales en sus territorios.</li>
            <li>Recoger las cartas, barajar y repartir <b>4 cartas</b> a cada equipo.</li>
          </ol>
        </details>
      </article>
      <div class="controles">
        <button class="boton boton--principal" data-ui="empezar" ${elegidos.length >= 2 ? '' : 'disabled'}>⚔️ ¡Empezar!${elegidos.length < 2 ? ' (mínimo 2)' : ''}</button>
      </div>
      <p class="risk-sigue">${aj.rondas} rondas · ${aj.tropas} tropas por turno · turnos de ${Musa.reloj.formato(aj.turno)}</p>
    </div>`;
}
