// Mente Vacuna · efectos del navegador (shell imperativo). Todo es opcional: si el celular no lo soporta, no pasa nada.

// Pantalla encendida mientras se juega (Wake Lock). Se vuelve a pedir al regresar a la app.
let candado = null;
let quiero = false;

async function pedir() {
  if (!quiero || candado || document.visibilityState !== 'visible' || !navigator.wakeLock) return;
  try {
    candado = await navigator.wakeLock.request('screen');
    candado.addEventListener('release', () => { candado = null; });
  } catch (e) { candado = null; }
}
document.addEventListener('visibilitychange', pedir);

export function pantallaEncendida(si) {
  quiero = si;
  if (si) pedir();
  else if (candado) { candado.release().catch(() => {}); candado = null; }
}

export function vibrar(ms = 12) {
  try { navigator.vibrate?.(ms); } catch (e) { /* sin vibración */ }
}

export const menosMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
