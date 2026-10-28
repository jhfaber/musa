// Cuenta regresiva entre turnos: toda la pantalla con el color del equipo que sigue (10, 9, 8…).
import { equipoActual, equipoPorId, esUltimaRonda, totalReclamo, restanteCuenta } from '../logica/reglas.js';
import { esc, colaTurnos } from './piezas.js';
import { emblema } from './emblemas.js';

let capa = null;

function html(p, aj, ahora) {
  const c = p.cuenta;
  const e = equipoActual(p);
  const anterior = c.anterior && equipoPorId(p, c.anterior);
  return `
    <div class="risk-cuenta-fondo" aria-hidden="true"></div>
    <button class="boton-icono risk-cuenta-cerrar" data-accion="cuentaCerrar" aria-label="Cerrar y volver al tablero">✕</button>
    ${c.porTiempo && anterior ? `<p class="risk-cuenta-aviso">⛔ Se acabó el tiempo de ${esc(anterior.nombre)}: ninguna acción más</p>` : ''}
    <div class="risk-cuenta-ronda">Ronda ${p.ronda} de ${aj.rondas}${esUltimaRonda(p, aj) ? ' · ¡Última ronda!' : ''}</div>
    <div class="risk-cuenta-emblema">${emblema(e, 92)}</div>
    <h2 class="risk-cuenta-titulo">¡Turno de ${esc(e.nombre)}!</h2>
    <div class="risk-cuenta-anillo"><div class="risk-cuenta-numero">${Math.ceil(restanteCuenta(p, aj, ahora))}</div></div>
    <p class="risk-cuenta-tropas">Reclama <b>${totalReclamo(p, aj)}</b> tropas</p>
    <div class="risk-cuenta-botones">
      <button class="boton boton--secundario" data-accion="cuentaPausa">${c.corriendo ? '⏸ Pausar' : '▶ Seguir'}</button>
      <button class="boton boton--principal" data-accion="cuentaYa">¡Ya, a jugar!</button>
    </div>
    ${c.corriendo ? '' : `
      <div class="risk-cuenta-consejo">
        <p><b>¿No está ${esc(e.nombre)}?</b> Márcalo ausente y sigue el próximo. Cuando vuelva, toca <b>↩ Volvió</b>
        y juega justo después del equipo que esté jugando. Si lo atacan mientras no está, alguien más tira por él
        o se defiende siempre con <b>4 y 2</b>.</p>
        <button class="boton boton--secundario" data-accion="cuentaAusente">💤 Marcar ausente</button>
      </div>`}
    ${anterior && p.deshacer.length ? `
      <button class="boton boton--secundario risk-cuenta-extra" data-accion="prorroga" style="--equipo: ${anterior.color}">
        ${emblema(anterior)} +${aj.prorroga} s para ${esc(anterior.nombre)} <small>Usalos sabiamente</small>
      </button>` : ''}
    ${colaTurnos(p, aj, { desde: 1, titulo: 'Después juegan' })}`;
}

// Dibuja, actualiza o quita la capa según la partida. alClic recibe los clics de la capa.
export function pintarCuenta(p, aj, ahora, alClic) {
  if (!p || !p.cuenta || p.terminada) {
    if (capa) { capa.remove(); capa = null; document.body.classList.remove('sin-scroll'); }
    return;
  }
  if (!capa) {
    capa = document.createElement('div');
    capa.className = 'risk-cuenta';
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-modal', 'true');
    capa.addEventListener('click', alClic);
    document.body.appendChild(capa);
    document.body.classList.add('sin-scroll');
  }
  capa.style.setProperty('--equipo', equipoActual(p).color);
  capa.classList.toggle('risk-cuenta--pausa', !p.cuenta.corriendo);
  capa.innerHTML = html(p, aj, ahora);
}

// Cada latido: solo el número
export function actualizarCuenta(p, aj, ahora) {
  const n = capa && capa.querySelector('.risk-cuenta-numero');
  if (n && p && p.cuenta) n.textContent = Math.ceil(restanteCuenta(p, aj, ahora));
}

export const quitarCuenta = () => pintarCuenta(null);
