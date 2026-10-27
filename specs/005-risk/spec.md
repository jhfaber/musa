# 005 — Ayudante de Risk Relámpago: turnos, tropas por continente y escuela de dados

- **Estado:** Aprobada por John (27-oct-2026, en el chat: "apruebo todos los specs para que luego lo revisemos con más de detalle") — en curso.
  **Por ahora solo el mapa normal** (continentes clásicos); el mapa LOTR y sus bufos quedan para la fase 3.
- **Depende de:** [004 — Estructura por juego](../004-estructura-por-juego/spec.md)
- **Reglas:** el reglamento personalizado *Risk LOTR – Juego Relámpago* que John pasó en el chat (27-oct-2026).
  Se guarda en la app como `juegos/risk/reglas.json` para mostrarlo en el 📖 Reglamento.

## Objetivo

Un acompañante en el celular para jugar **Risk Relámpago** con las reglas de la casa y enseñar mientras
se juega. Debe resolver cuatro cosas:

- que cada jugador sepa **cuántas tropas reclama** en su turno (7 + continentes con su bola de nieve + capital…),
- que el ritmo sea constante, con un **reloj por turno con sus fases**,
- que la partida dure lo acordado (**6 a 9 rondas**),
- que quien no sabe aprenda **cómo se ataca y quién gana con los dados**, de forma muy visual.

Mismo sistema visual que Dixit (barra, cartas, botones dorados, panel lateral, reloj de arena), con su
propio acento de color: rojo brasa en lugar de violeta.

## Las reglas que la app lleva por ti

| Regla | Valor por defecto (del reglamento) | Se cambia en ⚙ |
|---|---|---|
| Tropas iniciales | 20 (Tutorial) + 30 (Normal) = 50 | sí |
| Tropas por turno | **7** | sí |
| Rondas de la partida (modo Normal) | **6** (el reglamento dice 6 a 9) | sí, de 6 a 9 (o libre) |
| Turno Tutorial (el primero) | reclamar → **1:00** de ataques → **0:20** para reubicar → reclamar cartas | sí |
| Turno Normal | **2:15** | sí (minutos y segundos) |
| Bono de cada continente | editable por continente | sí |

### Continentes: bola de nieve
- Si conquistas un continente completo, reclamas **en ese mismo turno** sus tropas (×1).
- Cada turno que lo sigues teniendo, se multiplica: turno 2 ×2, turno 3 ×3, etc.
- Si lo pierdes, el contador vuelve a cero.

Ejemplo en pantalla: *"Turno del Equipo Rojo — reclama **16 tropas**: 7 base + Rohan 9 (lo tienen hace 3 turnos ×3)."*

### Otras fuentes de tropas que la app suma (si están activas)
- **Capital** (poder LOTR): +3 por turno hasta que la conquisten.
- **Fortalezas doradas** (LOTR, opcional): +3 por fortaleza y por turno desde la ronda 3.
- **Venta de cartas**: se suman las estrellas según la tabla de ventas (ver Preguntas).

## Alcance

### 1. Preparar la partida
- **Equipos** (lo normal en casa): de 2 a 10. Salen de una vez con su color y nombre por defecto
  (**Equipo Azul, Equipo Rojo, Equipo Verde, Equipo Amarillo, Equipo Negro, Equipo Blanco, Equipo Morado, Equipo Naranja, Equipo Rosado, Equipo Café**, o con
  números: Equipo 1, Equipo 2… si se prefiere); el nombre se cambia con un toque. Opcional: quiénes lo forman.
  Todo lo demás (turnos, tropas, continentes) se lleva **por equipo**. Preparar la partida debe tomar
  menos de un minuto: con los valores por defecto basta elegir cuántos equipos y **¡Empezar!**
- **Qué ejércitos juegan y en qué orden** (pedido el 27-oct-2026): se marcan los colores que juegan (p. ej. solo
  Azul, Verde y Amarillo) y se ordenan con ▲ ▼; ese es el orden de los turnos. Se marca quién empieza (★) o se sortea
  (dado mayor). Mínimo 2 para empezar.
- Mapa: **LOTR** (con sus regiones, fortalezas y Modo Anillo) o **clásico**. Lista de continentes/regiones
  editable, con su bono.
- Modo Equipos (Bien vs Mal) opcional.
- Recordatorio de la preparación: repartir cartas parejas (las que sobran a los últimos turnos), 1 soldado
  por territorio, 4 cartas por jugador, 20 unidades iniciales.

### 2. Dashboard de la partida (pantalla principal, siempre a la vista)
La partida nunca se detiene: el dashboard de puntuaciones es lo que se ve todo el tiempo y avanza turno
a turno. La escuela, el juez de dados y el reglamento se abren **encima, como ventana emergente**, y al
cerrarla el dashboard sigue exactamente donde iba (el reloj del turno no se detiene por abrirla).

- Arriba: **Ronda 3 de 6** (la primera marcada como *Tutorial*) y qué equipo juega, con su color.
- **Carta del turno**:
  - **Tropas a reclamar**, grande, con el desglose. Al decirle al jugador sus tropas **arranca el reloj**
    (como dice el reglamento).
  - Antes de eso, una pregunta rápida: *"¿Sigues teniendo Rohan?"* ✓ / ✗, y **+ Conquisté un continente**,
    que suma sus tropas en ese mismo turno.
  - **Reloj del turno** con arena (el de Dixit): en el Tutorial pasa solo de *Ataques 1:00* a
    *Reubicar 0:20*.
    - **⏸ Pausa** para cuando el defensor no puede tirar.
    - Al llegar a 0: *"Tiempo — ninguna acción más"* con campanita y vibración.
  - **Fases** como pasos que se tachan: Refuerzos → Ataque → Reagrupar → Reclamar cartas.
  - **Cartas a reclamar**: el jugador marca cuántos territorios conquistó y la app dice cuántas cartas toma
    (1→1, 2→2, 3 o más→3, hasta 5). **En la última ronda no se reclaman** (la app lo avisa).
  - Botón **Siguiente turno →**. Al cerrar la última ronda: **fin de la partida**.
- **Tabla de equipos** (el dashboard de puntuaciones): una fila por equipo con su color, **los continentes
  que tiene** (uno o varios, cada uno con su ×1, ×2, ×3…) y **cuántas tropas reclama en su próximo turno**.
  - A cada equipo se le asignan o quitan continentes con un toque, en cualquier momento: si lo conquista,
    reclama sus tropas **de inmediato**, sin esperar turno; al sostenerlo, ×2 el siguiente turno, ×3 el otro…
  - Un continente solo puede tenerlo un equipo: asignarlo a otro se lo quita al anterior (y le reinicia la cuenta).
- **Equipo ausente** (no puede seguir jugando un rato): un toque en su fila lo marca *ausente* y la app
  aplica la regla del reglamento para que la partida no se frene:
  1. Su turno se salta (si pasa una ronda entera sin él, pierde el turno).
  2. **Si lo atacan**, la app pregunta *"¿Quién defiende por el Equipo Rojo?"* y propone a otro equipo
     disponible que no sea el atacante.
  3. **Si no hay quién**, su defensa es automática: **4 y 2** siempre; el atacante tira sus dados y el juez
     de dados resuelve contra 4 y 2.
  - La fila del ausente se ve atenuada con 💤 y un botón **Volvió** para reincorporarlo.
- **↶ Deshacer** el último turno.

### 2b. Sensación de urgencia: la partida nunca se para
La app empuja a avanzar sin ser molesta:
- Un toque grande lleva al siguiente: **Siguiente turno →**. Pasa al equipo que sigue, le dice sus tropas
  y **arranca su reloj de una vez** (sin pantallas intermedias).
- Mientras corre el reloj, el color del turno va de calma a urgencia: tranquilo al inicio, ámbar en el
  último tercio, **rojo latiendo** en los últimos 15 s (como el coral de Dixit, más intenso). Opcional en ⚙:
  tic-tac en los últimos 10 s.
- Al llegar a 0: **"⛔ ¡Tiempo! Ninguna acción más"** a pantalla completa por un momento, campanita y
  vibración, y el botón **Siguiente turno →** resaltado.
- **Cuenta regresiva entre turnos (pantalla completa)**: al terminar el turno de un equipo (se acabó su
  tiempo o tocaron *Siguiente turno →*), toda la pantalla muestra **"¡Turno del Equipo Azul!"** con su color y
  un conteo grande de **10, 9, 8…** para que se prepare.
  - Botones: **⏸ Pausar / ▶ Seguir**, **¡Ya!** (empieza sin esperar) y **✕** (vuelve al dashboard sin empezar).
  - Al llegar a 0 vuelve al dashboard y **arranca el reloj del equipo** con sus tropas a la vista.
  - **En pausa** sale una recomendación: *"¿No está el equipo? Márcalo 💤 ausente: si lo atacan, alguien
    más tira por él o se defiende con 4 y 2"*, con el botón **💤 Marcar ausente** (salta al siguiente).
  - Muestra también lo que le queda al equipo anterior: *"Equipo Rojo: reclama 2 cartas"*.
  - Los segundos del conteo (10 por defecto) se cambian en ⚙.
- Siempre visible: **"Sigue: Equipo Verde"** (quién debe alistarse) y **"Ronda 4 de 6 · quedan 2"**.
  En la última ronda se anuncia *"¡Última ronda!"* (y que no se reclaman cartas).
- **Fin de la partida**: se anotan territorios + puntos por regiones de cada jugador y se muestra el ganador.

### 3. Escuela 🎓 (ventana emergente): aprender los dados jugando
Se abre desde la barra (🎓) o desde ⚙ → *Cómo se juega*, encima del dashboard.
- **Tutorial paso a paso** para el que está perdido: cómo es un turno, cómo se reclaman las tropas
  (con un ejemplo de bola de nieve), cuántos dados puede tirar cada uno según sus fichas, y cómo se comparan.
- **¿Cuántos dados?** Pones cuántas fichas tiene el atacante en su territorio y cuántas el defensor, y la
  app dice con cuántos dados tira cada uno (4 fichas → 3 dados, porque 1 se queda; 2 fichas → 1 dado…) y
  arma la mesa: 3 contra 2, 3 contra 1, 2 contra 1…
- **Mesa de dados**: elige dados de ataque (1–3) y de defensa (1–2).
  - Los dados caen, se ordenan de mayor a menor y se emparejan con una línea (alto contra alto, segundo
    contra segundo).
  - Cada pareja dice quién gana: **empate → defensor**.
  - Resultado: *"El atacante pierde 1, el defensor pierde 1"*.
  - Opciones para practicar los bufos:
    - **Líder** (+1 al dado más alto; con 2 líderes, +2).
    - **Fortaleza** (+1 al dado más alto del defensor).
    - **Doble Filo ×2/×3** (cada baja vale 2 o 3, con la equidad de pérdidas).
    - **Maldecir** (el atacante gana los empates).
    - **Dado enajenado** (un dado más).
- **Preguntas**: salen los dados y, antes de la respuesta:
  - *¿Quién gana la pareja alta?* · *¿Cuántas tropas pierde el atacante?* · *¿y el defensor?*
  - Botones grandes; al responder se resaltan las parejas y se explica. Lleva la cuenta de aciertos.
- **¿Me conviene atacar?** Probabilidades en lenguaje sencillo, calculadas exactas. Por ejemplo, 3 contra 2:
  el atacante gana las dos ≈ 37 %, una y una ≈ 34 %, el defensor las dos ≈ 29 %. Cambian al activar líder o fortaleza.
- **Fichas de reglas** (como el catálogo de Dixit):
  - **Cómo se ataca**: solo a un territorio **aledaño** (que toca el tuyo o unido por línea/puerto).
    - Con 3 dados necesitas 4 unidades: siempre queda 1 defendiendo.
    - Si tiras más dados de los permitidos, **pierdes 1 soldado y repites el tiro** (castigo de dados).
  - **Al conquistar**: puedes mover todas menos 1.
  - **Reagrupar**: entre territorios conectados, dejando 1 en cada uno.
  - **Unidades**: 👤 Soldado 1 · 🐎 Caballería 5 · 🧨 Artillería 10 (cambio en refuerzo y reagrupamiento).
  - **A quién atacar**:
    - completar un continente, porque la bola de nieve vale mucho;
    - romper el continente de otro antes de que crezca;
    - atacar con ventaja (3 contra 1, 3 contra 2).
  - **Alianzas**: pozo de cartas; quien la rompe lo pierde.

### 3b. Juez de dados ⚖️ (ventana emergente): lo que salió en el tablero real
Para resolver en la mesa sin discutir: se tocan los dados que salieron de verdad (caras 1–6, de 1 a 3 del
atacante y de 1 a 2 del defensor) y la app los ordena, los empareja y dice **quién ganó cada pareja y
cuántas tropas pierde cada uno**, con los bufos activos (líder, fortaleza, Maldecir, Doble Filo). Usa la
misma mesa visual de la escuela, así el que juega aprende viendo su propia tirada.

### 4. Reglamento 📖 y poderes
- El reglamento completo por secciones (Preparación, Fases, Unidades, Poderes, Mapa LOTR), como panel
  lateral, para consultarlo en la mesa.
- **Poderes**: carta por poder con su coste y efecto. Los que tocan la app tienen botón:
  - DESIGNAR CAPITAL: +3 por turno.
  - TÚNEL DE GUSANO: tira un D6 contra dificultad 5, que baja 1 por turno.
  - RESILIENCIA: calcula la mitad de las tropas perdidas.

### 5. Mapa LOTR (módulo opcional en ⚙)
- **Fortalezas doradas** de cada jugador (+3 por turno desde la ronda 3, si se activa la opción).
- Cartas por conquista: +3 por fortaleza dorada y +1 por sitio de poder.
- **Líderes**: cuántos tiene cada jugador (máximo 3) y su coste (7 el primero, 15 los siguientes).
- **Modo Anillo**:
  - Al final de cada turno la app tira el dado del anillo: dificultad 3, o 5 en regiones con dado.
  - Muestra en qué región va.
  - Al llegar al Monte: fin, el anillo es destruido y gana el Bien.
  - Victoria del Mal: 20 unidades durante una ronda donde está el anillo; opcionalmente, 2 dados con suma de 11 o más, con +1 por líder.

### 6. Ajustes ⚙
- Tropas por turno, rondas, tiempos (Tutorial y Normal), bonos de continentes y módulos LOTR.
- Del reloj: encendido, cómo se ve el tiempo, campanita y vibración.
- Se guardan aparte: partida `musa.risk.partida.v1` y ajustes `musa.risk.ajustes.v1`.

## Fases de construcción

1. **Base (mapa normal)**: tablero del turno (tropas con bola de nieve, reloj Tutorial/Normal, cartas, rondas), ajustes y
   escuela de dados con preguntas.
2. **Reglamento y poderes** en la app.
3. **Módulo LOTR**: fortalezas, líderes, Modo Anillo, Equipos, y los bufos en la escuela y el juez
   (líder, fortaleza, Doble Filo, Maldecir, dado enajenado).

## Fuera de alcance

- Dibujar el mapa con sus territorios o contar las fichas del tablero: Musa acompaña al tablero físico.
- Jugar en línea o entre varios celulares.

## Preguntas para John

1. **Bono de cada continente**: el reglamento dice *"las tropas que hay en el continente"*. ¿Es un número
   fijo por continente (como el que trae impreso el tablero LOTR)? Pásame la lista de regiones y su valor.
2. **Tabla de ventas** de cartas (estrellas → tropas) y la de **canje de tropas por cartas**: en el texto
   salieron vacías.
3. Defensa: dice *"el defensor con mínimo 2 dados"*. ¿Es **hasta 2** (como el clásico) o siempre 2?
4. **Puntos por regiones** al final: ¿cuántos vale cada región?
5. El reloj de 2:15: ¿incluye el reagrupamiento o este tiene su propio tiempo como en el Tutorial?

## Verificación fase 1 (27-oct-2026, navegador a tamaño celular)

- ✅ Preparar: 3 equipos Azul/Rojo/Verde, sorteo con dado mayor, ¡Empezar!
- ✅ Cuenta regresiva a pantalla completa; en pausa sale el consejo del ausente; "Marcar ausente" salta al siguiente.
- ✅ Bola de nieve con Asia (7): conquista 7 + 7 = 14; siguiente turno 7 + 30 (paso a Normal) + 14 = 51; luego 7 + 21 = 28.
- ✅ Tutorial en la ronda 1; desde la 2, 2:15. Con turno de 0:10: rojo en los últimos 15 s y, al llegar a 0,
  "⛔ Se acabó el tiempo… ninguna acción más" y pasa solo a la cuenta del siguiente equipo.
- ✅ Cartas: 3+ → 3 cartas; en la última ronda "no se reclaman cartas". Fin de la partida con ganador.
- ✅ Tras recargar sigue en la misma ronda y turno.
- ✅ Escuela: probabilidades exactas 3 contra 2 (37 / 34 / 29 %), preguntas con aciertos, ¿cuántos dados?, 9 lecciones.
- ✅ Juez: 6-4-1 contra 5-4 → cada uno pierde 1; ausente 4 y 2 con 4-1-1 → el atacante pierde 2.
- Pendiente: probarlo en el celular de verdad (sonido, vibración) y lo que John pida al verlo (dados más animados, más interacción).

## Requisitos

- **R1.** Funciona sin Internet. En un celular se ve sin bajar la pantalla lo principal: tropas a reclamar,
  reloj y *Siguiente turno*.
- **R2.** La partida sobrevive a cerrar la app o recargar. El reloj se cuenta contra la hora de término (como en Dixit).
- **R3.** Dados al azar de verdad (`crypto.getRandomValues`). La explicación siempre coincide con la regla
  (empate → defensor, salvo Maldecir).
- **R4.** Mismo sistema visual que Dixit; solo cambia el acento de color.
- **R5.** Lo de cada turno se hace con 1 o 2 toques; nada de escribir durante la partida.

## Criterios de aceptación (fase 1)

0. Con 2 equipos, el dashboard muestra a ambos con sus continentes y tropas del próximo turno; abrir y
   cerrar la escuela o el juez no cambia la ronda, el turno ni el reloj.

1. Ronda 1 sale como *Tutorial*: reclamar, Ataques 1:00 y Reubicar 0:20. Desde la ronda 2, reloj de 2:15.
2. Con valores por defecto, cada turno dice *"reclama 7 tropas"*. Los equipos salen como Azul, Rojo, Verde…
   y les puedo cambiar el nombre. Siguiente turno → arranca el reloj del equipo que sigue sin más toques.
3. El equipo 1 conquista un continente de 3 en su turno: reclama +3 ahí mismo. En su siguiente turno, 7 + 6 = 13;
   en el siguiente, 7 + 9 = 16.
4. Si el equipo 1 dice que ya no lo tiene, vuelve a 7. Si lo recupera, empieza otra vez en ×1.
5. Pausa conserva el tiempo. Al llegar a 0 avisa *"ninguna acción más"*.
6. Conquistó 4 territorios → reclama 3 cartas. En la última ronda la app dice que no se reclaman.
7. En ⚙, con 10 tropas y 7 rondas, el turno dice 10 y la partida termina tras la ronda 7.
8a. Marco al Equipo Rojo ausente: su turno se salta. Lo atacan y no hay quien defienda → la defensa
   es 4 y 2; con 6-5-2 del atacante: 6>4 y 5>2 → el defensor pierde 2 y el atacante 0. Con 4-2-1: empate 4=4
   y empate 2=2 → el atacante pierde 2.
8. Juez de dados: toco 6-4-1 del atacante y 5-4 del defensor → dice "cada uno pierde 1".
   ¿Cuántos dados?: atacante con 4 fichas y defensor con 1 → mesa de 3 contra 1.
9. Escuela: 3 contra 2 con 6-4-1 contra 5-4 → el atacante gana la pareja alta (6>5) y el defensor la
   segunda (4=4, empate) → cada uno pierde 1. El modo preguntas acepta esa respuesta y lo explica.
   (Con Líder en el ataque, el 6 vale 7: fase 3.)
9a. Toco Siguiente turno → pantalla completa "¡Turno del Equipo Rojo!" contando de 10 a 0; al terminar se
   ve el dashboard con su reloj corriendo. Al pausar el conteo aparece la recomendación del ausente.
10. Tras recargar, la partida sigue en la misma ronda, turno y tiempo.
