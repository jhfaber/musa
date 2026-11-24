// Ayudante de las pruebas: encuentra y arma todos los bancos de preguntas del repo (no es una prueba).
// Un banco es juegos/<juego>/preguntas/indice.json + un <categoria>.json por categoría (spec 010),
// o un borrador de una spec en un solo archivo (specs/*/banco-borrador.json).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (ruta) => JSON.parse(readFileSync(ruta, 'utf8'));

export function bancosDeJuegos() {
  const juegos = join(RAIZ, 'juegos');
  return readdirSync(juegos)
    .map((juego) => ({ juego, dir: join(juegos, juego, 'preguntas') }))
    .filter(({ dir }) => existsSync(join(dir, 'indice.json')))
    .map(({ juego, dir }) => {
      const indice = leer(join(dir, 'indice.json'));
      const categorias = indice.categorias.map((id) => {
        const ruta = join(dir, `${id}.json`);
        return existsSync(ruta) ? leer(ruta) : { id, preguntas: [], _falta: true };
      });
      return { nombre: `juegos/${juego}/preguntas`, juego, dir, indice, banco: { categorias } };
    });
}

export function bancosBorrador() {
  const specs = join(RAIZ, 'specs');
  return readdirSync(specs).map((s) => join(specs, s, 'banco-borrador.json')).filter(existsSync)
    .map((ruta) => ({ nombre: ruta.replace(RAIZ + '/', ''), banco: leer(ruta) }));
}

export const todosLosBancos = () => [...bancosDeJuegos(), ...bancosBorrador()];
