// Valida el catálogo de juegos de Musa: juegos.json, los reglas.json y que nada se olvide en el service worker.
// Uso: node herramientas/validar-juegos.mjs      (termina con código 1 si hay errores; los avisos no fallan)
//
// Es la verificación de la decisión 0005 (buenas prácticas): los datos se validan con una herramienta,
// no a ojo, y lo "por completar" queda a la vista en lugar de perderse.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_EMPEZAR = 1900;   // caracteres de "Para empezar": más que esto ya no cabe en una pantalla de celular
const MAX_SECCIONES_EMPEZAR = 7;

const errores = [];
const avisos = [];
const pendientes = [];
const error = (m) => errores.push(m);
const aviso = (m) => avisos.push(m);

const leerJSON = (ruta) => {
  try { return JSON.parse(readFileSync(join(RAIZ, ruta), 'utf8')); }
  catch (e) { error(`${ruta}: no se pudo leer (${e.message})`); return null; }
};
const texto = (v) => typeof v === 'string' && v.trim().length > 0;

function validarSecciones(ruta, nombre, secciones) {
  if (!Array.isArray(secciones) || secciones.length === 0) { error(`${ruta}: "${nombre}" debe ser una lista con al menos una sección`); return 0; }
  let largo = 0;
  secciones.forEach((s, i) => {
    if (!texto(s?.t)) error(`${ruta}: ${nombre}[${i}] no tiene título (t)`);
    if (!Array.isArray(s?.p) || s.p.length === 0) { error(`${ruta}: ${nombre}[${i}] "${s?.t}" no tiene viñetas (p)`); return; }
    s.p.forEach((p, j) => {
      if (!texto(p)) error(`${ruta}: ${nombre}[${i}].p[${j}] está vacío`);
      else { largo += p.length; if (/\bpendiente\b|por completar/i.test(p)) pendientes.push(`${ruta} → ${s.t}: ${p}`); }
    });
  });
  return largo;
}

// --- juegos.json
const catalogo = leerJSON('juegos/juegos.json');
const ids = new Set();
const idsCategorias = new Set((catalogo?.categorias ?? []).map(c => c.id));
for (const c of catalogo?.categorias ?? []) if (!c.id || !c.nombre || !c.emoji) error(`juegos.json: categoría incompleta ${JSON.stringify(c)}`);
for (const j of catalogo?.juegos ?? []) {
  if (!texto(j.id)) { error('juegos.json: hay un juego sin id'); continue; }
  if (ids.has(j.id)) error(`juegos.json: el id "${j.id}" está repetido`);
  // --- categorías (spec 011): 1 o 2 por juego, y que existan
  const cats = j.categorias ?? [];
  if (cats.length < 1 || cats.length > 2) error(`juegos.json: "${j.id}" debe tener 1 o 2 categorías (tiene ${cats.length})`);
  for (const c of cats) if (!idsCategorias.has(c)) error(`juegos.json: "${j.id}" usa la categoría "${c}", que no existe`);
  ids.add(j.id);
  if (!existsSync(join(RAIZ, 'juegos', j.id))) { error(`juegos/${j.id}: la carpeta no existe`); continue; }
  for (const a of j.archivos ?? []) {
    if (!existsSync(join(RAIZ, 'juegos', j.id, a))) error(`juegos/${j.id}/${a}: está en juegos.json pero no existe`);
  }
  if (j.tipo === 'reglas') {
    for (const campo of ['nombre', 'simbolo', 'descripcion']) if (!texto(j[campo])) error(`juegos.json: "${j.id}" (reglas) necesita "${campo}"`);
    if (!(j.archivos ?? []).includes('reglas.json')) error(`juegos.json: "${j.id}" (reglas) debe listar reglas.json en archivos`);
  }
  // --- reglas.json: se revisa en cualquier juego que lo tenga (de solo reglas o con ayudante, como Mente Vacuna)
  if ((j.archivos ?? []).includes('reglas.json')) {
    const ruta = `juegos/${j.id}/reglas.json`;
    const d = leerJSON(ruta);
    if (!d) continue;
    for (const campo of ['jugadores', 'duracion']) if (!texto(d[campo])) error(`${ruta}: falta "${campo}"`);
    const largo = validarSecciones(ruta, 'empezar', d.empezar);
    validarSecciones(ruta, 'reglamento', d.reglamento);
    if (largo > MAX_EMPEZAR) aviso(`${ruta}: "Para empezar" tiene ${largo} caracteres (más de ${MAX_EMPEZAR}): quizá ya no cabe en una pantalla`);
    if ((d.empezar?.length ?? 0) > MAX_SECCIONES_EMPEZAR) aviso(`${ruta}: "Para empezar" tiene ${d.empezar.length} secciones (más de ${MAX_SECCIONES_EMPEZAR})`);
    if (d.nota) pendientes.push(`${ruta} (aviso en la ficha): ${d.nota.slice(0, 90)}…`);
  } else if (!j.entrada && !(j.archivos ?? []).some((a) => /\.js$/.test(a))) {
    aviso(`juegos.json: "${j.id}" no es de reglas y no tiene JS`);
  }
}
for (const carpeta of readdirSync(join(RAIZ, 'juegos'), { withFileTypes: true })) {
  if (carpeta.isDirectory() && !ids.has(carpeta.name)) error(`juegos/${carpeta.name}: la carpeta no está registrada en juegos.json`);
}

// --- Que los archivos comunes estén en el service worker (si no, no funcionan sin Internet)
const sw = readFileSync(join(RAIZ, 'service-worker.js'), 'utf8');
for (const f of readdirSync(join(RAIZ, 'comun')).filter((n) => /\.(js|css)$/.test(n))) {
  if (!sw.includes(`'comun/${f}'`)) error(`service-worker.js: falta 'comun/${f}' (no funcionaría sin Internet)`);
}
// --- Y que index.html cargue cada script común
const html = readFileSync(join(RAIZ, 'index.html'), 'utf8');
for (const f of readdirSync(join(RAIZ, 'comun')).filter((n) => /\.js$/.test(n))) {
  if (!html.includes(`comun/${f}`)) aviso(`index.html: no carga comun/${f}`);
}

const salida = (titulo, lista) => { if (lista.length) { console.log(`\n${titulo} (${lista.length})`); lista.forEach((m) => console.log('  - ' + m)); } };
salida('ERRORES', errores);
salida('AVISOS', avisos);
salida('POR COMPLETAR (informativo)', pendientes);
const total = (catalogo?.juegos ?? []).length;
console.log(`\n${total} juegos revisados: ${errores.length} errores, ${avisos.length} avisos.`);
process.exit(errores.length ? 1 : 0);
