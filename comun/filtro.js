// Filtro de la portada (spec 011): funciones puras, sin DOM, para filtrar juegos por categoría y texto
// y para elegir los candidatos del dado al azar. También se usan en las pruebas con Node.
const MusaFiltro = (() => {
  // Sin tildes ni mayúsculas: "poker" encuentra "Póker"
  const normalizar = t => String(t ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

  // ¿El juego contiene todas las palabras buscadas (en nombre o descripción)?
  function coincide(juego, texto) {
    const donde = normalizar(`${juego.nombre} ${juego.descripcion}`);
    return normalizar(texto).split(/\s+/).filter(Boolean).every(p => donde.includes(p));
  }

  const tiene = (juego, categoria) => (juego.categorias ?? []).includes(categoria);

  // Un juego es "aparte" si todas sus categorías son aparte (ej.: solo All-afters): no entra en "Todos"
  const esAparte = (juego, aparte) => aparte.length > 0 && (juego.categorias ?? []).length > 0
    && juego.categorias.every(c => aparte.includes(c));

  // Portada: una categoría a la vez (null = todos) combinada con el buscador.
  // "Todos" deja por fuera los juegos aparte; el buscador sí los encuentra.
  function filtrar(juegos, { categoria = null, texto = '', aparte = [] } = {}) {
    const buscando = normalizar(texto) !== '';
    return juegos.filter(j => (categoria ? tiene(j, categoria) : buscando || !esAparte(j, aparte)) && coincide(j, texto));
  }

  // Cuántos juegos hay en cada categoría
  function conteos(juegos, categorias) {
    return Object.fromEntries(categorias.map(c => [c.id, juegos.filter(j => tiene(j, c.id)).length]));
  }

  // Dado al azar: varias categorías a la vez. Sin ninguna elegida = todos (sin los juegos aparte, como "Todos").
  function candidatos(juegos, elegidas = [], aparte = []) {
    return elegidas.length ? juegos.filter(j => elegidas.some(c => tiene(j, c))) : juegos.filter(j => !esAparte(j, aparte));
  }

  return { normalizar, coincide, esAparte, filtrar, conteos, candidatos };
})();

if (typeof module === 'object' && module.exports) module.exports = MusaFiltro;
