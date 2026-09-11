# 🛰️ PanelAcademiaCODE — Academia C.O.D.E.

Una sola aplicación web con una **portada narrativa** y **dos paneles**:

- **Portada** — da la bienvenida, cuenta la historia de la Academia (la IA *GHOST* ha
  hackeado el sistema de la Escuela) y ofrece dos puertas propias: Hacker Tutor y Hacker
  Estudiante.
- **Panel del estudiante** — entra con su código y ve su progreso convertido en juego:
  XP, los 10 niveles hacker, insignias, ranking, boletines, escarapela digital y su álbum
  de tarjetas coleccionables.
- **Panel del docente** — entra directo (sin código) y gestiona todo: estudiantes, notas
  por misión y periodo, estadísticas, ranking, escarapelas, el álbum del curso, informes,
  datos de la institución y copias de seguridad.

Los dos comparten la misma base de datos y el mismo motor de cálculo, así que lo que el
docente registra es exactamente lo que el estudiante ve.

> El panel del docente es una herramienta de uso local del propio docente (por eso entra
> sin código): la **versión que se publica en la web** (ver [Subirla a la
> web](#-subirla-a-la-web-o-abrirla-sin-servidor)) no lo incluye en absoluto — solo lleva
> el panel del estudiante.

- Sin backend, sin base de datos, sin instalación.
- Funciona sin internet: las librerías tienen copia local en `assets/vendor/`.
- Nada se envía a ningún servidor: todo vive en el equipo.

---

## ⚡ Cómo ejecutarlo

### Opción A — VS Code + Live Server (recomendada)

1. **Archivo ▸ Abrir carpeta…** y selecciona `Web AcademiaCODE`.
2. Instala la extensión **Live Server** (Ritwick Dey) desde `Ctrl + Shift + X` si no la tienes.
3. Clic derecho sobre `index.html` ▸ **Open with Live Server** (o el botón **Go Live**).
4. Se abre `http://127.0.0.1:5520`. Listo.

> `.vscode/settings.json` ya deja fijados el puerto **5520** y la raíz del proyecto.

### Opción B — Doble clic (la más portable)

Doble clic en **`iniciar-servidor.bat`**. Arranca `servidor.py`, busca un puerto libre,
desactiva la caché y abre el navegador solo. Desde una terminal:

```bash
python servidor.py
```

### Opción C — Node.js

```bash
npx serve -l 5520 .
```

> ⚠️ **No abras `index.html` con doble clic (`file://`).** El panel usa módulos ES y
> `fetch()`, y los navegadores bloquean ambos en ese protocolo. Si lo abres así verás un
> aviso en pantalla explicando cómo arrancar el servidor.

---

## 🚀 La portada

Al abrir la web nadie ve un formulario: se ve una **bienvenida** y un botón
**Comenzar misión**. Ese botón lleva a la pantalla de la narrativa, donde se cuenta la
historia de la Academia y aparece la columna de la izquierda.

Arriba, las dos puertas que abren un panel de esta misma aplicación:

| Camino | A dónde lleva |
|---|---|
| 🟡 **Hacker Tutor** | Abre el panel de gestión directamente, sin pedir nada |
| 🔵 **Hacker Estudiante** | Pide el código de estudiante y abre su panel personal |

---

## 🔑 Cómo se entra

| Quién | Qué hace | Qué ve |
|---|---|---|
| Docente | Clic en **Hacker Tutor** | El panel de gestión completo, sin código de por medio |
| Estudiante | Escribe su código (`CODE-0001`, `CODE-0002`, …) | Su panel personal, de solo lectura |

- La casilla **«Mantener la sesión abierta»**, en el acceso del estudiante, recuerda el
  código en ese navegador y la próxima vez entra directo a su panel, saltándose la portada.
- **Salir** borra la sesión y devuelve a la pantalla de la misión.

> 🔒 **Sobre la seguridad.** El panel del docente ya no pide código: es una herramienta de
> uso local, en el propio equipo del docente, así que un candado de acceso no aportaba
> seguridad real (toda la app corre en el navegador). Por eso mismo, la versión que se
> **publica en la web** no incluye el panel del docente en absoluto — ver
> [Subirla a la web](#-subirla-a-la-web-o-abrirla-sin-servidor).

Con la cohorte de demostración incluida puedes probar con **`CODE-0001`** … **`CODE-0070`**.
`CODE-0002` es un estudiante de nivel 10 y `CODE-0003` uno de nivel 6.

---

## 👩‍🏫 El panel del docente

| Vista | Qué hace |
|---|---|
| **Centro de Mando** | KPIs del curso, cuatro gráficas (promedio por periodo, reparto de desempeños, promedio por curso, fortalezas por categoría), monitor de estudiantes en riesgo y gestión de avisos. Filtros por **grado, grupo y estudiante**: al elegir uno aparece su ficha completa |
| **Estudiantes** | Alta manual, edición, borrado y **carga masiva desde Excel** con previsualización. Exporta la lista completa con promedios, rangos, XP y nivel |
| **Notas** | Se elige periodo y **misión (1 a 6)**, y se califican sus cuatro actividades. Cada nota se guarda al escribirla; Enter y las flechas mueven entre celdas. Las pestañas de misión muestran el % calificado. Se renombran misiones y actividades, se ajustan ponderaciones y se exporta el periodo completo a Excel |
| **Ranking** | Clasificación completa con podio, filtros de grado, grupo, métrica y rango, y exportación a Excel |
| **Escarapelas** | Las credenciales de todo el curso, siempre al día con lo último que registraste. Toca una para verla en grande. Se descargan en **PNG, PDF e HTML interactivo**, sueltas o en lote (el lote de PNG viaja como un único `.zip`) |
| **Álbum** | Las 10 tarjetas coleccionables de cada estudiante (una por nivel hacker), para ver quién lleva cuántas y abrir el álbum completo de cualquiera |
| **Informes** | Informe académico en **hoja carta vertical**: cabecera institucional, detalle de las seis misiones con sus cuatro actividades, consolidado del año, valoración, escala institucional y pie con docente, área y fecha. Por periodo o general, en **PDF** y **HTML interactivo**, de un estudiante o de todo el curso |
| **Consola** | Datos de la institución, ponderaciones, carpeta de datos, respaldos, diagnóstico y vaciado de la base |

**Atajos:** `Ctrl + 1 … 8` cambian de sección · `Esc` cierra ventanas · `Ctrl + P` imprime.

### Los filtros salen de tu base

Los desplegables de grado y grupo muestran **solo lo que existe en tu lista**: si tu curso
es «Tercero / 301», eso es lo que aparece, no una lista fija de 6.º a 11.º. En el formulario
de alta, en cambio, grado y grupo se escriben libremente (con sugerencias), para que puedas
crear el primer estudiante de un curso que aún no existe.

### Por dónde empezar con un curso nuevo

1. **Consola** → escribe los datos de la institución y **conecta la carpeta `data`**.
2. **Estudiantes** → *Importar Excel* (o *Nuevo* uno a uno).
3. **Notas** → califica las cuatro misiones de cada periodo.
4. Reparte los códigos: cada estudiante entra con el suyo y ve su progreso.

### Importar desde Excel

Las **cinco columnas** que se esperan (el orden no importa, y las tildes y mayúsculas tampoco):

| Nombre completo | Grado | Grupo | Género | Código de estudiante |
|---|---|---|---|---|
| Valentina Marín Osorio | 6 | A | Femenino | CODE-0001 |
| Santiago Restrepo Vega | 6 | A | M | CODE-0002 |

- Descarga la plantilla lista desde el propio diálogo de importación.
- `Género` acepta `M`/`F`, `Masculino`/`Femenino`, `Hombre`/`Mujer`, o vacío (Otro / N.E.).
- Antes de importar verás una **previsualización** que marca cada fila como *Nuevo*,
  *Ya existe*, *Repetido* o *Incompleto*, y decides si actualizar los que ya existían.
- Se aceptan también encabezados alternativos: *Nombre*, *Estudiante*, *Curso*, *Sección*,
  *Sexo*, *Código*, *Identificación*, *Documento*…

### Dónde se guardan los datos

El panel del docente guarda en dos sitios a la vez:

1. **`localStorage` del navegador** — siempre, en cada cambio. Rápido, pero atado a ese
   navegador y a ese equipo.
2. **La carpeta del proyecto** — opcional y muy recomendable. En *Consola ▸ Carpeta de
   datos* pulsa **Conectar carpeta /data** y elige la carpeta `data` del proyecto. Desde
   ese momento cada cambio se escribe también en `data/academia-code.json`, que es justo
   el archivo que leen los estudiantes al entrar.

La barra superior indica siempre dónde estás guardando: **Carpeta ‹nombre›** (verde) o
**Solo navegador** (ámbar). Al entrar como tutor por primera vez, el panel te ofrece
conectarla de un clic.

### Los estudiantes lo ven al instante

No hay botón de «publicar». Cada nota se guarda al escribirla y llega al panel del alumno
por dos vías:

- **Misma máquina, otra pestaña** — el cambio se propaga en el acto.
- **Otro equipo** — el panel del estudiante relee `data/academia-code.json` cada 15 segundos
  y se repinta solo cuando detecta algo más nuevo, avisando con un mensaje.

El sondeo solo corre en el panel del estudiante. El del docente nunca relee el archivo:
es él quien manda, y releerlo le borraría lo que acaba de escribir.

> La escritura directa en carpetas la ofrecen **Chrome y Edge**. En Firefox o Safari el
> panel funciona igual, pero tendrás que usar *Exportar JSON* y copiar el archivo a mano
> dentro de `data/`.

### Copias de seguridad

- **Exportar JSON** — descarga la base completa con fecha y hora. Restaura todo y es lo
  que copias dentro de `data/` para publicarla a los estudiantes.
- **Restaurar desde archivo** — carga cualquier JSON exportado antes.
- **Respaldo automático** — con la carpeta conectada, la primera vez que guardas cada día
  se deja sola una copia en `data/respaldos/respaldo-AAAA-MM-DD-HHMM.json`. Se conservan las
  **30 más recientes** y cualquiera se restaura con un clic. También puedes forzar una cuando
  quieras.
- **Cargar cohorte de ejemplo** — reemplaza la base por 70 estudiantes de prueba
  (códigos `DEMO-0001`…) con notas y misiones ya puestas, para ver el panel lleno.
- **Vaciar la base** descarga una copia automáticamente antes de borrar.

---

## 🎓 El panel del estudiante

| Vista | Qué muestra |
|---|---|
| **Perfil** | Avatar con anillo de nivel, XP animada, rango hacker, ánimo, seis KPIs, mapa de las 16 misiones del año, línea de tiempo por periodo y las 16 insignias |
| **Niveles** | Su identidad hacker en grande, de dónde sale su XP periodo a periodo, y la escalera de los 10 niveles |
| **Álbum** | Sus tarjetas coleccionables: una por cada nivel hacker superado, hasta 10. Las bloqueadas muestran cuánta XP falta; las desbloqueadas se ven en grande y se descargan como imagen para el cuaderno |
| **Estadísticas** | Evolución por periodo, radar por categoría, nota misión a misión, reparto de desempeños y tabla detallada |
| **Comparativa** | Su promedio frente al del curso, el grado o toda la academia |
| **Ranking** | Podio y clasificación con filtros y botón «Ir a mi puesto» |
| **Boletines** | Avisos del docente y boletín por periodo o consolidado, imprimible y descargable |
| **Escarapela** | Credencial de dos caras con QR, volteo 3D, impresión y descarga en PNG |

---

## 🎮 Los 10 niveles hacker

La escalera está calibrada a una regla: **quien sostiene 8.5 de promedio en las 24 misiones
del año desbloquea los diez niveles.**

    XP de una misión  = nota de la misión × 10       (máximo 100)
    XP del año        = suma de las 24 misiones      (máximo 2 400)
    Meta 8.5          = 8.5 × 24 × 10 = 2 040 XP
    Un escalón cada     225 XP  →  el nivel 10 se abre con 2 025

La XP se cuenta **misión a misión**, no por periodo. Así refleja el trabajo realmente
entregado: quien lleve seis misiones hechas no puede estar arriba del todo, por muy alta
que tenga la nota.

| Nivel | Identidad | Lema | XP | Promedio equivalente |
|---|---|---|---|---|
| 1 | Aprendiz | Primer inicio de sesión | 0 | — |
| 2 | Explorador · Exploradora | Curiosidad que abre puertas | 225 | 1.0 |
| 3 | Veloz | Reflejos de teclado | 450 | 1.9 |
| 4 | Lógico · Lógica | Piensas en pasos | 675 | 2.9 |
| 5 | Cazabugs | Ves lo que otros no ven | 900 | 3.8 |
| 6 | Llave | Descifras lo que parece cerrado | 1 125 | 4.7 |
| 7 | Conector · Conectora | Unes personas y sistemas | 1 350 | 5.7 |
| 8 | Creador · Creadora | Construyes cosas nuevas | 1 575 | 6.6 |
| 9 | Guardián · Guardiana | Proteges lo que la clase construye | 1 800 | 7.5 |
| 10 | Maestro · Maestra | Enseñas lo que dominas | 2 025 | 8.5 |

*(«Promedio equivalente» = el promedio mínimo que habría que sostener en las 24 misiones
para entrar a ese nivel. Va redondeado hacia arriba a un decimal, porque tiene que
cumplirse de verdad: el nivel 10 pide 8.4375 exactos, y un 8.4 sostenido se queda en
2 016 XP, a nueve de la meta. Por eso la regla de la academia es 8.5. Este número aparece
en la propia app, en cada tarjeta de la escalera.)*

Cómo termina el año según el promedio sostenido:

| Promedio | XP final | Nivel |
|---|---|---|
| 7.0 | 1 680 | 8 |
| 7.5 | 1 800 | 9 |
| 8.0 | 1 920 | 9 |
| 8.4 | 2 016 | 9 |
| **8.5** | **2 040** | **10 ✓** |
| 10.0 | 2 400 | 10 |

Y así avanza durante el año quien va justo en 8.5: nivel 3 a las 6 misiones, nivel 5 a las
12, nivel 7 a las 18 y nivel 10 al cerrar las 24. Un escalón cada 2,6 misiones,
perfectamente parejo.

- **El avatar evoluciona con el nivel**, en versión masculina o femenina según el género
  registrado. Se usa en el perfil, el ranking, el boletín y la escarapela.
- Para mover el listón, cambia `PROMEDIO_META` y `XP_PER_LEVEL` en `js/config.js`.
  Con `XP_PER_LEVEL = 250`, por ejemplo, el nivel 10 pediría 2 250 XP, o sea un 9.4 sostenido.

---

## 📊 Cómo se calcula todo

- Escala **0.0 – 10.0**, aprobación desde **7.0**.
- **4 periodos**, cada uno con **6 misiones**, y cada misión con **4 actividades**:
  Taller · Reto Gamificado · Bitácora 1 · Bitácora 2.
  Son **24 notas por periodo** y **96 en el año**.
- La **nota de una misión** es la media ponderada de sus cuatro actividades.
- La **nota del periodo** es la media ponderada de las cuatro actividades a lo largo de
  las seis misiones. Si algo no tiene nota, su peso se redistribuye: nadie se castiga
  por lo aún no calificado.
- El promedio global es la media de los periodos con notas.

> Las bases antiguas (4 actividades por periodo, sin misiones) se migran solas al abrirlas:
> sus notas quedan dentro de la misión 1 y las otras cinco se crean vacías.

| Desempeño | Nota | | Rango hacker | Promedio |
|---|---|---|---|---|
| Superior | 9.0 – 10.0 | | 👁️ G.H.O.S.T. Architect | 9.0 – 10.0 |
| Alto | 8.0 – 8.9 | | ⚡ Cyber Elite | 8.0 – 8.9 |
| Básico | 7.0 – 7.9 | | 🛰️ Code Runner | 7.0 – 7.9 |
| Bajo | 0.0 – 6.9 | | 🧪 Script Kiddie | 5.0 – 6.9 |
| | | | ⚠️ Reboot Required | menor a 5.0 |

**16 insignias**, todas deducidas de los datos. La **racha** cuenta misiones consecutivas
entregadas en el orden cronológico del año: no se simula actividad diaria, todo lo que se
ve existe en la base.

---

## 🌍 Subirla a la web (o abrirla sin servidor)

Doble clic en **`actualizar-web.bat`** (o `python publicar.py`). Deja listas **dos**
carpetas, cada una un paquete de `js/` empaquetado en un solo `app.bundle.js` clásico (sin
`import`, para que funcione también abierto con doble clic) y su base de datos congelada en
`data/base.js`:

| Carpeta | Quién entra | Base que usa |
|---|---|---|
| **`publicar/`** | Solo estudiantes — con su código, tras ver la narrativa | `data/academia-code.json` (la real) |
| **`publicar-demo/`** | Los dos paneles — Hacker Tutor entra directo, sin código, igual que Hacker Estudiante | `data/demo.json` (la cohorte de ejemplo) |

`publicar/` **deja fuera a propósito** todo `js/docente/*.js` y la puerta «Hacker Tutor» de
la portada: no hay forma de llegar al panel del docente desde ahí. `publicar-demo/` es lo
opuesto — una vitrina pública con ambos paneles y datos de ejemplo (`DEMO-0001…`), pensada
para compartir el enlace y que cualquiera vea cómo funciona la Academia sin exponer
estudiantes de verdad ni pedir ninguna contraseña. El acceso de estudiante ya trae escrito
el código `DEMO-0001`, listo para entrar con un clic. Para que nadie deje la demo en un
estado raro, su panel docente recorta tres cosas frente a la versión real: no tiene
**Consola**, y en **Estudiantes** no se puede dar de alta uno nuevo ni importar un Excel
(sí se puede editar y eliminar los que ya están).

Cualquiera de las dos carpetas se puede:

- **Abrir con doble clic** en `index.html`, sin arrancar ningún servidor. (La versión de
  desarrollo sí lo necesita: los módulos ES y `fetch()` están bloqueados en `file://`, y el
  paquete es justo lo que elimina esa dependencia.)
- **Subir tal cual** a cualquier hosting estático: Netlify, GitHub Pages, el servidor del
  colegio… Sube el *contenido* de la carpeta, no la carpeta.

Cada vez que cambies notas, vuelve a ejecutar `actualizar-web.bat` y vuelve a subir. Para
gestionar el curso —notas, estudiantes, escarapelas— sigue usando el proyecto original
(`index.html` en la carpeta de arriba), donde el panel del docente sí está.

---

## 📁 Estructura del proyecto

```
Web AcademiaCODE/
├── index.html                Shell de la aplicación (carga, portada y los dos paneles)
├── servidor.py               Servidor local portable, sin caché y con puerto automático
├── iniciar-servidor.bat      Doble clic para arrancar (Windows)
├── publicar.py               Empaqueta la web para subirla o abrirla sin servidor
├── actualizar-web.bat        Doble clic: actualiza publicar/ con los datos de ahora
├── publicar/                 Solo estudiantes, con la base real (la genera actualizar-web)
├── publicar-demo/            Docente + estudiante, con la cohorte de ejemplo (ídem)
├── .vscode/settings.json     Puerto y raíz de Live Server
├── data/
│   ├── academia-code.json    Base viva · la que el docente escribe y el alumno lee
│   ├── base.js               La misma base como script (para la versión publicada)
│   ├── demo.json             Cohorte de ejemplo, códigos DEMO-0001…
│   ├── respaldos/            Copias con fecha (las crea el docente)
│   └── LEEME.txt             Cómo poner tus datos reales
├── css/
│   ├── styles.css            Sistema visual completo (13 secciones)
│   └── print.css             Impresión de boletines, escarapelas e informes en lote
├── assets/
│   ├── avatares/             24 retratos cuadrados 400×400 (12 identidades × 2 géneros)
│   ├── niveles/              20 retratos de cuerpo entero .webp (10 niveles × 2 géneros)
│   ├── img/favicon.svg
│   └── vendor/               Chart.js, html2canvas, qrcodejs, SheetJS, jsPDF y JSZip locales
└── js/
    ├── config.js             Rangos, categorías, los 10 niveles, insignias, escala, roles
    ├── datos.js              Carga, normalización y lectura de la base
    ├── almacen.js            Escritura: altas, notas, config, carpeta y respaldos
    ├── motor.js              Cálculo: promedios, XP, niveles, insignias, retroalimentación
    ├── excel.js              Importación y exportación .xlsx con SheetJS
    ├── tarjeta.js            Escarapela, boletín y tarjetas de álbum, compartidos por los dos paneles
    ├── ui.js                 DOM, toasts, modales, animaciones
    ├── graficas.js           Capa sobre Chart.js
    ├── bus.js                Aviso central de «los datos cambiaron»
    ├── exportar.js           PNG (suelto o en lote .zip), PDF carta y HTML interactivo
    ├── portada.js            Bienvenida, narrativa y las dos puertas de acceso
    ├── app.js                Arranque, acceso y enrutador de los dos paneles
    ├── vistas/               Las 8 vistas del estudiante
    │   ├── perfil.js · niveles.js · album.js · estadisticas.js · comparativa.js
    │   └── ranking.js · boletines.js · escarapela.js
    └── docente/              Las 8 vistas del docente (fuera de la versión publicada)
        ├── filtros.js            Desplegables hechos con lo que hay en la base
        ├── centro.js · estudiantes.js · notas.js · clasificacion.js
        └── credenciales.js · album.js · informes.js · consola.js
```

---

## 🌐 Librerías y conexión

| Librería | Versión | Uso | Copia local |
|---|---|---|---|
| Tailwind CSS | play CDN | Utilidades de apoyo | — |
| Font Awesome | 6.5.2 | Iconos | — |
| Chart.js | 4.4.1 | Gráficas | ✅ `assets/vendor/` |
| html2canvas | 1.4.1 | Boletines y escarapelas en PNG | ✅ `assets/vendor/` |
| qrcodejs | 1.0.0 | QR de la escarapela | ✅ `assets/vendor/` |
| SheetJS | 0.18.5 | Importar y exportar Excel | ✅ `assets/vendor/` |
| jsPDF | 2.5.1 | Informes y escarapelas en PDF | ✅ `assets/vendor/` |
| JSZip | 3.10.1 | Empaqueta la descarga en lote de escarapelas en PNG | ✅ `assets/vendor/` |

Las librerías críticas se piden primero al CDN y, **si no hay internet, caen solas a
la copia de `assets/vendor/`**. El diseño vive completo en `css/styles.css`: si Tailwind o
Font Awesome no cargan, el panel se sigue viendo bien (solo faltarían los iconos).
*Consola ▸ Diagnóstico* muestra en verde o rojo cuáles cargaron.

> Tailwind se carga con `corePlugins: { preflight: false }` a propósito: su *reset* pisa el
> `content` de los iconos de Font Awesome, y el reset propio ya está en `styles.css`.

---

## 🎨 Personalización rápida

| Qué | Dónde |
|---|---|
| Institución, docente, asignatura, año, sigla y ponderaciones | Panel docente ▸ **Consola** |
| Nombres de las misiones | Panel docente ▸ **Notas**, clic en el título de la misión |
| Nombres de las actividades | Panel docente ▸ **Notas**, clic en el encabezado de la columna |
| Misiones por periodo | `MISIONES_POR_PERIODO` en `js/config.js` |
| Colores, tipografías, radios y sombras | Variables `:root` al inicio de `css/styles.css` |
| Rangos, desempeños y escala | `js/config.js` |
| Nombres, lemas, colores y retos de los 10 niveles | `js/config.js` (`LEVELS`) |
| Ritmo de la escalera | `XP_PER_LEVEL` y `MAX_LEVEL` en `js/config.js` |
| Grados y grupos disponibles | `GRADES` y `GROUPS` en `js/config.js` |
| Insignias | `js/config.js` (`BADGES`) + `insignias()` en `js/motor.js` |
| Textos de la retroalimentación | `retroalimentacion()` en `js/motor.js` |
| Ilustraciones | `assets/avatares/` y `assets/niveles/` |

Tema **claro/oscuro** con el botón de la barra superior; la elección se recuerda en el
navegador. El panel respeta `prefers-reduced-motion`.

---

## 🔒 Privacidad

- El panel del estudiante es de **solo lectura**: no puede cambiar ni una nota.
- El ranking muestra XP, nivel y rango hacker — **nunca la nota académica de otro estudiante**.
- La comparativa solo muestra **promedios de grupo**, jamás notas individuales ajenas.
- El panel del docente sí ve y edita todo; al entrar directo, sin código, es una
  herramienta de uso local en el propio equipo del docente — y por eso queda del todo
  fuera de la versión que se publica en la web (ver arriba).
- No hay telemetría, cuentas ni envío de datos a ningún servidor: todo ocurre en el equipo.

---

PanelAcademiaCODE v1.5.0 · Academia C.O.D.E. · aplicación local, sin servidor y sin telemetría.
