// Almacén: guarda la partida y los ajustes, y es el único que los cambia.
// Las vistas despachan acciones; el almacén pide a las reglas el estado nuevo, lo guarda y avisa.
import { aplicar, AJUSTES_BASE, LIMITES, OPCIONES } from './logica/reglas.js';
import { migrarMapas, MAPA_NORMAL } from './logica/mapas.js';

const CLAVE_PARTIDA = 'musa.risk.partida.v2';   // la v1 (versión inicial) se descarta
const CLAVE_AJUSTES = 'musa.risk.ajustes.v1';
const TIEMPOS = ['turno'];

const limitar = (v, [min, max]) => Math.min(max, Math.max(min, Number(v) || min));

function cargarAjustes() {
  const guardados = Musa.leer(CLAVE_AJUSTES) || {};
  const a = { ...AJUSTES_BASE, ...guardados, mapas: migrarMapas(guardados) };
  delete a.bonos;
  for (const t of TIEMPOS) a[t] = Musa.reloj.ajustarSegundos(Number(a[t]) || AJUSTES_BASE[t]);
  for (const [clave, rango] of Object.entries(LIMITES)) a[clave] = limitar(a[clave], rango);
  if (!a.mapas[a.mapa]) a.mapa = MAPA_NORMAL;
  if (!Musa.reloj.VISTAS.some(v => v.id === a.vista)) a.vista = AJUSTES_BASE.vista;
  for (const [clave, valores] of Object.entries(OPCIONES)) if (!valores.includes(a[clave])) a[clave] = AJUSTES_BASE[clave];
  return a;
}

function cargarPartida() {
  const p = Musa.leer(CLAVE_PARTIDA);
  if (!p || p.v !== 2 || !Array.isArray(p.equipos)) return null;
  // Partidas guardadas antes del orden con regresos
  if (p.cursor === undefined) p.cursor = p.turno;
  if (!Array.isArray(p.pendientes)) p.pendientes = [];
  if (!p.creada) p.creada = Date.now();
  return p;
}

export function crearAlmacen() {
  let ajustes = cargarAjustes();
  let partida = cargarPartida();
  const oyentes = [];
  const avisar = (antes, accion) => oyentes.forEach(fn => fn(partida, antes, accion));

  return {
    get partida() { return partida; },
    get ajustes() { return ajustes; },

    despachar(accion) {
      const antes = partida;
      partida = aplicar(partida, { ...accion, ahora: Date.now() }, ajustes);
      if (partida === antes) return;
      Musa.guardar(CLAVE_PARTIDA, partida);
      avisar(antes, accion);
    },

    // cambio: { tropas: 10 } o una función ajustes → cambio
    cambiarAjustes(cambio) {
      const nuevo = typeof cambio === 'function' ? cambio(ajustes) : cambio;
      ajustes = { ...ajustes, ...nuevo };
      for (const [clave, rango] of Object.entries(LIMITES)) ajustes[clave] = limitar(ajustes[clave], rango);
      Musa.guardar(CLAVE_AJUSTES, ajustes);
      avisar(partida, { tipo: 'ajustes' });
    },

    escuchar(fn) { oyentes.push(fn); }
  };
}
