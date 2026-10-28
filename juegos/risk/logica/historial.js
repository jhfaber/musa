// Registro de ganadores (puro). Se guarda aparte de la partida: "Nueva partida" no lo borra.
// Cada registro: { partida, fecha, ganador: { nombre, color }, rivales: [nombres], rondas,
//                  tropas, turnos, continentes: [{ simbolo, nombre }] } (tropas reclamadas y continentes al final)

export const MAX_REGISTROS = 10;

// El ganador de una partida terminada. Si esa partida ya estaba en el registro, se reemplaza (se corrigió el
// ganador); si se quitó el ganador, se borra. Quedan los 10 más recientes, primero el último.
// continentes: los que tenía el ganador al terminar ([{ simbolo, nombre }])
export function anotarGanador(lista, p, ahora, continentes = []) {
  const sin = lista.filter(r => r.partida !== p.creada);
  const eq = p.equipos.find(e => e.id === p.ganador);
  if (!eq) return sin;
  const registro = {
    partida: p.creada,
    fecha: ahora,
    ganador: { nombre: eq.nombre, color: eq.color },
    rivales: p.equipos.filter(e => e !== eq).map(e => e.nombre),
    rondas: p.ronda,
    tropas: eq.reclamadas || 0,
    turnos: eq.jugados || 0,
    continentes: continentes.map(c => ({ simbolo: c.simbolo, nombre: c.nombre }))
  };
  return [registro, ...sin].slice(0, MAX_REGISTROS);
}

export const borrarRegistro = (lista, i) => lista.filter((_, j) => j !== i);

// Puntos para ganar (reglamento: territorios conseguidos + puntos por regiones). Cada territorio vale 1 y
// cada continente completo suma sus puntos.
export const puntosVictoria = (territorios, continentes) => territorios + continentes.reduce((s, c) => s + c.puntos, 0);
