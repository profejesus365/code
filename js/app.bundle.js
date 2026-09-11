/* PanelAcademiaCODE — paquete generado por publicar.py
   Reune todos los modulos de js/ en un archivo clasico, para que la
   pagina funcione tambien abierta con doble clic (file://).
   No editar a mano: edita js/*.js y vuelve a ejecutar publicar.py. */
'use strict';
(function () {

/* ---------- bus.js ---------- */
var __M_bus = (function () {
/* ============================================================================
   bus.js — Aviso central de «los datos cambiaron»
   ----------------------------------------------------------------------------
   Cualquier parte que modifique la base emite aquí, y las vistas que estén en
   pantalla se enteran. Se distinguen dos orígenes:

     'local'   — lo cambió esta misma pestaña (el docente escribiendo).
     'externo' — llegó de fuera: otra pestaña del mismo navegador o el archivo
                 data/academia-code.json que el docente acaba de reescribir.

   Solo el origen 'externo' obliga a repintar: si repintáramos en 'local' se
   perdería el foco de la celda que el docente está escribiendo.
   ========================================================================== */

const oyentes = new Set();

/** Se suscribe a los cambios. Devuelve la función para darse de baja. */
function alCambiar(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

function emitir(origen, detalle) {
  oyentes.forEach((fn) => {
    try { fn(origen || 'local', detalle); } catch (e) { console.error(e); }
  });
}

return { alCambiar: alCambiar, emitir: emitir };
})();

/* ---------- config.js ---------- */
var __M_config = (function () {
/* ============================================================================
   config.js — Constantes del universo PanelAcademiaCODE (panel del estudiante)
   ----------------------------------------------------------------------------
   Espejo del modelo académico del Panel Docente (Academia C.O.D.E. v2) más la
   escalera de los 10 niveles hacker. Si el docente cambia rangos, pesos o
   escala en su panel, este archivo es el único que hay que sincronizar.
   ========================================================================== */

const APP = {
  name: 'PanelAcademiaCODE',
  tagline: 'Panel del Estudiante · Academia C.O.D.E.',
  version: '1.5.0',
  storeKey: 'panel_estudiante_v1',        // base de datos importada
  sessionKey: 'panel_estudiante_sesion',  // código con sesión abierta
  themeKey: 'panel_estudiante_tema'
};

/* Escala institucional 0.0 – 10.0 · aprobación desde 7.0 */
const SCALE = { min: 0, max: 10, pass: 7 };

const PERIODS = [1, 2, 3, 4];

/* Las cuatro misiones del periodo */
const CATEGORIES = [
  { key: 'taller', label: 'Taller',               short: 'Taller',    icon: 'fa-puzzle-piece',    color: '#22d3ee' },
  { key: 'xp',     label: 'Actividad Gamificada', short: 'Reto',      icon: 'fa-gamepad',         color: '#a855f7' },
  { key: 'bit1',   label: 'Bitácora 1',           short: 'Bitác. 1',  icon: 'fa-book-open',       color: '#34d399' },
  { key: 'bit2',   label: 'Bitácora 2',           short: 'Bitác. 2',  icon: 'fa-feather-pointed', color: '#fbbf24' }
];
const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

/* Rangos hacker por promedio (los mismos del Panel Docente) */
const RANKS = [
  { key: 'ghost',  name: 'G.H.O.S.T. Architect', min: 9.0, color: '#a855f7', icon: 'fa-eye' },
  { key: 'elite',  name: 'Cyber Elite',          min: 8.0, color: '#22d3ee', icon: 'fa-bolt' },
  { key: 'runner', name: 'Code Runner',          min: 7.0, color: '#34d399', icon: 'fa-satellite' },
  { key: 'kiddie', name: 'Script Kiddie',        min: 5.0, color: '#fbbf24', icon: 'fa-flask' },
  { key: 'reboot', name: 'Reboot Required',      min: 0,   color: '#f87171', icon: 'fa-triangle-exclamation' }
];

/* Desempeño institucional */
const PERFORMANCE = [
  { key: 'sup', label: 'Superior', min: 9.0, color: '#a855f7' },
  { key: 'alt', label: 'Alto',     min: 8.0, color: '#22d3ee' },
  { key: 'bas', label: 'Básico',   min: 7.0, color: '#34d399' },
  { key: 'baj', label: 'Bajo',     min: 0,   color: '#f87171' }
];

/* Eras narrativas: una por periodo académico */
const ERAS = [
  { period: 1, name: 'Fundación',     icon: 'fa-book',          color: '#8fa9b8' },
  { period: 2, name: 'Forja',         icon: 'fa-hammer',        color: '#c9803f' },
  { period: 3, name: 'Misterio',      icon: 'fa-wand-sparkles', color: '#9b87ce' },
  { period: 4, name: 'Trascendencia', icon: 'fa-crown',         color: '#e0b84a' }
];

/* ------------------------------------------------------------------------
   Experiencia y los 10 niveles hacker
   ------------------------------------------------------------------------
   La escalera está calibrada a un objetivo: quien mantenga un promedio de
   8.5 a lo largo de las 24 misiones del año despierta los diez niveles.

     XP de una misión  = nota de la misión × 10        (máximo 100)
     XP del año        = suma de las 24 misiones       (máximo 2 400)
     Meta (8.5 × 24)   = 2 040 XP
     Un escalón cada     225 XP  →  el nivel 10 pide 2 025

   Por eso la XP se cuenta misión a misión y no por periodo: así refleja el
   trabajo realmente entregado. Quien lleve seis misiones hechas no puede
   estar arriba del todo, por muy alta que tenga la nota.
   ---------------------------------------------------------------------- */
const XP_PER_POINT = 10;                 // XP por cada punto de nota de una misión
const MAX_LEVEL = 10;

/* Se define abajo, cuando ya se conoce MISIONES_POR_PERIODO. */
const MISIONES_TOTALES = 24;             // 4 periodos × 6 misiones
const XP_POR_MISION = SCALE.max * XP_PER_POINT;                    // 100
const XP_MAX = MISIONES_TOTALES * XP_POR_MISION;                   // 2400
const XP_MAX_PERIODO = 6 * XP_POR_MISION;                          // 600

/** Promedio que hay que sostener para desbloquear toda la escalera. */
const PROMEDIO_META = 8.5;
const XP_META = Math.round(PROMEDIO_META * XP_PER_POINT * MISIONES_TOTALES); // 2040
const XP_PER_LEVEL = 225;                // 9 escalones → nivel 10 en 2025

const AVATAR_DIR = 'assets/avatares/';   // retratos cuadrados 400 × 400
const NIVEL_DIR = 'assets/niveles/';     // retratos de cuerpo entero

/**
 * La escalera hacker. Cada nivel tiene nombre masculino y femenino, un lema,
 * un color y sus dos ilustraciones (cuadrada para el avatar, de cuerpo entero
 * para la vista de Niveles).
 */
const LEVELS = [
  {
    n: 1, slug: 'aprendiz', m: 'Aprendiz', f: 'Aprendiz',
    lema: 'Primer inicio de sesión', color: '#94a3b8', icon: 'fa-seedling',
    desc: 'Empiezas el camino: abrir el editor, leer bien el enunciado y atreverte a probar.',
    reto: 'Entrega tu primera misión completa, aunque no salga perfecta.',
    avatarM: 'hacker_aprendiz.png', avatarF: 'hacker_aprendiz_f.png'
  },
  {
    n: 2, slug: 'explorador', m: 'Explorador', f: 'Exploradora',
    lema: 'Curiosidad que abre puertas', color: '#38bdf8', icon: 'fa-magnifying-glass',
    desc: 'Investigas por tu cuenta y no te conformas con la primera respuesta que aparece.',
    reto: 'Añade a tu bitácora una fuente que hayas buscado tú.',
    avatarM: 'hacker_explorador.png', avatarF: 'hacker_exploradora_f.png'
  },
  {
    n: 3, slug: 'veloz', m: 'Veloz', f: 'Veloz',
    lema: 'Reflejos de teclado', color: '#22d3ee', icon: 'fa-bolt',
    desc: 'Entregas a tiempo y resuelves los retos gamificados sin quedarte atascado.',
    reto: 'Cierra un periodo sin ninguna misión pendiente.',
    avatarM: 'hacker_veloz.png', avatarF: 'hacker_veloz_f.png'
  },
  {
    n: 4, slug: 'logico', m: 'Lógico', f: 'Lógica',
    lema: 'Piensas en pasos', color: '#2dd4bf', icon: 'fa-diagram-project',
    desc: 'Descompones el problema y ordenas la solución antes de escribir la primera línea.',
    reto: 'Explica en tu bitácora el paso a paso de un taller.',
    avatarM: 'hacker_logico.png', avatarF: 'hacker_logica_f.png'
  },
  {
    n: 5, slug: 'cazabugs', m: 'Cazabugs', f: 'Cazabugs',
    lema: 'Ves lo que otros no ven', color: '#34d399', icon: 'fa-bug',
    desc: 'Encuentras el error, entiendes por qué ocurrió y lo corriges sin perder la calma.',
    reto: 'Documenta un error que hayas encontrado y cómo lo resolviste.',
    avatarM: 'hacker_cazabugs.png', avatarF: 'hacker_cazabugs_f.png'
  },
  {
    n: 6, slug: 'llave', m: 'Llave', f: 'Llave',
    lema: 'Descifras lo que parece cerrado', color: '#818cf8', icon: 'fa-key',
    desc: 'Manejas datos, accesos y contraseñas con criterio y responsabilidad.',
    reto: 'Supera un taller de los que se te atragantaron antes.',
    avatarM: 'hacker_llave.png', avatarF: 'hacker_llave_f.png'
  },
  {
    n: 7, slug: 'conector', m: 'Conector', f: 'Conectora',
    lema: 'Unes personas y sistemas', color: '#a78bfa', icon: 'fa-network-wired',
    desc: 'Conectas ideas, herramientas y compañeros para llegar más lejos que en solitario.',
    reto: 'Ayuda a un compañero a terminar su misión pendiente.',
    avatarM: 'hacker_conector.png', avatarF: 'hacker_conectora_f.png'
  },
  {
    n: 8, slug: 'creador', m: 'Creador', f: 'Creadora',
    lema: 'Construyes cosas nuevas', color: '#e879f9', icon: 'fa-wand-magic-sparkles',
    desc: 'Ya no solo resuelves lo que te piden: propones, diseñas y creas tus propios proyectos.',
    reto: 'Presenta una idea propia en la actividad gamificada.',
    avatarM: 'hacker_creador.png', avatarF: 'hacker_creadora_f.png'
  },
  {
    n: 9, slug: 'guardian', m: 'Guardián', f: 'Guardiana',
    lema: 'Proteges lo que la clase construye', color: '#fb923c', icon: 'fa-shield-halved',
    desc: 'Cuidas el trabajo del grupo: respaldos, buenas prácticas y seguridad digital.',
    reto: 'Cierra el año sin ningún periodo por debajo de 7.0.',
    avatarM: 'hacker_guardian.png', avatarF: 'hacker_guardiana_f.png'
  },
  {
    n: 10, slug: 'maestro', m: 'Maestro', f: 'Maestra',
    lema: 'Enseñas lo que dominas', color: '#fbbf24', icon: 'fa-graduation-cap',
    desc: 'La cima de la academia: explicas, guías y dejas huella en quienes vienen detrás.',
    reto: 'Ya estás arriba: mantén el nivel y comparte lo que sabes.',
    avatarM: 'hacker_maestro.png', avatarF: 'hacker_maestra_f.png'
  }
];

/* Estados de ánimo del avatar según el promedio del periodo más reciente */
const MOODS = [
  { key: 'radiante', min: 9.0, label: 'Radiante', icon: 'fa-face-grin-stars', color: '#a855f7',
    line: 'Tu hacker está radiante: la constancia se te nota en cada misión.' },
  { key: 'firme',    min: 8.0, label: 'Firme',    icon: 'fa-face-smile',      color: '#22d3ee',
    line: 'Tu hacker se mantiene firme. Vas por muy buen camino.' },
  { key: 'sereno',   min: 7.0, label: 'Sereno',   icon: 'fa-face-meh',        color: '#34d399',
    line: 'Tu hacker está sereno. Un empujón más y cambias de nivel.' },
  { key: 'inquieto', min: 5.0, label: 'Inquieto', icon: 'fa-face-frown',      color: '#fbbf24',
    line: 'Tu hacker está inquieto: hay misiones que piden atención.' },
  { key: 'dormido',  min: 0,   label: 'Dormido',  icon: 'fa-face-dizzy',      color: '#f87171',
    line: 'Tu hacker está desconectado. Entrega una misión para despertarlo.' }
];

/* ------------------------------------------------------------------------
   Álbum digital: 20 objetos de equipo hacker
   ------------------------------------------------------------------------
   Ya no es un retrato por nivel: es una colección de 20 piezas que el
   estudiante va desbloqueando con su propio avance de XP, sin importar el
   nivel hacker en el que esté. La primera pieza se entrega de entrada (0 XP)
   y las 19 restantes se reparten en tramos iguales de XP_MAX / 20, así que
   la última pieza —el trofeo— llega justo al tope de los 2 400 XP del año.
   ---------------------------------------------------------------------- */
const ALBUM_OBJETOS = [
  { n: 1,  slug: 'usb',       nombre: 'USB de arranque',        icon: 'fa-memory',              color: '#94a3b8',
    lema: 'Tu primer "Hola, mundo"',
    desc: 'El primer pendrive de la Academia: aquí guardas tu primer archivo de código.',
    reto: 'Es tuyo desde el primer día: solo entra a tu panel.' },
  { n: 2,  slug: 'teclado',   nombre: 'Teclado mecánico',       icon: 'fa-keyboard',            color: '#38bdf8',
    lema: 'Cada tecla, una decisión',
    desc: 'Cambias el teclado de siempre por uno mecánico: se nota en la velocidad de tus entregas.',
    reto: 'Entrega tu primera misión completa para ganártelo.' },
  { n: 3,  slug: 'mouse',     nombre: 'Mouse de precisión',     icon: 'fa-computer-mouse',      color: '#22d3ee',
    lema: 'Clics que no fallan',
    desc: 'Un mouse gamer para moverte rápido entre pestañas, consola y editor.',
    reto: 'Sigue sumando XP en tus próximas misiones.' },
  { n: 4,  slug: 'taza',      nombre: 'Taza de código',         icon: 'fa-mug-hot',             color: '#c9803f',
    lema: 'El combustible del hacker',
    desc: 'Una taza que nunca se enfría del todo: acompaña las sesiones largas de trabajo.',
    reto: 'La constancia se paga en XP: sigue entregando.' },
  { n: 5,  slug: 'bitacora',  nombre: 'Cuaderno de bitácora',   icon: 'fa-book-open',           color: '#34d399',
    lema: 'Lo que no se anota, se olvida',
    desc: 'Un cuaderno físico para bocetar ideas antes de que lleguen al teclado.',
    reto: 'Escribe una bitácora más y estará en tus manos.' },
  { n: 6,  slug: 'auriculares', nombre: 'Auriculares con micrófono', icon: 'fa-headset',        color: '#a78bfa',
    lema: 'Silencio para pensar mejor',
    desc: 'Cancelan el ruido de alrededor: justo lo que hace falta para concentrarte en un taller difícil.',
    reto: 'Supera un taller de los que se te atragantan.' },
  { n: 7,  slug: 'lampara',   nombre: 'Lámpara de escritorio',  icon: 'fa-lightbulb',           color: '#fbbf24',
    lema: 'Luz para las sesiones nocturnas',
    desc: 'Ilumina tu rincón de trabajo cuando el reto gamificado se alarga.',
    reto: 'Cierra un periodo sin ninguna misión pendiente.' },
  { n: 8,  slug: 'monitor',   nombre: 'Segundo monitor',        icon: 'fa-desktop',             color: '#2dd4bf',
    lema: 'Doble vista, doble avance',
    desc: 'Editor en una pantalla, documentación en la otra: así trabajan los que ya agarraron ritmo.',
    reto: 'Encadena varias misiones entregadas a tiempo.' },
  { n: 9,  slug: 'disco',     nombre: 'Disco duro externo',     icon: 'fa-hard-drive',          color: '#818cf8',
    lema: 'Nada de tu trabajo se pierde',
    desc: 'Un respaldo de todos tus proyectos, por si el equipo falla en mal momento.',
    reto: 'Documenta un error que hayas encontrado y cómo lo resolviste.' },
  { n: 10, slug: 'router',    nombre: 'Router propio',          icon: 'fa-wifi',                color: '#38bdf8',
    lema: 'Tu propia red, tus propias reglas',
    desc: 'Conexión estable para no perderte ni un reto gamificado en vivo.',
    reto: 'Ayuda a un compañero a terminar su misión pendiente.' },
  { n: 11, slug: 'webcam',    nombre: 'Webcam HD',              icon: 'fa-camera',              color: '#f472b6',
    lema: 'Muestra tu trabajo con la cara en alto',
    desc: 'Lista para grabar tus sustentaciones y presentar tus proyectos en vivo.',
    reto: 'Presenta una idea propia en la actividad gamificada.' },
  { n: 12, slug: 'microfono', nombre: 'Micrófono de podcast',   icon: 'fa-microphone',          color: '#e879f9',
    lema: 'Tu voz también programa',
    desc: 'Para explicar tu código en voz alta: la mejor forma de encontrar tus propios errores.',
    reto: 'Explica en tu bitácora el paso a paso de un taller.' },
  { n: 13, slug: 'gpu',       nombre: 'Tarjeta gráfica',        icon: 'fa-microchip',           color: '#a855f7',
    lema: 'Más potencia, más proyectos',
    desc: 'Tu equipo ya aguanta simulaciones y proyectos más ambiciosos.',
    reto: 'Alcanza un promedio de 9.0 o más en un periodo.' },
  { n: 14, slug: 'servidor',  nombre: 'Servidor casero',        icon: 'fa-server',              color: '#22d3ee',
    lema: 'Tu código, siempre en línea',
    desc: 'Un pequeño servidor para tener tus proyectos disponibles a toda hora.',
    reto: 'Cierra un periodo entero sin ninguna nota por debajo de 7.0.' },
  { n: 15, slug: 'impresora3d', nombre: 'Impresora 3D',         icon: 'fa-cube',                color: '#fb923c',
    lema: 'De la pantalla al mundo real',
    desc: 'Ya no solo programas: también fabricas piezas para tus propios inventos.',
    reto: 'Propón y desarrolla una idea original en tu bitácora.' },
  { n: 16, slug: 'gafasar',   nombre: 'Gafas de realidad aumentada', icon: 'fa-vr-cardboard',   color: '#818cf8',
    lema: 'Ves capas que otros no ven',
    desc: 'Superponen datos sobre el mundo real: la vista de quien ya domina el terreno.',
    reto: 'Mantén dos periodos seguidos por encima de 8.5.' },
  { n: 17, slug: 'antena',    nombre: 'Antena de largo alcance', icon: 'fa-satellite',          color: '#2dd4bf',
    lema: 'Tu señal llega más lejos',
    desc: 'Capta señales de toda la Academia: útil para quien ya piensa en grande.',
    reto: 'Entra al podio de tu curso en el ranking.' },
  { n: 18, slug: 'llave',     nombre: 'Llave de seguridad USB', icon: 'fa-key',                 color: '#fbbf24',
    lema: 'Accesos que solo tú controlas',
    desc: 'Protege tus cuentas y proyectos como un profesional de la ciberseguridad.',
    reto: 'Termina el año sin ninguna misión sin entregar.' },
  { n: 19, slug: 'escudo',    nombre: 'Escudo firewall personal', icon: 'fa-shield-halved',     color: '#f87171',
    lema: 'Blindaje para tu trabajo',
    desc: 'Protege todo lo que construiste en el año: buenas prácticas hechas hardware.',
    reto: 'Cierra el año con un promedio global de 9.0 o más.' },
  { n: 20, slug: 'trofeo',    nombre: 'Trofeo de la Academia',  icon: 'fa-trophy',              color: '#f59e0b',
    lema: 'La colección completa',
    desc: 'Reuniste las veinte piezas: tu equipo de hacker está completo.',
    reto: 'Sostén tu promedio hasta el último día del año lectivo.' }
];
const ALBUM_TOTAL = ALBUM_OBJETOS.length;                          // 20
const XP_POR_OBJETO = XP_MAX / ALBUM_TOTAL;                        // 120

/* Insignias — todas se deducen de los datos del Panel Docente */
const BADGES = [
  { key: 'primer-paso',   name: 'Primer Paso',        icon: 'fa-shoe-prints',      color: '#94a3b8', desc: 'Tu primera misión calificada.' },
  { key: 'periodo1',      name: 'Periodo Sellado',    icon: 'fa-file-signature',   color: '#8fa9b8', desc: 'Completaste las cuatro misiones del Periodo 1.' },
  { key: 'sin-pendiente', name: 'Sin Pendientes',     icon: 'fa-list-check',       color: '#34d399', desc: 'Ninguna misión sin entregar en los periodos abiertos.' },
  { key: 'diez',          name: 'Nota Perfecta',      icon: 'fa-star',             color: '#fbbf24', desc: 'Alcanzaste 10.0 en al menos una misión.' },
  { key: 'excelencia',    name: 'Excelencia',         icon: 'fa-gem',              color: '#a855f7', desc: 'Promedio global igual o superior a 9.0.' },
  { key: 'elite',         name: 'Cyber Elite',        icon: 'fa-bolt',             color: '#22d3ee', desc: 'Promedio global igual o superior a 8.0.' },
  { key: 'ascenso',       name: 'En Ascenso',         icon: 'fa-arrow-trend-up',   color: '#34d399', desc: 'Mejoraste tu promedio dos periodos seguidos.' },
  { key: 'taller',        name: 'Maestro del Yunque', icon: 'fa-puzzle-piece',     color: '#22d3ee', desc: 'Promedio de talleres igual o superior a 9.0.' },
  { key: 'reto',          name: 'Domador de Retos',   icon: 'fa-gamepad',          color: '#a855f7', desc: 'Promedio de retos gamificados igual o superior a 9.0.' },
  { key: 'bitacora',      name: 'Cronista de Nexus',  icon: 'fa-book-open',        color: '#34d399', desc: 'Promedio de bitácoras igual o superior a 9.0.' },
  { key: 'racha',         name: 'Racha de Fuego',     icon: 'fa-fire',             color: '#fb923c', desc: 'Seis o más misiones seguidas entregadas.' },
  { key: 'podio',         name: 'Podio del Curso',    icon: 'fa-medal',            color: '#fbbf24', desc: 'Estás entre los tres primeros de tu curso.' },
  { key: 'top10',         name: 'Top 10 Global',      icon: 'fa-ranking-star',     color: '#22d3ee', desc: 'Estás entre los diez primeros de la academia.' },
  { key: 'sin-bajos',     name: 'Escudo Intacto',     icon: 'fa-shield-halved',    color: '#34d399', desc: 'Ningún periodo por debajo de 7.0.' },
  { key: 'nivel5',        name: 'Mitad del Camino',   icon: 'fa-star-half-stroke', color: '#34d399', desc: 'Llegaste al nivel 5 de la escalera hacker.' },
  { key: 'nivel10',       name: 'Maestría',           icon: 'fa-graduation-cap',   color: '#fbbf24', desc: 'Alcanzaste el nivel 10: la cima de la academia.' }
];

/* Rutas de datos que se intentan cargar, en orden */
const DATA_SOURCES = ['data/academia-code.json', 'data/demo.json'];

/* Vistas del panel del estudiante */
const VIEWS = [
  { id: 'perfil',       label: 'Perfil',       icon: 'fa-id-badge' },
  { id: 'niveles',      label: 'Niveles',      icon: 'fa-stairs' },
  { id: 'album',        label: 'Álbum',        icon: 'fa-images' },
  { id: 'estadisticas', label: 'Estadísticas', icon: 'fa-chart-line' },
  { id: 'comparativa',  label: 'Comparativa',  icon: 'fa-scale-balanced' },
  { id: 'ranking',      label: 'Ranking',      icon: 'fa-ranking-star' },
  { id: 'boletines',    label: 'Boletines',    icon: 'fa-envelope-open-text' },
  { id: 'escarapela',   label: 'Escarapela',   icon: 'fa-address-card' }
];

/* Vistas del panel del docente */
const VIEWS_DOCENTE = [
  { id: 'centro',      label: 'Centro de Mando', icon: 'fa-gauge-high' },
  { id: 'estudiantes', label: 'Estudiantes',     icon: 'fa-users' },
  { id: 'notas',       label: 'Notas',           icon: 'fa-table-cells' },
  { id: 'clasificacion', label: 'Ranking',       icon: 'fa-ranking-star' },
  { id: 'credenciales', label: 'Escarapelas',    icon: 'fa-address-card' },
  { id: 'album',       label: 'Álbum',           icon: 'fa-images' },
  { id: 'informes',    label: 'Informes',        icon: 'fa-file-lines' },
  { id: 'consola',     label: 'Consola',         icon: 'fa-sliders' }
];

const GRADES = ['6', '7', '8', '9', '10', '11'];
const GROUPS = ['A', 'B', 'C', 'D'];
const GENDERS = { M: 'Masculino', F: 'Femenino', X: 'Otro / N.E.' };

/** Configuración institucional por defecto (la sobreescribe el JSON del docente). */
const DEFAULT_CONFIG = {
  institution: 'Institución Educativa Academia C.O.D.E.',
  teacher: 'Docente responsable',
  subject: 'Tecnología e Informática',
  year: String(new Date().getFullYear()),
  logo: 'CODE',
  weights: { taller: 25, xp: 25, bit1: 25, bit2: 25 }
};

/** Encabezados aceptados al importar Excel (normalizados: minúsculas, sin tildes). */
const HEADERS = {
  name:   ['nombre completo', 'nombre', 'nombres', 'estudiante', 'nombre del estudiante', 'apellidos y nombres'],
  grade:  ['grado', 'nivel', 'curso'],
  group:  ['grupo', 'seccion', 'salon'],
  gender: ['genero', 'sexo'],
  code:   ['codigo de estudiante', 'codigo', 'codigo estudiante', 'id', 'identificacion', 'documento']
};

/**
 * Estructura de cada periodo: seis misiones, y dentro de cada misión las cuatro
 * actividades que se califican. Son 24 notas por periodo y 96 en el año.
 */
const MISIONES_POR_PERIODO = 6;
const MISIONES = [1, 2, 3, 4, 5, 6];

/** Las cuatro actividades que se crean solas dentro de cada misión. */
const SEED_ACTIVITIES = [
  { cat: 'taller', name: 'Taller' },
  { cat: 'xp',     name: 'Actividad Gamificada' },
  { cat: 'bit1',   name: 'Bitácora 1' },
  { cat: 'bit2',   name: 'Bitácora 2' }
];

const nombreMisionPorDefecto = (n) => 'Misión ' + n;

/** Tipos de aviso que el docente puede publicar. */
const TIPOS_AVISO = [
  { key: 'mision', label: 'Misión',       icon: 'fa-flag-checkered',        color: '#22d3ee' },
  { key: 'info',   label: 'Información',  icon: 'fa-circle-info',           color: '#a855f7' },
  { key: 'logro',  label: 'Logro',        icon: 'fa-trophy',                color: '#fbbf24' },
  { key: 'alerta', label: 'Atención',     icon: 'fa-triangle-exclamation',  color: '#f87171' }
];

/** Cuántos respaldos con fecha se conservan. */
const MAX_RESPALDOS = 30;

return { APP: APP, SCALE: SCALE, PERIODS: PERIODS, CATEGORIES: CATEGORIES, CAT: CAT, RANKS: RANKS, PERFORMANCE: PERFORMANCE, ERAS: ERAS, XP_PER_POINT: XP_PER_POINT, MAX_LEVEL: MAX_LEVEL, MISIONES_TOTALES: MISIONES_TOTALES, XP_POR_MISION: XP_POR_MISION, XP_MAX: XP_MAX, XP_MAX_PERIODO: XP_MAX_PERIODO, PROMEDIO_META: PROMEDIO_META, XP_META: XP_META, XP_PER_LEVEL: XP_PER_LEVEL, AVATAR_DIR: AVATAR_DIR, NIVEL_DIR: NIVEL_DIR, LEVELS: LEVELS, MOODS: MOODS, ALBUM_OBJETOS: ALBUM_OBJETOS, ALBUM_TOTAL: ALBUM_TOTAL, XP_POR_OBJETO: XP_POR_OBJETO, BADGES: BADGES, DATA_SOURCES: DATA_SOURCES, VIEWS: VIEWS, VIEWS_DOCENTE: VIEWS_DOCENTE, GRADES: GRADES, GROUPS: GROUPS, GENDERS: GENDERS, DEFAULT_CONFIG: DEFAULT_CONFIG, HEADERS: HEADERS, MISIONES_POR_PERIODO: MISIONES_POR_PERIODO, MISIONES: MISIONES, SEED_ACTIVITIES: SEED_ACTIVITIES, nombreMisionPorDefecto: nombreMisionPorDefecto, TIPOS_AVISO: TIPOS_AVISO, MAX_RESPALDOS: MAX_RESPALDOS };
})();

/* ---------- datos.js ---------- */
var __M_datos = (function () {
/* ============================================================================
   datos.js — Carga, normalización y persistencia de la base de la academia
   ----------------------------------------------------------------------------
   Orden de búsqueda al arrancar:
     1. localStorage  → base importada a mano por el estudiante (o el docente).
     2. data/academia-code.json → copia que el docente deja en la carpeta.
     3. data/demo.json → cohorte de demostración.
   El esquema es exactamente el que exporta el Panel Docente v2, más dos campos
   opcionales que este panel aprovecha si existen: `avisos` y `students[].notas`.
   ========================================================================== */

const { APP, PERIODS, MISIONES, DATA_SOURCES, DEFAULT_CONFIG, nombreMisionPorDefecto } = __M_config;
const { emitir } = __M_bus;
/* ------------------------------- utilidades ------------------------------ */

function norm(s) {
  return String(s == null ? '' : s).trim().toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ');
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) h = ((h << 5) - h + String(str).charCodeAt(i)) | 0;
  return Math.abs(h);
}

function normGender(v) {
  const s = norm(v);
  if (!s) return 'X';
  if (['m', 'masculino', 'hombre', 'male', 'h', 'nino'].includes(s)) return 'M';
  if (['f', 'femenino', 'mujer', 'female', 'nina'].includes(s)) return 'F';
  return 'X';
}

/**
 * Género con el que se ilustra al estudiante. Para «Otro / N.E.» se elige de
 * forma estable a partir del código, para que el avatar nunca cambie solo.
 * El retrato concreto lo decide el nivel hacker (ver motor.js).
 */
function generoIlustracion(st) {
  if (!st) return 'm';
  if (st.gender === 'F') return 'f';
  if (st.gender === 'M') return 'm';
  return hash(st.code || st.name || '') % 2 ? 'f' : 'm';
}

/* --------------------------------- estado -------------------------------- */

const db = {
  cargado: false,
  origen: '',          // texto legible de dónde salieron los datos
  config: {},
  students: [],
  activities: { 1: [], 2: [], 3: [], 4: [] },
  missions: { 1: [], 2: [], 3: [], 4: [] },
  grades: {},
  avisos: [],
  savedAt: null
};

const CONFIG_DEFECTO = DEFAULT_CONFIG;

/** Convierte cualquier base (exportada, demo o pegada) al formato interno. */
function hidratar(raw, origen) {
  const d = raw || {};
  db.config = Object.assign({}, CONFIG_DEFECTO, d.config || {});
  db.config.weights = Object.assign({}, CONFIG_DEFECTO.weights, (d.config || {}).weights || {});

  db.students = (Array.isArray(d.students) ? d.students : []).map((s, i) => ({
    id: s.id || 'st_' + i,
    code: String(s.code || '').trim(),
    name: String(s.name || 'Sin nombre').trim(),
    grade: String(s.grade || '').trim(),
    group: String(s.group || '').trim().toUpperCase(),
    gender: normGender(s.gender),
    avatar: s.avatar || null,
    notas: s.notas || null            // retroalimentación manual opcional
  })).filter((s) => s.code);

  /* Actividades. Las bases antiguas traían cuatro por periodo y sin número de
     misión: se conservan tal cual dentro de la misión 1, sin perder notas. */
  db.activities = {};
  PERIODS.forEach((p) => {
    const lista = (d.activities && (d.activities[p] || d.activities[String(p)])) || [];
    db.activities[p] = lista.map((a) => ({
      id: a.id,
      cat: a.cat,
      name: a.name || a.cat,
      period: Number(p),
      mision: Number(a.mision) >= 1 ? Number(a.mision) : 1
    }));
  });

  /* Nombres de las seis misiones de cada periodo. */
  db.missions = {};
  PERIODS.forEach((p) => {
    const guardadas = (d.missions && (d.missions[p] || d.missions[String(p)])) || [];
    db.missions[p] = MISIONES.map((n) => {
      const m = guardadas.find((x) => Number(x.n) === n);
      return { n, name: (m && m.name) || nombreMisionPorDefecto(n) };
    });
  });

  db.grades = d.grades && typeof d.grades === 'object' ? d.grades : {};
  db.avisos = Array.isArray(d.avisos) ? d.avisos.slice() : [];
  db.savedAt = d.savedAt || null;
  db.origen = origen || 'desconocido';
  db.cargado = db.students.length > 0;
  return db;
}

function nota(sid, aid) {
  const g = db.grades[sid];
  const v = g ? g[aid] : null;
  return typeof v === 'number' && !isNaN(v) ? v : null;
}

function actividadesDe(periodo, mision) {
  const lista = db.activities[periodo] || [];
  return mision ? lista.filter((a) => Number(a.mision) === Number(mision)) : lista;
}

function nombreMision(periodo, n) {
  const lista = db.missions[periodo] || [];
  const m = lista.find((x) => Number(x.n) === Number(n));
  return (m && m.name) || nombreMisionPorDefecto(n);
}

function buscarPorCodigo(codigo) {
  const c = norm(codigo);
  if (!c) return null;
  return db.students.find((s) => norm(s.code) === c) || null;
}

/* --------------------- lo que realmente hay en la base -------------------- */

/** Grados que existen de verdad en la base, ordenados. */
function gradosEnBase() {
  return [...new Set(db.students.map((s) => s.grade).filter(Boolean))]
    .sort((a, b) => (Number(a) - Number(b)) || String(a).localeCompare(String(b), 'es'));
}

/** Grupos que existen, opcionalmente solo los de un grado. */
function gruposEnBase(grado) {
  return [...new Set(db.students
    .filter((s) => !grado || s.grade === grado)
    .map((s) => s.group).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), 'es'));
}

/** Cursos (grado + grupo) que existen, para listas y comparativas. */
function cursosEnBase() {
  const vistos = new Map();
  db.students.forEach((s) => {
    const clave = s.grade + '|' + s.group;
    if (!vistos.has(clave)) vistos.set(clave, { grade: s.grade, group: s.group, n: 0 });
    vistos.get(clave).n++;
  });
  return [...vistos.values()].sort((a, b) =>
    (Number(a.grade) - Number(b.grade)) || String(a.group).localeCompare(String(b.group), 'es'));
}

/* ------------------------------ persistencia ----------------------------- */

function leerLocal() {
  try {
    const raw = localStorage.getItem(APP.storeKey);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && Array.isArray(d.students) && d.students.length ? d : null;
  } catch (e) {
    console.warn('No se pudo leer la base guardada en este navegador.', e);
    return null;
  }
}

function guardarLocal(raw) {
  try {
    localStorage.setItem(APP.storeKey, JSON.stringify(raw));
    return true;
  } catch (e) {
    console.warn('No se pudo guardar la base en este navegador.', e);
    return false;
  }
}

function olvidarLocal() {
  try { localStorage.removeItem(APP.storeKey); } catch (e) { /* sin acceso */ }
}

function sesionGuardada() {
  try { return localStorage.getItem(APP.sessionKey) || ''; } catch (e) { return ''; }
}

function guardarSesion(codigo) {
  try { localStorage.setItem(APP.sessionKey, codigo); } catch (e) { /* sin acceso */ }
}

function borrarSesion() {
  try { localStorage.removeItem(APP.sessionKey); } catch (e) { /* sin acceso */ }
}

/* -------------------------------- arranque ------------------------------- */

/**
 * Carga la base con la primera fuente disponible.
 * @returns {Promise<{ok:boolean, origen:string, error?:string}>}
 */
async function iniciar() {
  const local = leerLocal();
  if (local) {
    hidratar(local, 'Base importada en este navegador');
    return { ok: true, origen: db.origen };
  }

  /* Versión publicada: `actualizar-web` deja la base en data/base.js, que se
     carga con una etiqueta <script>. Así la página también abre con doble clic
     (protocolo file://), donde fetch() está bloqueado. */
  if (window.ACADEMIA_BASE && Array.isArray(window.ACADEMIA_BASE.students)) {
    hidratar(window.ACADEMIA_BASE, 'data/base.js');
    if (db.cargado) return { ok: true, origen: db.origen };
  }

  const fallos = [];
  for (const ruta of DATA_SOURCES) {
    try {
      const res = await fetch(ruta, { cache: 'no-store' });
      if (!res.ok) { fallos.push(ruta + ' → HTTP ' + res.status); continue; }
      const d = await res.json();
      hidratar(d, ruta);
      if (db.cargado) return { ok: true, origen: ruta };
      fallos.push(ruta + ' → sin estudiantes');
    } catch (e) {
      fallos.push(ruta + ' → ' + (e && e.message ? e.message : 'no accesible'));
    }
  }
  return { ok: false, origen: '', error: fallos.join(' · ') };
}

/** Importa un archivo .json exportado desde el Panel Docente. */
async function importarArchivo(file) {
  const texto = await file.text();
  let d;
  try {
    d = JSON.parse(texto);
  } catch (e) {
    throw new Error('El archivo no es un JSON válido.');
  }
  if (!d || !Array.isArray(d.students) || !d.students.length) {
    throw new Error('El archivo no contiene la lista de estudiantes del Panel Docente.');
  }
  hidratar(d, 'Archivo ' + file.name);
  guardarLocal(d);
  return db.students.length;
}

/* ------------------------- cambios llegados de fuera ---------------------- */

let vigilante = null;

/** ¿La base que llega es más reciente que la que tenemos en memoria? */
function esMasNueva(d) {
  if (!d || !d.savedAt) return false;
  if (!db.savedAt) return true;
  return String(d.savedAt) > String(db.savedAt);
}

/**
 * Mantiene la base al día sin que nadie recargue la página:
 *
 *  1. Otra pestaña del mismo navegador guardó (evento `storage`).
 *  2. El docente reescribió data/academia-code.json desde su equipo: se
 *     comprueba cada `segundos` si el archivo trae algo más nuevo.
 *
 * IMPORTANTE: solo se acepta lo que llega si su `savedAt` es POSTERIOR al que
 * tenemos. Sin esa comprobación, el archivo (más viejo) machacaría las notas
 * que el docente acabara de escribir. Y por eso el sondeo del archivo solo se
 * enciende en modo lectura, es decir, en el panel del estudiante.
 *
 * @param {object} opciones {segundos, sondearArchivo}
 */
function vigilarCambios(opciones = {}) {
  const segundos = Math.max(5, opciones.segundos || 20);

  if (!vigilarCambios._storage) {
    vigilarCambios._storage = true;
    window.addEventListener('storage', (e) => {
      if (e.key !== APP.storeKey || !e.newValue) return;
      try {
        const d = JSON.parse(e.newValue);
        if (!d || !Array.isArray(d.students) || !esMasNueva(d)) return;
        hidratar(d, 'Actualizado desde otra pestaña');
        emitir('externo', 'storage');
      } catch (err) { /* base ilegible: se ignora */ }
    });
  }

  clearInterval(vigilante);
  vigilante = null;
  if (!opciones.sondearArchivo) return;
  if (!db.origen || db.origen.indexOf('data/') !== 0) return;

  const ruta = db.origen;
  vigilante = setInterval(async () => {
    if (document.hidden) return;
    try {
      const res = await fetch(ruta + '?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json();
      if (!d || !Array.isArray(d.students) || !esMasNueva(d)) return;
      hidratar(d, ruta);
      emitir('externo', 'archivo');
    } catch (err) { /* sin red o archivo bloqueado: se reintenta luego */ }
  }, segundos * 1000);
}

function dejarDeVigilar() {
  clearInterval(vigilante);
  vigilante = null;
}

return { norm: norm, hash: hash, normGender: normGender, generoIlustracion: generoIlustracion, db: db, hidratar: hidratar, nota: nota, actividadesDe: actividadesDe, nombreMision: nombreMision, buscarPorCodigo: buscarPorCodigo, gradosEnBase: gradosEnBase, gruposEnBase: gruposEnBase, cursosEnBase: cursosEnBase, guardarLocal: guardarLocal, olvidarLocal: olvidarLocal, sesionGuardada: sesionGuardada, guardarSesion: guardarSesion, borrarSesion: borrarSesion, iniciar: iniciar, importarArchivo: importarArchivo, vigilarCambios: vigilarCambios, dejarDeVigilar: dejarDeVigilar };
})();

/* ---------- almacen.js ---------- */
var __M_almacen = (function () {
/* ============================================================================
   almacen.js — Capa de escritura del panel docente
   ----------------------------------------------------------------------------
   El panel del estudiante solo lee; el del docente escribe. Todo lo que
   modifica la base pasa por aquí, y aquí se decide dónde se guarda:

     1. localStorage del navegador (siempre).
     2. La carpeta del proyecto, si el docente la conecta (Chrome / Edge).
     3. Descarga manual del .json cuando el navegador no admite (2).

   Ninguna de estas rutas envía datos a ningún servidor.
   ========================================================================== */

const { APP, PERIODS, MISIONES, CATEGORIES, SEED_ACTIVITIES, DEFAULT_CONFIG, MAX_RESPALDOS, nombreMisionPorDefecto } = __M_config;
const { db, hidratar, norm, normGender, guardarLocal } = __M_datos;
const { emitir } = __M_bus;
/* ------------------------------- utilidades ------------------------------- */

function uid(prefijo) {
  return (prefijo || 'id') + '_' +
    Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

function sello() {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
    '-' + p(d.getHours()) + p(d.getMinutes());
}

/* ------------------------------- serializar ------------------------------- */

/** Devuelve la base en el mismo esquema que exporta el Panel Docente v2. */
function serializar() {
  const acts = {};
  const mis = {};
  PERIODS.forEach((p) => {
    acts[p] = (db.activities[p] || []).map((a) => Object.assign({}, a));
    mis[p] = (db.missions[p] || []).map((m) => Object.assign({}, m));
  });
  return {
    version: 2,
    config: Object.assign({}, db.config),
    students: db.students.map((s) => Object.assign({}, s)),
    activities: acts,
    missions: mis,
    grades: JSON.parse(JSON.stringify(db.grades || {})),
    avisos: (db.avisos || []).map((a) => Object.assign({}, a)),
    createdAt: db.createdAt || new Date().toISOString(),
    savedAt: new Date().toISOString()
  };
}

/* --------------------------------- guardar -------------------------------- */

let alGuardar = null;                 // callback para avisar a la interfaz
function alGuardarBase(fn) { alGuardar = fn; }

let pendiente = null;

/** Guarda en el navegador y, si hay carpeta conectada, también en disco. */
function guardar() {
  const raw = serializar();
  db.savedAt = raw.savedAt;
  const ok = guardarLocal(raw);
  if (bodega.dir) {
    clearTimeout(pendiente);
    pendiente = setTimeout(() => escribirEnCarpeta(raw).catch(() => {}), 400);
  }
  if (alGuardar) alGuardar(ok);
  emitir('local');
  respaldoDelDia();
  return ok;
}

const CLAVE_RESPALDO = 'panel_estudiante_respaldo';

/**
 * Copia de seguridad automática: la primera vez que se guarda cada día, con la
 * carpeta conectada, se deja un respaldo con fecha en data/respaldos/.
 * Así el docente tiene historial sin acordarse de pulsar nada.
 */
function respaldoDelDia() {
  if (!bodega.dir) return;
  const hoy = new Date().toISOString().slice(0, 10);
  let ultimo = '';
  try { ultimo = localStorage.getItem(CLAVE_RESPALDO) || ''; } catch (e) { /* sin acceso */ }
  if (ultimo === hoy) return;
  try { localStorage.setItem(CLAVE_RESPALDO, hoy); } catch (e) { /* sin acceso */ }
  respaldar().catch(() => {
    try { localStorage.removeItem(CLAVE_RESPALDO); } catch (e) { /* se reintenta */ }
  });
}

/* ------------------------------- estudiantes ------------------------------ */

function agregarEstudiante(datos) {
  const st = {
    id: uid('st'),
    code: String(datos.code || '').trim(),
    name: String(datos.name || '').trim(),
    grade: String(datos.grade || '').trim(),
    group: String(datos.group || '').trim().toUpperCase(),
    gender: normGender(datos.gender),
    avatar: null,
    createdAt: new Date().toISOString()
  };
  if (!st.code) throw new Error('El código de estudiante es obligatorio.');
  if (!st.name) throw new Error('El nombre completo es obligatorio.');
  if (buscarCodigo(st.code)) throw new Error('Ya existe un estudiante con el código ' + st.code + '.');
  db.students.push(st);
  guardar();
  return st;
}

function editarEstudiante(id, datos) {
  const st = db.students.find((s) => s.id === id);
  if (!st) throw new Error('No se encontró el estudiante.');
  const nuevoCodigo = String(datos.code || '').trim();
  const choca = buscarCodigo(nuevoCodigo);
  if (choca && choca.id !== id) throw new Error('Ya existe otro estudiante con el código ' + nuevoCodigo + '.');
  if (!nuevoCodigo) throw new Error('El código de estudiante es obligatorio.');
  if (!String(datos.name || '').trim()) throw new Error('El nombre completo es obligatorio.');

  st.code = nuevoCodigo;
  st.name = String(datos.name).trim();
  st.grade = String(datos.grade || '').trim();
  st.group = String(datos.group || '').trim().toUpperCase();
  st.gender = normGender(datos.gender);
  guardar();
  return st;
}

function eliminarEstudiante(id) {
  db.students = db.students.filter((s) => s.id !== id);
  delete db.grades[id];
  guardar();
}

function buscarCodigo(codigo) {
  const c = norm(codigo);
  if (!c) return null;
  return db.students.find((s) => norm(s.code) === c) || null;
}

/**
 * Aplica una importación ya revisada.
 * @param {Array} filas  objetos {name, grade, group, gender, code}
 * @param {boolean} actualizar  si true, sobrescribe los que ya existen
 */
function importarEstudiantes(filas, actualizar) {
  let nuevos = 0, actualizados = 0, omitidos = 0;
  filas.forEach((f) => {
    const codigo = String(f.code || '').trim();
    if (!codigo || !String(f.name || '').trim()) { omitidos++; return; }
    const existe = buscarCodigo(codigo);
    if (existe) {
      if (!actualizar) { omitidos++; return; }
      existe.name = String(f.name).trim();
      existe.grade = String(f.grade || '').trim();
      existe.group = String(f.group || '').trim().toUpperCase();
      existe.gender = normGender(f.gender);
      actualizados++;
    } else {
      db.students.push({
        id: uid('st'),
        code: codigo,
        name: String(f.name).trim(),
        grade: String(f.grade || '').trim(),
        group: String(f.group || '').trim().toUpperCase(),
        gender: normGender(f.gender),
        avatar: null,
        createdAt: new Date().toISOString()
      });
      nuevos++;
    }
  });
  guardar();
  return { nuevos, actualizados, omitidos };
}

/* -------------------------------- misiones -------------------------------- */

/**
 * Garantiza que el periodo tenga sus seis misiones, y cada misión sus cuatro
 * actividades. Es idempotente: solo crea lo que falta.
 */
function asegurarActividades(periodo, mision) {
  const lista = db.activities[periodo] || (db.activities[periodo] = []);
  if (!db.missions[periodo]) {
    db.missions[periodo] = MISIONES.map((n) => ({ n, name: nombreMisionPorDefecto(n) }));
  }
  let cambio = false;
  MISIONES.forEach((n) => {
    SEED_ACTIVITIES.forEach((t) => {
      if (!lista.some((a) => a.cat === t.cat && Number(a.mision) === n)) {
        lista.push({ id: uid('ac'), cat: t.cat, name: t.name, period: Number(periodo), mision: n });
        cambio = true;
      }
    });
  });
  if (cambio) guardar();
  return actividadesOrdenadas(periodo, mision);
}

/** Ordena por misión y, dentro de cada una, por categoría. */
function actividadesOrdenadas(periodo, mision) {
  const orden = {};
  CATEGORIES.forEach((c, i) => { orden[c.key] = i; });
  return (db.activities[periodo] || [])
    .filter((a) => (mision ? Number(a.mision) === Number(mision) : true))
    .slice()
    .sort((a, b) => (Number(a.mision) - Number(b.mision)) || (orden[a.cat] - orden[b.cat]));
}

function renombrarActividad(periodo, id, nombre) {
  const a = (db.activities[periodo] || []).find((x) => x.id === id);
  if (!a) return false;
  a.name = String(nombre || '').trim() || a.name;
  guardar();
  return true;
}

/** Cambia el nombre de una de las seis misiones del periodo. */
function renombrarMision(periodo, n, nombre) {
  if (!db.missions[periodo]) return false;
  const m = db.missions[periodo].find((x) => Number(x.n) === Number(n));
  if (!m) return false;
  m.name = String(nombre || '').trim() || nombreMisionPorDefecto(n);
  guardar();
  return true;
}

/* --------------------------------- notas ---------------------------------- */

/** Guarda una nota (o la borra si el valor viene vacío). Devuelve el valor final. */
function ponerNota(sid, aid, valor) {
  if (!db.grades[sid]) db.grades[sid] = {};
  const txt = String(valor == null ? '' : valor).trim().replace(',', '.');
  if (txt === '') {
    delete db.grades[sid][aid];
    guardar();
    return null;
  }
  const n = Number(txt);
  if (isNaN(n)) return undefined;                    // entrada inválida: no se toca
  const limpio = Math.round(Math.max(0, Math.min(10, n)) * 10) / 10;
  db.grades[sid][aid] = limpio;
  guardar();
  return limpio;
}

/* -------------------------- configuración y avisos ------------------------ */

function guardarConfig(parcial) {
  db.config = Object.assign({}, db.config, parcial || {});
  if (parcial && parcial.weights) {
    db.config.weights = Object.assign({}, db.config.weights, parcial.weights);
  }
  guardar();
  return db.config;
}

function agregarAviso(aviso) {
  if (!db.avisos) db.avisos = [];
  db.avisos.unshift(Object.assign({ id: uid('av'), fecha: new Date().toISOString().slice(0, 10) }, aviso));
  guardar();
  return db.avisos[0];
}

function eliminarAviso(id) {
  db.avisos = (db.avisos || []).filter((a) => a.id !== id);
  guardar();
}

/* ------------------------- exportar / importar JSON ----------------------- */

function jsonBlob() {
  return new Blob([JSON.stringify(serializar(), null, 1)], { type: 'application/json' });
}

function nombreArchivo(prefijo) {
  return (prefijo || 'academia-code') + '-' + sello() + '.json';
}

/** Reemplaza la base entera por la de un archivo .json ya leído. */
function cargarBase(objeto) {
  if (!objeto || !Array.isArray(objeto.students)) {
    throw new Error('El archivo no tiene la lista de estudiantes.');
  }
  hidratar(objeto, 'Base restaurada');
  guardar();
  return db.students.length;
}

/** Base vacía, lista para empezar un curso desde cero. */
function vaciar() {
  hidratar({
    version: 1,
    config: Object.assign({}, DEFAULT_CONFIG),
    students: [],
    activities: {},
    missions: {},
    grades: {},
    avisos: []
  }, 'Base nueva');
  PERIODS.forEach((p) => asegurarActividades(p));
  guardar();
}

/* ======================================================================== */
/*  Carpeta del proyecto (File System Access API · Chrome y Edge)            */
/* ======================================================================== */

const ARCHIVO_BASE = 'academia-code.json';
const IDB_NOMBRE = 'panel_academia_code';
const IDB_ALMACEN = 'handles';

const bodega = {
  soportado: typeof window.showDirectoryPicker === 'function' && window.isSecureContext,
  dir: null,        // handle de la carpeta /data
  nombre: '',
  permiso: false
};

/* --- IndexedDB mínima para recordar la carpeta entre sesiones --- */

function idb() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(IDB_NOMBRE, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_ALMACEN);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function idbPoner(clave, valor) {
  return idb().then((d) => new Promise((res, rej) => {
    const tx = d.transaction(IDB_ALMACEN, 'readwrite');
    tx.objectStore(IDB_ALMACEN).put(valor, clave);
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  }));
}

function idbLeer(clave) {
  return idb().then((d) => new Promise((res, rej) => {
    const tx = d.transaction(IDB_ALMACEN, 'readonly');
    const req = tx.objectStore(IDB_ALMACEN).get(clave);
    req.onsuccess = () => res(req.result || null);
    req.onerror = () => rej(req.error);
  }));
}

function idbBorrar(clave) {
  return idb().then((d) => new Promise((res) => {
    const tx = d.transaction(IDB_ALMACEN, 'readwrite');
    tx.objectStore(IDB_ALMACEN).delete(clave);
    tx.oncomplete = () => res(true);
  }));
}

async function permiso(handle, pedir) {
  if (!handle || typeof handle.queryPermission !== 'function') return false;
  const opciones = { mode: 'readwrite' };
  let estado = await handle.queryPermission(opciones);
  if (estado === 'granted') return true;
  if (!pedir) return false;
  estado = await handle.requestPermission(opciones);
  return estado === 'granted';
}

/** Pide al docente que elija la carpeta `data` del proyecto. */
async function conectarCarpeta() {
  if (!bodega.soportado) {
    throw new Error('Este navegador no permite escribir en carpetas. Usa Chrome o Edge, o exporta el JSON a mano.');
  }
  const dir = await window.showDirectoryPicker({ id: 'academia-code-data', mode: 'readwrite' });
  const ok = await permiso(dir, true);
  if (!ok) throw new Error('No se concedió permiso de escritura sobre la carpeta.');
  bodega.dir = dir;
  bodega.nombre = dir.name;
  bodega.permiso = true;
  await idbPoner('carpeta', dir);
  await escribirEnCarpeta(serializar());
  try { await respaldar(); } catch (e) { /* la carpeta de respaldos se crea al vuelo */ }
  return dir.name;
}

/** Reconecta en silencio la carpeta autorizada en una sesión anterior. */
async function recuperarCarpeta() {
  if (!bodega.soportado) return false;
  try {
    const dir = await idbLeer('carpeta');
    if (!dir) return false;
    const ok = await permiso(dir, false);
    bodega.dir = ok ? dir : null;
    bodega.nombre = dir.name;
    bodega.permiso = ok;
    return ok;
  } catch (e) {
    return false;
  }
}

/** Vuelve a pedir permiso sobre la carpeta ya recordada (gesto del usuario). */
async function autorizarCarpeta() {
  const dir = bodega.dir || await idbLeer('carpeta');
  if (!dir) return false;
  const ok = await permiso(dir, true);
  bodega.dir = ok ? dir : null;
  bodega.permiso = ok;
  return ok;
}

async function olvidarCarpeta() {
  bodega.dir = null;
  bodega.nombre = '';
  bodega.permiso = false;
  await idbBorrar('carpeta');
}

async function escribir(dirHandle, nombre, texto) {
  const fh = await dirHandle.getFileHandle(nombre, { create: true });
  const w = await fh.createWritable();
  await w.write(texto);
  await w.close();
}

async function escribirEnCarpeta(raw) {
  if (!bodega.dir) return false;
  await escribir(bodega.dir, ARCHIVO_BASE, JSON.stringify(raw, null, 1));
  return true;
}

/* ------------------------------- respaldos -------------------------------- */

async function carpetaRespaldos() {
  if (!bodega.dir) return null;
  return bodega.dir.getDirectoryHandle('respaldos', { create: true });
}

/** Crea una copia con fecha y hora dentro de data/respaldos/. */
async function respaldar() {
  const dir = await carpetaRespaldos();
  if (!dir) throw new Error('Conecta primero la carpeta /data del proyecto.');
  const nombre = 'respaldo-' + sello() + '.json';
  await escribir(dir, nombre, JSON.stringify(serializar(), null, 1));
  await podarRespaldos(dir);
  return nombre;
}

async function podarRespaldos(dir) {
  const nombres = [];
  for await (const [nombre, handle] of dir.entries()) {
    if (handle.kind === 'file' && /^respaldo-.*\.json$/.test(nombre)) nombres.push(nombre);
  }
  nombres.sort();
  while (nombres.length > MAX_RESPALDOS) {
    const viejo = nombres.shift();
    try { await dir.removeEntry(viejo); } catch (e) { /* ya no está */ }
  }
}

async function listarRespaldos() {
  const dir = await carpetaRespaldos();
  if (!dir) return [];
  const out = [];
  for await (const [nombre, handle] of dir.entries()) {
    if (handle.kind === 'file' && /^respaldo-.*\.json$/.test(nombre)) {
      const f = await handle.getFile();
      out.push({ nombre, tam: f.size, fecha: new Date(f.lastModified) });
    }
  }
  return out.sort((a, b) => b.nombre.localeCompare(a.nombre));
}

async function restaurarRespaldo(nombre) {
  const dir = await carpetaRespaldos();
  if (!dir) throw new Error('No hay carpeta conectada.');
  const fh = await dir.getFileHandle(nombre);
  const texto = await (await fh.getFile()).text();
  return cargarBase(JSON.parse(texto));
}

/* ------------------------------ diagnóstico ------------------------------- */

function diagnostico() {
  return [
    { nombre: 'Chart.js (gráficas)',      ok: typeof window.Chart === 'function' },
    { nombre: 'SheetJS (Excel)',          ok: typeof window.XLSX !== 'undefined' },
    { nombre: 'html2canvas (PNG)',        ok: typeof window.html2canvas === 'function' },
    { nombre: 'qrcodejs (QR)',            ok: typeof window.QRCode === 'function' },
    { nombre: 'jsPDF (PDF)',              ok: !!(window.jspdf && window.jspdf.jsPDF) },
    { nombre: 'Almacenamiento del navegador', ok: (() => {
        try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; }
        catch (e) { return false; }
      })() },
    { nombre: 'Escritura en carpeta (Chrome/Edge)', ok: bodega.soportado }
  ];
}

function tamanoBase() {
  try { return new Blob([JSON.stringify(serializar())]).size; } catch (e) { return 0; }
}


return { uid: uid, sello: sello, serializar: serializar, alGuardarBase: alGuardarBase, guardar: guardar, agregarEstudiante: agregarEstudiante, editarEstudiante: editarEstudiante, eliminarEstudiante: eliminarEstudiante, buscarCodigo: buscarCodigo, importarEstudiantes: importarEstudiantes, asegurarActividades: asegurarActividades, actividadesOrdenadas: actividadesOrdenadas, renombrarActividad: renombrarActividad, renombrarMision: renombrarMision, ponerNota: ponerNota, guardarConfig: guardarConfig, agregarAviso: agregarAviso, eliminarAviso: eliminarAviso, jsonBlob: jsonBlob, nombreArchivo: nombreArchivo, cargarBase: cargarBase, vaciar: vaciar, bodega: bodega, conectarCarpeta: conectarCarpeta, recuperarCarpeta: recuperarCarpeta, autorizarCarpeta: autorizarCarpeta, olvidarCarpeta: olvidarCarpeta, respaldar: respaldar, listarRespaldos: listarRespaldos, restaurarRespaldo: restaurarRespaldo, diagnostico: diagnostico, tamanoBase: tamanoBase, APP: APP };
})();

/* ---------- ui.js ---------- */
var __M_ui = (function () {
/* ============================================================================
   ui.js — Utilidades de interfaz: DOM, notificaciones, modales y animaciones
   ========================================================================== */

/* --------------------------------- DOM ----------------------------------- */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function el(tag, attrs = {}, ...hijos) {
  const n = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v === null || v === undefined || v === false) return;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  });
  hijos.flat().forEach((h) => {
    if (h === null || h === undefined || h === false) return;
    n.appendChild(typeof h === 'string' || typeof h === 'number' ? document.createTextNode(String(h)) : h);
  });
  return n;
}

/** Escapa texto para insertarlo dentro de plantillas HTML. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Convierte un color #rrggbb en "r, g, b" para usarlo dentro de rgba(). */
function rgb(hex) {
  const h = String(hex || '#888').replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const i = parseInt(n, 16);
  return [(i >> 16) & 255, (i >> 8) & 255, i & 255].join(', ');
}

/* ------------------------------ notificaciones ---------------------------- */

const TIPOS = {
  ok:   { icon: 'fa-circle-check', color: 'var(--ok)' },
  err:  { icon: 'fa-circle-xmark', color: 'var(--bad)' },
  info: { icon: 'fa-circle-info',  color: 'var(--info)' },
  warn: { icon: 'fa-triangle-exclamation', color: 'var(--warn)' }
};

function toast(titulo, texto = '', tipo = 'info', ms = 4200) {
  let cont = $('#toasts');
  if (!cont) {
    cont = el('div', { id: 'toasts', class: 'toasts' });
    document.body.appendChild(cont);
  }
  const t = TIPOS[tipo] || TIPOS.info;
  const n = el('div', { class: 'toast toast--' + tipo, role: 'status' },
    el('i', { class: 'fa-solid ' + t.icon, style: { color: t.color } }),
    el('div', { class: 'toast__cuerpo' },
      el('strong', { text: titulo }),
      texto ? el('span', { text: texto }) : null),
    el('button', { class: 'toast__x', 'aria-label': 'Cerrar', onclick: () => cerrar() },
      el('i', { class: 'fa-solid fa-xmark' }))
  );
  cont.appendChild(n);
  requestAnimationFrame(() => n.classList.add('is-open'));
  const cerrar = () => {
    n.classList.remove('is-open');
    setTimeout(() => n.remove(), 260);
  };
  if (ms) setTimeout(cerrar, ms);
  return cerrar;
}

/* --------------------------------- modal ---------------------------------- */

let modalActivo = null;

function modal({ titulo = '', subtitulo = '', cuerpo = null, ancho = '', clase = '' } = {}) {
  cerrarModal();
  const contenido = el('div', { class: 'modal__panel ' + clase, style: ancho ? { maxWidth: ancho } : {} },
    el('header', { class: 'modal__head' },
      el('div', {},
        el('h3', { class: 'modal__titulo', text: titulo }),
        subtitulo ? el('p', { class: 'modal__sub', text: subtitulo }) : null),
      el('button', { class: 'modal__x', 'aria-label': 'Cerrar', onclick: cerrarModal },
        el('i', { class: 'fa-solid fa-xmark' }))),
    el('div', { class: 'modal__cuerpo' }, cuerpo || '')
  );
  const fondo = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, contenido);
  fondo.addEventListener('click', (e) => { if (e.target === fondo) cerrarModal(); });
  document.body.appendChild(fondo);
  document.body.classList.add('sin-scroll');
  requestAnimationFrame(() => fondo.classList.add('is-open'));
  modalActivo = fondo;
  return { fondo, contenido, cerrar: cerrarModal };
}

function cerrarModal() {
  if (!modalActivo) return;
  const m = modalActivo;
  modalActivo = null;
  m.classList.remove('is-open');
  document.body.classList.remove('sin-scroll');
  setTimeout(() => m.remove(), 220);
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });

/* ------------------------------ animaciones ------------------------------- */

const suave = (t) => 1 - Math.pow(1 - t, 3);

/** Cuenta un número desde 0 hasta `fin` dentro de un nodo. */
function contar(nodo, fin, { dec = 0, ms = 900, sufijo = '', prefijo = '' } = {}) {
  if (fin === null || fin === undefined || isNaN(fin)) { nodo.textContent = '—'; return; }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodo.textContent = prefijo + Number(fin).toFixed(dec) + sufijo;
    return;
  }
  const t0 = performance.now();
  const paso = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    nodo.textContent = prefijo + (fin * suave(k)).toFixed(dec) + sufijo;
    if (k < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

/** Lanza las barras/anillos con [data-valor] cuando entran en pantalla. */
function animarBarras(ctx = document) {
  const nodos = $$('[data-anim-barra]', ctx);
  if (!nodos.length) return;
  const pinta = (n) => {
    const pct = Math.max(0, Math.min(100, Number(n.dataset.animBarra) || 0));
    n.style.width = pct + '%';
  };
  if (!('IntersectionObserver' in window)) { nodos.forEach(pinta); return; }
  const obs = new IntersectionObserver((ent) => {
    ent.forEach((e) => {
      if (e.isIntersecting) { pinta(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  nodos.forEach((n) => { n.style.width = '0%'; obs.observe(n); });
}

/* ------------------------------- varios ----------------------------------- */

function fecha(iso) {
  if (!iso) return '';
  const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso);
  if (isNaN(d)) return String(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
}

function copiar(texto) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
  const ta = el('textarea', { style: { position: 'fixed', opacity: '0' } });
  ta.value = texto;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } finally { ta.remove(); }
  return Promise.resolve();
}

/** Descarga un blob o dataURL con nombre. */
function descargar(datos, nombre) {
  const a = el('a', { href: typeof datos === 'string' ? datos : URL.createObjectURL(datos), download: nombre });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (typeof datos !== 'string') URL.revokeObjectURL(a.href);
    a.remove();
  }, 400);
}

function vacio(icono, titulo, texto) {
  return el('div', { class: 'vacio' },
    el('i', { class: 'fa-solid ' + icono }),
    el('h4', { text: titulo }),
    texto ? el('p', { text: texto }) : null);
}

return { $: $, $$: $$, el: el, esc: esc, rgb: rgb, toast: toast, modal: modal, cerrarModal: cerrarModal, contar: contar, animarBarras: animarBarras, fecha: fecha, copiar: copiar, descargar: descargar, vacio: vacio };
})();

/* ---------- graficas.js ---------- */
var __M_graficas = (function () {
/* ============================================================================
   graficas.js — Capa fina sobre Chart.js: tema, registro y destrucción segura
   ----------------------------------------------------------------------------
   Todas las gráficas del panel se crean aquí para que compartan tipografía,
   colores y comportamiento, y para poder repintarlas al cambiar de tema.
   ========================================================================== */

const { rgb } = __M_ui;
const registro = new Map();   // id de canvas -> instancia de Chart

function hayChart() {
  return typeof window.Chart !== 'undefined';
}

function tema() {
  const cs = getComputedStyle(document.documentElement);
  const leer = (v, alt) => (cs.getPropertyValue(v) || '').trim() || alt;
  return {
    texto: leer('--txt-2', '#94a3b8'),
    rejilla: leer('--linea', 'rgba(148,163,184,.18)'),
    fondo: leer('--panel', '#0f172a'),
    acento: leer('--acento', '#22d3ee')
  };
}

function base() {
  const t = tema();
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? false : { duration: 900, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        labels: {
          color: t.texto,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          font: { family: 'Outfit, Segoe UI, sans-serif', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(2, 6, 23, .92)',
        borderColor: 'rgba(148,163,184,.25)',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        padding: 10,
        cornerRadius: 10,
        displayColors: true,
        usePointStyle: true
      }
    }
  };
}

function ejes({ min = 0, max = 10, paso = 2 } = {}) {
  const t = tema();
  return {
    x: {
      ticks: { color: t.texto, font: { family: 'Outfit, Segoe UI, sans-serif', size: 11 } },
      grid: { color: t.rejilla, drawBorder: false }
    },
    y: {
      min, max,
      ticks: { color: t.texto, stepSize: paso, font: { family: 'Outfit, Segoe UI, sans-serif', size: 11 } },
      grid: { color: t.rejilla, drawBorder: false }
    }
  };
}

/** Crea (o recrea) una gráfica sobre un canvas identificado por su id. */
function pintar(id, config) {
  if (!hayChart()) return null;
  const cv = document.getElementById(id);
  if (!cv) return null;
  destruir(id);
  const ch = new window.Chart(cv.getContext('2d'), config);
  registro.set(id, ch);
  return ch;
}

function destruir(id) {
  const ch = registro.get(id);
  if (ch) { ch.destroy(); registro.delete(id); }
}

function destruirTodas() {
  registro.forEach((ch) => ch.destroy());
  registro.clear();
}

/* ------------------------------- recetas ---------------------------------- */

/** Línea de evolución por periodo, con relleno degradado. */
function linea(id, etiquetas, series, opciones = {}) {
  const datasets = series.map((s) => ({
    label: s.label,
    data: s.datos,
    borderColor: s.color,
    backgroundColor: (ctx) => {
      const { ctx: c, chartArea } = ctx.chart;
      if (!chartArea) return 'rgba(' + rgb(s.color) + ', .18)';
      const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0, 'rgba(' + rgb(s.color) + ', .34)');
      g.addColorStop(1, 'rgba(' + rgb(s.color) + ', 0)');
      return g;
    },
    borderWidth: s.punteada ? 2 : 3,
    borderDash: s.punteada ? [6, 5] : [],
    fill: s.relleno !== false,
    tension: 0.38,
    pointRadius: 5,
    pointHoverRadius: 8,
    pointBackgroundColor: s.color,
    pointBorderColor: 'rgba(2,6,23,.85)',
    pointBorderWidth: 2,
    spanGaps: true
  }));
  return pintar(id, {
    type: 'line',
    data: { labels: etiquetas, datasets },
    options: Object.assign(base(), { scales: ejes(opciones.escala) }, opciones.extra || {})
  });
}

/** Barras verticales u horizontales. */
function barras(id, etiquetas, series, opciones = {}) {
  const datasets = series.map((s) => ({
    label: s.label,
    data: s.datos,
    backgroundColor: Array.isArray(s.color)
      ? s.color.map((c) => 'rgba(' + rgb(c) + ', .72)')
      : 'rgba(' + rgb(s.color) + ', .72)',
    borderColor: Array.isArray(s.color) ? s.color : s.color,
    borderWidth: 1.5,
    borderRadius: 8,
    borderSkipped: false,
    maxBarThickness: opciones.grosor || 46
  }));
  const opts = Object.assign(base(), {
    indexAxis: opciones.horizontal ? 'y' : 'x',
    scales: opciones.horizontal
      ? { x: ejes(opciones.escala).y, y: ejes(opciones.escala).x }
      : ejes(opciones.escala)
  }, opciones.extra || {});
  return pintar(id, { type: 'bar', data: { labels: etiquetas, datasets }, options: opts });
}

/** Radar de cuatro recursos / categorías. */
function radar(id, etiquetas, series, opciones = {}) {
  const t = tema();
  const datasets = series.map((s) => ({
    label: s.label,
    data: s.datos,
    borderColor: s.color,
    backgroundColor: 'rgba(' + rgb(s.color) + ', ' + (s.opacidad || 0.22) + ')',
    borderWidth: s.punteada ? 2 : 3,
    borderDash: s.punteada ? [6, 5] : [],
    pointBackgroundColor: s.color,
    pointBorderColor: 'rgba(2,6,23,.85)',
    pointRadius: 4,
    pointHoverRadius: 7
  }));
  return pintar(id, {
    type: 'radar',
    data: { labels: etiquetas, datasets },
    options: Object.assign(base(), {
      scales: {
        r: {
          min: 0,
          max: opciones.max || 10,
          ticks: { display: false, stepSize: 2 },
          angleLines: { color: t.rejilla },
          grid: { color: t.rejilla },
          pointLabels: {
            color: t.texto,
            font: { family: 'Outfit, Segoe UI, sans-serif', size: 12, weight: '600' }
          }
        }
      }
    }, opciones.extra || {})
  });
}

/** Rosquilla para reparto de misiones o desempeños. */
function rosquilla(id, etiquetas, datos, colores, opciones = {}) {
  return pintar(id, {
    type: 'doughnut',
    data: {
      labels: etiquetas,
      datasets: [{
        data: datos,
        backgroundColor: colores.map((c) => 'rgba(' + rgb(c) + ', .78)'),
        borderColor: 'rgba(2,6,23,.55)',
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: Object.assign(base(), {
      cutout: opciones.cutout || '62%',
      plugins: Object.assign(base().plugins, {
        legend: Object.assign(base().plugins.legend, { position: opciones.leyenda || 'bottom' })
      })
    }, opciones.extra || {})
  });
}

return { hayChart: hayChart, pintar: pintar, destruir: destruir, destruirTodas: destruirTodas, linea: linea, barras: barras, radar: radar, rosquilla: rosquilla };
})();

/* ---------- motor.js ---------- */
var __M_motor = (function () {
/* ============================================================================
   motor.js — Motor de cálculo: promedios, XP, niveles hacker e insignias
   ----------------------------------------------------------------------------
   Todo lo que ve el estudiante se deduce aquí a partir de la base del docente.
   Ninguna función inventa datos: si una misión no tiene nota, se informa como
   pendiente y su peso se redistribuye entre las que sí la tienen.
   ========================================================================== */

const { SCALE, PERIODS, MISIONES, CATEGORIES, CAT, RANKS, PERFORMANCE, ERAS, MOODS, LEVELS, MAX_LEVEL, AVATAR_DIR, NIVEL_DIR, XP_PER_POINT, XP_MAX, XP_MAX_PERIODO, XP_PER_LEVEL, XP_META, MISIONES_TOTALES, PROMEDIO_META, BADGES, ALBUM_OBJETOS, XP_POR_OBJETO } = __M_config;
const { db, nota, actividadesDe, nombreMision, generoIlustracion } = __M_datos;
/* ------------------------------ escala y textos --------------------------- */

const redondear = (v, d = 1) =>
  v === null || v === undefined || isNaN(v) ? null : Math.round(v * 10 ** d) / 10 ** d;

const fmt = (v, d = 1) => (v === null || v === undefined || isNaN(v) ? '—' : Number(v).toFixed(d));

function rango(promedio) {
  if (promedio === null || promedio === undefined) return RANKS[RANKS.length - 1];
  return RANKS.find((r) => promedio >= r.min) || RANKS[RANKS.length - 1];
}

function desempeno(promedio) {
  if (promedio === null || promedio === undefined) return PERFORMANCE[PERFORMANCE.length - 1];
  return PERFORMANCE.find((p) => promedio >= p.min) || PERFORMANCE[PERFORMANCE.length - 1];
}

const eraDe = (periodo) => ERAS.find((e) => e.period === Number(periodo)) || ERAS[0];

/** Nota suelta de una actividad (atajo cómodo para las vistas). */
const notaDe = nota;

/** Nombre de una de las seis misiones del periodo. */
const nombreDeMision = nombreMision;

/* ------------------------------- promedios -------------------------------- */

/** Nota de una categoría dentro de un periodo (o null si no está calificada). */
function notaCat(sid, periodo, cat) {
  const acts = actividadesDe(periodo).filter((a) => a.cat === cat);
  let suma = 0, n = 0;
  acts.forEach((a) => {
    const v = nota(sid, a.id);
    if (v !== null) { suma += v; n++; }
  });
  return n ? suma / n : null;
}

/** Promedio ponderado del periodo, renormalizando los pesos que sí tienen nota. */
function promedioPeriodo(sid, periodo) {
  const w = db.config.weights || {};
  let acc = 0, wsum = 0;
  CATEGORIES.forEach((c) => {
    const v = notaCat(sid, periodo, c.key);
    if (v !== null) { acc += v * (w[c.key] || 0); wsum += (w[c.key] || 0); }
  });
  return wsum ? acc / wsum : null;
}

/** Promedio global: media de los periodos que ya tienen alguna nota. */
function promedioGlobal(sid) {
  let suma = 0, n = 0;
  PERIODS.forEach((p) => {
    const v = promedioPeriodo(sid, p);
    if (v !== null) { suma += v; n++; }
  });
  return n ? suma / n : null;
}

/** Promedio del estudiante en una categoría a lo largo del año. */
function promedioCategoria(sid, cat) {
  let suma = 0, n = 0;
  PERIODS.forEach((p) => {
    const v = notaCat(sid, p, cat);
    if (v !== null) { suma += v; n++; }
  });
  return n ? suma / n : null;
}

/** Promedio de una lista de estudiantes (global o de un periodo). */
function promedioDe(lista, periodo) {
  let suma = 0, n = 0;
  lista.forEach((s) => {
    const v = periodo ? promedioPeriodo(s.id, periodo) : promedioGlobal(s.id);
    if (v !== null) { suma += v; n++; }
  });
  return n ? suma / n : null;
}

/** Promedio de una lista de estudiantes en una categoría concreta. */
function promedioCatDe(lista, cat, periodo) {
  let suma = 0, n = 0;
  lista.forEach((s) => {
    const v = periodo ? notaCat(s.id, periodo, cat) : promedioCategoria(s.id, cat);
    if (v !== null) { suma += v; n++; }
  });
  return n ? suma / n : null;
}

/** Último periodo con nota registrada. */
function periodoActual(sid) {
  let ult = null;
  PERIODS.forEach((p) => { if (promedioPeriodo(sid, p) !== null) ult = p; });
  return ult;
}

/* ------------------------------- misiones --------------------------------- */

/**
 * Las 96 actividades del año (4 periodos × 6 misiones × 4 categorías) con su
 * estado, en orden cronológico.
 */
function actividades(sid) {
  const out = [];
  PERIODS.forEach((p) => {
    MISIONES.forEach((n) => {
      CATEGORIES.forEach((c) => {
        const act = actividadesDe(p, n).find((a) => a.cat === c.key);
        out.push({
          periodo: p,
          mision: n,
          misionNombre: nombreMision(p, n),
          cat: c.key,
          catLabel: c.label,
          color: c.color,
          icon: c.icon,
          nombre: act ? act.name : c.label,
          id: act ? act.id : null,
          nota: act ? nota(sid, act.id) : null,
          existe: !!act
        });
      });
    });
  });
  return out;
}

/** Nota ponderada de una misión concreta (las cuatro actividades que la forman). */
function promedioMision(sid, periodo, mision) {
  const w = db.config.weights || {};
  let acc = 0, wsum = 0;
  CATEGORIES.forEach((c) => {
    const act = actividadesDe(periodo, mision).find((a) => a.cat === c.key);
    const v = act ? nota(sid, act.id) : null;
    if (v !== null) { acc += v * (w[c.key] || 0); wsum += (w[c.key] || 0); }
  });
  return wsum ? acc / wsum : null;
}

/** Las 24 misiones del año (6 por periodo) con su promedio y su avance. */
function misiones(sid) {
  const out = [];
  PERIODS.forEach((p) => {
    MISIONES.forEach((n) => {
      const acts = actividadesDe(p, n);
      const conNota = acts.filter((a) => nota(sid, a.id) !== null).length;
      out.push({
        periodo: p,
        mision: n,
        nombre: nombreMision(p, n),
        era: eraDe(p),
        promedio: promedioMision(sid, p, n),
        hechas: conNota,
        total: acts.length,
        existe: acts.length > 0,
        actividades: acts.map((a) => ({
          id: a.id, cat: a.cat, nombre: a.name, nota: nota(sid, a.id),
          color: (CAT[a.cat] || {}).color, icon: (CAT[a.cat] || {}).icon,
          catLabel: (CAT[a.cat] || {}).label
        }))
      });
    });
  });
  return out;
}

/** Avance sobre las 96 actividades del año. */
function avanceMisiones(sid) {
  const m = actividades(sid).filter((x) => x.existe);
  const hechas = m.filter((x) => x.nota !== null).length;
  return { hechas, total: m.length, pct: m.length ? hechas / m.length : 0 };
}

/** Avance contando misiones completas (las cuatro actividades calificadas). */
function avanceDeMisiones(sid) {
  const m = misiones(sid).filter((x) => x.existe);
  const completas = m.filter((x) => x.hechas === x.total).length;
  return { completas, total: m.length, pct: m.length ? completas / m.length : 0 };
}

/** Racha: actividades consecutivas entregadas en orden cronológico. */
function racha(sid) {
  const m = actividades(sid).filter((x) => x.existe);
  let mejor = 0, actual = 0, viva = 0;
  m.forEach((x) => {
    if (x.nota !== null) { actual++; mejor = Math.max(mejor, actual); }
    else actual = 0;
  });
  const ultima = m.map((x) => x.nota !== null).lastIndexOf(true);
  for (let i = ultima; i >= 0 && m[i].nota !== null; i--) viva++;
  return { mejor, viva };
}

/* --------------------------------- XP ------------------------------------- */

/**
 * Experiencia del año: cada misión entrega su nota × 10.
 * Se cuenta misión a misión (no por periodo) para que la XP refleje el trabajo
 * entregado: con seis misiones hechas no se puede estar arriba del todo.
 */
function xp(sid) {
  let total = 0;
  PERIODS.forEach((p) => {
    MISIONES.forEach((n) => {
      const v = promedioMision(sid, p, n);
      if (v !== null) total += Math.round(v * XP_PER_POINT);
    });
  });
  return total;
}

/** XP conseguida dentro de un periodo (sus seis misiones). */
function xpDePeriodo(sid, periodo) {
  let total = 0;
  MISIONES.forEach((n) => {
    const v = promedioMision(sid, periodo, n);
    if (v !== null) total += Math.round(v * XP_PER_POINT);
  });
  return total;
}

/**
 * Promedio que habría que sostener en las 24 misiones para entrar a un nivel.
 * Sirve para explicar la escalera en pantalla sin que nadie tenga que hacer
 * cuentas.
 *
 * Se redondea hacia arriba a un decimal, porque el número tiene que cumplirse
 * de verdad: el nivel 10 pide 2025 XP, o sea 8.4375 de promedio. Mostrar "8.4"
 * mentiría —un 8.4 sostenido da 2016 XP y se queda a las puertas—, así que se
 * muestra 8.5, que es justo la regla de oro de la academia.
 */
function promedioParaNivel(n) {
  const exacto = xpDeNivel(n) / (XP_PER_POINT * MISIONES_TOTALES);
  return Math.ceil(exacto * 10) / 10;
}

/** El nivel hacker: uno cada 225 XP, con tope en 10. */
function nivel(puntos) {
  return Math.min(MAX_LEVEL, Math.max(1, Math.floor(puntos / XP_PER_LEVEL) + 1));
}

/** XP necesaria para entrar a un nivel dado. */
function xpDeNivel(n) {
  return (Math.max(1, n) - 1) * XP_PER_LEVEL;
}

/** Progreso dentro del nivel actual, para la barra de XP. */
function xpNivel(puntos) {
  const lvl = nivel(puntos);
  const tope = lvl >= MAX_LEVEL;
  const base = xpDeNivel(lvl);
  const enNivel = puntos - base;
  const rango = tope ? XP_MAX - base : XP_PER_LEVEL;
  return {
    nivel: lvl,
    enNivel,
    rango,
    tope,
    faltan: tope ? Math.max(0, XP_MAX - puntos) : Math.max(0, XP_PER_LEVEL - enNivel),
    pct: Math.min(1, rango ? enNivel / rango : 1),
    max: XP_MAX
  };
}

/* ------------------------------ álbum digital ------------------------------ */

/** XP necesaria para desbloquear la pieza n de la colección (0 para la 1ª). */
function xpDeObjeto(n) {
  return (Math.max(1, n) - 1) * XP_POR_OBJETO;
}

/**
 * La colección completa del álbum: 20 piezas de equipo hacker, desbloqueadas
 * según la XP del estudiante — sin importar en qué nivel hacker esté.
 */
function coleccionAlbum(st) {
  const puntos = xp(st.id);
  let siguiente = null;

  const lista = ALBUM_OBJETOS.map((o) => {
    const necesaria = xpDeObjeto(o.n);
    const alcanzado = puntos >= necesaria;
    const item = Object.assign({}, o, {
      xpNecesaria: necesaria,
      faltan: Math.max(0, necesaria - puntos),
      alcanzado,
      progreso: alcanzado ? 1 : Math.min(1, necesaria ? puntos / necesaria : 1)
    });
    if (!alcanzado && !siguiente) siguiente = item;
    return item;
  });

  const logradas = lista.filter((x) => x.alcanzado);

  return {
    lista,
    xp: puntos,
    logradas: logradas.length,
    total: ALBUM_OBJETOS.length,
    actual: logradas[logradas.length - 1] || lista[0],
    siguiente,
    completo: logradas.length >= ALBUM_OBJETOS.length
  };
}

/* --------------------------- niveles hacker ------------------------------- */

/** Ilustración de cuerpo entero de un nivel, en el género del estudiante. */
function retratoNivel(lvl, genero) {
  return NIVEL_DIR + lvl.slug + '_' + genero + '.webp';
}

/** Retrato cuadrado (avatar) de un nivel, en el género del estudiante. */
function avatarNivel(lvl, genero) {
  return AVATAR_DIR + (genero === 'f' ? lvl.avatarF : lvl.avatarM);
}

function nombreNivel(lvl, genero) {
  return genero === 'f' ? lvl.f : lvl.m;
}

/**
 * Identidad hacker actual del estudiante: el nivel al que llegó con su XP,
 * ya resuelto al género con el que se le ilustra.
 */
function identidad(st) {
  const g = generoIlustracion(st);
  const info = xpNivel(xp(st.id));
  const lvl = LEVELS[info.nivel - 1] || LEVELS[0];
  return Object.assign({}, lvl, {
    genero: g,
    nombre: nombreNivel(lvl, g),
    avatar: avatarNivel(lvl, g),
    retrato: retratoNivel(lvl, g)
  });
}

/** Ruta del avatar cuadrado que le corresponde ahora mismo al estudiante. */
function avatarDe(st) {
  const g = generoIlustracion(st);
  const lvl = LEVELS[nivel(xp(st.id)) - 1] || LEVELS[0];
  return avatarNivel(lvl, g);
}

/**
 * La escalera completa: los 10 niveles con su estado para este estudiante.
 * `progreso` mide cuánto le falta de XP para entrar a cada nivel.
 */
function escalera(st) {
  const g = generoIlustracion(st);
  const puntos = xp(st.id);
  const actual = nivel(puntos);
  let siguiente = null;

  const lista = LEVELS.map((lvl) => {
    const necesaria = xpDeNivel(lvl.n);
    const alcanzado = lvl.n <= actual;
    const item = Object.assign({}, lvl, {
      genero: g,
      nombre: nombreNivel(lvl, g),
      avatar: avatarNivel(lvl, g),
      retrato: retratoNivel(lvl, g),
      xpNecesaria: necesaria,
      faltan: Math.max(0, necesaria - puntos),
      alcanzado,
      esActual: lvl.n === actual,
      progreso: alcanzado ? 1 : Math.min(1, necesaria ? puntos / necesaria : 1)
    });
    if (!alcanzado && !siguiente) siguiente = item;
    return item;
  });

  return {
    lista,
    xp: puntos,
    nivel: actual,
    total: LEVELS.length,
    actual: lista[actual - 1],
    siguiente,
    completo: actual >= MAX_LEVEL,
    progresoTotal: Math.min(1, puntos / XP_MAX)
  };
}

/** Ánimo del hacker: se lee del promedio del periodo más reciente. */
function animo(sid) {
  const p = periodoActual(sid);
  const v = p ? promedioPeriodo(sid, p) : null;
  if (v === null) return Object.assign({}, MOODS[MOODS.length - 1], { promedio: null, periodo: null });
  const m = MOODS.find((x) => v >= x.min) || MOODS[MOODS.length - 1];
  return Object.assign({}, m, { promedio: v, periodo: p });
}

/* -------------------------------- ranking --------------------------------- */

/**
 * Puntos de la métrica pedida: la XP del año o la del periodo indicado.
 * Devuelve null si no hay notas, para que esos reclutas queden al final.
 */
function puntos(sid, metrica = 'global') {
  if (metrica === 'global') {
    return promedioGlobal(sid) === null ? null : xp(sid);
  }
  const p = Number(metrica);
  return promedioPeriodo(sid, p) === null ? null : xpDePeriodo(sid, p);
}

function puntosMax(metrica = 'global') {
  return metrica === 'global' ? XP_MAX : XP_MAX_PERIODO;
}

/**
 * Tabla ordenada por XP. `metrica` = 'global' | 1 | 2 | 3 | 4.
 * El orden es siempre el mismo criterio que muestra el leaderboard, de modo
 * que el «puesto» del perfil y el del ranking nunca se contradicen.
 */
function tabla(lista, metrica = 'global') {
  const filas = lista.map((s) => {
    const v = metrica === 'global' ? promedioGlobal(s.id) : promedioPeriodo(s.id, Number(metrica));
    const total = xp(s.id);
    return {
      st: s,
      promedio: v,
      puntos: puntos(s.id, metrica),
      xp: total,
      nivel: nivel(total),
      rango: rango(v),
      avance: avanceMisiones(s.id)
    };
  });
  filas.sort((a, b) => {
    if (a.puntos === null && b.puntos === null) return a.st.name.localeCompare(b.st.name, 'es');
    if (a.puntos === null) return 1;
    if (b.puntos === null) return -1;
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    return a.st.name.localeCompare(b.st.name, 'es');
  });
  filas.forEach((f, i) => { f.pos = i + 1; });
  return filas;
}

function companeros(st) {
  return db.students.filter((s) => s.grade === st.grade && s.group === st.group);
}

function posicionEn(lista, sid, metrica = 'global') {
  const t = tabla(lista, metrica);
  const f = t.find((x) => x.st.id === sid);
  return f ? { pos: f.pos, total: t.length } : { pos: null, total: t.length };
}

/* ------------------------------- insignias -------------------------------- */

function insignias(st) {
  const sid = st.id;
  const m = actividades(sid).filter((x) => x.existe);
  const conNota = m.filter((x) => x.nota !== null);
  const global = promedioGlobal(sid);
  const p1 = m.filter((x) => x.periodo === 1);
  const r = racha(sid);
  const nv = nivel(xp(sid));

  const proms = PERIODS.map((p) => promedioPeriodo(sid, p));
  let subeDos = false;
  for (let i = 2; i < proms.length; i++) {
    if (proms[i] !== null && proms[i - 1] !== null && proms[i - 2] !== null &&
        proms[i] > proms[i - 1] && proms[i - 1] > proms[i - 2]) subeDos = true;
  }

  const periodosAbiertos = PERIODS.filter((p) => promedioPeriodo(sid, p) !== null);
  const pendientesEnAbiertos = m.some((x) => periodosAbiertos.includes(x.periodo) && x.nota === null);

  const curso = tabla(companeros(st));
  const posCurso = (curso.find((x) => x.st.id === sid) || {}).pos || 999;
  const gen = tabla(db.students);
  const posGen = (gen.find((x) => x.st.id === sid) || {}).pos || 999;

  const logrado = {
    'primer-paso': conNota.length >= 1,
    'periodo1': p1.length > 0 && p1.every((x) => x.nota !== null),
    'sin-pendiente': periodosAbiertos.length > 0 && !pendientesEnAbiertos,
    'diez': conNota.some((x) => x.nota >= 10),
    'excelencia': global !== null && global >= 9,
    'elite': global !== null && global >= 8,
    'ascenso': subeDos,
    'taller': (promedioCategoria(sid, 'taller') || 0) >= 9,
    'reto': (promedioCategoria(sid, 'xp') || 0) >= 9,
    'bitacora': ((promedioCategoria(sid, 'bit1') || 0) + (promedioCategoria(sid, 'bit2') || 0)) / 2 >= 9,
    'racha': r.mejor >= 6,
    'podio': posCurso <= 3,
    'top10': posGen <= 10,
    'sin-bajos': periodosAbiertos.length > 0 && periodosAbiertos.every((p) => promedioPeriodo(sid, p) >= SCALE.pass),
    'nivel5': nv >= 5,
    'nivel10': nv >= MAX_LEVEL
  };

  return BADGES.map((b) => Object.assign({}, b, { logrado: !!logrado[b.key] }));
}

/* ---------------------- retroalimentación automática ---------------------- */

const ELOGIO = {
  taller: 'los talleres se te dan bien: aplicas lo aprendido con rigor',
  xp: 'brillas en los retos gamificados: piensas rápido y con estrategia',
  bit1: 'tu bitácora de investigación destaca por curiosidad y detalle',
  bit2: 'tu bitácora de equipo muestra madurez y autorreflexión'
};
const MEJORA = {
  taller: 'dedica más tiempo a los talleres: revisa el enunciado antes de entregar',
  xp: 'practica los retos gamificados: la agilidad se entrena repitiendo',
  bit1: 'amplía tu bitácora de investigación con fuentes y ejemplos propios',
  bit2: 'cuida la bitácora de equipo: registra acuerdos y lo que aprendiste de otros'
};

/**
 * Retroalimentación personalizada para un periodo (o el consolidado del año).
 * @returns {{titulo:string, parrafos:string[], acciones:string[], tono:string}}
 */
function retroalimentacion(st, periodo) {
  const sid = st.id;
  const nombre = st.name.split(' ')[0];
  const prom = periodo ? promedioPeriodo(sid, periodo) : promedioGlobal(sid);
  const parrafos = [];
  const acciones = [];

  if (prom === null) {
    return {
      titulo: 'Sin notas registradas todavía',
      tono: 'neutro',
      parrafos: [
        nombre + ', tu docente aún no ha registrado calificaciones para ' +
        (periodo ? 'el periodo ' + periodo : 'este año') + '.',
        'En cuanto aparezca la primera nota, aquí verás tu análisis personalizado y las misiones que te faltan.'
      ],
      acciones: ['Revisa con tu docente qué misiones están abiertas.']
    };
  }

  const d = desempeno(prom);
  const notasCat = CATEGORIES.map((c) => ({
    cat: c.key,
    label: c.label,
    valor: periodo ? notaCat(sid, periodo, c.key) : promedioCategoria(sid, c.key)
  })).filter((x) => x.valor !== null);

  const orden = notasCat.slice().sort((a, b) => b.valor - a.valor);
  const fuerte = orden[0];
  const debil = orden[orden.length - 1];

  const encabezado = {
    sup: nombre + ', tu desempeño es SUPERIOR (' + fmt(prom) + '). Estás en la cima de la academia.',
    alt: nombre + ', tu desempeño es ALTO (' + fmt(prom) + '). Muy sólido y constante.',
    bas: nombre + ', tu desempeño es BÁSICO (' + fmt(prom) + '). Cumples, y hay margen para crecer.',
    baj: nombre + ', tu desempeño es BAJO (' + fmt(prom) + '). Es momento de reaccionar; aún hay tiempo.'
  };
  parrafos.push(encabezado[d.key]);

  if (fuerte && fuerte.valor >= 7) {
    parrafos.push('Tu mayor fortaleza está en ' + fuerte.label + ' (' + fmt(fuerte.valor) + '): ' +
      ELOGIO[fuerte.cat] + '.');
  }
  if (debil && debil !== fuerte) {
    // Se compara la nota ya redondeada para no decir que un 7.0 está por debajo de 7.0.
    if (redondear(debil.valor, 1) < SCALE.pass) {
      parrafos.push('Lo que más te está costando es ' + debil.label + ' (' + fmt(debil.valor) +
        '), por debajo de la nota de aprobación. ' + MEJORA[debil.cat].charAt(0).toUpperCase() +
        MEJORA[debil.cat].slice(1) + '.');
      acciones.push('Recupera ' + debil.label + ': habla con tu docente sobre el plan de refuerzo.');
    } else {
      parrafos.push('Donde más puedes ganar es en ' + debil.label + ' (' + fmt(debil.valor) + '): ' +
        MEJORA[debil.cat] + '.');
    }
  }

  const av = avanceMisiones(sid);
  const pend = misiones(sid).filter((x) => x.existe && x.hechas < x.total &&
    (periodo ? x.periodo === periodo : true));
  if (pend.length) {
    const nombres = pend.slice(0, 4).map((x) => 'P' + x.periodo + ' · ' + x.nombre);
    parrafos.push('Tienes ' + pend.length + (pend.length === 1 ? ' misión incompleta' : ' misiones incompletas') +
      ': ' + nombres.join(', ') + (pend.length > 4 ? ' y ' + (pend.length - 4) + ' más' : '') + '.');
    acciones.push('Completa ' + (pend.length === 1 ? 'la misión pendiente' : 'las misiones pendientes') +
      ' antes del cierre del periodo.');
  } else {
    parrafos.push('No tienes actividades pendientes en ' + (periodo ? 'este periodo' : 'los periodos abiertos') +
      ': ' + av.hechas + ' de ' + av.total + ' actividades del año registradas.');
  }

  if (!periodo) {
    const proms = PERIODS.map((p) => promedioPeriodo(sid, p)).filter((v) => v !== null);
    if (proms.length >= 2) {
      const delta = proms[proms.length - 1] - proms[0];
      if (delta >= 0.3) parrafos.push('Tu curva del año es ascendente: has subido ' + fmt(delta) + ' puntos desde el primer periodo. Sigue así.');
      else if (delta <= -0.3) parrafos.push('Tu promedio ha bajado ' + fmt(Math.abs(delta)) + ' puntos desde el primer periodo. Conviene retomar el ritmo inicial.');
      else parrafos.push('Te has mantenido estable durante el año: la constancia también cuenta.');
    }
  }

  const esc = escalera(st);
  if (esc.siguiente) {
    const misionesQueFaltan = Math.ceil(esc.siguiente.faltan / (SCALE.max * XP_PER_POINT));
    acciones.push('Sube al nivel ' + esc.siguiente.n + ' (' + esc.siguiente.nombre + '): te faltan ' +
      esc.siguiente.faltan + ' XP, es decir unas ' + misionesQueFaltan +
      (misionesQueFaltan === 1 ? ' misión más bien hecha.' : ' misiones más bien hechas.'));
  } else {
    acciones.push('Estás en el nivel máximo de la academia: ayuda a un compañero a subir el suyo.');
  }
  if (prom >= 9) acciones.push('Mantén el nivel: apunta a cerrar el año con desempeño Superior.');
  else if (prom >= SCALE.pass) acciones.push('Sube medio punto tu categoría más floja y cambias de rango.');
  else acciones.push('Prioriza las misiones pendientes: cada punto de nota son 10 XP.');

  return { titulo: 'Desempeño ' + d.label, tono: d.key, parrafos, acciones };
}

/** Avisos del docente aplicables al estudiante (globales + dirigidos). */
function avisosDe(st) {
  return (db.avisos || []).filter((a) => {
    const al = a.alcance || {};
    if (al.code && String(al.code).toUpperCase() !== st.code.toUpperCase()) return false;
    if (al.grade && String(al.grade) !== st.grade) return false;
    if (al.group && String(al.group).toUpperCase() !== st.group) return false;
    return true;
  }).sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));
}

/* ------------------------- resumen completo del alumno -------------------- */

function perfil(st) {
  const sid = st.id;
  const puntos = xp(sid);
  const esc = escalera(st);
  const global = promedioGlobal(sid);
  const curso = companeros(st);
  return {
    st,
    global,
    rango: rango(global),
    desempeno: desempeno(global),
    xp: puntos,
    nivelInfo: xpNivel(puntos),
    identidad: esc.actual,
    escalera: esc,
    coleccion: coleccionAlbum(st),
    avatar: esc.actual.avatar,
    titulo: esc.actual.nombre,
    lema: esc.actual.lema,
    animo: animo(sid),
    avance: avanceMisiones(sid),
    racha: racha(sid),
    insignias: insignias(st),
    posCurso: posicionEn(curso, sid),
    posGeneral: posicionEn(db.students, sid),
    promedioCurso: promedioDe(curso),
    periodoActual: periodoActual(sid),
    periodos: PERIODS.map((p) => ({ periodo: p, promedio: promedioPeriodo(sid, p), era: eraDe(p) })),
    categorias: CATEGORIES.map((c) => ({ cat: c, valor: promedioCategoria(sid, c.key) }))
  };
}

/** XP aportada por cada periodo (la suma es exactamente la XP total). */
function xpPorPeriodo(sid) {
  return PERIODS.map((p) => ({
    periodo: p,
    era: eraDe(p),
    promedio: promedioPeriodo(sid, p),
    xp: xpDePeriodo(sid, p),
    max: XP_MAX_PERIODO
  }));
}


return { redondear: redondear, fmt: fmt, rango: rango, desempeno: desempeno, eraDe: eraDe, notaDe: notaDe, nombreDeMision: nombreDeMision, notaCat: notaCat, promedioPeriodo: promedioPeriodo, promedioGlobal: promedioGlobal, promedioCategoria: promedioCategoria, promedioDe: promedioDe, promedioCatDe: promedioCatDe, periodoActual: periodoActual, actividades: actividades, promedioMision: promedioMision, misiones: misiones, avanceMisiones: avanceMisiones, avanceDeMisiones: avanceDeMisiones, racha: racha, xp: xp, xpDePeriodo: xpDePeriodo, promedioParaNivel: promedioParaNivel, nivel: nivel, xpDeNivel: xpDeNivel, xpNivel: xpNivel, xpDeObjeto: xpDeObjeto, coleccionAlbum: coleccionAlbum, retratoNivel: retratoNivel, avatarNivel: avatarNivel, nombreNivel: nombreNivel, identidad: identidad, avatarDe: avatarDe, escalera: escalera, animo: animo, puntos: puntos, puntosMax: puntosMax, tabla: tabla, companeros: companeros, posicionEn: posicionEn, insignias: insignias, retroalimentacion: retroalimentacion, avisosDe: avisosDe, perfil: perfil, xpPorPeriodo: xpPorPeriodo, CATEGORIES: CATEGORIES, CAT: CAT, PERIODS: PERIODS, MISIONES: MISIONES, SCALE: SCALE, LEVELS: LEVELS, MAX_LEVEL: MAX_LEVEL, XP_PER_LEVEL: XP_PER_LEVEL, XP_MAX: XP_MAX, XP_META: XP_META, PROMEDIO_META: PROMEDIO_META, MISIONES_TOTALES: MISIONES_TOTALES };
})();

/* ---------- portada.js ---------- */
var __M_portada = (function () {
/* ============================================================================
   portada.js — La parte pública: narrativa y accesos
   ----------------------------------------------------------------------------
   Antes de entrar a cualquier panel, todo el mundo pasa por aquí directamente
   (sin pantalla de bienvenida de por medio): se cuenta la historia de la
   Academia y se ofrecen las dos puertas: el panel del tutor (entra directo,
   sin código) y el del estudiante (pide su código).
   ========================================================================== */

const { $, $$, el, esc, rgb, modal, cerrarModal } = __M_ui;
const { db } = __M_datos;
const { MAX_LEVEL } = __M_config;
/* --------------------------------- textos --------------------------------- */

const NARRATIVA = [
  'El sistema digital de la Escuela ha caído. Una superinteligencia artificial llamada ' +
  '<b>GHOST</b> se apoderó del código fuente y ya no obedece a nadie: su objetivo es ' +
  'controlar la mente de todos los estudiantes.',

  'Por eso la Academia C.O.D.E. abrió el reclutamiento. Buscamos estudiantes dispuestos a ' +
  'formarse como hackers, <b>reescribir el código fuente de la Escuela</b>, derrotar a GHOST ' +
  'y liberar a sus compañeros.',

  'Entras en el nivel 1, como <b>Hacker Aprendiz</b>. Cada una de las 24 misiones del año ' +
  'suma experiencia, y con ella subes de escalón. Quien sostenga un <b>promedio de 8.5</b> ' +
  'llega arriba del todo: diez niveles hasta convertirte en <b>Hacker Maestro</b>.',

  'La misión ya empezó. Elige tu acceso y ponte en marcha.'
];

/* Las dos puertas que abren un panel de la propia Academia. */
const PANELES = [
  { id: 'estudiante', icon: 'fa-user-astronaut',  color: '#22d3ee',
    titulo: 'Hacker Estudiante', sub: 'Panel del estudiante' }
];

/* --------------------------------- estado --------------------------------- */

let alEntrar = null;         // (codigo, recordar) => boolean · acceso del estudiante
let alEntrarDocente = null;  // () => void · abre el panel del tutor sin código
let alternarTema = null;     // lo aporta app.js, que es quien manda en el tema

function configurar(opciones) {
  alEntrar = opciones.alEntrar;
  alEntrarDocente = opciones.alEntrarDocente;
  alternarTema = opciones.alternarTema;
}

/** ¿Se está mostrando la portada ahora mismo? (para repintarla si hace falta). */
const estaVisible = () => {
  const cont = $('#portada');
  return !!cont && !cont.hidden;
};

/* --------------------------- diálogos de acceso --------------------------- */

function dialogoAcceso() {
  const form = el('form', { class: 'acceso', autocomplete: 'off' },
    el('div', { class: 'acceso__sello', style: { '--c': '#22d3ee' } },
      el('i', { class: 'fa-solid fa-user-astronaut' })),
    el('p', { class: 'acceso__intro', text: 'Escribe el código de estudiante que te entregó tu docente.' }),
    el('label', { class: 'campo' },
      el('span', { class: 'campo__etq', html: '<i class="fa-solid fa-barcode"></i> Código' }),
      el('input', {
        name: 'codigo',
        type: 'text',
        required: 'required',
        spellcheck: 'false',
        placeholder: 'CODE-0001',
        autocomplete: 'off'
      })),
    el('label', { class: 'check' },
      el('input', { name: 'recordar', type: 'checkbox', checked: 'checked' }),
      el('span', { text: 'Mantener la sesión abierta en este equipo' })),
    el('p', { class: 'acceso__error', hidden: 'hidden' }),
    el('button', { class: 'btn btn--grande btn--ancho', type: 'submit' },
      el('i', { class: 'fa-solid fa-right-to-bracket' }), ' Entrar a mi panel')
  );

  modal({
    titulo: 'Acceso Hacker Estudiante',
    subtitulo: 'Tu progreso te espera',
    ancho: '440px',
    cuerpo: form
  });

  setTimeout(() => form.codigo.focus(), 260);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const caja = $('.acceso__error', form);
    const ok = alEntrar(form.codigo.value, form.recordar.checked);
    if (ok) { cerrarModal(); return; }
    caja.textContent = 'No encontramos ese código de estudiante en la base de la academia.';
    caja.hidden = false;
    form.classList.remove('tiembla');
    void form.offsetWidth;
    form.classList.add('tiembla');
    form.codigo.select();
  });

  form.codigo.addEventListener('input', () => { $('.acceso__error', form).hidden = true; });
}

/* -------------------------------- pantallas ------------------------------- */

function caminoHTML(c, flecha, extra) {
  return `
    <button class="camino ${extra || ''}" data-camino="${c.id}"
            style="--c:${c.color};--c-rgb:${rgb(c.color)}"
            title="${esc(c.titulo)}">
      <span class="camino__ico"><i class="fa-solid ${c.icon}"></i></span>
      <span class="camino__txt">
        <b>${esc(c.titulo)}</b>
        <small>${esc(c.sub)}</small>
      </span>
      <i class="fa-solid ${flecha} camino__flecha"></i>
    </button>`;
}

function navHTML() {
  return PANELES.map((c) => caminoHTML(c, 'fa-chevron-right')).join('');
}

function narrativaHTML() {
  return `
  <article class="narrativa">
    <p class="narrativa__eyebrow"><i class="fa-solid fa-satellite-dish"></i> Transmisión entrante</p>
    <h1 class="narrativa__t">Operación <span>Código Fuente</span></h1>
    <div class="narrativa__cuerpo">
      ${NARRATIVA.map((p) => `<p>${p}</p>`).join('')}
    </div>

    <div class="narrativa__escalera">
      <span><i class="fa-solid fa-seedling"></i> Nivel 1 · Aprendiz</span>
      <i class="fa-solid fa-ellipsis narrativa__puntos"></i>
      <span><i class="fa-solid fa-graduation-cap"></i> Nivel ${MAX_LEVEL} · Maestro</span>
    </div>
  </article>`;
}

function cuerpoHTML() {
  return `
  <div class="portada__cuerpo">
    <aside class="portada__nav">
      <p class="portada__nav-t">Elige tu camino</p>
      ${navHTML()}
      <p class="portada__nav-pie">
        Academia C.O.D.E. · ${esc((db.config && db.config.institution) || '')}
      </p>
    </aside>
    <main class="portada__vista" id="portada-vista"></main>
  </div>`;
}

/* --------------------------------- render --------------------------------- */

function mostrar() {
  const cont = $('#portada');
  cont.hidden = false;
  cont.innerHTML = fondoHTML() + cuerpoHTML();
  $('#portada-vista', cont).innerHTML = narrativaHTML();

  $$('[data-camino]', cont).forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.camino;
    if (id === 'tutor') { if (alEntrarDocente) alEntrarDocente(); return; }
    if (id === 'estudiante') { dialogoAcceso(); return; }
  }));

  const tema = $('#btn-tema-portada', cont);
  if (tema && alternarTema) tema.addEventListener('click', alternarTema);

  const vistaNodo = $('#portada-vista', cont);
  vistaNodo.classList.remove('entra');
  void vistaNodo.offsetWidth;
  vistaNodo.classList.add('entra');
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function fondoHTML() {
  return `
  <div class="login__fondo" aria-hidden="true">
    <span class="orbe orbe--1"></span><span class="orbe orbe--2"></span><span class="orbe orbe--3"></span>
    <div class="rejilla-fondo"></div>
  </div>
  <button id="btn-tema-portada" class="btn-icono btn-icono--flotante" title="Cambiar tema"
          aria-label="Cambiar tema"><i class="fa-solid fa-sun"></i></button>`;
}

function ocultar() {
  const cont = $('#portada');
  if (cont) cont.hidden = true;
}

/** Abre directamente el diálogo de acceso del estudiante (tras cerrar sesión). */
function pedirAcceso() {
  mostrar();
  setTimeout(() => dialogoAcceso(), 320);
}

return { configurar: configurar, estaVisible: estaVisible, mostrar: mostrar, ocultar: ocultar, pedirAcceso: pedirAcceso };
})();

/* ---------- exportar.js ---------- */
var __M_exportar = (function () {
/* ============================================================================
   exportar.js — Imagen, PDF y HTML interactivo
   ----------------------------------------------------------------------------
   Tres salidas para lo mismo (escarapelas y boletines):

     PNG   · una imagen suelta, cómoda para pegar o imprimir en carnetizadora.
     PDF   · hoja carta vertical, una página por documento.
     HTML  · un archivo autónomo, con las imágenes incrustadas, buscador y
             botón de imprimir. Se abre con doble clic en cualquier equipo.
   ========================================================================== */

const { descargar } = __M_ui;
/* Carta vertical, en milímetros. */
const CARTA = { ancho: 215.9, alto: 279.4, margen: 10 };

function exigirHtml2canvas() {
  if (typeof window.html2canvas !== 'function') {
    throw new Error('No se pudo cargar html2canvas. Revisa la conexión o assets/vendor.');
  }
  return window.html2canvas;
}

function exigirJsPDF() {
  const lib = window.jspdf && window.jspdf.jsPDF;
  if (!lib) throw new Error('No se pudo cargar jsPDF. Revisa la conexión o assets/vendor.');
  return lib;
}

/**
 * html2canvas no sabe interpretar la función CSS color-mix() (la usan las
 * escarapelas) y, si la encuentra al calcular los estilos, aborta toda la
 * captura. Esta clase activa en css/styles.css unas reglas de repuesto en
 * rgba() mientras dura la captura, para que nunca llegue a vérselas.
 */
async function conEstilosSeguros(tarea) {
  const raiz = document.documentElement;
  raiz.classList.add('exportando-captura');
  try {
    return await tarea();
  } finally {
    raiz.classList.remove('exportando-captura');
  }
}

/* ---------------------------------- PNG ----------------------------------- */

async function nodoAPNG(nodo, escala = 3) {
  const html2canvas = exigirHtml2canvas();
  const lienzo = await conEstilosSeguros(() => html2canvas(nodo, {
    backgroundColor: null, scale: escala, useCORS: true, logging: false
  }));
  return lienzo.toDataURL('image/png');
}

async function descargarPNG(nodo, nombre, escala = 3) {
  descargar(await nodoAPNG(nodo, escala), nombre);
  return nombre;
}

/**
 * Varios nodos, cada uno a su PNG, empaquetados en un único .zip.
 * @param {{nodo: HTMLElement, nombre: string}[]} items
 * @param {string} nombreZip
 */
async function descargarPNGLote(items, nombreZip, escala = 3) {
  if (typeof window.JSZip !== 'function') {
    throw new Error('No se pudo cargar JSZip. Revisa la conexión o assets/vendor.');
  }
  const zip = new window.JSZip();
  for (const it of items) {
    const dataURL = await nodoAPNG(it.nodo, escala);
    const base64 = dataURL.slice(dataURL.indexOf(',') + 1);
    zip.file(it.nombre, base64, { base64: true });
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  descargar(blob, nombreZip);
  return nombreZip;
}

/* ---------------------------------- PDF ----------------------------------- */

/**
 * Convierte uno o varios nodos en un PDF carta vertical, una página por nodo.
 * Si un nodo es más alto que la página, se parte en varias.
 * @param {object} opciones {fondo, escala, anchoMM}
 *   `anchoMM`: en vez de estirar la imagen para llenar el ancho de la hoja,
 *   la coloca centrada a ese ancho físico exacto (p. ej. un carnet), con el
 *   alto que le toque según su propia proporción — así el tamaño de la
 *   captura no importa, siempre sale al tamaño real pedido.
 */
async function descargarPDF(nodos, nombre, opciones = {}) {
  const html2canvas = exigirHtml2canvas();
  const JsPDF = exigirJsPDF();
  const lista = Array.isArray(nodos) ? nodos : [nodos];
  const fondo = opciones.fondo || '#ffffff';

  const pdf = new JsPDF({ unit: 'mm', format: [CARTA.ancho, CARTA.alto], orientation: 'portrait' });
  const util = CARTA.ancho - CARTA.margen * 2;
  const utilAlto = CARTA.alto - CARTA.margen * 2;

  for (let i = 0; i < lista.length; i++) {
    const lienzo = await conEstilosSeguros(() => html2canvas(lista[i], {
      backgroundColor: fondo, scale: opciones.escala || 2, useCORS: true, logging: false
    }));
    const img = lienzo.toDataURL('image/jpeg', 0.92);

    if (i > 0) pdf.addPage();

    if (opciones.anchoMM) {
      const w = opciones.anchoMM;
      const h = (lienzo.height * w) / lienzo.width;
      pdf.addImage(img, 'JPEG', (CARTA.ancho - w) / 2, Math.max(CARTA.margen, (CARTA.alto - h) / 2), w, h);
      continue;
    }

    const alto = (lienzo.height * util) / lienzo.width;

    if (alto <= utilAlto) {
      pdf.addImage(img, 'JPEG', CARTA.margen, CARTA.margen, util, alto);
    } else if (alto <= utilAlto * 1.4) {
      /* Se pasa un poco: se reduce para que el informe quepa en una sola hoja,
         que es lo que espera quien lo va a archivar o entregar. */
      const escala = utilAlto / alto;
      const w = util * escala;
      pdf.addImage(img, 'JPEG', CARTA.margen + (util - w) / 2, CARTA.margen, w, utilAlto);
    } else {
      // Demasiado largo: se reparte en páginas desplazando la imagen.
      let restante = alto, y = 0;
      while (restante > 0.5) {
        if (y > 0) pdf.addPage();
        pdf.addImage(img, 'JPEG', CARTA.margen, CARTA.margen - y, util, alto);
        restante -= utilAlto;
        y += utilAlto;
      }
    }
  }

  pdf.save(nombre);
  return nombre;
}

/* ----------------------------- HTML interactivo --------------------------- */

const cacheImagenes = new Map();

/** Reduce una imagen y la devuelve como data URI, para incrustarla en el HTML. */
function imagenADataURI(src, maxLado = 320) {
  if (cacheImagenes.has(src)) return cacheImagenes.get(src);
  const promesa = new Promise((resolver) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * escala));
        c.height = Math.max(1, Math.round(img.height * escala));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        let url = '';
        try { url = c.toDataURL('image/webp', 0.82); } catch (e) { url = ''; }
        if (!url || url.indexOf('data:image/webp') !== 0) url = c.toDataURL('image/png');
        resolver(url);
      } catch (e) { resolver(src); }
    };
    img.onerror = () => resolver(src);
    img.src = src;
  });
  cacheImagenes.set(src, promesa);
  return promesa;
}

/** Cambia todos los src del HTML por imágenes incrustadas. */
async function incrustarImagenes(html) {
  const caja = document.createElement('div');
  caja.innerHTML = html;
  const imgs = [...caja.querySelectorAll('img')];
  await Promise.all(imgs.map(async (img) => {
    const src = img.getAttribute('src');
    if (!src || src.indexOf('data:') === 0) return;
    img.setAttribute('src', await imagenADataURI(src, img.closest('.escarapela') ? 320 : 240));
    img.removeAttribute('loading');
    img.removeAttribute('crossorigin');
  }));
  // Los QR se dibujan en canvas: se pasan a imagen para que viajen en el archivo.
  [...caja.querySelectorAll('canvas')].forEach((c) => { c.remove(); });
  return caja.innerHTML;
}

/** Los QR del documento vivo, convertidos a <img> antes de exportar. */
function congelarQR(raiz) {
  [...raiz.querySelectorAll('.escarapela__qr')].forEach((caja) => {
    const cv = caja.querySelector('canvas');
    if (!cv) return;
    try {
      const img = new Image();
      img.src = cv.toDataURL('image/png');
      img.alt = 'QR';
      caja.innerHTML = '';
      caja.appendChild(img);
    } catch (e) { /* si falla se queda el canvas */ }
  });
}

async function hojaDeEstilos() {
  const partes = [];
  for (const ruta of ['css/styles.css']) {
    try {
      const res = await fetch(ruta, { cache: 'no-store' });
      if (res.ok) partes.push(await res.text());
    } catch (e) { /* se exporta sin ese css */ }
  }
  return partes.join('\n');
}

/**
 * Genera un .html autónomo con buscador y botón de imprimir.
 * @param {object} o {titulo, subtitulo, contenido, nombre, buscar, tema}
 */
async function descargarHTML(o) {
  const css = await hojaDeEstilos();
  const cuerpo = await incrustarImagenes(o.contenido);
  const tema = o.tema || document.documentElement.dataset.tema || 'oscuro';
  const fecha = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

  const doc = `<!DOCTYPE html>
<html lang="es" data-tema="${tema}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${o.titulo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<style>
${css}
body { padding: 0; }
.exp-cab {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 14px;
  padding: 16px 22px;
  background: var(--vidrio); backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--linea);
}
.exp-cab h1 { font-size: 18px; }
.exp-cab p { font-size: 12px; color: var(--txt-3); }
.exp-herramientas { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.exp-lienzo { padding: 22px; display: grid; gap: 20px; }
.exp-item { break-inside: avoid; }
.exp-vacio { padding: 40px; text-align: center; color: var(--txt-3); }
@media print {
  .exp-cab { display: none !important; }
  .exp-lienzo { padding: 0; gap: 0; }
  .exp-item { break-after: page; }
  .exp-item:last-child { break-after: auto; }
}
</style>
</head>
<body>
<header class="exp-cab no-print">
  <div>
    <h1>${o.titulo}</h1>
    <p>${o.subtitulo || ''} · generado el ${fecha}</p>
  </div>
  <div class="exp-herramientas">
    ${o.buscar === false ? '' : `<label class="buscador">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input id="exp-q" type="search" placeholder="Buscar…" autocomplete="off">
    </label>`}
    <button class="btn-icono" id="exp-tema" title="Cambiar tema"><i class="fa-solid fa-circle-half-stroke"></i></button>
    <button class="btn" onclick="window.print()"><i class="fa-solid fa-print"></i> Imprimir</button>
  </div>
</header>

<main class="exp-lienzo" id="exp-lienzo">
${cuerpo}
</main>

<script>
(function () {
  var q = document.getElementById('exp-q');
  if (q) {
    q.addEventListener('input', function () {
      var t = q.value.trim().toLowerCase();
      var n = 0;
      [].forEach.call(document.querySelectorAll('.exp-item'), function (it) {
        var ok = !t || (it.textContent || '').toLowerCase().indexOf(t) >= 0;
        it.style.display = ok ? '' : 'none';
        if (ok) n++;
      });
      var v = document.getElementById('exp-vacio');
      if (v) v.style.display = n ? 'none' : '';
    });
  }
  var bt = document.getElementById('exp-tema');
  if (bt) bt.addEventListener('click', function () {
    var h = document.documentElement;
    h.dataset.tema = h.dataset.tema === 'claro' ? 'oscuro' : 'claro';
  });
})();
</script>
<div class="exp-vacio" id="exp-vacio" style="display:none">Ningún resultado.</div>
</body>
</html>`;

  descargar(new Blob([doc], { type: 'text/html;charset=utf-8' }), o.nombre);
  return o.nombre;
}

return { CARTA: CARTA, nodoAPNG: nodoAPNG, descargarPNG: descargarPNG, descargarPNGLote: descargarPNGLote, descargarPDF: descargarPDF, congelarQR: congelarQR, descargarHTML: descargarHTML };
})();

/* ---------- tarjeta.js ---------- */
var __M_tarjeta = (function () {
/* ============================================================================
   tarjeta.js — Piezas compartidas por el panel del estudiante y el del docente
   ----------------------------------------------------------------------------
   La escarapela y el informe se dibujan igual los vea el alumno (el suyo) o el
   docente (los de todo el curso), así que el marcado vive aquí una sola vez.
   ========================================================================== */

const { esc, rgb } = __M_ui;
const { db } = __M_datos;
const M = __M_motor;
const { XP_MAX, MAX_LEVEL, ALBUM_TOTAL, CATEGORIES, MISIONES, SCALE } = __M_config;
const { nodoAPNG } = __M_exportar;

/* ------------------------------- escarapela ------------------------------- */

/** Texto corto del QR: qrcodejs no admite cadenas largas. */
function textoQR(p) {
  return [
    p.st.code,
    p.st.name,
    p.st.grade + '°' + p.st.group,
    'Nv.' + p.nivelInfo.nivel + ' ' + p.identidad.nombre,
    p.xp + 'XP'
  ].join(' | ');
}

/** Versión legible completa, para copiar o pegar en otro sitio. */
function textoDatos(p) {
  const cfg = db.config;
  return [
    cfg.institution,
    'Recluta: ' + p.st.name,
    'Codigo: ' + p.st.code,
    'Curso: ' + p.st.grade + '° ' + p.st.group,
    'Rango: ' + p.rango.name,
    'Nivel ' + p.nivelInfo.nivel + ' de ' + MAX_LEVEL + ': ' + p.identidad.nombre,
    'Lema: ' + p.identidad.lema,
    'Experiencia: ' + p.xp + ' XP de ' + XP_MAX
  ].join('\n');
}

/** Dibuja el QR dentro de un nodo. Si no se puede, deja un icono. */
function pintarQREn(caja, p) {
  if (!caja) return;
  caja.innerHTML = '';
  const alterno = () => { caja.innerHTML = '<div class="qr-alt"><i class="fa-solid fa-qrcode"></i></div>'; };
  if (typeof window.QRCode !== 'function') { alterno(); return; }

  const dibuja = (texto) => new window.QRCode(caja, {
    text: texto, width: 132, height: 132,
    colorDark: '#0b1220', colorLight: '#ffffff',
    correctLevel: window.QRCode.CorrectLevel.L
  });

  try {
    dibuja(textoQR(p));
  } catch (e) {
    caja.innerHTML = '';
    try { dibuja(p.st.code); } catch (e2) { alterno(); }
  }
}

/** Cara frontal de la escarapela. */
function escarapelaHTML(p, opciones = {}) {
  const st = p.st;
  const cfg = db.config;
  const id = p.identidad;
  const logradas = p.insignias.filter((b) => b.logrado).length;
  const idAttr = opciones.id ? ` id="${esc(opciones.id)}"` : '';
  const qrId = opciones.qrId || 'qr';

  return `
  <section class="escarapela"${idAttr} style="--c:${id.color};--c-rgb:${rgb(id.color)}">
    <div class="escarapela__trama"></div>
    <header class="escarapela__head">
      <span class="escarapela__logo">${esc(cfg.logo || 'CODE')}</span>
      <div>
        <p class="escarapela__inst">${esc(cfg.institution)}</p>
        <p class="escarapela__sub">${esc(cfg.subject)} · ${esc(cfg.year)}</p>
      </div>
    </header>

    <div class="escarapela__foto">
      <img src="${esc(p.avatar)}" alt="Avatar de ${esc(st.name)}">
      <span class="escarapela__nivel">Nv. ${p.nivelInfo.nivel}</span>
    </div>

    <h2 class="escarapela__nombre">${esc(st.name)}</h2>
    <p class="escarapela__titulo">${esc(id.lema)}</p>

    <div class="escarapela__rango" style="--c:${id.color}">
      <i class="fa-solid ${id.icon}"></i> ${esc(id.nombre)}
    </div>

    <dl class="escarapela__datos">
      <div><dt>Código</dt><dd>${esc(st.code)}</dd></div>
      <div><dt>Curso</dt><dd>${esc(st.grade)}° ${esc(st.group)}</dd></div>
      <div><dt>XP</dt><dd>${p.xp}</dd></div>
    </dl>

    <div class="escarapela__barra">
      <i class="barra__val" data-anim-barra="${(p.xp / XP_MAX * 100).toFixed(1)}"></i>
    </div>

    <footer class="escarapela__pie">
      <div class="escarapela__qr" id="${esc(qrId)}" data-qr="${esc(st.id)}"></div>
      <div class="escarapela__nivel-txt">
        <span class="escarapela__rango" style="--c:${p.rango.color}">
          <i class="fa-solid ${p.rango.icon}"></i> ${esc(p.rango.name)}
        </span>
        <small>Nivel ${id.n} de ${MAX_LEVEL} · ${logradas} insignias</small>
      </div>
    </footer>
  </section>`;
}

/** Reverso de la escarapela: retrato de nivel e insignias. */
function reversoHTML(p) {
  const st = p.st;
  const cfg = db.config;
  const id = p.identidad;
  const logradas = p.insignias.filter((b) => b.logrado);

  return `
  <section class="escarapela escarapela--rev" style="--c:${id.color};--c-rgb:${rgb(id.color)}">
    <div class="escarapela__trama"></div>
    <h3 class="rev__t"><i class="fa-solid ${id.icon}"></i> Tu identidad hacker</h3>
    <div class="rev__retrato">
      <img src="${esc(id.retrato)}" alt="Nivel ${id.n}: ${esc(id.nombre)}">
    </div>
    <p class="rev__nombre">${esc(id.nombre)} · <span>Nivel ${id.n}</span></p>

    <div class="rev__stats">
      <div><b>${M.fmt(p.global)}</b><span>Promedio</span></div>
      <div><b>${p.posCurso.pos || '—'}</b><span>Puesto curso</span></div>
      <div><b>${logradas.length}</b><span>Insignias</span></div>
    </div>

    <h4 class="rev__st"><i class="fa-solid fa-award"></i> Insignias conseguidas</h4>
    <div class="rev__insignias">
      ${logradas.length
        ? logradas.slice(0, 10).map((b) => `<span class="rev__ins" style="--c:${b.color}"
            title="${esc(b.name)}"><i class="fa-solid ${b.icon}"></i></span>`).join('')
        : '<p class="rev__vacio">Todavía no tiene insignias.</p>'}
      ${logradas.length > 10 ? `<span class="rev__mas">+${logradas.length - 10}</span>` : ''}
    </div>

    <footer class="rev__pie">
      <p>${esc(cfg.institution)}</p>
      <p class="rev__cod">${esc(st.code)}</p>
    </footer>
  </section>`;
}

/* ================================= ÁLBUM ==================================== */

/**
 * Una tarjeta coleccionable del álbum: una pieza de la colección de equipo
 * hacker (`M.coleccionAlbum(st).lista`), bloqueada o ya desbloqueada según la
 * XP del estudiante. Se muestra igual en el panel del estudiante (su propio
 * álbum) y en el del docente (el de cualquier estudiante del curso), y es lo
 * bastante simple —sin color-mix— para exportarse a PNG con html2canvas sin
 * trucos adicionales.
 * @param {object} o   una pieza de `M.coleccionAlbum(st).lista`
 * @param {object} st  el estudiante dueño del álbum (nombre y código)
 */
function tarjetaAlbumHTML(o, st, opciones = {}) {
  const idAttr = opciones.id ? ` id="${esc(opciones.id)}"` : '';
  const pie = `
    <footer class="album-carta__pie">
      <span class="album-carta__estudiante">${esc(st.name)}</span>
      <span class="album-carta__codigo">${esc(st.code)}</span>
    </footer>`;
  if (!o.alcanzado) {
    return `
    <article class="album-carta album-carta--bloqueada"${idAttr}>
      <div class="album-carta__candado"><i class="fa-solid fa-lock"></i></div>
      <p class="album-carta__pista">Pieza ${o.n} · faltan ${o.faltan} XP</p>
      ${pie}
    </article>`;
  }
  return `
  <article class="album-carta"${idAttr} style="--c:${o.color};--c-rgb:${rgb(o.color)}">
    <div class="album-carta__trama"></div>
    <span class="album-carta__num">Pieza ${String(o.n).padStart(2, '0')} / ${ALBUM_TOTAL}</span>
    <div class="album-carta__retrato album-carta__retrato--icono">
      <i class="fa-solid ${esc(o.icon)}"></i>
    </div>
    <div class="album-carta__info">
      <h3 class="album-carta__nombre">${esc(o.nombre)}</h3>
      <p class="album-carta__lema">${esc(o.lema)}</p>
      <p class="album-carta__recompensa"><i class="fa-solid fa-gift"></i> ${esc(o.desc)}</p>
    </div>
    ${pie}
  </article>`;
}

/**
 * Vista de catálogo de una pieza del álbum: no depende de ningún estudiante,
 * así el docente puede ver la colección completa de las 20 piezas —qué son y
 * cuánta XP piden— aunque todavía nadie la haya desbloqueado por completo.
 * @param {object} o  un objeto de `ALBUM_OBJETOS`, con `xpNecesaria` ya resuelta
 */
function tarjetaAlbumCatalogoHTML(o) {
  return `
  <article class="album-carta" style="--c:${o.color};--c-rgb:${rgb(o.color)}">
    <div class="album-carta__trama"></div>
    <span class="album-carta__num">Pieza ${String(o.n).padStart(2, '0')} / ${ALBUM_TOTAL}</span>
    <div class="album-carta__retrato album-carta__retrato--icono">
      <i class="fa-solid ${esc(o.icon)}"></i>
    </div>
    <div class="album-carta__info">
      <h3 class="album-carta__nombre">${esc(o.nombre)}</h3>
      <p class="album-carta__lema">${esc(o.lema)}</p>
      <p class="album-carta__recompensa"><i class="fa-solid fa-gift"></i> ${esc(o.desc)}</p>
    </div>
    <footer class="album-carta__pie">
      <span class="album-carta__estudiante">XP para desbloquear</span>
      <span class="album-carta__codigo">${o.n === 1 ? '0 XP' : o.xpNecesaria + ' XP'}</span>
    </footer>
  </article>`;
}

/* ================================ INFORME ================================= */

function celdaNota(v) {
  if (v === null || v === undefined) return '<span class="inf-pend">—</span>';
  const d = M.desempeno(v);
  return `<span class="inf-nota" style="--c:${d.color}">${M.fmt(v)}</span>`;
}

/** Detalle de las seis misiones del periodo, con sus cuatro actividades. */
function tablaPeriodo(p, periodo) {
  const sid = p.st.id;
  const w = db.config.weights || {};
  const filas = MISIONES.map((n) => {
    const acts = CATEGORIES.map((c) => {
      const a = (db.activities[periodo] || [])
        .find((x) => x.cat === c.key && Number(x.mision) === n);
      return { cat: c, nota: a ? M.notaDe(sid, a.id) : null, nombre: a ? a.name : c.label };
    });
    const prom = M.promedioMision(sid, periodo, n);
    return `
      <tr>
        <th scope="row" class="inf-mision">
          <b>${n}</b><span>${esc(M.nombreDeMision(periodo, n))}</span>
        </th>
        ${acts.map((a) => `<td class="c">${celdaNota(a.nota)}</td>`).join('')}
        <td class="c inf-total">${celdaNota(prom)}</td>
      </tr>`;
  }).join('');

  const promedios = CATEGORIES.map((c) => M.notaCat(sid, periodo, c.key));
  const total = M.promedioPeriodo(sid, periodo);

  return `
  <table class="inf-tabla">
    <caption>Detalle de misiones y actividades</caption>
    <thead>
      <tr>
        <th scope="col">Misión</th>
        ${CATEGORIES.map((c) => `<th scope="col" class="c">${esc(c.short)}<small>${w[c.key] || 0} %</small></th>`).join('')}
        <th scope="col" class="c">Nota</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
    <tfoot>
      <tr>
        <th scope="row">Promedio por actividad</th>
        ${promedios.map((v) => `<td class="c">${celdaNota(v)}</td>`).join('')}
        <td class="c inf-total">${celdaNota(total)}</td>
      </tr>
    </tfoot>
  </table>`;
}

/** Consolidado: los cuatro periodos con sus promedios por actividad. */
function tablaConsolidada(p) {
  const sid = p.st.id;
  const filas = M.PERIODS.map((x) => {
    const era = M.eraDe(x);
    const v = M.promedioPeriodo(sid, x);
    const d = M.desempeno(v);
    const mis = M.misiones(sid).filter((m) => m.periodo === x);
    const completas = mis.filter((m) => m.hechas === m.total).length;
    return `
      <tr>
        <th scope="row" class="inf-mision"><b>P${x}</b><span>${esc(era.name)}</span></th>
        ${CATEGORIES.map((c) => `<td class="c">${celdaNota(M.notaCat(sid, x, c.key))}</td>`).join('')}
        <td class="c">${completas}/${mis.length}</td>
        <td class="c inf-total">${celdaNota(v)}</td>
        <td class="c">${v === null ? '—' : esc(d.label)}</td>
      </tr>`;
  }).join('');

  const global = p.global;
  return `
  <table class="inf-tabla">
    <caption>Consolidado del año lectivo</caption>
    <thead>
      <tr>
        <th scope="col">Periodo</th>
        ${CATEGORIES.map((c) => `<th scope="col" class="c">${esc(c.short)}</th>`).join('')}
        <th scope="col" class="c">Misiones</th>
        <th scope="col" class="c">Nota</th>
        <th scope="col" class="c">Desempeño</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
    <tfoot>
      <tr>
        <th scope="row">Promedio global</th>
        ${CATEGORIES.map((c) => `<td class="c">${celdaNota(M.promedioCategoria(sid, c.key))}</td>`).join('')}
        <td class="c">${M.avanceDeMisiones(sid).completas}/${M.avanceDeMisiones(sid).total}</td>
        <td class="c inf-total">${celdaNota(global)}</td>
        <td class="c">${global === null ? '—' : esc(M.desempeno(global).label)}</td>
      </tr>
    </tfoot>
  </table>`;
}

/**
 * Informe académico de un estudiante, en hoja carta vertical.
 * @param {object} p        perfil completo
 * @param {number|null} periodo  1-4, o null para el consolidado
 * @param {object} opciones {id}
 */
function boletinHTML(p, periodo, opciones = {}) {
  const st = p.st;
  const cfg = db.config;
  const per = periodo || null;
  const prom = per ? M.promedioPeriodo(st.id, per) : p.global;
  const d = M.desempeno(prom);
  const retro = M.retroalimentacion(st, per);
  const era = per ? M.eraDe(per) : null;
  const av = M.avanceMisiones(st.id);
  const mis = M.avanceDeMisiones(st.id);
  const fechaHoy = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  const idAttr = opciones.id ? ` id="${esc(opciones.id)}"` : '';

  return `
  <article class="boletin"${idAttr} style="--c:${d.color};--c-rgb:${rgb(d.color)}">

    <header class="inf-cab">
      <div class="inf-cab__logo">${esc(cfg.logo || 'CODE')}</div>
      <div class="inf-cab__inst">
        <h2>${esc(cfg.institution)}</h2>
        <p>${esc(cfg.subject)}</p>
        <p class="inf-cab__tipo">
          ${per ? 'Informe académico · Periodo ' + per : 'Informe académico consolidado'}
          · Año lectivo ${esc(cfg.year)}
        </p>
      </div>
      ${era ? `<div class="inf-cab__era"><i class="fa-solid ${era.icon}"></i><span>${esc(era.name)}</span></div>` : ''}
    </header>

    <section class="inf-alumno">
      <img src="${esc(p.avatar)}" alt="" loading="lazy">
      <dl class="inf-datos">
        <div><dt>Estudiante</dt><dd>${esc(st.name)}</dd></div>
        <div><dt>Código</dt><dd class="mono">${esc(st.code)}</dd></div>
        <div><dt>Grado y grupo</dt><dd>${esc(st.grade)}° ${esc(st.group)}</dd></div>
        <div><dt>Nivel alcanzado</dt><dd>${p.identidad.n} de ${MAX_LEVEL} · ${esc(p.identidad.nombre)}</dd></div>
      </dl>
      <div class="inf-nota-final">
        <span class="inf-nota-final__valor">${M.fmt(prom)}</span>
        <span class="inf-nota-final__etq">${esc(d.label)}</span>
      </div>
    </section>

    <section class="inf-resumen">
      <div><b>${mis.completas}/${mis.total}</b><span>Misiones completas</span></div>
      <div><b>${av.hechas}/${av.total}</b><span>Actividades calificadas</span></div>
      <div><b>${p.xp}</b><span>Experiencia (XP)</span></div>
      <div><b>${p.posCurso.pos || '—'} / ${p.posCurso.total}</b><span>Puesto en el curso</span></div>
    </section>

    ${per ? tablaPeriodo(p, per) : tablaConsolidada(p)}

    <section class="inf-retro">
      <h3>Valoración y recomendaciones</h3>
      ${retro.parrafos.map((t) => `<p>${esc(t)}</p>`).join('')}
      ${retro.acciones.length ? `
        <h4>Compromisos para el próximo periodo</h4>
        <ol class="inf-acciones">${retro.acciones.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>` : ''}
    </section>

    <section class="inf-escala">
      <b>Escala de valoración institucional:</b>
      Superior 9.0 – 10.0 · Alto 8.0 – 8.9 · Básico 7.0 – 7.9 · Bajo 0.0 – 6.9 ·
      aprobación desde ${SCALE.pass.toFixed(1)}
    </section>

    <footer class="inf-pie">
      <div class="inf-firma">
        <span class="inf-firma__linea"></span>
        <p>${esc(cfg.teacher || 'Docente responsable')}</p>
        <small>Docente · ${esc(cfg.subject)}</small>
      </div>
      <div class="inf-pie__datos">
        <p><b>${esc(cfg.institution)}</b></p>
        <p>Área: ${esc(cfg.subject)} · Año lectivo ${esc(cfg.year)}</p>
        <p>Expedido el ${esc(fechaHoy)}</p>
      </div>
    </footer>
  </article>`;
}

return { textoQR: textoQR, textoDatos: textoDatos, pintarQREn: pintarQREn, escarapelaHTML: escarapelaHTML, reversoHTML: reversoHTML, tarjetaAlbumHTML: tarjetaAlbumHTML, tarjetaAlbumCatalogoHTML: tarjetaAlbumCatalogoHTML, boletinHTML: boletinHTML, nodoAPNG: nodoAPNG };
})();

/* ---------- vistas/album.js ---------- */
var __M_vistas_album = (function () {
/* ============================================================================
   vistas/album.js — El álbum del estudiante: 20 piezas de equipo hacker
   ----------------------------------------------------------------------------
   Cada tramo de XP que avanzas te regala una pieza para tu equipo hacker —no
   es un retrato de nivel, es una colección propia (M.coleccionAlbum) que
   crece con tu avance real, sin importar en qué nivel estés. Una vez
   desbloqueada, la pieza se puede ver en grande y descargar como imagen para
   el cuaderno.
   ========================================================================== */

const { $, $$, el, modal, toast, animarBarras, descargar } = __M_ui;
const T = __M_tarjeta;
const { ALBUM_TOTAL } = __M_config;
function verGrande(x, st) {
  const cuerpo = el('div', { class: 'album-grande' },
    el('div', { class: 'album-grande__tarjeta', html: T.tarjetaAlbumHTML(x, st, { id: 'album-carta-grande' }) }),
    el('p', {
      class: 'album-grande__desc',
      text: x.alcanzado ? x.desc : 'Te faltan ' + x.faltan + ' XP · ' + x.reto
    }),
    x.alcanzado ? el('div', { class: 'album-grande__botones' },
      el('button', {
        class: 'btn',
        onclick: async (e) => {
          const boton = e.currentTarget;
          boton.disabled = true;
          try {
            const nodo = document.getElementById('album-carta-grande');
            descargar(await T.nodoAPNG(nodo, 3), 'album-pieza-' + x.n + '-' + x.slug + '.png');
            toast('Tarjeta descargada', 'album-pieza-' + x.n + '-' + x.slug + '.png', 'ok');
          } catch (err) {
            toast('No se pudo generar la imagen', String(err.message || err), 'err');
          } finally { boton.disabled = false; }
        }
      }, el('i', { class: 'fa-solid fa-image' }), ' Descargar imagen')
    ) : null);

  modal({
    titulo: 'Pieza ' + x.n + ' · ' + x.nombre,
    subtitulo: x.alcanzado ? 'Tarjeta coleccionada' : 'Todavía bloqueada',
    ancho: '420px',
    cuerpo
  });
}

function render(p, cont) {
  const lista = p.coleccion.lista;
  const logradas = lista.filter((x) => x.alcanzado).length;

  cont.innerHTML = `
  <div class="cab-vista">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-images"></i> Álbum de equipo hacker</h1>
      <p class="cab-vista__s">Cada tramo de XP que avanzas te regala una pieza para tu equipo.
        Tócala para verla en grande y descargarla.</p>
    </div>
    <div class="cab-vista__acciones">
      <button class="btn btn--ghost" id="al-print"><i class="fa-solid fa-print"></i> Imprimir hoja</button>
    </div>
  </div>

  <section class="tarjeta">
    <div class="album-resumen no-print">
      <span class="album-resumen__marca"><b>${logradas}</b> / ${ALBUM_TOTAL} piezas coleccionadas</span>
      <span class="barra"><i class="barra__val" data-anim-barra="${(logradas / ALBUM_TOTAL * 100).toFixed(1)}"></i></span>
    </div>
    <div class="album-rejilla">
      ${lista.map((x) => `<div data-n="${x.n}">${T.tarjetaAlbumHTML(x, p.st)}</div>`).join('')}
    </div>
  </section>
  `;

  animarBarras(cont);

  $('#al-print', cont).addEventListener('click', () => window.print());

  $$('[data-n]', cont).forEach((n) => n.addEventListener('click', () => {
    verGrande(lista.find((x) => x.n === Number(n.dataset.n)), p.st);
  }));
}

return { render: render };
})();

/* ---------- vistas/boletines.js ---------- */
var __M_vistas_boletines = (function () {
/* ============================================================================
   vistas/boletines.js — Avisos del docente y boletín con retroalimentación
   ========================================================================== */

const { $, $$, esc, rgb, animarBarras, toast, fecha, descargar } = __M_ui;
const M = __M_motor;
const T = __M_tarjeta;
const { TIPOS_AVISO } = __M_config;
let periodoSel = 'global';

const TIPO = Object.fromEntries(TIPOS_AVISO.map((t) => [t.key, t]));

function avisosHTML(p) {
  const avisos = M.avisosDe(p.st);
  if (!avisos.length) {
    return `<div class="vacio"><i class="fa-solid fa-inbox"></i>
      <h4>Sin avisos</h4><p>Cuando tu docente publique un aviso, aparecerá aquí.</p></div>`;
  }
  return `<ul class="avisos">${avisos.map((a) => {
    const t = TIPO[a.tipo] || TIPO.info;
    const dirigido = a.alcance && (a.alcance.code || a.alcance.grade || a.alcance.group);
    return `
    <li class="aviso" style="--c:${t.color};--c-rgb:${rgb(t.color)}">
      <span class="aviso__ico"><i class="fa-solid ${t.icon}"></i></span>
      <div class="aviso__cuerpo">
        <div class="aviso__cab">
          <h3>${esc(a.titulo || t.label)}</h3>
          <span class="pill pill--mini" style="--c:${t.color}">${esc(t.label)}</span>
          ${dirigido ? '<span class="pill pill--mini"><i class="fa-solid fa-user-check"></i> Para ti</span>' : ''}
        </div>
        <p>${esc(a.texto || '')}</p>
        <p class="aviso__fecha"><i class="fa-regular fa-calendar"></i> ${esc(fecha(a.fecha))}</p>
      </div>
    </li>`;
  }).join('')}</ul>`;
}

async function descargarPNG(p) {
  const nodo = $('#boletin');
  if (!nodo) return;
  toast('Generando imagen…', 'Un momento.', 'info', 1800);
  try {
    const nombre = 'boletin-' + p.st.code + '-' +
      (periodoSel === 'global' ? 'consolidado' : 'p' + periodoSel) + '.png';
    descargar(await T.nodoAPNG(nodo, 2), nombre);
    toast('Boletín descargado', nombre, 'ok');
  } catch (e) {
    toast('No se pudo generar la imagen', String(e.message || e), 'err');
  }
}

function render(p, cont) {
  const boletin = () => T.boletinHTML(p, periodoSel === 'global' ? null : Number(periodoSel), { id: 'boletin' });

  cont.innerHTML = `
  <div class="cab-vista">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-envelope-open-text"></i> Boletines y avisos</h1>
      <p class="cab-vista__s">Tu informe por periodo y los mensajes que publica tu docente.</p>
    </div>
    <div class="cab-vista__acciones">
      <button class="btn btn--ghost" id="b-print"><i class="fa-solid fa-print"></i> Imprimir</button>
      <button class="btn" id="b-png"><i class="fa-solid fa-image"></i> Descargar PNG</button>
    </div>
  </div>

  <section class="tarjeta no-print">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-bullhorn"></i> Avisos</h2>
      <span class="pill">${M.avisosDe(p.st).length} publicados</span>
    </header>
    ${avisosHTML(p)}
  </section>

  <div class="pestanas no-print" id="pestanas">
    <button class="pestana" data-per="global">Consolidado</button>
    ${M.PERIODS.map((x) => `<button class="pestana" data-per="${x}">Periodo ${x}</button>`).join('')}
  </div>

  <div id="zona-boletin">${boletin()}</div>
  `;

  const marcar = () => $$('.pestana', cont).forEach((b) =>
    b.classList.toggle('is-on', b.dataset.per === String(periodoSel)));
  marcar();

  $$('.pestana', cont).forEach((b) => b.addEventListener('click', () => {
    periodoSel = b.dataset.per;
    marcar();
    const z = $('#zona-boletin', cont);
    z.innerHTML = boletin();
    z.classList.remove('entra'); void z.offsetWidth; z.classList.add('entra');
    animarBarras(cont);
  }));

  $('#b-print', cont).addEventListener('click', () => window.print());
  $('#b-png', cont).addEventListener('click', () => descargarPNG(p));

  animarBarras(cont);
}

return { render: render };
})();

/* ---------- vistas/comparativa.js ---------- */
var __M_vistas_comparativa = (function () {
/* ============================================================================
   vistas/comparativa.js — Tu avance frente al promedio del curso
   ========================================================================== */

const { $, $$, esc, rgb, contar, animarBarras, toast } = __M_ui;
const { db } = __M_datos;
const G = __M_graficas;
const M = __M_motor;
const { CATEGORIES, PERFORMANCE, SCALE } = __M_config;
let ambito = 'curso';   // curso | grado | academia

function grupoDe(st) {
  if (ambito === 'grado') return db.students.filter((s) => s.grade === st.grade);
  if (ambito === 'academia') return db.students.slice();
  return db.students.filter((s) => s.grade === st.grade && s.group === st.group);
}

function etiquetaAmbito(st) {
  if (ambito === 'grado') return 'Grado ' + st.grade + '°';
  if (ambito === 'academia') return 'Toda la academia';
  return 'Curso ' + st.grade + '° ' + st.group;
}

function delta(a, b) {
  if (a === null || b === null) return null;
  return a - b;
}

function chipDelta(d) {
  if (d === null) return '<span class="pill pill--mini">sin datos</span>';
  const arriba = d >= 0;
  return `<span class="pill pill--mini" style="--c:${arriba ? '#34d399' : '#f87171'}">
    <i class="fa-solid fa-${arriba ? 'arrow-up' : 'arrow-down'}"></i>
    ${arriba ? '+' : ''}${M.fmt(d, 2)}</span>`;
}

function pintar(p) {
  if (!G.hayChart()) {
    toast('Gráficas no disponibles', 'No se pudo cargar Chart.js.', 'warn');
    return;
  }
  const sid = p.st.id;
  const grupo = grupoDe(p.st);

  G.linea('c-evolucion', M.PERIODS.map((x) => 'Periodo ' + x), [
    { label: 'Tú', color: '#22d3ee', datos: M.PERIODS.map((x) => M.redondear(M.promedioPeriodo(sid, x), 2)) },
    {
      label: etiquetaAmbito(p.st), color: '#a855f7', punteada: true, relleno: false,
      datos: M.PERIODS.map((x) => M.redondear(M.promedioDe(grupo, x), 2))
    }
  ]);

  G.radar('c-radar', CATEGORIES.map((c) => c.short), [
    { label: 'Tú', color: '#22d3ee', datos: CATEGORIES.map((c) => M.redondear(M.promedioCategoria(sid, c.key), 2)) },
    {
      label: etiquetaAmbito(p.st), color: '#a855f7', punteada: true, opacidad: 0.12,
      datos: CATEGORIES.map((c) => M.redondear(M.promedioCatDe(grupo, c.key), 2))
    }
  ]);

  G.barras('c-categorias', CATEGORIES.map((c) => c.label), [
    { label: 'Tú', color: '#22d3ee', datos: CATEGORIES.map((c) => M.redondear(M.promedioCategoria(sid, c.key), 2)) },
    { label: etiquetaAmbito(p.st), color: '#a855f7', datos: CATEGORIES.map((c) => M.redondear(M.promedioCatDe(grupo, c.key), 2)) }
  ], { grosor: 26 });

  /* Distribución de desempeños del grupo */
  const reparto = PERFORMANCE.map((d) => grupo.filter((s) => {
    const v = M.promedioGlobal(s.id);
    return v !== null && M.desempeno(v).key === d.key;
  }).length);
  const miDes = p.global === null ? null : M.desempeno(p.global).key;
  G.barras('c-reparto', PERFORMANCE.map((d) => d.label), [{
    label: 'Reclutas',
    color: PERFORMANCE.map((d) => (d.key === miDes ? d.color : '#475569')),
    datos: reparto
  }], {
    escala: { min: 0, max: Math.max(1, Math.max(...reparto) + 1), paso: 1 },
    grosor: 46
  });
}

function render(p, cont) {
  const st = p.st;
  const grupo = grupoDe(st);
  const promGrupo = M.promedioDe(grupo);
  const d = delta(p.global, promGrupo);
  const pos = M.posicionEn(grupo, st.id);
  const percentil = pos.pos ? Math.round((1 - (pos.pos - 1) / Math.max(1, pos.total)) * 100) : 0;

  const filasPeriodo = M.PERIODS.map((x) => {
    const mio = M.promedioPeriodo(st.id, x);
    const suyo = M.promedioDe(grupo, x);
    const dd = delta(mio, suyo);
    const era = M.eraDe(x);
    return `
      <tr>
        <td><span class="celda-ico" style="--c:${era.color}"><i class="fa-solid ${era.icon}"></i></span>
            <div><b>Periodo ${x}</b><small>${esc(era.name)}</small></div></td>
        <td class="c"><b>${M.fmt(mio)}</b></td>
        <td class="c">${M.fmt(suyo)}</td>
        <td class="c">${chipDelta(dd)}</td>
        <td class="oculta-mv">
          <div class="dual">
            <i class="dual__a" data-anim-barra="${mio === null ? 0 : (mio / SCALE.max * 100).toFixed(1)}"></i>
            <i class="dual__b" data-anim-barra="${suyo === null ? 0 : (suyo / SCALE.max * 100).toFixed(1)}"></i>
          </div>
        </td>
      </tr>`;
  }).join('');

  cont.innerHTML = `
  <div class="cab-vista">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-scale-balanced"></i> Comparativa de curso</h1>
      <p class="cab-vista__s">Tu progreso frente al promedio de tus compañeros. Solo se muestran promedios, nunca notas ajenas.</p>
    </div>
    <label class="selector">
      <span>Comparar con</span>
      <select id="sel-ambito">
        <option value="curso">Mi curso · ${esc(st.grade)}° ${esc(st.group)}</option>
        <option value="grado">Mi grado · ${esc(st.grade)}°</option>
        <option value="academia">Toda la academia</option>
      </select>
    </label>
  </div>

  <div class="kpis kpis--4">
    <article class="kpi" style="--c:#22d3ee;--c-rgb:${rgb('#22d3ee')}">
      <div class="kpi__ico"><i class="fa-solid fa-user"></i></div>
      <div class="kpi__cuerpo">
        <p class="kpi__valor" data-contar="${p.global === null ? 0 : p.global}" data-dec="1">0</p>
        <p class="kpi__etq">Tu promedio</p>
        <p class="kpi__extra">Desempeño ${esc(p.desempeno.label)}</p>
      </div>
    </article>
    <article class="kpi" style="--c:#a855f7;--c-rgb:${rgb('#a855f7')}">
      <div class="kpi__ico"><i class="fa-solid fa-users"></i></div>
      <div class="kpi__cuerpo">
        <p class="kpi__valor" data-contar="${promGrupo === null ? 0 : promGrupo}" data-dec="1">0</p>
        <p class="kpi__etq" id="etq-grupo">Promedio · ${esc(etiquetaAmbito(st))}</p>
        <p class="kpi__extra">${grupo.length} reclutas</p>
      </div>
    </article>
    <article class="kpi" style="--c:${d !== null && d >= 0 ? '#34d399' : '#f87171'};--c-rgb:${rgb(d !== null && d >= 0 ? '#34d399' : '#f87171')}">
      <div class="kpi__ico"><i class="fa-solid fa-arrows-up-down"></i></div>
      <div class="kpi__cuerpo">
        <p class="kpi__valor" data-contar="${d === null ? 0 : d}" data-dec="2">0</p>
        <p class="kpi__etq">Diferencia</p>
        <p class="kpi__extra">${d === null ? 'Sin datos suficientes'
          : (d >= 0 ? 'Estás por encima del promedio' : 'Estás por debajo del promedio')}</p>
      </div>
    </article>
    <article class="kpi" style="--c:#fbbf24;--c-rgb:${rgb('#fbbf24')}">
      <div class="kpi__ico"><i class="fa-solid fa-ranking-star"></i></div>
      <div class="kpi__cuerpo">
        <p class="kpi__valor" data-contar="${percentil}" data-sufijo="%">0</p>
        <p class="kpi__etq">Percentil</p>
        <p class="kpi__extra">Puesto ${pos.pos || '—'} de ${pos.total}</p>
      </div>
    </article>
  </div>

  <div class="rejilla rejilla--2">
    <section class="tarjeta">
      <header class="tarjeta__head">
        <h2><i class="fa-solid fa-chart-line"></i> Tú frente al grupo, periodo a periodo</h2>
      </header>
      <div class="lienzo" style="height:300px"><canvas id="c-evolucion"></canvas></div>
    </section>
    <section class="tarjeta">
      <header class="tarjeta__head">
        <h2><i class="fa-solid fa-satellite-dish"></i> Perfil comparado</h2>
      </header>
      <div class="lienzo" style="height:300px"><canvas id="c-radar"></canvas></div>
    </section>
  </div>

  <div class="rejilla rejilla--2">
    <section class="tarjeta">
      <header class="tarjeta__head">
        <h2><i class="fa-solid fa-chart-column"></i> Por categoría</h2>
      </header>
      <div class="lienzo" style="height:290px"><canvas id="c-categorias"></canvas></div>
    </section>
    <section class="tarjeta">
      <header class="tarjeta__head">
        <h2><i class="fa-solid fa-layer-group"></i> Dónde está cada quien</h2>
        <span class="pill">Tu franja va resaltada</span>
      </header>
      <div class="lienzo" style="height:290px"><canvas id="c-reparto"></canvas></div>
    </section>
  </div>

  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-table-columns"></i> Tabla comparativa</h2>
      <span class="pill" id="pill-ambito">${esc(etiquetaAmbito(st))}</span>
    </header>
    <div class="tabla-wrap">
      <table class="tabla">
        <thead><tr><th>Periodo</th><th class="c">Tú</th><th class="c">Grupo</th>
          <th class="c">Diferencia</th><th class="oculta-mv">Comparación</th></tr></thead>
        <tbody id="tb-comparativa">${filasPeriodo}</tbody>
      </table>
    </div>
    <p class="nota-pie"><i class="fa-solid fa-shield-halved"></i>
      Esta vista respeta la privacidad: nunca muestra la nota individual de otro estudiante.</p>
  </section>
  `;

  $$('[data-contar]', cont).forEach((n) => contar(n, Number(n.dataset.contar), {
    dec: Number(n.dataset.dec || 0), sufijo: n.dataset.sufijo || ''
  }));
  animarBarras(cont);

  const sel = $('#sel-ambito', cont);
  sel.value = ambito;
  sel.addEventListener('change', () => {
    ambito = sel.value;
    render(p, cont);
  });

  pintar(p);
}

function limpiar() {
  ['c-evolucion', 'c-radar', 'c-categorias', 'c-reparto'].forEach(G.destruir);
}

return { render: render, limpiar: limpiar };
})();

/* ---------- vistas/escarapela.js ---------- */
var __M_vistas_escarapela = (function () {
/* ============================================================================
   vistas/escarapela.js — Credencial digital del estudiante: cara, reverso y QR
   ========================================================================== */

const { $, $$, animarBarras, toast, descargar, copiar } = __M_ui;
const T = __M_tarjeta;
async function descargarPNG(p) {
  const nodo = $('#escarapela-cara');
  if (!nodo) return;
  const tarjeta = $('#tarjeta');
  const volteada = tarjeta.classList.contains('is-flip');
  if (volteada) tarjeta.classList.remove('is-flip');
  toast('Generando escarapela…', 'Un momento.', 'info', 1600);
  try {
    await new Promise((r) => setTimeout(r, 420));
    descargar(await T.nodoAPNG(nodo, 3), 'escarapela-' + p.st.code + '.png');
    toast('Escarapela descargada', 'escarapela-' + p.st.code + '.png', 'ok');
  } catch (e) {
    toast('No se pudo generar la imagen', String(e.message || e), 'err');
  } finally {
    if (volteada) tarjeta.classList.add('is-flip');
  }
}

function render(p, cont) {
  cont.innerHTML = `
  <div class="cab-vista">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-address-card"></i> Escarapela digital</h1>
      <p class="cab-vista__s">Tu credencial de recluta. Tócala para ver el reverso con tus logros.</p>
    </div>
    <div class="cab-vista__acciones">
      <button class="btn btn--ghost" id="e-flip"><i class="fa-solid fa-rotate"></i> Voltear</button>
      <button class="btn btn--ghost" id="e-print"><i class="fa-solid fa-print"></i> Imprimir</button>
      <button class="btn" id="e-png"><i class="fa-solid fa-download"></i> Descargar PNG</button>
    </div>
  </div>

  <div class="escarapela-zona">
    <div class="tarjeta3d" id="tarjeta">
      <div class="tarjeta3d__interior">
        ${T.escarapelaHTML(p, { id: 'escarapela-cara', qrId: 'qr' })}
        ${T.reversoHTML(p)}
      </div>
    </div>

    <aside class="escarapela-info">
      <section class="tarjeta">
        <header class="tarjeta__head"><h2><i class="fa-solid fa-circle-info"></i> Sobre tu credencial</h2></header>
        <ul class="lista-info">
          <li><i class="fa-solid fa-qrcode"></i><div><b>Código QR</b>
            <span>Contiene tu nombre, código, curso, nivel hacker y XP.</span></div></li>
          <li><i class="fa-solid fa-rotate"></i><div><b>Dos caras</b>
            <span>Al frente tu identidad; detrás, tu retrato de nivel y tus insignias.</span></div></li>
          <li><i class="fa-solid fa-arrow-up-right-dots"></i><div><b>Cambia contigo</b>
            <span>Al subir de nivel, tu avatar y tu retrato se transforman solos.</span></div></li>
          <li><i class="fa-solid fa-download"></i><div><b>Descarga en PNG</b>
            <span>Sale a triple resolución, lista para imprimir o usar como foto de perfil.</span></div></li>
        </ul>
        <button class="btn btn--ghost btn--ancho" id="e-copiar">
          <i class="fa-solid fa-copy"></i> Copiar mis datos
        </button>
      </section>
    </aside>
  </div>
  `;

  T.pintarQREn($('#qr', cont), p);
  animarBarras(cont);

  const tarjeta = $('#tarjeta', cont);
  const voltear = () => tarjeta.classList.toggle('is-flip');
  tarjeta.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;
    voltear();
  });
  $('#e-flip', cont).addEventListener('click', voltear);
  $('#e-print', cont).addEventListener('click', () => window.print());
  $('#e-png', cont).addEventListener('click', () => descargarPNG(p));
  $('#e-copiar', cont).addEventListener('click', () => {
    copiar(T.textoDatos(p)).then(() => toast('Datos copiados', 'Ya puedes pegarlos donde quieras.', 'ok'));
  });

  $$('img', cont).forEach((img) => img.addEventListener('error', () => { img.style.visibility = 'hidden'; }));
}

return { render: render };
})();

/* ---------- vistas/estadisticas.js ---------- */
var __M_vistas_estadisticas = (function () {
/* ============================================================================
   vistas/estadisticas.js — Rendimiento, rachas y cumplimiento de misiones
   ========================================================================== */

const { $, $$, esc, rgb, contar, animarBarras, toast } = __M_ui;
const G = __M_graficas;
const M = __M_motor;
const { CATEGORIES, PERFORMANCE, SCALE } = __M_config;
let periodoSel = 'global';

function tarjetaGrafica(id, titulo, icono, extra = '', alto = 280) {
  return `
    <section class="tarjeta">
      <header class="tarjeta__head">
        <h2><i class="fa-solid ${icono}"></i> ${esc(titulo)}</h2>
        ${extra}
      </header>
      <div class="lienzo" style="height:${alto}px"><canvas id="${id}"></canvas></div>
    </section>`;
}

function tablaMisiones(p) {
  const filas = M.misiones(p.st.id).filter((m) => m.existe).map((m) => {
    const d = M.desempeno(m.promedio);
    const color = m.promedio === null ? '#64748b' : d.color;
    return `
      <tr>
        <td><span class="celda-ico" style="--c:${m.era.color}"><i class="fa-solid ${m.era.icon}"></i></span>
            <div><b>${esc(m.nombre)}</b><small>Periodo ${m.periodo} · misión ${m.mision}</small></div></td>
        <td class="c">${m.hechas}/${m.total}</td>
        <td class="c"><b style="color:${color}">${m.promedio === null ? 'Pendiente' : M.fmt(m.promedio)}</b></td>
        <td class="c"><span class="pill pill--mini" style="--c:${color}">${m.promedio === null ? '—' : esc(d.label)}</span></td>
        <td class="oculta-mv">
          <div class="barra barra--mini"><i class="barra__val"
            data-anim-barra="${m.promedio === null ? 0 : (m.promedio / SCALE.max * 100).toFixed(1)}"
            style="background:${color}"></i></div>
        </td>
      </tr>`;
  }).join('');

  const mis = M.avanceDeMisiones(p.st.id);
  return `
    <section class="tarjeta">
      <header class="tarjeta__head">
        <h2><i class="fa-solid fa-table-list"></i> Detalle de misiones</h2>
        <span class="pill">${mis.completas} / ${mis.total} completas</span>
      </header>
      <div class="tabla-wrap">
        <table class="tabla">
          <thead><tr><th>Misión</th><th class="c">Actividades</th><th class="c">Nota</th>
            <th class="c">Desempeño</th><th class="oculta-mv">Avance</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    </section>`;
}

function pintarTodo(p) {
  if (!G.hayChart()) {
    toast('Gráficas no disponibles', 'No se pudo cargar Chart.js. Revisa tu conexión o la carpeta assets/vendor.', 'warn');
    return;
  }
  const sid = p.st.id;

  /* 1. Evolución por periodo -------------------------------------------- */
  G.linea('g-evolucion',
    M.PERIODS.map((x) => 'Periodo ' + x),
    [{
      label: 'Tu promedio',
      color: '#22d3ee',
      datos: M.PERIODS.map((x) => M.redondear(M.promedioPeriodo(sid, x), 2))
    }, {
      label: 'Nota de aprobación',
      color: '#f87171',
      punteada: true,
      relleno: false,
      datos: M.PERIODS.map(() => SCALE.pass)
    }]);

  /* 2. Radar de categorías ---------------------------------------------- */
  const datosRadar = CATEGORIES.map((c) => periodoSel === 'global'
    ? M.redondear(M.promedioCategoria(sid, c.key), 2)
    : M.redondear(M.notaCat(sid, Number(periodoSel), c.key), 2));
  G.radar('g-radar', CATEGORIES.map((c) => c.short), [
    { label: 'Tú', color: '#a855f7', datos: datosRadar }
  ]);

  /* 3. Nota de cada misión ---------------------------------------------- */
  const misiones = M.misiones(sid).filter((m) => m.existe &&
    (periodoSel === 'global' ? true : m.periodo === Number(periodoSel)));
  G.barras('g-misiones',
    misiones.map((m) => (periodoSel === 'global' ? 'P' + m.periodo + '·' : '') + 'M' + m.mision),
    [{
      label: 'Nota de la misión',
      color: misiones.map((m) => m.promedio === null ? '#475569' : M.desempeno(m.promedio).color),
      datos: misiones.map((m) => m.promedio === null ? 0 : M.redondear(m.promedio, 2))
    }],
    { grosor: 34 });

  /* 4. Reparto de desempeños -------------------------------------------- */
  const conNota = M.actividades(sid).filter((m) => m.existe && m.nota !== null);
  const conteo = PERFORMANCE.map((d) => conNota.filter((m) => M.desempeno(m.nota).key === d.key).length);
  const pendientes = M.actividades(sid).filter((m) => m.existe && m.nota === null).length;
  G.rosquilla('g-desempenos',
    PERFORMANCE.map((d) => d.label).concat('Pendientes'),
    conteo.concat(pendientes),
    PERFORMANCE.map((d) => d.color).concat('#475569'));
}

function render(p, cont) {
  const r = p.racha;
  const pctPend = p.avance.total ? Math.round((1 - p.avance.pct) * 100) : 0;

  cont.innerHTML = `
  <div class="cab-vista">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-chart-line"></i> Estadísticas y reportes</h1>
      <p class="cab-vista__s">Todo lo que ves sale de las notas registradas por tu docente.</p>
    </div>
    <label class="selector">
      <span>Periodo</span>
      <select id="sel-periodo">
        <option value="global">Consolidado del año</option>
        ${M.PERIODS.map((x) => `<option value="${x}">Periodo ${x} · ${esc(M.eraDe(x).name)}</option>`).join('')}
      </select>
    </label>
  </div>

  <div class="kpis kpis--4">
    <article class="kpi" style="--c:#22d3ee;--c-rgb:${rgb('#22d3ee')}">
      <div class="kpi__ico"><i class="fa-solid fa-star"></i></div>
      <div class="kpi__cuerpo">
        <p class="kpi__valor" data-contar="${p.global === null ? 0 : p.global}" data-dec="1">0</p>
        <p class="kpi__etq">Promedio global</p>
        <p class="kpi__extra">Aprobación desde ${SCALE.pass.toFixed(1)}</p>
      </div>
    </article>
    <article class="kpi" style="--c:#fb923c;--c-rgb:${rgb('#fb923c')}">
      <div class="kpi__ico"><i class="fa-solid fa-fire"></i></div>
      <div class="kpi__cuerpo">
        <p class="kpi__valor" data-contar="${r.mejor}">0</p>
        <p class="kpi__etq">Mejor racha de entregas</p>
        <p class="kpi__extra">${r.viva} seguidas ahora mismo</p>
      </div>
    </article>
    <article class="kpi" style="--c:#34d399;--c-rgb:${rgb('#34d399')}">
      <div class="kpi__ico"><i class="fa-solid fa-list-check"></i></div>
      <div class="kpi__cuerpo">
        <p class="kpi__valor" data-contar="${Math.round(p.avance.pct * 100)}" data-sufijo="%">0</p>
        <p class="kpi__etq">Cumplimiento de actividades</p>
        <p class="kpi__extra">${pctPend}% aún sin entregar</p>
      </div>
    </article>
    <article class="kpi" style="--c:#a855f7;--c-rgb:${rgb('#a855f7')}">
      <div class="kpi__ico"><i class="fa-solid fa-bolt"></i></div>
      <div class="kpi__cuerpo">
        <p class="kpi__valor" data-contar="${p.xp}">0</p>
        <p class="kpi__etq">Experiencia acumulada</p>
        <p class="kpi__extra">Nivel ${p.nivelInfo.nivel}</p>
      </div>
    </article>
  </div>

  <div class="rejilla rejilla--2">
    ${tarjetaGrafica('g-evolucion', 'Evolución por periodo', 'fa-arrow-trend-up',
      '<span class="pill">Escala 0 – 10</span>')}
    ${tarjetaGrafica('g-radar', 'Perfil por categoría', 'fa-satellite-dish',
      '<span class="pill" id="pill-radar">Consolidado</span>')}
  </div>

  <div class="rejilla rejilla--2-1">
    ${tarjetaGrafica('g-misiones', 'Nota de cada misión', 'fa-chart-column',
      '<span class="pill" id="pill-mis">Consolidado</span>', 300)}
    ${tarjetaGrafica('g-desempenos', 'Reparto de desempeños', 'fa-chart-pie', '', 300)}
  </div>

  ${tablaMisiones(p)}
  `;

  $$('[data-contar]', cont).forEach((n) => contar(n, Number(n.dataset.contar), {
    dec: Number(n.dataset.dec || 0), sufijo: n.dataset.sufijo || ''
  }));
  animarBarras(cont);

  const sel = $('#sel-periodo', cont);
  sel.value = periodoSel;
  sel.addEventListener('change', () => {
    periodoSel = sel.value;
    const etq = periodoSel === 'global' ? 'Consolidado' : 'Periodo ' + periodoSel;
    const a = $('#pill-radar', cont); if (a) a.textContent = etq;
    const b = $('#pill-mis', cont); if (b) b.textContent = etq;
    pintarTodo(p);
  });

  pintarTodo(p);
}

function limpiar() {
  ['g-evolucion', 'g-radar', 'g-misiones', 'g-desempenos'].forEach(G.destruir);
}

return { render: render, limpiar: limpiar };
})();

/* ---------- vistas/niveles.js ---------- */
var __M_vistas_niveles = (function () {
/* ============================================================================
   vistas/niveles.js — La escalera hacker: identidad actual y los 10 niveles
   ========================================================================== */

const { $$, el, esc, rgb, contar, animarBarras, modal } = __M_ui;
const M = __M_motor;
const { XP_MAX, XP_PER_LEVEL, MAX_LEVEL, XP_META, PROMEDIO_META, MISIONES_TOTALES } = __M_config;
function fichaNivel(x) {
  return el('div', { class: 'ndetalle', style: { '--c': x.color, '--c-rgb': rgb(x.color) } },
    el('div', { class: 'ndetalle__retrato' + (x.alcanzado ? ' is-on' : '') },
      el('img', { src: x.retrato, alt: 'Nivel ' + x.n + ': ' + x.nombre, loading: 'lazy' }),
      !x.alcanzado ? el('span', { class: 'ndetalle__candado' }, el('i', { class: 'fa-solid fa-lock' })) : null),
    el('div', { class: 'ndetalle__info' },
      el('p', { class: 'ndetalle__lema', text: x.lema }),
      el('p', { class: 'ndetalle__desc', text: x.desc }),
      el('dl', { class: 'ficha' },
        el('dt', { text: 'Nivel' }), el('dd', { text: x.n + ' de ' + MAX_LEVEL }),
        el('dt', { text: 'XP para entrar' }), el('dd', { text: String(x.xpNecesaria) }),
        el('dt', { text: 'Equivale a un promedio de' }),
        el('dd', { text: M.fmt(M.promedioParaNivel(x.n)) + ' en las ' + MISIONES_TOTALES + ' misiones' }),
        el('dt', { text: 'Estado' }),
        el('dd', { text: x.esActual ? 'Es tu nivel actual' : (x.alcanzado ? 'Superado' : 'Bloqueado') })),
      x.alcanzado
        ? el('p', {
            class: 'ndetalle__ok',
            html: '<i class="fa-solid fa-circle-check"></i> Ya pasaste por aquí: esta identidad es tuya.'
          })
        : el('div', {
            class: 'ndetalle__falta',
            html: '<p>Te faltan <b>' + x.faltan + ' XP</b> para desbloquearlo.</p>' +
                  '<p class="ndetalle__reto"><i class="fa-solid fa-flag-checkered"></i> ' + esc(x.reto) + '</p>'
          })));
}

function render(p, cont) {
  const e = p.escalera;
  const yo = e.actual;
  const sig = e.siguiente;
  const nv = p.nivelInfo;
  const porPeriodo = M.xpPorPeriodo(p.st.id);
  const maxPeriodo = Math.max(1, ...porPeriodo.map((x) => x.xp));

  const escalones = e.lista.map((x) => `
    <button class="ncard ${x.alcanzado ? 'is-on' : 'is-off'} ${x.esActual ? 'is-actual' : ''}"
            data-n="${x.n}" style="--c:${x.color};--c-rgb:${rgb(x.color)}">
      <span class="ncard__num">${String(x.n).padStart(2, '0')}</span>
      ${x.esActual ? '<span class="ncard__aqui">Estás aquí</span>' : ''}
      <span class="ncard__marco">
        <img src="${esc(x.avatar)}" alt="Nivel ${x.n}: ${esc(x.nombre)}" loading="lazy">
        ${x.alcanzado ? '' : '<span class="ncard__lock"><i class="fa-solid fa-lock"></i></span>'}
      </span>
      <span class="ncard__nombre">${esc(x.nombre)}</span>
      <span class="ncard__lema">${esc(x.lema)}</span>
      <span class="ncard__xp">${x.alcanzado
        ? '<i class="fa-solid fa-check"></i> Superado'
        : x.xpNecesaria + ' XP · prom. ' + M.fmt(M.promedioParaNivel(x.n))}</span>
      <span class="barra barra--mini"><i class="barra__val" data-anim-barra="${(x.progreso * 100).toFixed(1)}"></i></span>
    </button>`).join('');

  cont.innerHTML = `
  <section class="hacker" style="--c:${yo.color};--c-rgb:${rgb(yo.color)}">
    <div class="hacker__retrato">
      <div class="hacker__halo"></div>
      <img src="${esc(yo.retrato)}" alt="Nivel ${yo.n}: ${esc(yo.nombre)}">
      <span class="hacker__anim" style="--c:${p.animo.color}">
        <i class="fa-solid ${p.animo.icon}"></i>${esc(p.animo.label)}
      </span>
    </div>

    <div class="hacker__texto">
      <p class="hacker__eyebrow"><i class="fa-solid ${yo.icon}"></i> Nivel ${yo.n} de ${MAX_LEVEL} · tu identidad hacker</p>
      <h1 class="hacker__nombre">${esc(yo.nombre)}</h1>
      <p class="hacker__lema">${esc(yo.lema)}</p>
      <p class="hacker__desc">${esc(yo.desc)}</p>
      <p class="hacker__animo">${esc(p.animo.line)}</p>

      <div class="hacker__contador">
        <div><b data-contar="${p.xp}">0</b><span>XP acumulada</span></div>
        <div><b data-contar="${yo.n}">0</b><span>nivel actual</span></div>
        <div><b data-contar="${Math.round(e.progresoTotal * 100)}" data-sufijo="%">0</b><span>del máximo</span></div>
      </div>

      <div class="barra"><i class="barra__val" data-anim-barra="${(nv.pct * 100).toFixed(1)}"
           style="background:linear-gradient(90deg, ${yo.color}, var(--acento-2))"></i></div>
      <p class="hacker__meta">${nv.tope
        ? 'Estás en el nivel máximo: ' + p.xp + ' de ' + XP_MAX + ' XP posibles.'
        : nv.enNivel + ' / ' + XP_PER_LEVEL + ' XP dentro del nivel ' + yo.n +
          ' · el nivel ' + MAX_LEVEL + ' se abre con ' + (XP_PER_LEVEL * (MAX_LEVEL - 1)) + ' XP.'}</p>

      ${sig ? `
      <div class="hacker__siguiente" style="--c:${sig.color}">
        <img src="${esc(sig.avatar)}" alt="" loading="lazy">
        <div>
          <p>Siguiente: <b>${esc(sig.nombre)}</b> · nivel ${sig.n}</p>
          <p class="hacker__falta">Te faltan <b>${sig.faltan} XP</b> — ${esc(sig.reto)}</p>
        </div>
      </div>` : `
      <div class="hacker__siguiente is-full">
        <i class="fa-solid fa-graduation-cap"></i>
        <div><p><b>Escalera completa.</b></p>
          <p class="hacker__falta">Llegaste a la cima de la academia.</p></div>
      </div>`}
    </div>
  </section>

  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-bolt"></i> De dónde sale tu XP</h2>
      <span class="pill">Cada misión entrega su nota × 10 · hasta 100 XP por misión</span>
    </header>
    <div class="xp-periodos">
      ${porPeriodo.map((x) => `
        <div class="xpp" style="--c:${x.era.color};--c-rgb:${rgb(x.era.color)}">
          <div class="xpp__cab">
            <span><i class="fa-solid ${x.era.icon}"></i> Periodo ${x.periodo}</span>
            <b data-contar="${x.xp}">0</b>
          </div>
          <div class="barra barra--fina">
            <i class="barra__val" data-anim-barra="${(x.xp / maxPeriodo * 100).toFixed(1)}"></i>
          </div>
          <p class="xpp__pie">${x.promedio === null
            ? 'Sin notas todavía'
            : 'Promedio ' + M.fmt(x.promedio) + ' · era de ' + esc(x.era.name)}</p>
        </div>`).join('')}
    </div>
    <p class="nota-pie"><i class="fa-solid fa-equals"></i>
      La suma de los cuatro periodos es exactamente tu XP total: ${p.xp} de ${XP_MAX}.
      Cada periodo puede darte hasta ${porPeriodo[0].max} XP con sus seis misiones.</p>
  </section>

  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-stairs"></i> La escalera hacker</h2>
      <span class="pill">${e.nivel} de ${MAX_LEVEL} niveles</span>
    </header>
    <div class="galeria">${escalones}</div>
    <div class="meta-8">
      <i class="fa-solid fa-bullseye"></i>
      <div>
        <b>La regla de oro: ${M.fmt(PROMEDIO_META)} de promedio.</b>
        <span>Quien sostiene ${M.fmt(PROMEDIO_META)} en las ${MISIONES_TOTALES} misiones del año
          termina con ${XP_META} XP y despierta los diez niveles. Cada ${XP_PER_LEVEL} XP subes
          un escalón y tu avatar cambia.</span>
      </div>
      <div class="meta-8__marca">
        <b>${p.xp}</b><span>de ${XP_META}</span>
        <div class="barra barra--mini"><i class="barra__val"
          data-anim-barra="${Math.min(100, p.xp / XP_META * 100).toFixed(1)}"></i></div>
      </div>
    </div>
    <p class="nota-pie"><i class="fa-solid fa-circle-info"></i>
      Toca cualquier nivel para ver qué pide y qué promedio equivale.</p>
  </section>
  `;

  $$('[data-contar]', cont).forEach((n) => contar(n, Number(n.dataset.contar), {
    dec: 0, sufijo: n.dataset.sufijo || ''
  }));
  animarBarras(cont);

  $$('.ncard', cont).forEach((b) => b.addEventListener('click', () => {
    const x = e.lista.find((y) => y.n === Number(b.dataset.n));
    modal({
      titulo: 'Nivel ' + x.n + ' · ' + x.nombre,
      subtitulo: x.alcanzado ? 'Identidad desbloqueada' : 'Todavía bloqueado',
      ancho: '560px',
      cuerpo: fichaNivel(x)
    });
  }));

  $$('img', cont).forEach((img) => img.addEventListener('error', () => {
    img.replaceWith(el('span', { class: 'img-fallback' }, el('i', { class: 'fa-solid fa-user-astronaut' })));
  }));
}

return { render: render };
})();

/* ---------- vistas/perfil.js ---------- */
var __M_vistas_perfil = (function () {
/* ============================================================================
   vistas/perfil.js — Identidad del recluta: avatar, nivel, XP e insignias
   ========================================================================== */

const { $, $$, el, esc, rgb, contar, animarBarras, modal, toast } = __M_ui;
const M = __M_motor;
const { XP_MAX, XP_PER_LEVEL, MAX_LEVEL, SCALE, CATEGORIES } = __M_config;
function kpi(icono, valor, etiqueta, color, extra = '') {
  return `
    <article class="kpi" style="--c:${color};--c-rgb:${rgb(color)}">
      <div class="kpi__ico"><i class="fa-solid ${icono}"></i></div>
      <div class="kpi__cuerpo">
        <p class="kpi__valor" data-contar="${esc(valor.valor)}" data-dec="${valor.dec || 0}"
           data-sufijo="${esc(valor.sufijo || '')}">0</p>
        <p class="kpi__etq">${esc(etiqueta)}</p>
        ${extra ? `<p class="kpi__extra">${extra}</p>` : ''}
      </div>
    </article>`;
}

function mapaMisiones(p) {
  const todas = M.misiones(p.st.id);
  const filas = M.PERIODS.map((per) => {
    const era = M.eraDe(per);
    const celdas = todas.filter((m) => m.periodo === per).map((m) => {
      const d = M.desempeno(m.promedio);
      const color = m.promedio === null ? '#475569' : d.color;
      const clase = m.promedio === null ? 'mapa__celda--pend' : 'mapa__celda--ok';
      return `<button class="mapa__celda ${clase}" style="--c:${color};--c-rgb:${rgb(color)}"
        data-mision="${per}|${m.mision}" title="${esc(m.nombre)}">
        <span class="mapa__nota">${m.promedio === null
          ? '<i class="fa-solid fa-lock"></i>' : M.fmt(m.promedio)}</span>
        <span class="mapa__sub">M${m.mision} · ${m.hechas}/${m.total}</span>
      </button>`;
    }).join('');
    return `
      <div class="mapa__fila">
        <div class="mapa__era" style="--c:${era.color}">
          <i class="fa-solid ${era.icon}"></i>
          <span><b>P${per}</b>${esc(era.name)}</span>
        </div>
        <div class="mapa__celdas mapa__celdas--6">${celdas}</div>
      </div>`;
  }).join('');

  const mis = M.avanceDeMisiones(p.st.id);
  return `
    <section class="tarjeta">
      <header class="tarjeta__head">
        <h2><i class="fa-solid fa-map"></i> Mapa de misiones del año</h2>
        <div class="tarjeta__meta">
          <span class="pill">${mis.completas} / ${mis.total} misiones completas</span>
          <span class="pill" style="--c:#34d399">${p.avance.hechas} / ${p.avance.total} actividades</span>
        </div>
      </header>
      <div class="mapa__leyenda">
        ${CATEGORIES.map((c) => `<span class="mapa__lg" style="--c:${c.color}"><i class="fa-solid ${c.icon}"></i>${esc(c.short)}</span>`).join('')}
      </div>
      <div class="mapa">${filas}</div>
      <p class="nota-pie"><i class="fa-solid fa-circle-info"></i>
        Cada casilla es una misión con sus cuatro actividades. Tócala para ver el detalle.</p>
    </section>`;
}

function insigniasHTML(p) {
  const logradas = p.insignias.filter((b) => b.logrado).length;
  const items = p.insignias.map((b) => `
    <button class="insignia ${b.logrado ? 'is-on' : 'is-off'}" data-insignia="${b.key}"
            style="--c:${b.color};--c-rgb:${rgb(b.color)}" title="${esc(b.name)}">
      <span class="insignia__disco"><i class="fa-solid ${b.logrado ? b.icon : 'fa-lock'}"></i></span>
      <span class="insignia__nombre">${esc(b.name)}</span>
    </button>`).join('');
  return `
    <section class="tarjeta">
      <header class="tarjeta__head">
        <h2><i class="fa-solid fa-award"></i> Insignias</h2>
        <span class="pill">${logradas} / ${p.insignias.length}</span>
      </header>
      <div class="insignias">${items}</div>
    </section>`;
}

function render(p, cont) {
  const st = p.st;
  const nv = p.nivelInfo;
  const id = p.identidad;
  const sig = p.escalera.siguiente;
  const promTxt = M.fmt(p.global);

  cont.innerHTML = `
  <section class="hero" style="--c:${id.color};--c-rgb:${rgb(id.color)}">
    <div class="hero__aura"></div>
    <div class="hero__avatar">
      <svg class="anillo" viewBox="0 0 120 120" aria-hidden="true">
        <circle class="anillo__base" cx="60" cy="60" r="54"></circle>
        <circle class="anillo__valor" cx="60" cy="60" r="54"
                stroke="${id.color}" data-anillo="${nv.pct}"></circle>
      </svg>
      <img src="${esc(p.avatar)}" alt="Avatar de ${esc(st.name)}" loading="lazy">
      <span class="hero__nivel" title="Nivel hacker">${nv.nivel}</span>
    </div>

    <div class="hero__datos">
      <p class="hero__titulo"><i class="fa-solid ${id.icon}"></i> Nivel ${id.n} · ${esc(id.nombre)}</p>
      <h1 class="hero__nombre">${esc(st.name)}</h1>
      <div class="hero__chips">
        <span class="chip" style="--c:${p.rango.color}"><i class="fa-solid ${p.rango.icon}"></i>${esc(p.rango.name)}</span>
        <span class="chip chip--liso"><i class="fa-solid fa-barcode"></i>${esc(st.code)}</span>
        <span class="chip chip--liso"><i class="fa-solid fa-graduation-cap"></i>${esc(st.grade)}° ${esc(st.group)}</span>
        <span class="chip" style="--c:${p.animo.color}"><i class="fa-solid ${p.animo.icon}"></i>${esc(p.animo.label)}</span>
      </div>

      <div class="xp">
        <div class="xp__cab">
          <span><i class="fa-solid fa-bolt"></i> <b data-contar="${p.xp}" data-dec="0">0</b> XP de ${XP_MAX}</span>
          <span>${nv.tope
            ? 'Nivel máximo alcanzado'
            : nv.faltan + ' XP para el nivel ' + (nv.nivel + 1)}</span>
        </div>
        <div class="barra"><i class="barra__val" data-anim-barra="${(nv.pct * 100).toFixed(1)}"
             style="background:linear-gradient(90deg, ${id.color}, var(--acento-2))"></i></div>
        <p class="xp__pie">${esc(id.lema)} · ${nv.enNivel} / ${nv.rango} XP en este nivel</p>
      </div>
    </div>

    <a class="hero__nivel-card" href="#/niveles" title="Ver la escalera hacker"
       style="--c:${(sig || id).color};--c-rgb:${rgb((sig || id).color)}">
      <img src="${esc((sig || id).avatar)}" alt="" loading="lazy">
      <div>
        <p class="hero__gnombre">${sig ? esc(sig.nombre) : esc(id.nombre)}</p>
        <p class="hero__gdon">${sig
          ? 'Siguiente nivel · faltan ' + sig.faltan + ' XP'
          : 'Nivel ' + MAX_LEVEL + ' de ' + MAX_LEVEL}</p>
      </div>
      <i class="fa-solid fa-chevron-right"></i>
    </a>
  </section>

  <div class="kpis">
    ${kpi('fa-star', { valor: p.global === null ? 0 : p.global, dec: 1 }, 'Promedio global',
      p.desempeno.color, `Desempeño <b>${esc(p.desempeno.label)}</b>`)}
    ${kpi('fa-ranking-star', { valor: p.posCurso.pos || 0 }, 'Puesto en el curso', '#fbbf24',
      `de ${p.posCurso.total} · ${esc(st.grade)}° ${esc(st.group)}`)}
    ${kpi('fa-list-check', { valor: Math.round(p.avance.pct * 100), sufijo: '%' }, 'Actividades entregadas',
      '#34d399', `${p.avance.hechas} de ${p.avance.total}`)}
    ${kpi('fa-fire', { valor: p.racha.mejor }, 'Mejor racha', '#fb923c',
      `${p.racha.viva} seguidas ahora mismo`)}
    ${kpi('fa-bolt', { valor: p.xp }, 'Experiencia', id.color,
      `Nivel ${nv.nivel} de ${MAX_LEVEL}`)}
    ${kpi('fa-globe', { valor: p.posGeneral.pos || 0 }, 'Puesto general', '#22d3ee',
      `de ${p.posGeneral.total} reclutas`)}
  </div>

  <div class="rejilla rejilla--2">
    ${mapaMisiones(p)}
    <section class="tarjeta">
      <header class="tarjeta__head">
        <h2><i class="fa-solid fa-timeline"></i> Tu año, periodo a periodo</h2>
        <span class="pill">${promTxt} global</span>
      </header>
      <ul class="linea-tiempo">
        ${p.periodos.map((x) => {
          const d = M.desempeno(x.promedio);
          const pct = x.promedio === null ? 0 : (x.promedio / SCALE.max) * 100;
          return `
          <li class="lt" style="--c:${x.promedio === null ? '#475569' : d.color}">
            <span class="lt__punto"><i class="fa-solid ${x.era.icon}"></i></span>
            <div class="lt__cuerpo">
              <p class="lt__tit">Periodo ${x.periodo} · <span>${esc(x.era.name)}</span></p>
              <div class="barra barra--fina">
                <i class="barra__val" data-anim-barra="${pct.toFixed(1)}"></i>
              </div>
              <p class="lt__pie">${x.promedio === null
                ? 'Aún sin notas registradas'
                : M.fmt(x.promedio) + ' · ' + esc(d.label)}</p>
            </div>
          </li>`;
        }).join('')}
      </ul>
    </section>
  </div>

  ${insigniasHTML(p)}
  `;

  /* animaciones y eventos ------------------------------------------------- */
  $$('[data-contar]', cont).forEach((n) => {
    contar(n, Number(n.dataset.contar), {
      dec: Number(n.dataset.dec || 0),
      sufijo: n.dataset.sufijo || ''
    });
  });

  const anillo = $('.anillo__valor', cont);
  if (anillo) {
    const r = 54, largo = 2 * Math.PI * r;
    anillo.style.strokeDasharray = largo;
    anillo.style.strokeDashoffset = largo;
    requestAnimationFrame(() => {
      anillo.style.strokeDashoffset = largo * (1 - Number(anillo.dataset.anillo));
    });
  }

  animarBarras(cont);

  $$('[data-insignia]', cont).forEach((b) => b.addEventListener('click', () => {
    const ins = p.insignias.find((x) => x.key === b.dataset.insignia);
    modal({
      titulo: ins.name,
      subtitulo: ins.logrado ? 'Insignia conseguida' : 'Todavía bloqueada',
      ancho: '420px',
      cuerpo: el('div', { class: 'ins-detalle', style: { '--c': ins.color } },
        el('div', { class: 'ins-detalle__disco ' + (ins.logrado ? 'is-on' : '') },
          el('i', { class: 'fa-solid ' + (ins.logrado ? ins.icon : 'fa-lock') })),
        el('p', { class: 'ins-detalle__txt', text: ins.desc }),
        el('p', {
          class: 'ins-detalle__estado',
          text: ins.logrado ? 'Ya forma parte de tu escarapela.' : 'Sigue entregando misiones para desbloquearla.'
        }))
    });
  }));

  $$('[data-mision]', cont).forEach((c) => c.addEventListener('click', () => {
    const [per, num] = c.dataset.mision.split('|').map(Number);
    const m = M.misiones(p.st.id).find((x) => x.periodo === per && x.mision === num);
    if (!m) return;
    const d = M.desempeno(m.promedio);
    modal({
      titulo: m.nombre,
      subtitulo: 'Periodo ' + per + ' · ' + M.eraDe(per).name,
      ancho: '480px',
      cuerpo: el('div', { class: 'mision-detalle', style: { '--c': m.promedio === null ? '#64748b' : d.color } },
        el('p', { class: 'mision-detalle__nota', text: m.promedio === null ? 'Pendiente' : M.fmt(m.promedio) }),
        el('p', { class: 'mision-detalle__desem',
          text: m.promedio === null ? 'Sin calificar todavía' : 'Desempeño ' + d.label }),
        el('ul', { class: 'mision-acts' },
          ...m.actividades.map((a) => el('li', { class: 'mision-acts__it', style: { '--c': a.color } },
            el('span', { class: 'mision-acts__ico' }, el('i', { class: 'fa-solid ' + a.icon })),
            el('div', {},
              el('b', { text: a.nombre }),
              el('small', { text: a.catLabel })),
            el('span', {
              class: 'mision-acts__nota',
              text: a.nota === null ? '—' : M.fmt(a.nota),
              style: { color: a.nota === null ? 'var(--txt-3)' : M.desempeno(a.nota).color }
            })))),
        el('p', { class: 'mision-detalle__pie',
          text: m.hechas + ' de ' + m.total + ' actividades calificadas' }))
    });
  }));

  $$('img', cont).forEach((img) => img.addEventListener('error', () => {
    img.replaceWith(el('span', { class: 'img-fallback' }, el('i', { class: 'fa-solid fa-user-astronaut' })));
  }));

  if (p.global === null) {
    toast('Sin calificaciones', 'Tu docente todavía no ha registrado notas para tu código.', 'info');
  }
}

return { render: render };
})();

/* ---------- vistas/ranking.js ---------- */
var __M_vistas_ranking = (function () {
/* ============================================================================
   vistas/ranking.js — Leaderboard de la academia: podio, filtros y tabla
   ----------------------------------------------------------------------------
   El ranking es la capa lúdica: muestra XP, nivel y rango hacker, nunca la
   nota académica de otro estudiante.
   ========================================================================== */

const { $, $$, esc, rgb, animarBarras, toast } = __M_ui;
const { db, norm } = __M_datos;
const M = __M_motor;
const { RANKS } = __M_config;
const f = { ambito: 'curso', metrica: 'global', rango: '', q: '' };

function lista(st) {
  if (f.ambito === 'grado') return db.students.filter((s) => s.grade === st.grade);
  if (f.ambito === 'academia') return db.students.slice();
  return db.students.filter((s) => s.grade === st.grade && s.group === st.group);
}

function filtrar(filas) {
  const q = norm(f.q);
  return filas.filter((r) => {
    if (f.rango && r.rango.key !== f.rango) return false;
    if (q && norm(r.st.name).indexOf(q) < 0 && norm(r.st.code).indexOf(q) < 0) return false;
    return true;
  });
}

function podio(filas, yoId) {
  const top = filas.slice(0, 3);
  if (!top.length) return '';
  const orden = [1, 0, 2];   // plata · oro · bronce
  const medallas = ['#fbbf24', '#cbd5e1', '#d97706'];
  return `
  <section class="podio">
    ${orden.map((i) => {
      const r = top[i];
      if (!r) return '<div class="podio__hueco"></div>';
      const yo = r.st.id === yoId;
      return `
      <article class="podio__p podio__p--${i + 1} ${yo ? 'is-yo' : ''}"
               style="--c:${medallas[i]};--c-rgb:${rgb(medallas[i])}">
        <div class="podio__corona">${i === 0 ? '<i class="fa-solid fa-crown"></i>' : ''}</div>
        <div class="podio__foto">
          <img src="${esc(M.avatarDe(r.st))}" alt="${esc(r.st.name)}" loading="lazy">
          <span class="podio__pos">${r.pos}</span>
        </div>
        <p class="podio__nombre">${esc(r.st.name)}</p>
        <p class="podio__curso">${esc(r.st.grade)}° ${esc(r.st.group)}${yo ? ' · tú' : ''}</p>
        <p class="podio__xp"><i class="fa-solid fa-bolt"></i> ${r.puntos === null ? '—' : r.puntos} XP</p>
        <span class="podio__rango" style="--c:${r.rango.color}">
          <i class="fa-solid ${r.rango.icon}"></i>${esc(r.rango.name)}</span>
        <div class="podio__base"></div>
      </article>`;
    }).join('')}
  </section>`;
}

function filaHTML(r, yoId) {
  const yo = r.st.id === yoId;
  const medalla = r.pos <= 3 ? ['#fbbf24', '#cbd5e1', '#d97706'][r.pos - 1] : null;
  return `
  <tr class="${yo ? 'is-yo' : ''}" id="${yo ? 'mi-fila' : ''}">
    <td class="c">
      <span class="pos ${medalla ? 'pos--medalla' : ''}" ${medalla ? `style="--c:${medalla}"` : ''}>
        ${medalla ? '<i class="fa-solid fa-medal"></i>' : ''}${r.pos}
      </span>
    </td>
    <td>
      <div class="recluta">
        <img src="${esc(M.avatarDe(r.st))}" alt="" loading="lazy">
        <div><b>${esc(r.st.name)}${yo ? ' <span class="tag-yo">tú</span>' : ''}</b>
          <small>${esc(r.st.code)} · ${esc(r.st.grade)}° ${esc(r.st.group)}</small></div>
      </div>
    </td>
    <td class="c"><span class="nivel-chip">Nv. ${r.nivel}</span></td>
    <td class="c"><b>${r.puntos === null ? '—' : r.puntos}</b><small class="tenue"> XP</small></td>
    <td class="c oculta-mv">
      <span class="pill pill--mini" style="--c:${r.rango.color}">
        <i class="fa-solid ${r.rango.icon}"></i>${esc(r.rango.name)}</span>
    </td>
    <td class="oculta-mv">
      <div class="barra barra--mini">
        <i class="barra__val" data-anim-barra="${((r.puntos || 0) / M.puntosMax(f.metrica) * 100).toFixed(1)}"
           style="background:${r.rango.color}"></i>
      </div>
    </td>
  </tr>`;
}

function refrescar(p, cont) {
  const base = M.tabla(lista(p.st), f.metrica);
  const filas = filtrar(base);
  const yo = base.find((r) => r.st.id === p.st.id);

  const cuerpo = $('#tb-ranking', cont);
  cuerpo.innerHTML = filas.length
    ? filas.map((r) => filaHTML(r, p.st.id)).join('')
    : `<tr><td colspan="6"><div class="vacio"><i class="fa-solid fa-user-slash"></i>
        <h4>Sin resultados</h4><p>Prueba con otro filtro o borra la búsqueda.</p></div></td></tr>`;

  const zonaPodio = $('#zona-podio', cont);
  zonaPodio.innerHTML = f.q || f.rango ? '' : podio(base, p.st.id);

  const res = $('#resumen-ranking', cont);
  res.innerHTML = yo
    ? `Vas en el puesto <b>${yo.pos}</b> de <b>${base.length}</b> con
       <b>${yo.puntos === null ? '—' : yo.puntos} XP</b>${f.metrica === 'global' ? '' : ' en el periodo ' + f.metrica}
       · nivel <b>${yo.nivel}</b> · rango <b style="color:${yo.rango.color}">${esc(yo.rango.name)}</b>.`
    : 'Tu código no aparece en este ámbito.';

  animarBarras(cont);
}

function render(p, cont) {
  const st = p.st;

  cont.innerHTML = `
  <div class="cab-vista">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-ranking-star"></i> Ranking de la academia</h1>
      <p class="cab-vista__s">Clasificación por experiencia acumulada. Sana competencia, sin exponer notas ajenas.</p>
    </div>
    <button class="btn btn--ghost" id="btn-mi-pos"><i class="fa-solid fa-crosshairs"></i> Ir a mi puesto</button>
  </div>

  <div class="filtros">
    <label class="selector">
      <span>Ámbito</span>
      <select id="r-ambito">
        <option value="curso">Mi curso · ${esc(st.grade)}° ${esc(st.group)}</option>
        <option value="grado">Mi grado · ${esc(st.grade)}°</option>
        <option value="academia">Toda la academia</option>
      </select>
    </label>
    <label class="selector">
      <span>Métrica</span>
      <select id="r-metrica">
        <option value="global">Consolidado del año</option>
        ${M.PERIODS.map((x) => `<option value="${x}">Periodo ${x}</option>`).join('')}
      </select>
    </label>
    <label class="selector">
      <span>Rango</span>
      <select id="r-rango">
        <option value="">Todos los rangos</option>
        ${RANKS.map((r) => `<option value="${r.key}">${esc(r.name)}</option>`).join('')}
      </select>
    </label>
    <label class="buscador">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input id="r-q" type="search" placeholder="Buscar por nombre o código…" autocomplete="off">
    </label>
  </div>

  <div id="zona-podio"></div>

  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-list-ol"></i> Clasificación</h2>
      <p class="resumen" id="resumen-ranking"></p>
    </header>
    <div class="tabla-wrap">
      <table class="tabla tabla--rank">
        <thead><tr><th class="c">#</th><th>Recluta</th><th class="c">Nivel</th>
          <th class="c">XP</th><th class="c oculta-mv">Rango</th><th class="oculta-mv">Progreso</th></tr></thead>
        <tbody id="tb-ranking"></tbody>
      </table>
    </div>
  </section>
  `;

  $('#r-ambito', cont).value = f.ambito;
  $('#r-metrica', cont).value = f.metrica;
  $('#r-rango', cont).value = f.rango;
  $('#r-q', cont).value = f.q;

  $('#r-ambito', cont).addEventListener('change', (e) => { f.ambito = e.target.value; refrescar(p, cont); });
  $('#r-metrica', cont).addEventListener('change', (e) => { f.metrica = e.target.value; refrescar(p, cont); });
  $('#r-rango', cont).addEventListener('change', (e) => { f.rango = e.target.value; refrescar(p, cont); });

  let t = null;
  $('#r-q', cont).addEventListener('input', (e) => {
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { f.q = v; refrescar(p, cont); }, 180);
  });

  $('#btn-mi-pos', cont).addEventListener('click', () => {
    const fila = $('#mi-fila', cont);
    if (!fila) { toast('No apareces aquí', 'Cambia el ámbito o borra los filtros.', 'warn'); return; }
    fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
    fila.classList.add('destello');
    setTimeout(() => fila.classList.remove('destello'), 1400);
  });

  refrescar(p, cont);
}

return { render: render };
})();

/* ---------- app.js ---------- */
var __M_app = (function () {
/* ============================================================================
   app.js — Arranque, acceso y enrutador de los dos paneles
   ----------------------------------------------------------------------------
   Todo el mundo entra por la portada (js/portada.js), que cuenta la narrativa
   y ofrece dos puertas: "Hacker Tutor" abre el panel de gestión sin más
   trámite, y "Hacker Estudiante" pide el código que entregó el docente.
   Nadie ve el panel del otro.
   ========================================================================== */

const { APP, VIEWS, VIEWS_DOCENTE } = __M_config;
const D = __M_datos;
const M = __M_motor;
const A = __M_almacen;
const { $, $$, el, esc, toast, modal, cerrarModal } = __M_ui;
const G = __M_graficas;
const Portada = __M_portada;
const { alCambiar } = __M_bus;
const vPerfil = __M_vistas_perfil;
const vNiveles = __M_vistas_niveles;
const vEstadisticas = __M_vistas_estadisticas;
const vComparativa = __M_vistas_comparativa;
const vRanking = __M_vistas_ranking;
const vBoletines = __M_vistas_boletines;
const vEscarapela = __M_vistas_escarapela;
const vAlbum = __M_vistas_album;
const VISTAS = {
  perfil: vPerfil,
  niveles: vNiveles,
  album: vAlbum,
  estadisticas: vEstadisticas,
  comparativa: vComparativa,
  ranking: vRanking,
  boletines: vBoletines,
  escarapela: vEscarapela
};

const VISTAS_DOCENTE = {};

const estado = { rol: null, estudiante: null, vista: null };
let refrescoPendiente = null;

const esDocente = () => estado.rol === 'docente';
const vistasDelRol = () => (esDocente() ? VISTAS_DOCENTE : VISTAS);
const menuDelRol = () => (esDocente() ? VIEWS_DOCENTE : VIEWS);
const vistaInicial = () => (esDocente() ? 'centro' : 'perfil');

/* ------------------------------- tema ------------------------------------- */

function temaGuardado() {
  try { return localStorage.getItem(APP.themeKey); } catch (e) { return null; }
}

function aplicarTema(t) {
  document.documentElement.dataset.tema = t;
  try { localStorage.setItem(APP.themeKey, t); } catch (e) { /* sin acceso */ }
  const i = $('#btn-tema i');
  if (i) i.className = 'fa-solid ' + (t === 'claro' ? 'fa-moon' : 'fa-sun');
  // Se comprueba otra vez al disparar: entre medias el usuario pudo cerrar sesión.
  if (estado.rol) setTimeout(() => { if (estado.rol) pintarVista(estado.vista, true); }, 60);
}

function alternarTema() {
  aplicarTema(document.documentElement.dataset.tema === 'claro' ? 'oscuro' : 'claro');
}

/* --------------------------- pantalla de carga ---------------------------- */

function ocultarCarga() {
  const c = $('#carga');
  if (!c) return;
  c.classList.add('se-va');
  setTimeout(() => c.remove(), 520);
}

/* ------------------------------- acceso ----------------------------------- */

function volverAPortada() {
  $('#app').hidden = true;
  document.body.classList.remove('con-app', 'rol-docente');
  Portada.mostrar();
}

/**
 * Valida el código de un estudiante y abre su panel.
 * @param {string} codigo
 * @param {boolean} recordar
 * @returns {boolean} true si el acceso fue válido
 */
function entrar(codigo, recordar) {
  const limpio = String(codigo || '').trim();
  if (!limpio) return false;

  const st = D.buscarPorCodigo(limpio);
  if (!st) return false;

  estado.rol = 'estudiante';
  estado.estudiante = st;

  if (recordar) D.guardarSesion(limpio); else D.borrarSesion();
  abrirPanel();
  toast('¡Misión iniciada!', 'Bienvenido de nuevo, ' + st.name.split(' ')[0] + '.', 'ok');
  return true;
}

/* Marca de sesión del tutor: no es un código, solo recuerda que la última
   vez se entró como docente, para no volver a pasar por la portada en cada
   recarga (igual que el estudiante con su código, pero sin contraseña). */
const SESION_DOCENTE = '*docente*';

/** Abre el panel del docente directamente: ya no pide ningún código. */
function entrarDocente() {
  estado.rol = 'docente';
  estado.estudiante = null;
  D.guardarSesion(SESION_DOCENTE);
  abrirPanel();
  toast('Bienvenido, tutor', 'Panel de gestión abierto.', 'ok');
}

function salir() {
  D.dejarDeVigilar();
  estado.rol = null;
  estado.estudiante = null;
  estado.vista = null;
  D.borrarSesion();
  G.destruirTodas();
  cerrarModal();
  location.hash = '';
  volverAPortada();
  toast('Sesión cerrada', 'Hasta la próxima.', 'info');
}

/* -------------------------------- panel ----------------------------------- */

function abrirPanel() {
  Portada.ocultar();
  /* El estudiante sondea el archivo para ver los cambios del docente al vuelo.
     El docente NO lo hace: es él quien manda, y releer el archivo le borraría
     lo que acaba de escribir. */
  D.vigilarCambios({ segundos: 15, sondearArchivo: !esDocente() });
  $('#app').hidden = false;
  document.body.classList.add('con-app');
  document.body.classList.toggle('rol-docente', esDocente());
  pintarNav();
  pintarIdentidad();
  const destino = (location.hash || '').replace('#/', '');
  pintarVista(vistasDelRol()[destino] ? destino : vistaInicial());
  ofrecerCarpeta();
}

function pintarNav() {
  $('#nav').innerHTML = menuDelRol().map((v) => `
    <a class="nav__item" href="#/${v.id}" data-vista="${v.id}">
      <i class="fa-solid ${v.icon}"></i><span>${esc(v.label)}</span>
    </a>`).join('');
}

function pintarIdentidad() {
  const caja = $('#lateral-yo');
  if (esDocente()) {
    const c = D.db.config;
    caja.innerHTML = `
      <span class="lateral__docente"><i class="fa-solid fa-user-tie"></i></span>
      <div class="lateral__yo-txt">
        <b>${esc(c.teacher || 'Docente')}</b>
        <small>${esc(c.subject || '')}</small>
        <span class="chip chip--mini" style="--c:#fbbf24">Panel docente</span>
      </div>`;
  } else {
    const st = estado.estudiante;
    const p = M.perfil(st);
    caja.innerHTML = `
      <img id="u-avatar" src="${esc(p.avatar)}" alt="Avatar de ${esc(st.name)}" width="52" height="52">
      <div class="lateral__yo-txt">
        <b>${esc(st.name)}</b>
        <small>${esc(st.code)} · ${esc(st.grade)}° ${esc(st.group)}</small>
        <span class="chip chip--mini" style="--c:${p.rango.color}">${esc(p.rango.name)}</span>
      </div>
      <span class="nivel-chip">Nv. ${p.nivelInfo.nivel}</span>`;
  }
  $('#marca-sub').textContent = esDocente() ? 'Panel del Docente' : 'Panel del Estudiante';
  $('#pie-nota').textContent = esDocente()
    ? 'Academia C.O.D.E. · panel del docente · los cambios se guardan al instante.'
    : 'Academia C.O.D.E. · datos registrados por tu docente · este panel es de solo lectura.';
  $('#pie-origen').textContent = D.db.origen;
  pintarEstadoGuardado();
}

function pintarEstadoGuardado() {
  const caja = $('#estado-guardado');
  if (!caja) return;
  if (!esDocente()) { caja.hidden = true; return; }
  caja.hidden = false;
  const b = A.bodega;
  const enCarpeta = b.dir && b.permiso;
  caja.className = 'guardado ' + (enCarpeta ? 'is-carpeta' : 'is-local');
  caja.innerHTML = enCarpeta
    ? '<i class="fa-solid fa-folder-open"></i><span>Carpeta ' + esc(b.nombre) + '</span>'
    : '<i class="fa-solid fa-hard-drive"></i><span>Solo navegador</span>';
  caja.title = enCarpeta
    ? 'Cada cambio se escribe también en ' + b.nombre + '/academia-code.json'
    : 'Los cambios se guardan solo en este navegador. Conecta la carpeta en la Consola.';
}

function pintarVista(id, silencioso) {
  if (!estado.rol) return;
  if (!esDocente() && !estado.estudiante) return;
  const vistas = vistasDelRol();
  if (!vistas[id]) id = vistaInicial();
  estado.vista = id;

  Object.values(VISTAS).concat(Object.values(VISTAS_DOCENTE))
    .forEach((v) => { if (typeof v.limpiar === 'function') v.limpiar(); });
  G.destruirTodas();

  $$('[data-vista]').forEach((b) => {
    const on = b.dataset.vista === id;
    b.classList.toggle('is-on', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });

  const cont = $('#vista');
  cont.classList.remove('entra');
  cont.setAttribute('aria-busy', 'true');

  try {
    if (esDocente()) vistas[id].render(cont);
    else vistas[id].render(M.perfil(estado.estudiante), cont);
  } catch (e) {
    console.error(e);
    cont.innerHTML = '<div class="vacio"><i class="fa-solid fa-bug"></i>' +
      '<h4>Algo falló al dibujar esta vista</h4><p>' + esc(e.message || e) + '</p></div>';
  }
  cont.removeAttribute('aria-busy');
  void cont.offsetWidth;
  cont.classList.add('entra');
  if (!silencioso) window.scrollTo({ top: 0, behavior: 'smooth' });
  cerrarMenu();
}

/* -------------------- invitación a conectar la carpeta -------------------- */

let carpetaOfrecida = false;

/**
 * La primera vez que el docente entra en una sesión, se le ofrece conectar la
 * carpeta `data`. El navegador exige un gesto suyo para dar permiso de
 * escritura, así que esto no puede hacerse solo; una vez concedido, se
 * recuerda entre sesiones y todo lo demás (guardado y respaldos) ya es
 * automático.
 */
function ofrecerCarpeta() {
  if (carpetaOfrecida || !esDocente()) return;
  carpetaOfrecida = true;
  if (!A.bodega.soportado || (A.bodega.dir && A.bodega.permiso)) return;

  const pendiente = !!A.bodega.nombre;
  const cuerpo = el('div', { class: 'confirmar' },
    el('p', { html: pendiente
      ? 'La carpeta <b>' + esc(A.bodega.nombre) + '</b> ya estaba conectada, pero el navegador ' +
        'necesita que vuelvas a autorizarla en esta sesión.'
      : 'Conecta la carpeta <b>data</b> del proyecto y cada cambio se guardará también en ' +
        '<code>data/academia-code.json</code>, con respaldo automático diario en ' +
        '<code>data/respaldos/</code>. Es lo que hace que tus estudiantes vean las notas al instante.' }),
    el('p', { class: 'texto-suave', html:
      'Sin conectarla todo funciona igual, pero los datos viven solo en este navegador y ' +
      'tendrás que exportar el JSON a mano.' }),
    el('div', { class: 'confirmar__botones' },
      el('button', { class: 'btn btn--ghost', onclick: cerrarModal }, 'Ahora no'),
      el('button', {
        class: 'btn',
        onclick: async () => {
          try {
            const nombre = pendiente
              ? ((await A.autorizarCarpeta()) ? A.bodega.nombre : null)
              : await A.conectarCarpeta();
            cerrarModal();
            if (nombre) {
              pintarEstadoGuardado();
              toast('Carpeta conectada', 'Los cambios se escriben en ' + nombre + '/academia-code.json', 'ok', 6000);
            } else {
              toast('Permiso denegado', 'Puedes intentarlo desde la Consola.', 'warn');
            }
          } catch (err) {
            cerrarModal();
            toast('No se pudo conectar', err.message, 'err', 7000);
          }
        }
      }, el('i', { class: 'fa-solid fa-plug' }), pendiente ? ' Autorizar carpeta' : ' Conectar carpeta')));

  setTimeout(() => modal({
    titulo: pendiente ? 'Autoriza la carpeta de datos' : 'Conecta la carpeta de datos',
    subtitulo: 'Guardado automático y respaldos con fecha',
    ancho: '520px',
    cuerpo
  }), 700);
}

/* ------------------------------ menú móvil -------------------------------- */

function abrirMenu() { document.body.classList.add('menu-abierto'); }
function cerrarMenu() { document.body.classList.remove('menu-abierto'); }

/* ------------------------------- enrutador -------------------------------- */

function alCambiarHash() {
  if (!estado.rol) return;
  const id = (location.hash || '').replace('#/', '');
  if (vistasDelRol()[id] && id !== estado.vista) pintarVista(id);
}

/* -------------------------------- arranque -------------------------------- */

async function iniciar() {
  aplicarTema(temaGuardado() || 'oscuro');

  const res = await D.iniciar();
  if (!res.ok) {
    // Sin archivo de datos el tutor todavía debe poder entrar y empezar de cero.
    D.hidratar({}, 'Base nueva · sin archivo');
  }
  A.alGuardarBase(() => pintarEstadoGuardado());
  await A.recuperarCarpeta();

  /* Cuando la base cambia fuera de esta pestaña (el docente guardó en otro
     equipo o en otra pestaña), la vista de pantalla se repinta sola. */
  alCambiar((origen) => {
    if (origen !== 'externo') return;
    clearTimeout(refrescoPendiente);
    refrescoPendiente = setTimeout(() => {
      if (!estado.rol) { if (Portada.estaVisible()) Portada.mostrar(); return; }
      if (estado.estudiante) {
        const fresco = D.buscarPorCodigo(estado.estudiante.code);
        if (!fresco) { salir(); return; }
        estado.estudiante = fresco;
      }
      pintarIdentidad();
      pintarVista(estado.vista, true);
      toast('Datos actualizados', 'Tu docente acaba de guardar cambios.', 'info', 4000);
    }, 250);
  });
  D.vigilarCambios({ segundos: 20, sondearArchivo: false });

  Portada.configurar({ alEntrar: entrar, alEntrarDocente: entrarDocente, alternarTema });

  ocultarCarga();

  const guardado = D.sesionGuardada();
  if (guardado === SESION_DOCENTE) {
    entrarDocente();
  } else if (guardado && D.buscarPorCodigo(guardado)) {
    entrar(guardado, true);
  } else {
    Portada.mostrar();
  }

  if (!res.ok) {
    toast('No se encontró la base', 'Entra como Hacker Tutor para crear la lista desde cero.', 'warn', 9000);
  }
}

/* ------------------------------- eventos ---------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  $('#btn-tema').addEventListener('click', alternarTema);
  $('#btn-salir').addEventListener('click', salir);
  $('#btn-menu').addEventListener('click', abrirMenu);
  $('#velo').addEventListener('click', cerrarMenu);

  window.addEventListener('hashchange', alCambiarHash);

  document.addEventListener('keydown', (e) => {
    if (!estado.rol || !(e.ctrlKey || e.metaKey)) return;
    const n = Number(e.key);
    const menu = menuDelRol();
    if (n >= 1 && n <= menu.length) {
      e.preventDefault();
      location.hash = '#/' + menu[n - 1].id;
      pintarVista(menu[n - 1].id);
    }
  });

  iniciar();
});

return {  };
})();

/* ---------- excel.js ---------- */
var __M_excel = (function () {
/* ============================================================================
   excel.js — Lectura y escritura de .xlsx con SheetJS
   ----------------------------------------------------------------------------
   Solo el panel del docente lo usa. Si la librería no cargó, cada función
   avisa en vez de fallar en silencio.
   ========================================================================== */

const { HEADERS } = __M_config;
const { norm, normGender } = __M_datos;
const { sello } = __M_almacen;
function hayXLSX() {
  return typeof window.XLSX !== 'undefined';
}

function exigir() {
  if (!hayXLSX()) {
    throw new Error('No se pudo cargar SheetJS. Revisa tu conexión o la carpeta assets/vendor.');
  }
  return window.XLSX;
}

/* --------------------------- lectura de reclutas -------------------------- */

/** Empareja los encabezados reales del archivo con los campos que esperamos. */
function mapaColumnas(fila) {
  const mapa = {};
  Object.keys(fila).forEach((col) => {
    const limpio = norm(col);
    Object.keys(HEADERS).forEach((campo) => {
      if (mapa[campo]) return;
      if (HEADERS[campo].some((alias) => alias === limpio)) mapa[campo] = col;
    });
  });
  return mapa;
}

/**
 * Lee la primera hoja del libro y devuelve las filas normalizadas.
 * @returns {Promise<{filas:Array, columnas:Object, faltan:Array, hoja:string}>}
 */
async function leerEstudiantes(file) {
  const XLSX = exigir();
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const hoja = wb.SheetNames[0];
  const crudas = XLSX.utils.sheet_to_json(wb.Sheets[hoja], { defval: '' });

  if (!crudas.length) throw new Error('La primera hoja del archivo está vacía.');

  const columnas = mapaColumnas(crudas[0]);
  const faltan = ['name', 'code'].filter((c) => !columnas[c]);

  const filas = crudas.map((r) => ({
    name: String(columnas.name ? r[columnas.name] : '').trim(),
    grade: String(columnas.grade ? r[columnas.grade] : '').trim(),
    group: String(columnas.group ? r[columnas.group] : '').trim().toUpperCase(),
    gender: normGender(columnas.gender ? r[columnas.gender] : ''),
    code: String(columnas.code ? r[columnas.code] : '').trim()
  })).filter((r) => r.name || r.code);

  return { filas, columnas, faltan, hoja };
}

/**
 * Marca cada fila como nueva, existente, repetida o incompleta.
 * @param {Array} filas
 * @param {Function} buscarCodigo  recibe un código y devuelve el estudiante o null
 */
function revisar(filas, buscarCodigo) {
  const vistos = new Set();
  return filas.map((f) => {
    const clave = norm(f.code);
    let estado = 'nuevo';
    if (!f.name || !f.code) estado = 'incompleto';
    else if (vistos.has(clave)) estado = 'repetido';
    else if (buscarCodigo(f.code)) estado = 'existe';
    if (clave) vistos.add(clave);
    return Object.assign({}, f, { estado });
  });
}

const ETIQUETA_ESTADO = {
  nuevo: { txt: 'Nuevo', color: '#34d399' },
  existe: { txt: 'Ya existe', color: '#22d3ee' },
  repetido: { txt: 'Repetido', color: '#fbbf24' },
  incompleto: { txt: 'Incompleto', color: '#f87171' }
};

/* ------------------------------- escritura -------------------------------- */

function descargarLibro(filas, nombreHoja, archivo) {
  const XLSX = exigir();
  const ws = XLSX.utils.json_to_sheet(filas);
  const anchos = Object.keys(filas[0] || {}).map((k) => ({
    wch: Math.max(String(k).length + 2,
      ...filas.slice(0, 200).map((f) => String(f[k] == null ? '' : f[k]).length + 2))
  }));
  ws['!cols'] = anchos;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  XLSX.writeFile(wb, archivo);
  return archivo;
}

/** Plantilla vacía con las cinco columnas obligatorias y dos ejemplos. */
function plantilla() {
  const XLSX = exigir();
  const datos = [
    ['Nombre completo', 'Grado', 'Grupo', 'Género', 'Código de estudiante'],
    ['Valentina Marín Osorio', '6', 'A', 'Femenino', 'CODE-0001'],
    ['Santiago Restrepo Vega', '6', 'A', 'M', 'CODE-0002']
  ];
  const ws = XLSX.utils.aoa_to_sheet(datos);
  ws['!cols'] = [{ wch: 32 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 22 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');
  const archivo = 'plantilla-estudiantes-academia-code.xlsx';
  XLSX.writeFile(wb, archivo);
  return archivo;
}

function exportarEstudiantes(filas) {
  if (!filas.length) throw new Error('No hay estudiantes que exportar.');
  return descargarLibro(filas, 'Estudiantes', 'estudiantes-academia-code-' + sello() + '.xlsx');
}

function exportarNotas(filas, periodo) {
  if (!filas.length) throw new Error('No hay notas que exportar.');
  return descargarLibro(filas, 'Periodo ' + periodo, 'notas-periodo-' + periodo + '-' + sello() + '.xlsx');
}

function exportarRanking(filas) {
  if (!filas.length) throw new Error('No hay datos que exportar.');
  return descargarLibro(filas, 'Ranking', 'ranking-academia-code-' + sello() + '.xlsx');
}

return { hayXLSX: hayXLSX, leerEstudiantes: leerEstudiantes, revisar: revisar, ETIQUETA_ESTADO: ETIQUETA_ESTADO, plantilla: plantilla, exportarEstudiantes: exportarEstudiantes, exportarNotas: exportarNotas, exportarRanking: exportarRanking };
})();
})();
