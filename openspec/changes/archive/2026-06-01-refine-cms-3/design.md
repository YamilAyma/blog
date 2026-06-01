## Context

El CMS de desarrollo ha crecido significativamente incorporando múltiples APIs y lógica interactiva de React en el cliente. Para garantizar un desarrollo limpio, escalable y libre de fallos a largo plazo, esta iteración propone modularizar de forma pragmática el backend dividiéndolo en submódulos internos ES6 independientes. Asimismo, se proveen herramientas avanzadas para la gestión física del repositorio (borrado, selección jerárquica de carpetas de contenidos, plantillas iniciales) y la automatización asíncrona de flujos de control de versiones locales y remotos (Git auto-commit y Git Push asíncrono).

## Goals / Non-Goals

**Goals:**
*   Desacoplar de forma pragmática el backend de Express `server.js` en 4 submódulos ES6 limpios dentro de la carpeta `scripts/cms/api/`: `git.js`, `yamlFormatter.js`, `content.js` y `media.js`.
*   Implementar borrado físico de archivos markdown protegidos con un modal de confirmación animado.
*   Permitir la selección recursiva y creación en caliente de carpetas al crear una nueva entrada en el CMS.
*   Configurar plantillas de contenido enriquecidas (templates) por defecto para el cuerpo markdown de los nuevos archivos.
*   Automatizar commits locales en Git tras cada acción (Creación, Actualización, Subida de imágenes) con mensajes formateados estrictamente.
*   Diseñar un botón de acciones rápidas flotante Hamburger que permita ejecutar `git push` al servidor remoto asíncronamente con Toasts de estado.

**Non-Goals:**
*   Introducir bases de datos externas o dependencias pesadas de control de versiones que alteren el flujo SSG local.
*   Soportar flujos de autenticación multiusuario.

## Decisions

### 1. Desacoplamiento Modular del Backend (Node ES6 Submódulos)
*   **Decisión**: `scripts/cms/server.js` se dividirá en módulos bajo la carpeta `scripts/cms/api/`:
    *   `yamlFormatter.js`: Parsers de frontmatter, serialización AST estricta (comillas dobles en strings, fechas y arrays en una sola línea, claves sin comillas).
    *   `content.js`: Escaneo recursivo de contenido, endpoints CRUD para leer, guardar, crear y borrar archivos Markdown/MDX.
    *   `media.js`: Escaneo de carpetas de assets, creación de carpetas y subida Base64 de imágenes.
    *   `git.js`: Comandos Git (commits automáticos locales y ejecución de push a repositorio remoto).
*   **Alternativa**: Mantener un único archivo monolítico de gran tamaño.
*   **Razón**: La modularización facilita drásticamente la mantenibilidad de la aplicación, delimita responsabilidades, simplifica la depuración de la serialización de YAML y la automatización de comandos de consola de Git.

### 2. Control de Versiones Integrado (Git Auto-Commit y Git Push)
*   **Git Auto-Commit**: Tras escribir con éxito un archivo físico (crear/guardar) o subir una imagen en assets, el backend llamará asíncronamente a `gitCommit` en el módulo `git.js`. Este ejecuta en consola `git add <filePath>` seguido de `git commit -m "<mensaje-formateado>"` de manera segura:
    *   Nuevo archivo: `feat (Contenido) - Crear nueva entrada [slug] en [colección]`
    *   Actualizar archivo: `docs (Contenido) - Actualizar entrada [slug] en [colección]`
    *   Subir imagen: `feat (Assets) - Agregar imagen [filename] en assets`
*   **Git Push Flotante**: Se integrará un botón circular flotante Hamburger en la esquina inferior izquierda con un menú que al pasar el ratón (hover) despliega opciones rápidas. La principal ejecutará `git push origin main` en el backend, procesando e informando del resultado de la operación mediante Toasts interactivos de carga, éxito o error.

### 3. Borrado de Contenido con Modal de Confirmación
*   **Decisión**: Añadir el endpoint `DELETE /api/content/:collection/*` que elimina de forma física el archivo local con `fs.unlinkSync`.
*   **UI del Cliente**: Se añadirá un botón "Eliminar Recurso" en el header del CMS. Al pulsarlo, abre un modal centrado con animación suave en CSS (fade-in, scale-up). Al confirmar, hace la petición asíncrona al servidor, notifica el borrado y refresca el árbol de contenidos en caliente.

### 4. Árbol de Carpetas e Inicialización Enriquecida al Crear Recursos
*   **Árbol de Carpetas**: El modal de "Crear Nueva Entrada" reutilizará el componente de árbol recursivo de carpetas físicas dentro de `src/content/[colección]/`. El desarrollador podrá seleccionar en qué subcarpeta exacta guardar el archivo o crear carpetas en caliente antes de escribir el archivo físico.
*   **Plantillas Iniciales**: `content.js` proveerá un helper que inyecta una estructura Markdown de ejemplo en el cuerpo del nuevo archivo según su tipo (ej: títulos, subsecciones, bloques MDX) evitando que los nuevos archivos queden vacíos o planos.

## Risks / Trade-offs

*   **[Riesgo: Conflictos en Git Push por puerto bloqueado o credenciales]**
    *   *Mitigación*: El backend capturará el error de consola de `git push` y devolverá el texto del fallo en formato JSON al cliente. El frontend alertará mediante un Toast de advertencia con el mensaje detallado para que el desarrollador pueda resolverlo en consola si es necesario (ej: credenciales SSH/OAuth expiradas).
*   **[Riesgo: Pérdida accidental de datos al borrar]**
    *   *Mitigación*: El borrado físico requerirá confirmación explícita mediante un modal de doble factor interactivo y animado, impidiendo clics accidentales.
