// 🎲 Elegir un juego al azar: pasa por los nombres y se detiene en uno. Desde ahí se abre o se vuelve a tirar.
// Se puede tirar entre todos los juegos o solo entre una o varias categorías (spec 011).
Musa.azar = (() => {
  const CLAVE = 'musa.azar.categorias.v1';
  let panel = null;
  let resultado, dado, botonAbrir, filas;
  let todos = [];          // todos los juegos, con sus categorías
  let categorias = [];
  let elegidas = [];       // categorías marcadas; vacío = todas
  let lista = [];          // candidatos según las categorías marcadas
  let escogido = null;
  let temporizador = null;

  const sinMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const azar = n => Math.floor(Math.random() * n);
  const etiqueta = j => `${j.simbolo} ${j.nombre}`;

  function cerrar() {
    clearTimeout(temporizador);
    Musa.panel.cerrar(panel);
  }

  function crear() {
    panel = Musa.panel.crear('🎲 Juego al azar', 'Elegir un juego al azar');
    panel.querySelector('.catalogo-cuerpo').innerHTML = `
      <div class="azar">
        <div class="azar-categorias" role="group" aria-label="Entre qué categorías tirar"></div>
        <div class="azar-dado" aria-hidden="true">🎲</div>
        <div class="azar-resultado" aria-live="polite"></div>
        <div class="azar-acciones">
          <button class="boton boton--principal" data-azar="abrir" disabled>Jugar este</button>
          <button class="boton boton--secundario" data-azar="otra">Tirar otra vez</button>
        </div>
      </div>`;
    resultado = panel.querySelector('.azar-resultado');
    dado = panel.querySelector('.azar-dado');
    botonAbrir = panel.querySelector('[data-azar="abrir"]');
    filas = panel.querySelector('.azar-categorias');
    filas.addEventListener('click', e => {
      const boton = e.target.closest('[data-categoria]');
      if (!boton) return;
      const id = boton.dataset.categoria;
      // "Todas" limpia la selección; una categoría se marca o desmarca (se pueden varias)
      elegidas = !id ? [] : elegidas.includes(id) ? elegidas.filter(c => c !== id) : [...elegidas, id];
      Musa.guardar(CLAVE, elegidas);
      pintarCategorias();
      tirar();
    });
    panel.querySelectorAll('[data-cerrar]').forEach(b => { b.onclick = cerrar; });
    panel.querySelector('[data-azar="otra"]').onclick = tirar;
    botonAbrir.onclick = () => {
      if (!escogido) return;
      cerrar();
      location.hash = '#' + escogido.id;
    };
  }

  function pintarCategorias() {
    lista = MusaFiltro.candidatos(todos, elegidas, categorias.filter(c => c.aparte).map(c => c.id));
    filas.innerHTML = `
      <button class="chip-categoria" data-categoria="" aria-pressed="${!elegidas.length}">Todas</button>
      ${categorias.map(c => `<button class="chip-categoria" data-categoria="${c.id}" aria-pressed="${elegidas.includes(c.id)}">${c.emoji} ${c.nombre}</button>`).join('')}
      <p class="azar-cuantos">${elegidas.length ? `Entre ${lista.length} ${lista.length === 1 ? 'juego' : 'juegos'}` : `Entre todos los juegos (${lista.length})`}</p>`;
  }

  function mostrar(juego) {
    escogido = juego;
    resultado.textContent = etiqueta(juego);
    resultado.classList.remove('azar-resultado--girando');
    dado.classList.remove('azar-dado--gira');
    botonAbrir.disabled = false;
  }

  function tirar() {
    clearTimeout(temporizador);
    if (!lista.length) return;
    // Nunca el mismo juego dos veces seguidas (si hay más de uno)
    let elegido;
    do { elegido = lista[azar(lista.length)]; } while (lista.length > 1 && elegido === escogido);

    botonAbrir.disabled = true;
    if (sinMovimiento()) { mostrar(elegido); return; }

    dado.classList.add('azar-dado--gira');
    resultado.classList.add('azar-resultado--girando');
    const pasos = 14;
    let paso = 0;
    const siguiente = () => {
      paso++;
      if (paso >= pasos) { mostrar(elegido); return; }
      resultado.textContent = etiqueta(lista[azar(lista.length)]);
      temporizador = setTimeout(siguiente, 60 + paso * 14);
    };
    siguiente();
  }

  // categoriaPortada: si en la portada hay una categoría elegida, el dado arranca con esa
  function abrir(juegos, cats = [], categoriaPortada = null) {
    todos = juegos;
    categorias = cats;
    const validas = new Set(cats.map(c => c.id));
    const guardadas = (Musa.leer(CLAVE, []) || []).filter(c => validas.has(c));
    elegidas = categoriaPortada ? [categoriaPortada] : guardadas;
    escogido = null;
    if (!panel) crear();
    pintarCategorias();
    Musa.panel.mostrar(panel);
    tirar();
  }

  return { abrir };
})();
