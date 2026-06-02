## Context

El CMS local de desarrollo es una herramienta offline que permite administrar el contenido del blog. Actualmente, no cuenta con un sistema dedicado de biblioteca de recursos para gestionar las imágenes locales. Los redactores necesitan un catálogo visual para realizar operaciones CRUD (Subir, Reemplazar, Eliminar, Renombrar) directamente sobre los archivos físicos de `src/assets/` y `public/`, sin romper las referencias de esas imágenes en los posts de contenido existentes. Además, se requiere perfeccionar la interacción del usuario mediante la reubicación de la barra de herramientas a la derecha y el uso de transiciones fluidas de carácter onírico.

## Goals / Non-Goals

**Goals:**
*   Implementar una Biblioteca de Recursos visual con navegación en árbol y cuadrícula adaptativa.
*   Reubicar el menú de hamburguesa flotante en el lateral derecho de la pantalla.
*   Agregar un botón selector de modo flotante (`🖼️` / `✍️`) que alterne suavemente entre el Editor de Contenidos y la Biblioteca de Recursos mediante un filtro blur de 2 segundos.
*   Proveer CRUD completo sobre archivos de imagen en la biblioteca, con persistencia física local y commits automáticos en Git.
*   Implementar un sistema de notificaciones Toast con chimes de sonido tiernos sintetizados en caliente mediante Web Audio API.
*   Implementar un Dependency Tracker en el backend que busque y actualice de forma automática y rigurosa todas las referencias de una imagen cuando esta es renombrada en todos los archivos `.md` y `.mdx` de `src/content/`.
*   Dibujar marcos de peligro animados (amarillo-negro para +10 usos, rojo-negro para +50 usos) para imágenes de alta frecuencia de uso, configurables desde `scripts/cms/config.json`.
*   Agregar tooltip enriquecido de información `(i)` y edición en línea mediante doble clic y tecla Enter.

**Non-Goals:**
*   Gestionar bases de datos externas: toda la persistencia se realiza directamente sobre el sistema de archivos local (`fs`).
*   Construir galerías de videos o audios: el alcance de la biblioteca de recursos se limita estrictamente a archivos de imagen (`.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.gif`).

## Decisions

### 1. Centralización de la API de Recursos Multimedia en Backend
Se ampliará el módulo backend `scripts/cms/api/media.js` para añadir endpoints dedicados:
*   `GET /api/resources`: Escanea `src/assets/` y `public/` para devolver un árbol de carpetas jerárquico y un listado plano con metadatos (tamaño, extensión, ruta, y recuento de usos).
*   `POST /api/resources/upload`: Permite guardar archivos especificando una subcarpeta de destino.
*   `POST /api/resources/rename`: Implementa el renombrado físico mediante `fs.renameSync` y ejecuta de forma inmediata el **Dependency Tracker**.
*   `POST /api/resources/replace`: Reemplaza físicamente un recurso existente.
*   `DELETE /api/resources`: Elimina físicamente archivos mediante `fs.unlinkSync`.

*Alternativas consideradas:* Crear un script API totalmente nuevo. Se descartó para mantener cohesionadas todas las operaciones sobre assets en el módulo modular `media.js` ya existente.

### 2. Dependency Tracker (Rastreo Riguroso de Ocurrencias)
Al renombrar un archivo de recurso (por ejemplo, de `antigua.png` a `nueva.png`), el backend realizará un escaneo recursivo en disco sobre `src/content/**/*.md` y `src/content/**/*.mdx`.
*   Se buscará la ocurrencia de la ruta del archivo exacta (ej. `/assets/images/posts/antigua.png` o `antigua.png`).
*   Se reemplazará el nombre del recurso de forma transparente en el frontmatter YAML y en los enlaces Markdown del cuerpo del archivo.
*   El backend guardará los posts editados en el disco y realizará commits automáticos unitarios en Git para cada post afectado.

*Alternativas consideradas:* Realizar la edición en el cliente. Se descartó por rendimiento y robustez; el backend en Node.js cuenta con acceso nativo de alta velocidad al sistema de archivos local.

### 3. Síntesis de Sonido en Caliente con Web Audio API
Para evitar la carga de archivos de audio pesados en la interfaz de usuario, los Toasts de notificaciones dispararán un chime auditivo sintetizado dinámicamente:
*   Se utilizará `AudioContext` para crear dos osciladores en paralelo.
*   **Oscilador 1 (Fundamental)**: Frecuencia de tipo `sine` configurada en 880Hz (nota La5, brillante y tierna).
*   **Oscilador 2 (Armónico/Tercera)**: Frecuencia de tipo `sine` configurada en 1100Hz (nota Do#6, tercera mayor brillante) o 1320Hz para un intervalo de quinta justa de sonido sumamente dulce.
*   Se aplicará un nodo `GainNode` con un decaimiento exponencial rápido (de 0.15 a 0 en 0.4 segundos) para emular una campana o campanilla de viento tierna.

### 4. Borde Animado Radiactivo Estilizado
Las imágenes críticas mostrarán un borde con franjas diagonales en CSS:
*   Límite de usos cargado en caliente desde `scripts/cms/config.json` (por defecto, >10 para amarillo-negro y >50 para rojo-negro).
*   Se definirá un borde decorativo mediante gradientes de fondo lineales repetitivos (`repeating-linear-gradient`) combinados con `@keyframes` de animación de scroll diagonal infinito de la máscara de borde.

## Risks / Trade-offs

*   **[Riesgo] Escaneo ineficiente de referencias en posts** → Al tener muchos artículos de blog, un escaneo síncrono recursivo podría bloquear el event-loop del backend Express.
    *   *Mitigación:* Se optimizará el Dependency Tracker leyendo de forma asíncrona mediante promesas y se aplicará un filtro regex preciso para buscar el nombre base del recurso en lugar de lecturas pesadas innecesarias.
*   **[Riesgo] Colisión de nombres en renombrados o subidas** → El usuario podría intentar renombrar un archivo a un nombre que ya existe en el directorio de destino.
    *   *Mitigación:* El backend realizará una validación estricta usando `fs.existsSync` y devolverá un código de error controlado para mostrar un Toast de advertencia con chime antes de procesar cualquier cambio.
