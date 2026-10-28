// Menú ⚙ (pantalla completa): partida, tiempos, mapa y continentes (incluidos los propios), aspecto y reloj.
import * as Mapas from '../logica/mapas.js';
import { esc } from './piezas.js';
import { emblema } from './emblemas.js';

let panel = null;
let almacen = null;
let acciones = {};          // { escuela, nueva } que pone risk.js
let mapaVisto = null;       // mapa que se está editando

const ESTILOS = [['escudo', 'Escudo dibujado'], ['emoji', 'Emoji']];
const FONDOS = [['no', 'Sin imagen'], ['suave', 'Suave'], ['media', 'Media'], ['fuerte', 'Fuerte']];
const MUESTRA = ['azul', 'rojo', 'verde', 'morado', 'cafe'];

export function abrirAjustes(alm, otras) {
  almacen = alm;
  acciones = otras;
  mapaVisto = almacen.ajustes.mapa;
  if (!panel) {
    panel = Musa.panel.crear('⚙ Ajustes de Risk', 'Ajustes de Risk', '', { completa: true });
    panel.addEventListener('click', clic);
    panel.addEventListener('change', cambio);
  }
  Musa.panel.mostrar(panel);
  pintarAjustes();
}

const cambiar = c => almacen.cambiarAjustes(c);
const cambiarMapas = fn => cambiar(aj => ({ mapas: fn(aj.mapas) }));

function clic(e) {
  if (e.target.closest('[data-cerrar]')) return Musa.panel.cerrar(panel);
  const b = e.target.closest('button');
  if (!b) return;
  const aj = almacen.ajustes;
  const { tiempo, numero, paso, vista, mapa, ui, cont, emblema: estilo, fondo } = b.dataset;
  if (tiempo) cambiar({ [tiempo]: Musa.reloj.ajustarSegundos(aj[tiempo] + Number(paso)) });
  else if (numero === 'bono') cambiarMapas(m => Mapas.editarContinente(m, mapaVisto, cont, { bono: m[mapaVisto].continentes.find(c => c.id === cont).bono + Number(paso) }));
  else if (numero) cambiar({ [numero]: aj[numero] + Number(paso) * (numero === 'prorroga' ? 5 : 1) });
  else if (vista) cambiar({ vista });
  else if (estilo) cambiar({ emblema: estilo });
  else if (fondo) cambiar({ fondo });
  else if (mapa) { mapaVisto = mapa; cambiar({ mapa }); }
  else if (ui === 'nuevo-mapa') {
    const { mapas, id } = Mapas.crearMapa(aj.mapas, `Mi mapa ${Object.values(aj.mapas).filter(m => m.propio).length + 1}`);
    mapaVisto = id;
    cambiar({ mapas: Mapas.agregarContinente(mapas, id), mapa: id });
  }
  else if (ui === 'borrar-mapa' && b.dataset.seguro) {
    mapaVisto = Mapas.MAPA_NORMAL;
    cambiar({ mapas: Mapas.borrarMapa(aj.mapas, b.dataset.id), mapa: Mapas.MAPA_NORMAL });
  }
  else if (ui === 'borrar-mapa') { b.dataset.seguro = '1'; b.textContent = '¿Seguro? Toca otra vez para borrarlo'; return; }
  else if (ui === 'agregar-continente') cambiarMapas(m => Mapas.agregarContinente(m, mapaVisto));
  else if (ui === 'quitar-continente') cambiarMapas(m => Mapas.quitarContinente(m, mapaVisto, cont));
  else if (ui === 'escuela') acciones.escuela();
  else if (ui === 'nueva' && b.dataset.seguro) { Musa.panel.cerrar(panel); acciones.nueva(); return; }
  else if (ui === 'nueva') { b.dataset.seguro = '1'; b.textContent = '¿Seguro? Toca otra vez para borrar la partida'; return; }
  pintarAjustes();
}

function cambio(e) {
  const { ajuste, campo, cont } = e.target.dataset;
  if (ajuste) cambiar({ [ajuste]: e.target.checked });
  if (campo === 'nombre-mapa') cambiarMapas(m => Mapas.renombrarMapa(m, mapaVisto, e.target.value));
  if (campo === 'nombre' || campo === 'simbolo') cambiarMapas(m => Mapas.editarContinente(m, mapaVisto, cont, { [campo]: e.target.value }));
  pintarAjustes();
}

function editorMapa(aj) {
  const mapa = aj.mapas[mapaVisto] || aj.mapas[Mapas.MAPA_NORMAL];
  const fila = c => mapa.propio ? `
    <div class="risk-cont-editar">
      <input class="risk-simbolo" data-campo="simbolo" data-cont="${c.id}" value="${esc(c.simbolo)}" aria-label="Símbolo">
      <input class="risk-nombre" data-campo="nombre" data-cont="${c.id}" value="${esc(c.nombre)}" aria-label="Nombre del continente">
      ${bono(c)}
      <button class="boton-icono risk-quitar-cont" data-ui="quitar-continente" data-cont="${c.id}" aria-label="Quitar ${esc(c.nombre)}">✕</button>
    </div>` : `
    <div class="risk-cont-editar"><span class="risk-cont-nombre">${c.simbolo} ${esc(c.nombre)}</span>${bono(c)}</div>`;
  const bono = c => `
    <div class="ajuste-paso risk-bono">
      <button class="boton-icono" data-numero="bono" data-cont="${c.id}" data-paso="-1" aria-label="Menos tropas">−</button>
      <span><b>${c.bono}</b></span>
      <button class="boton-icono" data-numero="bono" data-cont="${c.id}" data-paso="1" aria-label="Más tropas">+</button>
    </div>`;
  return `
    ${mapa.propio ? `<input class="risk-nombre risk-nombre-mapa" data-campo="nombre-mapa" value="${esc(mapa.nombre)}" aria-label="Nombre del mapa">` : ''}
    <p class="ajustes-desc">Tropas que da cada continente al conquistarlo (×1); luego se multiplican por los turnos que se sostiene.</p>
    ${mapa.continentes.map(fila).join('') || '<p class="ajustes-desc">Aún no tiene continentes.</p>'}
    ${mapa.propio ? `
      <button class="boton boton--secundario risk-ancho" data-ui="agregar-continente">＋ Agregar continente</button>
      <button class="boton boton--texto risk-ancho" data-ui="borrar-mapa" data-id="${mapaVisto}">🗑 Borrar este mapa</button>` : ''}`;
}

export function pintarAjustes() {
  if (!panel || panel.hidden) return;
  const aj = almacen.ajustes;
  const ui = Musa.ui;
  const enJuego = almacen.partida && almacen.partida.mapa !== aj.mapa;
  panel.querySelector('.catalogo-cuerpo').innerHTML = `
    <section class="ajuste">
      <h3 class="catalogo-subtitulo">Partida</h3>
      <div class="ajuste-titulo">Tropas por turno</div>${ui.numero(aj.tropas, 'tropas', 'tropas', 'Tropas por turno')}
      <div class="ajuste-titulo">Rondas</div>${ui.numero(aj.rondas, 'rondas', 'rondas', 'Rondas')}
      <p class="ajustes-desc">Ahora: ${aj.rondas} rondas (el reglamento sugiere de 6 a 9).</p>
      <div class="ajuste-titulo">Máximo de cartas por turno</div>${ui.numero(aj.maxCartas, 'maxCartas', 'cartas', 'Máximo de cartas por turno')}
      <p class="ajustes-desc">Por territorios conquistados: 1 → 1 carta, 2 → 2… hasta este máximo.</p>
    </section>
    <section class="ajuste">
      <h3 class="catalogo-subtitulo">Tiempos</h3>
      <div class="ajuste-titulo">Turno normal</div>${ui.tiempo(aj.turno, 'turno')}
      <div class="ajuste-titulo">Cuenta para el siguiente equipo</div>${ui.numero(aj.cuenta, 'cuenta', 'segundos', 'Cuenta entre turnos')}
      <div class="ajuste-titulo">Tiempo extra al equipo anterior</div>${ui.numero(aj.prorroga, 'prorroga', 'segundos', 'Tiempo extra al equipo anterior')}
      <p class="ajustes-desc">El botón de la cuenta regresiva para darle unos segundos más al que acaba de jugar.</p>
    </section>
    <section class="ajuste">
      <h3 class="catalogo-subtitulo">⚡ Poderes</h3>
      <div class="ajuste-titulo">Costo de un líder</div>${ui.numero(aj.costoLider, 'costoLider', 'unidades', 'Costo de un líder')}
      <div class="ajuste-titulo">Líderes por equipo</div>${ui.numero(aj.maxLideres, 'maxLideres', 'como máximo', 'Líderes por equipo')}
    </section>
    <section class="ajuste">
      <h3 class="catalogo-subtitulo">🗺️ Mapa y continentes</h3>
      <div class="chips risk-mapas">
        ${Object.entries(aj.mapas).map(([id, m]) => `<button class="chip ${id === aj.mapa ? 'chip--activo' : ''}" data-mapa="${id}">${esc(m.nombre)}</button>`).join('')}
        <button class="chip" data-ui="nuevo-mapa">＋ Nuevo mapa</button>
      </div>
      ${enJuego ? '<p class="ajustes-desc">La partida en curso sigue con su mapa; este se usa en la próxima.</p>' : ''}
      ${editorMapa(aj)}
    </section>
    <section class="ajuste">
      <h3 class="catalogo-subtitulo">🎨 Aspecto</h3>
      <div class="ajuste-titulo">Emblema de cada equipo</div>
      <div class="chips">
        ${ESTILOS.map(([id, nombre]) => `<button class="chip ${id === aj.emblema ? 'chip--activo' : ''}" data-emblema="${id}">${nombre}</button>`).join('')}
      </div>
      <div class="risk-muestra-emblemas" aria-hidden="true">${MUESTRA.map(id => emblema({ id }, 34)).join('')}</div>
      <div class="ajuste-titulo">Imagen del bando de fondo</div>
      <div class="chips">
        ${FONDOS.map(([id, nombre]) => `<button class="chip ${id === aj.fondo ? 'chip--activo' : ''}" data-fondo="${id}">${nombre}</button>`).join('')}
      </div>
      <p class="ajustes-desc">La imagen del equipo en turno, teñida con su color. Más suave se lee mejor en el sol.</p>
    </section>
    <section class="ajuste">
      <h3 class="catalogo-subtitulo">Reloj</h3>
      <div class="ajuste-titulo">Cómo se ve el tiempo</div>
      <div class="chips">${Musa.reloj.VISTAS.map(v => `<button class="chip ${v.id === aj.vista ? 'chip--activo' : ''}" data-vista="${v.id}">${v.nombre}</button>`).join('')}</div>
      ${ui.interruptor(aj.sonido, 'sonido', 'Campanita y tics', 'Campanita al acabar el tiempo y tic en la cuenta entre turnos.')}
      ${ui.interruptor(aj.tictac, 'tictac', 'Tic-tac en los últimos 10 s', 'Para que se sienta la urgencia.')}
      ${ui.interruptor(aj.vibrar, 'vibrar', 'Vibrar', 'Solo en Android: el iPhone no deja vibrar desde una web.')}
    </section>
    <section class="ajuste risk-ajuste-botones">
      <button class="boton boton--secundario" data-ui="escuela">🎓 Cómo se juega</button>
      ${almacen.partida ? '<button class="boton boton--secundario" data-ui="nueva">✦ Nueva partida</button>' : ''}
    </section>`;
}
