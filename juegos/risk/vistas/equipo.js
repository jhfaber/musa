// Panel de un equipo (pantalla completa): sus continentes, nombre y si está ausente.
// Los cambios se despachan como acciones al almacén.
import { equipoPorId, continentes, equipoActual, multiplicador, hechosCont } from '../logica/reglas.js';
import { esc, reglaCrecimiento, serieMult } from './piezas.js';
import { emblema } from './emblemas.js';

let panel = null;
let abierto = null;
let almacen = null;
let deshecho = '';      // aviso "↶ Se deshizo: …" (spec 043)
let quitarAviso = 0;

// Qué se deshace, en palabras: "Asia quitada a Guerreros", "Asia dada a Dragones", "Asia pasada de Guerreros a Dragones"
function textoHecho(p, aj, h) {
  const cont = continentes(p, aj).find(c => c.id === h.cont);
  const nombre = id => esc((equipoPorId(p, id) || { nombre: '?' }).nombre);
  const c = cont ? `${cont.simbolo} ${esc(cont.nombre)}` : 'Continente';
  if (h.de && h.a) return `${c} pasada de ${nombre(h.de)} a ${nombre(h.a)}`;
  if (h.a) return `${c} dada a ${nombre(h.a)}`;
  return `${c} quitada a ${nombre(h.de)}`;
}

export function abrirEquipo(alm, id) {
  almacen = alm;
  abierto = id;
  if (!panel) {
    panel = Musa.panel.crear('Equipo', 'Continentes y estado del equipo', '', { completa: true });
    panel.addEventListener('click', e => {
      if (e.target.closest('[data-cerrar]')) return Musa.panel.cerrar(panel);
      const b = e.target.closest('[data-accion]');
      if (!b || b.tagName !== 'BUTTON') return;
      if (b.dataset.accion === 'deshacerContinente') {
        const ultimo = hechosCont(almacen.partida).slice(-1)[0];
        if (!ultimo) return;
        deshecho = `↶ Se deshizo: ${textoHecho(almacen.partida, almacen.ajustes, ultimo)}`;
        clearTimeout(quitarAviso);
        quitarAviso = setTimeout(() => { deshecho = ''; pintarEquipo(); }, 4000);
      }
      almacen.despachar({ tipo: b.dataset.accion, cont: b.dataset.cont, equipo: abierto });
    });
    panel.addEventListener('change', e => {
      if (e.target.dataset.campo === 'nombre') almacen.despachar({ tipo: 'renombrar', equipo: abierto, nombre: e.target.value });
      if (e.target.dataset.campo === 'ausente') almacen.despachar({ tipo: 'ausente', equipo: abierto });
      if (e.target.dataset.campo === 'equipo') { abierto = e.target.value; pintarEquipo(); }   // selector (spec 042)
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
      <div class="risk-selector"><label><span>Equipo</span>
        <select data-campo="equipo" aria-label="Equipo al que se le dan los continentes">
          ${p.equipos.map(e => `<option value="${e.id}" ${e.id === eq.id ? 'selected' : ''}>${esc(e.nombre)}${equipoActual(p) === e ? ' (juega)' : ''}</option>`).join('')}
        </select></label>
        <button class="risk-deshacer-cont" data-accion="deshacerContinente" ${hechosCont(p).length ? '' : 'disabled'}
          aria-label="Deshacer la última acción de continentes">↶ Deshacer</button></div>
      ${deshecho ? `<p class="risk-deshecho" role="status">${deshecho}</p>` : ''}
      <p class="ajustes-desc">${enTurno
        ? `＋ al que <b>conquistó</b>: reclama sus tropas ya mismo (×1). Luego ${reglaCrecimiento(aj)} (${serieMult(aj)}). − le quita un continente a quien lo tenga.`
        : (eq.jugados || 0) > 0
          ? `¿Lo conquistó en su turno y no alcanzaron a marcarlo? ＋ y en su próximo turno ya reclama ×${multiplicador(2, aj)}. − le quita un continente a quien lo tenga.`
          : '＋ le da un continente (empieza a contar en su primer turno, ×1). − se lo quita a quien lo tenga.'}</p>
      <div class="risk-continentes">
        ${continentes(p, aj).map(c => {
          const d = p.dominio[c.id];
          const suyo = d && d.equipo === eq.id;
          const otro = d && !suyo ? equipoPorId(p, d.equipo) : null;   // de otro equipo: su color y su escudo (spec 032)
          // Turnos que lo lleva su dueño y lo que le dará (ahora si juega, si no en su próximo turno): spec 040
          const juegaDueño = d && equipoActual(p).id === d.equipo;
          const mult = d ? multiplicador(d.turnos + (juegaDueño ? 0 : 1), aj) : 1;
          const estado = d ? `${d.turnos ? `${d.turnos} ${d.turnos === 1 ? 'turno' : 'turnos'} con él` : 'aún sin contar'} · ${juegaDueño ? 'ahora' : 'próximo turno'} ×${mult} = ${c.bono * mult}` : '';
          return `
            <div class="risk-continente-fila">
              ${suyo ? '<div' : `<button data-accion="continente" data-cont="${c.id}"`} class="risk-continente ${suyo ? 'risk-continente--suyo' : otro ? 'risk-continente--otro' : ''}"
                style="--equipo: ${(otro || eq).color}">
                <span class="risk-continente-simbolo">${c.simbolo}</span>
                <span class="risk-continente-texto"><b>${esc(c.nombre)}</b>
                  <small>${suyo ? estado : otro ? `Lo tiene <b>${esc(otro.nombre)}</b> · ${estado}` : `Da ${c.bono} tropas`}</small></span>
                ${suyo ? '<span class="risk-continente-marca">✓</span>' : otro ? `<span class="risk-continente-marca">${emblema(otro, 26)}</span>` : ''}
              ${suyo ? '</div>' : '</button>'}
              ${d ? `<button class="risk-lado risk-lado--quitar" data-accion="romper" data-cont="${c.id}" aria-label="Quitarle ${esc(c.nombre)} a ${esc((otro || eq).nombre)}">−</button>`
                : `<button class="risk-lado" data-accion="continente" data-cont="${c.id}" aria-label="Darle ${esc(c.nombre)} a ${esc(eq.nombre)}">＋</button>`}
            </div>`;
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
