// Mapas y continentes (puro: sin pantalla ni almacenamiento).
// Un mapa es { nombre, propio, continentes: [{ id, nombre, simbolo, bono }] }.

export const MAPA_NORMAL = 'normal';

// El bono de cada continente es el que trae impreso el tablero clásico; se cambia en ⚙
export const continentesNormales = () => [
  { id: 'norte', nombre: 'América del Norte', simbolo: '🗽', bono: 5 },
  { id: 'sur', nombre: 'América del Sur', simbolo: '🌴', bono: 2 },
  { id: 'europa', nombre: 'Europa', simbolo: '🏰', bono: 5 },
  { id: 'africa', nombre: 'África', simbolo: '🦁', bono: 3 },
  { id: 'asia', nombre: 'Asia', simbolo: '🐉', bono: 7 },
  { id: 'oceania', nombre: 'Oceanía', simbolo: '🦘', bono: 2 }
];

export const LIMITE_BONO = [0, 30];

export const mapasIniciales = () => ({
  [MAPA_NORMAL]: { nombre: 'Mapa normal', propio: false, continentes: continentesNormales() }
});

const nuevoId = prefijo => `${prefijo}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
const copiar = mapas => JSON.parse(JSON.stringify(mapas));

export const continentesDe = (ajustes, mapaId) => (ajustes.mapas[mapaId] || ajustes.mapas[MAPA_NORMAL]).continentes;

export function crearMapa(mapas, nombre) {
  const id = nuevoId('m');
  const nuevos = copiar(mapas);
  nuevos[id] = { nombre: nombre || 'Mi mapa', propio: true, continentes: [] };
  return { mapas: nuevos, id };
}

export function borrarMapa(mapas, id) {
  if (!mapas[id] || !mapas[id].propio) return mapas;
  const nuevos = copiar(mapas);
  delete nuevos[id];
  return nuevos;
}

export function renombrarMapa(mapas, id, nombre) {
  const nuevos = copiar(mapas);
  if (nuevos[id] && nuevos[id].propio && nombre.trim()) nuevos[id].nombre = nombre.trim();
  return nuevos;
}

export function agregarContinente(mapas, mapaId) {
  const nuevos = copiar(mapas);
  const lista = nuevos[mapaId].continentes;
  lista.push({ id: nuevoId('c'), nombre: `Continente ${lista.length + 1}`, simbolo: '🏳️', bono: 3 });
  return nuevos;
}

export function quitarContinente(mapas, mapaId, contId) {
  const nuevos = copiar(mapas);
  nuevos[mapaId].continentes = nuevos[mapaId].continentes.filter(c => c.id !== contId);
  return nuevos;
}

// cambio: { nombre?, simbolo?, bono? }. En el mapa normal solo se cambia el bono.
export function editarContinente(mapas, mapaId, contId, cambio) {
  const nuevos = copiar(mapas);
  const mapa = nuevos[mapaId];
  const c = mapa && mapa.continentes.find(x => x.id === contId);
  if (!c) return mapas;
  if (cambio.bono !== undefined) c.bono = Math.min(LIMITE_BONO[1], Math.max(LIMITE_BONO[0], Math.round(Number(cambio.bono) || 0)));
  if (mapa.propio && cambio.nombre !== undefined && cambio.nombre.trim()) c.nombre = cambio.nombre.trim();
  if (mapa.propio && cambio.simbolo !== undefined) c.simbolo = [...cambio.simbolo.trim()].slice(0, 2).join('') || '🏳️';
  return nuevos;
}

// Ajustes guardados por versiones anteriores: { bonos: { asia: 7 } } → bonos dentro del mapa normal
export function migrarMapas(guardados) {
  const mapas = guardados.mapas && guardados.mapas[MAPA_NORMAL] ? copiar(guardados.mapas) : mapasIniciales();
  if (guardados.bonos) {
    for (const c of mapas[MAPA_NORMAL].continentes) {
      if (guardados.bonos[c.id] !== undefined) c.bono = Number(guardados.bonos[c.id]) || 0;
    }
  }
  return mapas;
}
