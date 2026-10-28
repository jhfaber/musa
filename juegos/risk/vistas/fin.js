// Fin de la partida: celebración con fuegos artificiales y estrellas en los colores de los equipos.
// La app no sabe quién ganó (depende de territorios y continentes en el tablero): se toca el ganador y queda
// en el registro 🏆.
import { continentesDeEquipo, equipoPorId } from '../logica/reglas.js';
import { esc, resumenEquipo } from './piezas.js';
import { emblema } from './emblemas.js';

let animacion = 0;

export function pintarFin(p, aj) {
  const ganador = p.ganador && equipoPorId(p, p.ganador);
  return `
    <div class="risk risk-fin" ${ganador ? `style="--equipo-ganador: ${ganador.color}"` : ''}>
      <canvas class="risk-fuegos" aria-hidden="true"></canvas>
      <div class="risk-fin-titulo">
        <div class="risk-fin-trofeo" aria-hidden="true">${ganador ? emblema(ganador, 110) : '🏆'}</div>
        <h3>${ganador ? `¡Victoria de ${esc(ganador.nombre)}!` : '¡Fin de la partida!'}</h3>
        <p>${p.finalizada ? `Terminó en la ronda ${p.ronda} de ${aj.rondas}.` : `Se jugaron las ${aj.rondas} rondas.`}
          ${ganador ? 'Quedó en el registro de ganadores 🏆.' : 'Cuenten territorios y continentes (🎓 → Cómo ganar) y toquen al ganador.'}</p>
      </div>
      <div class="risk-subtitulo">¿Quién ganó?</div>
      <ul class="risk-fin-equipos">
        ${p.equipos.map(eq => {
          const suyos = continentesDeEquipo(p, aj, eq);
          const gano = eq === ganador;
          return `<li><button class="risk-fin-equipo ${gano ? 'risk-fin-equipo--gano' : ''}" data-accion="ganador" data-equipo="${eq.id}"
              aria-pressed="${gano}" style="--equipo: ${eq.color}">
            ${emblema(eq, 34)}
            <span class="risk-fin-equipo-texto"><b>${esc(eq.nombre)}</b>
              <small>${resumenEquipo(eq)}</small>
              <small>${suyos.length ? suyos.map(c => `${c.simbolo} ${esc(c.nombre)}`).join(' · ') : 'Sin continentes'}</small></span>
            <span class="risk-fin-equipo-marca">${gano ? '🏆 Ganó' : 'Ganó'}</span>
          </button></li>`;
        }).join('')}
      </ul>
      <button class="boton boton--secundario risk-ancho" data-ui="ganadores">🏆 Ver registro de ganadores</button>
      <div class="controles">
        <button class="boton-icono boton-redondo" data-accion="deshacer" aria-label="Volver a la última ronda">↶</button>
        <button class="boton boton--principal" data-ui="nueva">✦ Nueva partida</button>
      </div>
    </div>`;
}

// Cohetes que suben y estallan en chispas (colores de los equipos y dorado). Se detiene al salir.
export function lanzarFuegos(raiz, colores) {
  detenerFuegos();
  const lienzo = raiz.querySelector('.risk-fuegos');
  if (!lienzo) return;
  // Con "reducir movimiento" en el celular, la celebración es más calmada (menos cohetes)
  const pausa = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1400 : 650;
  const ctx = lienzo.getContext('2d');
  const paleta = [...colores, '#f2c46b', '#fff6d5'];
  const chispas = [];
  const cohetes = [];
  let ancho = 0;
  let alto = 0;
  let ultimo = 0;

  const medir = () => {
    ancho = lienzo.width = lienzo.clientWidth * devicePixelRatio;
    alto = lienzo.height = lienzo.clientHeight * devicePixelRatio;
  };
  medir();

  const lanzar = () => cohetes.push({
    x: ancho * (0.15 + Math.random() * 0.7), y: alto, vy: -(alto / 55) * (0.8 + Math.random() * 0.3),
    color: paleta[Math.floor(Math.random() * paleta.length)], hasta: alto * (0.15 + Math.random() * 0.3)
  });

  const estallar = c => {
    const n = 40 + Math.floor(Math.random() * 30);
    for (let i = 0; i < n; i++) {
      const angulo = (Math.PI * 2 * i) / n;
      const fuerza = (ancho / 160) * (0.6 + Math.random() * 0.6);
      chispas.push({ x: c.x, y: c.y, vx: Math.cos(angulo) * fuerza, vy: Math.sin(angulo) * fuerza, vida: 1, color: Math.random() < 0.3 ? '#fff6d5' : c.color, estrella: Math.random() < 0.15 });
    }
  };

  const estrella = (x, y, r) => {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r / 2.4 : r;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.fill();
  };

  const cuadro = t => {
    if (!lienzo.isConnected) return detenerFuegos();
    if (t - ultimo > pausa) { lanzar(); ultimo = t; }
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, .22)';
    ctx.fillRect(0, 0, ancho, alto);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = cohetes.length - 1; i >= 0; i--) {
      const c = cohetes[i];
      c.y += c.vy;
      ctx.fillStyle = c.color;
      ctx.fillRect(c.x - 2, c.y, 4, 10);
      if (c.y <= c.hasta) { estallar(c); cohetes.splice(i, 1); }
    }
    for (let i = chispas.length - 1; i >= 0; i--) {
      const s = chispas[i];
      s.x += s.vx; s.y += s.vy; s.vy += alto / 9000; s.vx *= 0.985; s.vida -= 0.012;
      if (s.vida <= 0) { chispas.splice(i, 1); continue; }
      ctx.globalAlpha = s.vida;
      ctx.fillStyle = s.color;
      if (s.estrella) estrella(s.x, s.y, 7 * devicePixelRatio);
      else { ctx.beginPath(); ctx.arc(s.x, s.y, 2.2 * devicePixelRatio, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    animacion = requestAnimationFrame(cuadro);
  };
  window.addEventListener('resize', medir);
  animacion = requestAnimationFrame(cuadro);
}

export function detenerFuegos() {
  cancelAnimationFrame(animacion);
  animacion = 0;
}
