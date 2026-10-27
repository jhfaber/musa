// Pruebas de la lógica de Risk (sin navegador). Uso: node herramientas/probar-risk.mjs
import assert from 'node:assert/strict';
import { aplicar, AJUSTES_BASE, COLORES, totalReclamo, equipoActual, proximoReclamo, vencido, ordenTurnos } from '../juegos/risk/logica/reglas.js';
import { mapasIniciales, crearMapa, agregarContinente, editarContinente, migrarMapas } from '../juegos/risk/logica/mapas.js';
import { resolver, frase, probabilidades, dadosAtaque, dadosDefensa } from '../juegos/risk/logica/dados.js';

const aj = { ...AJUSTES_BASE, mapas: mapasIniciales() };
const equipos = [
  { id: 'azul', nombre: 'Equipo Azul', color: '#00f' },
  { id: 'rojo', nombre: 'Equipo Rojo', color: '#f00' },
  { id: 'verde', nombre: 'Equipo Verde', color: '#0f0' }
];

let reloj = 1_000_000;
let p = null;
const hacer = (tipo, datos = {}, ajustes = aj) => { p = aplicar(p, { tipo, ahora: reloj, ...datos }, ajustes); return p; };
// Avanza el tiempo de a 1 s, como el latido de la app
const pasar = segundos => {
  for (let s = 0; s < segundos; s++) {
    reloj += 1000;
    if (vencido(p, reloj)) hacer('tiempo');
  }
};
const turnoCompleto = () => { hacer('siguiente'); hacer('cuentaYa'); };

const pruebas = [];
const prueba = (nombre, fn) => pruebas.push([nombre, fn]);

prueba('una partida nueva empieza en la ronda 1 con 7 tropas y la cuenta corriendo', () => {
  hacer('empezar', { equipos, inicio: 0 });
  assert.equal(p.ronda, 1);
  assert.equal(totalReclamo(p, aj), 7);
  assert.equal(p.fase, 'turno');
  assert.ok(p.cuenta.corriendo);
  pasar(11);
  assert.equal(p.cuenta, null);
  assert.equal(p.reloj.estado, 'corre');
});

prueba('tropas = configuradas + continentes: Asia da 7 al conquistarla, luego 14 y 21', () => {
  hacer('continente', { cont: 'asia', equipo: 'azul' });
  assert.equal(totalReclamo(p, aj), 14);
  turnoCompleto(); turnoCompleto(); turnoCompleto();
  assert.equal(equipoActual(p).id, 'azul');
  assert.equal(p.ronda, 2);
  assert.equal(totalReclamo(p, aj), 7 + 14);
  turnoCompleto(); turnoCompleto(); turnoCompleto();
  assert.equal(totalReclamo(p, aj), 7 + 21);
  assert.equal(proximoReclamo(p, aj, p.equipos[0]), 7 + 28);
});

prueba('"ya no lo tenía" lo quita del reclamo; al recuperarlo empieza otra vez en ×1', () => {
  hacer('noLoTenia', { cont: 'asia' });
  assert.equal(totalReclamo(p, aj), 7);
  hacer('continente', { cont: 'asia', equipo: 'azul' });
  assert.equal(totalReclamo(p, aj), 14);
});

prueba('un solo reloj por turno (2:15); al acabarse pasa al siguiente equipo', () => {
  hacer('nueva');
  hacer('empezar', { equipos, inicio: 0 });
  hacer('cuentaYa');
  assert.equal(p.fase, 'turno');
  pasar(134);
  assert.equal(equipoActual(p).id, 'azul');
  pasar(2);
  assert.equal(equipoActual(p).id, 'rojo');
  assert.ok(p.cuenta.porTiempo);
});

prueba('+20 s al anterior: vuelve a su turno 20 segundos y luego sigue la cuenta del siguiente', () => {
  hacer('prorroga');
  assert.equal(equipoActual(p).id, 'azul');
  assert.equal(p.cuenta, null);
  assert.equal(p.reloj.estado, 'corre');
  pasar(19);
  assert.equal(equipoActual(p).id, 'azul');
  pasar(2);
  assert.equal(equipoActual(p).id, 'rojo');
  assert.ok(p.cuenta);
  pasar(11);
  assert.equal(p.prorroga, false, 'el turno de Rojo es normal');
});

prueba('el tiempo nunca se detiene solo: sin tocar nada, la partida sigue avanzando', () => {
  pasar(136);                // se acaba el turno de Rojo sin que nadie toque
  assert.equal(equipoActual(p).id, 'verde');
  assert.ok(p.cuenta.corriendo);
});

prueba('la pausa detiene el reloj y conserva el tiempo; seguir lo retoma', () => {
  hacer('cuentaYa');
  pasar(30);
  hacer('reloj');
  assert.equal(p.reloj.estado, 'pausa');
  assert.equal(Math.round(p.reloj.restante), 135 - 30);
  pasar(600);
  assert.equal(Math.round(p.reloj.restante), 135 - 30, 'en pausa no corre');
  hacer('reloj');
  assert.equal(p.reloj.estado, 'corre');
});

prueba('vender cartas: 5 estrellas suman 10 tropas; tocar otra vez lo quita', () => {
  const antes = totalReclamo(p, aj);
  hacer('venta', { estrellas: 5 });
  assert.equal(totalReclamo(p, aj), antes + 10);
  hacer('venta', { estrellas: 5 });
  assert.equal(totalReclamo(p, aj), antes);
});

const orden = () => ordenTurnos(p, aj).map(e => e.id).join(',');

prueba('un equipo ausente se salta', () => {
  hacer('nueva');
  hacer('empezar', { equipos, inicio: 0 });
  hacer('ausente', { equipo: 'rojo' });
  assert.equal(orden(), 'azul,verde');
  turnoCompleto();
  assert.equal(equipoActual(p).id, 'verde');
});

prueba('si se va en su turno, sigue el próximo; al volver juega justo después del que está jugando', () => {
  hacer('nueva');
  hacer('empezar', { equipos, inicio: 0 });
  hacer('cuentaYa');
  hacer('ausente', { equipo: 'azul' });      // Azul se va en su turno
  assert.equal(equipoActual(p).id, 'rojo');
  assert.ok(p.cuenta, 'aparece la cuenta del siguiente');
  hacer('cuentaYa');
  hacer('ausente', { equipo: 'azul' });      // Azul volvió
  assert.equal(orden(), 'rojo,azul,verde');
  turnoCompleto();
  assert.equal(equipoActual(p).id, 'azul');
  assert.equal(p.ronda, 1);
  turnoCompleto();
  assert.equal(equipoActual(p).id, 'verde');
  turnoCompleto();
  assert.equal(equipoActual(p).id, 'azul');
  assert.equal(p.ronda, 2);
});

prueba('si se fue en su cuenta regresiva, también lo debe; ronda entera sin él: pierde ese turno', () => {
  hacer('nueva');
  hacer('empezar', { equipos, inicio: 0 });
  hacer('ausente', { equipo: 'rojo' });      // Rojo no está desde el principio
  turnoCompleto();                           // Verde (Rojo se saltó en la ronda 1)
  turnoCompleto();                           // Azul, ronda 2: ya pasó una ronda entera sin Rojo
  assert.equal(p.ronda, 2);
  hacer('ausente', { equipo: 'rojo' });      // vuelve: perdió el turno de la ronda 1
  assert.equal(orden(), 'azul,rojo,verde');  // juega en su lugar de siempre
  hacer('siguiente');
  hacer('cuentaAusente');                    // en la cuenta de Rojo: se fue otra vez
  assert.equal(equipoActual(p).id, 'verde');
  hacer('volvio', { equipo: 'rojo' });
  assert.equal(orden(), 'verde,rojo,azul');
});

prueba('deshacer vuelve al turno anterior', () => {
  const antes = equipoActual(p).id;
  hacer('cuentaYa');
  turnoCompleto();
  hacer('deshacer');
  assert.equal(equipoActual(p).id, antes);
  assert.equal(p.reloj.estado, 'espera');
});

prueba('la partida termina tras las rondas y en la última ronda se avisa', () => {
  const corta = { ...aj, rondas: 2 };
  hacer('nueva');
  hacer('empezar', { equipos, inicio: 1 }, corta);
  for (let i = 0; i < 5; i++) hacer('siguiente', {}, corta);
  assert.equal(p.ronda, 2);
  assert.equal(p.terminada, false);
  hacer('siguiente', {}, corta);
  assert.equal(p.terminada, true);
  assert.equal(p.cuenta, null);
});

prueba('nueva partida borra todo y la siguiente empieza limpia', () => {
  hacer('nueva');
  assert.equal(p, null);
  hacer('empezar', { equipos, inicio: 2 });
  assert.equal(p.ronda, 1);
  assert.deepEqual(p.dominio, {});
  assert.equal(equipoActual(p).id, 'verde');
});

prueba('mapa propio: "Gondor" con bono 4 se reclama al conquistarlo', () => {
  let { mapas, id } = crearMapa(aj.mapas, 'Mi mapa');
  mapas = agregarContinente(mapas, id);
  const cont = mapas[id].continentes[0].id;
  mapas = editarContinente(mapas, id, cont, { nombre: 'Gondor', simbolo: '🏰', bono: 4 });
  const conMapa = { ...aj, mapas };
  hacer('nueva');
  hacer('empezar', { equipos, inicio: 0, mapa: id }, conMapa);
  hacer('continente', { cont, equipo: 'azul' }, conMapa);
  assert.equal(totalReclamo(p, conMapa), 11);
});

prueba('ajustes viejos con bonos pasan al mapa normal', () => {
  const mapas = migrarMapas({ bonos: { asia: 9 } });
  assert.equal(mapas.normal.continentes.find(c => c.id === 'asia').bono, 9);
});

prueba('dados: 6-4-1 contra 5-4 → cada uno pierde 1; empate gana el defensor', () => {
  const r = resolver([1, 6, 4], [4, 5]);
  assert.deepEqual(r.a, [6, 4, 1]);
  assert.equal(frase(r), 'Cada uno pierde 1 tropa');
  assert.equal(frase(resolver([4, 1, 1], [4, 2])), 'El atacante pierde 2 tropas');
});

prueba('probabilidades exactas de 3 contra 2: 2890 / 2611 / 2275 de 7776', () => {
  assert.deepEqual(probabilidades(3, 2).map(x => x.casos), [2890, 2611, 2275]);
});

prueba('hasta 10 equipos: todos juegan una vez por ronda', () => {
  const diez = COLORES.map(c => ({ id: c.id, nombre: c.nombre, color: c.color }));
  assert.equal(diez.length, 10);
  hacer('nueva');
  hacer('empezar', { equipos: diez, inicio: 0 });
  for (let i = 0; i < 9; i++) hacer('siguiente');
  assert.equal(p.ronda, 1);
  assert.equal(equipoActual(p).id, 'cafe');
  hacer('siguiente');
  assert.equal(p.ronda, 2);
});

prueba('dados según fichas: 4 fichas atacan con 3, 1 ficha no ataca', () => {
  assert.equal(dadosAtaque(4), 3);
  assert.equal(dadosAtaque(10), 3);
  assert.equal(dadosAtaque(1), 0);
  assert.equal(dadosDefensa(1), 1);
  assert.equal(dadosDefensa(5), 2);
});

let fallas = 0;
for (const [nombre, fn] of pruebas) {
  try {
    fn();
    console.log(`✓ ${nombre}`);
  } catch (e) {
    fallas++;
    console.log(`✗ ${nombre}\n  ${e.message}`);
  }
}
console.log(fallas ? `\n${fallas} prueba(s) fallaron` : `\nTodas las ${pruebas.length} pruebas pasaron`);
process.exit(fallas ? 1 : 0);
