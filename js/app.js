// Musa: navegación entre el inicio y cada juego, registro de juegos e instalación como app.
const Musa = (() => {
  const juegos = [];

  function registrar(juego) {
    juegos.push(juego);
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
    if (!juego) {
      inicio.hidden = false;
      pantalla.hidden = true;
      return;
    }
    inicio.hidden = true;
    pantalla.hidden = false;
    document.getElementById('titulo-juego').textContent = juego.nombre;
    // Cada juego puede poner su propio botón a la derecha de la barra (p. ej. el menú ☰ de Dixit)
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

  function iniciar() {
    pintarLista();
    navegar();
    window.addEventListener('hashchange', navegar);
    prepararInstalacion();
    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.register('service-worker.js');
    }
  }

  return { registrar, iniciar };
})();
