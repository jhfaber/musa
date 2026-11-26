// Musa: navegación entre el inicio y cada juego, carga de los juegos (juegos/juegos.json) e instalación como app.
const Musa = (() => {
  const juegos = [];
  let orden = [];
  let categorias = [];              // tipos de juego (spec 011), de juegos.json
  const categoriasDe = {};          // id del juego → sus categorías
  const sinEtiquetas = new Set();   // juegos que no muestran sus categorías al abrirlos (spec 030)
  const imagenDe = {};              // id del juego → ruta de su portada (spec 023), si tiene
  // Portada en dos niveles (spec 011): #  → tarjetas de categorías;  #c/<id> → juegos de esa categoría
  // (#c/todos = todos los juegos);  #<juego> → el juego. Así el botón atrás del celular funciona solo.
  const RUTA_CATEGORIA = 'c/';
  let vistaInicio = '';             // última vista de la portada, para que ← del juego vuelva ahí

  function registrar(juego) {
    juegos.push(juego);
    juegos.sort((a, b) => orden.indexOf(a.id) - orden.indexOf(b.id));
  }

  // Cada juego trae su CSS y su JS en juegos/<id>/. Se piden todos a la vez (abrir la app no espera archivo por
  // archivo) y los scripts se ejecutan en el orden de juegos.json (async = false). La lista se ordena en registrar.
  // Con "entrada", el juego es un módulo ES: se carga ese archivo y él importa los demás.
  function cargarArchivo(ruta, modulo = false) {
    return new Promise((listo, fallo) => {
      const css = ruta.endsWith('.css');
      const el = document.createElement(css ? 'link' : 'script');
      if (css) { el.rel = 'stylesheet'; el.href = ruta; } else { el.src = ruta; el.async = false; if (modulo) el.type = 'module'; }
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
    const pedidos = [];
    for (const juego of lista) {
      categoriasDe[juego.id] = juego.categorias ?? [];
      if (juego.etiquetas === false) sinEtiquetas.add(juego.id);
      if (juego.imagen) imagenDe[juego.id] = `juegos/${juego.id}/${juego.imagen}`;
      // Juegos de solo reglas: sin JS propio. La lista sale de juegos.json y el visor común (comun/reglas.js)
      // lee juegos/<id>/reglas.json al abrir.
      if (juego.tipo === 'reglas') {
        registrar({
          id: juego.id,
          nombre: juego.nombre,
          simbolo: juego.simbolo,
          descripcion: juego.descripcion,
          tipo: 'reglas',
          // La ficha usa la misma imagen (o color con inicial) que su portada (spec 026)
          abrir: contenedor => Musa.reglas.abrir({ ...juego, imagen: imagenDe[juego.id], color: colorDe(juego.id), etiquetas: etiquetasDe(juego.id) }, contenedor)
        });
        continue;
      }
      const propios = juego.entrada
        ? [...juego.archivos.filter(a => a.endsWith('.css')), juego.entrada]
        : juego.archivos.filter(a => /\.(css|js)$/.test(a));
      for (const archivo of propios) pedidos.push(cargarArchivo(`juegos/${juego.id}/${archivo}`, archivo === juego.entrada));
    }
    await Promise.all(pedidos);
  }

  // Los juegos con sus categorías e imagen (los que tienen JS propio se registran solos, sin ellas)
  const juegosConCategorias = () => juegos.map(j => ({ ...j, categorias: categoriasDe[j.id] ?? [], imagen: imagenDe[j.id] }));
  const categoria = id => categorias.find(c => c.id === id);
  const aparte = () => categorias.filter(c => c.aparte).map(c => c.id);   // categorías que no entran en "Todos"
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Etiquetas con las categorías de un juego (spec 028): se ven al abrirlo y cada una lleva a su categoría
  const etiquetasDe = id => {
    if (sinEtiquetas.has(id)) return '';
    const suyas = (categoriasDe[id] ?? []).map(categoria).filter(Boolean);
    return suyas.length ? `<nav class="etiquetas-categoria" aria-label="Categorías">${suyas.map(c =>
      `<a href="#${RUTA_CATEGORIA}${esc(c.id)}">${c.emoji} ${esc(c.nombre)}</a>`).join('')}</nav>` : '';
  };

  // La categoría que pide la ruta: un id, 'todos', o null si se está en las tarjetas de categorías
  function categoriaDeRuta() {
    const ruta = location.hash.slice(1);
    if (!ruta.startsWith(RUTA_CATEGORIA)) return null;
    const id = ruta.slice(RUTA_CATEGORIA.length);
    return id === 'todos' || categoria(id) ? id : null;
  }

  // Portada tipo tienda (spec 023). Se arma una sola vez: buscador pegajoso y chips de categorías.
  // Lo de abajo (filas o rejilla de portadas) lo pinta pintarVista según la ruta y lo buscado.
  function pintarLista() {
    const lista = document.getElementById('lista-juegos');

    document.getElementById('boton-azar').onclick = () => {
      const actual = categoriaDeRuta();
      Musa.azar.abrir(juegosConCategorias(), categorias, actual && actual !== 'todos' ? actual : null);
    };

    const barra = document.createElement('div');
    barra.className = 'portada-barra';
    barra.innerHTML = `
      <label class="buscador">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input id="buscar-juego" type="search" placeholder="Buscar juego" aria-label="Buscar juego" autocomplete="off" enterkeyhint="search">
        <button class="buscador-borrar" type="button" aria-label="Borrar búsqueda" hidden>✕</button>
      </label>`;
    const campo = barra.querySelector('input');
    campo.addEventListener('input', pintarVista);
    campo.addEventListener('keydown', e => {
      if (e.key === 'Escape') { campo.value = ''; pintarVista(); }
      // Enter con un solo resultado: abre ese juego
      if (e.key === 'Enter') {
        const visibles = lista.querySelectorAll('.juego-portada');
        if (visibles.length === 1) location.hash = visibles[0].getAttribute('href');
      }
    });
    barra.querySelector('.buscador-borrar').onclick = e => { e.preventDefault(); campo.value = ''; pintarVista(); campo.focus(); };

    // Chips: "Todos" (filas por categoría) y una por categoría. Son enlaces, así el botón atrás funciona.
    const chips = document.createElement('nav');
    chips.id = 'portada-chips';
    chips.className = 'portada-chips';
    chips.setAttribute('aria-label', 'Tipos de juego');
    chips.innerHTML = [{ id: '', nombre: 'Todos' }, ...categorias].map(c =>
      `<a class="portada-chip" data-id="${esc(c.id)}" href="#${c.id ? RUTA_CATEGORIA + esc(c.id) : ''}">${esc(c.nombre)}</a>`).join('');
    chips.addEventListener('click', () => { campo.value = ''; });

    lista.before(barra, chips);
  }

  // Sin imagen: un color fijo por juego (sale de su id) con la inicial
  const COLORES = ['#7f77dd', '#d85a30', '#1d9e75', '#d4537e', '#378add', '#ba7517', '#993556', '#0f6e56'];
  const colorDe = id => COLORES[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % COLORES.length];

  function portada(j) {
    const inicial = j.nombre.replace(/^[¿¡]/, '').charAt(0);
    const cara = j.imagen
      ? `<img src="${esc(j.imagen)}" alt="" loading="lazy" decoding="async">`
      : `<span class="juego-portada-inicial">${esc(inicial)}</span>`;
    return `<a class="juego-portada" href="#${esc(j.id)}">
        <span class="juego-portada-imagen" style="background:${colorDe(j.id)}">${cara}</span>
        <strong>${esc(j.nombre)}</strong>
        <small>${esc(j.descripcion ?? '')}</small>
      </a>`;
  }

  const rejilla = (juegosVistos, resumen) =>
    `<p class="portada-resumen">${resumen}</p><div class="portada-rejilla">${juegosVistos.map(portada).join('')}</div>`;
  const nJuegos = n => `${n} ${n === 1 ? 'juego' : 'juegos'}`;

  // Qué se ve en la portada (la lógica de filtrar está en comun/filtro.js):
  // buscando → rejilla con los juegos de todas las categorías que coinciden;
  // con una categoría abierta → rejilla de esa categoría; si no → una fila por categoría.
  function pintarVista() {
    const texto = document.getElementById('buscar-juego').value;
    const buscando = Boolean(texto.trim());
    const ruta = categoriaDeRuta();
    const cat = ruta === 'todos' ? null : ruta;
    const todos = juegosConCategorias();
    const lista = document.getElementById('lista-juegos');

    const chips = document.getElementById('portada-chips');
    chips.querySelectorAll('.portada-chip').forEach(chip => {
      const activa = !buscando && chip.dataset.id === (cat ?? '');
      chip.toggleAttribute('aria-current', activa);
      // El chip elegido se desliza al centro para que nunca quede escondido detrás del borde
      if (activa) chips.scrollTo({ left: chip.offsetLeft - (chips.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
    });
    document.querySelector('.buscador-borrar').hidden = !texto;

    if (buscando) {
      const hallados = MusaFiltro.filtrar(todos, { texto, aparte: aparte() });
      lista.innerHTML = hallados.length
        ? rejilla(hallados, nJuegos(hallados.length))
        : `<p class="portada-vacio">Ningún juego coincide con «${esc(texto.trim())}».</p>`;
      return;
    }
    if (cat) {
      const c = categoria(cat);
      const deCat = MusaFiltro.filtrar(todos, { categoria: cat, aparte: aparte() });
      lista.innerHTML = rejilla(deCat, `${esc(c.descripcion ?? '')} · ${nJuegos(deCat.length)}`);
      return;
    }
    lista.innerHTML = categorias.map(c => {
      const deCat = MusaFiltro.filtrar(todos, { categoria: c.id, aparte: aparte() });
      return `<section class="portada-fila" aria-label="${esc(c.nombre)}">
          <div class="portada-fila-titulo">
            <h2>${esc(c.nombre)}</h2>
            <a href="#${RUTA_CATEGORIA}${esc(c.id)}">Ver ${deCat.length} ›</a>
          </div>
          <div class="portada-carrusel">${deCat.map(portada).join('')}</div>
        </section>`;
    }).join('');
  }

  function navegar() {
    const id = location.hash.slice(1);
    const juego = juegos.find(j => j.id === id);
    const inicio = document.getElementById('pantalla-inicio');
    const pantalla = document.getElementById('pantalla-juego');
    document.querySelectorAll('.catalogo:not([hidden])').forEach(p => Musa.panel.cerrar(p));
    if (!juego) {
      delete document.body.dataset.juego;
      delete document.body.dataset.tipo;
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
    // Las fichas de reglas comparten el estilo de la portada: body[data-tipo="reglas"] (spec 026)
    if (juego.tipo) document.body.dataset.tipo = juego.tipo; else delete document.body.dataset.tipo;
    inicio.hidden = true;
    pantalla.hidden = false;
    document.getElementById('titulo-juego').textContent = juego.nombre;
    // Las fichas de reglas muestran sus categorías en la cabecera; los juegos con JS propio, debajo de la barra
    document.getElementById('categorias-juego').innerHTML = juego.tipo === 'reglas' ? '' : etiquetasDe(juego.id);
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
