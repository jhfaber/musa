// Visor de reglas (juegos de tipo "reglas"): una ficha con dos pestañas, "Para empezar" y "Reglamento".
// Los textos viven en juegos/<id>/reglas.json: se piden al abrir el juego y el service worker los guarda para usarlos sin Internet.
Musa.reglas = (() => {
  const guardadas = {};

  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // **así** se ve en negrita
  const texto = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const viñetas = puntos => `<ul>${(puntos || []).map(p => `<li>${texto(p)}</li>`).join('')}</ul>`;

  async function datos(juego) {
    if (!guardadas[juego.id]) {
      const respuesta = await fetch(`juegos/${juego.id}/reglas.json`);
      if (!respuesta.ok) throw new Error(respuesta.status);
      guardadas[juego.id] = await respuesta.json();
    }
    return guardadas[juego.id];
  }

  // Para empezar: todo a la vista, sin plegar
  const paraEmpezar = d => (d.empezar || []).map(s => `
    <section class="regla">
      <h3>${esc(s.t)}</h3>
      ${viñetas(s.p)}
    </section>`).join('');

  // Reglamento: secciones que se abren y se cierran
  const reglamento = d => `
    <div class="regla-herramientas">
      <button class="boton boton--texto" data-plegar="abrir">Abrir todo</button>
      <button class="boton boton--texto" data-plegar="cerrar">Cerrar todo</button>
    </div>
    ${(d.reglamento || []).map(s => `
      <details class="regla-det">
        <summary>${esc(s.t)}</summary>
        ${viñetas(s.p)}
      </details>`).join('')}`;

  async function abrir(juego, contenedor) {
    contenedor.innerHTML = '<p class="ficha-estado">Cargando reglas…</p>';
    let d;
    try {
      d = await datos(juego);
    } catch (e) {
      if (location.hash.slice(1) === juego.id) {
        contenedor.innerHTML = '<p class="ficha-estado">No pude abrir las reglas. Prueba de nuevo.</p>';
      }
      return;
    }
    // Si mientras cargaba se cambió de juego, no se pinta esta ficha encima de la otra
    if (location.hash.slice(1) !== juego.id) return;

    contenedor.innerHTML = `
      <div class="ficha">
        <div class="ficha-cabeza">
          <span class="ficha-simbolo" aria-hidden="true">${esc(juego.simbolo)}</span>
          <div class="ficha-meta">
            ${d.jugadores ? `<span>👥 ${esc(d.jugadores)} jugadores</span>` : ''}
            ${d.duracion ? `<span>⏱ ${esc(d.duracion)}</span>` : ''}
          </div>
        </div>
        ${d.necesitas ? `<p class="ficha-necesitas"><b>Necesitas:</b> ${texto(d.necesitas)}</p>` : ''}
        ${d.nota ? `<p class="ficha-nota">${texto(d.nota)}</p>` : ''}
        <div class="chips ficha-pestanas" role="tablist">
          <button class="chip chip--activo" role="tab" aria-selected="true" data-pestana="empezar">Para empezar</button>
          <button class="chip" role="tab" aria-selected="false" data-pestana="reglamento">Reglamento</button>
        </div>
        <div class="ficha-vista" data-vista="empezar">${paraEmpezar(d)}</div>
        <div class="ficha-vista" data-vista="reglamento" hidden>${reglamento(d)}</div>
        <p class="ficha-pie">${esc(d.pie ?? 'Resumen no oficial, hecho en casa. Ante una duda, manda el manual de la caja.')}</p>
      </div>`;

    const pestanas = contenedor.querySelectorAll('[data-pestana]');
    const vistas = contenedor.querySelectorAll('[data-vista]');
    pestanas.forEach(boton => {
      boton.onclick = () => {
        pestanas.forEach(b => {
          const activa = b === boton;
          b.classList.toggle('chip--activo', activa);
          b.setAttribute('aria-selected', activa ? 'true' : 'false');
        });
        vistas.forEach(v => { v.hidden = v.dataset.vista !== boton.dataset.pestana; });
        window.scrollTo(0, 0);
      };
    });

    contenedor.querySelectorAll('[data-plegar]').forEach(boton => {
      boton.onclick = () => {
        const abrir = boton.dataset.plegar === 'abrir';
        contenedor.querySelectorAll('.regla-det').forEach(det => { det.open = abrir; });
      };
    });
  }

  return { abrir };
})();
