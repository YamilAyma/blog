## Why

Esta iteración (Iteración 3) busca dotar al CMS local de desarrollo de capacidades completas de administración física de archivos de contenido, automatización segura de flujos de control de versiones locales (Git) y una mayor modularización interna en el backend para garantizar un mantenimiento ágil a largo plazo. 

La falta de borrado directo desde la UI, la imposibilidad de seleccionar subcarpetas al crear nuevos artículos y la necesidad de ejecutar comandos manuales de Git (commit y push) al guardar o subir imágenes representan cuellos de botella de usabilidad que esta iteración resuelve de manera centralizada.

## What Changes

*   **Gestión Jerárquica al Crear Recursos**: Integración de un árbol recursivo interactivo en el modal de "Crear Nueva Entrada" para seleccionar de forma visual en qué subcarpeta física de `src/content/[colección]/` se guardará el nuevo archivo, con soporte para crear subdirectorios en caliente.
*   **Borrados Físicos con Confirmación**: Opción para eliminar de forma física y permanente entradas de contenido desde el panel del CMS, protegida por un Modal de Confirmación interactivo con animaciones.
*   **Plantillas Iniciales Enriquecidas (Templates)**: Al crear un nuevo archivo, se auto-poblará el cuerpo Markdown con una estructura enriquecida de cabeceras y bloques MDX de ejemplo específicos por colección.
*   **Auto-Commits Diferenciados en Git**: El backend creará de forma transparente commits locales en Git tras cada acción:
    *   Nuevo contenido: `feat (Contenido) - Crear nueva entrada [slug] en [colección]`
    *   Actualización de contenido: `docs (Contenido) - Actualizar entrada [slug] en [colección]`
    *   Subida de imágenes: `feat (Assets) - Agregar imagen [filename] en assets`
*   **Botón Hamburguesa Flotante con Git Push**: Menú general flotante interactivo en la esquina inferior izquierda del CMS que al pasar el ratón (hover) despliega opciones rápidas. La principal es "Git Push" para subir en caliente los commits al repositorio remoto (`origin/main`), notificando el resultado al instante a través de Toasts.
*   **Desacoplamiento Modular del Backend**: Refactorización pragmática del backend monolítico `server.js` separando responsabilidades en submódulos internos ES6 (`git.js`, `media.js`, `content.js`, `yamlFormatter.js`) en la carpeta `scripts/cms/api/`.

## Capabilities

### New Capabilities
<!-- Ninguna de producción, todo local de desarrollo -->

### Modified Capabilities
- `dev-cms`: Refinar el CMS con borrado físico, selección de subcarpetas al crear, plantillas dinámicas de contenido, auto-commits integrados y menú flotante con Git Push asíncrono.

## Impact

*   **Backend**: `scripts/cms/server.js` se dividirá en módulos bajo `scripts/cms/api/`. Se añadirán endpoints `DELETE /api/content/:collection/*` y `POST /api/git-push`.
*   **Frontend**: `scripts/cms/public/index.html` integrará el modal de confirmación de borrado, el árbol de carpetas de contenido en el diálogo de creación, el botón flotante general de hamburguesa y soporte de Toasts para Git Push.
