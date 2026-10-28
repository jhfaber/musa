// Panel de un equipo (pantalla completa): sus continentes, nombre y si está ausente.
// Los cambios se despachan como acciones al almacén.
import { equipoPorId, continentes, equipoActual } from '../logica/reglas.js';
import { esc} from './piezas.js';
import { emblema } from './emblemas.js';

let panel = null;
let abierto = null;
let almacen = null;

export function abrirEquipo(alm, id) {
  almacen = alm;
  abierto = id;
  if (!panel) {
    panel = Musa.panel.crear('Equipo', 'Continentes y estado del equipo', '', { completa: true });
    panel.addEventListener('click', e => {
      if (e.target.closest('[data-cerrar]')) return Musa.panel.cerrar(panel);
      const b = e.target.closest('[data-accion]');
      if (b && b.tagName === 'BUTTON') almacen.despachar({ tipo: b.dataset.accion, cont: b.dataset.cont, equipo: abierto });
    });
    panel.addEventListener('change', e => {
      if (e.target.dataset.campo === 'nombre') almacen.despachar({ tipo: 'renombrar', equipo: abierto, nombre: e.target.value });
      if (e.target.dataset.campo === 'ausente') almacen.despachar({ tipo: 'ausente', equipo: abierto });
    });
  }
  Musa.panel.mostrar(panel);
  pintarEquipo();
}

// También la llama risk.js cada vez que cambia la partida, si el panel está abierto
export function pintarEquipo() {
  if (!panel || panel.hidden || !almacen.partida) return;
  const p = almacen.partida;
  const aj = almacen.ajustes;
  const eq = equipoPorId(p, abierto);
  const enTurno = equipoActual(p) === eq;
  panel.querySelector('.catalogo-cabeza h2').innerHTML = `${emblema(eq)} ${esc(eq.nombre)}`;
  panel.querySelector('.catalogo-cuerpo').innerHTML = `
    <section class="ajuste">
      <h3 class="catalogo-subtitulo">🚩 Continentes</h3>
      <p class="ajustes-desc">${enTurno
        ? 'Toca el que <b>conquistó</b>: reclama sus tropas ya mismo (×1). Cada turno que lo sostenga se multiplica.'
        : 'Toca para darle o quitarle un continente. Empieza a contar en su próximo turno.'}</p>
      <div class="risk-continentes">
        ${continentes(p, aj).map(c => {
          const d = p.dominio[c.id];
          const suyo = d && d.equipo === eq.id;
          const otro = d && !suyo ? equipoPorId(p, d.equipo) : null;
          const mult = suyo ? Math.max(1, d.turnos) : 1;
          return `
            <button class="risk-continente ${suyo ? 'risk-continente--suyo' : ''}" data-accion="continente" data-cont="${c.id}"
              aria-pressed="${Boolean(suyo)}" style="--equipo: ${(otro || eq).color}">
              <span class="risk-continente-simbolo">${c.simbolo}</span>
              <span class="risk-continente-texto"><b>${esc(c.nombre)}</b>
                <small>${suyo ? `Suyo · ×${mult} · ${c.bono * mult} tropas` : otro ? `Lo tiene ${esc(otro.nombre)} · tocar para quitárselo` : `Da ${c.bono} tropas`}</small></span>
              <span class="risk-continente-marca">${suyo ? '✓' : '＋'}</span>
            </button>`;
        }).join('')}
      </div>
    </section>
    <section class="ajuste">
      <h3 class="catalogo-subtitulo">Nombre</h3>
      <input class="risk-nombre" data-campo="nombre" value="${esc(eq.nombre)}" aria-label="Nombre del equipo">
    </section>
    <section class="ajuste">
      <h3 class="catalogo-subtitulo">¿Está en la mesa?</h3>
      <label class="ajuste-fila">
        <span><b>💤 Ausente</b><small>Su turno se salta. Si lo atacan, alguien más tira por él (que no sea el atacante)
        o se defiende siempre con 4 y 2.</small></span>
        <input type="checkbox" class="ajuste-interruptor" data-campo="ausente" ${eq.ausente ? 'checked' : ''}>
      </label>
    </section>`;
}
