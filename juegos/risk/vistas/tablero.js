// Tablero de la partida: la carta del turno (tropas y reloj) y la lista de turnos.
// Solo dibuja: los botones llevan data-accion (cambian la partida) o data-ui (abren paneles).
import {
  equipoActual, esUltimaRonda, partesReclamo, totalReclamo, proximoReclamo, ordenTurnos,
  continentesDeEquipo, duracion, restanteReloj, VENTA_CARTAS
} from '../logica/reglas.js';
import { esc, punto } from './piezas.js';

export const ui = { venta: false };

function desglose(p, aj) {
  const d = partesReclamo(p, aj);
  // Cada fuente de tropas es una fila (como los duelos del simulador): símbolo · qué es · cuántas
  const fila = (simbolo, texto, detalle, tropas, extra = '', clase = '') => `
    <li class="risk-fila ${clase}">
      <span class="risk-fila-simbolo">${simbolo}</span>
      <span class="risk-fila-texto">${texto}${detalle ? `<small>${detalle}</small>` : ''}</span>
      <b class="risk-fila-tropas">+${tropas}</b>${extra}
    </li>`;
  const quitar = (cont, nombre) => `<button class="risk-quitar" data-accion="noLoTenia" data-cont="${cont}" aria-label="Ya no tenía ${esc(nombre)}">✕</button>`;
  return [
    fila('🪖', 'Base', 'cada turno', d.base),
    d.venta ? fila('★', `Vendió ${d.venta.estrellas} estrellas`, 'cartas', d.venta.tropas, `<button class="risk-quitar" data-accion="venta" data-estrellas="${d.venta.estrellas}" aria-label="Quitar venta">✕</button>`, 'risk-fila--venta') : '',
    ...d.partes.map(x => fila(x.continente.simbolo, esc(x.continente.nombre), `lo sostienen · ×${x.mult}`, x.tropas, quitar(x.cont, x.continente.nombre), 'risk-fila--cont')),
    ...d.ahora.map(x => fila(x.continente.simbolo, `¡Conquistó ${esc(x.continente.nombre)}!`, 'ya mismo · ×1', x.tropas, quitar(x.cont, x.continente.nombre), 'risk-fila--ahora'))
  ].join('');
}

function venta(p) {
  if (!ui.venta) return '';
  const actual = p.reclamo.venta;
  return `
    <div class="risk-venta-tabla" role="group" aria-label="Vender cartas: estrellas y tropas">
      ${Object.entries(VENTA_CARTAS).map(([estrellas, tropas]) => `
        <button class="risk-venta-op ${Number(estrellas) === actual ? 'risk-venta-op--activa' : ''}" data-accion="venta" data-estrellas="${estrellas}">
          <span>★ ${estrellas}</span><b>${tropas}</b></button>`).join('')}
    </div>`;
}

// Una fila de la lista de turnos. lugar: 0 = juega ahora, 1 = sigue, 2… ; null = ausente
function filaEquipo(p, aj, eq, lugar) {
  const suyos = continentesDeEquipo(p, aj, eq);
  const etiqueta = eq.ausente ? '💤 Ausente'
    : lugar === 0 ? 'Juega ahora'
    : p.pendientes.includes(eq.id) ? `${lugar === 1 ? 'Sigue' : `${lugar + 1}.º`} · recupera su turno`
    : lugar === 1 ? 'Sigue' : `${lugar + 1}.º`;
  return `
    <div class="risk-equipo ${lugar === 0 ? 'risk-equipo--turno' : ''} ${eq.ausente ? 'risk-equipo--ausente' : ''}" style="--equipo: ${eq.color}">
      <span class="risk-equipo-lugar">${eq.ausente ? '💤' : lugar + 1}</span>
      <button class="risk-equipo-abrir" data-ui="equipo" data-equipo="${eq.id}" aria-label="${esc(eq.nombre)}: continentes y estado">
        <span class="risk-equipo-texto">
          <small class="risk-equipo-etiqueta">${etiqueta}</small>
          <b>${punto(eq.color)} ${esc(eq.nombre)}</b>
          <small>${suyos.length ? suyos.map(c => `${c.simbolo} ×${c.mult}`).join('  ') : 'Sin continentes'}</small>
        </span>
        ${eq.ausente ? '' : `<span class="risk-equipo-tropas"><b>${proximoReclamo(p, aj, eq)}</b><small>próximo</small></span>`}
      </button>
      ${eq.ausente ? `<button class="risk-accion risk-volvio" data-accion="volvio" data-equipo="${eq.id}">↩ Volvió</button>` : ''}
    </div>`;
}

function listaTurnos(p, aj) {
  const orden = ordenTurnos(p, aj);
  const ausentes = p.equipos.filter(e => e.ausente);
  return [...orden.map((eq, i) => filaEquipo(p, aj, eq, i)), ...ausentes.map(eq => filaEquipo(p, aj, eq, null))].join('');
}

export function pintarTablero(p, aj) {
  const e = equipoActual(p);
  const sigue = ordenTurnos(p, aj)[1];
  const quedan = aj.rondas - p.ronda;
  return `
    <div class="risk">
      <div class="ronda">Ronda ${p.ronda} de ${aj.rondas}
        ${p.prorroga ? '<span class="risk-marca">+0:20 de tiempo extra</span>'
          : esUltimaRonda(p, aj) ? '<span class="risk-marca risk-marca--fin">¡Última ronda!</span>'
          : `<span class="risk-quedan">· quedan ${quedan}</span>`}</div>

      <div class="mesa">
        <article class="carta risk-turno carta--reloj reloj-vista-${aj.vista}" style="--equipo: ${e.color}">
          <div class="risk-turno-cabeza">${punto(e.color)} Turno del <b>${esc(e.nombre)}</b></div>
          <div class="risk-tropas"><small>Reclama</small><b class="risk-tropas-num">${totalReclamo(p, aj)}</b><small>tropas</small></div>
          <ul class="risk-desglose">${desglose(p, aj)}</ul>
          <div class="risk-turno-acciones">
            <button class="risk-accion" data-ui="equipo" data-equipo="${e.id}">🚩 Conquistó continente</button>
            <button class="risk-accion ${ui.venta ? 'risk-accion--activa' : ''}" data-ui="venta" aria-expanded="${ui.venta}">★ Vender cartas</button>
            <button class="risk-accion risk-accion--suave" data-accion="ausente" data-equipo="${e.id}">💤 Se fue</button>
          </div>
          ${venta(p)}
          ${Musa.reloj.html()}
        </article>
      </div>

      <div class="controles">
        <button class="boton-icono boton-redondo" data-accion="deshacer" ${p.deshacer.length ? '' : 'disabled'} aria-label="Volver al turno anterior">↶</button>
        <button class="boton boton--secundario risk-pausa" data-accion="reloj" ${p.reloj.estado === 'fin' ? 'disabled' : ''}>⏸ Pausa</button>
        <button class="boton boton--principal" data-accion="siguiente">Siguiente →</button>
      </div>
      <p class="risk-sigue">${sigue ? `Sigue ${punto(sigue.color)} <b>${esc(sigue.nombre)}</b> · ¡prepárense!` : 'Este es el último turno de la partida'}</p>

      <section class="risk-equipos" aria-label="Orden de los turnos">
        <div class="risk-subtitulo">Turnos · toca un equipo para sus continentes</div>
        ${listaTurnos(p, aj)}
      </section>

      <button class="boton boton--texto" data-ui="nueva">✦ Nueva partida</button>
    </div>`;
}

// Solo el reloj (cada latido): arena, número, texto del botón y urgencia
export function actualizarReloj(raiz, p, aj, ahora) {
  const carta = raiz.querySelector('.risk-turno');
  if (!carta) return;
  const total = duracion(p, aj);
  const restante = restanteReloj(p, aj, ahora);
  const estado = p.reloj.estado;
  const texto = { espera: '▶ Empezar', corre: '⏸ Pausar', pausa: '▶ Seguir', fin: '⛔ Tiempo' }[estado];
  Musa.reloj.pintarVista(carta, restante / total, restante, texto);
  const corre = estado === 'corre';
  carta.classList.toggle('reloj--medio', corre && restante <= total / 3 && restante > 15);
  carta.classList.toggle('reloj--poco', corre && restante <= 15 && restante > 0);
  carta.classList.toggle('reloj--fin', estado === 'fin');
  const pausa = raiz.querySelector('.risk-pausa');
  if (pausa) pausa.textContent = estado === 'corre' ? '⏸ Pausa' : estado === 'pausa' ? '▶ Seguir' : '▶ Empezar';
}
