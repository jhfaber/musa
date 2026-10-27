// Dixit: cada ronda propone una categoría para inspirar la pista y, según el nivel, lentes que la acompañan.
// Los lentes son pistas extra en paralelo: describen la carta o modifican la categoría o al otro lente.
(() => {
  const CLAVE = 'musa.dixit.v2';
  const NIVELES = [
    { id: 'tranquilo', nombre: 'Tranquilo', lentes: 0, salto: 0, desc: 'Solo la categoría.' },
    { id: 'normal', nombre: 'Normal', lentes: 1, salto: 0.3, desc: 'La categoría y un lente.' },
    { id: 'caotico', nombre: 'Caótico', lentes: 2, salto: 0.6, desc: 'La categoría y dos lentes.' }
  ];
  const SIN_REPETIR = 3;   // una categoría no vuelve hasta que pasen 3 rondas
  const MAX_SEGUIDAS = 4;  // un lente cambia de familia después de 4 seguidos

  let categorias = [];
  let lentes = [];         // planos, cada uno con su familia
  let estado = null;
  let contenedor = null;

  const azar = lista => lista[Math.floor(Math.random() * lista.length)];
  const categoria = id => categorias.find(c => c.id === id);
  const lente = id => lentes.find(l => l.id === id);
  const nivel = () => NIVELES.find(n => n.id === estado.nivel);

  function estadoNuevo(nivelId = 'normal') {
    return { historial: [], indice: -1, nivel: nivelId };
  }

  function cargarEstado() {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE));
      if (guardado && Array.isArray(guardado.historial)) return guardado;
    } catch (e) { /* sin almacenamiento: partida en memoria */ }
    return estadoNuevo();
  }

  function guardarEstado() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* ignorar */ }
  }

  // Cada categoría lista los lentes que le cuadran (lentes_permitidos); los demás nunca le salen.
  const choca = (c, l) => !c.lentes_permitidos.includes(l.id);

  // Rondas anteriores a la posición `hasta` (sin incluirla)
  const anteriores = hasta => estado.historial.slice(0, hasta);

  // Una categoría sale en los niveles que lista (niveles); si no lista ninguno, sale en todos
  const saleEn = (c, n) => !c.niveles || c.niveles.includes(n.id);

  function elegirCategoria(hasta) {
    const recientes = anteriores(hasta).slice(-SIN_REPETIR).map(r => r.categoria);
    const opciones = categorias.filter(c => !recientes.includes(c.id) && saleEn(c, nivel()));
    return azar(opciones);
  }

  // Sigue la familia del último lente usado o salta a otra; nunca repite familia en la misma ronda.
  // Con soloFamilia se limita a una familia (el lente principal de la categoría, p. ej. una escala).
  function elegirLente(c, enRonda, hasta, soloFamilia = null) {
    const familiasRonda = enRonda.map(id => lente(id).familia.id);
    const usados = anteriores(hasta).flatMap(r => r.lentes);
    const ultima = usados.length ? lente(usados[usados.length - 1]).familia.id : null;
    let racha = 0;
    for (let i = usados.length - 1; i >= 0 && lente(usados[i]).familia.id === ultima; i--) racha++;

    const validos = lentes.filter(l => !choca(c, l) && !familiasRonda.includes(l.familia.id) &&
      (!soloFamilia || l.familia.id === soloFamilia));
    if (!validos.length) return null;
    const recientes = usados.slice(-lentes.length + 2);
    const libres = validos.filter(l => !recientes.includes(l.id));
    const opciones = libres.length ? libres : validos;
    if (ultima && !familiasRonda.includes(ultima) && racha < MAX_SEGUIDAS && Math.random() >= nivel().salto) {
      const misma = opciones.filter(l => l.familia.id === ultima);
      if (misma.length) return azar(misma);
    }
    const otras = opciones.filter(l => l.familia.id !== ultima);
    return azar(otras.length ? otras : opciones);
  }

  // Cuántos lentes lleva una categoría en el nivel actual: los del nivel, o más si la categoría lo exige
  // (min_lentes). En Tranquilo no hay lentes. Las marcadas sin_lentes van siempre solas.
  const lentesEnNivel = (c, n = nivel()) => (n.lentes && !c.sin_lentes ? Math.max(n.lentes, c.min_lentes || 0) : 0);

  // El primer lente sale de la familia principal de la categoría si la tiene (las "Si la carta fuera…" usan una escala)
  function lentesPara(c, hasta) {
    const lista = [];
    while (lista.length < lentesEnNivel(c)) {
      const principal = !lista.length && c.lente_principal ? c.lente_principal : null;
      const l = elegirLente(c, lista, hasta, principal);
      if (!l) break;
      lista.push(l.id);
    }
    return lista;
  }

  function armarRonda(hasta) {
    const c = elegirCategoria(hasta);
    return { categoria: c.id, lentes: lentesPara(c, hasta) };
  }

  function nuevaRonda() {
    estado.historial.push(armarRonda(estado.historial.length));
    estado.indice = estado.historial.length - 1;
    guardarEstado();
    pintar(true);
  }

  function otraCategoria() {
    estado.historial[estado.indice] = armarRonda(estado.indice);
    guardarEstado();
    pintar(true);
  }

  function otrosLentes() {
    const ronda = estado.historial[estado.indice];
    ronda.lentes = lentesPara(categoria(ronda.categoria), estado.indice);
    guardarEstado();
    pintar(false);
  }

  function mover(paso) {
    estado.indice = Math.max(0, Math.min(estado.historial.length - 1, estado.indice + paso));
    guardarEstado();
    pintar(false);
  }

  function nuevaPartida() {
    if (estado.historial.length && !confirm('¿Empezar una partida nueva? Se borran las rondas jugadas.')) return;
    estado = estadoNuevo(estado.nivel);
    guardarEstado();
    pintar(false);
  }

  // Al cambiar de nivel se reparte de una vez la carta con el nivel nuevo: reemplaza la ronda actual
  // (para no llenar el historial de rondas que nadie jugó) o crea la primera si la partida está vacía.
  function cambiarNivel(id) {
    if (id === estado.nivel) return;
    estado.nivel = id;
    if (!estado.historial.length) return nuevaRonda();
    estado.indice = estado.historial.length - 1;
    otraCategoria();
  }

  const ejemplos = lista => lista.map(e => `<em>${e}</em>`).join('');

  function pintarCarta() {
    const ronda = estado.historial[estado.indice];
    if (!ronda) {
      return `
        <div class="carta carta--dorso">
          <div class="carta-dorso-arte" aria-hidden="true">☾</div>
          <p class="carta-dorso-texto">Toca <b>Nueva ronda</b><br>para conocer la categoría de la pista</p>
        </div>`;
    }
    const c = categoria(ronda.categoria);
    const fichas = ronda.lentes.map(id => {
      const l = lente(id);
      return `
        <div class="lente">
          <div class="lente-simbolo" aria-hidden="true">${l.familia.simbolo}</div>
          <div class="lente-texto">
            <div class="lente-cabeza">Lente · ${l.familia.nombre}</div>
            <h4 class="lente-titulo">${l.titulo}</h4>
            <p class="lente-descripcion">${l.descripcion || l.familia.descripcion}</p>
            <p class="lente-ejemplos">${ejemplos(l.ejemplos)}</p>
          </div>
        </div>`;
    }).join('<div class="sello" aria-hidden="true">✕</div>');
    return `
      <div class="carta">
        <div class="carta-cadena">Categoría <span class="reto">Reto +${1 + ronda.lentes.length}</span></div>
        <div class="carta-simbolo" aria-hidden="true">${c.simbolo}</div>
        <h3 class="carta-titulo">${c.nombre}</h3>
        <p class="carta-descripcion">${c.descripcion}</p>
        ${c.relacionado ? '<p class="carta-aviso">No vale lo que se ve en la carta</p>' : ''}
        <p class="carta-ejemplo"><span>Ejemplos</span>${ejemplos(c.ejemplos)}</p>
      </div>
      ${fichas ? `<div class="sello" aria-hidden="true">✕</div>${fichas}` : ''}`;
  }

  function pintar(animar) {
    const hay = estado.historial.length > 0;
    const enUltima = estado.indice === estado.historial.length - 1;
    const total = estado.historial.length;
    const ronda = estado.historial[estado.indice];
    contenedor.innerHTML = `
      <div class="dixit">
        <div class="ronda">${hay ? `Ronda ${estado.indice + 1}${enUltima ? '' : ` de ${total}`}` : 'Nueva partida'}</div>
        <div class="mesa ${animar ? 'mesa--girar' : ''}">${pintarCarta()}</div>

        <div class="controles">
          <button class="boton-icono boton-redondo" data-accion="atras" ${estado.indice > 0 ? '' : 'disabled'} aria-label="Ronda anterior">‹</button>
          ${enUltima
            ? `<button class="boton boton--principal" data-accion="nueva">✦ Nueva ronda</button>`
            : `<button class="boton boton--principal" data-accion="ultima">Volver a la ronda ${total}</button>`}
          <button class="boton-icono boton-redondo" data-accion="adelante" ${enUltima ? 'disabled' : ''} aria-label="Ronda siguiente">›</button>
        </div>
        ${hay && enUltima ? `
          <div class="cambios">
            <button class="boton boton--texto" data-accion="otra">↻ Otra categoría</button>
            ${ronda.lentes.length ? '<button class="boton boton--texto" data-accion="lentes">↻ Otros lentes</button>' : ''}
          </div>` : ''}

        <section class="ajustes">
          <div class="ajustes-titulo">Nivel</div>
          <div class="chips" role="radiogroup" aria-label="Nivel de dificultad">
            ${NIVELES.map(n => `
              <button class="chip ${n.id === estado.nivel ? 'chip--activo' : ''}" role="radio"
                aria-checked="${n.id === estado.nivel}" data-nivel="${n.id}">${n.nombre}</button>`).join('')}
          </div>
          <p class="ajustes-desc">${nivel().desc}</p>
          <button class="boton boton--texto" data-accion="partida">Nueva partida</button>
        </section>

        <details class="como-jugar">
          <summary>¿Cómo se usa?</summary>
          <p>Al empezar cada ronda, el narrador toca <b>Nueva ronda</b>. La <b>categoría</b> dice por dónde buscar la pista,
          no qué decir. En Normal y Caótico llegan <b>lentes</b>: pistas extra que pueden describir la carta o cambiar la categoría.
          En un desierto, <i>Emociones</i> puede ser "desolación" y <i>Lo contrario</i> "un bosque".</p>
          <p>Reto opcional: si el narrador usa la categoría gana +1, y +1 más por cada lente, aunque nadie adivine. La mesa decide si lo cumplió.</p>
        </details>
      </div>`;

    contenedor.onclick = evento => {
      const boton = evento.target.closest('button');
      if (!boton) return;
      if (boton.dataset.nivel) return cambiarNivel(boton.dataset.nivel);
      const acciones = {
        nueva: nuevaRonda,
        otra: otraCategoria,
        lentes: otrosLentes,
        atras: () => mover(-1),
        adelante: () => mover(1),
        ultima: () => mover(Infinity),
        partida: nuevaPartida
      };
      const accion = acciones[boton.dataset.accion];
      if (accion) accion();
    };
  }

  // ---------- Catálogo (menú ☰): qué categorías y lentes hay en cada nivel ----------

  // Categorías que pueden salir en un nivel
  const categoriasDe = n => categorias.filter(c => saleEn(c, n));
  // Lentes que pueden acompañar a una categoría (mismas reglas que al repartir)
  const lentesPosibles = c => lentes.filter(l => !choca(c, l));

  let panel = null;

  function pintarCatalogo(nivelId) {
    const n = NIVELES.find(x => x.id === nivelId);
    const lista = categoriasDe(n);
    const filas = lista.map(c => {
      const posibles = lentesPosibles(c);
      const porFamilia = [...new Set(posibles.map(l => l.familia))].map(f =>
        `<span class="cat-familia"><b>${f.simbolo}</b> ${posibles.filter(l => l.familia === f).map(l => l.titulo).join(', ')}</span>`).join('');
      return `
        <tr>
          <th scope="row"><span class="cat-simbolo">${c.simbolo}</span> ${c.nombre}
            ${n.lentes && c.sin_lentes ? '<small class="cat-nivel">Siempre sola</small>'
              : n.lentes && c.min_lentes > n.lentes ? `<small class="cat-nivel">Siempre ${c.min_lentes} lentes</small>`
              : n.lentes && !saleEn(c, NIVELES[0]) ? '<small class="cat-nivel">No sale en Tranquilo</small>' : ''}
            ${c.relacionado ? '<small class="cat-marca">No vale lo que se ve</small>' : ''}</th>
          ${n.lentes ? `<td>${porFamilia || '<span class="cat-desc">Sin lentes: se explica sola</span>'}</td>` : `<td class="cat-desc">${c.descripcion}</td>`}
        </tr>`;
    }).join('');
    const familias = [...new Set(lentes.map(l => l.familia))];
    panel.querySelector('.catalogo-cuerpo').innerHTML = `
      <p class="catalogo-resumen"><b>${lista.length} categorías</b> · ${n.lentes ? `${n.lentes === 1 ? 'un lente' : 'dos lentes de familias distintas'} por ronda` : 'sin lentes'}</p>
      <table class="catalogo-tabla">
        <thead><tr><th>Categoría</th><th>${n.lentes ? 'Lentes posibles' : 'De qué se trata'}</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>
      ${n.lentes ? `
        <h3 class="catalogo-subtitulo">Todos los lentes</h3>
        <table class="catalogo-tabla">
          <thead><tr><th>Lente</th><th>Ejemplos</th></tr></thead>
          <tbody>${familias.map(f => f.lentes.map(l => `
            <tr><th scope="row"><span class="cat-simbolo">${f.simbolo}</span> ${l.titulo}<small class="cat-familia-nombre">${f.nombre}</small></th>
              <td class="cat-desc">${(l.ejemplos || []).join(' · ')}</td></tr>`).join('')).join('')}
          </tbody>
        </table>` : ''}`;
    panel.querySelectorAll('[data-catalogo]').forEach(b => {
      b.classList.toggle('chip--activo', b.dataset.catalogo === nivelId);
      b.setAttribute('aria-selected', b.dataset.catalogo === nivelId);
    });
  }

  function abrirCatalogo() {
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'catalogo';
      panel.hidden = true;
      panel.innerHTML = `
        <div class="catalogo-fondo" data-cerrar></div>
        <aside class="catalogo-panel" role="dialog" aria-modal="true" aria-label="Categorías y lentes por nivel">
          <header class="catalogo-cabeza">
            <h2>Categorías por nivel</h2>
            <button class="boton-icono" data-cerrar aria-label="Cerrar">✕</button>
          </header>
          <div class="chips" role="tablist">
            ${NIVELES.map(x => `<button class="chip" role="tab" data-catalogo="${x.id}">${x.nombre}</button>`).join('')}
          </div>
          <div class="catalogo-cuerpo"></div>
        </aside>`;
      document.body.appendChild(panel);
      panel.addEventListener('click', e => {
        if (e.target.closest('[data-cerrar]')) return cerrarCatalogo();
        const b = e.target.closest('[data-catalogo]');
        if (b) pintarCatalogo(b.dataset.catalogo);
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) cerrarCatalogo(); });
    }
    pintarCatalogo(estado.nivel);
    panel.hidden = false;
    document.body.classList.add('sin-scroll');
    panel.querySelector('[data-cerrar].boton-icono').focus();
  }

  function cerrarCatalogo() {
    panel.hidden = true;
    document.body.classList.remove('sin-scroll');
  }

  async function abrir(elemento, accion) {
    contenedor = elemento;
    if (accion) {
      accion.innerHTML = '<button class="boton-icono" aria-label="Ver categorías y lentes por nivel">☰</button>';
      accion.querySelector('button').onclick = abrirCatalogo;
    }
    if (!categorias.length) {
      const datos = await (await fetch('juegos/dixit/categorias.json')).json();
      categorias = datos.categorias;
      lentes = datos.lentes.flatMap(familia => familia.lentes.map(l => ({ ...l, familia })));
    }
    estado = estado || limpiarEstado(cargarEstado());
    pintar(false);
  }

  // Una partida guardada puede traer categorías o lentes que ya no existen (p. ej. "Historias"): se descartan
  function limpiarEstado(guardado) {
    guardado.historial = guardado.historial
      .filter(r => categoria(r.categoria))
      .map(r => ({ ...r, lentes: (r.lentes || []).filter(id => lente(id)) }));
    guardado.indice = Math.min(guardado.indice, guardado.historial.length - 1);
    if (!NIVELES.some(n => n.id === guardado.nivel)) guardado.nivel = 'normal';
    return guardado;
  }

  Musa.registrar({
    id: 'dixit',
    nombre: 'Dixit',
    simbolo: '🌙',
    descripcion: 'Una categoría y lentes para inspirar las pistas',
    abrir
  });
})();
