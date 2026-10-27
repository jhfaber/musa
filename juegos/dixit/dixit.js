// Dixit: cada ronda propone una categoría para inspirar la pista y, según el nivel, lentes que la acompañan.
// Los lentes son pistas extra en paralelo: describen la carta o modifican la categoría o al otro lente.
(() => {
  const CLAVE = 'musa.dixit.v2';
  const NIVELES = [
    { id: 'tranquilo', nombre: 'Tranquilo', lentes: 0, salto: 0, desc: 'Solo la categoría.' },
    { id: 'normal', nombre: 'Normal', lentes: 1, salto: 0.3, desc: 'La categoría y un lente.' },
    { id: 'caotico', nombre: 'Caótico', lentes: 2, salto: 0.6, desc: 'La categoría y dos lentes.' },
    { id: 'favoritos', nombre: '⭐ Favoritos', lentes: 0, salto: 0, desc: 'Repite las rondas que marcaste con ⭐.' }
  ];
  const CLAVE_FAVORITOS = 'musa.dixit.favoritos.v1'; // aparte de la partida: "Nueva partida" no las borra
  const SIN_REPETIR = 3;   // una categoría no vuelve hasta que pasen 3 rondas
  const MAX_SEGUIDAS = 4;  // un lente cambia de familia después de 4 seguidos

  let categorias = [];
  let lentes = [];         // planos, cada uno con su familia
  let estado = null;
  let favoritos = null;    // [{ categoria, lentes, nivel, fecha }]
  let ajustes = null;      // menú ⚙ (ver "Ajustes y reloj")
  let contenedor = null;

  const azar = lista => lista[Math.floor(Math.random() * lista.length)];
  const categoria = id => categorias.find(c => c.id === id);
  const lente = id => lentes.find(l => l.id === id);
  const nivel = () => NIVELES.find(n => n.id === estado.nivel);

  function estadoNuevo(nivelId = 'normal') {
    return { historial: [], indice: -1, nivel: nivelId };
  }

  function cargarEstado() {
    const guardado = Musa.leer(CLAVE);
    return guardado && Array.isArray(guardado.historial) ? guardado : estadoNuevo();
  }

  const guardarEstado = () => Musa.guardar(CLAVE, estado);

  // ---------- Favoritos: combinaciones exactas (categoría + lentes) que se quieren repetir ----------

  const enFavoritos = () => estado.nivel === 'favoritos';
  const claveRonda = r => `${r.categoria}|${r.lentes.join(',')}`;
  const esFavorita = r => favoritos.some(f => claveRonda(f) === claveRonda(r));

  // Se descartan las que usan categorías o lentes que ya no existen
  function cargarFavoritos() {
    const guardados = Musa.leer(CLAVE_FAVORITOS);
    return Array.isArray(guardados)
      ? guardados.filter(f => categoria(f.categoria) && Array.isArray(f.lentes) && f.lentes.every(id => lente(id)))
      : [];
  }

  const guardarFavoritos = () => Musa.guardar(CLAVE_FAVORITOS, favoritos);

  function alternarFavorita() {
    const ronda = estado.historial[estado.indice];
    if (!ronda) return;
    if (esFavorita(ronda)) favoritos = favoritos.filter(f => claveRonda(f) !== claveRonda(ronda));
    else favoritos.push({ categoria: ronda.categoria, lentes: [...ronda.lentes], nivel: ronda.nivel || estado.nivel, fecha: Date.now() });
    guardarFavoritos();
    pintar(false);
  }

  function quitarFavorita(i) {
    favoritos.splice(i, 1);
    guardarFavoritos();
    pintar(false);
  }

  // Una favorita al azar que no haya salido en las últimas N − 1 rondas: una vuelta completa sin repetir.
  // "Otra categoría" evita además la que está en pantalla (evitar), si hay otra para elegir.
  function armarFavorita(hasta, evitar = null) {
    const recientes = anteriores(hasta).slice(-(favoritos.length - 1) || favoritos.length).map(claveRonda);
    let opciones = favoritos.filter(f => !recientes.includes(claveRonda(f)));
    if (!opciones.length) opciones = favoritos;
    const sinEvitar = opciones.filter(f => !evitar || claveRonda(f) !== claveRonda(evitar));
    const f = azar(sinEvitar.length ? sinEvitar : opciones);
    return { categoria: f.categoria, lentes: [...f.lentes], nivel: f.nivel };
  }

  // ---------- Ajustes (menú ⚙) y reloj para pensar la pista (el reloj vive en comun/reloj.js) ----------

  const CLAVE_AJUSTES = 'musa.dixit.ajustes.v1';
  const AJUSTES_BASE = { reloj: true, segundos: 60, vista: 'arena', sonido: true, vibrar: true };
  const VISTAS = Musa.reloj.VISTAS;
  const ATAJOS = [30, 60, 90, 120];
  const ajustarSegundos = Musa.reloj.ajustarSegundos;
  const formatoTiempo = Musa.reloj.formato;

  function cargarAjustes() {
    const a = { ...AJUSTES_BASE, ...(Musa.leer(CLAVE_AJUSTES) || {}) };
    a.segundos = ajustarSegundos(Number(a.segundos) || AJUSTES_BASE.segundos);
    if (!VISTAS.some(v => v.id === a.vista)) a.vista = AJUSTES_BASE.vista;
    return a;
  }

  const guardarAjustes = () => Musa.guardar(CLAVE_AJUSTES, ajustes);

  // Vive fuera de la carta, así que repintarla (p. ej. al marcar ⭐) no lo detiene
  const reloj = Musa.reloj.crear({
    duracion: () => ajustes.segundos,
    alCambiar: () => pintarReloj(),
    alTerminar: () => Musa.reloj.avisar(ajustes)
  });
  const reiniciarReloj = () => reloj.reiniciar();
  const alternarReloj = () => reloj.alternar();
  const htmlReloj = Musa.reloj.html;
  const medirBorde = () => Musa.reloj.medirBorde(contenedor);

  function pintarReloj() {
    const carta = contenedor && contenedor.querySelector('.carta--reloj');
    if (!carta) return;
    const restante = reloj.restante();
    Musa.reloj.pintarVista(carta, restante / ajustes.segundos, restante, reloj.corriendo() ? '⏸ Pausar'
      : restante <= 0 ? '↻ Otra vez' : restante < ajustes.segundos ? '▶ Seguir' : '⏳ Pensar');
    carta.classList.toggle('reloj--poco', reloj.corriendo() && restante <= 10 && restante > 0);
    carta.classList.toggle('reloj--fin', restante <= 0);
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

    // La familia principal de la categoría (las escalas) puede repetirse en la ronda: en Caótico salen dos
    // escalas distintas, como un mapa de dos ejes, o una escala y un sonido. Las demás familias no se repiten.
    const validos = lentes.filter(l => !choca(c, l) && !enRonda.includes(l.id) &&
      (l.familia.id === c.lente_principal || !familiasRonda.includes(l.familia.id)) &&
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

  function armarRonda(hasta, evitar = null) {
    if (enFavoritos()) return armarFavorita(hasta, evitar);
    const c = elegirCategoria(hasta);
    return { categoria: c.id, lentes: lentesPara(c, hasta), nivel: estado.nivel };
  }

  // En Favoritos sin ninguna guardada no hay de dónde repartir
  const sinRepartir = () => enFavoritos() && !favoritos.length;

  function nuevaRonda() {
    reiniciarReloj();
    if (sinRepartir()) return pintar(false);
    estado.historial.push(armarRonda(estado.historial.length));
    estado.indice = estado.historial.length - 1;
    guardarEstado();
    pintar(true);
  }

  function otraCategoria() {
    reiniciarReloj();
    if (sinRepartir()) return pintar(false);
    estado.historial[estado.indice] = armarRonda(estado.indice, estado.historial[estado.indice]);
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
    reiniciarReloj();
    estado.indice = Math.max(0, Math.min(estado.historial.length - 1, estado.indice + paso));
    guardarEstado();
    pintar(false);
  }

  function nuevaPartida() {
    if (estado.historial.length && !confirm('¿Empezar una partida nueva? Se borran las rondas jugadas.')) return;
    reiniciarReloj();
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
    if (sinRepartir()) {
      return `
        <div class="carta carta--dorso">
          <div class="carta-dorso-arte" aria-hidden="true">☆</div>
          <p class="carta-dorso-texto">Aún no tienes favoritas.<br>Cuando una ronda salga muy buena, toca la <b>☆</b>
          de la carta para guardarla y aquí podrás repetirla.</p>
        </div>`;
    }
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
      <div class="carta ${ajustes.reloj ? `carta--reloj reloj-vista-${ajustes.vista}` : ''}">
        <button class="carta-fav ${esFavorita(ronda) ? 'carta-fav--activa' : ''}" data-accion="fav"
          aria-pressed="${esFavorita(ronda)}" aria-label="${esFavorita(ronda) ? 'Quitar de favoritos' : 'Guardar en favoritos'}">${esFavorita(ronda) ? '★' : '☆'}</button>
        <div class="carta-cadena">Categoría <span class="reto">Reto +${1 + ronda.lentes.length}</span></div>
        <div class="carta-simbolo" aria-hidden="true">${c.simbolo}</div>
        <h3 class="carta-titulo">${c.nombre}</h3>
        <p class="carta-descripcion">${c.descripcion}</p>
        ${c.relacionado ? '<p class="carta-aviso">No vale lo que se ve en la carta</p>' : ''}
        <p class="carta-ejemplo"><span>Ejemplos</span>${ejemplos(c.ejemplos)}</p>
        ${ajustes.reloj ? htmlReloj() : ''}
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
          ${enUltima || sinRepartir()
            ? `<button class="boton boton--principal" data-accion="nueva" ${sinRepartir() ? 'disabled' : ''}>✦ Nueva ronda</button>`
            : `<button class="boton boton--principal" data-accion="ultima">Volver a la ronda ${total}</button>`}
          <button class="boton-icono boton-redondo" data-accion="adelante" ${enUltima ? 'disabled' : ''} aria-label="Ronda siguiente">›</button>
        </div>
        ${hay && enUltima && !sinRepartir() ? `
          <div class="cambios">
            <button class="boton boton--texto" data-accion="otra">↻ ${enFavoritos() ? 'Otra favorita' : 'Otra categoría'}</button>
            ${ronda.lentes.length && !enFavoritos() ? '<button class="boton boton--texto" data-accion="lentes">↻ Otros lentes</button>' : ''}
          </div>` : ''}

        <section class="ajustes">
          <div class="ajustes-titulo">Nivel</div>
          <div class="chips" role="radiogroup" aria-label="Nivel de dificultad">
            ${NIVELES.map(n => `
              <button class="chip ${n.id === estado.nivel ? 'chip--activo' : ''}" role="radio"
                aria-checked="${n.id === estado.nivel}" data-nivel="${n.id}">${n.nombre}</button>`).join('')}
          </div>
          <p class="ajustes-desc">${nivel().desc}${enFavoritos() ? ` Tienes ${favoritos.length}.` : ''}</p>
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
        fav: alternarFavorita,
        reloj: alternarReloj,
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
    medirBorde();
    pintarReloj();
  }

  // ---------- Catálogo (menú ☰): qué categorías y lentes hay en cada nivel ----------

  // Categorías que pueden salir en un nivel
  const categoriasDe = n => categorias.filter(c => saleEn(c, n));
  // Lentes que pueden acompañar a una categoría (mismas reglas que al repartir)
  const lentesPosibles = c => lentes.filter(l => !choca(c, l));

  // Cuántos lentes trae de verdad una categoría en un nivel: lo que pide el nivel, limitado por lo que la
  // categoría admite (dos lentes deben ser de familias distintas, salvo las que solo usan escalas).
  function lentesQueTrae(c, n) {
    const posibles = lentesPosibles(c);
    const principales = posibles.filter(l => l.familia.id === c.lente_principal).length;
    const otrasFamilias = new Set(posibles.filter(l => l.familia.id !== c.lente_principal).map(l => l.familia.id)).size;
    return Math.min(lentesEnNivel(c, n), principales + otrasFamilias);
  }

  let panel = null;

  function pintarFavoritosCatalogo() {
    const nombreNivel = id => (NIVELES.find(x => x.id === id) || {}).nombre || '';
    const filas = favoritos.map((f, i) => {
      const c = categoria(f.categoria);
      const fichas = f.lentes.map(id => { const l = lente(id); return `<span class="cat-familia"><b>${l.familia.simbolo}</b> ${l.titulo}</span>`; }).join('');
      return `
        <tr>
          <th scope="row"><span class="cat-simbolo">${c.simbolo}</span> ${c.nombre}
            ${f.nivel ? `<small class="cat-cuenta">Salió en ${nombreNivel(f.nivel)}</small>` : ''}
            <button class="cat-ver" data-quitar="${i}">Quitar</button></th>
          <td>${fichas || '<span class="cat-desc">Sin lentes</span>'}</td>
        </tr>`;
    }).join('');
    panel.querySelector('.catalogo-cuerpo').innerHTML = favoritos.length ? `
      <p class="catalogo-resumen"><b>${favoritos.length} ${favoritos.length === 1 ? 'favorita' : 'favoritas'}</b> · se guardan en este celular</p>
      <table class="catalogo-tabla">
        <thead><tr><th>Categoría</th><th>Lentes</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>` : '<p class="catalogo-resumen">Aún no tienes favoritas. Toca la <b>☆</b> de una carta para guardarla.</p>';
  }

  function pintarCatalogo(nivelId) {
    panel.querySelectorAll('[data-catalogo]').forEach(b => {
      b.classList.toggle('chip--activo', b.dataset.catalogo === nivelId);
      b.setAttribute('aria-selected', b.dataset.catalogo === nivelId);
    });
    if (nivelId === 'favoritos') return pintarFavoritosCatalogo();
    const n = NIVELES.find(x => x.id === nivelId);
    const lista = categoriasDe(n);
    const filas = lista.map(c => {
      const posibles = lentesPosibles(c);
      const porFamilia = [...new Set(posibles.map(l => l.familia))].map(f =>
        `<span class="cat-familia"><b>${f.simbolo}</b> ${posibles.filter(l => l.familia === f).map(l => l.titulo).join(', ')}</span>`).join('');
      const trae = lentesQueTrae(c, n);
      return `
        <tr>
          <th scope="row"><span class="cat-simbolo">${c.simbolo}</span> ${c.nombre}
            ${n.lentes ? `<small class="cat-cuenta">${trae ? `${trae} ${trae === 1 ? 'lente' : 'lentes'}` : 'Sin lentes'}</small>` : ''}
            ${n.lentes && !saleEn(c, NIVELES[0]) ? '<small class="cat-nivel">No sale en Tranquilo</small>' : ''}
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
          <tbody>${familias.map(f => f.lentes.map(l => {
            // Categorías de este nivel con las que puede salir el lente (las mismas reglas que al repartir)
            const conQuien = lista.filter(c => lentesQueTrae(c, n) && !choca(c, lente(l.id)));
            return `
            <tr><th scope="row"><span class="cat-simbolo">${f.simbolo}</span> ${l.titulo}<small class="cat-familia-nombre">${f.nombre}</small>
                <button class="cat-ver" data-asociar="${l.id}" aria-expanded="false">Con qué categorías (${conQuien.length})</button></th>
              <td class="cat-desc">${(l.ejemplos || []).join(' · ')}</td></tr>
            <tr class="cat-asociadas" data-asociadas="${l.id}" hidden><td colspan="2">
              ${conQuien.length ? conQuien.map(c => `<span class="cat-chip">${c.simbolo} ${c.nombre}</span>`).join('') : '<span class="cat-desc">Ninguna en este nivel</span>'}
            </td></tr>`;
          }).join('')).join('')}
          </tbody>
        </table>` : ''}`;
  }

  // Panel lateral compartido (comun/panel.js)
  const crearPanel = Musa.panel.crear;
  const mostrarPanel = Musa.panel.mostrar;
  const cerrarPanel = Musa.panel.cerrar;

  function abrirCatalogo() {
    if (!panel) {
      panel = crearPanel('Categorías por nivel', 'Categorías y lentes por nivel', `
        <div class="chips" role="tablist">
          ${NIVELES.map(x => `<button class="chip" role="tab" data-catalogo="${x.id}">${x.nombre}</button>`).join('')}
        </div>`);
      panel.addEventListener('click', e => {
        if (e.target.closest('[data-cerrar]')) return cerrarPanel(panel);
        const quitar = e.target.closest('[data-quitar]');
        if (quitar) {
          quitarFavorita(Number(quitar.dataset.quitar));
          return pintarFavoritosCatalogo();
        }
        const ver = e.target.closest('[data-asociar]');
        if (ver) {
          const fila = panel.querySelector(`[data-asociadas="${ver.dataset.asociar}"]`);
          fila.hidden = !fila.hidden;
          ver.setAttribute('aria-expanded', String(!fila.hidden));
          return;
        }
        const b = e.target.closest('[data-catalogo]');
        if (b) pintarCatalogo(b.dataset.catalogo);
      });
    }
    pintarCatalogo(estado.nivel);
    mostrarPanel(panel);
  }

  // ---------- Menú ⚙: reloj (duración en minutos y segundos, cómo se ve, campanita y vibración) ----------

  let panelAjustes = null;

  const interruptor = (clave, titulo, desc) => Musa.ui.interruptor(ajustes[clave], clave, titulo, desc);

  function pintarAjustes() {
    panelAjustes.querySelector('.catalogo-cuerpo').innerHTML = `
      <section class="ajuste">
        <h3 class="catalogo-subtitulo">Reloj para pensar la pista</h3>
        ${interruptor('reloj', 'Mostrar el reloj', 'Un botón en la carta para contar el tiempo del narrador.')}
      </section>
      <section class="ajuste" ${ajustes.reloj ? '' : 'hidden'}>
        <div class="ajuste-titulo">Duración</div>
        ${Musa.ui.tiempo(ajustes.segundos, 'segundos')}
        <div class="chips">
          ${ATAJOS.map(s => `<button class="chip ${s === ajustes.segundos ? 'chip--activo' : ''}" data-atajo="${s}">${formatoTiempo(s)}</button>`).join('')}
        </div>

        <div class="ajuste-titulo">Cómo se ve el tiempo</div>
        <div class="chips">
          ${VISTAS.map(v => `<button class="chip ${v.id === ajustes.vista ? 'chip--activo' : ''}" data-vista="${v.id}">${v.nombre}</button>`).join('')}
        </div>
        <p class="ajustes-desc">${VISTAS.find(v => v.id === ajustes.vista).desc}</p>

        <div class="ajuste-titulo">Al terminar</div>
        ${interruptor('sonido', 'Campanita suave', 'Dos notas cortas cuando se acaba el tiempo.')}
        ${interruptor('vibrar', 'Vibrar', 'Solo en Android: el iPhone no deja vibrar desde una web.')}
      </section>`;
  }

  // Guarda, repinta el menú y la carta de atrás. Si cambia la duración, el reloj vuelve a empezar.
  function cambiarAjuste(cambio, reiniciar = false) {
    Object.assign(ajustes, cambio);
    guardarAjustes();
    if (reiniciar) reiniciarReloj();
    pintarAjustes();
    pintar(false);
  }

  function abrirAjustes() {
    if (!panelAjustes) {
      panelAjustes = crearPanel('Ajustes', 'Ajustes de Dixit');
      panelAjustes.addEventListener('click', e => {
        if (e.target.closest('[data-cerrar]')) return cerrarPanel(panelAjustes);
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.paso) cambiarAjuste({ segundos: ajustarSegundos(ajustes.segundos + Number(b.dataset.paso)) }, true);
        else if (b.dataset.atajo) cambiarAjuste({ segundos: Number(b.dataset.atajo) }, true);
        else if (b.dataset.vista) cambiarAjuste({ vista: b.dataset.vista });
      });
      panelAjustes.addEventListener('change', e => {
        const clave = e.target.dataset.ajuste;
        if (clave) cambiarAjuste({ [clave]: e.target.checked }, clave === 'reloj');
      });
    }
    pintarAjustes();
    mostrarPanel(panelAjustes);
  }

  async function abrir(elemento, accion) {
    contenedor = elemento;
    if (accion) {
      accion.innerHTML = `
        <button class="boton-icono" data-menu="ajustes" aria-label="Ajustes">⚙</button>
        <button class="boton-icono" data-menu="catalogo" aria-label="Ver categorías y lentes por nivel">☰</button>`;
      accion.querySelector('[data-menu="ajustes"]').onclick = abrirAjustes;
      accion.querySelector('[data-menu="catalogo"]').onclick = abrirCatalogo;
    }
    ajustes = ajustes || cargarAjustes();
    if (!categorias.length) {
      const datos = await (await fetch('juegos/dixit/categorias.json')).json();
      categorias = datos.categorias;
      lentes = datos.lentes.flatMap(familia => familia.lentes.map(l => ({ ...l, familia })));
    }
    estado = estado || limpiarEstado(cargarEstado());
    favoritos = favoritos || cargarFavoritos();
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
