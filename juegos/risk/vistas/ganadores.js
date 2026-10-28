// Registro de ganadores 🏆 (pantalla completa): los últimos 10, con fecha; cada uno se puede borrar.
// Se guarda aparte de la partida (musa.risk.ganadores.v1).
import { anotarGanador, borrarRegistro, MAX_REGISTROS } from '../logica/historial.js';
import { continentesDeEquipo, equipoPorId } from '../logica/reglas.js';
import { esc} from './piezas.js';
import { emblema } from './emblemas.js';

const CLAVE = 'musa.risk.ganadores.v1';
let panel = null;

const leer = () => { const l = Musa.leer(CLAVE); return Array.isArray(l) ? l : []; };

// La llama risk.js cuando se marca (o cambia) el ganador en la pantalla final
export function guardarGanador(p, aj) {
  const eq = p.ganador && equipoPorId(p, p.ganador);
  const continentes = eq ? continentesDeEquipo(p, aj, eq) : [];
  Musa.guardar(CLAVE, anotarGanador(leer(), p, Date.now(), continentes));
  pintar();
}

const fecha = t => new Date(t).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
  + ' · ' + new Date(t).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

export function abrirGanadores() {
  if (!panel) {
    panel = Musa.panel.crear('🏆 Ganadores', 'Registro de ganadores', '', { completa: true });
    panel.addEventListener('click', e => {
      if (e.target.closest('[data-cerrar]')) return Musa.panel.cerrar(panel);
      const b = e.target.closest('[data-borrar]');
      if (!b) return;
      if (!b.dataset.seguro) { b.dataset.seguro = '1'; b.textContent = '¿Borrar?'; return; }
      Musa.guardar(CLAVE, borrarRegistro(leer(), Number(b.dataset.borrar)));
      pintar();
    });
  }
  Musa.panel.mostrar(panel);
  pintar();
}

function pintar() {
  if (!panel || panel.hidden) return;
  const lista = leer();
  panel.querySelector('.catalogo-cuerpo').innerHTML = lista.length ? `
    <p class="catalogo-resumen">Los últimos <b>${MAX_REGISTROS}</b> ganadores, el más reciente primero.</p>
    <ol class="risk-ganadores">
      ${lista.map((r, i) => `
        <li style="--equipo: ${r.ganador.color}">
          <span class="risk-ganadores-trofeo">${i === 0 ? '🏆' : '🥇'}</span>
          <span class="risk-ganadores-texto">
            <b>${emblema(r.ganador)} ${esc(r.ganador.nombre)}</b>
            <span class="risk-ganadores-datos">
              <span><b>${r.tropas ?? '—'}</b> tropas</span>
              ${r.turnos !== undefined ? `<span><b>${r.turnos}</b> ${r.turnos === 1 ? 'turno' : 'turnos'}</span>` : ''}
              <span>${r.continentes && r.continentes.length ? r.continentes.map(c => `${c.simbolo} ${esc(c.nombre)}`).join(' · ') : 'Sin continentes'}</span>
            </span>
            <small>${fecha(r.fecha)} · ${r.rondas} ${r.rondas === 1 ? 'ronda' : 'rondas'}</small>
            <small>contra ${r.rivales.map(esc).join(', ')}</small>
          </span>
          <button class="risk-ganadores-borrar" data-borrar="${i}" aria-label="Borrar este registro">✕</button>
        </li>`).join('')}
    </ol>` : `
    <div class="risk-ganadores-vacio">
      <div aria-hidden="true">🏆</div>
      <p>Aún no hay ganadores. Al terminar una partida, toca el equipo que ganó y quedará aquí con la fecha.</p>
    </div>`;
}
