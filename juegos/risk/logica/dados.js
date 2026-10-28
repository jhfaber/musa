// Dados de Risk (puro). Se ordenan de mayor a menor y se comparan por parejas; el empate lo gana el defensor.

// Un dado de 6 caras al azar de verdad (sin sesgo); en Node también existe globalThis.crypto
export function dadoAlAzar() {
  const b = new Uint8Array(1);
  do { globalThis.crypto.getRandomValues(b); } while (b[0] >= 252);
  return (b[0] % 6) + 1;
}

export const tirar = (na, nd) => resolver(Array.from({ length: na }, dadoAlAzar), Array.from({ length: nd }, dadoAlAzar));

// Con cuántos dados tira cada uno según las fichas de su territorio
export const dadosAtaque = fichas => Math.max(0, Math.min(3, fichas - 1)); // siempre se queda 1 defendiendo
export const dadosDefensa = fichas => Math.max(0, Math.min(2, fichas));

// bonoAtaque: lo que se suma al dado más alto del atacante (p. ej. +1 con un líder en el territorio que ataca)
export function resolver(ataque, defensa, bonoAtaque = 0) {
  const a = [...ataque].sort((x, y) => y - x);
  if (a.length) a[0] += bonoAtaque;
  const d = [...defensa].sort((x, y) => y - x);
  const parejas = [];
  for (let i = 0; i < Math.min(a.length, d.length); i++) {
    parejas.push({ a: a[i], d: d[i], gana: a[i] > d[i] ? 'atq' : 'def', empate: a[i] === d[i] });
  }
  return {
    a, d, parejas,
    pierdeAtq: parejas.filter(p => p.gana === 'def').length,
    pierdeDef: parejas.filter(p => p.gana === 'atq').length
  };
}

// Resultado en palabras: siempre una de estas frases (las usan las preguntas de la escuela)
export function frase({ pierdeAtq, pierdeDef }) {
  const tropas = n => `${n} ${n === 1 ? 'tropa' : 'tropas'}`;
  if (!pierdeAtq) return `El defensor pierde ${tropas(pierdeDef)}`;
  if (!pierdeDef) return `El atacante pierde ${tropas(pierdeAtq)}`;
  return 'Cada uno pierde 1 tropa';
}

// Las respuestas posibles para una tirada con n parejas, de la mejor a la peor para el atacante
export const resultadosPosibles = n => (n === 2
  ? ['El defensor pierde 2 tropas', 'Cada uno pierde 1 tropa', 'El atacante pierde 2 tropas']
  : ['El defensor pierde 1 tropa', 'El atacante pierde 1 tropa']);

export function explicarPareja(p, i) {
  const cuales = ['Los más altos', 'Los segundos', 'Los terceros'][i];
  const quien = p.empate ? 'empate, gana el defensor' : p.gana === 'atq' ? 'gana el atacante' : 'gana el defensor';
  return `${cuales}: ${p.a} contra ${p.d} → ${quien}`;
}

// Probabilidades exactas: se recorren todas las tiradas posibles (como mucho 6⁵ = 7776).
// Devuelve [{ texto, casos, p }] en el orden de resultadosPosibles.
export function probabilidades(na, nd) {
  const cuentas = {};
  let total = 0;
  const recorrer = (lista, n, fn) => {
    if (!n) return fn(lista);
    for (let v = 1; v <= 6; v++) recorrer([...lista, v], n - 1, fn);
  };
  recorrer([], na, a => recorrer([], nd, d => {
    const texto = frase(resolver(a, d));
    cuentas[texto] = (cuentas[texto] || 0) + 1;
    total++;
  }));
  return resultadosPosibles(Math.min(na, nd))
    .filter(texto => cuentas[texto])
    .map(texto => ({ texto, casos: cuentas[texto], p: cuentas[texto] / total }));
}
