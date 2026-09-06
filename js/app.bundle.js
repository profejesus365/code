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
  { id: 'informes',    label: 'Informes',        icon: 'fa-file-lines' },
  { id: 'consola',     label: 'Consola',         icon: 'fa-sliders' }
];

/* ------------------------------------------------------------------------
   Panel del docente
   ---------------------------------------------------------------------- */

/** Código con el que entra el docente la primera vez. Se cambia en la Consola. */
const CODIGO_DOCENTE_INICIAL = 'profejesus365';

/**
 * Portal de exámenes de la institución.
 * Se puede dejar vacío aquí y ponerlo desde Consola ▸ Portal de exámenes:
 * ese valor (config.examUrl) tiene prioridad sobre esta constante.
 */
const EXAMENES_URL = '';

/** Contacto del docente, visible en la portada. */
const CONTACTO = {
  correo: 'profejesus365@gmail.com',
  whatsapp: '+57 300 381 3984',
  whatsappLink: 'https://wa.me/573003813984'
};

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
  weights: { taller: 25, xp: 25, bit1: 25, bit2: 25 },
  teacherHash: null            // se calcula al arrancar si no existe
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

return { APP: APP, SCALE: SCALE, PERIODS: PERIODS, CATEGORIES: CATEGORIES, CAT: CAT, RANKS: RANKS, PERFORMANCE: PERFORMANCE, ERAS: ERAS, XP_PER_POINT: XP_PER_POINT, MAX_LEVEL: MAX_LEVEL, MISIONES_TOTALES: MISIONES_TOTALES, XP_POR_MISION: XP_POR_MISION, XP_MAX: XP_MAX, XP_MAX_PERIODO: XP_MAX_PERIODO, PROMEDIO_META: PROMEDIO_META, XP_META: XP_META, XP_PER_LEVEL: XP_PER_LEVEL, AVATAR_DIR: AVATAR_DIR, NIVEL_DIR: NIVEL_DIR, LEVELS: LEVELS, MOODS: MOODS, BADGES: BADGES, DATA_SOURCES: DATA_SOURCES, VIEWS: VIEWS, VIEWS_DOCENTE: VIEWS_DOCENTE, CODIGO_DOCENTE_INICIAL: CODIGO_DOCENTE_INICIAL, EXAMENES_URL: EXAMENES_URL, CONTACTO: CONTACTO, GRADES: GRADES, GROUPS: GROUPS, GENDERS: GENDERS, DEFAULT_CONFIG: DEFAULT_CONFIG, HEADERS: HEADERS, MISIONES_POR_PERIODO: MISIONES_POR_PERIODO, MISIONES: MISIONES, SEED_ACTIVITIES: SEED_ACTIVITIES, nombreMisionPorDefecto: nombreMisionPorDefecto, TIPOS_AVISO: TIPOS_AVISO, MAX_RESPALDOS: MAX_RESPALDOS };
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

const { APP, PERIODS, MISIONES, CATEGORIES, SEED_ACTIVITIES, DEFAULT_CONFIG, CODIGO_DOCENTE_INICIAL, MAX_RESPALDOS, nombreMisionPorDefecto } = __M_config;
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

/**
 * Hash del código docente.
 * Es OFUSCACIÓN, no criptografía: evita que el código se lea de un vistazo al
 * abrir el .json, pero cualquiera con conocimientos puede saltárselo, porque
 * todo se ejecuta en el navegador. La barrera real es no compartir el código.
 */
function hashCodigo(texto) {
  const s = 'academia-code:' + String(texto == null ? '' : texto).trim();
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let ronda = 0; ronda < 512; ronda++) {
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i) + ronda;
      h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
      h2 = (Math.imul(h2 + c, 2654435761) ^ (h1 >>> 7)) >>> 0;
    }
  }
  return (h1 >>> 0).toString(36) + '-' + (h2 >>> 0).toString(36);
}

/** ¿Este código abre el panel del docente? */
function esDocente(codigo) {
  const guardado = (db.config || {}).teacherHash;
  const objetivo = guardado || hashCodigo(CODIGO_DOCENTE_INICIAL);
  return hashCodigo(codigo) === objetivo;
}

function cambiarCodigoDocente(nuevo) {
  const limpio = String(nuevo || '').trim();
  if (limpio.length < 6) throw new Error('El código debe tener al menos 6 caracteres.');
  db.config.teacherHash = hashCodigo(limpio);
  guardar();
  return true;
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
    config: Object.assign({}, DEFAULT_CONFIG, { teacherHash: db.config.teacherHash }),
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


return { uid: uid, sello: sello, hashCodigo: hashCodigo, esDocente: esDocente, cambiarCodigoDocente: cambiarCodigoDocente, serializar: serializar, alGuardarBase: alGuardarBase, guardar: guardar, agregarEstudiante: agregarEstudiante, editarEstudiante: editarEstudiante, eliminarEstudiante: eliminarEstudiante, buscarCodigo: buscarCodigo, importarEstudiantes: importarEstudiantes, asegurarActividades: asegurarActividades, actividadesOrdenadas: actividadesOrdenadas, renombrarActividad: renombrarActividad, renombrarMision: renombrarMision, ponerNota: ponerNota, guardarConfig: guardarConfig, agregarAviso: agregarAviso, eliminarAviso: eliminarAviso, jsonBlob: jsonBlob, nombreArchivo: nombreArchivo, cargarBase: cargarBase, vaciar: vaciar, bodega: bodega, conectarCarpeta: conectarCarpeta, recuperarCarpeta: recuperarCarpeta, autorizarCarpeta: autorizarCarpeta, olvidarCarpeta: olvidarCarpeta, respaldar: respaldar, listarRespaldos: listarRespaldos, restaurarRespaldo: restaurarRespaldo, diagnostico: diagnostico, tamanoBase: tamanoBase, APP: APP };
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

/* ---------- docente/filtros.js ---------- */
var __M_docente_filtros = (function () {
/* ============================================================================
   docente/filtros.js — Los desplegables de filtro, hechos con lo que hay
   ----------------------------------------------------------------------------
   Nada de listas fijas de 6.º a 11.º: las opciones salen de los estudiantes
   realmente cargados, así que si el curso es de tercero, aparece tercero.
   ========================================================================== */

const { esc } = __M_ui;
const { db, gradosEnBase, gruposEnBase, norm } = __M_datos;
/** Desplegable de grado con lo que existe en la base. */
function selectGrado(id, valor) {
  const grados = gradosEnBase();
  return `
  <label class="selector">
    <span>Grado</span>
    <select id="${esc(id)}" ${grados.length ? '' : 'disabled'}>
      <option value="">${grados.length ? 'Todos los grados' : 'Sin grados aún'}</option>
      ${grados.map((g) => `<option value="${esc(g)}" ${g === valor ? 'selected' : ''}>${esc(g)}°</option>`).join('')}
    </select>
  </label>`;
}

/** Desplegable de grupo; si se pasa un grado, solo muestra los suyos. */
function selectGrupo(id, valor, grado) {
  const grupos = gruposEnBase(grado);
  return `
  <label class="selector">
    <span>Grupo</span>
    <select id="${esc(id)}" ${grupos.length ? '' : 'disabled'}>
      <option value="">${grupos.length ? 'Todos los grupos' : 'Sin grupos aún'}</option>
      ${grupos.map((g) => `<option value="${esc(g)}" ${g === valor ? 'selected' : ''}>${esc(g)}</option>`).join('')}
    </select>
  </label>`;
}

/** Desplegable de estudiante, limitado a los que pasan los filtros de arriba. */
function selectEstudiante(id, valor, lista, etiqueta) {
  const ordenados = lista.slice().sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return `
  <label class="selector">
    <span>${esc(etiqueta || 'Estudiante')}</span>
    <select id="${esc(id)}" ${ordenados.length ? '' : 'disabled'}>
      <option value="">${ordenados.length ? 'Todo el grupo' : 'Sin estudiantes'}</option>
      ${ordenados.map((s) => `<option value="${esc(s.id)}" ${s.id === valor ? 'selected' : ''}>
        ${esc(s.name)} · ${esc(s.code)}</option>`).join('')}
    </select>
  </label>`;
}

/** Listas de sugerencias para los formularios de alta y edición. */
function datalists() {
  const grados = [...new Set(gradosEnBase().concat(['6', '7', '8', '9', '10', '11']))]
    .sort((a, b) => (Number(a) - Number(b)) || String(a).localeCompare(String(b), 'es'));
  const grupos = [...new Set(gruposEnBase().concat(['A', 'B', 'C', 'D']))]
    .sort((a, b) => String(a).localeCompare(String(b), 'es'));
  return `
    <datalist id="lista-grados">${grados.map((g) => `<option value="${esc(g)}"></option>`).join('')}</datalist>
    <datalist id="lista-grupos">${grupos.map((g) => `<option value="${esc(g)}"></option>`).join('')}</datalist>`;
}

/**
 * Filtro común a casi todas las vistas del docente.
 * @param {object} f  {grade, group, sid, q}
 */
function aplicar(f) {
  const q = norm(f.q || '');
  return db.students.filter((s) => {
    if (f.grade && s.grade !== f.grade) return false;
    if (f.group && s.group !== f.group) return false;
    if (f.sid && s.id !== f.sid) return false;
    if (q && norm(s.name).indexOf(q) < 0 && norm(s.code).indexOf(q) < 0) return false;
    return true;
  }).sort((a, b) => {
    if (a.grade !== b.grade) return (Number(a.grade) - Number(b.grade)) ||
      String(a.grade).localeCompare(String(b.grade), 'es');
    if (a.group !== b.group) return String(a.group).localeCompare(String(b.group), 'es');
    return a.name.localeCompare(b.name, 'es');
  });
}

/** Deja el filtro coherente: si el grado ya no tiene ese grupo, se limpia. */
function sanear(f) {
  if (f.grade && gradosEnBase().indexOf(f.grade) < 0) f.grade = '';
  if (f.group && gruposEnBase(f.grade).indexOf(f.group) < 0) f.group = '';
  if (f.sid && !db.students.some((s) => s.id === f.sid)) f.sid = '';
  return f;
}

return { selectGrado: selectGrado, selectGrupo: selectGrupo, selectEstudiante: selectEstudiante, datalists: datalists, aplicar: aplicar, sanear: sanear };
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

const { SCALE, PERIODS, MISIONES, CATEGORIES, CAT, RANKS, PERFORMANCE, ERAS, MOODS, LEVELS, MAX_LEVEL, AVATAR_DIR, NIVEL_DIR, XP_PER_POINT, XP_MAX, XP_MAX_PERIODO, XP_PER_LEVEL, XP_META, MISIONES_TOTALES, PROMEDIO_META, BADGES } = __M_config;
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


return { redondear: redondear, fmt: fmt, rango: rango, desempeno: desempeno, eraDe: eraDe, notaDe: notaDe, nombreDeMision: nombreDeMision, notaCat: notaCat, promedioPeriodo: promedioPeriodo, promedioGlobal: promedioGlobal, promedioCategoria: promedioCategoria, promedioDe: promedioDe, promedioCatDe: promedioCatDe, periodoActual: periodoActual, actividades: actividades, promedioMision: promedioMision, misiones: misiones, avanceMisiones: avanceMisiones, avanceDeMisiones: avanceDeMisiones, racha: racha, xp: xp, xpDePeriodo: xpDePeriodo, promedioParaNivel: promedioParaNivel, nivel: nivel, xpDeNivel: xpDeNivel, xpNivel: xpNivel, retratoNivel: retratoNivel, avatarNivel: avatarNivel, nombreNivel: nombreNivel, identidad: identidad, avatarDe: avatarDe, escalera: escalera, animo: animo, puntos: puntos, puntosMax: puntosMax, tabla: tabla, companeros: companeros, posicionEn: posicionEn, insignias: insignias, retroalimentacion: retroalimentacion, avisosDe: avisosDe, perfil: perfil, xpPorPeriodo: xpPorPeriodo, CATEGORIES: CATEGORIES, CAT: CAT, PERIODS: PERIODS, MISIONES: MISIONES, SCALE: SCALE, LEVELS: LEVELS, MAX_LEVEL: MAX_LEVEL, XP_PER_LEVEL: XP_PER_LEVEL, XP_MAX: XP_MAX, XP_META: XP_META, PROMEDIO_META: PROMEDIO_META, MISIONES_TOTALES: MISIONES_TOTALES };
})();

/* ---------- docente/centro.js ---------- */
var __M_docente_centro = (function () {
/* ============================================================================
   docente/centro.js — Centro de Mando: pulso del curso y avisos
   ========================================================================== */

const { $, $$, el, esc, rgb, contar, animarBarras, modal, cerrarModal, toast } = __M_ui;
const { db, gradosEnBase, gruposEnBase } = __M_datos;
const M = __M_motor;
const G = __M_graficas;
const A = __M_almacen;
const { CATEGORIES, PERFORMANCE, SCALE, TIPOS_AVISO, MAX_LEVEL } = __M_config;
const F = __M_docente_filtros;
const f = { grade: '', group: '', sid: '' };

function filtrados() {
  F.sanear(f);
  return F.aplicar(f);
}

/** Los que caben en el desplegable de estudiante: los del grado y grupo elegidos. */
function candidatos() {
  return F.aplicar({ grade: f.grade, group: f.group });
}

function cursos(lista) {
  const mapa = new Map();
  lista.forEach((s) => {
    const k = s.grade + '° ' + s.group;
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k).push(s);
  });
  return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es', { numeric: true }));
}

function kpi(icono, valor, etiqueta, color, extra, dec) {
  return `
    <article class="kpi" style="--c:${color};--c-rgb:${rgb(color)}">
      <div class="kpi__ico"><i class="fa-solid ${icono}"></i></div>
      <div class="kpi__cuerpo">
        <p class="kpi__valor" data-contar="${valor}" data-dec="${dec || 0}">0</p>
        <p class="kpi__etq">${esc(etiqueta)}</p>
        ${extra ? `<p class="kpi__extra">${extra}</p>` : ''}
      </div>
    </article>`;
}

function riesgoHTML(lista) {
  const enRiesgo = lista.map((s) => ({ st: s, avg: M.promedioGlobal(s.id) }))
    .filter((r) => r.avg !== null && r.avg < SCALE.pass)
    .sort((a, b) => a.avg - b.avg);

  if (!enRiesgo.length) {
    return `<div class="vacio"><i class="fa-solid fa-shield-heart"></i>
      <h4>Nadie por debajo de ${SCALE.pass.toFixed(1)}</h4>
      <p>Todo el grupo va aprobando con lo registrado hasta ahora.</p></div>`;
  }

  return `<ul class="riesgo">${enRiesgo.map((r) => {
    const av = M.avanceMisiones(r.st.id);
    return `
    <li class="riesgo__fila">
      <img src="${esc(M.avatarDe(r.st))}" alt="" loading="lazy">
      <div class="riesgo__txt">
        <b>${esc(r.st.name)}</b>
        <small>${esc(r.st.code)} · ${esc(r.st.grade)}° ${esc(r.st.group)} · ${av.hechas}/${av.total} actividades</small>
      </div>
      <span class="riesgo__nota">${M.fmt(r.avg)}</span>
    </li>`;
  }).join('')}</ul>`;
}

function avisosHTML() {
  const avisos = db.avisos || [];
  if (!avisos.length) {
    return `<div class="vacio"><i class="fa-solid fa-bullhorn"></i>
      <h4>Sin avisos publicados</h4><p>Los avisos aparecen en el panel de los estudiantes.</p></div>`;
  }
  return `<ul class="avisos">${avisos.map((a) => {
    const t = TIPOS_AVISO.find((x) => x.key === a.tipo) || TIPOS_AVISO[1];
    const al = a.alcance || {};
    const destino = al.code ? 'Solo ' + al.code
      : (al.grade || al.group) ? [al.grade ? al.grade + '°' : '', al.group || ''].join(' ').trim()
      : 'Todos';
    return `
    <li class="aviso" style="--c:${t.color};--c-rgb:${rgb(t.color)}">
      <span class="aviso__ico"><i class="fa-solid ${t.icon}"></i></span>
      <div class="aviso__cuerpo">
        <div class="aviso__cab">
          <h3>${esc(a.titulo || t.label)}</h3>
          <span class="pill pill--mini" style="--c:${t.color}">${esc(t.label)}</span>
          <span class="pill pill--mini"><i class="fa-solid fa-users"></i> ${esc(destino)}</span>
        </div>
        <p>${esc(a.texto || '')}</p>
        <p class="aviso__fecha"><i class="fa-regular fa-calendar"></i> ${esc(a.fecha || '')}</p>
      </div>
      <button class="btn-icono btn-icono--mini" data-borrar-aviso="${esc(a.id)}"
              title="Eliminar aviso"><i class="fa-solid fa-trash"></i></button>
    </li>`;
  }).join('')}</ul>`;
}

function dialogoAviso(recargar) {
  const cuerpo = el('form', { class: 'formulario', id: 'form-aviso' },
    el('label', { class: 'campo' },
      el('span', { class: 'campo__etq', text: 'Título' }),
      el('input', { name: 'titulo', type: 'text', required: 'required', placeholder: 'Se abre el Periodo 4' })),
    el('label', { class: 'campo' },
      el('span', { class: 'campo__etq', text: 'Mensaje' }),
      el('textarea', { name: 'texto', rows: '4', required: 'required',
        placeholder: 'Las cuatro misiones se entregan hasta el 30 de octubre.' })),
    el('div', { class: 'formulario__fila' },
      el('label', { class: 'campo' },
        el('span', { class: 'campo__etq', text: 'Tipo' }),
        el('select', { name: 'tipo' },
          ...TIPOS_AVISO.map((t) => el('option', { value: t.key, text: t.label })))),
      el('label', { class: 'campo' },
        el('span', { class: 'campo__etq', text: 'Grado (opcional)' }),
        el('select', { name: 'grade' },
          el('option', { value: '', text: 'Todos' }),
          ...gradosEnBase().map((g) => el('option', { value: g, text: g + '°' })))),
      el('label', { class: 'campo' },
        el('span', { class: 'campo__etq', text: 'Grupo (opcional)' }),
        el('select', { name: 'group' },
          el('option', { value: '', text: 'Todos' }),
          ...gruposEnBase().map((g) => el('option', { value: g, text: g }))))),
    el('label', { class: 'campo' },
      el('span', { class: 'campo__etq', text: 'Código de un solo estudiante (opcional)' }),
      el('input', { name: 'code', type: 'text', placeholder: 'CODE-0001' })),
    el('button', { class: 'btn btn--ancho', type: 'submit' },
      el('i', { class: 'fa-solid fa-paper-plane' }), ' Publicar aviso')
  );

  modal({ titulo: 'Nuevo aviso', subtitulo: 'Aparecerá en el panel de los estudiantes', ancho: '560px', cuerpo });

  cuerpo.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(cuerpo).entries());
    const alcance = {};
    if (d.grade) alcance.grade = d.grade;
    if (d.group) alcance.group = d.group;
    if (d.code) alcance.code = d.code.trim();
    A.agregarAviso({ titulo: d.titulo.trim(), texto: d.texto.trim(), tipo: d.tipo, alcance });
    cerrarModal();
    toast('Aviso publicado', 'Ya lo ven los estudiantes que corresponden.', 'ok');
    recargar();
  });
}

/** Cuando el filtro apunta a un solo estudiante, se muestra su ficha arriba. */
function fichaEstudiante(st) {
  if (!st) return '';
  const p = M.perfil(st);
  const av = M.avanceMisiones(st.id);
  const mis = M.avanceDeMisiones(st.id);
  return `
  <section class="ficha-est" style="--c:${p.identidad.color};--c-rgb:${rgb(p.identidad.color)}">
    <img src="${esc(p.avatar)}" alt="" loading="lazy">
    <div class="ficha-est__txt">
      <p class="ficha-est__eyebrow"><i class="fa-solid ${p.identidad.icon}"></i>
        Nivel ${p.identidad.n} de ${MAX_LEVEL} · ${esc(p.identidad.nombre)}</p>
      <h2>${esc(st.name)}</h2>
      <p class="ficha-est__meta">${esc(st.code)} · ${esc(st.grade)}° ${esc(st.group)} ·
        puesto ${p.posCurso.pos || '—'} de ${p.posCurso.total} en su curso</p>
    </div>
    <div class="ficha-est__datos">
      <div><b style="color:${p.desempeno.color}">${M.fmt(p.global)}</b><span>Promedio</span></div>
      <div><b>${p.xp}</b><span>XP</span></div>
      <div><b>${mis.completas}/${mis.total}</b><span>Misiones</span></div>
      <div><b>${av.hechas}/${av.total}</b><span>Actividades</span></div>
    </div>
  </section>`;
}

function pintar(lista) {
  if (!G.hayChart()) return;

  G.linea('d-evolucion', M.PERIODS.map((x) => 'Periodo ' + x), [
    { label: 'Promedio del grupo', color: '#22d3ee',
      datos: M.PERIODS.map((x) => M.redondear(M.promedioDe(lista, x), 2)) },
    { label: 'Aprobación', color: '#f87171', punteada: true, relleno: false,
      datos: M.PERIODS.map(() => SCALE.pass) }
  ]);

  const reparto = PERFORMANCE.map((d) => lista.filter((s) => {
    const v = M.promedioGlobal(s.id);
    return v !== null && M.desempeno(v).key === d.key;
  }).length);
  G.rosquilla('d-desempenos', PERFORMANCE.map((d) => d.label), reparto, PERFORMANCE.map((d) => d.color));

  const porCurso = cursos(lista);
  G.barras('d-cursos', porCurso.map((c) => c[0]), [{
    label: 'Promedio', color: '#a855f7',
    datos: porCurso.map((c) => M.redondear(M.promedioDe(c[1]), 2))
  }], { grosor: 34 });

  G.radar('d-categorias', CATEGORIES.map((c) => c.short), [{
    label: 'Promedio del grupo', color: '#34d399',
    datos: CATEGORIES.map((c) => M.redondear(M.promedioCatDe(lista, c.key), 2))
  }]);
}

function render(cont) {
  const lista = filtrados();
  const prom = M.promedioDe(lista);
  const enRiesgo = lista.filter((s) => {
    const v = M.promedioGlobal(s.id);
    return v !== null && v < SCALE.pass;
  }).length;

  let hechas = 0, totales = 0;
  lista.forEach((s) => { const a = M.avanceMisiones(s.id); hechas += a.hechas; totales += a.total; });
  const avance = totales ? Math.round(hechas / totales * 100) : 0;

  cont.innerHTML = `
  <div class="cab-vista">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-gauge-high"></i> Centro de Mando</h1>
      <p class="cab-vista__s">El pulso de tus cursos con lo que llevas registrado.</p>
    </div>
    <button class="btn" id="d-nuevo-aviso"><i class="fa-solid fa-bullhorn"></i> Publicar aviso</button>
  </div>

  <div class="filtros">
    ${F.selectGrado('d-grade', f.grade)}
    ${F.selectGrupo('d-group', f.group, f.grade)}
    ${F.selectEstudiante('d-sid', f.sid, candidatos())}
  </div>

  ${f.sid ? fichaEstudiante(lista[0]) : ''}

  <div class="kpis kpis--4">
    ${kpi('fa-users', lista.length, 'Estudiantes', '#22d3ee', `de ${db.students.length} en la academia`)}
    ${kpi('fa-star', prom === null ? 0 : prom, 'Promedio del grupo', '#a855f7',
      `Aprobación desde ${SCALE.pass.toFixed(1)}`, 1)}
    ${kpi('fa-list-check', avance, 'Misiones calificadas', '#34d399', `${hechas} de ${totales}`)}
    ${kpi('fa-triangle-exclamation', enRiesgo, 'En riesgo', '#f87171', 'Promedio por debajo de 7.0')}
  </div>

  <div class="rejilla rejilla--2">
    <section class="tarjeta">
      <header class="tarjeta__head"><h2><i class="fa-solid fa-chart-line"></i> Promedio por periodo</h2></header>
      <div class="lienzo" style="height:280px"><canvas id="d-evolucion"></canvas></div>
    </section>
    <section class="tarjeta">
      <header class="tarjeta__head"><h2><i class="fa-solid fa-chart-pie"></i> Reparto de desempeños</h2></header>
      <div class="lienzo" style="height:280px"><canvas id="d-desempenos"></canvas></div>
    </section>
  </div>

  <div class="rejilla rejilla--2">
    <section class="tarjeta">
      <header class="tarjeta__head"><h2><i class="fa-solid fa-chart-column"></i> Promedio por curso</h2></header>
      <div class="lienzo" style="height:280px"><canvas id="d-cursos"></canvas></div>
    </section>
    <section class="tarjeta">
      <header class="tarjeta__head"><h2><i class="fa-solid fa-satellite-dish"></i> Fortalezas por categoría</h2></header>
      <div class="lienzo" style="height:280px"><canvas id="d-categorias"></canvas></div>
    </section>
  </div>

  <div class="rejilla rejilla--2">
    <section class="tarjeta">
      <header class="tarjeta__head">
        <h2><i class="fa-solid fa-triangle-exclamation"></i> Monitor de riesgo</h2>
        <span class="pill" style="--c:#f87171">${enRiesgo} en alerta</span>
      </header>
      ${riesgoHTML(lista)}
    </section>
    <section class="tarjeta">
      <header class="tarjeta__head">
        <h2><i class="fa-solid fa-bullhorn"></i> Avisos publicados</h2>
        <span class="pill">${(db.avisos || []).length}</span>
      </header>
      ${avisosHTML()}
    </section>
  </div>
  `;

  $$('[data-contar]', cont).forEach((n) => contar(n, Number(n.dataset.contar), {
    dec: Number(n.dataset.dec || 0)
  }));
  animarBarras(cont);

  $('#d-grade', cont).addEventListener('change', (e) => {
    f.grade = e.target.value; f.group = ''; f.sid = ''; render(cont);
  });
  $('#d-group', cont).addEventListener('change', (e) => {
    f.group = e.target.value; f.sid = ''; render(cont);
  });
  $('#d-sid', cont).addEventListener('change', (e) => { f.sid = e.target.value; render(cont); });

  $('#d-nuevo-aviso', cont).addEventListener('click', () => dialogoAviso(() => render(cont)));

  $$('[data-borrar-aviso]', cont).forEach((b) => b.addEventListener('click', () => {
    A.eliminarAviso(b.dataset.borrarAviso);
    toast('Aviso eliminado', '', 'ok');
    render(cont);
  }));

  pintar(lista);
}

function limpiar() {
  ['d-evolucion', 'd-desempenos', 'd-cursos', 'd-categorias'].forEach(G.destruir);
}

return { render: render, limpiar: limpiar };
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

/* ---------- docente/clasificacion.js ---------- */
var __M_docente_clasificacion = (function () {
/* ============================================================================
   docente/clasificacion.js — Ranking completo de la academia, con exportación
   ========================================================================== */

const { $, $$, esc, rgb, animarBarras, toast } = __M_ui;
const { db, norm } = __M_datos;
const M = __M_motor;
const X = __M_excel;
const { RANKS, MAX_LEVEL } = __M_config;
const F = __M_docente_filtros;
const f = { grade: '', group: '', metrica: 'global', rango: '', q: '' };

function base() {
  F.sanear(f);
  return M.tabla(F.aplicar({ grade: f.grade, group: f.group }), f.metrica);
}

function filtrar(filas) {
  const q = norm(f.q);
  return filas.filter((r) => {
    if (f.rango && r.rango.key !== f.rango) return false;
    if (q && norm(r.st.name).indexOf(q) < 0 && norm(r.st.code).indexOf(q) < 0) return false;
    return true;
  });
}

function exportar(filas) {
  try {
    const datos = filas.map((r) => ({
      'Puesto': r.pos,
      'Nombre completo': r.st.name,
      'Código': r.st.code,
      'Grado': r.st.grade,
      'Grupo': r.st.group,
      'Promedio': M.redondear(r.promedio, 1),
      'Desempeño': M.desempeno(r.promedio).label,
      'Rango': r.rango.name,
      'XP de la métrica': r.puntos === null ? '' : r.puntos,
      'XP del año': r.xp,
      'Nivel': r.nivel,
      'Identidad': M.identidad(r.st).nombre,
      'Misiones': r.avance.hechas + '/' + r.avance.total
    }));
    toast('Excel generado', X.exportarRanking(datos), 'ok');
  } catch (e) {
    toast('No se pudo exportar', e.message, 'err');
  }
}

function podio(filas) {
  const top = filas.slice(0, 3);
  if (top.length < 3) return '';
  const orden = [1, 0, 2];
  const medallas = ['#fbbf24', '#cbd5e1', '#d97706'];
  return `
  <section class="podio">
    ${orden.map((i) => {
      const r = top[i];
      const id = M.identidad(r.st);
      return `
      <article class="podio__p podio__p--${i + 1}" style="--c:${medallas[i]};--c-rgb:${rgb(medallas[i])}">
        <div class="podio__corona">${i === 0 ? '<i class="fa-solid fa-crown"></i>' : ''}</div>
        <div class="podio__foto">
          <img src="${esc(M.avatarDe(r.st))}" alt="${esc(r.st.name)}" loading="lazy">
          <span class="podio__pos">${r.pos}</span>
        </div>
        <p class="podio__nombre">${esc(r.st.name)}</p>
        <p class="podio__curso">${esc(r.st.grade)}° ${esc(r.st.group)}</p>
        <p class="podio__xp"><i class="fa-solid fa-bolt"></i> ${r.puntos === null ? '—' : r.puntos} XP</p>
        <span class="podio__rango" style="--c:${id.color}">
          <i class="fa-solid ${id.icon}"></i>Nv.${id.n} ${esc(id.nombre)}</span>
        <div class="podio__base"></div>
      </article>`;
    }).join('')}
  </section>`;
}

function refrescar(cont) {
  const todas = base();
  const filas = filtrar(todas);

  $('#zona-podio-d', cont).innerHTML = (f.q || f.rango) ? '' : podio(todas);

  $('#tb-clas', cont).innerHTML = filas.length ? filas.map((r) => {
    const id = M.identidad(r.st);
    const d = M.desempeno(r.promedio);
    const medalla = r.pos <= 3 ? ['#fbbf24', '#cbd5e1', '#d97706'][r.pos - 1] : null;
    return `
    <tr>
      <td class="c"><span class="pos ${medalla ? 'pos--medalla' : ''}"
        ${medalla ? `style="--c:${medalla}"` : ''}>${medalla ? '<i class="fa-solid fa-medal"></i>' : ''}${r.pos}</span></td>
      <td>
        <div class="recluta">
          <img src="${esc(M.avatarDe(r.st))}" alt="" loading="lazy">
          <div><b>${esc(r.st.name)}</b><small class="mono">${esc(r.st.code)} · ${esc(r.st.grade)}° ${esc(r.st.group)}</small></div>
        </div>
      </td>
      <td class="c"><b style="color:${r.promedio === null ? 'var(--txt-3)' : d.color}">${M.fmt(r.promedio)}</b></td>
      <td class="c oculta-mv"><span class="pill pill--mini" style="--c:${id.color}">Nv.${id.n} ${esc(id.nombre)}</span></td>
      <td class="c"><b>${r.puntos === null ? '—' : r.puntos}</b><small class="tenue"> XP</small></td>
      <td class="c oculta-mv"><span class="pill pill--mini" style="--c:${r.rango.color}">
        <i class="fa-solid ${r.rango.icon}"></i>${esc(r.rango.name)}</span></td>
      <td class="oculta-mv">
        <div class="barra barra--mini"><i class="barra__val"
          data-anim-barra="${((r.puntos || 0) / M.puntosMax(f.metrica) * 100).toFixed(1)}"
          style="background:${id.color}"></i></div>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="7"><div class="vacio"><i class="fa-solid fa-user-slash"></i>
      <h4>Sin resultados</h4><p>Prueba con otro filtro.</p></div></td></tr>`;

  $('#resumen-clas', cont).textContent = filas.length + ' de ' + todas.length + ' estudiantes';
  animarBarras(cont);
  return filas;
}

function render(cont) {
  cont.innerHTML = `
  <div class="cab-vista">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-ranking-star"></i> Ranking de la academia</h1>
      <p class="cab-vista__s">Ordenado por experiencia acumulada, igual que lo ven los estudiantes.</p>
    </div>
    <button class="btn btn--ghost" id="c-exportar"><i class="fa-solid fa-file-excel"></i> Exportar</button>
  </div>

  <div class="filtros">
    ${F.selectGrado('c-grade', f.grade)}
    ${F.selectGrupo('c-group', f.group, f.grade)}
    <label class="selector">
      <span>Métrica</span>
      <select id="c-metrica">
        <option value="global">Consolidado del año</option>
        ${M.PERIODS.map((x) => `<option value="${x}">Periodo ${x}</option>`).join('')}
      </select>
    </label>
    <label class="selector">
      <span>Rango</span>
      <select id="c-rango"><option value="">Todos</option>
        ${RANKS.map((r) => `<option value="${r.key}">${esc(r.name)}</option>`).join('')}</select>
    </label>
    <label class="buscador">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input id="c-q" type="search" placeholder="Buscar…" autocomplete="off">
    </label>
  </div>

  <div id="zona-podio-d"></div>

  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-list-ol"></i> Clasificación</h2>
      <p class="resumen" id="resumen-clas"></p>
    </header>
    <div class="tabla-wrap">
      <table class="tabla tabla--rank">
        <thead><tr><th class="c">#</th><th>Estudiante</th><th class="c">Promedio</th>
          <th class="c oculta-mv">Nivel (de ${MAX_LEVEL})</th><th class="c">XP</th>
          <th class="c oculta-mv">Rango</th><th class="oculta-mv">Progreso</th></tr></thead>
        <tbody id="tb-clas"></tbody>
      </table>
    </div>
  </section>
  `;

  $('#c-grade', cont).addEventListener('change', (e) => {
    f.grade = e.target.value; f.group = ''; render(cont);
  });
  $('#c-group', cont).addEventListener('change', (e) => { f.group = e.target.value; render(cont); });
  ['metrica', 'rango'].forEach((k) => {
    const sel = $('#c-' + k, cont);
    sel.value = f[k];
    sel.addEventListener('change', (e) => { f[k] = e.target.value; refrescar(cont); });
  });

  $('#c-q', cont).value = f.q;
  let t = null;
  $('#c-q', cont).addEventListener('input', (e) => {
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { f.q = v; refrescar(cont); }, 200);
  });

  $('#c-exportar', cont).addEventListener('click', () => exportar(filtrar(base())));

  refrescar(cont);
}

return { render: render };
})();

/* ---------- docente/consola.js ---------- */
var __M_docente_consola = (function () {
/* ============================================================================
   docente/consola.js — Institución, código de acceso, carpeta y respaldos
   ========================================================================== */

const { $, $$, el, esc, modal, cerrarModal, toast, descargar, fecha } = __M_ui;
const { db } = __M_datos;
const A = __M_almacen;
const { APP, CATEGORIES, MAX_RESPALDOS, CODIGO_DOCENTE_INICIAL } = __M_config;
function kb(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

/* --------------------------- datos institucionales ------------------------ */

function seccionInstitucion() {
  const c = db.config;
  return `
  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-building-columns"></i> Datos de la institución</h2>
      <span class="pill">Salen en boletines y escarapelas</span>
    </header>
    <form class="formulario" id="form-inst">
      <label class="campo">
        <span class="campo__etq">Institución</span>
        <input name="institution" type="text" value="${esc(c.institution || '')}" required>
      </label>
      <div class="formulario__fila">
        <label class="campo">
          <span class="campo__etq">Docente</span>
          <input name="teacher" type="text" value="${esc(c.teacher || '')}">
        </label>
        <label class="campo">
          <span class="campo__etq">Asignatura</span>
          <input name="subject" type="text" value="${esc(c.subject || '')}">
        </label>
      </div>
      <div class="formulario__fila">
        <label class="campo">
          <span class="campo__etq">Año lectivo</span>
          <input name="year" type="text" value="${esc(c.year || '')}" inputmode="numeric">
        </label>
        <label class="campo">
          <span class="campo__etq">Sigla del logo (máx. 5)</span>
          <input name="logo" type="text" value="${esc(c.logo || '')}" maxlength="5">
        </label>
      </div>
      <label class="campo">
        <span class="campo__etq">Portal de exámenes (enlace)</span>
        <input name="examUrl" type="url" value="${esc(c.examUrl || '')}"
               placeholder="https://examenes.tuinstitucion.edu.co" spellcheck="false">
      </label>
      <p class="formulario__nota">
        Es el enlace del botón <b>Exámenes</b> de la portada. Si lo dejas vacío, ese botón
        avisa de que todavía no está configurado.
      </p>
      <button class="btn" type="submit"><i class="fa-solid fa-floppy-disk"></i> Guardar datos</button>
    </form>
  </section>`;
}

/* ------------------------------ ponderaciones ----------------------------- */

function seccionPesos() {
  const w = db.config.weights || {};
  const total = CATEGORIES.reduce((acc, c) => acc + (w[c.key] || 0), 0);
  return `
  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-scale-balanced"></i> Ponderaciones</h2>
      <span class="pill" style="--c:${total === 100 ? '#34d399' : '#fbbf24'}">Suman ${total} %</span>
    </header>
    <form class="formulario" id="form-pesos-consola">
      ${CATEGORIES.map((c) => `
        <label class="campo campo--fila">
          <span class="campo__etq"><i class="fa-solid ${c.icon}" style="color:${c.color}"></i> ${esc(c.label)}</span>
          <input name="${c.key}" type="number" min="0" max="100" step="1" value="${w[c.key] || 0}">
        </label>`).join('')}
      <button class="btn" type="submit"><i class="fa-solid fa-floppy-disk"></i> Guardar ponderaciones</button>
    </form>
  </section>`;
}

/* ------------------------------ código docente ---------------------------- */

function seccionCodigo() {
  const inicial = !db.config.teacherHash;
  return `
  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-key"></i> Código de acceso del docente</h2>
      ${inicial ? '<span class="pill" style="--c:#fbbf24">Sigue el de fábrica</span>'
                : '<span class="pill" style="--c:#34d399">Personalizado</span>'}
    </header>
    <form class="formulario" id="form-codigo">
      <div class="formulario__fila">
        <label class="campo">
          <span class="campo__etq">Código actual</span>
          <input name="actual" type="password" autocomplete="current-password" required
                 placeholder="${inicial ? CODIGO_DOCENTE_INICIAL : '••••••••'}">
        </label>
        <label class="campo">
          <span class="campo__etq">Código nuevo (mínimo 6)</span>
          <input name="nuevo" type="password" autocomplete="new-password" required minlength="6">
        </label>
        <label class="campo">
          <span class="campo__etq">Repite el nuevo</span>
          <input name="repite" type="password" autocomplete="new-password" required minlength="6">
        </label>
      </div>
      <p class="formulario__nota aviso-suave">
        <i class="fa-solid fa-shield-halved"></i>
        <span>Este código separa tu panel del de los estudiantes, pero <b>no es una contraseña
        segura</b>: todo se ejecuta en el navegador y el archivo de datos viaja contigo. Guárdalo
        como guardarías la llave del salón, y no lo compartas con el curso.</span>
      </p>
      <button class="btn" type="submit"><i class="fa-solid fa-key"></i> Cambiar código</button>
    </form>
  </section>`;
}

/* ------------------------------- carpeta ---------------------------------- */

function seccionCarpeta() {
  const b = A.bodega;
  const estado = !b.soportado
    ? { txt: 'Este navegador no puede escribir en carpetas', color: '#94a3b8', icon: 'fa-circle-info' }
    : b.dir && b.permiso
      ? { txt: 'Conectada a «' + b.nombre + '»', color: '#34d399', icon: 'fa-circle-check' }
      : b.nombre
        ? { txt: 'Carpeta «' + b.nombre + '» pendiente de autorizar', color: '#fbbf24', icon: 'fa-lock' }
        : { txt: 'Sin carpeta conectada · solo se guarda en este navegador', color: '#fbbf24', icon: 'fa-triangle-exclamation' };

  return `
  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-folder-open"></i> Carpeta de datos</h2>
      <span class="pill" style="--c:${estado.color}"><i class="fa-solid ${estado.icon}"></i> ${esc(estado.txt)}</span>
    </header>
    <p class="texto-suave">
      Si conectas la carpeta <b>data</b> del proyecto, cada cambio se escribe también en
      <code>data/academia-code.json</code> — que es justo el archivo que leen tus estudiantes al entrar.
      Sin carpeta conectada, los datos viven solo en este navegador y tendrás que exportar el JSON a mano.
    </p>
    <div class="botonera">
      ${b.soportado ? `<button class="btn" id="cn-conectar">
        <i class="fa-solid fa-plug"></i> ${b.dir ? 'Cambiar carpeta' : 'Conectar carpeta /data'}</button>` : ''}
      ${b.nombre && !b.permiso ? `<button class="btn btn--ghost" id="cn-autorizar">
        <i class="fa-solid fa-unlock"></i> Autorizar carpeta</button>` : ''}
      ${b.nombre ? `<button class="btn btn--ghost" id="cn-olvidar">
        <i class="fa-solid fa-link-slash"></i> Desconectar</button>` : ''}
    </div>
  </section>`;
}

/* ------------------------------- respaldos -------------------------------- */

function seccionRespaldos() {
  return `
  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-shield-halved"></i> Respaldos y copias</h2>
      <span class="pill">Base actual: ${kb(A.tamanoBase())}</span>
    </header>
    <p class="texto-suave">
      Con la carpeta conectada, cada cambio se guarda solo en <code>data/academia-code.json</code>
      y se deja una <b>copia automática al día</b> en <code>data/respaldos/</code>
      (se conservan las ${MAX_RESPALDOS} más recientes). Exporta el JSON cuando quieras llevarte
      la base a otro equipo.
    </p>
    <div class="botonera">
      <button class="btn" id="cn-exportar"><i class="fa-solid fa-file-arrow-down"></i> Exportar JSON</button>
      <button class="btn btn--ghost" id="cn-importar"><i class="fa-solid fa-file-arrow-up"></i> Restaurar desde archivo</button>
      <button class="btn btn--ghost" id="cn-demo"><i class="fa-solid fa-flask"></i> Cargar cohorte de ejemplo</button>
      ${A.bodega.dir ? '<button class="btn btn--ghost" id="cn-respaldar"><i class="fa-solid fa-clock-rotate-left"></i> Crear respaldo con fecha</button>' : ''}
    </div>
    <div id="zona-respaldos"></div>
  </section>`;
}

/* ------------------------------ diagnóstico ------------------------------- */

function seccionDiagnostico() {
  const filas = A.diagnostico();
  return `
  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-stethoscope"></i> Diagnóstico</h2>
      <span class="pill">${APP.name} v${APP.version}</span>
    </header>
    <ul class="diagnostico">
      ${filas.map((d) => `<li class="${d.ok ? 'is-ok' : 'is-mal'}">
        <i class="fa-solid ${d.ok ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
        <span>${esc(d.nombre)}</span>
        <b>${d.ok ? 'Disponible' : 'No disponible'}</b>
      </li>`).join('')}
    </ul>
    <p class="nota-pie"><i class="fa-solid fa-circle-info"></i>
      Si algo sale en rojo, comprueba que la carpeta <code>assets/vendor/</code> viajó con el proyecto
      y recarga con Ctrl + F5.</p>
  </section>`;
}

/* ------------------------------ zona de riesgo ---------------------------- */

function seccionRiesgo() {
  return `
  <section class="tarjeta tarjeta--peligro">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-triangle-exclamation"></i> Zona delicada</h2>
    </header>
    <p class="texto-suave">
      Vaciar la base borra estudiantes, notas y avisos de este navegador (y de la carpeta conectada).
      Exporta un JSON antes de hacerlo.
    </p>
    <div class="botonera">
      <button class="btn btn--peligro" id="cn-vaciar"><i class="fa-solid fa-eraser"></i> Vaciar la base</button>
    </div>
  </section>`;
}

/* --------------------------------- vista ---------------------------------- */

function render(cont) {
  cont.innerHTML = `
  <div class="cab-vista">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-sliders"></i> Consola C.O.D.E.</h1>
      <p class="cab-vista__s">Institución, acceso, dónde se guardan los datos y copias de seguridad.</p>
    </div>
  </div>

  <div class="rejilla rejilla--2">
    ${seccionInstitucion()}
    ${seccionPesos()}
  </div>

  ${seccionCodigo()}

  <div class="rejilla rejilla--2">
    ${seccionCarpeta()}
    ${seccionRespaldos()}
  </div>

  <div class="rejilla rejilla--2">
    ${seccionDiagnostico()}
    ${seccionRiesgo()}
  </div>
  `;

  const recargar = () => render(cont);

  /* --- institución --- */
  $('#form-inst', cont).addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    A.guardarConfig(d);
    toast('Datos guardados', d.institution, 'ok');
    recargar();
  });

  /* --- ponderaciones --- */
  $('#form-pesos-consola', cont).addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const pesos = {};
    let total = 0;
    CATEGORIES.forEach((c) => { pesos[c.key] = Number(form[c.key].value || 0); total += pesos[c.key]; });
    if (total !== 100) { toast('Revisa las ponderaciones', 'Los cuatro pesos deben sumar 100 %.', 'warn'); return; }
    A.guardarConfig({ weights: pesos });
    toast('Ponderaciones guardadas', 'Los promedios se recalcularon.', 'ok');
    recargar();
  });

  /* --- código --- */
  $('#form-codigo', cont).addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    if (!A.esDocente(form.actual.value)) {
      toast('Código actual incorrecto', 'No se cambió nada.', 'err');
      return;
    }
    if (form.nuevo.value !== form.repite.value) {
      toast('Los códigos nuevos no coinciden', 'Escríbelos otra vez.', 'warn');
      return;
    }
    try {
      A.cambiarCodigoDocente(form.nuevo.value);
      toast('Código cambiado', 'Úsalo la próxima vez que entres.', 'ok', 6000);
      recargar();
    } catch (err) {
      toast('No se pudo cambiar', err.message, 'err');
    }
  });

  /* --- carpeta --- */
  const conectar = $('#cn-conectar', cont);
  if (conectar) conectar.addEventListener('click', async () => {
    try {
      const nombre = await A.conectarCarpeta();
      toast('Carpeta conectada', 'Los cambios se escriben en ' + nombre + '/academia-code.json', 'ok', 6000);
      recargar();
    } catch (err) {
      toast('No se pudo conectar', err.message, 'err', 7000);
    }
  });

  const autorizar = $('#cn-autorizar', cont);
  if (autorizar) autorizar.addEventListener('click', async () => {
    const ok = await A.autorizarCarpeta();
    toast(ok ? 'Carpeta autorizada' : 'Permiso denegado', ok ? 'Ya se puede escribir.' : '', ok ? 'ok' : 'warn');
    recargar();
  });

  const olvidar = $('#cn-olvidar', cont);
  if (olvidar) olvidar.addEventListener('click', async () => {
    await A.olvidarCarpeta();
    toast('Carpeta desconectada', 'Los datos siguen en este navegador.', 'info');
    recargar();
  });

  /* --- respaldos --- */
  $('#cn-exportar', cont).addEventListener('click', () => {
    descargar(A.jsonBlob(), A.nombreArchivo());
    toast('JSON exportado', 'Cópialo dentro de data/ para que lo vean los estudiantes.', 'ok', 6000);
  });

  $('#cn-importar', cont).addEventListener('click', () => {
    const input = el('input', { type: 'file', accept: '.json,application/json' });
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const n = A.cargarBase(JSON.parse(await file.text()));
        toast('Base restaurada', n + ' estudiantes cargados.', 'ok');
        recargar();
      } catch (err) {
        toast('No se pudo restaurar', err.message, 'err');
      }
    });
    input.click();
  });

  $('#cn-demo', cont).addEventListener('click', () => {
    const cuerpo = el('div', { class: 'confirmar' },
      el('p', { html: 'Se reemplaza la base actual por la <b>cohorte de ejemplo</b> ' +
        '(70 estudiantes con códigos DEMO-0001…, notas y misiones ya puestas). ' +
        'Sirve para ver el panel lleno y practicar sin miedo.' }),
      el('p', { class: 'texto-suave', html:
        'Se descargará antes una copia de lo que tienes ahora, por si acaso.' }),
      el('div', { class: 'confirmar__botones' },
        el('button', { class: 'btn btn--ghost', onclick: cerrarModal }, 'Cancelar'),
        el('button', {
          class: 'btn',
          onclick: async () => {
            try {
              descargar(A.jsonBlob(), A.nombreArchivo('antes-del-ejemplo'));
              const res = await fetch('data/demo.json', { cache: 'no-store' });
              if (!res.ok) throw new Error('No se encontró data/demo.json');
              const n = A.cargarBase(await res.json());
              cerrarModal();
              toast('Cohorte de ejemplo cargada', n + ' estudiantes de prueba.', 'ok', 6000);
              recargar();
            } catch (err) {
              toast('No se pudo cargar', err.message, 'err');
            }
          }
        }, el('i', { class: 'fa-solid fa-flask' }), ' Cargar ejemplo')));
    modal({ titulo: 'Cargar cohorte de ejemplo', subtitulo: 'Reemplaza la base actual', ancho: '500px', cuerpo });
  });

  const respaldar = $('#cn-respaldar', cont);
  if (respaldar) respaldar.addEventListener('click', async () => {
    try {
      const nombre = await A.respaldar();
      toast('Respaldo creado', 'data/respaldos/' + nombre, 'ok');
      pintarRespaldos();
    } catch (err) {
      toast('No se pudo respaldar', err.message, 'err');
    }
  });

  async function pintarRespaldos() {
    const zona = $('#zona-respaldos', cont);
    if (!zona || !A.bodega.dir) return;
    const copias = await A.listarRespaldos();
    if (!copias.length) {
      zona.innerHTML = '<p class="texto-suave">Todavía no hay copias con fecha.</p>';
      return;
    }
    zona.innerHTML = `
      <div class="tabla-wrap respaldos">
        <table class="tabla">
          <thead><tr><th>Copia</th><th class="c">Tamaño</th><th class="c">Acción</th></tr></thead>
          <tbody>${copias.map((c) => `
            <tr>
              <td><b class="mono">${esc(c.nombre)}</b><small>${esc(fecha(c.fecha.toISOString()))}</small></td>
              <td class="c tenue">${kb(c.tam)}</td>
              <td class="c"><button class="btn btn--ghost btn--mini" data-restaurar="${esc(c.nombre)}">
                <i class="fa-solid fa-clock-rotate-left"></i> Restaurar</button></td>
            </tr>`).join('')}</tbody>
        </table>
      </div>`;

    $$('[data-restaurar]', zona).forEach((b) => b.addEventListener('click', () => {
      const nombre = b.dataset.restaurar;
      const cuerpo = el('div', { class: 'confirmar' },
        el('p', { html: 'Vas a reemplazar la base actual por <b>' + esc(nombre) + '</b>. Lo que no esté respaldado se pierde.' }),
        el('div', { class: 'confirmar__botones' },
          el('button', { class: 'btn btn--ghost', onclick: cerrarModal }, 'Cancelar'),
          el('button', {
            class: 'btn btn--peligro',
            onclick: async () => {
              try {
                const n = await A.restaurarRespaldo(nombre);
                cerrarModal();
                toast('Base restaurada', n + ' estudiantes.', 'ok');
                recargar();
              } catch (err) {
                toast('No se pudo restaurar', err.message, 'err');
              }
            }
          }, el('i', { class: 'fa-solid fa-clock-rotate-left' }), ' Restaurar')));
      modal({ titulo: 'Restaurar copia', subtitulo: nombre, ancho: '480px', cuerpo });
    }));
  }
  pintarRespaldos();

  /* --- vaciar --- */
  $('#cn-vaciar', cont).addEventListener('click', () => {
    const cuerpo = el('div', { class: 'confirmar' },
      el('p', { html: 'Se borrarán <b>' + db.students.length + ' estudiantes</b>, sus notas y los avisos. ' +
        'Esta acción no se puede deshacer.' }),
      el('div', { class: 'confirmar__botones' },
        el('button', { class: 'btn btn--ghost', onclick: cerrarModal }, 'Cancelar'),
        el('button', {
          class: 'btn btn--peligro',
          onclick: () => {
            descargar(A.jsonBlob(), A.nombreArchivo('antes-de-vaciar'));
            A.vaciar();
            cerrarModal();
            toast('Base vaciada', 'Se descargó una copia por si acaso.', 'ok', 6000);
            recargar();
          }
        }, el('i', { class: 'fa-solid fa-eraser' }), ' Vaciar (con copia)')));
    modal({ titulo: 'Vaciar la base', subtitulo: 'Confirmación', ancho: '480px', cuerpo });
  });
}

return { render: render };
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

/* ---------------------------------- PNG ----------------------------------- */

async function nodoAPNG(nodo, escala = 3) {
  const html2canvas = exigirHtml2canvas();
  const lienzo = await html2canvas(nodo, {
    backgroundColor: null, scale: escala, useCORS: true, logging: false
  });
  return lienzo.toDataURL('image/png');
}

async function descargarPNG(nodo, nombre, escala = 3) {
  descargar(await nodoAPNG(nodo, escala), nombre);
  return nombre;
}

/* ---------------------------------- PDF ----------------------------------- */

/**
 * Convierte uno o varios nodos en un PDF carta vertical, una página por nodo.
 * Si un nodo es más alto que la página, se parte en varias.
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
    const lienzo = await html2canvas(lista[i], {
      backgroundColor: fondo, scale: opciones.escala || 2, useCORS: true, logging: false
    });
    const img = lienzo.toDataURL('image/jpeg', 0.92);
    const alto = (lienzo.height * util) / lienzo.width;

    if (i > 0) pdf.addPage();

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

return { CARTA: CARTA, nodoAPNG: nodoAPNG, descargarPNG: descargarPNG, descargarPDF: descargarPDF, congelarQR: congelarQR, descargarHTML: descargarHTML };
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
const { XP_MAX, MAX_LEVEL, CATEGORIES, MISIONES, SCALE } = __M_config;
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
      <img src="${esc(p.avatar)}" alt="Avatar de ${esc(st.name)}" crossorigin="anonymous">
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
      <img src="${esc(id.retrato)}" alt="Nivel ${id.n}: ${esc(id.nombre)}" crossorigin="anonymous">
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

return { textoQR: textoQR, textoDatos: textoDatos, pintarQREn: pintarQREn, escarapelaHTML: escarapelaHTML, reversoHTML: reversoHTML, boletinHTML: boletinHTML, nodoAPNG: nodoAPNG };
})();

/* ---------- docente/credenciales.js ---------- */
var __M_docente_credenciales = (function () {
/* ============================================================================
   docente/credenciales.js — Escarapelas de todo el curso: ver, imprimir, bajar
   ========================================================================== */

const { $, $$, el, esc, animarBarras, modal, toast, descargar } = __M_ui;
const { db, norm } = __M_datos;
const M = __M_motor;
const T = __M_tarjeta;
const E = __M_exportar;
const { RANKS, LEVELS } = __M_config;
const F = __M_docente_filtros;
const f = { grade: '', group: '', rango: '', nivel: '', q: '' };

function lista() {
  F.sanear(f);
  return F.aplicar(f).filter((s) => {
    if (f.rango && M.rango(M.promedioGlobal(s.id)).key !== f.rango) return false;
    if (f.nivel && String(M.nivel(M.xp(s.id))) !== f.nivel) return false;
    return true;
  });
}

/* --------------------------- QR bajo demanda ------------------------------ */

function observarQR(cont) {
  const cajas = $$('[data-qr]', cont);
  if (!cajas.length) return;
  const pinta = (caja) => {
    const st = db.students.find((s) => s.id === caja.dataset.qr);
    if (st) T.pintarQREn(caja, M.perfil(st));
  };
  if (!('IntersectionObserver' in window)) { cajas.forEach(pinta); return; }
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { pinta(e.target); obs.unobserve(e.target); }
    });
  }, { rootMargin: '200px' });
  cajas.forEach((c) => obs.observe(c));
}

/* ----------------------------- exportar en lote --------------------------- */

/** Dibuja las escarapelas fuera de pantalla, con su QR, listas para exportar. */
async function taller(sts) {
  const caja = document.createElement('div');
  caja.className = 'taller-export';
  caja.innerHTML = sts.map((st) =>
    T.escarapelaHTML(M.perfil(st), { qrId: 'qx-' + st.id })).join('');
  document.body.appendChild(caja);
  sts.forEach((st) => {
    const q = caja.querySelector('#qx-' + CSS.escape(st.id));
    if (q) T.pintarQREn(q, M.perfil(st));
  });
  await new Promise((r) => setTimeout(r, 120));
  E.congelarQR(caja);
  return caja;
}

async function exportarPDF(sts) {
  if (!sts.length) { toast('Nada que exportar', 'Ajusta los filtros.', 'warn'); return; }
  toast('Generando PDF…', sts.length + ' escarapelas.', 'info', 2600);
  let caja = null;
  try {
    caja = await taller(sts);
    const nombre = sts.length === 1
      ? 'escarapela-' + sts[0].code + '.pdf'
      : 'escarapelas-' + sts.length + '.pdf';
    await E.descargarPDF([...caja.children], nombre, { fondo: '#ffffff', escala: 2 });
    toast('PDF descargado', nombre, 'ok');
  } catch (e) {
    toast('No se pudo generar el PDF', String(e.message || e), 'err', 7000);
  } finally {
    if (caja) caja.remove();
  }
}

async function exportarHTML(sts) {
  if (!sts.length) { toast('Nada que exportar', 'Ajusta los filtros.', 'warn'); return; }
  toast('Generando HTML…', 'Se incrustan avatares y QR; puede tardar unos segundos.', 'info', 3200);
  let caja = null;
  try {
    caja = await taller(sts);
    const contenido = [...caja.children]
      .map((n) => '<div class="exp-item exp-item--cred">' + n.outerHTML + '</div>').join('');
    const nombre = 'escarapelas-' + sts.length + '.html';
    await E.descargarHTML({
      titulo: 'Escarapelas · ' + (db.config.institution || 'Academia C.O.D.E.'),
      subtitulo: sts.length + (sts.length === 1 ? ' credencial' : ' credenciales'),
      contenido,
      nombre
    });
    toast('HTML descargado', nombre + ' · se abre con doble clic', 'ok', 6000);
  } catch (e) {
    toast('No se pudo generar el HTML', String(e.message || e), 'err', 7000);
  } finally {
    if (caja) caja.remove();
  }
}

/* ------------------------------- vista grande ----------------------------- */

function verGrande(st) {
  const p = M.perfil(st);
  const cuerpo = el('div', { class: 'cred-grande' },
    el('div', { class: 'cred-grande__tarjeta', html: T.escarapelaHTML(p, { id: 'cred-solo', qrId: 'qr-solo' }) }),
    el('div', { class: 'cred-grande__botones' },
      el('button', {
        class: 'btn btn--ghost',
        onclick: () => window.print()
      }, el('i', { class: 'fa-solid fa-print' }), ' Imprimir'),
      el('button', {
        class: 'btn btn--ghost',
        onclick: () => exportarHTML([st])
      }, el('i', { class: 'fa-solid fa-code' }), ' HTML'),
      el('button', {
        class: 'btn btn--ghost',
        onclick: () => exportarPDF([st])
      }, el('i', { class: 'fa-solid fa-file-pdf' }), ' PDF'),
      el('button', {
        class: 'btn',
        onclick: async (e) => {
          const boton = e.currentTarget;
          boton.disabled = true;
          try {
            descargar(await E.nodoAPNG($('#cred-solo'), 3), 'escarapela-' + st.code + '.png');
            toast('Escarapela descargada', 'escarapela-' + st.code + '.png', 'ok');
          } catch (err) {
            toast('No se pudo generar', String(err.message || err), 'err');
          } finally { boton.disabled = false; }
        }
      }, el('i', { class: 'fa-solid fa-image' }), ' PNG')));

  modal({ titulo: st.name, subtitulo: st.code + ' · ' + st.grade + '° ' + st.group, ancho: '460px', cuerpo });
  T.pintarQREn($('#qr-solo'), p);
  animarBarras(cuerpo);
}

/* --------------------------------- vista ---------------------------------- */

function render(cont) {
  const filas = lista();

  cont.innerHTML = `
  <div class="cab-vista no-print">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-address-card"></i> Escarapelas</h1>
      <p class="cab-vista__s">Las credenciales de todo el curso, listas para imprimir o descargar una a una.</p>
    </div>
    <div class="cab-vista__acciones">
      <button class="btn btn--ghost" id="cr-print"><i class="fa-solid fa-print"></i> Imprimir</button>
      <button class="btn btn--ghost" id="cr-html"><i class="fa-solid fa-code"></i> HTML</button>
      <button class="btn" id="cr-pdf"><i class="fa-solid fa-file-pdf"></i> PDF</button>
    </div>
  </div>

  <div class="filtros no-print">
    ${F.selectGrado('cr-grade', f.grade)}
    ${F.selectGrupo('cr-group', f.group, f.grade)}
    <label class="selector">
      <span>Nivel hacker</span>
      <select id="cr-nivel"><option value="">Todos</option>
        ${LEVELS.map((l) => `<option value="${l.n}">Nv. ${l.n} · ${esc(l.m)}</option>`).join('')}</select>
    </label>
    <label class="selector">
      <span>Rango</span>
      <select id="cr-rango"><option value="">Todos</option>
        ${RANKS.map((r) => `<option value="${r.key}">${esc(r.name)}</option>`).join('')}</select>
    </label>
    <label class="buscador">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input id="cr-q" type="search" placeholder="Buscar…" autocomplete="off">
    </label>
  </div>

  <section class="tarjeta no-print">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-id-card"></i> ${filas.length} credenciales</h2>
      <span class="pill">Toca una tarjeta para verla en grande</span>
    </header>
  </section>

  <div class="cred-rejilla">
    ${filas.length ? filas.map((s) => {
      const p = M.perfil(s);
      return `<div class="cred-item" data-ver="${esc(s.id)}">
        <div class="cred-item__lupa no-print"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
        ${T.escarapelaHTML(p, { qrId: 'qr-' + s.id })}
      </div>`;
    }).join('') : `<div class="vacio"><i class="fa-solid fa-user-slash"></i>
        <h4>Sin estudiantes</h4><p>Ajusta los filtros o añade estudiantes.</p></div>`}
  </div>
  `;

  const recargar = () => render(cont);
  $('#cr-grade', cont).addEventListener('change', (e) => {
    f.grade = e.target.value; f.group = ''; recargar();
  });
  $('#cr-group', cont).addEventListener('change', (e) => { f.group = e.target.value; recargar(); });
  ['nivel', 'rango'].forEach((k) => {
    const sel = $('#cr-' + k, cont);
    sel.value = f[k];
    sel.addEventListener('change', (e) => { f[k] = e.target.value; recargar(); });
  });

  $('#cr-q', cont).value = f.q;
  let t = null;
  $('#cr-q', cont).addEventListener('input', (e) => {
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { f.q = v; recargar(); $('#cr-q', cont).focus(); }, 220);
  });

  $('#cr-print', cont).addEventListener('click', () => window.print());
  $('#cr-pdf', cont).addEventListener('click', () => exportarPDF(filas));
  $('#cr-html', cont).addEventListener('click', () => exportarHTML(filas));

  $$('[data-ver]', cont).forEach((n) => n.addEventListener('click', () => {
    verGrande(db.students.find((s) => s.id === n.dataset.ver));
  }));

  animarBarras(cont);
  observarQR(cont);
}

return { render: render };
})();

/* ---------- docente/estudiantes.js ---------- */
var __M_docente_estudiantes = (function () {
/* ============================================================================
   docente/estudiantes.js — Alta manual, carga masiva desde Excel y edición
   ========================================================================== */

const { $, $$, el, esc, modal, cerrarModal, toast } = __M_ui;
const { db, norm } = __M_datos;
const M = __M_motor;
const A = __M_almacen;
const X = __M_excel;
const { GENDERS } = __M_config;
const F = __M_docente_filtros;
const f = { q: '', grade: '', group: '', gender: '' };

function lista() {
  F.sanear(f);
  return F.aplicar({ grade: f.grade, group: f.group, q: f.q })
    .filter((s) => !f.gender || s.gender === f.gender);
}

/* ------------------------------ alta y edición ---------------------------- */

function formulario(st, recargar) {
  const v = st || { name: '', code: '', grade: '6', group: 'A', gender: 'X' };
  const cuerpo = el('form', { class: 'formulario', id: 'form-est' },
    el('label', { class: 'campo' },
      el('span', { class: 'campo__etq', text: 'Nombre completo' }),
      el('input', { name: 'name', type: 'text', required: 'required', value: v.name,
        placeholder: 'Valentina Marín Osorio' })),
    el('label', { class: 'campo' },
      el('span', { class: 'campo__etq', text: 'Código de estudiante' }),
      el('input', { name: 'code', type: 'text', required: 'required', value: v.code,
        placeholder: 'CODE-0001', spellcheck: 'false' })),
    el('div', { class: 'formulario__fila' },
      el('label', { class: 'campo' },
        el('span', { class: 'campo__etq', text: 'Grado' }),
        el('input', { name: 'grade', type: 'text', value: v.grade, list: 'lista-grados',
          placeholder: '6', autocomplete: 'off' })),
      el('label', { class: 'campo' },
        el('span', { class: 'campo__etq', text: 'Grupo' }),
        el('input', { name: 'group', type: 'text', value: v.group, list: 'lista-grupos',
          placeholder: 'A', autocomplete: 'off' })),
      el('label', { class: 'campo' },
        el('span', { class: 'campo__etq', text: 'Género' }),
        el('select', { name: 'gender' },
          ...Object.keys(GENDERS).map((k) =>
            el('option', { value: k, text: GENDERS[k], selected: k === v.gender ? 'selected' : null }))))),
    el('p', { class: 'formulario__nota',
      text: 'El grado y el grupo se escriben libremente; las sugerencias vienen de lo que ya hay en la base. ' +
            'El género decide si el avatar del nivel se muestra en versión masculina o femenina.' }),
    el('div', { html: F.datalists() }),
    el('button', { class: 'btn btn--ancho', type: 'submit' },
      el('i', { class: 'fa-solid fa-floppy-disk' }), st ? ' Guardar cambios' : ' Crear estudiante')
  );

  modal({
    titulo: st ? 'Editar estudiante' : 'Nuevo estudiante',
    subtitulo: st ? st.code : 'Se añade a la base de la academia',
    ancho: '520px',
    cuerpo
  });

  cuerpo.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(cuerpo).entries());
    try {
      if (st) A.editarEstudiante(st.id, d); else A.agregarEstudiante(d);
      cerrarModal();
      toast(st ? 'Estudiante actualizado' : 'Estudiante creado', d.name, 'ok');
      recargar();
    } catch (err) {
      toast('No se pudo guardar', err.message, 'err');
    }
  });
}

function confirmarBorrado(st, recargar) {
  const cuerpo = el('div', { class: 'confirmar' },
    el('p', { html: 'Vas a eliminar a <b>' + esc(st.name) + '</b> (' + esc(st.code) + ') ' +
      'y todas sus notas. Esta acción no se puede deshacer.' }),
    el('div', { class: 'confirmar__botones' },
      el('button', { class: 'btn btn--ghost', onclick: cerrarModal }, 'Cancelar'),
      el('button', {
        class: 'btn btn--peligro',
        onclick: () => {
          A.eliminarEstudiante(st.id);
          cerrarModal();
          toast('Estudiante eliminado', st.name, 'ok');
          recargar();
        }
      }, el('i', { class: 'fa-solid fa-trash' }), ' Eliminar')));

  modal({ titulo: 'Eliminar estudiante', subtitulo: 'Confirmación', ancho: '460px', cuerpo });
}

/* ------------------------------ importar Excel ---------------------------- */

function dialogoImportar(recargar) {
  const input = el('input', { type: 'file', accept: '.xlsx,.xls,.csv' });
  const zona = el('div', { class: 'importar__zona', id: 'zona-xlsx' },
    el('i', { class: 'fa-solid fa-file-excel' }),
    el('p', { html: '<b>Arrastra el archivo .xlsx aquí</b><br>o haz clic para elegirlo' }));
  const resultado = el('div', { id: 'previa-xlsx' });

  const cuerpo = el('div', { class: 'importar' },
    el('p', { html: 'El archivo debe tener las columnas <b>Nombre completo</b>, <b>Grado</b>, ' +
      '<b>Grupo</b>, <b>Género</b> y <b>Código de estudiante</b>. El orden no importa y las tildes tampoco.' }),
    zona,
    el('button', {
      class: 'btn btn--ghost btn--ancho',
      onclick: () => {
        try { toast('Plantilla descargada', X.plantilla(), 'ok'); }
        catch (e) { toast('No se pudo generar', e.message, 'err'); }
      }
    }, el('i', { class: 'fa-solid fa-download' }), ' Descargar plantilla .xlsx'),
    resultado);

  modal({ titulo: 'Importar estudiantes', subtitulo: 'Carga masiva desde Excel', ancho: '660px', cuerpo });

  const procesar = async (file) => {
    if (!file) return;
    try {
      const { filas, faltan, hoja } = await X.leerEstudiantes(file);
      if (faltan.length) {
        const nombres = faltan.map((c) => (c === 'name' ? 'Nombre completo' : 'Código de estudiante')).join(' y ');
        throw new Error('Falta la columna ' + nombres + ' en la hoja «' + hoja + '».');
      }
      const revisadas = X.revisar(filas, A.buscarCodigo);
      const cuenta = revisadas.reduce((acc, r) => {
        acc[r.estado] = (acc[r.estado] || 0) + 1; return acc;
      }, {});

      resultado.innerHTML = `
        <div class="previa">
          <div class="previa__cab">
            <b>${revisadas.length} filas leídas</b>
            <div class="previa__chips">
              ${Object.keys(cuenta).map((k) => {
                const e = X.ETIQUETA_ESTADO[k];
                return `<span class="pill pill--mini" style="--c:${e.color}">${cuenta[k]} ${esc(e.txt.toLowerCase())}</span>`;
              }).join('')}
            </div>
          </div>
          <div class="tabla-wrap previa__tabla">
            <table class="tabla">
              <thead><tr><th>Nombre</th><th>Código</th><th class="c">Curso</th>
                <th class="c">Género</th><th class="c">Estado</th></tr></thead>
              <tbody>${revisadas.map((r) => {
                const e = X.ETIQUETA_ESTADO[r.estado];
                return `<tr>
                  <td>${esc(r.name || '—')}</td>
                  <td class="mono">${esc(r.code || '—')}</td>
                  <td class="c">${esc(r.grade || '—')}° ${esc(r.group || '')}</td>
                  <td class="c">${esc(GENDERS[r.gender] || '—')}</td>
                  <td class="c"><span class="pill pill--mini" style="--c:${e.color}">${esc(e.txt)}</span></td>
                </tr>`;
              }).join('')}</tbody>
            </table>
          </div>
          <label class="check previa__check">
            <input type="checkbox" id="act-existentes">
            <span>Actualizar también los estudiantes que ya existen con el mismo código</span>
          </label>
          <button class="btn btn--ancho" id="confirmar-import">
            <i class="fa-solid fa-file-import"></i> Importar ${cuenta.nuevo || 0} estudiantes nuevos
          </button>
        </div>`;

      $('#confirmar-import', resultado).addEventListener('click', () => {
        const actualizar = $('#act-existentes', resultado).checked;
        const r = A.importarEstudiantes(revisadas.filter((x) => x.estado !== 'incompleto'), actualizar);
        cerrarModal();
        toast('Importación terminada',
          r.nuevos + ' nuevos · ' + r.actualizados + ' actualizados · ' + r.omitidos + ' omitidos', 'ok', 6000);
        recargar();
      });
    } catch (e) {
      resultado.innerHTML = '';
      toast('No se pudo leer el archivo', e.message, 'err', 7000);
    }
  };

  zona.addEventListener('click', () => input.click());
  input.addEventListener('change', () => procesar(input.files[0]));
  ['dragenter', 'dragover'].forEach((ev) => zona.addEventListener(ev, (e) => {
    e.preventDefault(); zona.classList.add('is-hover');
  }));
  ['dragleave', 'drop'].forEach((ev) => zona.addEventListener(ev, (e) => {
    e.preventDefault(); zona.classList.remove('is-hover');
  }));
  zona.addEventListener('drop', (e) => procesar(e.dataTransfer.files[0]));
}

function exportar(filas) {
  try {
    const datos = filas.map((s) => {
      const prom = M.promedioGlobal(s.id);
      const puntos = M.xp(s.id);
      return {
        'Nombre completo': s.name,
        'Grado': s.grade,
        'Grupo': s.group,
        'Género': GENDERS[s.gender] || '',
        'Código de estudiante': s.code,
        'P1': M.redondear(M.promedioPeriodo(s.id, 1), 1),
        'P2': M.redondear(M.promedioPeriodo(s.id, 2), 1),
        'P3': M.redondear(M.promedioPeriodo(s.id, 3), 1),
        'P4': M.redondear(M.promedioPeriodo(s.id, 4), 1),
        'Promedio global': M.redondear(prom, 1),
        'Desempeño': M.desempeno(prom).label,
        'Rango': M.rango(prom).name,
        'XP': puntos,
        'Nivel': M.nivel(puntos),
        'Identidad': M.identidad(s).nombre
      };
    });
    toast('Excel generado', X.exportarEstudiantes(datos), 'ok');
  } catch (e) {
    toast('No se pudo exportar', e.message, 'err');
  }
}

/* --------------------------------- vista ---------------------------------- */

function render(cont) {
  const filas = lista();

  cont.innerHTML = `
  <div class="cab-vista">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-users"></i> Estudiantes</h1>
      <p class="cab-vista__s">Alta manual o carga masiva desde Excel. ${db.students.length} en la base.</p>
    </div>
    <div class="cab-vista__acciones">
      <button class="btn btn--ghost" id="e-exportar"><i class="fa-solid fa-file-excel"></i> Exportar</button>
      <button class="btn btn--ghost" id="e-importar"><i class="fa-solid fa-file-import"></i> Importar Excel</button>
      <button class="btn" id="e-nuevo"><i class="fa-solid fa-user-plus"></i> Nuevo</button>
    </div>
  </div>

  <div class="filtros">
    ${F.selectGrado('e-grade', f.grade)}
    ${F.selectGrupo('e-group', f.group, f.grade)}
    <label class="selector">
      <span>Género</span>
      <select id="e-gender"><option value="">Todos</option>
        ${Object.keys(GENDERS).map((k) => `<option value="${k}">${esc(GENDERS[k])}</option>`).join('')}</select>
    </label>
    <label class="buscador">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input id="e-q" type="search" placeholder="Buscar por nombre o código…" autocomplete="off">
    </label>
  </div>

  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2><i class="fa-solid fa-list"></i> Listado</h2>
      <span class="pill">${filas.length} visibles</span>
    </header>
    <div class="tabla-wrap">
      <table class="tabla">
        <thead><tr><th>Estudiante</th><th class="c">Curso</th><th class="c oculta-mv">Nivel</th>
          <th class="c oculta-mv">Promedio</th><th class="c oculta-mv">Misiones</th><th class="c">Acciones</th></tr></thead>
        <tbody>${filas.length ? filas.map((s) => {
          const prom = M.promedioGlobal(s.id);
          const d = M.desempeno(prom);
          const av = M.avanceMisiones(s.id);
          const mis = M.avanceDeMisiones(s.id);
          const id = M.identidad(s);
          return `
          <tr>
            <td>
              <div class="recluta">
                <img src="${esc(M.avatarDe(s))}" alt="" loading="lazy">
                <div><b>${esc(s.name)}</b><small class="mono">${esc(s.code)}</small></div>
              </div>
            </td>
            <td class="c">${esc(s.grade)}° ${esc(s.group)}</td>
            <td class="c oculta-mv">
              <span class="pill pill--mini" style="--c:${id.color}">Nv.${id.n} ${esc(id.nombre)}</span>
            </td>
            <td class="c oculta-mv"><b style="color:${prom === null ? 'var(--txt-3)' : d.color}">${M.fmt(prom)}</b></td>
            <td class="c oculta-mv"><span class="tenue">${mis.completas}/${mis.total}</span>
              <small class="tenue">${av.hechas}/${av.total} act.</small></td>
            <td class="c">
              <div class="acciones">
                <button class="btn-icono btn-icono--mini" data-editar="${esc(s.id)}" title="Editar">
                  <i class="fa-solid fa-pen"></i></button>
                <button class="btn-icono btn-icono--mini btn-icono--peligro" data-borrar="${esc(s.id)}" title="Eliminar">
                  <i class="fa-solid fa-trash"></i></button>
              </div>
            </td>
          </tr>`;
        }).join('') : `<tr><td colspan="6"><div class="vacio"><i class="fa-solid fa-user-slash"></i>
            <h4>Sin estudiantes</h4><p>Crea uno a mano o importa tu lista desde Excel.</p></div></td></tr>`}
        </tbody>
      </table>
    </div>
  </section>
  `;

  const recargar = () => render(cont);

  $('#e-gender', cont).value = f.gender;
  $('#e-q', cont).value = f.q;

  $('#e-grade', cont).addEventListener('change', (e) => {
    f.grade = e.target.value; f.group = ''; recargar();
  });
  $('#e-group', cont).addEventListener('change', (e) => { f.group = e.target.value; recargar(); });
  $('#e-gender', cont).addEventListener('change', (e) => { f.gender = e.target.value; recargar(); });

  let t = null;
  $('#e-q', cont).addEventListener('input', (e) => {
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { f.q = v; recargar(); $('#e-q', cont).focus(); }, 220);
  });

  $('#e-nuevo', cont).addEventListener('click', () => formulario(null, recargar));
  $('#e-importar', cont).addEventListener('click', () => dialogoImportar(recargar));
  $('#e-exportar', cont).addEventListener('click', () => exportar(filas));

  $$('[data-editar]', cont).forEach((b) => b.addEventListener('click', () => {
    formulario(db.students.find((s) => s.id === b.dataset.editar), recargar);
  }));
  $$('[data-borrar]', cont).forEach((b) => b.addEventListener('click', () => {
    confirmarBorrado(db.students.find((s) => s.id === b.dataset.borrar), recargar);
  }));
}

return { render: render };
})();

/* ---------- docente/informes.js ---------- */
var __M_docente_informes = (function () {
/* ============================================================================
   docente/informes.js — Boletines de los estudiantes: ver, imprimir, descargar
   ========================================================================== */

const { $, $$, esc, animarBarras, toast } = __M_ui;
const { db, norm } = __M_datos;
const M = __M_motor;
const T = __M_tarjeta;
const E = __M_exportar;
const F = __M_docente_filtros;
const f = { grade: '', group: '', q: '', periodo: 'global', sid: null, todos: false };

function lista() {
  F.sanear(f);
  return F.aplicar({ grade: f.grade, group: f.group, q: f.q });
}

const periodoNum = () => (f.periodo === 'global' ? null : Number(f.periodo));

const elegido = () => db.students.find((s) => s.id === f.sid) || null;

function boletinDe(st, id) {
  return T.boletinHTML(M.perfil(st), periodoNum(), id ? { id } : {});
}

const sufijo = () => (f.periodo === 'global' ? 'consolidado' : 'p' + f.periodo);

/** Los informes que se van a exportar: el que está en pantalla o todos los filtrados. */
function objetivo(actual) {
  return f.todos ? lista() : (actual ? [actual] : []);
}

async function exportarPDF(actual) {
  const sts = objetivo(actual);
  if (!sts.length) { toast('Nada que exportar', 'Elige un estudiante.', 'warn'); return; }
  toast('Generando PDF…', sts.length + (sts.length === 1 ? ' informe' : ' informes') + ' en hoja carta.', 'info', 2600);
  try {
    /* Se dibuja fuera de pantalla para que el PDF no dependa de lo que se ve. */
    const taller = document.createElement('div');
    taller.className = 'taller-export';
    taller.innerHTML = sts.map((st) => T.boletinHTML(M.perfil(st), periodoNum())).join('');
    document.body.appendChild(taller);
    const nombre = sts.length === 1
      ? 'informe-' + sts[0].code + '-' + sufijo() + '.pdf'
      : 'informes-' + sufijo() + '.pdf';
    await E.descargarPDF([...taller.children], nombre, { fondo: '#ffffff', escala: 2 });
    taller.remove();
    toast('PDF descargado', nombre, 'ok');
  } catch (e) {
    toast('No se pudo generar el PDF', String(e.message || e), 'err', 7000);
  }
}

async function exportarHTML(actual) {
  const sts = objetivo(actual);
  if (!sts.length) { toast('Nada que exportar', 'Elige un estudiante.', 'warn'); return; }
  toast('Generando HTML…', 'Se incrustan las imágenes; puede tardar unos segundos.', 'info', 3200);
  try {
    const contenido = sts.map((st) =>
      '<div class="exp-item">' + T.boletinHTML(M.perfil(st), periodoNum()) + '</div>').join('');
    const nombre = sts.length === 1
      ? 'informe-' + sts[0].code + '-' + sufijo() + '.html'
      : 'informes-' + sufijo() + '.html';
    await E.descargarHTML({
      titulo: 'Informes académicos · ' + (db.config.institution || 'Academia C.O.D.E.'),
      subtitulo: (f.periodo === 'global' ? 'Consolidado del año' : 'Periodo ' + f.periodo) +
        ' · ' + sts.length + (sts.length === 1 ? ' estudiante' : ' estudiantes'),
      contenido,
      nombre
    });
    toast('HTML descargado', nombre + ' · se abre con doble clic', 'ok', 6000);
  } catch (e) {
    toast('No se pudo generar el HTML', String(e.message || e), 'err', 7000);
  }
}

function render(cont) {
  const filas = lista();
  if (!filas.some((s) => s.id === f.sid)) f.sid = filas.length ? filas[0].id : null;
  const actual = filas.find((s) => s.id === f.sid) || null;

  cont.innerHTML = `
  <div class="cab-vista no-print">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-file-lines"></i> Informes</h1>
      <p class="cab-vista__s">Informe académico en hoja carta vertical, con el detalle de las seis misiones
        de cada periodo. Los datos del pie salen de lo que registraste en la Consola.</p>
    </div>
    <div class="cab-vista__acciones">
      <label class="check check--boton">
        <input type="checkbox" id="i-todos" ${f.todos ? 'checked' : ''}>
        <span>Ver todos seguidos</span>
      </label>
      <button class="btn btn--ghost" id="i-print"><i class="fa-solid fa-print"></i> Imprimir</button>
      <button class="btn btn--ghost" id="i-html" ${actual ? '' : 'disabled'}>
        <i class="fa-solid fa-code"></i> HTML</button>
      <button class="btn" id="i-pdf" ${actual ? '' : 'disabled'}>
        <i class="fa-solid fa-file-pdf"></i> PDF</button>
    </div>
  </div>

  <div class="filtros no-print">
    <label class="selector">
      <span>Periodo</span>
      <select id="i-periodo">
        <option value="global">Consolidado del año</option>
        ${M.PERIODS.map((x) => `<option value="${x}">Periodo ${x} · ${esc(M.eraDe(x).name)}</option>`).join('')}
      </select>
    </label>
    ${F.selectGrado('i-grade', f.grade)}
    ${F.selectGrupo('i-group', f.group, f.grade)}
    <label class="buscador">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input id="i-q" type="search" placeholder="Buscar estudiante…" autocomplete="off">
    </label>
  </div>

  ${f.todos ? `
    <div class="informes-todos">
      ${filas.length ? filas.map((s) => boletinDe(s)).join('') :
        `<div class="vacio"><i class="fa-solid fa-user-slash"></i><h4>Sin estudiantes</h4></div>`}
    </div>
  ` : `
    <div class="informes">
      <aside class="informes__lista no-print">
        <div class="informes__scroll">
          ${filas.length ? filas.map((s) => {
            const prom = f.periodo === 'global' ? M.promedioGlobal(s.id) : M.promedioPeriodo(s.id, Number(f.periodo));
            const d = M.desempeno(prom);
            return `<button class="informes__item ${s.id === f.sid ? 'is-on' : ''}" data-sid="${esc(s.id)}">
              <img src="${esc(M.avatarDe(s))}" alt="" loading="lazy">
              <div><b>${esc(s.name)}</b><small>${esc(s.grade)}° ${esc(s.group)} · ${esc(s.code)}</small></div>
              <span class="informes__nota" style="color:${prom === null ? 'var(--txt-3)' : d.color}">${M.fmt(prom)}</span>
            </button>`;
          }).join('') : `<div class="vacio"><i class="fa-solid fa-user-slash"></i><h4>Sin estudiantes</h4></div>`}
        </div>
      </aside>
      <div class="informes__hoja" id="zona-informe">
        ${actual ? boletinDe(actual, 'informe-actual') :
          `<div class="vacio"><i class="fa-solid fa-file-circle-question"></i>
            <h4>Elige un estudiante</h4><p>Su boletín aparecerá aquí.</p></div>`}
      </div>
    </div>
  `}
  `;

  const recargar = () => render(cont);

  $('#i-periodo', cont).value = f.periodo;
  $('#i-q', cont).value = f.q;

  $('#i-periodo', cont).addEventListener('change', (e) => { f.periodo = e.target.value; recargar(); });
  $('#i-grade', cont).addEventListener('change', (e) => {
    f.grade = e.target.value; f.group = ''; recargar();
  });
  $('#i-group', cont).addEventListener('change', (e) => { f.group = e.target.value; recargar(); });
  $('#i-todos', cont).addEventListener('change', (e) => { f.todos = e.target.checked; recargar(); });

  let t = null;
  $('#i-q', cont).addEventListener('input', (e) => {
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { f.q = v; recargar(); $('#i-q', cont).focus(); }, 220);
  });

  $('#i-print', cont).addEventListener('click', () => window.print());
  const pdf = $('#i-pdf', cont);
  const html = $('#i-html', cont);
  if (actual) {
    pdf.addEventListener('click', () => exportarPDF(elegido()));
    html.addEventListener('click', () => exportarHTML(elegido()));
  }

  $$('[data-sid]', cont).forEach((b) => b.addEventListener('click', () => {
    f.sid = b.dataset.sid;
    const st = db.students.find((s) => s.id === f.sid);
    $$('.informes__item', cont).forEach((x) => x.classList.toggle('is-on', x.dataset.sid === f.sid));
    const zona = $('#zona-informe', cont);
    zona.innerHTML = boletinDe(st, 'informe-actual');
    zona.classList.remove('entra'); void zona.offsetWidth; zona.classList.add('entra');
    if (pdf) pdf.disabled = false;
    if (html) html.disabled = false;
    animarBarras(cont);
  }));

  animarBarras(cont);
}

return { render: render };
})();

/* ---------- docente/notas.js ---------- */
var __M_docente_notas = (function () {
/* ============================================================================
   docente/notas.js — Calificación por misión
   ----------------------------------------------------------------------------
   Cada periodo tiene seis misiones y cada misión sus cuatro actividades
   (taller, reto gamificado y dos bitácoras). Aquí se elige periodo y misión,
   y se escriben las cuatro notas de cada estudiante.
   ========================================================================== */

const { $, $$, el, esc, modal, cerrarModal, toast } = __M_ui;
const { db, nombreMision } = __M_datos;
const M = __M_motor;
const A = __M_almacen;
const X = __M_excel;
const F = __M_docente_filtros;
const { CATEGORIES, MISIONES, SCALE } = __M_config;
const f = { periodo: 1, mision: 1, grade: '', group: '', sid: '', q: '' };

/* ------------------------------ ponderaciones ----------------------------- */

function dialogoPesos(recargar) {
  const w = db.config.weights || {};
  const cuerpo = el('form', { class: 'formulario', id: 'form-pesos' },
    el('p', { class: 'formulario__nota',
      text: 'Peso de cada actividad dentro de la misión. Si una no tiene nota, su peso se reparte entre las demás.' }),
    ...CATEGORIES.map((c) => el('label', { class: 'campo campo--fila' },
      el('span', { class: 'campo__etq', html: '<i class="fa-solid ' + c.icon + '" style="color:' + c.color + '"></i> ' + esc(c.label) }),
      el('input', { name: c.key, type: 'number', min: '0', max: '100', step: '1', value: String(w[c.key] || 0) }))),
    el('p', { class: 'formulario__nota', id: 'suma-pesos' }),
    el('button', { class: 'btn btn--ancho', type: 'submit' },
      el('i', { class: 'fa-solid fa-scale-balanced' }), ' Guardar ponderaciones')
  );

  modal({ titulo: 'Ponderaciones', subtitulo: 'Deben sumar 100 %', ancho: '480px', cuerpo });

  const suma = () => {
    const total = CATEGORIES.reduce((acc, c) => acc + Number(cuerpo[c.key].value || 0), 0);
    const nodo = $('#suma-pesos', cuerpo);
    nodo.textContent = 'Suma actual: ' + total + ' %';
    nodo.style.color = total === 100 ? 'var(--ok)' : 'var(--warn)';
    return total;
  };
  suma();
  cuerpo.addEventListener('input', suma);

  cuerpo.addEventListener('submit', (e) => {
    e.preventDefault();
    if (suma() !== 100) { toast('Revisa las ponderaciones', 'Los cuatro pesos deben sumar 100 %.', 'warn'); return; }
    const pesos = {};
    CATEGORIES.forEach((c) => { pesos[c.key] = Number(cuerpo[c.key].value || 0); });
    A.guardarConfig({ weights: pesos });
    cerrarModal();
    toast('Ponderaciones guardadas', 'Los promedios se recalcularon.', 'ok');
    recargar();
  });
}

/* -------------------------------- renombrar ------------------------------- */

function dialogoRenombrarMision(recargar) {
  const actual = nombreMision(f.periodo, f.mision);
  const cuerpo = el('form', { class: 'formulario' },
    el('label', { class: 'campo' },
      el('span', { class: 'campo__etq', text: 'Nombre de la misión' }),
      el('input', { name: 'nombre', type: 'text', value: actual, required: 'required',
        placeholder: 'Misión 3 · Bucles y repeticiones' })),
    el('p', { class: 'formulario__nota',
      text: 'Los estudiantes verán este nombre en su mapa de misiones y en el boletín.' }),
    el('button', { class: 'btn btn--ancho', type: 'submit' },
      el('i', { class: 'fa-solid fa-floppy-disk' }), ' Guardar nombre'));

  modal({ titulo: 'Renombrar misión', subtitulo: 'Periodo ' + f.periodo + ' · misión ' + f.mision,
    ancho: '480px', cuerpo });

  cuerpo.addEventListener('submit', (e) => {
    e.preventDefault();
    A.renombrarMision(f.periodo, f.mision, cuerpo.nombre.value);
    cerrarModal();
    toast('Misión renombrada', cuerpo.nombre.value, 'ok');
    recargar();
  });
}

function dialogoRenombrarActividad(act, recargar) {
  const cuerpo = el('form', { class: 'formulario' },
    el('label', { class: 'campo' },
      el('span', { class: 'campo__etq', text: 'Nombre de la actividad' }),
      el('input', { name: 'nombre', type: 'text', value: act.name, required: 'required',
        placeholder: 'Taller · Bucles anidados' })),
    el('button', { class: 'btn btn--ancho', type: 'submit' },
      el('i', { class: 'fa-solid fa-floppy-disk' }), ' Guardar nombre'));

  modal({ titulo: 'Renombrar actividad', subtitulo: nombreMision(f.periodo, f.mision), ancho: '460px', cuerpo });

  cuerpo.addEventListener('submit', (e) => {
    e.preventDefault();
    A.renombrarActividad(f.periodo, act.id, cuerpo.nombre.value);
    cerrarModal();
    toast('Actividad renombrada', cuerpo.nombre.value, 'ok');
    recargar();
  });
}

/* -------------------------------- exportar -------------------------------- */

function exportar(filas) {
  try {
    const datos = filas.map((s) => {
      const fila = {
        'Nombre completo': s.name,
        'Código': s.code,
        'Grado': s.grade,
        'Grupo': s.group
      };
      MISIONES.forEach((n) => {
        A.actividadesOrdenadas(f.periodo, n).forEach((a) => {
          const cat = CATEGORIES.find((c) => c.key === a.cat);
          const g = db.grades[s.id];
          fila['M' + n + ' · ' + (cat ? cat.short : a.cat)] =
            g && typeof g[a.id] === 'number' ? g[a.id] : '';
        });
        fila['M' + n + ' · nota'] = M.redondear(M.promedioMision(s.id, f.periodo, n), 1);
      });
      fila['Promedio del periodo'] = M.redondear(M.promedioPeriodo(s.id, f.periodo), 1);
      return fila;
    });
    toast('Excel generado', X.exportarNotas(datos, f.periodo), 'ok');
  } catch (e) {
    toast('No se pudo exportar', e.message, 'err');
  }
}

/* --------------------------------- vista ---------------------------------- */

function render(cont) {
  A.asegurarActividades(f.periodo);
  const acts = A.actividadesOrdenadas(f.periodo, f.mision);
  F.sanear(f);
  const filas = F.aplicar(f);
  const era = M.eraDe(f.periodo);
  const w = db.config.weights || {};

  /* Avance de cada misión del periodo, para pintarlo en sus pestañas */
  const avanceMision = {};
  MISIONES.forEach((n) => {
    const a = A.actividadesOrdenadas(f.periodo, n);
    let hechas = 0;
    filas.forEach((s) => a.forEach((x) => { if (M.notaDe(s.id, x.id) !== null) hechas++; }));
    avanceMision[n] = { hechas, total: a.length * filas.length };
  });

  cont.innerHTML = `
  <div class="cab-vista">
    <div>
      <h1 class="cab-vista__t"><i class="fa-solid fa-table-cells"></i> Notas por misión</h1>
      <p class="cab-vista__s">Cada periodo tiene seis misiones, y cada misión estas cuatro actividades.
        Escribe la nota y se guarda sola (escala ${SCALE.min.toFixed(1)} – ${SCALE.max.toFixed(1)};
        deja la celda vacía para dejarla pendiente).</p>
    </div>
    <div class="cab-vista__acciones">
      <button class="btn btn--ghost" id="n-pesos"><i class="fa-solid fa-scale-balanced"></i> Ponderaciones</button>
      <button class="btn btn--ghost" id="n-exportar"><i class="fa-solid fa-file-excel"></i> Exportar periodo</button>
    </div>
  </div>

  <div class="pestanas" id="n-periodos">
    ${M.PERIODS.map((x) => {
      const e = M.eraDe(x);
      return `<button class="pestana ${x === f.periodo ? 'is-on' : ''}" data-per="${x}">
        <i class="fa-solid ${e.icon}"></i> Periodo ${x}</button>`;
    }).join('')}
  </div>

  <div class="misiones-barra">
    <span class="misiones-barra__etq"><i class="fa-solid ${era.icon}"></i> Misiones del periodo ${f.periodo}</span>
    <div class="misiones-barra__lista">
      ${MISIONES.map((n) => {
        const av = avanceMision[n];
        const pct = av.total ? Math.round(av.hechas / av.total * 100) : 0;
        return `<button class="mision-chip ${n === f.mision ? 'is-on' : ''}" data-mision="${n}"
                title="${esc(nombreMision(f.periodo, n))}">
          <b>M${n}</b>
          <span>${esc(nombreMision(f.periodo, n))}</span>
          <i class="mision-chip__pct ${pct === 100 ? 'is-full' : ''}">${pct}%</i>
        </button>`;
      }).join('')}
    </div>
  </div>

  <div class="filtros">
    ${F.selectGrado('n-grade', f.grade)}
    ${F.selectGrupo('n-group', f.group, f.grade)}
    ${F.selectEstudiante('n-sid', f.sid, F.aplicar({ grade: f.grade, group: f.group }))}
    <label class="buscador">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input id="n-q" type="search" placeholder="Buscar estudiante…" autocomplete="off" value="${esc(f.q)}">
    </label>
  </div>

  <section class="tarjeta">
    <header class="tarjeta__head">
      <h2>
        <i class="fa-solid fa-flag-checkered"></i>
        <button class="titulo-editable" id="n-renombrar" title="Clic para renombrar la misión">
          ${esc(nombreMision(f.periodo, f.mision))} <i class="fa-solid fa-pen"></i>
        </button>
      </h2>
      <div class="tarjeta__meta">
        <span class="pill">${filas.length} estudiantes</span>
        <span class="pill" style="--c:#a855f7">Periodo ${M.fmt(M.promedioDe(filas, f.periodo))}</span>
      </div>
    </header>

    <div class="tabla-wrap">
      <table class="tabla tabla--matriz">
        <thead>
          <tr>
            <th class="matriz__nombre">Estudiante</th>
            ${acts.map((a) => {
              const c = CATEGORIES.find((x) => x.key === a.cat);
              return `<th class="c">
                <button class="matriz__col" data-renombrar="${esc(a.id)}" title="Clic para renombrar">
                  <i class="fa-solid ${c.icon}" style="color:${c.color}"></i>
                  <span>${esc(a.name)}</span>
                  <small>${w[a.cat] || 0} %</small>
                </button></th>`;
            }).join('')}
            <th class="c">Misión</th>
            <th class="c">Periodo</th>
          </tr>
        </thead>
        <tbody>${filas.length ? filas.map((s, i) => `
          <tr data-sid="${esc(s.id)}">
            <td class="matriz__nombre">
              <div class="recluta">
                <img src="${esc(M.avatarDe(s))}" alt="" loading="lazy">
                <div><b>${esc(s.name)}</b><small class="mono">${esc(s.code)} · ${esc(s.grade)}° ${esc(s.group)}</small></div>
              </div>
            </td>
            ${acts.map((a, j) => {
              const v = M.notaDe(s.id, a.id);
              return `<td class="c">
                <input class="celda-nota" type="text" inputmode="decimal" value="${v === null ? '' : v}"
                       data-sid="${esc(s.id)}" data-aid="${esc(a.id)}"
                       data-fila="${i}" data-col="${j}"
                       aria-label="Nota de ${esc(s.name)} en ${esc(a.name)}">
              </td>`;
            }).join('')}
            <td class="c"><b class="prom-mision" data-sid="${esc(s.id)}">${M.fmt(M.promedioMision(s.id, f.periodo, f.mision))}</b></td>
            <td class="c"><b class="prom-periodo" data-sid="${esc(s.id)}">${M.fmt(M.promedioPeriodo(s.id, f.periodo))}</b></td>
          </tr>`).join('') : `<tr><td colspan="${acts.length + 3}">
            <div class="vacio"><i class="fa-solid fa-user-slash"></i>
              <h4>Sin estudiantes</h4><p>Añade estudiantes o cambia los filtros.</p></div></td></tr>`}
        </tbody>
      </table>
    </div>
    <p class="nota-pie"><i class="fa-solid fa-keyboard"></i>
      Enter o ↓ bajan de fila · ↑ sube · ← → cambian de actividad. Cada cambio se guarda al instante
      y los estudiantes lo ven en su panel.</p>
  </section>
  `;

  const recargar = () => render(cont);

  $$('.pestana', cont).forEach((b) => b.addEventListener('click', () => {
    f.periodo = Number(b.dataset.per);
    recargar();
  }));

  $$('[data-mision]', cont).forEach((b) => b.addEventListener('click', () => {
    f.mision = Number(b.dataset.mision);
    recargar();
  }));

  $('#n-grade', cont).addEventListener('change', (e) => {
    f.grade = e.target.value; f.group = ''; f.sid = ''; recargar();
  });
  $('#n-group', cont).addEventListener('change', (e) => {
    f.group = e.target.value; f.sid = ''; recargar();
  });
  $('#n-sid', cont).addEventListener('change', (e) => { f.sid = e.target.value; recargar(); });

  let t = null;
  $('#n-q', cont).addEventListener('input', (e) => {
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => {
      f.q = v; recargar();
      const inp = $('#n-q', cont);
      inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length);
    }, 240);
  });

  $('#n-pesos', cont).addEventListener('click', () => dialogoPesos(recargar));
  $('#n-exportar', cont).addEventListener('click', () => exportar(filas));
  $('#n-renombrar', cont).addEventListener('click', () => dialogoRenombrarMision(recargar));

  $$('[data-renombrar]', cont).forEach((b) => b.addEventListener('click', () => {
    dialogoRenombrarActividad(acts.find((a) => a.id === b.dataset.renombrar), recargar);
  }));

  /* --------------------------- edición de notas --------------------------- */

  const refrescarFila = (sid) => {
    const mis = $('.prom-mision[data-sid="' + sid + '"]', cont);
    const per = $('.prom-periodo[data-sid="' + sid + '"]', cont);
    const vm = M.promedioMision(sid, f.periodo, f.mision);
    const vp = M.promedioPeriodo(sid, f.periodo);
    if (mis) { mis.textContent = M.fmt(vm); mis.style.color = vm === null ? '' : M.desempeno(vm).color; }
    if (per) { per.textContent = M.fmt(vp); per.style.color = vp === null ? '' : M.desempeno(vp).color; }
  };

  const guardarCelda = (inp) => {
    const antes = inp.dataset.previo == null ? '' : inp.dataset.previo;
    const r = A.ponerNota(inp.dataset.sid, inp.dataset.aid, inp.value);
    if (r === undefined) {
      inp.value = antes;
      inp.classList.add('is-mala');
      setTimeout(() => inp.classList.remove('is-mala'), 900);
      return;
    }
    inp.value = r === null ? '' : r;
    inp.dataset.previo = inp.value;
    inp.classList.toggle('is-baja', r !== null && r < SCALE.pass);
    inp.classList.add('is-ok');
    setTimeout(() => inp.classList.remove('is-ok'), 700);
    refrescarFila(inp.dataset.sid);
  };

  $$('.celda-nota', cont).forEach((inp) => {
    inp.dataset.previo = inp.value;
    if (inp.value !== '' && Number(inp.value) < SCALE.pass) inp.classList.add('is-baja');

    inp.addEventListener('change', () => guardarCelda(inp));
    inp.addEventListener('blur', () => guardarCelda(inp));
    inp.addEventListener('focus', () => inp.select());
    inp.addEventListener('keydown', (e) => {
      const fila = Number(inp.dataset.fila), col = Number(inp.dataset.col);
      let destino = null;
      if (e.key === 'Enter' || e.key === 'ArrowDown') destino = [fila + 1, col];
      else if (e.key === 'ArrowUp') destino = [fila - 1, col];
      else if (e.key === 'ArrowRight' && inp.selectionStart === inp.value.length) destino = [fila, col + 1];
      else if (e.key === 'ArrowLeft' && inp.selectionStart === 0) destino = [fila, col - 1];
      if (!destino) return;
      const sig = $('.celda-nota[data-fila="' + destino[0] + '"][data-col="' + destino[1] + '"]', cont);
      if (sig) { e.preventDefault(); guardarCelda(inp); sig.focus(); }
    });
  });
}

return { render: render };
})();

/* ---------- recursos.js ---------- */
var __M_recursos = (function () {
/* ============================================================================
   recursos.js — Catálogo de recursos educativos digitales, con filtros
   ----------------------------------------------------------------------------
   Los enlaces salen de la compilación de Exploradores del Saber. Cada recurso
   lleva etiquetas (categoría, área, nivel, para quién y si pide cuenta) para
   que los filtros se puedan combinar entre sí.
   ========================================================================== */

const { $, $$, esc, rgb, toast } = __M_ui;
const { norm } = __M_datos;
/* ------------------------------ vocabulario ------------------------------- */

const CATEGORIAS = [
  { key: 'evaluacion',   label: 'Evaluación y gamificación', icon: 'fa-gamepad',            color: '#a855f7' },
  { key: 'creacion',     label: 'Creación de contenidos',    icon: 'fa-wand-magic-sparkles', color: '#22d3ee' },
  { key: 'programacion', label: 'Lógica y programación',     icon: 'fa-code',               color: '#34d399' },
  { key: 'practica',     label: 'Práctica y matemáticas',    icon: 'fa-calculator',         color: '#fbbf24' },
  { key: 'lectura',      label: 'Lectura y cultura',         icon: 'fa-book-open',          color: '#fb923c' }
];

const AREAS = [
  { key: 'todas',       label: 'Todas las áreas' },
  { key: 'matematicas', label: 'Matemáticas' },
  { key: 'lenguaje',    label: 'Lenguaje' },
  { key: 'tecnologia',  label: 'Tecnología' },
  { key: 'ingles',      label: 'Inglés' },
  { key: 'artes',       label: 'Artes y cultura' }
];

const NIVELES = [
  { key: 'primaria',     label: 'Primaria' },
  { key: 'bachillerato', label: 'Bachillerato' }
];

const USOS = [
  { key: 'estudiante', label: 'Para el estudiante', icon: 'fa-user-graduate' },
  { key: 'docente',    label: 'Para el docente',    icon: 'fa-chalkboard-user' }
];

/* -------------------------------- catálogo -------------------------------- */

const RECURSOS = [
  { nombre: 'Kahoot!', url: 'https://kahoot.com/', cat: 'evaluacion',
    desc: 'Cuestionarios interactivos, encuestas y debates en tiempo real.',
    areas: ['todas'], niveles: ['primaria', 'bachillerato'], usos: ['docente', 'estudiante'], cuenta: true },
  { nombre: 'Quizizz', url: 'https://quizizz.com/', cat: 'evaluacion',
    desc: 'Cuestionarios autoguiados y competencias a su propio ritmo.',
    areas: ['todas'], niveles: ['primaria', 'bachillerato'], usos: ['docente', 'estudiante'], cuenta: true },
  { nombre: 'Gimkit', url: 'https://www.gimkit.com/', cat: 'evaluacion',
    desc: 'Juego de preguntas estratégico con moneda virtual y mejoras.',
    areas: ['todas'], niveles: ['primaria', 'bachillerato'], usos: ['docente', 'estudiante'], cuenta: true },
  { nombre: 'Quizlet', url: 'https://quizlet.com/', cat: 'evaluacion',
    desc: 'Estudio con tarjetas de memoria (flashcards) y vocabulario.',
    areas: ['lenguaje', 'ingles', 'todas'], niveles: ['primaria', 'bachillerato'], usos: ['estudiante', 'docente'], cuenta: true },
  { nombre: 'Mentimeter', url: 'https://mentimeter.com/', cat: 'evaluacion',
    desc: 'Encuestas en vivo, nubes de palabras y preguntas abiertas.',
    areas: ['todas'], niveles: ['bachillerato'], usos: ['docente'], cuenta: true },
  { nombre: 'Cerebriti', url: 'https://www.cerebriti.com/', cat: 'evaluacion',
    desc: 'Juegos interactivos creados por usuarios sobre cualquier materia escolar.',
    areas: ['todas'], niveles: ['primaria', 'bachillerato'], usos: ['estudiante', 'docente'], cuenta: false },

  { nombre: 'Wordwall', url: 'https://wordwall.net/', cat: 'creacion',
    desc: 'Actividades interactivas: sopas de letras, ruletas, parejas y más.',
    areas: ['todas'], niveles: ['primaria', 'bachillerato'], usos: ['docente'], cuenta: true },
  { nombre: 'Edpuzzle', url: 'https://edpuzzle.com/', cat: 'creacion',
    desc: 'Convierte cualquier video en una lección con preguntas incrustadas.',
    areas: ['todas'], niveles: ['primaria', 'bachillerato'], usos: ['docente'], cuenta: true },
  { nombre: 'Educaplay', url: 'https://www.educaplay.com/', cat: 'creacion',
    desc: 'Actividades multimedia como crucigramas y mapas interactivos.',
    areas: ['todas'], niveles: ['primaria', 'bachillerato'], usos: ['docente'], cuenta: true },
  { nombre: 'Genially', url: 'https://genially.com/', cat: 'creacion',
    desc: 'Presentaciones, infografías y escape rooms interactivos.',
    areas: ['todas'], niveles: ['primaria', 'bachillerato'], usos: ['docente', 'estudiante'], cuenta: true },
  { nombre: 'Canva Educación', url: 'https://www.canva.com/es_es/educacion/', cat: 'creacion',
    desc: 'Diseño de materiales visuales y presentaciones para el aula.',
    areas: ['artes', 'todas'], niveles: ['primaria', 'bachillerato'], usos: ['docente', 'estudiante'], cuenta: true },

  { nombre: 'Scratch', url: 'https://scratch.mit.edu/', cat: 'programacion',
    desc: 'Programa por bloques tus propios juegos, historias y animaciones.',
    areas: ['tecnologia'], niveles: ['primaria', 'bachillerato'], usos: ['estudiante', 'docente'], cuenta: false },
  { nombre: 'Code.org', url: 'https://code.org/', cat: 'programacion',
    desc: 'Lecciones guiadas de programación y pensamiento computacional jugando.',
    areas: ['tecnologia', 'matematicas'], niveles: ['primaria', 'bachillerato'], usos: ['estudiante', 'docente'], cuenta: false },

  { nombre: 'Mundo Primaria', url: 'https://www.mundoprimaria.com/', cat: 'practica',
    desc: 'Juegos educativos gratuitos para niños, clasificados por asignatura.',
    areas: ['todas'], niveles: ['primaria'], usos: ['estudiante'], cuenta: false },
  { nombre: 'Cristic', url: 'https://www.cristic.com/', cat: 'practica',
    desc: 'Colección de juegos educativos organizados por curso y temática.',
    areas: ['todas'], niveles: ['primaria'], usos: ['estudiante'], cuenta: false },
  { nombre: 'Vedoque', url: 'https://www.vedoque.com/', cat: 'practica',
    desc: 'Actividades para mejorar mecanografía, ortografía y cálculo.',
    areas: ['lenguaje', 'tecnologia'], niveles: ['primaria'], usos: ['estudiante'], cuenta: false },
  { nombre: 'Math Playground', url: 'https://es.mathplayground.com/', cat: 'practica',
    desc: 'Juegos de matemáticas: aritmética, geometría y lógica.',
    areas: ['matematicas'], niveles: ['primaria', 'bachillerato'], usos: ['estudiante'], cuenta: false },

  { nombre: 'Maguaré', url: 'https://maguare.gov.co/', cat: 'lectura',
    desc: 'Portal cultural con juegos y cuentos folclóricos colombianos.',
    areas: ['artes', 'lenguaje'], niveles: ['primaria'], usos: ['estudiante'], cuenta: false },
  { nombre: 'Árbol ABC', url: 'https://arbolabc.com/', cat: 'lectura',
    desc: 'Juegos educativos para preescolar y primaria, en español e inglés.',
    areas: ['lenguaje', 'ingles'], niveles: ['primaria'], usos: ['estudiante'], cuenta: false },
  { nombre: 'Educa en Vivo', url: 'https://educaenvivo.com/', cat: 'lectura',
    desc: 'Recursos y transmisiones educativas de apoyo escolar.',
    areas: ['todas'], niveles: ['primaria', 'bachillerato'], usos: ['estudiante', 'docente'], cuenta: false },
  { nombre: 'Colombia Aprende', url: 'https://colombiaaprende.edu.co/', cat: 'lectura',
    desc: 'Cápsulas y recursos digitales del Ministerio de Educación de Colombia.',
    areas: ['todas'], niveles: ['primaria', 'bachillerato'], usos: ['docente', 'estudiante'], cuenta: false },
  { nombre: 'Read Along', url: 'https://readalong.google.com/', cat: 'lectura',
    desc: 'Asistente de Google para practicar la lectura en voz alta.',
    areas: ['lenguaje', 'ingles'], niveles: ['primaria'], usos: ['estudiante'], cuenta: false },
  { nombre: 'Bosque de Fantasías', url: 'https://bosquedefantasias.com/', cat: 'lectura',
    desc: 'Cuentos, fábulas y gramática para trabajar la comprensión lectora.',
    areas: ['lenguaje'], niveles: ['primaria'], usos: ['estudiante'], cuenta: false }
];

/* -------------------------------- filtros --------------------------------- */

const f = { q: '', cat: '' };

const CAT = Object.fromEntries(CATEGORIAS.map((c) => [c.key, c]));

function filtrar() {
  const q = norm(f.q);
  return RECURSOS.filter((r) => {
    if (f.cat && r.cat !== f.cat) return false;
    if (q) {
      const texto = norm(r.nombre + ' ' + r.desc + ' ' + CAT[r.cat].label + ' ' + r.areas.join(' '));
      if (texto.indexOf(q) < 0) return false;
    }
    return true;
  });
}

function hayFiltros() {
  return !!(f.q || f.cat);
}

function tarjeta(r) {
  const c = CAT[r.cat];
  return `
  <a class="rec" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer"
     style="--c:${c.color};--c-rgb:${rgb(c.color)}">
    <span class="rec__ico"><i class="fa-solid ${c.icon}"></i></span>
    <div class="rec__cuerpo">
      <h3 class="rec__nombre">${esc(r.nombre)}<i class="fa-solid fa-arrow-up-right-from-square"></i></h3>
      <p class="rec__desc">${esc(r.desc)}</p>
      <div class="rec__tags">
        <span class="rec__tag rec__tag--cat">${esc(c.label)}</span>
        ${r.niveles.map((n) => `<span class="rec__tag">${esc((NIVELES.find((x) => x.key === n) || {}).label || n)}</span>`).join('')}
        ${r.cuenta
          ? '<span class="rec__tag rec__tag--cuenta"><i class="fa-solid fa-user-lock"></i> Pide cuenta</span>'
          : '<span class="rec__tag rec__tag--libre"><i class="fa-solid fa-unlock"></i> Sin registro</span>'}
      </div>
    </div>
  </a>`;
}

function pintarResultados(cont) {
  const lista = filtrar();
  const zona = $('#rec-lista', cont);

  zona.innerHTML = lista.length
    ? lista.map(tarjeta).join('')
    : `<div class="vacio"><i class="fa-solid fa-magnifying-glass"></i>
        <h4>Ningún recurso coincide</h4>
        <p>Prueba con menos filtros o con otra palabra.</p></div>`;

  $('#rec-cuenta', cont).textContent = lista.length === RECURSOS.length
    ? RECURSOS.length + ' recursos'
    : lista.length + ' de ' + RECURSOS.length + ' recursos';

  const limpiar = $('#rec-limpiar', cont);
  limpiar.hidden = !hayFiltros();

  // Resumen por categoría, para que se vea de un vistazo qué queda
  $('#rec-resumen', cont).innerHTML = CATEGORIAS.map((c) => {
    const n = lista.filter((r) => r.cat === c.key).length;
    return n ? `<span class="pill pill--mini" style="--c:${c.color}">
      <i class="fa-solid ${c.icon}"></i>${n} ${esc(c.label.toLowerCase())}</span>` : '';
  }).join('');
}

function marcarChips(cont) {
  $$('[data-filtro]', cont).forEach((b) => {
    const [campo, valor] = b.dataset.filtro.split('|');
    b.classList.toggle('is-on', String(f[campo]) === valor);
  });
}

/* --------------------------------- vista ---------------------------------- */

function render(cont) {
  const chip = (campo, valor, etiqueta, extra = '') => `
    <button class="chip-filtro ${extra}" data-filtro="${campo}|${valor}">${etiqueta}</button>`;

  cont.innerHTML = `
  <header class="rec-cab">
    <p class="rec-cab__eyebrow"><i class="fa-solid fa-compass"></i> Arsenal del hacker</p>
    <h1 class="rec-cab__t">Recursos didácticos</h1>
    <p class="rec-cab__s">
      Plataformas para aprender, practicar y crear. Todas abren en una pestaña nueva.
      Combina los filtros para encontrar justo lo que necesitas.
    </p>
  </header>

  <section class="rec-filtros">
    <label class="buscador buscador--grande">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input id="rec-q" type="search" placeholder="Buscar por nombre, tema o descripción…" autocomplete="off">
    </label>

    <div class="rec-filtros__grupo">
      <span class="rec-filtros__etq">Categoría</span>
      <div class="chips">
        ${chip('cat', '', 'Todas')}
        ${CATEGORIAS.map((c) => chip('cat', c.key,
          '<i class="fa-solid ' + c.icon + '" style="color:' + c.color + '"></i> ' + esc(c.label))).join('')}
      </div>
    </div>

    <div class="rec-filtros__pie">
      <div>
        <b id="rec-cuenta"></b>
        <div class="rec-filtros__resumen" id="rec-resumen"></div>
      </div>
      <button class="btn btn--ghost btn--mini" id="rec-limpiar" hidden>
        <i class="fa-solid fa-eraser"></i> Limpiar filtros</button>
    </div>
  </section>

  <div class="rec-rejilla" id="rec-lista"></div>

  <p class="nota-pie">
    <i class="fa-solid fa-circle-info"></i>
    Los enlaces llevan a sitios externos, ajenos a la Academia C.O.D.E.
    Revisa siempre con tu docente antes de crear una cuenta.
  </p>
  `;

  $('#rec-q', cont).value = f.q;

  let t = null;
  $('#rec-q', cont).addEventListener('input', (e) => {
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { f.q = v; pintarResultados(cont); }, 180);
  });

  $$('[data-filtro]', cont).forEach((b) => b.addEventListener('click', () => {
    const [campo, valor] = b.dataset.filtro.split('|');
    f[campo] = f[campo] === valor ? '' : valor;
    marcarChips(cont);
    pintarResultados(cont);
  }));

  $('#rec-limpiar', cont).addEventListener('click', () => {
    f.q = ''; f.cat = '';
    $('#rec-q', cont).value = '';
    marcarChips(cont);
    pintarResultados(cont);
    toast('Filtros limpios', 'Vuelves a ver los ' + RECURSOS.length + ' recursos.', 'info', 2600);
  });

  marcarChips(cont);
  pintarResultados(cont);
}

return { CATEGORIAS: CATEGORIAS, AREAS: AREAS, NIVELES: NIVELES, USOS: USOS, RECURSOS: RECURSOS, render: render };
})();

/* ---------- portada.js ---------- */
var __M_portada = (function () {
/* ============================================================================
   portada.js — La parte pública: bienvenida, narrativa, accesos y recursos
   ----------------------------------------------------------------------------
   Antes de entrar a cualquier panel, todo el mundo pasa por aquí. La portada
   cuenta la historia de la Academia y ofrece cuatro caminos: el panel del
   tutor, el del estudiante, los recursos didácticos y el portal de exámenes.
   ========================================================================== */

const { $, $$, el, esc, rgb, modal, cerrarModal } = __M_ui;
const { db } = __M_datos;
const { CONTACTO, EXAMENES_URL, MAX_LEVEL } = __M_config;
const Recursos = __M_recursos;
/* --------------------------------- textos --------------------------------- */

const BIENVENIDA = [
  'Bienvenido a la Academia C.O.D.E., donde aprenderás a ser un verdadero hacker:',
  'aprende, diviértete y ve subiendo de nivel.'
];

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

const CAMINOS = [
  { id: 'tutor',       icon: 'fa-chalkboard-user', color: '#fbbf24',
    titulo: 'Hacker Tutor',        sub: 'Panel del docente' },
  { id: 'estudiante',  icon: 'fa-user-astronaut',  color: '#22d3ee',
    titulo: 'Hacker Estudiante',   sub: 'Panel del estudiante' },
  { id: 'recursos',    icon: 'fa-compass',         color: '#34d399',
    titulo: 'Recursos didácticos', sub: 'Plataformas para aprender' },
  { id: 'examenes',    icon: 'fa-file-pen',        color: '#a855f7',
    titulo: 'Exámenes',            sub: 'Portal de la institución' }
];

/* --------------------------------- estado --------------------------------- */

let alEntrar = null;        // (codigo, recordar, rol) => boolean
let alternarTema = null;    // lo aporta app.js, que es quien manda en el tema
let alImportar = null;      // diálogo para cargar un .json a mano
let paso = 'bienvenida';

function configurar(opciones) {
  alEntrar = opciones.alEntrar;
  alternarTema = opciones.alternarTema;
  alImportar = opciones.alImportar;
}

const pasoActual = () => paso;

/* --------------------------- diálogos de acceso --------------------------- */

function dialogoAcceso(rol) {
  const esTutor = rol === 'tutor';
  const form = el('form', { class: 'acceso', autocomplete: 'off' },
    el('div', { class: 'acceso__sello', style: { '--c': esTutor ? '#fbbf24' : '#22d3ee' } },
      el('i', { class: 'fa-solid ' + (esTutor ? 'fa-chalkboard-user' : 'fa-user-astronaut') })),
    el('p', { class: 'acceso__intro', text: esTutor
      ? 'Escribe tu código de tutor para abrir el panel de gestión.'
      : 'Escribe el código de estudiante que te entregó tu docente.' }),
    el('label', { class: 'campo' },
      el('span', { class: 'campo__etq', html: '<i class="fa-solid fa-barcode"></i> Código' }),
      el('input', {
        name: 'codigo',
        type: esTutor ? 'password' : 'text',
        required: 'required',
        spellcheck: 'false',
        placeholder: esTutor ? '••••••••••' : 'CODE-0001',
        autocomplete: esTutor ? 'current-password' : 'off'
      })),
    el('label', { class: 'check' },
      el('input', { name: 'recordar', type: 'checkbox', checked: 'checked' }),
      el('span', { text: 'Mantener la sesión abierta en este equipo' })),
    el('p', { class: 'acceso__error', hidden: 'hidden' }),
    el('button', { class: 'btn btn--grande btn--ancho', type: 'submit' },
      el('i', { class: 'fa-solid fa-right-to-bracket' }),
      esTutor ? ' Entrar como tutor' : ' Entrar a mi panel')
  );

  modal({
    titulo: esTutor ? 'Acceso Hacker Tutor' : 'Acceso Hacker Estudiante',
    subtitulo: esTutor ? 'Solo para el docente de la asignatura' : 'Tu progreso te espera',
    ancho: '440px',
    cuerpo: form
  });

  setTimeout(() => form.codigo.focus(), 260);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const caja = $('.acceso__error', form);
    const ok = alEntrar(form.codigo.value, form.recordar.checked, rol);
    if (ok) { cerrarModal(); return; }
    caja.textContent = esTutor
      ? 'Ese código de tutor no es correcto.'
      : 'No encontramos ese código de estudiante en la base de la academia.';
    caja.hidden = false;
    form.classList.remove('tiembla');
    void form.offsetWidth;
    form.classList.add('tiembla');
    form.codigo.select();
  });

  form.codigo.addEventListener('input', () => { $('.acceso__error', form).hidden = true; });
}

function irAExamenes() {
  const url = (db.config && db.config.examUrl) || EXAMENES_URL;
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  modal({
    titulo: 'Portal de exámenes',
    subtitulo: 'Todavía sin configurar',
    ancho: '480px',
    cuerpo: el('div', { class: 'confirmar' },
      el('p', { html: 'El enlace al portal de exámenes de la institución aún no está puesto.' }),
      el('p', { class: 'texto-suave', html:
        'El docente puede añadirlo desde <b>Panel del tutor ▸ Consola ▸ Portal de exámenes</b>, ' +
        'y desde ese momento este botón llevará directo allí.' }),
      el('div', { class: 'confirmar__botones' },
        el('button', { class: 'btn', onclick: cerrarModal }, 'Entendido')))
  });
}

/* -------------------------------- pantallas ------------------------------- */

function bienvenidaHTML() {
  return `
  <section class="bienvenida">
    <div class="bienvenida__sello"><i class="fa-solid fa-shield-halved"></i></div>
    <p class="bienvenida__eyebrow">Academia</p>
    <h1 class="bienvenida__t">C.O.D.E.</h1>
    <p class="bienvenida__texto">${BIENVENIDA[0]}<br>${BIENVENIDA[1]}</p>
    <p class="bienvenida__aviso">
      <i class="fa-solid fa-triangle-exclamation"></i>
      Hay una misión muy importante que cumplir.
    </p>
    <button class="btn btn--grande" id="btn-comenzar">
      <i class="fa-solid fa-rocket"></i> Comenzar misión
    </button>
    <p class="bienvenida__pie"><i class="fa-solid fa-database"></i>
      <span id="portada-fuente">—</span></p>
    <button class="enlace" id="btn-importar-portada" hidden>
      <i class="fa-solid fa-file-import"></i> Cargar la base desde un archivo</button>
  </section>`;
}

function navHTML(activo) {
  return CAMINOS.map((c) => `
    <button class="camino ${activo === c.id ? 'is-on' : ''}" data-camino="${c.id}"
            style="--c:${c.color};--c-rgb:${rgb(c.color)}">
      <span class="camino__ico"><i class="fa-solid ${c.icon}"></i></span>
      <span class="camino__txt">
        <b>${esc(c.titulo)}</b>
        <small>${esc(c.sub)}</small>
      </span>
      <i class="fa-solid fa-chevron-right camino__flecha"></i>
    </button>`).join('');
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

    <aside class="contacto">
      <h2 class="contacto__t"><i class="fa-solid fa-envelope-open-text"></i> ¿Eres docente?</h2>
      <p>
        Si te interesan los recursos de gamificación para el aula, o las aplicaciones de PC y de
        celular para llevar el registro de notas, la asistencia y mucho más, escríbeme:
      </p>
      <div class="contacto__enlaces">
        <a class="contacto__enlace" href="mailto:${esc(CONTACTO.correo)}">
          <i class="fa-solid fa-envelope"></i> ${esc(CONTACTO.correo)}
        </a>
        <a class="contacto__enlace" href="${esc(CONTACTO.whatsappLink)}"
           target="_blank" rel="noopener noreferrer">
          <i class="fa-brands fa-whatsapp"></i> ${esc(CONTACTO.whatsapp)}
        </a>
      </div>
    </aside>
  </article>`;
}

function cuerpoHTML(vista) {
  return `
  <div class="portada__cuerpo">
    <aside class="portada__nav">
      <button class="portada__volver" id="btn-volver-inicio">
        <i class="fa-solid fa-chevron-left"></i> Inicio
      </button>
      <p class="portada__nav-t">Elige tu camino</p>
      ${navHTML(vista === 'recursos' ? 'recursos' : null)}
      <p class="portada__nav-pie">
        Academia C.O.D.E. · ${esc((db.config && db.config.institution) || '')}
      </p>
    </aside>
    <main class="portada__vista" id="portada-vista"></main>
  </div>`;
}

/* --------------------------------- render --------------------------------- */

function mostrar(nuevoPaso) {
  paso = nuevoPaso || 'bienvenida';
  const cont = $('#portada');
  cont.hidden = false;

  if (paso === 'bienvenida') {
    cont.innerHTML = fondoHTML() + bienvenidaHTML();
    $('#portada-fuente').textContent = db.cargado
      ? db.students.length + ' estudiantes registrados'
      : 'Sin base cargada · el tutor puede crearla';
    $('#btn-comenzar').addEventListener('click', () => mostrar('mision'));

    const imp = $('#btn-importar-portada');
    if (imp && !db.cargado && alImportar) {
      imp.hidden = false;
      imp.addEventListener('click', alImportar);
    }
  } else {
    cont.innerHTML = fondoHTML() + cuerpoHTML(paso);
    const vista = $('#portada-vista', cont);
    if (paso === 'recursos') Recursos.render(vista);
    else vista.innerHTML = narrativaHTML();

    $('#btn-volver-inicio', cont).addEventListener('click', () => mostrar('bienvenida'));

    $$('[data-camino]', cont).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.camino;
      if (id === 'tutor' || id === 'estudiante') dialogoAcceso(id);
      else if (id === 'recursos') mostrar('recursos');
      else if (id === 'examenes') irAExamenes();
    }));
  }

  const tema = $('#btn-tema-portada', cont);
  if (tema && alternarTema) tema.addEventListener('click', alternarTema);

  const vistaNodo = $('#portada-vista', cont) || $('.bienvenida', cont);
  if (vistaNodo) {
    vistaNodo.classList.remove('entra');
    void vistaNodo.offsetWidth;
    vistaNodo.classList.add('entra');
  }
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

/** Abre directamente el diálogo de acceso (por ejemplo tras cerrar sesión). */
function pedirAcceso(rol) {
  mostrar('mision');
  setTimeout(() => dialogoAcceso(rol), 320);
}

return { configurar: configurar, pasoActual: pasoActual, mostrar: mostrar, ocultar: ocultar, pedirAcceso: pedirAcceso };
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
   app.js — Arranque, acceso por código y enrutador de los dos paneles
   ----------------------------------------------------------------------------
   Todo el mundo entra por la portada (js/portada.js), que cuenta la narrativa
   y ofrece cuatro caminos. Desde ahí, el código de tutor abre el panel de
   gestión y el código de estudiante abre el suyo. Nadie ve el panel del otro.
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
const dCentro = __M_docente_centro;
const dEstudiantes = __M_docente_estudiantes;
const dNotas = __M_docente_notas;
const dClasificacion = __M_docente_clasificacion;
const dCredenciales = __M_docente_credenciales;
const dInformes = __M_docente_informes;
const dConsola = __M_docente_consola;
const VISTAS = {
  perfil: vPerfil,
  niveles: vNiveles,
  estadisticas: vEstadisticas,
  comparativa: vComparativa,
  ranking: vRanking,
  boletines: vBoletines,
  escarapela: vEscarapela
};

const VISTAS_DOCENTE = {
  centro: dCentro,
  estudiantes: dEstudiantes,
  notas: dNotas,
  clasificacion: dClasificacion,
  credenciales: dCredenciales,
  informes: dInformes,
  consola: dConsola
};

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

function volverAPortada(paso) {
  $('#app').hidden = true;
  document.body.classList.remove('con-app', 'rol-docente');
  Portada.mostrar(paso || 'bienvenida');
}

/**
 * Valida un código y abre el panel que corresponda.
 * @param {string} codigo
 * @param {boolean} recordar
 * @param {'tutor'|'estudiante'|null} rol  si viene, solo acepta códigos de ese rol
 * @returns {boolean} true si el acceso fue válido
 */
function entrar(codigo, recordar, rol) {
  const limpio = String(codigo || '').trim();
  if (!limpio) return false;

  const esTutor = A.esDocente(limpio);
  const st = esTutor ? null : D.buscarPorCodigo(limpio);

  if (rol === 'tutor' && !esTutor) return false;
  if (rol === 'estudiante' && !st) return false;
  if (!esTutor && !st) return false;

  estado.rol = esTutor ? 'docente' : 'estudiante';
  estado.estudiante = st;

  if (recordar) D.guardarSesion(limpio); else D.borrarSesion();
  abrirPanel();
  toast(esTutor ? 'Bienvenido, tutor' : '¡Misión iniciada!',
    esTutor ? 'Panel de gestión abierto.' : 'Bienvenido de nuevo, ' + st.name.split(' ')[0] + '.', 'ok');
  return true;
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
  volverAPortada('mision');
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

/* ------------------------------ importar base ----------------------------- */

function dialogoImportar() {
  const input = el('input', { type: 'file', accept: '.json,application/json' });
  const cuerpo = el('div', { class: 'importar' },
    el('p', { text: 'Carga el archivo .json de la academia. Se guarda solo en este navegador.' }),
    el('div', { class: 'importar__zona', id: 'zona-drop' },
      el('i', { class: 'fa-solid fa-file-arrow-up' }),
      el('p', { html: '<b>Arrastra el archivo aquí</b><br>o haz clic para elegirlo' })),
    el('p', { class: 'importar__actual', text: 'Ahora mismo estás usando: ' + D.db.origen }),
    el('button', {
      class: 'btn btn--ghost btn--ancho',
      onclick: () => {
        D.olvidarLocal();
        toast('Base restablecida', 'Se recargará la copia de la carpeta /data.', 'ok');
        setTimeout(() => location.reload(), 900);
      }
    }, el('i', { class: 'fa-solid fa-rotate-left' }), ' Volver a la base de la carpeta /data')
  );

  const m = modal({ titulo: 'Importar base', subtitulo: 'Archivo JSON de Academia C.O.D.E.', ancho: '520px', cuerpo });
  const zona = $('#zona-drop', m.contenido);

  const procesar = async (file) => {
    if (!file) return;
    try {
      const n = await D.importarArchivo(file);
      cerrarModal();
      toast('Base importada', n + ' estudiantes cargados. Vuelve a entrar con tu código.', 'ok');
      estado.rol = null;
      estado.estudiante = null;
      D.borrarSesion();
      setTimeout(() => volverAPortada('mision'), 400);
    } catch (e) {
      toast('No se pudo importar', e.message, 'err');
    }
  };

  zona.addEventListener('click', () => input.click());
  input.addEventListener('change', () => procesar(input.files[0]));
  ['dragenter', 'dragover'].forEach((ev) => zona.addEventListener(ev, (e) => {
    e.preventDefault(); zona.classList.add('is-hover');
  }));
  ['dragleave', 'drop'].forEach((ev) => zona.addEventListener(ev, (e) => {
    e.preventDefault(); zona.classList.remove('is-hover');
  }));
  zona.addEventListener('drop', (e) => procesar(e.dataTransfer.files[0]));
}

/* --------------------------------- ayuda ---------------------------------- */

const AYUDA_ESTUDIANTE = `
  <h4>Tu progreso</h4>
  <p>Cada periodo tiene cuatro misiones: <b>Taller</b>, <b>Reto gamificado</b> y dos <b>bitácoras</b>.
     El promedio del periodo es la media ponderada de las que ya tienen nota.</p>
  <h4>Experiencia y nivel</h4>
  <p>Cada misión te da <b>su nota × 10</b> (hasta 100 XP por misión). Con las 24 misiones del año
     el techo son 2 400 XP, y subes un escalón cada 225 XP.</p>
  <h4>Los 10 niveles hacker</h4>
  <p>La escalera va de <b>Aprendiz</b> a <b>Maestro/Maestra</b>, y está calibrada a una regla
     sencilla: <b>quien sostiene 8.5 de promedio en las 24 misiones desbloquea los diez niveles</b>
     (8.5 × 24 × 10 = 2 040 XP, y el nivel 10 se abre con 2 025). Al subir de nivel <b>tu avatar
     cambia</b>: cada identidad tiene su propia ilustración.</p>
  <h4>Atajos de teclado</h4>
  <p><b>Ctrl + 1 … 7</b> cambian de sección · <b>Esc</b> cierra ventanas · <b>Ctrl + P</b> imprime.</p>
  <h4>¿Un dato no cuadra?</h4>
  <p>Todo sale de la base que registra tu docente. Si ves algo raro, coméntaselo: aquí no se puede editar.</p>`;

const AYUDA_DOCENTE = `
  <h4>Por dónde empezar</h4>
  <p><b>1.</b> En <b>Consola</b>, escribe los datos de la institución y conecta la carpeta <code>data</code>.
     <b>2.</b> En <b>Estudiantes</b>, importa tu lista desde Excel o créalos a mano.
     <b>3.</b> En <b>Notas</b>, califica las cuatro misiones de cada periodo.</p>
  <h4>Dónde se guarda</h4>
  <p>Siempre en este navegador. Además, si conectas la carpeta <code>data</code> del proyecto,
     cada cambio se escribe en <code>data/academia-code.json</code>, que es el archivo que leen
     tus estudiantes al entrar con su código.</p>
  <h4>Excel</h4>
  <p>Columnas: <b>Nombre completo, Grado, Grupo, Género, Código de estudiante</b>. El orden y las
     tildes dan igual. Antes de importar verás una previsualización con el estado de cada fila.</p>
  <h4>Copias de seguridad</h4>
  <p>Exporta el JSON cuando quieras, y con la carpeta conectada guarda copias con fecha en
     <code>data/respaldos/</code>. Vaciar la base descarga una copia automáticamente.</p>
  <h4>Atajos de teclado</h4>
  <p><b>Ctrl + 1 … 7</b> cambian de sección · en la matriz de notas, <b>Enter</b> y las flechas se
     mueven entre celdas y cada cambio se guarda solo.</p>`;

function dialogoAyuda() {
  modal({
    titulo: esDocente() ? 'Cómo funciona el panel docente' : '¿Cómo funciona tu panel?',
    subtitulo: APP.name + ' v' + APP.version,
    ancho: '600px',
    cuerpo: el('div', { class: 'ayuda', html: esDocente() ? AYUDA_DOCENTE : AYUDA_ESTUDIANTE })
  });
}

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
      if (!estado.rol) { if (Portada.pasoActual()) Portada.mostrar(Portada.pasoActual()); return; }
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

  Portada.configurar({ alEntrar: entrar, alternarTema, alImportar: dialogoImportar });

  ocultarCarga();

  const guardado = D.sesionGuardada();
  if (guardado && (A.esDocente(guardado) || D.buscarPorCodigo(guardado))) {
    entrar(guardado, true, null);
  } else {
    Portada.mostrar('bienvenida');
  }

  if (!res.ok) {
    toast('No se encontró la base', 'Entra como Hacker Tutor para crear la lista o importa un JSON.', 'warn', 9000);
  }
}

/* ------------------------------- eventos ---------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  $('#btn-tema').addEventListener('click', alternarTema);
  $('#btn-salir').addEventListener('click', salir);
  $('#btn-ayuda').addEventListener('click', dialogoAyuda);
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
})();
