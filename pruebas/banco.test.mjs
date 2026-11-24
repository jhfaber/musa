// Pruebas del banco de preguntas de Mente Vacuna (spec 009).
// Escalables: descubren solas todos los bancos (juegos/*/preguntas.json y specs/*/banco-borrador.json)
// y cada regla es una fila de la tabla REGLAS: agregar una regla = agregar una fila.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, todosLosBancos, bancosDeJuegos } from './bancos.mjs';

// Normaliza para comparar: sin tildes, minúsculas, sin signos ni espacios sobrantes.
const normalizar = (t) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9ñ ]/g, '').replace(/\s+/g, ' ').trim();

// Preguntas con una única respuesta verificable: no sirven en un juego donde gana la coincidencia.
const PARECE_EXAMEN = /^¿?(cu[aá]l es la capital|en qu[eé] a[nñ]o|cu[aá]ntos? (habitantes|kil[oó]metros)|qui[eé]n (escribi[oó]|invent[oó]|descubri[oó]))/i;

// Contraste WCAG entre el color de la categoría y el texto oscuro que va encima (--noche): mínimo 4.5 para leerse bien.
const TEXTO_OSCURO = '#1b1446';
const CONTRASTE_MIN = 4.5;
function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contraste = (a, b) => { const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const MIN_POR_CATEGORIA = 20;
// Una pregunta es un texto o { q, no }: las reglas de texto miran q
const textos = (c) => c.preguntas.map((p) => (typeof p === 'string' ? p : p?.q ?? ''));   // por debajo, se repite demasiado rápido
const LARGO_MAX = 110;          // se debe leer de un vistazo

// Cada regla recibe el banco y devuelve la lista de problemas (vacía = bien).
const REGLAS = {
  'estructura: cada categoría tiene id, nombre, emoji, pista y preguntas'(b) {
    return b.categorias.flatMap((c) => ['id', 'nombre', 'emoji', 'pista'].filter((k) => !c[k]?.trim()).map((k) => `${c.id ?? '?'}: falta "${k}"`)
      .concat(Array.isArray(c.preguntas) ? [] : [`${c.id}: preguntas no es lista`]));
  },
  [`cada categoría tiene un color válido con contraste ≥ ${CONTRASTE_MIN} para el texto`](b) {
    return b.categorias.flatMap((c) => !/^#[0-9a-f]{6}$/i.test(c.acento ?? '') ? [`${c.id}: color inválido "${c.acento}"`]
      : contraste(c.acento, TEXTO_OSCURO) < CONTRASTE_MIN ? [`${c.id}: contraste ${contraste(c.acento, TEXTO_OSCURO).toFixed(2)}`] : []);
  },
  'ids de categoría únicos y en formato kebab-case'(b) {
    const vistos = new Set();
    return b.categorias.flatMap((c) => { const mal = !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.id) ? [`id inválido: ${c.id}`] : []; if (vistos.has(c.id)) mal.push(`id repetido: ${c.id}`); vistos.add(c.id); return mal; });
  },
  [`cada categoría tiene al menos ${MIN_POR_CATEGORIA} preguntas`](b) {
    return b.categorias.filter((c) => c.preguntas.length < MIN_POR_CATEGORIA).map((c) => `${c.id}: solo ${c.preguntas.length}`);
  },
  'sin preguntas repetidas ni casi iguales (ni dentro ni entre categorías)'(b) {
    const visto = new Map(); const mal = [];
    for (const c of b.categorias) for (const p of textos(c)) { const k = normalizar(p); if (visto.has(k)) mal.push(`"${p}" (${c.id}) ≈ "${visto.get(k).p}" (${visto.get(k).id})`); else visto.set(k, { p, id: c.id }); }
    return mal;
  },
  [`ninguna pregunta pasa de ${LARGO_MAX} caracteres ni está vacía`](b) {
    return b.categorias.flatMap((c) => textos(c).filter((p) => !p.trim() || p.length > LARGO_MAX).map((p) => `${c.id}: "${p.slice(0, 40)}…" (${p.length})`));
  },
  'cada pregunta empieza en mayúscula o signo y termina en . ? !'(b) {
    return b.categorias.flatMap((c) => textos(c).filter((p) => !/^[¿¡A-ZÁÉÍÓÚÑ0-9]/.test(p) || !/[.?!]$/.test(p)).map((p) => `${c.id}: "${p}"`));
  },
  'sin espacios dobles ni sobrantes'(b) {
    return b.categorias.flatMap((c) => textos(c).filter((p) => p !== p.trim() || /\s{2}/.test(p)).map((p) => `${c.id}: "${p}"`));
  },
  'no hay preguntas de examen con una única respuesta verificable'(b) {
    return b.categorias.flatMap((c) => textos(c).filter((p) => PARECE_EXAMEN.test(p)).map((p) => `${c.id}: "${p}"`));
  },
  'las respuestas prohibidas son una lista corta de textos cortos, sin repetir'(b) {
    return b.categorias.flatMap((c) => c.preguntas.filter((p) => p && typeof p === 'object' && 'no' in p).flatMap((p) => {
      const no = p.no;
      if (!Array.isArray(no) || !no.length || no.length > 3) return [`${c.id}: "${p.q}" → "no" debe tener de 1 a 3 respuestas`];
      if (no.some((r) => typeof r !== 'string' || !r.trim() || r.length > 25)) return [`${c.id}: "${p.q}" → respuesta prohibida vacía o larga`];
      if (new Set(no.map(normalizar)).size !== no.length) return [`${c.id}: "${p.q}" → respuesta prohibida repetida`];
      return [];
    }));
  },
  'las preguntas de opciones traen exactamente 4 opciones cortas y distintas'(b) {
    return b.categorias.flatMap((c) => c.preguntas.filter((p) => p && typeof p === 'object' && 'opciones' in p).flatMap((p) => {
      const o = p.opciones;
      if (!Array.isArray(o) || o.length !== 4) return [`${c.id}: "${p.q}" → debe tener 4 opciones`];
      if (o.some((x) => typeof x !== 'string' || !x.trim() || x.length > 40)) return [`${c.id}: "${p.q}" → opción vacía o larga`];
      if (new Set(o.map(normalizar)).size !== 4) return [`${c.id}: "${p.q}" → opciones repetidas`];
      return [];
    }));
  },
};

const bancos = todosLosBancos();

test('hay al menos un banco que probar', () => assert.ok(bancos.length > 0, 'no se encontró ningún banco de preguntas'));

for (const { nombre, banco } of bancos) {
  for (const [regla, comprobar] of Object.entries(REGLAS)) {
    test(`${nombre} · ${regla}`, () => {
      const problemas = comprobar(banco);
      assert.deepEqual(problemas, [], `\n  ${problemas.slice(0, 10).join('\n  ')}${problemas.length > 10 ? `\n  …y ${problemas.length - 10} más` : ''}`);
    });
  }
}

// Banco en varios archivos (spec 010): nada queda por fuera del índice, de juegos.json ni del service worker
const juegosJson = JSON.parse(readFileSync(join(RAIZ, 'juegos', 'juegos.json'), 'utf8')).juegos;
const serviceWorker = readFileSync(join(RAIZ, 'service-worker.js'), 'utf8');

for (const { nombre, juego, dir, indice, banco } of bancosDeJuegos()) {
  test(`${nombre} · cada categoría del índice tiene su archivo, con el mismo id`, () => {
    const mal = banco.categorias.filter((c, i) => c._falta || c.id !== indice.categorias[i]).map((c) => c.id);
    assert.deepEqual(mal, []);
  });
  test(`${nombre} · cada archivo de la carpeta está en el índice (ninguno olvidado)`, () => {
    const archivos = readdirSync(dir).filter((a) => a.endsWith('.json') && a !== 'indice.json').map((a) => a.replace(/\.json$/, ''));
    assert.deepEqual(archivos.filter((a) => !indice.categorias.includes(a)), []);
  });
  test(`${nombre} · todos los archivos están en juegos.json, así quedan guardados para usarlos sin Internet`, () => {
    const listados = juegosJson.find((j) => j.id === juego)?.archivos ?? [];
    const faltan = ['indice', ...indice.categorias].map((id) => `preguntas/${id}.json`).filter((a) => !listados.includes(a));
    assert.deepEqual(faltan, []);
    assert.ok(serviceWorker.includes('juegos.json'), 'el service worker debe leer juegos.json');
  });
}
