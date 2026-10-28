// Panel lateral (catálogo, ajustes, escuela…): fondo oscuro, cabecera con ✕ y un cuerpo que pinta cada juego
Musa.panel = (() => {
  // completa: ocupa toda la pantalla y lleva un botón grande "Cerrar" fijo abajo
  function crear(titulo, etiqueta, antesDelCuerpo = '', { completa = false } = {}) {
    const p = document.createElement('div');
    p.className = completa ? 'catalogo catalogo--completa' : 'catalogo';
    p.hidden = true;
    p.innerHTML = `
      <div class="catalogo-fondo" data-cerrar></div>
      <aside class="catalogo-panel" role="dialog" aria-modal="true" aria-label="${etiqueta}">
        <header class="catalogo-cabeza">
          <h2>${titulo}</h2>
          <button class="boton-icono" data-cerrar aria-label="Cerrar">✕</button>
        </header>
        ${antesDelCuerpo}
        <div class="catalogo-cuerpo"></div>
        ${completa ? '<div class="catalogo-pie"><button class="boton boton--principal" data-cerrar>Cerrar</button></div>' : ''}
      </aside>`;
    document.body.appendChild(p);
    return p;
  }

  // Solo un panel a la vez
  function mostrar(p) {
    document.querySelectorAll('.catalogo:not([hidden])').forEach(otro => { if (otro !== p) otro.hidden = true; });
    p.hidden = false;
    document.body.classList.add('sin-scroll');
    p.querySelector('[data-cerrar].boton-icono').focus();
  }

  function cerrar(p) {
    p.hidden = true;
    document.body.classList.remove('sin-scroll');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.catalogo:not([hidden])').forEach(cerrar);
  });

  return { crear, mostrar, cerrar };
})();
