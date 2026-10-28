// Guardar en el celular (localStorage) sin romperse si no hay almacenamiento (modo privado, etc.).
// Cada juego usa sus propias claves: musa.<juego>.…
Musa.leer = (clave, defecto = null) => {
  try {
    const valor = JSON.parse(localStorage.getItem(clave));
    return valor === null ? defecto : valor;
  } catch (e) { return defecto; }
};

Musa.guardar = (clave, valor) => {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento: queda en memoria */ }
};
