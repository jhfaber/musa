// Reglas de Risk Relámpago (puro: sin pantalla, sin almacenamiento, sin Date.now()).
// aplicar(partida, accion, ajustes) devuelve la partida nueva; accion.ahora trae la hora.
// La partida es solo datos, incluidos los relojes, así que reiniciar o recargar nunca deja tiempos "vivos".
import { MAPA_NORMAL, continentesDe } from './mapas.js';

export const COLORES = [
  { id: 'azul', nombre: 'Azul', color: '#3d7be0' },
  { id: 'rojo', nombre: 'Rojo', color: '#d8443c' },
  { id: 'verde', nombre: 'Verde', color: '#3aa05a' },
  { id: 'amarillo', nombre: 'Amarillo', color: '#e9c03a' },
  { id: 'negro', nombre: 'Negro', color: '#34343c' },
  { id: 'blanco', nombre: 'Blanco', color: '#f4f1ea' },
  { id: 'morado', nombre: 'Morado', color: '#8e55c9' },
  { id: 'naranja', nombre: 'Naranja', color: '#ee8a2e' },
  { id: 'rosado', nombre: 'Rosado', color: '#e66aa8' },
  { id: 'cafe', nombre: 'Café', color: '#8a5a3c' }
];

export const MAX_EQUIPOS = COLORES.length; // hasta 10 ejércitos

export const AJUSTES_BASE = {
  tropas: 7,              // tropas que reclama cada equipo por turno
  rondas: 6,              // el reglamento dice de 6 a 9
  turno: 135,             // un solo reloj por turno: 2:15
  cuenta: 10,             // segundos para que el siguiente equipo se prepare
  maxCartas: 5,
  costoLider: 10,         // unidades que cuesta comprar un líder
  maxLideres: 2,          // líderes que puede tener cada equipo           // cartas máximas que se reclaman al final de un turno por territorios conquistados
  prorroga: 20,           // segundos extra que se le pueden dar al equipo anterior desde la cuenta regresiva
  mapa: MAPA_NORMAL,      // mapa con el que empieza la próxima partida
  vista: 'arena',
  sonido: true,
  vibrar: true,
  tictac: false
};

// Venta de cartas de territorio: estrellas → tropas (tabla del reglamento)
export const VENTA_CARTAS = { 2: 2, 3: 4, 4: 7, 5: 10, 6: 13, 7: 17, 8: 21, 9: 25, 10: 30 };
export const tropasPorEstrellas = estrellas => VENTA_CARTAS[estrellas] || 0;

export const LIMITES = { tropas: [1, 30], rondas: [1, 15], cuenta: [3, 30], prorroga: [5, 120], maxCartas: [1, 10], costoLider: [1, 30], maxLideres: [1, 3] };

// Cartas al final del turno: 1 por territorio conquistado, hasta el máximo acordado (en la última ronda, ninguna)
export const cartasPorConquista = (territorios, aj) => Math.min(territorios, aj.maxCartas);

// ---------- Consultas (no cambian nada) ----------

export const equipoActual = p => p.equipos[p.turno];
export const equipoPorId = (p, id) => p.equipos.find(e => e.id === id);
export const esUltimaRonda = (p, aj) => p.ronda >= aj.rondas;
export const continentes = (p, aj) => continentesDe(aj, p.mapa);
export const bono = (p, aj, contId) => (continentes(p, aj).find(c => c.id === contId) || { bono: 0 }).bono;

export function duracion(p, aj) {
  return p.prorroga ? aj.prorroga : aj.turno;
}

export function restanteReloj(p, aj, ahora) {
  const r = p.reloj;
  if (r.estado === 'corre') return Math.max(0, (r.terminaEn - ahora) / 1000);
  if (r.estado === 'pausa') return r.restante;
  if (r.estado === 'fin') return 0;
  return duracion(p, aj);
}

export function restanteCuenta(p, aj, ahora) {
  const c = p.cuenta;
  if (!c) return 0;
  return c.corriendo ? Math.max(0, (c.terminaEn - ahora) / 1000) : c.restante;
}

// ¿Venció algún tiempo? (el latido lo pregunta y entonces despacha { tipo: 'tiempo' })
export const vencido = (p, ahora) => Boolean(p && !p.terminada && (
  (p.cuenta && p.cuenta.corriendo && ahora >= p.cuenta.terminaEn) ||
  (!p.cuenta && p.reloj.estado === 'corre' && ahora >= p.reloj.terminaEn)));

// Desglose de lo que reclama el equipo en turno
export function partesReclamo(p, aj) {
  const r = p.reclamo;
  const conts = continentes(p, aj);
  const nombre = id => conts.find(c => c.id === id);
  return {
    base: r.base,
    venta: r.venta ? { estrellas: r.venta, tropas: tropasPorEstrellas(r.venta) } : null,
    partes: r.partes.filter(x => nombre(x.cont)).map(x => ({ ...x, continente: nombre(x.cont), tropas: bono(p, aj, x.cont) * x.mult })),
    ahora: r.ahora.filter(id => nombre(id)).map(id => ({ cont: id, continente: nombre(id), tropas: bono(p, aj, id) }))
  };
}

export function totalReclamo(p, aj) {
  const d = partesReclamo(p, aj);
  return d.base + (d.venta ? d.venta.tropas : 0) + d.partes.reduce((s, x) => s + x.tropas, 0) + d.ahora.reduce((s, x) => s + x.tropas, 0);
}

const posicion = (p, i) => (i - p.inicio + p.equipos.length) % p.equipos.length;

// Lo que reclamaría un equipo en su próximo turno si conserva sus continentes
export function proximoReclamo(p, aj, eq) {
  const i = p.equipos.indexOf(eq);
  // Los que recuperan su turno lo juegan en esta misma ronda
  const siguienteRonda = !p.pendientes.includes(eq.id) && (i === p.turno || posicion(p, i) < posicion(p, p.cursor));
  const ronda = p.ronda + (siguienteRonda ? 1 : 0);
  let total = aj.tropas;
  for (const c of continentes(p, aj)) {
    const d = p.dominio[c.id];
    if (d && d.equipo === eq.id) total += c.bono * (d.turnos + 1);
  }
  return total;
}

// Turnos que ha terminado y tropas que ha reclamado en toda la partida
export const estadisticas = eq => ({ jugados: eq.jugados || 0, reclamadas: eq.reclamadas || 0 });

export const continentesDeEquipo = (p, aj, eq) => continentes(p, aj)
  .filter(c => p.dominio[c.id] && p.dominio[c.id].equipo === eq.id)
  .map(c => ({ ...c, mult: Math.max(1, p.dominio[c.id].turnos) }));

// Quién juega después del equipo en turno (null si es el último turno de la partida)
export const quienSigue = (p, aj) => ordenTurnos(p, aj)[1] || null;

// Los próximos turnos en orden, empezando por el que juega (incluye a los que vuelven y deben su turno).
// Se calcula jugando en una copia, así que siempre coincide con lo que de verdad va a pasar.
// Cada equipo sale una sola vez, en su próximo turno.
export function ordenTurnos(p, aj) {
  const copia = structuredClone({ ...p, deshacer: [] });
  const orden = [equipoActual(copia).id];
  const presentes = p.equipos.filter(e => !e.ausente).length;
  for (let paso = 0; orden.length < presentes && paso < p.equipos.length * 2; paso++) {
    avanzar(copia, aj);
    if (copia.terminada) break;
    const id = equipoActual(copia).id;
    if (!orden.includes(id)) orden.push(id);
  }
  return orden.map(id => equipoPorId(p, id));
}

// ---------- Cambios internos (trabajan sobre una copia) ----------

// Pasa al siguiente equipo. Primero juegan los que volvieron y deben su turno (pendientes); luego sigue el
// orden normal (cursor). Los ausentes se saltan y quedan debiendo ese turno; al dar la vuelta empieza otra ronda.
function avanzar(p, aj) {
  p.pendientes = p.pendientes.filter(id => !equipoPorId(p, id).ausente);
  if (p.pendientes.length) {
    const id = p.pendientes.shift();
    p.turno = p.equipos.findIndex(e => e.id === id);
    return;
  }
  const n = p.equipos.length;
  let siguiente = null;
  let nuevaRonda = false;
  for (let j = 1; j <= n; j++) {
    const c = (p.cursor + j) % n;
    if (posicion(p, c) === 0) nuevaRonda = true;
    if (!p.equipos[c].ausente) { siguiente = c; break; }
    p.equipos[c].debe = p.ronda + (nuevaRonda ? 1 : 0); // ronda en la que se saltó su turno
  }
  if (siguiente === null) { siguiente = (p.cursor + 1) % n; nuevaRonda = posicion(p, siguiente) === 0; }
  if (nuevaRonda) {
    if (p.ronda >= aj.rondas) { p.terminada = true; return; }
    p.ronda += 1;
  }
  p.cursor = siguiente;
  p.turno = siguiente;
}

// Se va: deja de jugar hasta que vuelva. Si era su turno (o su cuenta regresiva), su turno se deshace
// (vuelve al estado de antes de empezarlo), queda debiéndolo y sigue el próximo de la lista.
function irse(p, aj, ahora, id) {
  const esSuTurno = equipoActual(p).id === id && !p.terminada;
  if (!esSuTurno) {
    equipoPorId(p, id).ausente = true;
    return p;
  }
  const base = p.deshacer.length ? volverAtras(p, aj) : p;
  const e = equipoPorId(base, id);
  e.ausente = true;
  e.debe = base.ronda;
  base.pendientes = base.pendientes.filter(x => x !== id);
  if (base === p) p.cuenta = null; // primer turno de la partida: no hay a dónde volver
  if (base !== p && equipoActual(base).id === id) return siguienteTurno(base, aj, ahora, false, false, false);
  return siguienteTurno(base, aj, ahora, false, base !== p, base !== p);
}

// Vuelve: si se saltó su turno en esta ronda, lo juega justo después del equipo que está jugando.
// Si ya pasó una ronda entera sin él, pierde ese turno y sigue en su lugar de siempre.
function volver(p, id) {
  const e = equipoPorId(p, id);
  e.ausente = false;
  if (e.debe === p.ronda && !p.pendientes.includes(id)) p.pendientes.push(id);
  e.debe = null;
  return p;
}

// Al empezar el turno de un equipo, cada continente que sigue teniendo sube su multiplicador (×2, ×3…)
function prepararTurno(p, aj) {
  const e = equipoActual(p);
  const partes = [];
  for (const c of continentes(p, aj)) {
    const d = p.dominio[c.id];
    if (d && d.equipo === e.id) {
      d.turnos += 1;
      partes.push({ cont: c.id, mult: d.turnos });
    }
  }
  // Tropas del turno = las configuradas + cada continente que sostiene (× turnos) + cartas vendidas
  p.reclamo = { equipo: e.id, base: aj.tropas, partes, ahora: [], venta: 0 };
  p.fase = 'turno';
  p.prorroga = false;
  p.reloj = { estado: 'espera', terminaEn: 0, restante: null };
}

// Cuenta regresiva a pantalla completa para el equipo que sigue. El tiempo nunca se detiene solo:
// para eso están los botones de pausa.
function abrirCuenta(p, aj, ahora, { anterior = null, porTiempo = false }) {
  p.cuenta = {
    anterior, porTiempo,
    corriendo: true,
    terminaEn: ahora + aj.cuenta * 1000,
    restante: aj.cuenta
  };
}

function arrancarTurno(p, aj, ahora) {
  p.cuenta = null;
  p.reloj = { estado: 'corre', terminaEn: ahora + duracion(p, aj) * 1000, restante: null };
}

function guardarDeshacer(p) {
  const { deshacer, ...resto } = p;
  p.deshacer = [...deshacer, JSON.stringify({ ...resto, cuenta: null })].slice(-10);
}

function volverAtras(p, aj) {
  const pila = [...p.deshacer];
  const anterior = JSON.parse(pila.pop());
  if (anterior.fase === 'fin') anterior.fase = 'turno';
  return { ...anterior, deshacer: pila, cuenta: null, terminada: false, reloj: { estado: 'espera', terminaEn: 0, restante: null } };
}

// guardar = false cuando el estado ya viene de deshacer (para no guardar dos veces el mismo punto).
// contar = false cuando el equipo en turno no jugó (se fue antes de terminar).
function siguienteTurno(p, aj, ahora, porTiempo, guardar = true, contar = true) {
  const anterior = equipoActual(p);
  if (guardar) guardarDeshacer(p);
  // El turno que termina cuenta para el equipo (después de guardar el punto de deshacer, así ↶ o +20 s no lo cuentan dos veces)
  if (contar) {
    anterior.jugados = (anterior.jugados || 0) + 1;
    anterior.reclamadas = (anterior.reclamadas || 0) + totalReclamo(p, aj);
  }
  avanzar(p, aj);
  if (p.terminada) {
    p.cuenta = null;
    p.reloj = { estado: 'fin', terminaEn: 0, restante: 0 };
    return p;
  }
  prepararTurno(p, aj);
  abrirCuenta(p, aj, ahora, { anterior: anterior.id, porTiempo });
  return p;
}

// Venció un tiempo: termina la cuenta (arranca el turno) o el reloj del turno
function tiempo(p, aj, ahora) {
  if (p.cuenta) {
    if (p.cuenta.corriendo && ahora >= p.cuenta.terminaEn) arrancarTurno(p, aj, ahora);
    return p;
  }
  if (p.reloj.estado !== 'corre' || ahora < p.reloj.terminaEn) return p;
  p.fase = 'fin';              // ninguna acción más: sigue el otro equipo
  return siguienteTurno(p, aj, ahora, true);
}

function tocarReloj(p, aj, ahora) {
  const r = p.reloj;
  if (r.estado === 'fin' || p.fase === 'fin') return siguienteTurno(p, aj, ahora, false);
  if (r.estado === 'corre') p.reloj = { estado: 'pausa', terminaEn: 0, restante: restanteReloj(p, aj, ahora) };
  else p.reloj = { estado: 'corre', terminaEn: ahora + restanteReloj(p, aj, ahora) * 1000, restante: null };
  return p;
}

// Terminar antes de las rondas: va a la pantalla final. Si el equipo en turno ya estaba jugando, su turno cuenta.
// Se puede volver con ↶.
function finalizar(p, aj) {
  guardarDeshacer(p);
  const e = equipoActual(p);
  if (!p.cuenta && p.reloj.estado !== 'espera') {
    e.jugados = (e.jugados || 0) + 1;
    e.reclamadas = (e.reclamadas || 0) + totalReclamo(p, aj);
  }
  p.terminada = true;
  p.finalizada = true;
  p.cuenta = null;
  p.reloj = { estado: 'fin', terminaEn: 0, restante: 0 };
  return p;
}

// Desde la cuenta regresiva: el equipo anterior vuelve a su turno con unos segundos más (ajuste prorroga) (para reubicar o si algo pasó).
// Al acabarse, sigue la cuenta del siguiente como siempre.
function darProrroga(p, aj, ahora) {
  if (!p.cuenta || !p.cuenta.anterior || !p.deshacer.length) return p;
  const anterior = volverAtras(p, aj);
  anterior.prorroga = true;
  anterior.reloj = { estado: 'corre', terminaEn: ahora + aj.prorroga * 1000, restante: null };
  return anterior;
}

function pausarCuenta(p, aj, ahora) {
  const c = p.cuenta;
  if (c.corriendo) Object.assign(c, { corriendo: false, restante: restanteCuenta(p, aj, ahora) });
  else Object.assign(c, { corriendo: true, terminaEn: ahora + c.restante * 1000 });
  return p;
}

// Conquistar en el propio turno da sus tropas de una vez (×1); a otro equipo se le cuenta desde su próximo turno
function asignarContinente(p, contId, equipoId) {
  const d = p.dominio[contId];
  const r = p.reclamo;
  if (d && d.equipo === equipoId) {
    delete p.dominio[contId];
    r.ahora = r.ahora.filter(id => id !== contId);
    return p;
  }
  const enSuTurno = r.equipo === equipoId;
  p.dominio[contId] = { equipo: equipoId, turnos: enSuTurno ? 1 : 0 };
  if (d && d.equipo === r.equipo) r.partes = r.partes.filter(x => x.cont !== contId); // se lo quitaron al que juega
  if (enSuTurno && !r.partes.some(x => x.cont === contId) && !r.ahora.includes(contId)) r.ahora.push(contId);
  return p;
}

// "Ya no lo tenía" al empezar el turno: se quita del reclamo y del equipo
function noLoTenia(p, contId) {
  const r = p.reclamo;
  r.partes = r.partes.filter(x => x.cont !== contId);
  r.ahora = r.ahora.filter(id => id !== contId);
  if (p.dominio[contId] && p.dominio[contId].equipo === r.equipo) delete p.dominio[contId];
  return p;
}

export function crearPartida({ equipos, inicio = 0, mapa = MAPA_NORMAL }, aj, ahora) {
  const p = {
    v: 2, creada: ahora, mapa, equipos: equipos.map(e => ({ ...e, ausente: false, debe: null, jugados: 0, reclamadas: 0 })), inicio, turno: inicio, cursor: inicio,
    ronda: 1, pendientes: [], terminada: false, dominio: {}, deshacer: [], cuenta: null
  };
  prepararTurno(p, aj);
  abrirCuenta(p, aj, ahora, {});
  return p;
}

// ---------- La única puerta para cambiar la partida ----------

export function aplicar(partida, accion, aj) {
  const { tipo, ahora } = accion;
  if (tipo === 'empezar') return crearPartida(accion, aj, ahora);
  if (tipo === 'nueva') return null;
  if (!partida) return partida;

  const p = structuredClone(partida);
  if (tipo === 'tiempo') return tiempo(p, aj, ahora);

  switch (tipo) {
    case 'reloj': return tocarReloj(p, aj, ahora);
    case 'siguiente': return siguienteTurno(p, aj, ahora, false);
    case 'cuentaPausa': return p.cuenta ? pausarCuenta(p, aj, ahora) : p;
    case 'cuentaYa': arrancarTurno(p, aj, ahora); return p;
    case 'cuentaCerrar': p.cuenta = null; return p;
    case 'prorroga': return darProrroga(p, aj, ahora);
    case 'cuentaAusente': return irse(p, aj, ahora, equipoActual(p).id);
    case 'continente': return asignarContinente(p, accion.cont, accion.equipo);
    case 'noLoTenia': return noLoTenia(p, accion.cont);
    case 'venta': p.reclamo.venta = p.reclamo.venta === Number(accion.estrellas) ? 0 : Number(accion.estrellas); return p;
    case 'ausente': return equipoPorId(p, accion.equipo).ausente ? volver(p, accion.equipo) : irse(p, aj, ahora, accion.equipo);
    case 'volvio': return volver(p, accion.equipo);
    case 'renombrar': { const e = equipoPorId(p, accion.equipo); if (accion.nombre.trim()) e.nombre = accion.nombre.trim(); return p; }
    case 'deshacer': return p.deshacer.length ? { ...volverAtras(p, aj), finalizada: false } : p;
    case 'finalizar': return p.terminada ? p : finalizar(p, aj);
    case 'ganador': if (p.terminada) p.ganador = p.ganador === accion.equipo ? null : accion.equipo; return p;
    default: return partida;
  }
}
