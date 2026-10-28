// Aviso emergente encima de todo (se cierra con el botón o tocando fuera).
import { esc } from './piezas.js';
import { emblema } from './emblemas.js';

let capa = null;
let alCerrar = null;

// seguir = false al salir de Risk: se cierra sin hacer lo de alCerrar (no se reanuda el tiempo)
export function cerrarAviso(seguir = true) {
  if (capa) capa.remove();
  capa = null;
  const fn = alCerrar;
  alCerrar = null;
  if (fn && seguir) fn();
}

function mostrar(color, contenido, cuandoCierre = null) {
  cerrarAviso();
  capa = document.createElement('div');
  capa.className = 'risk-aviso';
  capa.setAttribute('role', 'alertdialog');
  capa.setAttribute('aria-modal', 'true');
  capa.innerHTML = `<div class="risk-aviso-carta" style="--equipo: ${color}">${contenido}
    <button class="boton boton--principal" data-aviso-cerrar>Entendido</button></div>`;
  capa.addEventListener('click', e => {
    if (e.target === capa || e.target.closest('[data-aviso-cerrar]')) cerrarAviso();
  });
  document.body.appendChild(capa);
  alCerrar = cuandoCierre;
  capa.querySelector('[data-aviso-cerrar]').focus();
}

// Un equipo se fue: qué pasa si lo atacan mientras no está y cómo vuelve. alCerrar: p. ej. seguir el tiempo
export function avisoAusente(eq, alCerrar = null) {
  mostrar(eq.color, `
    <div class="risk-aviso-arte" aria-hidden="true">💤</div>
    <h3>${emblema(eq)} Ausente: ${esc(eq.nombre)}</h3>
    <p>Su turno se salta y sigue el próximo de la lista.</p>
    <ul class="risk-aviso-reglas">
      <li>⚔️ <b>Si lo atacan</b> mientras no está, <b>otro equipo tira los dados por él</b> (que no sea el atacante).</li>
      <li>🛡️ <b>Si nadie puede</b>, se defiende siempre con <b>4 y 2</b>: el atacante debe superarlos.</li>
      <li>↩ <b>Cuando vuelva</b>, toca <b>Volvió</b> en su fila y juega justo después del equipo que esté jugando.</li>
    </ul>
    ${alCerrar ? '<p class="risk-aviso-pausa">⏸ El tiempo está en pausa: sigue al cerrar este aviso.</p>' : ''}`, alCerrar);
}
