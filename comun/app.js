// Musa: navegación entre el inicio y cada juego, carga de los juegos (juegos/juegos.json) e instalación como app.
const Musa = (() => {
  const juegos = [];
  let orden = [];

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
    const lista = (await (await fetch('juegos/juegos.json')).json()).juegos;
    orden = lista.map(j => j.id);
    for (const juego of lista) {
      const propios = juego.entrada
        ? [...juego.archivos.filter(a => a.endsWith('.css')), juego.entrada]
        : juego.archivos.filter(a => /\.(css|js)$/.test(a));
      for (const archivo of propios) await cargarArchivo(`juegos/${juego.id}/${archivo}`, archivo === juego.entrada);
    }
  }

  function pintarLista() {
    const lista = document.getElementById('lista-juegos');
    lista.innerHTML = '';
    for (const juego of juegos) {
      const a = document.createElement('a');
      a.className = 'tarjeta-juego';
      a.href = '#' + juego.id;
      a.innerHTML = `
        <span class="tarjeta-juego-simbolo">${juego.simbolo}</span>
        <span class="tarjeta-juego-texto">
          <strong>${juego.nombre}</strong>
          <small>${juego.descripcion}</small>
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
      return;
    }
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
