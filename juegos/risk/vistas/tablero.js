// Tablero de la partida: la carta del turno (tropas, reloj, vender cartas) y la cola de turnos.
// Solo dibuja: los botones llevan data-accion (cambian la partida) o data-ui (abren paneles).
import {
  equipoActual, esUltimaRonda, partesReclamo, totalReclamo, duracion, restanteReloj, VENTA_CARTAS
} from '../logica/reglas.js';
import { esc, colaTurnos } from './piezas.js';
import { emblema, faccionDe } from './emblemas.js';

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

// Vender cartas: siempre a la vista, con la tabla de estrellas → tropas
function venta(p) {
  const actual = p.reclamo.venta;
  return `
    <section class="risk-venta">
      <h4 class="risk-venta-titulo">★ Vender cartas</h4>
      <p class="risk-venta-ayuda">Suma las estrellas de las cartas que entregas y toca el total: esas tropas se suman a lo que reclama.</p>
      <div class="risk-venta-tabla" role="group" aria-label="Estrellas vendidas y tropas que dan">
        ${Object.entries(VENTA_CARTAS).map(([estrellas, tropas]) => `
          <button class="risk-venta-op ${Number(estrellas) === actual ? 'risk-venta-op--activa' : ''}" data-accion="venta" data-estrellas="${estrellas}"
            aria-pressed="${Number(estrellas) === actual}"><span>★ ${estrellas}</span><b>${tropas}</b></button>`).join('')}
      </div>
    </section>`;
}

export function pintarTablero(p, aj) {
  const e = equipoActual(p);
  const quedan = aj.rondas - p.ronda;
  return `
    <div class="risk">
      <div class="ronda">Ronda ${p.ronda} de ${aj.rondas}
        ${p.prorroga ? `<span class="risk-marca">+${Musa.reloj.formato(aj.prorroga)} de tiempo extra</span>`
          : esUltimaRonda(p, aj) ? '<span class="risk-marca risk-marca--fin">¡Última ronda!</span>'
          : `<span class="risk-quedan">· quedan ${quedan}</span>`}</div>

      <div class="mesa">
        <article class="carta risk-turno carta--reloj reloj-vista-${aj.vista}" style="--equipo: ${e.color}">
          <div class="risk-turno-cabeza">${emblema(e, 38)}
            <span>Turno de <b>${esc(e.nombre)}</b>${faccionDe(e) ? `<small class="risk-lema">“${faccionDe(e).lema}”</small>` : ''}</span></div>
          <div class="risk-tropas"><small>Reclama</small><b class="risk-tropas-num">${totalReclamo(p, aj)}</b><small>tropas</small></div>
          <ul class="risk-desglose">${desglose(p, aj)}</ul>
          <div class="risk-turno-acciones">
            <button class="risk-accion" data-ui="equipo" data-equipo="${e.id}">🚩 Conquistó continente</button>
            <button class="risk-accion risk-accion--suave" data-accion="ausente" data-equipo="${e.id}">💤 Se fue</button>
          </div>
          ${Musa.reloj.html()}
          ${venta(p)}
        </article>
      </div>

      <div class="controles">
        <button class="boton-icono boton-redondo" data-accion="deshacer" ${p.deshacer.length ? '' : 'disabled'} aria-label="Volver al turno anterior">↶</button>
        <button class="boton boton--secundario risk-pausa" data-accion="reloj" ${p.reloj.estado === 'fin' ? 'disabled' : ''}>⏸ Pausa</button>
        <button class="boton boton--principal" data-accion="siguiente">Siguiente →</button>
      </div>
      ${colaTurnos(p, aj, { tocable: true })}

      <div class="risk-fin-botones">
        <button class="boton boton--secundario" data-ui="finalizar">🏁 Finalizar partida</button>
        <button class="boton boton--secundario" data-ui="nueva">✦ Nueva partida</button>
      </div>
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
