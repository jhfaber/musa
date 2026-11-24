// Mente Vacuna · bolsa de preguntas (spec 009). Núcleo funcional puro: sin DOM, sin almacenamiento, sin Math.random.
// Cada función recibe un estado y devuelve uno nuevo (no muta). El azar llega como función `azar()` → [0, 1).
//
// Estado: { activas: [idCategoria], vistas: [idPregunta], descartadas: [idPregunta], historial: [idPregunta] }
//   vistas       ya salieron en esta vuelta; no vuelven hasta agotar las de las categorías activas
//   descartadas  no vuelven nunca
//   historial    lo que se ha mostrado, la última es la actual (para "pregunta anterior")

const MAX_HISTORIAL = 30;

// Id estable: categoría + hash del texto. Agregar o quitar preguntas no cambia los ids de las demás.
export function idDe(categoriaId, texto) {
  let h = 5381;
  for (const letra of texto.normalize('NFC')) h = ((h << 5) + h + letra.codePointAt(0)) >>> 0;
  return `${categoriaId}:${h.toString(36)}`;
}

// Una pregunta en el banco es un texto, { q, no } cuando tiene respuestas prohibidas por obvias,
// o { q, opciones } cuando trae 3 o 4 posibles respuestas.
export const textoDe = p => (typeof p === 'string' ? p : p.q);

// Orden de las opciones: barajado pero siempre el mismo para cada pregunta (sale del id), para que la más
// popular no quede siempre de primera y "pregunta anterior" muestre las opciones en el mismo orden.
export function ordenarOpciones(id, opciones) {
  const lista = [...opciones];
  let h = 0;
  for (const letra of id) h = (Math.imul(h, 31) + letra.codePointAt(0)) >>> 0;
  for (let i = lista.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    const j = h % (i + 1);
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

// El banco en una lista plana de { id, c (categoría), q (pregunta), no (respuestas que no valen), opciones }.
export function aplanar(banco) {
  return banco.categorias.flatMap(c => c.preguntas.map(p => {
    const q = textoDe(p);
    const id = idDe(c.id, q);
    return {
      id, c: c.id, q,
      no: Array.isArray(p.no) ? p.no : [],
      opciones: Array.isArray(p.opciones) ? ordenarOpciones(id, p.opciones) : [],
    };
  }));
}

export function estadoInicial(banco) {
  return { activas: banco.categorias.map(c => c.id), vistas: [], descartadas: [], historial: [] };
}

// Ajusta un estado guardado al banco actual: quita ids que ya no existen. Cero categorías activas es válido
// (el jugador las quitó todas); solo si todas las guardadas dejaron de existir se vuelve a las de por defecto.
export function limpiar(estado, banco) {
  const base = estadoInicial(banco);
  if (!estado || typeof estado !== 'object') return base;
  const categorias = new Set(banco.categorias.map(c => c.id));
  const preguntas = new Set(aplanar(banco).map(i => i.id));
  const lista = (v, validos) => (Array.isArray(v) ? [...new Set(v)].filter(x => validos.has(x)) : []);
  const activas = lista(estado.activas, categorias);
  const perdidas = Array.isArray(estado.activas) && estado.activas.length > 0 && !activas.length;
  return {
    activas: Array.isArray(estado.activas) && !perdidas ? activas : base.activas,
    vistas: lista(estado.vistas, preguntas),
    descartadas: lista(estado.descartadas, preguntas),
    historial: (Array.isArray(estado.historial) ? estado.historial : []).filter(x => preguntas.has(x)).slice(-MAX_HISTORIAL),
  };
}

const actualId = estado => estado.historial[estado.historial.length - 1] ?? null;

// La pregunta en pantalla. Si su categoría se apagó, no hay pregunta actual.
export function actual(estado, items) {
  const item = items.find(i => i.id === actualId(estado));
  return item && estado.activas.includes(item.c) ? item : null;
}

// Preguntas que pueden salir con las categorías activas (sin las descartadas).
function candidatas(estado, items) {
  const activas = new Set(estado.activas);
  const fuera = new Set(estado.descartadas);
  return items.filter(i => activas.has(i.c) && !fuera.has(i.id));
}

// Cuántas van y cuántas quedan en esta vuelta, con las categorías activas.
export function conteo(estado, items) {
  const todas = candidatas(estado, items);
  const vistas = new Set(estado.vistas);
  const quedan = todas.filter(i => !vistas.has(i.id)).length;
  return { total: todas.length, vistas: todas.length - quedan, quedan };
}

// Saca una pregunta al azar. Si ya salieron todas, vuelve a barajar (sin repetir la actual de inmediato).
// Devuelve { estado, item, barajado }; item es null si no queda ninguna (todas descartadas).
export function sacar(estado, items, azar) {
  const todas = candidatas(estado, items);
  if (!todas.length) return { estado, item: null, barajado: false };

  // Con Set, sacar una pregunta cuesta lo mismo aunque el banco tenga miles (no crece al cuadrado)
  let vistas = estado.vistas;
  const yaVistas = new Set(vistas);
  let libres = todas.filter(i => !yaVistas.has(i.id));
  let barajado = false;
  if (!libres.length) {
    const deEstas = new Set(todas.map(i => i.id));
    vistas = vistas.filter(id => !deEstas.has(id));
    libres = todas.length > 1 ? todas.filter(i => i.id !== actualId(estado)) : todas;
    barajado = true;
  }

  const item = libres[Math.min(libres.length - 1, Math.floor(azar() * libres.length))];
  return {
    item,
    barajado,
    estado: { ...estado, vistas: [...vistas, item.id], historial: [...estado.historial, item.id].slice(-MAX_HISTORIAL) },
  };
}

// Vuelve a la pregunta anterior (la actual sigue contando como vista).
export function anterior(estado) {
  if (estado.historial.length < 2) return estado;
  return { ...estado, historial: estado.historial.slice(0, -1) };
}

export const hayAnterior = estado => estado.historial.length > 1;

// Descarta la actual para siempre. Después, la vista pide otra con sacar().
export function descartar(estado) {
  const id = actualId(estado);
  if (!id) return estado;
  return {
    ...estado,
    descartadas: estado.descartadas.includes(id) ? estado.descartadas : [...estado.descartadas, id],
    historial: estado.historial.filter(x => x !== id),
  };
}

// Prende o apaga una categoría. Se pueden apagar todas: entonces no sale ninguna pregunta.
export function alternar(estado, categoriaId) {
  const activas = estado.activas.includes(categoriaId)
    ? estado.activas.filter(c => c !== categoriaId)
    : [...estado.activas, categoriaId];
  return { ...estado, activas };
}

const todas = banco => banco.categorias.map(c => c.id);

// ¿Están prendidas todas las categorías?
export const todasActivas = (estado, banco) => todas(banco).every(id => estado.activas.includes(id));

// Botón "Todas / Quitar todas": si ya están todas, las quita todas; si no, prende todas.
export function alternarTodas(estado, banco) {
  if (todasActivas(estado, banco)) return { ...estado, activas: [] };
  return { ...estado, activas: todas(banco) };
}

// Volver a barajar: todo vuelve a la bolsa menos lo descartado.
export function barajar(estado) {
  return { ...estado, vistas: [], historial: [] };
}

// Devolver a la bolsa todo lo descartado.
export function recuperarDescartadas(estado) {
  return { ...estado, descartadas: [] };
}
