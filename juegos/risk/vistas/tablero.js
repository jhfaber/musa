// Tablero de la partida: la carta del turno (tropas, reloj, vender cartas, quién se prepara) y la cola de turnos.
// Solo dibuja: los botones llevan data-accion (cambian la partida) o data-ui (abren paneles).
import {
  equipoActual, esUltimaRonda, partesReclamo, totalReclamo, duracion, restanteReloj, VENTA_CARTAS,
  quienSigue, proximoReclamo, tropasPorEstrellas
} from '../logica/reglas.js';
import { esc, colaTurnos } from './piezas.js';
import { emblema } from './emblemas.js';

// Estado de pantalla (no va en la partida): el cuadro del desglose y las estrellas elegidas antes de vender.
// Se reinicia al cambiar de turno.
const pantalla = { turno: '', desglose: false, estrellas: 0 };
export const tocarTablero = {
  desglose: () => { pantalla.desglose = !pantalla.desglose; },
  estrellas: b => { const n = Number(b.dataset.estrellas); pantalla.estrellas = pantalla.estrellas === n ? 0 : n; },
  vendido: () => { pantalla.estrellas = 0; },
  quieto: () => {}
};

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
    ...d.ventas.map(v => fila('★', `Vendió ${v.estrellas} estrellas`, 'cartas', v.tropas, `<button class="risk-quitar" data-accion="quitarVenta" data-i="${v.i}" aria-label="Quitar venta de ${v.estrellas} estrellas">✕</button>`, 'risk-fila--venta')),
    ...d.partes.map(x => fila(x.continente.simbolo, esc(x.continente.nombre), `${x.turnos}.º turno con él · ×${x.mult}`, x.tropas, quitar(x.cont, x.continente.nombre), 'risk-fila--cont')),
    ...d.ahora.map(x => fila(x.continente.simbolo, `¡Conquistó ${esc(x.continente.nombre)}!`, 'ya mismo · ×1', x.tropas, quitar(x.cont, x.continente.nombre), 'risk-fila--ahora'))
  ].join('');
}

// Cuadro emergente: de dónde salen las tropas que reclama (se abre tocando el número)
function cuadroDesglose(p, aj, e) {
  if (!pantalla.desglose) return '';
  return `
    <div class="risk-aviso risk-desglose-capa" data-ui="desglose">
      <div class="risk-aviso-carta risk-desglose-carta" style="--equipo: ${e.color}" data-ui="quieto" role="dialog" aria-modal="true" aria-label="Por qué reclama ${totalReclamo(p, aj)} tropas">
        <button class="risk-desglose-cerrar" data-ui="desglose" aria-label="Cerrar">✕</button>
        <h3>${emblema(e)} Reclama ${totalReclamo(p, aj)}</h3>
        <ul class="risk-desglose">${desglose(p, aj)}</ul>
      </div>
    </div>`;
}

// Vender cartas en dos pasos: se elige el total de estrellas y se toca Vender (las ventas se acumulan)
function venta(p, aj) {
  const elegidas = pantalla.estrellas;
  const vendidas = partesReclamo(p, aj).ventas.reduce((s, v) => s + v.tropas, 0);
  return `
    <section class="risk-venta">
      <h4 class="risk-venta-titulo">★ Vender cartas${vendidas ? ` <small>+${vendidas} vendidas</small>` : ''}</h4>
      <div class="risk-venta-tabla" role="group" aria-label="Estrellas a vender y tropas que dan">
        ${Object.entries(VENTA_CARTAS).map(([estrellas, tropas]) => `
          <button class="risk-venta-op ${Number(estrellas) === elegidas ? 'risk-venta-op--activa' : ''}" data-ui="estrellas" data-estrellas="${estrellas}"
            aria-pressed="${Number(estrellas) === elegidas}"><span>★ ${estrellas}</span><b>${tropas}</b></button>`).join('')}
      </div>
      <button class="risk-accion risk-vender" data-accion="vender" data-estrellas="${elegidas}" ${elegidas ? '' : 'disabled'}>
        ${elegidas ? `Vender ★ ${elegidas} · +${tropasPorEstrellas(elegidas)}` : 'Elige las estrellas y vende'}</button>
    </section>`;
}

// La ronda en corto (2/6) y, cuando tocan, el tiempo extra o la última ronda
function marcaRonda(p, aj) {
  const extra = p.prorroga ? ` · +${Musa.reloj.formato(aj.prorroga)}` : esUltimaRonda(p, aj) ? ' · ¡Última!' : '';
  const clase = p.prorroga ? 'risk-ronda--extra' : esUltimaRonda(p, aj) ? 'risk-ronda--fin' : '';
  return `<span class="risk-ronda ${clase}" aria-label="Ronda ${p.ronda} de ${aj.rondas}">${p.ronda}/${aj.rondas}${extra}</span>`;
}

// Franja al pie de la carta: quién se prepara y con cuántas tropas (no sale en el último turno)
function sePrepara(p, aj) {
  const sig = quienSigue(p, aj);
  if (!sig) return '';
  return `
    <div class="risk-prepara" style="--sigue: ${sig.color}">
      ${emblema(sig, 26)}<span>Se prepara <b>${esc(sig.nombre)}</b> con <b>${proximoReclamo(p, aj, sig)}</b> tropas</span>
    </div>`;
}

export function pintarTablero(p, aj) {
  const e = equipoActual(p);
  const turno = `${p.ronda}-${p.reclamo.equipo}`;
  if (pantalla.turno !== turno) Object.assign(pantalla, { turno, desglose: false, estrellas: 0 });
  const total = totalReclamo(p, aj);
  return `
    <div class="risk">
      <div class="mesa">
        <article class="carta risk-turno carta--reloj reloj-vista-${aj.vista}" style="--equipo: ${e.color}">
          <div class="risk-turno-cabeza">${emblema(e, 38)}
            <span class="risk-turno-quien">Turno de <b>${esc(e.nombre)}</b></span>${marcaRonda(p, aj)}</div>
          <div class="risk-turno-medio">
            <div class="risk-tropas">
              <button class="risk-tropas-num" data-ui="desglose" aria-label="Reclama ${total} tropas: ver por qué" aria-expanded="${pantalla.desglose}">${total}</button>
              <small>Reclama</small></div>
            <div class="risk-turno-acciones">
              <button class="risk-accion risk-conquisto" data-ui="equipo" data-equipo="${e.id}" aria-label="Conquistó continente"><span aria-hidden="true">🚩</span> Conquistó</button>
              <button class="risk-accion risk-sefue" data-accion="ausente" data-equipo="${e.id}">💤 Se fue</button>
            </div>
          </div>
          ${Musa.reloj.html()}
          ${venta(p, aj)}
          ${sePrepara(p, aj)}
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
      ${cuadroDesglose(p, aj, e)}
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
