// Pruebas del filtro de la portada y del dado al azar (spec 011).
// Escalables: corren sobre los juegos reales de juegos.json y sobre TODAS las combinaciones de categorías,
// así un juego o una categoría nueva queda cubierta sin escribir nada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { RAIZ } from './bancos.mjs';

const F = createRequire(import.meta.url)('../comun/filtro.js');
const datos = JSON.parse(readFileSync(join(RAIZ, 'juegos', 'juegos.json'), 'utf8'));
const cats = datos.categorias;
// Los juegos con JS propio (Dixit, Risk, Mente Vacuna) no tienen nombre en juegos.json: basta el id para filtrar
const juegos = datos.juegos.map(j => ({ nombre: j.nombre ?? j.id, descripcion: j.descripcion ?? '', ...j }));
const aparte = cats.filter(c => c.aparte).map(c => c.id);

// Todas las combinaciones de categorías (2^n): con 5 son 32
const combinaciones = cats.reduce((acc, c) => acc.flatMap(s => [s, [...s, c.id]]), [[]]);

test('cada categoría tiene al menos un juego y los conteos cuadran con el filtro', () => {
  const n = F.conteos(juegos, cats);
  for (const c of cats) {
    assert.ok(n[c.id] > 0, `${c.id} está vacía`);
    assert.equal(F.filtrar(juegos, { categoria: c.id }).length, n[c.id]);
  }
});

test(`dado al azar: para las ${combinaciones.length} combinaciones, los candidatos son exactamente los juegos de alguna categoría marcada`, () => {
  for (const elegidas of combinaciones) {
    const ids = F.candidatos(juegos, elegidas, aparte).map(j => j.id).sort();
    const esperado = (elegidas.length ? juegos.filter(j => j.categorias.some(c => elegidas.includes(c)))
      : juegos.filter(j => !j.categorias.every(c => aparte.includes(c)))).map(j => j.id).sort();
    assert.deepEqual(ids, esperado, `categorías: ${elegidas.join(', ') || 'todas'}`);
    assert.ok(ids.length > 0, `sin candidatos con ${elegidas.join(', ')}`);
  }
});

test('marcar más categorías nunca reduce los candidatos', () => {
  for (const s of combinaciones) for (const c of cats) {
    if (s.includes(c.id) || !s.length) continue;
    assert.ok(F.candidatos(juegos, [...s, c.id], aparte).length >= F.candidatos(juegos, s, aparte).length);
  }
});

test('el buscador ignora tildes y mayúsculas, exige todas las palabras y se combina con la categoría', () => {
  const lista = [
    { id: 'p', nombre: 'Póker', descripcion: 'Texas', categorias: ['cartas'] },
    { id: 'u', nombre: 'Uno', descripcion: 'cartas de colores', categorias: ['cartas', 'familiares'] },
    { id: 'm', nombre: 'Monopoly Dados', descripcion: 'tragos', categorias: ['party'] },
  ];
  assert.deepEqual(F.filtrar(lista, { texto: 'POKER' }).map(j => j.id), ['p']);
  assert.deepEqual(F.filtrar(lista, { texto: 'monopoly dados' }).map(j => j.id), ['m']);
  assert.deepEqual(F.filtrar(lista, { texto: 'monopoly cartas' }), []);
  assert.deepEqual(F.filtrar(lista, { categoria: 'familiares', texto: 'uno' }).map(j => j.id), ['u']);
  assert.deepEqual(F.filtrar(lista, { categoria: 'party', texto: 'uno' }), []);
  assert.equal(F.filtrar(lista, { texto: '   ' }).length, 3);
});

test('los juegos aparte (solo en categorías aparte) no entran en "Todos" ni en "Todas" del dado, pero sí al abrir su categoría o al buscarlos', () => {
  for (const id of aparte) {
    const exclusivos = juegos.filter(j => F.esAparte(j, aparte));
    const todos = F.filtrar(juegos, { aparte }).map(j => j.id);
    const dado = F.candidatos(juegos, [], aparte).map(j => j.id);
    for (const j of exclusivos) {
      assert.ok(!todos.includes(j.id) && !dado.includes(j.id), `${j.id} no debe salir en Todos`);
      assert.ok(F.filtrar(juegos, { categoria: id, aparte }).some(x => x.id === j.id), `${j.id} debe salir en su categoría`);
      assert.ok(F.filtrar(juegos, { texto: j.nombre, aparte }).some(x => x.id === j.id), `${j.id} debe encontrarse buscando`);
    }
    // un juego que también está en otra categoría (ej.: Contacto, también Party) sí sale en Todos
    const mixtos = juegos.filter(j => j.categorias.includes(id) && !F.esAparte(j, aparte));
    for (const j of mixtos) assert.ok(todos.includes(j.id), `${j.id} tiene otra categoría: debe salir en Todos`);
  }
});
