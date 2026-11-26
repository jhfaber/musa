// Mente Vacuna: punto de entrada (spec 009). Dos pestañas: Preguntas (minijuego) y Reglas (visor común de la spec 008).
import { montarPreguntas } from './vistas/preguntas.js';
import * as efectos from './efectos.js';

const JUEGO = { id: 'mente-vacuna', nombre: 'Mente Vacuna', simbolo: '🐮', descripcion: 'Piensa como el rebaño · 4 a 20' };
let banco = null;

// El banco vive en varios archivos (spec 010): preguntas/indice.json dice el orden y hay un <categoria>.json por categoría.
async function leerJSON(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`${ruta}: ${respuesta.status}`);
  return respuesta.json();
}

async function cargarBanco() {
  if (!banco) {
    const { categorias } = await leerJSON('juegos/mente-vacuna/preguntas/indice.json');
    banco = { categorias: await Promise.all(categorias.map(id => leerJSON(`juegos/mente-vacuna/preguntas/${id}.json`))) };
  }
  return banco;
}

const enEsteJuego = () => location.hash.slice(1) === JUEGO.id;

// Al salir del juego, la pantalla vuelve a apagarse sola
window.addEventListener('hashchange', () => { if (!enEsteJuego()) efectos.pantallaEncendida(false); });

async function abrir(contenedor) {
  contenedor.innerHTML = `
    <div class="mv">
      <div class="mv-pestanas" role="tablist" aria-label="Mente Vacuna">
        <button role="tab" aria-selected="true" data-pestana="preguntas">🐮 Preguntas</button>
        <button role="tab" aria-selected="false" data-pestana="reglas">📖 Reglas</button>
      </div>
      <div data-vista="preguntas" class="mv-vista"><p class="ficha-estado">Cargando preguntas…</p></div>
      <div data-vista="reglas" hidden></div>
    </div>`;

  const vistaPreguntas = contenedor.querySelector('[data-vista="preguntas"]');
  const vistaReglas = contenedor.querySelector('[data-vista="reglas"]');
  let reglasListas = false;

  contenedor.querySelectorAll('[data-pestana]').forEach(boton => {
    boton.onclick = () => {
      const cual = boton.dataset.pestana;
      contenedor.querySelectorAll('[data-pestana]').forEach(b => b.setAttribute('aria-selected', b === boton ? 'true' : 'false'));
      vistaPreguntas.hidden = cual !== 'preguntas';
      vistaReglas.hidden = cual !== 'reglas';
      efectos.pantallaEncendida(cual === 'preguntas');
      if (cual === 'reglas' && !reglasListas) { reglasListas = true; Musa.reglas.abrir(JUEGO, vistaReglas); }
      window.scrollTo(0, 0);
    };
  });

  try {
    const datos = await cargarBanco();
    if (!enEsteJuego()) return;
    montarPreguntas(vistaPreguntas, datos);
    efectos.pantallaEncendida(true);
  } catch (e) {
    if (enEsteJuego()) vistaPreguntas.innerHTML = '<p class="ficha-estado">No pude abrir las preguntas. Prueba de nuevo.</p>';
  }
}

Musa.registrar({ ...JUEGO, abrir });
