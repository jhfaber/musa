// Mente Vacuna · almacén (Facade sobre Musa.leer/guardar). Lo que se recuerda al cerrar la app:
// categorías activas, preguntas vistas y descartadas, e historial reciente.
const CLAVE = 'musa.mente-vacuna.estado.v1';

export const cargar = () => Musa.leer(CLAVE);
export const guardar = estado => Musa.guardar(CLAVE, estado);
