// Musa: navegación entre el inicio y cada juego, carga de los juegos (juegos/juegos.json) e instalación como app.
const Musa = (() => {
  const juegos = [];
  let orden = [];
  let categorias = [];              // tipos de juego (spec 011), de juegos.json
  const categoriasDe = {};          // id del juego → sus categorías
  // Portada en dos niveles (spec 011): #  → tarjetas de categorías;  #c/<id> → juegos de esa categoría
  // (#c/todos = todos los juegos);  #<juego> → el juego. Así el botón atrás del celular funciona solo.
  const RUTA_CATEGORIA = 'c/';
  let vistaInicio = '';             // última vista de la portada, para que ← del juego vuelva ahí

  function registrar(juego) {
    juegos.push(juego);
    juegos.sort((a, b) => orden.indexOf(a.id) - orden.indexOf(b.id));
  }

  // Cada juego trae su CSS y su JS en juegos/<id>/; se cargan en el orden de juegos.json.
  // Con "entrada", el juego es un módulo ES: se carga ese archivo y él importa los demás.
  function cargarArchivo(ruta, modulo = false) {
    return new Promise((listo, fallo) => {
      const css = ruta.endsWith('.css');
      const el = document.createElement(css ? 'link' : 'script');
      if (css) { el.rel = 'stylesheet'; el.href = ruta; } else { el.src = ruta; if (modulo) el.type = 'module'; }
      el.onload = listo;
      el.onerror = fallo;
      document.head.appendChild(el);
    });
  }

  async function cargarJuegos() {
    const datos = await (await fetch('juegos/juegos.json')).json();
    const lista = datos.juegos;
    categorias = datos.categorias ?? [];
    orden = lista.map(j => j.id);
    for (const juego of lista) {
      categoriasDe[juego.id] = juego.categorias ?? [];
      // Juegos de solo reglas: sin JS propio. La lista sale de juegos.json y el visor común (comun/reglas.js)
      // lee juegos/<id>/reglas.json al abrir.
      if (juego.tipo === 'reglas') {
        registrar({
          id: juego.id,
          nombre: juego.nombre,
          simbolo: juego.simbolo,
          descripcion: juego.descripcion,
          abrir: contenedor => Musa.reglas.abrir(juego, contenedor)
        });
        continue;
      }
      const propios = juego.entrada
        ? [...juego.archivos.filter(a => a.endsWith('.css')), juego.entrada]
        : juego.archivos.filter(a => /\.(css|js)$/.test(a));
      for (const archivo of propios) await cargarArchivo(`juegos/${juego.id}/${archivo}`, archivo === juego.entrada);
    }
  }

  // Los juegos con sus categorías (los que tienen JS propio se registran solos, sin ellas)
  const juegosConCategorias = () => juegos.map(j => ({ ...j, categorias: categoriasDe[j.id] ?? [] }));
  const categoria = id => categorias.find(c => c.id === id);
  const aparte = () => categorias.filter(c => c.aparte).map(c => c.id);   // categorías que no entran en "Todos"
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // La categoría que pide la ruta: un id, 'todos', o null si se está en las tarjetas de categorías
  function categoriaDeRuta() {
    const ruta = location.hash.slice(1);
    if (!ruta.startsWith(RUTA_CATEGORIA)) return null;
    const id = ruta.slice(RUTA_CATEGORIA.length);
    return id === 'todos' || categoria(id) ? id : null;
  }

  // Se arma una sola vez: 🎲, 🔍, tarjetas de categorías, cabecera de categoría y la lista de juegos
  function pintarLista() {
    const lista = document.getElementById('lista-juegos');
    const todos = juegosConCategorias();

    const azar = document.createElement('button');
    azar.id = 'boton-azar';
    azar.className = 'boton boton--secundario azar-boton';
    azar.textContent = '🎲 Elegir un juego al azar';
    azar.onclick = () => {
      const actual = categoriaDeRuta();
      Musa.azar.abrir(juegosConCategorias(), categorias, actual && actual !== 'todos' ? actual : null);
    };

    const buscador = document.createElement('div');
    buscador.className = 'buscador';
    buscador.innerHTML = `
      <span class="buscador-lupa" aria-hidden="true">🔍</span>
      <input id="buscar-juego" type="search" placeholder="Buscar juego…" aria-label="Buscar juego" autocomplete="off" enterkeyhint="go">
      <button class="buscador-borrar" aria-label="Borrar búsqueda" hidden>✕</button>`;
    const campo = buscador.querySelector('input');
    campo.addEventListener('input', pintarVista);
    campo.addEventListener('keydown', e => {
      if (e.key === 'Escape') { campo.value = ''; pintarVista(); }
      // Enter con un solo resultado: abre ese juego
      if (e.key === 'Enter') {
        const visibles = lista.querySelectorAll('.tarjeta-juego[href]:not([hidden])');
        if (visibles.length === 1) location.hash = visibles[0].getAttribute('href');
      }
    });
    buscador.querySelector('.buscador-borrar').onclick = () => { campo.value = ''; pintarVista(); campo.focus(); };

    // Tarjetas de categorías: emoji, nombre, cuántos juegos y los símbolos de algunos
    const cuantos = MusaFiltro.conteos(todos, categorias);
    const enTodos = MusaFiltro.filtrar(todos, { aparte: aparte() });
    const muestra = id => (id === 'todos' ? enTodos : todos.filter(j => j.categorias.includes(id))).slice(0, 5).map(j => j.simbolo).join(' ');
    const tarjetas = document.createElement('nav');
    tarjetas.id = 'categorias-inicio';
    tarjetas.className = 'categorias-inicio';
    tarjetas.setAttribute('aria-label', 'Tipos de juego');
    tarjetas.innerHTML = categorias.map(c => `
      <a class="tarjeta-categoria" href="#${RUTA_CATEGORIA}${esc(c.id)}">
        <span class="tarjeta-categoria-emoji" aria-hidden="true">${c.emoji}</span>
        <strong>${esc(c.nombre)}</strong>
        <small>${esc(c.descripcion ?? '')}</small>
        <span class="tarjeta-categoria-pie"><span aria-hidden="true">${muestra(c.id)}</span><b>${cuantos[c.id]} ${cuantos[c.id] === 1 ? 'juego' : 'juegos'}</b></span>
      </a>`).join('') + `
      <a class="tarjeta-categoria tarjeta-categoria--todos" href="#${RUTA_CATEGORIA}todos">
        <span class="tarjeta-categoria-emoji" aria-hidden="true">📚</span>
        <strong>Todos los juegos</strong>
        <span class="tarjeta-categoria-pie"><b>${enTodos.length} juegos</b></span>
      </a>`;

    const cabecera = document.createElement('div');
    cabecera.id = 'cabecera-categoria';
    cabecera.className = 'cabecera-categoria';
    cabecera.hidden = true;

    lista.before(azar, buscador, tarjetas, cabecera);

    for (const juego of todos) {
      const a = document.createElement('a');
      a.className = 'tarjeta-juego';
      a.href = '#' + juego.id;
      a.dataset.id = juego.id;
      const etiquetas = juego.categorias.map(categoria).filter(Boolean)
        .map(c => `<span class="etiqueta-categoria">${c.emoji} ${esc(c.nombre)}</span>`).join('');
      a.innerHTML = `
        <span class="tarjeta-juego-simbolo">${juego.simbolo}</span>
        <span class="tarjeta-juego-texto">
          <strong>${juego.nombre}</strong>
          <small>${juego.descripcion}</small>
          ${etiquetas ? `<span class="tarjeta-juego-categorias">${etiquetas}</span>` : ''}
        </span>
        <span class="tarjeta-juego-flecha">›</span>`;
      lista.appendChild(a);
    }
    const pronto = document.createElement('div');
    pronto.className = 'tarjeta-juego tarjeta-juego--pronto';
    pronto.innerHTML = `
      <span class="tarjeta-juego-simbolo">🎲</span>
      <span class="tarjeta-juego-texto"><strong>Más juegos</strong><small>Próximamente</small></span>`;
    lista.appendChild(pronto);
    const vacio = document.createElement('p');
    vacio.className = 'buscador-vacio';
    vacio.hidden = true;
    lista.appendChild(vacio);
  }

  // Qué se ve en la portada: buscando → juegos de todas las categorías que coinciden;
  // sin buscar → las tarjetas de categorías, o los juegos de la categoría abierta (la lógica está en comun/filtro.js)
  function pintarVista() {
    const texto = document.getElementById('buscar-juego').value;
    const buscando = Boolean(texto.trim());
    const cat = categoriaDeRuta();
    const lista = document.getElementById('lista-juegos');
    const cabecera = document.getElementById('cabecera-categoria');
    const enCategorias = !cat && !buscando;

    document.getElementById('categorias-inicio').hidden = !enCategorias;
    lista.hidden = enCategorias;
    cabecera.hidden = !cat || buscando;
    if (cat && !buscando) {
      const c = categoria(cat);
      const n = MusaFiltro.filtrar(juegosConCategorias(), { categoria: c ? cat : null, aparte: aparte() }).length;
      cabecera.innerHTML = `
        <a href="#" class="boton-icono" aria-label="Volver a las categorías">←</a>
        <h2>${c ? `${c.emoji} ${esc(c.nombre)}` : '📚 Todos los juegos'}</h2>
        <span>${n} ${n === 1 ? 'juego' : 'juegos'}</span>`;
    }

    const visibles = new Set(MusaFiltro.filtrar(juegosConCategorias(), {
      categoria: buscando || cat === 'todos' ? null : cat, texto, aparte: aparte(),
    }).map(j => j.id));
    lista.querySelectorAll('.tarjeta-juego[href]').forEach(t => { t.hidden = !visibles.has(t.dataset.id); });
    lista.querySelector('.tarjeta-juego--pronto').hidden = cat !== 'todos' || buscando;
    const vacio = lista.querySelector('.buscador-vacio');
    vacio.hidden = visibles.size > 0;
    vacio.textContent = `Ningún juego coincide con «${texto.trim()}».`;
    document.querySelector('.buscador-borrar').hidden = !texto;
  }

  function navegar() {
    const id = location.hash.slice(1);
    const juego = juegos.find(j => j.id === id);
    const inicio = document.getElementById('pantalla-inicio');
    const pantalla = document.getElementById('pantalla-juego');
    document.querySelectorAll('.catalogo:not([hidden])').forEach(p => Musa.panel.cerrar(p));
    if (!juego) {
      delete document.body.dataset.juego;
      inicio.hidden = false;
      pantalla.hidden = true;
      vistaInicio = location.hash;
      pintarVista();
      window.scrollTo(0, 0);
      return;
    }
    // ← del juego vuelve a donde se estaba en la portada (la categoría abierta, o las categorías)
    pantalla.querySelector('.barra a').setAttribute('href', vistaInicio || '#');
    // El CSS de cada juego puede cambiar sus colores con body[data-juego="<id>"]
    document.body.dataset.juego = juego.id;
    inicio.hidden = true;
    pantalla.hidden = false;
    document.getElementById('titulo-juego').textContent = juego.nombre;
    // Cada juego pone sus botones a la derecha de la barra (p. ej. ⚙ y ☰ en Dixit)
    const accion = document.getElementById('accion-juego');
    accion.innerHTML = '';
    juego.abrir(document.getElementById('contenido-juego'), accion);
    window.scrollTo(0, 0);
  }

  // Botón de instalar (Android/Chrome) o instrucciones (iPhone)
  function prepararInstalacion() {
    const aviso = document.getElementById('aviso-instalar');
    const instalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (instalada) return;

    window.addEventListener('beforeinstallprompt', evento => {
      evento.preventDefault();
      aviso.innerHTML = '<button class="boton boton--secundario">📲 Instalar Musa en el celular</button>';
      aviso.hidden = false;
      aviso.querySelector('button').onclick = async () => {
        evento.prompt();
        await evento.userChoice;
        aviso.hidden = true;
      };
    });

    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      aviso.innerHTML = 'Para instalarla: toca <b>Compartir</b> <span aria-hidden="true">⬆️</span> y luego <b>Agregar a inicio</b>.';
      aviso.hidden = false;
    }
  }

  async function iniciar() {
    prepararInstalacion();
    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.register('service-worker.js');
    }
    await cargarJuegos();
    pintarLista();
    navegar();
    window.addEventListener('hashchange', navegar);
  }

  return { registrar, iniciar };
})();
