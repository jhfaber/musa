// Efectos: sonidos y vibración según lo que cambió en la partida. No cambian nada, solo avisan.
import { restanteReloj, restanteCuenta } from './logica/reglas.js';

// Al cambiar la partida (lo llama el almacén)
export function alCambiar(p, antes, ajustes) {
  if (!p || !antes) return;
  const avisos = { sonido: ajustes.sonido, vibrar: ajustes.vibrar };
  // Se acabó el tiempo de un turno: ninguna acción más
  if (p.cuenta && p.cuenta.porTiempo && !antes.cuenta) Musa.reloj.avisar(avisos);
  if (p.terminada && !antes.terminada) Musa.reloj.avisar(avisos);
}

// En cada latido: tic de la cuenta regresiva y tic-tac de los últimos 10 s del turno
let ultimo = null;
export function alLatir(p, ajustes, ahora) {
  if (!p || !ajustes.sonido) return;
  let segundo = null;
  if (p.cuenta && p.cuenta.corriendo) segundo = `c${Math.ceil(restanteCuenta(p, ajustes, ahora))}`;
  else if (!p.cuenta && p.reloj.estado === 'corre' && ajustes.tictac) {
    const r = restanteReloj(p, ajustes, ahora);
    if (r <= 10) segundo = `r${Math.ceil(r)}`;
  }
  if (segundo && segundo !== ultimo && !/^[cr]0$/.test(segundo)) Musa.reloj.tic();
  ultimo = segundo;
}
