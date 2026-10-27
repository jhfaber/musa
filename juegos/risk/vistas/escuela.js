// Escuela 🎓 (pantalla completa): lecciones paso a paso, ¿cuántos dados?, preguntas y la tabla de cartas.
import { resolver, tirar, frase, resultadosPosibles, dadosAtaque, dadosDefensa } from '../logica/dados.js';
import { VENTA_CARTAS } from '../logica/reglas.js';
import { continentesDe } from '../logica/mapas.js';
import { mesaDados, resultado, barrasProb, esc } from './piezas.js';

const PESTAÑAS = [
  { id: 'aprender', nombre: '📘 Aprender' },
  { id: 'cuantos', nombre: '🔢 ¿Cuántos dados?' },
  { id: 'preguntas', nombre: '❓ Preguntas' },
  { id: 'cartas', nombre: '★ Cartas' }
];

const escuela = { pestaña: 'aprender', paso: 0, fa: 4, fd: 2, pregunta: null, aciertos: 0, intentos: 0, rodar: false };
let panel = null;
let leerAjustes = null;
let simular = null; // abre el simulador con { fichasAtq, fichasDef }

export function abrirEscuela(ajustes, abrirSimulador, pestaña) {
  leerAjustes = ajustes;
  simular = abrirSimulador;
  if (pestaña) escuela.pestaña = pestaña;
  if (!panel) {
    panel = Musa.panel.crear('🎓 Escuela de Risk', 'Escuela de Risk',
      `<div class="chips risk-pestañas" role="tablist">${PESTAÑAS.map(p => `<button class="chip" role="tab" data-ui="pestaña" data-n="${p.id}">${p.nombre}</button>`).join('')}</div>`,
      { completa: true });
    panel.addEventListener('click', clic);
  }
  pintar();
  Musa.panel.mostrar(panel);
}

function clic(e) {
  if (e.target.closest('[data-cerrar]')) return Musa.panel.cerrar(panel);
  const b = e.target.closest('[data-ui]');
  if (!b) return;
  const { ui, n } = b.dataset;
  escuela.rodar = false;
  if (ui === 'pestaña') escuela.pestaña = n;
  if (ui === 'paso') escuela.paso = Math.max(0, Math.min(lecciones().length - 1, escuela.paso + Number(n)));
  if (ui === 'ir-paso') escuela.paso = Number(n);
  if (ui === 'fichas') escuela[b.dataset.lado] = Math.max(1, Math.min(30, escuela[b.dataset.lado] + Number(n)));
  if (ui === 'simular') return simular({ fichasAtq: escuela.fa, fichasDef: escuela.fd });
  if (ui === 'otra') { escuela.pregunta = null; escuela.rodar = true; }
  if (ui === 'respuesta' && escuela.pregunta && escuela.pregunta.elegida === null) {
    escuela.pregunta.elegida = n;
    escuela.intentos++;
    if (n === frase(escuela.pregunta.res)) escuela.aciertos++;
  }
  pintar();
}

function pintar() {
  panel.querySelectorAll('[data-ui="pestaña"]').forEach(b => {
    b.classList.toggle('chip--activo', b.dataset.n === escuela.pestaña);
    b.setAttribute('aria-selected', b.dataset.n === escuela.pestaña);
  });
  const vistas = { aprender, cuantos, preguntas, cartas };
  panel.querySelector('.catalogo-cuerpo').innerHTML = vistas[escuela.pestaña]();
  panel.querySelector('.catalogo-panel').scrollTop = 0;
}

// ---------- Lecciones: una por pantalla ----------

function lecciones() {
  const aj = leerAjustes();
  const conts = continentesDe(aj, aj.mapa);
  const grande = conts.reduce((a, c) => (c.bono > (a ? a.bono : -1) ? c : a), null);
  const ejemplo = resolver([6, 4, 1], [5, 4]);
  const f = Musa.reloj.formato;
  return [
    { arte: '🔁', titulo: 'Así es un turno', cuerpo: `
      <ol class="risk-pasos"><li><b>Reclama</b> tus tropas y ponlas en el tablero.</li><li><b>Ataca</b> territorios vecinos.</li>
      <li><b>Reagrupa</b>: mueve tropas entre tus territorios conectados (deja 1 en cada uno).</li><li><b>Reclama cartas</b> por lo que conquistaste.</li></ol>
      <p>Cada turno dura <b>${f(aj.turno)}</b>. Al acabar el tiempo, <b>ninguna acción más</b>
      (si algo pasó, en la cuenta del siguiente se le pueden dar 20 segundos más).</p>` },
    { arte: '➕', titulo: '¿Cuántas tropas reclamo?', cuerpo: `
      <p><b>${aj.tropas}</b> en cada turno, más tus continentes. Un continente completo es una <b>bola de nieve</b>:</p>
      ${grande ? `<div class="risk-nieve">${[1, 2, 3, 4].map(m => `<span>${m === 1 ? 'Lo conquistas' : `Turno ${m}`}<b>+${grande.bono * m}</b><small>×${m}</small></span>`).join('')}</div>
      <p class="risk-nota">Ejemplo con ${grande.simbolo} ${esc(grande.nombre)} (da ${grande.bono}). Si lo pierdes, la cuenta vuelve a cero.</p>` : ''}
      <p>También puedes <b>vender cartas</b> por sus estrellas (mira la pestaña ★ Cartas).</p>` },
    { arte: '⚔️', titulo: '¿Cómo se ataca?', cuerpo: `
      <ul><li>Solo a un territorio <b>vecino</b>: que toca el tuyo o está unido por una línea.</li>
      <li>Cada dado es 1 unidad y siempre se queda <b>1 defendiendo</b>: con 4 fichas atacas con 3 dados, con 3 con 2, con 2 con 1.</li>
      <li>El defensor tira hasta <b>2 dados</b> (1 si solo tiene 1 ficha).</li>
      <li>Si tiras más dados de los permitidos, <b>pierdes 1 soldado</b> y repites el tiro.</li></ul>` },
    { arte: '🎲', titulo: '¿Quién gana con los dados?', cuerpo: `
      <p>Se ordenan de mayor a menor y se compara <b>el más alto con el más alto</b>, el segundo con el segundo.
      Cada pareja perdida es 1 tropa menos. <b>El empate lo gana el defensor.</b></p>
      ${mesaDados(ejemplo)}${resultado(ejemplo)}
      <p class="risk-nota">El 1 del atacante no tiene pareja: no cuenta.</p>` },
    { arte: '🚩', titulo: 'Al conquistar', cuerpo: `
      <ul><li>Puedes mover <b>todas tus unidades menos 1</b> al territorio conquistado.</li>
      <li>Cartas al final del turno: 1 territorio → 1 carta, 2 → 2, 3 o más → 3. <b>En la última ronda no se reclaman.</b></li>
      <li>Si no quedan cartas, robas al azar a los que les conquistaste algo.</li></ul>` },
    { arte: '🎯', titulo: '¿A quién atacar?', cuerpo: `
      <ul><li><b>Completa un continente</b>: por la bola de nieve vale más cada turno que pasa.</li>
      <li><b>Rompe el continente de otro</b> antes de que crezca: con quitarle un territorio basta.</li>
      <li>Ataca con ventaja: <b>3 dados contra 1</b> gana el 66 % de las veces; 3 contra 2 es parejo.</li>
      <li>No dejes territorios con 1 sola ficha junto a un enemigo fuerte.</li></ul>` },
    { arte: '🪖', titulo: 'Unidades', cuerpo: `
      <div class="risk-unidades"><span><i>👤</i><b>1</b>Soldado</span><span><i>🐎</i><b>5</b>Caballería</span><span><i>🧨</i><b>10</b>Artillería</span></div>
      <p>Se cambian en el refuerzo y el reagrupamiento (y al atacar, cuando pierdes unidades).</p>` },
    { arte: '💤', titulo: 'Si un equipo no está', cuerpo: `
      <p>Se salta su turno. Si lo atacan, otro equipo tira por él (que no sea el atacante) o se defiende siempre
      con <b>4 y 2</b>: el atacante debe superarlos. La partida nunca se detiene.</p>` },
    { arte: '🤝', titulo: 'Alianzas', cuerpo: `
      <p>Dos equipos pueden aliarse dejando un pozo de cartas. Si uno rompe la alianza, el otro se lleva el pozo
      y puede jugar esas cartas de inmediato.</p>` }
  ];
}

function aprender() {
  const todas = lecciones();
  const l = todas[escuela.paso];
  return `
    <article class="risk-leccion">
      <div class="risk-leccion-arte" aria-hidden="true">${l.arte}</div>
      <div class="risk-leccion-paso">Paso ${escuela.paso + 1} de ${todas.length}</div>
      <h3>${l.titulo}</h3>
      ${l.cuerpo}
    </article>
    <div class="risk-puntos-pasos">${todas.map((_, i) => `<button class="${i === escuela.paso ? 'activo' : ''}" data-ui="ir-paso" data-n="${i}" aria-label="Paso ${i + 1}"></button>`).join('')}</div>
    <div class="risk-pasar">
      <button class="boton boton--secundario" data-ui="paso" data-n="-1" ${escuela.paso ? '' : 'disabled'}>‹ Anterior</button>
      <button class="boton boton--secundario" data-ui="paso" data-n="1" ${escuela.paso < todas.length - 1 ? '' : 'disabled'}>Siguiente ›</button>
    </div>`;
}

// ---------- ¿Cuántos dados? ----------

const contador = (lado, titulo) => `
  <div class="risk-contador">
    <span>${titulo}</span>
    <div class="ajuste-paso">
      <button class="boton-icono" data-ui="fichas" data-lado="${lado}" data-n="-1" aria-label="Una ficha menos">−</button>
      <span><b>${escuela[lado]}</b> fichas</span>
      <button class="boton-icono" data-ui="fichas" data-lado="${lado}" data-n="1" aria-label="Una ficha más">+</button>
    </div>
  </div>`;

function cuantos() {
  const na = dadosAtaque(escuela.fa);
  const nd = dadosDefensa(escuela.fd);
  return `
    <p class="catalogo-resumen">Cuenta las fichas que hay <b>en cada territorio</b>: el que ataca y el atacado.</p>
    ${contador('fa', '⚔️ Territorio que ataca')}
    ${contador('fd', '🛡️ Territorio atacado')}
    <div class="risk-cuantos">
      ${na ? `<b>${na} contra ${nd}</b>
        <p>Atacas con <b>${na} ${na === 1 ? 'dado' : 'dados'}</b>${escuela.fa > 4 ? ' (el máximo)' : ''}: 1 ficha se queda cuidando.
        Defienden con <b>${nd} ${nd === 1 ? 'dado' : 'dados'}</b>.</p>
        <button class="boton boton--principal risk-ancho" data-ui="simular">🎲 Simular esta tirada</button>`
      : '<b>No puedes atacar</b><p>Con 1 sola ficha no se ataca: esa ficha debe quedarse. Necesitas al menos 2.</p>'}
    </div>
    ${na ? barrasProb(na, nd) : ''}`;
}

// ---------- Preguntas ----------

function preguntas() {
  if (!escuela.pregunta) {
    const tipos = [[3, 2], [3, 2], [3, 2], [3, 1], [2, 2], [2, 1], [1, 2], [1, 1]];
    const [na, nd] = tipos[Math.floor(Math.random() * tipos.length)];
    escuela.pregunta = { res: tirar(na, nd), elegida: null };
  }
  const { res, elegida } = escuela.pregunta;
  const correcta = frase(res);
  const clase = o => (elegida === null ? '' : o === correcta ? 'risk-opcion--bien' : o === elegida ? 'risk-opcion--mal' : '');
  return `
    <p class="catalogo-resumen">Aciertos: <b>${escuela.aciertos} de ${escuela.intentos}</b></p>
    <p class="risk-pregunta">${res.a.length} contra ${res.d.length}, ya ordenados de mayor a menor. <b>¿Qué pasa?</b></p>
    ${mesaDados(res, { ocultar: elegida === null, rodar: escuela.rodar })}
    <div class="risk-opciones">
      ${resultadosPosibles(res.parejas.length).map(o => `<button class="boton risk-opcion ${clase(o)}" data-ui="respuesta" data-n="${o}" ${elegida !== null ? 'disabled' : ''}>${o}</button>`).join('')}
    </div>
    ${elegida !== null ? `
      <p class="risk-veredicto ${elegida === correcta ? 'risk-veredicto--bien' : 'risk-veredicto--mal'}">${elegida === correcta ? '✓ ¡Correcto!' : `✗ Era: ${correcta}`}</p>
      ${resultado(res)}
      <button class="boton boton--principal risk-ancho" data-ui="otra">Otra tirada →</button>` : ''}`;
}

// ---------- Tabla de cartas ----------

function cartas() {
  return `
    <p class="catalogo-resumen">En tu turno puedes <b>vender cartas de territorio</b>: suma sus estrellas y reclama estas tropas.</p>
    <div class="risk-tabla-cartas">
      ${Object.entries(VENTA_CARTAS).map(([e, t]) => `<div><span>★ ${e}</span><b>${t}</b></div>`).join('')}
    </div>
    <p class="risk-nota">En la carta del turno toca <b>★ Vender cartas</b> y elige las estrellas: se suman solas a las tropas.</p>`;
}
