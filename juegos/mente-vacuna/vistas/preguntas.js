// Mente Vacuna · pantalla de preguntas. Pinta el estado y traduce cada toque en una llamada al núcleo (logica/bolsa.js):
// toque → función pura → guardar → pintar. Aquí no se decide qué pregunta sale; eso lo hace la bolsa.
import * as B from '../logica/bolsa.js';
import * as almacen from '../almacen.js';
import * as efectos from '../efectos.js';

const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const DESLIZAR = 60; // px para que un deslizamiento sobre la tarjeta cuente

export function montarPreguntas(raiz, banco) {
  const items = B.aplanar(banco);
  const categoria = id => banco.categorias.find(c => c.id === id);
  let estado = B.limpiar(almacen.cargar(), banco);
  let temporizadorAviso = null;
  // Ya salieron todas las de las categorías elegidas: no se repite ninguna hasta que se toque Reiniciar
  let agotadas = false;

  raiz.innerHTML = `
    <div class="mv-filtro">
      <button class="mv-filtro-boton" data-accion="filtro" aria-expanded="false" aria-controls="mv-cats">
        <span class="mv-filtro-titulo">Categorías</span>
        <span class="mv-filtro-resumen"></span>
        <span class="mv-filtro-flecha" aria-hidden="true">▾</span>
      </button>
      <div class="mv-cats" id="mv-cats" role="group" aria-label="Categorías" hidden></div>
    </div>
    <div class="mv-cuenta"><span class="mv-cuenta-cat"></span><span class="mv-cuenta-num"></span></div>
    <div class="mv-mesa">
      <article class="mv-carta" aria-live="polite" aria-atomic="true"></article>
      <div class="mv-hoja" hidden></div>
    </div>
    <p class="mv-aviso" role="status" hidden></p>
    <div class="mv-extra">
      <button class="boton boton--secundario mv-reiniciar" data-accion="barajar">↺ Reiniciar: que vuelvan a salir todas</button>
    </div>
    <div class="controles">
      <button class="boton-icono boton-redondo" data-accion="anterior" aria-label="Pregunta anterior">‹</button>
      <button class="boton boton--principal" data-accion="nueva">Nueva pregunta</button>
      <button class="boton-icono boton-redondo" data-accion="descartar" aria-label="No me gusta: no volver a mostrarla">✕</button>
    </div>`;

  const $ = sel => raiz.querySelector(sel);
  const carta = $('.mv-carta');
  const hoja = $('.mv-hoja');

  // ---------- Acciones: cada una pasa por el núcleo y termina en cambiar() ----------

  function cambiar(nuevo, { animar = false } = {}) {
    estado = nuevo;
    almacen.guardar(estado);
    pintar(animar);
  }

  function nueva({ vibrar = true } = {}) {
    const { total, quedan } = B.conteo(estado, items);
    if (total && !quedan) { agotadas = true; pintar(); return; }
    agotadas = false;
    const r = B.sacar(estado, items, Math.random);
    cambiar(r.estado, { animar: !!r.item });
    if (r.item && vibrar) efectos.vibrar();
  }

  const ACCIONES = {
    nueva: () => nueva(),
    anterior: () => { if (B.hayAnterior(estado)) { agotadas = false; cambiar(B.anterior(estado), { animar: true }); } },
    descartar: () => {
      if (!B.actual(estado, items)) return;
      estado = B.descartar(estado);
      nueva();
      avisar('Listo: esa no vuelve a salir');
    },
    barajar: () => { estado = B.barajar(estado); agotadas = false; nueva(); avisar('↺ Listo: todas las preguntas vuelven a salir'); },
    recuperar: () => { estado = B.recuperarDescartadas(estado); nueva(); },
    todas: () => cambiarCategorias(B.alternarTodas(estado, banco)),
    filtro: () => abrirFiltro($('.mv-cats').hidden),
    'adultos-si': () => { hoja.hidden = true; cambiarCategorias(B.alternar(estado, hoja.dataset.categoria)); },
    'adultos-no': () => { hoja.hidden = true; },
  };

  // Al cambiar categorías: si la pregunta de la tarjeta ya no es de las activas, sale una de las que quedan
  function cambiarCategorias(nuevo) {
    estado = nuevo;
    agotadas = false;
    if (!B.actual(estado, items) && estado.activas.length) nueva({ vibrar: false });
    else cambiar(estado);
  }

  function tocarCategoria(id) {
    const c = categoria(id);
    if (c.adultos && !estado.activas.includes(id)) return pedirConfirmacion(c);
    cambiarCategorias(B.alternar(estado, id));
  }

  function pedirConfirmacion(c) {
    hoja.dataset.categoria = c.id;
    hoja.style.setProperty('--acento', c.acento);
    hoja.innerHTML = `
      <div class="mv-hoja-caja" role="dialog" aria-modal="true" aria-labelledby="mv-hoja-titulo">
        <div class="mv-emoji" aria-hidden="true">${esc(c.emoji)}</div>
        <h3 id="mv-hoja-titulo">${esc(c.nombre)} es para mayores de 18</h3>
        <p>${esc(c.descripcion)}. ¿Todos en la mesa son mayores de edad?</p>
        <button class="boton boton--principal" data-accion="adultos-si">Sí, activar</button>
        <button class="boton boton--texto" data-accion="adultos-no">Mejor no</button>
      </div>`;
    hoja.hidden = false;
    hoja.querySelector('[data-accion="adultos-no"]').focus();
  }

  // Panel de categorías: cerrado muestra un resumen; abierto, todas las categorías en varias filas
  function abrirFiltro(abrir) {
    $('.mv-cats').hidden = !abrir;
    $('[data-accion="filtro"]').setAttribute('aria-expanded', abrir ? 'true' : 'false');
  }

  function avisar(texto) {
    const aviso = $('.mv-aviso');
    aviso.textContent = texto;
    aviso.hidden = false;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => { aviso.hidden = true; }, 2200);
  }

  // ---------- Pintar ----------

  function pintarCategorias() {
    const todas = B.todasActivas(estado, banco);
    $('.mv-cats').innerHTML = `
      <button class="mv-cat mv-cat--todas" data-accion="todas">${todas ? '✕ Quitar todas' : '✨ Todas'}</button>
      ${banco.categorias.map(c => `
        <button class="mv-cat${c.adultos ? ' mv-cat--adultos' : ''}" data-categoria="${esc(c.id)}"
          aria-pressed="${estado.activas.includes(c.id)}" style="--c:${esc(c.acento)}"
          aria-label="${esc(c.nombre)}, ${c.preguntas.length} preguntas${c.adultos ? ', solo mayores de 18' : ''}">
          <span aria-hidden="true">${esc(c.emoji)}</span>${esc(c.nombre)}
          <small class="mv-cat-n" aria-hidden="true">${c.adultos ? '+18 · ' : ''}${c.preguntas.length}</small>
        </button>`).join('')}`;
    const activas = banco.categorias.filter(c => estado.activas.includes(c.id));
    $('.mv-filtro-resumen').innerHTML = !activas.length ? 'Ninguna'
      : todas && activas.length === banco.categorias.filter(c => !c.adultos).length ? 'Todas'
      : `<span aria-hidden="true">${activas.slice(0, 6).map(c => esc(c.emoji)).join('')}${activas.length > 6 ? '…' : ''}</span> ${activas.length} de ${banco.categorias.length}`;
  }

  function pintarCarta(animar) {
    if (agotadas) {
      raiz.style.removeProperty('--acento');
      carta.innerHTML = `
        <div class="mv-vacia"><div class="mv-emoji" aria-hidden="true">🎉</div>
          <p class="mv-pregunta">Ya salieron todas las preguntas de estas categorías</p></div>
        <button class="boton boton--principal mv-recuperar" data-accion="barajar">↺ Reiniciar</button>`;
      return;
    }
    const item = B.actual(estado, items);
    if (!item) {
      raiz.style.removeProperty('--acento');
      const { total } = B.conteo(estado, items);
      carta.innerHTML = !estado.activas.length
        ? `<div class="mv-vacia"><div class="mv-emoji" aria-hidden="true">🐮</div><p class="mv-pregunta">Elige al menos una categoría</p></div>
           <div class="mv-pista"><span>Cómo empezar</span>Abre «Categorías» arriba y toca las que quieras, o «✨ Todas».</div>`
        : total
        ? `<div class="mv-vacia"><div class="mv-emoji" aria-hidden="true">🐮</div><p class="mv-pregunta">¿Listos para pensar como el rebaño?</p></div>
           <div class="mv-pista"><span>Cómo se juega</span>Cada uno escribe su respuesta en secreto y luego todos la muestran a la vez.</div>`
        : `<div class="mv-vacia"><div class="mv-emoji" aria-hidden="true">🙈</div><p class="mv-pregunta">Descartaste todas las preguntas de estas categorías.</p></div>
           <button class="boton boton--secundario mv-recuperar" data-accion="recuperar">Devolverlas a la bolsa</button>`;
      return;
    }
    const c = categoria(item.c);
    raiz.style.setProperty('--acento', c.acento);
    carta.innerHTML = `
      <div class="mv-insignia">
        <div class="mv-emoji" aria-hidden="true">${esc(c.emoji)}</div>
        <div class="mv-etiqueta">${esc(c.nombre)}</div>
      </div>
      <div class="mv-centro">
        <p class="mv-pregunta${item.q.length > 70 || item.opciones.length ? ' mv-pregunta--larga' : ''}">${esc(item.q)}</p>
        ${item.opciones.length ? `<ol class="mv-opciones">${item.opciones.map((o, i) => `
          <li><span class="mv-opcion-letra" aria-hidden="true">${'ABCD'[i]}</span>${esc(o)}</li>`).join('')}</ol>` : ''}
        ${item.no.length ? `<p class="mv-prohibido"><span aria-hidden="true">🚫</span> No vale: <b>${item.no.map(esc).join(', ')}</b></p>` : ''}
      </div>
      <div class="mv-pista"><span>Cómo responder</span>${esc(c.pista)}</div>`;
    if (animar && !efectos.menosMovimiento()) {
      carta.classList.remove('mv-carta--entra');
      void carta.offsetWidth; // reinicia la animación
      carta.classList.add('mv-carta--entra');
    }
  }

  function pintar(animar = false) {
    pintarCategorias();
    pintarCarta(animar);
    const item = B.actual(estado, items);
    const { total, quedan } = B.conteo(estado, items);
    $('.mv-cuenta-cat').textContent = item ? `${categoria(item.c).emoji} ${categoria(item.c).nombre}` : '';
    const n = estado.activas.length;
    // Baja con cada pregunta nueva: así se ve que no se repiten
    $('.mv-cuenta-num').innerHTML = !n ? 'Ninguna categoría elegida'
      : `Quedan <b>${quedan}</b> de ${total}`;
    $('.mv-extra').hidden = !n;
    $('[data-accion="anterior"]').disabled = !B.hayAnterior(estado) || !n;
    $('[data-accion="descartar"]').disabled = !item || agotadas;
    $('[data-accion="nueva"]').disabled = !total || agotadas;
  }

  // ---------- Eventos ----------

  raiz.addEventListener('click', evento => {
    const boton = evento.target.closest('button');
    if (!boton || !raiz.contains(boton)) return;
    if (boton.dataset.categoria) return tocarCategoria(boton.dataset.categoria);
    ACCIONES[boton.dataset.accion]?.();
  });

  raiz.addEventListener('keydown', evento => {
    if (evento.key === 'Escape' && !hoja.hidden) ACCIONES['adultos-no']();
  });

  // Deslizar la tarjeta: a la izquierda, nueva pregunta; a la derecha, la anterior
  let inicioX = null;
  carta.addEventListener('pointerdown', e => { inicioX = e.clientX; });
  carta.addEventListener('pointerup', e => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    if (dx < -DESLIZAR) ACCIONES.nueva();
    else if (dx > DESLIZAR) ACCIONES.anterior();
  });
  carta.addEventListener('pointercancel', () => { inicioX = null; });

  // Primera vez: ya hay una pregunta esperando
  if (!B.actual(estado, items) && estado.activas.length) nueva({ vibrar: false });
  else pintar();
  if (!estado.activas.length) abrirFiltro(true);
}
