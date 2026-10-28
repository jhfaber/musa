// Escuela 🎓 (pantalla completa): lecciones paso a paso, ¿cuántos dados?, preguntas y la tabla de cartas.
import { resolver, tirar, frase, resultadosPosibles, dadosAtaque, dadosDefensa, probabilidades } from '../logica/dados.js';
import { VENTA_CARTAS, cartasPorConquista } from '../logica/reglas.js';
import { continentesDe } from '../logica/mapas.js';
import { puntosVictoria } from '../logica/historial.js';
import { mesaDados, resultado, barrasProb, esc } from './piezas.js';

const PESTAÑAS = [
  { id: 'aprender', nombre: '📘 Aprender' },
  { id: 'cuantos', nombre: '🔢 ¿Cuántos dados?' },
  { id: 'preguntas', nombre: '❓ Preguntas' },
  { id: 'cartas', nombre: '★ Cartas' },
  { id: 'poderes', nombre: '⚡ Poderes' },
  { id: 'ganar', nombre: '🏆 Cómo ganar' }
];

const escuela = { pestaña: 'aprender', paso: 0, fa: 4, fd: 2, pregunta: null, aciertos: 0, intentos: 0, rodar: false, territorios: 10, conts: [], filo: 2 };
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
  // El ejemplo del Filo solo cambia su recuadro (sin redibujar la pestaña)
  if (ui === 'filo') {
    escuela.filo = Number(n);
    panel.querySelectorAll('[data-ui="filo"]').forEach(x => x.classList.toggle('chip--activo', Number(x.dataset.n) === escuela.filo));
    panel.querySelector('.risk-filo-cuenta').innerHTML = cuentaFilo();
    return;
  }
  // La calculadora de "Cómo ganar" solo cambia el botón tocado y el marcador (sin redibujar la pestaña)
  if (ui === 'territorios') {
    escuela.territorios = Math.max(0, Math.min(99, escuela.territorios + Number(n)));
    return actualizarMarcador();
  }
  if (ui === 'cont-punto') {
    escuela.conts = escuela.conts.includes(n) ? escuela.conts.filter(c => c !== n) : [...escuela.conts, n];
    b.classList.toggle('chip--activo', escuela.conts.includes(n));
    return actualizarMarcador();
  }
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
  const vistas = { aprender, cuantos, preguntas, cartas, poderes, ganar };
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
      (si algo pasó, en la cuenta del siguiente se le pueden dar ${aj.prorroga} segundos más).</p>` },
    { arte: '➕', titulo: '¿Cuántas tropas reclamo?', cuerpo: `
      <ol class="risk-pasos">
        <li><b>Al empezar tu turno, yo (la app) te digo cuántas tropas reclamar.</b> Siempre son <b>${aj.tropas}</b>
          más lo que te den tus continentes.</li>
        <li><b>Apenas conquistas un continente completo</b>, en ese mismo turno reclamas las tropas que dice ese
          continente${grande ? ` (${grande.simbolo} ${esc(grande.nombre)} da <b>${grande.bono}</b>)` : ''}. Toca <b>🚩 Conquistó continente</b>.</li>
        <li><b>Si lo sostienes, cada turno ganas más</b>: el continente se multiplica por los turnos que lo llevas
          (×2, ×3, ×4…). Es una bola de nieve: por eso vale tanto completar uno y defenderlo.</li>
        <li><b>Si lo pierdes</b>, deja de sumar y, si lo recuperas, empieza otra vez desde ×1.</li>
      </ol>
      ${grande ? `
        <p class="risk-nota">Ejemplo: conquistas ${grande.simbolo} ${esc(grande.nombre)} y lo sostienes. Esto es lo que te da
          <b>el continente</b>:</p>
        <div class="risk-nieve">${[1, 2, 3, 4].map(m => `
          <span>${m === 1 ? 'Al conquistarlo' : `${m}.º turno`}<b>+${grande.bono * m}</b><small>${grande.bono} × ${m}</small></span>`).join('')}</div>
        <p class="risk-nota">Se suma a tus <b>${aj.tropas}</b> de cada turno: al conquistarlo ya habías reclamado tus ${aj.tropas},
          así que ahí recibes <b>${grande.bono}</b> más; en el siguiente turno reclamas ${aj.tropas} + ${grande.bono * 2} = <b>${aj.tropas + grande.bono * 2}</b>.</p>` : ''}
      <p>Además puedes <b>vender cartas</b> por sus estrellas: también se suman (pestaña ★ Cartas).</p>` },
    { arte: '⚔️', titulo: '¿Cómo se ataca?', cuerpo: `
      <ol class="risk-pasos">
        <li><b>Elige desde dónde y a quién.</b> Desde un territorio tuyo atacas un territorio enemigo <b>vecino</b>:
          que toca el tuyo o está unido por una línea.</li>
        <li><b>Cuenta las fichas de tu territorio.</b> Una ficha <b>siempre se queda cuidándolo</b>; las demás pueden
          atacar, con <b>un dado por ficha</b> y como mucho ${dadosAtaque(99)} dados:
          <div class="risk-tabla-dados">
            <div><span>Fichas en tu territorio</span><span>Dados que tiras</span></div>
            ${[1, 2, 3, 4].map(f => `<div><b>${f === 4 ? '4 o más' : f}</b><b>${dadosAtaque(f) || 'no puedes atacar'}</b></div>`).join('')}
          </div></li>
        <li><b>El defensor tira 1 o 2 dados:</b> 1 si solo tiene 1 ficha en ese territorio, 2 si tiene más.</li>
        <li><b>Tiran y comparan</b> (mira el siguiente paso). Puedes seguir atacando mientras tengas fichas y tiempo.</li>
      </ol>
      <p class="risk-nota">⚠️ Si tiras más dados de los que te tocan, <b>pierdes 1 soldado</b> y se repite el tiro.
        Si dudas, usa la pestaña 🔢 ¿Cuántos dados?.</p>` },
    { arte: '🎲', titulo: '¿Quién gana con los dados?', cuerpo: `
      <p>Se ordenan de mayor a menor y se compara <b>el más alto con el más alto</b>, el segundo con el segundo.
      Cada pareja perdida es 1 tropa menos. <b>El empate lo gana el defensor.</b></p>
      ${mesaDados(ejemplo)}${resultado(ejemplo)}
      <p class="risk-nota">El 1 del atacante no tiene pareja: no cuenta.</p>` },
    { arte: '🚩', titulo: 'Al conquistar', cuerpo: `
      <ol class="risk-pasos">
        <li><b>Mueve tus tropas.</b> Al ganar un territorio puedes pasar <b>todas tus unidades menos 1</b> del territorio
          desde el que atacaste al que conquistaste.</li>
        <li><b>Al final del turno, reclama cartas.</b> Cuenta cuántos territorios conquistaste en el turno:
          <div class="risk-tabla-dados">
            <div><span>Territorios conquistados</span><span>Cartas que tomas</span></div>
            ${Array.from({ length: aj.maxCartas }, (_, i) => i + 1).map(n => `
              <div><b>${n === aj.maxCartas ? `${n} o más` : n}</b><b>${cartasPorConquista(n, aj)}</b></div>`).join('')}
          </div>
          <span class="risk-nota">Máximo ${aj.maxCartas} ${aj.maxCartas === 1 ? 'carta' : 'cartas'} por turno (se cambia en ⚙ si su mesa juega distinto).</span></li>
        <li><b>En la última ronda no se reclaman cartas.</b></li>
        <li><b>Si ya no quedan cartas en el mazo</b>, robas al azar a los equipos a los que les conquistaste algo.</li>
      </ol>` },
    { arte: '🎯', titulo: '¿A quién atacar?', cuerpo: `
      <ul><li><b>Completa un continente</b>: por la bola de nieve vale más cada turno que pasa.</li>
      <li><b>Rompe el continente de otro</b> antes de que crezca: con quitarle un territorio basta.</li>
      <li>Ataca con ventaja: <b>3 dados contra 1</b> gana el ${Math.round(probabilidades(3, 1)[0].p * 100)} % de las veces; 3 contra 2 es parejo.</li>
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

// ---------- Cómo ganar: la regla y una calculadora de puntos ----------

function marcador() {
  const aj = leerAjustes();
  const elegidos = continentesDe(aj, aj.mapa).filter(c => escuela.conts.includes(c.id)).map(c => ({ ...c, puntos: c.bono }));
  return `
    <b>${puntosVictoria(escuela.territorios, elegidos)} puntos</b>
    <p>${escuela.territorios} ${escuela.territorios === 1 ? 'territorio' : 'territorios'}${elegidos.map(c => ` + ${c.puntos} (${esc(c.nombre)})`).join('')}</p>`;
}

function actualizarMarcador() {
  panel.querySelector('.risk-ganar-territorios').textContent = escuela.territorios;
  panel.querySelector('.risk-ganar-marcador').innerHTML = marcador();
}

function ganar() {
  const aj = leerAjustes();
  const conts = continentesDe(aj, aj.mapa).map(c => ({ ...c, puntos: c.bono }));
  return `
    <article class="risk-leccion">
      <div class="risk-leccion-arte" aria-hidden="true">🏆</div>
      <h3>¿Quién gana?</h3>
      <p>Al terminar la partida (por rondas o con 🏁 Finalizar), cada equipo cuenta en el tablero:</p>
      <ol class="risk-pasos">
        <li><b>1 punto por cada territorio</b> que tiene.</li>
        <li><b>Los puntos de cada continente completo</b> (región) que tiene, según el mapa: los mismos que da en tropas.</li>
      </ol>
      <p>Gana quien sume más. <b>No gana quien reclamó más tropas</b>: cuenta lo que tienes en el tablero al final.
      En la pantalla final toca al ganador y queda en el registro 🏆 con la fecha.</p>
    </article>
    <div class="risk-subtitulo">Calculadora de un equipo</div>
    <div class="risk-contador">
      <span>Territorios</span>
      <div class="ajuste-paso">
        <button class="boton-icono" data-ui="territorios" data-n="-1" aria-label="Un territorio menos">−</button>
        <span><b class="risk-ganar-territorios">${escuela.territorios}</b></span>
        <button class="boton-icono" data-ui="territorios" data-n="1" aria-label="Un territorio más">+</button>
      </div>
    </div>
    <p class="risk-nota">Toca los continentes completos que tiene:</p>
    <div class="risk-ganar-conts">
      ${conts.map(c => `
        <button class="chip ${escuela.conts.includes(c.id) ? 'chip--activo' : ''}" data-ui="cont-punto" data-n="${c.id}">${c.simbolo} ${esc(c.nombre)} +${c.puntos}</button>`).join('')}
    </div>
    <div class="risk-cuantos risk-ganar-marcador" aria-live="polite">${marcador()}</div>`;
}

// ---------- Poderes: Doble / Triple Filo y alianzas ----------

// Tiradas de ejemplo para el Filo: gana el atacante, uno y uno, gana el defensor
const TIRADAS_FILO = [
  { titulo: 'Si gana el atacante', res: resolver([6, 5, 2], [4, 3]) },
  { titulo: 'Si quedan uno y uno', res: resolver([6, 4, 1], [5, 4]) },
  { titulo: 'Si gana el defensor', res: resolver([4, 3, 1], [5, 4]) }
];
const NOMBRE_FILO = { 1: 'Normal', 2: 'Doble Filo', 3: 'Triple Filo' };
const COSTE_FILO = { 1: 0, 2: 1, 3: 2 };   // unidades que sacrifica el atacante al declararlo

const chipsDados = (vals, lado) => vals.map(v => `<span class="risk-chip-dado risk-chip-dado--${lado}">${v}</span>`).join('');

function cuentaFilo() {
  const m = escuela.filo;
  const coste = COSTE_FILO[m];
  const pierde = (bajas, extra = 0) => `<b>${bajas * m + extra}</b><small>${bajas} × ${m}${extra ? ` + ${extra} del Filo` : ''}</small>`;
  return `
    ${coste ? `<p class="risk-filo-coste">Al declarar ${NOMBRE_FILO[m]} el atacante ya sacrificó <b>${coste} ${coste === 1 ? 'unidad' : 'unidades'}</b>.</p>` : ''}
    <div class="risk-filo-tiradas">
      ${TIRADAS_FILO.map(({ titulo, res }) => `
        <div class="risk-filo-tirada">
          <div class="risk-filo-titulo">${titulo}</div>
          <div class="risk-filo-dados">⚔️ ${chipsDados(res.a, 'atq')}<i>contra</i>🛡️ ${chipsDados(res.d, 'def')}</div>
          <div class="risk-filo-perdidas">
            <span>⚔️ Atacante pierde ${pierde(res.pierdeAtq, coste)}</span>
            <span>🛡️ Defensor pierde ${pierde(res.pierdeDef)}</span>
          </div>
        </div>`).join('')}
    </div>`;
}

// El líder cambia un empate en victoria: 5-3 contra 5-4, sin líder y con líder, pareja por pareja
function ejemploLider() {
  const fila = (titulo, bono) => {
    const res = resolver([5, 3], [5, 4], bono);
    const dadoAtq = (v, i) => (i === 0 && bono
      ? `<span class="risk-chip-dado risk-chip-dado--atq">${v - bono}</span><small class="risk-lider-mas">+1 👑 = ${v}</small>`
      : `<span class="risk-chip-dado risk-chip-dado--atq">${v}</span>`);
    const pareja = (p, i) => {
      const signo = p.a > p.d ? '&gt;' : p.a < p.d ? '&lt;' : '=';
      const quien = p.empate ? 'empate, gana el defensor' : p.gana === 'atq' ? 'gana el atacante' : 'gana el defensor';
      return `<li class="risk-explica--${p.gana}">${i === 0 ? 'Los más altos' : 'Los segundos'}: ${p.a} ${signo} ${p.d} → ${quien}</li>`;
    };
    return `
      <div class="risk-filo-tirada">
        <div class="risk-filo-titulo">${titulo}</div>
        <div class="risk-filo-dados">⚔️ ${res.a.map(dadoAtq).join('')}<i>contra</i>🛡️ ${chipsDados(res.d, 'def')}</div>
        <ul class="risk-lider-parejas">${res.parejas.map(pareja).join('')}</ul>
        <div class="risk-filo-perdidas">
          <span>⚔️ Atacante pierde <b>${res.pierdeAtq}</b></span>
          <span>🛡️ Defensor pierde <b>${res.pierdeDef}</b></span>
        </div>
      </div>`;
  };
  return `
    <p class="risk-nota">Ejemplo: el atacante saca <b>5 y 3</b>, el defensor <b>5 y 4</b>.</p>
    <div class="risk-filo-tiradas">
      ${fila('Sin líder: el atacante pierde las dos', 0)}
      ${fila('Con líder: el 5 pasa a 6 y gana una', 1)}
    </div>`;
}

function poderes() {
  return `
    <article class="risk-poder">
      <h3><span>⚔️</span> Doble y Triple Filo</h3>
      <p class="risk-poder-coste">Doble (×2) cuesta <b>1 unidad</b> · Triple (×3) cuesta <b>2 unidades</b>: se sacrifican al
        declararlo, es el riesgo que asumes desde el inicio.</p>
      <ol class="risk-pasos">
        <li><b>Se declara antes de tirar</b>, entre el territorio desde el que atacas y el que atacas:
          "¡Doble Filo!" o "¡Triple Filo!".</li>
        <li><b>Cada baja vale 2 o 3 unidades, para los dos lados.</b> Los dados se comparan igual que siempre; solo cambia
          cuánto vale cada pareja perdida.</li>
        <li><b>No se puede desactivar</b> entre esos dos territorios durante el resto del turno.</li>
        <li><b>Equidad de pérdidas:</b> nadie pierde más de lo que el otro puede perder. Si a uno solo le queda 1 tropa en
          juego, el otro también pierde como máximo 1.</li>
      </ol>
      <p class="risk-nota">Ejemplos: cambia el Filo y mira qué pasa en cada tirada (los dados ya ordenados de mayor a menor):</p>
      <div class="chips">${[1, 2, 3].map(m => `<button class="chip ${m === escuela.filo ? 'chip--activo' : ''}" data-ui="filo" data-n="${m}">${m === 1 ? 'Normal' : `×${m}`}</button>`).join('')}</div>
      <div class="risk-filo-cuenta">${cuentaFilo()}</div>
      <p class="risk-nota">Úsalo cuando tienes más tropas que el otro: a los dos les duele igual, pero tú aguantas más.</p>
    </article>

    <article class="risk-poder">
      <h3><span>👑</span> Líder</h3>
      <p class="risk-poder-coste">Cuesta <b>${leerAjustes().costoLider} unidades</b> · hasta <b>${leerAjustes().maxLideres}
        ${leerAjustes().maxLideres === 1 ? 'líder' : 'líderes'}</b> por equipo</p>
      <ol class="risk-pasos">
        <li><b>Se compra con unidades</b> y se pone en uno de tus territorios (en el tablero, con una ficha que lo marque).</li>
        <li><b>Suma +1 a tu dado más alto</b>, pero <b>solo cuando atacas desde el territorio donde está</b>.</li>
        <li><b>Se pierde</b> si le conquistan el territorio donde está.</li>
      </ol>
      ${ejemploLider()}
      <p class="risk-nota">Ponlo en el territorio desde el que vas a empujar: ese +1 convierte muchos empates en victorias.</p>
    </article>

    <article class="risk-poder">
      <h3><span>🤝</span> Alianza entre facciones</h3>
      <p class="risk-poder-coste">La garantía son <b>cartas</b></p>
      <ol class="risk-pasos">
        <li><b>Acuerdan la alianza</b> (por ejemplo, no atacarse o atacar juntos a otro) y cada equipo deja
          <b>cartas en un pozo</b> como garantía, a la vista de todos.</li>
        <li><b>Mientras se cumpla</b>, las cartas se quedan en el pozo.</li>
        <li><b>Si uno rompe la alianza</b>, el otro se lleva <b>todo el pozo</b> y puede jugar esas cartas <b>de inmediato</b>.</li>
      </ol>
      <p class="risk-nota">También se puede negociar cualquier otra jugada pagando con cartas: paso libre, no atacar un
        continente, ayudar contra el líder…</p>
    </article>`;
}
