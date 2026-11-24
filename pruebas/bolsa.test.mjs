// Pruebas de la bolsa de preguntas de Mente Vacuna (spec 009).
// Escalables: en vez de casos sueltos, comprueban propiedades sobre cientos de semillas de azar
// y sobre cada banco que exista (juegos/*/preguntas.json). Un banco nuevo queda cubierto solo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as B from '../juegos/mente-vacuna/logica/bolsa.js';
import { bancosDeJuegos } from './bancos.mjs';
const SEMILLAS = 200;
// Escala: cada partida simulada recorre todo el banco, así que con bancos grandes se simulan menos partidas
// (mínimo 15). El trabajo total queda acotado aunque el banco crezca a miles de preguntas.
const semillasPara = (n) => Math.max(15, Math.min(SEMILLAS, Math.floor(30000 / Math.max(1, n))));

// Azar reproducible (mulberry32): la misma semilla da siempre la misma secuencia.
function azarCon(semilla) {
  let a = semilla >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Banco pequeño hecho a mano, con una categoría +18
const MINI = { categorias: [
  { id: 'a', adultos: false, preguntas: ['A1.', 'A2.', 'A3.'] },
  { id: 'b', adultos: false, preguntas: ['B1.', { q: 'B2.', no: ['obvia'] }] },
  { id: 'x', adultos: true, preguntas: ['X1.', 'X2.'] },
] };

const bancosReales = () => bancosDeJuegos().map(({ nombre, banco }) => ({ nombre, banco }));

// Saca n preguntas seguidas y devuelve los ids y el estado final
function sacarVarias(estado, items, azar, n) {
  const ids = [];
  for (let i = 0; i < n; i++) { const r = B.sacar(estado, items, azar); estado = r.estado; ids.push(r.item?.id ?? null); }
  return { estado, ids };
}

for (const { nombre, banco } of [{ nombre: 'banco de prueba', banco: MINI }, ...bancosReales()]) {
  const items = B.aplanar(banco);
  const publicas = items.filter(i => !banco.categorias.find(c => c.id === i.c).adultos);

  test(`${nombre} · los ids son únicos y estables`, () => {
    assert.equal(new Set(items.map(i => i.id)).size, items.length);
    assert.deepEqual(B.aplanar(banco).map(i => i.id), items.map(i => i.id));
  });

  test(`${nombre} · nunca repite hasta agotar la bolsa (${semillasPara(publicas.length)} partidas)`, () => {
    for (let s = 1; s <= semillasPara(publicas.length); s++) {
      const { ids } = sacarVarias(B.estadoInicial(banco), items, azarCon(s), publicas.length);
      assert.equal(new Set(ids).size, publicas.length, `semilla ${s}`);
    }
  });

  test(`${nombre} · al agotar, vuelve a barajar sin repetir la última de inmediato`, () => {
    for (let s = 1; s <= semillasPara(publicas.length); s++) {
      const azar = azarCon(s);
      const { estado, ids } = sacarVarias(B.estadoInicial(banco), items, azar, publicas.length);
      const r = B.sacar(estado, items, azar);
      assert.ok(r.barajado, `semilla ${s}`);
      if (publicas.length > 1) assert.notEqual(r.item.id, ids.at(-1), `semilla ${s}`);
      assert.equal(B.conteo(r.estado, items).vistas, 1);
    }
  });

  test(`${nombre} · solo salen preguntas de las categorías activas; +18 arranca apagada`, () => {
    const estado = B.estadoInicial(banco);
    assert.ok(banco.categorias.filter(c => c.adultos).every(c => !estado.activas.includes(c.id)));
    const una = banco.categorias[0].id;
    let soloUna = { ...estado, activas: [una] };
    const { ids } = sacarVarias(soloUna, items, azarCon(7), items.length * 2);
    assert.ok(ids.every(id => id.startsWith(una + ':')));
  });

  test(`${nombre} · descartar es para siempre, aun después de barajar`, () => {
    for (let s = 1; s <= Math.min(50, semillasPara(publicas.length)); s++) {
      const azar = azarCon(s);
      let { estado, item } = B.sacar(B.estadoInicial(banco), items, azar);
      estado = B.descartar(estado);
      const { ids } = sacarVarias(estado, items, azar, publicas.length * 3);
      assert.ok(!ids.includes(item.id), `semilla ${s}`);
    }
  });

  test(`${nombre} · el estado sobrevive a guardar y cargar (JSON) y se limpia contra el banco`, () => {
    const { estado } = sacarVarias(B.estadoInicial(banco), items, azarCon(3), 5);
    const cargado = B.limpiar(JSON.parse(JSON.stringify(estado)), banco);
    assert.deepEqual(cargado, estado);
  });
}

test('las respuestas prohibidas llegan con la pregunta y no cambian su id', () => {
  const items = B.aplanar(MINI);
  const b2 = items.find(i => i.q === 'B2.');
  assert.deepEqual(b2.no, ['obvia']);
  assert.equal(b2.id, B.idDe('b', 'B2.'));
  assert.deepEqual(items.find(i => i.q === 'B1.').no, []);
});

test('las opciones salen barajadas, pero siempre en el mismo orden para la misma pregunta', () => {
  const opciones = ['uno', 'dos', 'tres', 'cuatro'];
  const banco = { categorias: [{ id: 'o', adultos: false, preguntas: Array.from({ length: 40 }, (_, i) => ({ q: `P${i}.`, opciones })) }] };
  const a = B.aplanar(banco), b = B.aplanar(banco);
  assert.deepEqual(a.map(i => i.opciones), b.map(i => i.opciones), 'mismo orden siempre');
  assert.ok(a.every(i => [...i.opciones].sort().join() === [...opciones].sort().join()), 'no se pierde ni se repite ninguna');
  const primeras = new Set(a.map(i => i.opciones[0]));
  assert.ok(primeras.size >= 3, `la primera opción varía entre preguntas (${[...primeras]})`);
});

test('pregunta anterior: vuelve a la de antes y no se pasa del inicio', () => {
  const items = B.aplanar(MINI);
  let { estado, ids } = sacarVarias(B.estadoInicial(MINI), items, azarCon(1), 3);
  estado = B.anterior(estado);
  assert.equal(B.actual(estado, items).id, ids[1]);
  estado = B.anterior(B.anterior(B.anterior(estado)));
  assert.equal(B.actual(estado, items).id, ids[0]);
  assert.equal(B.hayAnterior(estado), false);
});

test('se pueden apagar todas las categorías y entonces no sale ninguna pregunta', () => {
  const items = B.aplanar(MINI);
  let estado = B.sacar(B.estadoInicial(MINI), items, azarCon(1)).estado;
  estado = B.alternar(B.alternar(estado, 'a'), 'b');
  assert.deepEqual(estado.activas, []);
  assert.equal(B.actual(estado, items), null, 'la pregunta en pantalla desaparece');
  assert.equal(B.sacar(estado, items, azarCon(2)).item, null);
  assert.equal(B.conteo(estado, items).total, 0);
});

test('al apagar una categoría, su pregunta deja de estar en pantalla y el conteo solo cuenta las activas', () => {
  const items = B.aplanar(MINI);
  let { estado, item } = B.sacar({ ...B.estadoInicial(MINI), activas: ['a'] }, items, azarCon(4));
  estado = B.alternar(B.alternar(estado, 'b'), 'a');
  assert.equal(B.actual(estado, items), null);
  assert.equal(B.conteo(estado, items).total, 2);
  assert.ok(item.c === 'a');
});

test('"Todas" prende las públicas sin las +18; si ya están todas, las quita todas', () => {
  let estado = B.alternarTodas({ ...B.estadoInicial(MINI), activas: ['a'] }, MINI);
  assert.deepEqual([...estado.activas].sort(), ['a', 'b']);
  assert.ok(B.todasActivas(estado, MINI));
  estado = B.alternarTodas(B.alternar(estado, 'x'), MINI);
  assert.deepEqual(estado.activas, []);
});

test('cero categorías guardadas se respeta al volver a abrir', () => {
  assert.deepEqual(B.limpiar({ activas: [] }, MINI).activas, []);
});

test('si todo está descartado, no saca nada (y no se rompe)', () => {
  const items = B.aplanar(MINI);
  let estado = { ...B.estadoInicial(MINI), activas: ['b'] };
  for (let i = 0; i < 2; i++) { estado = B.sacar(estado, items, azarCon(i)).estado; estado = B.descartar(estado); }
  assert.equal(B.sacar(estado, items, azarCon(9)).item, null);
  assert.equal(B.sacar(B.recuperarDescartadas(estado), items, azarCon(9)).item.c, 'b');
});

test('el azar en los extremos (0 y casi 1) no se sale de la lista', () => {
  const items = B.aplanar(MINI);
  for (const valor of [0, 0.9999999999]) assert.ok(B.sacar(B.estadoInicial(MINI), items, () => valor).item);
});

test('limpiar tolera basura: estado nulo, ids viejos y categorías que ya no existen', () => {
  for (const basura of [null, 'x', 42, {}, { activas: ['no-existe'], vistas: ['a:viejo'], historial: 'mal' }]) {
    const e = B.limpiar(basura, MINI);
    assert.deepEqual(e.activas.sort(), ['a', 'b']);
    assert.deepEqual([e.vistas, e.descartadas, e.historial], [[], [], []]);
  }
});

test('el reparto es parejo: en muchas vueltas cada pregunta sale primera con frecuencia similar', () => {
  const items = B.aplanar(MINI).filter(i => i.c !== 'x');
  const veces = Object.fromEntries(items.map(i => [i.id, 0]));
  const N = 5000;
  for (let s = 1; s <= N; s++) veces[B.sacar(B.estadoInicial(MINI), items, azarCon(s)).item.id]++;
  const esperado = N / items.length;
  for (const [id, n] of Object.entries(veces)) assert.ok(Math.abs(n - esperado) < esperado * 0.15, `${id}: ${n} vs ~${esperado}`);
});
