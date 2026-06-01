## Why

Actualmente, la creación y edición de contenido para el blog (bitácoras de desarrollo, micro-posts y artículos) requiere manipular directamente archivos físicos Markdown en el editor de código. Esta aproximación ralentiza la entrada ágil de recursos y dificulta la visualización rápida de la maquetación. Un CMS local interactivo, activo únicamente en modo desarrollo a través de un comando simple de ejecución, permitirá gestionar todo el contenido en tiempo real mediante una interfaz web intuitiva, resguardando la agilidad y delegando el código puramente al desarrollo del software.

## What Changes

*   **Comando de Ejecución Local**: Incorporación del comando `npm run cms` en `package.json` para arrancar de forma paralela o independiente la aplicación web local del CMS.
*   **Interfaz de Edición Visual**: Panel de administración local interactivo accesible en el navegador que lee y edita dinámicamente los archivos de datos en `src/content/` (entradas de blog, micro-posts, proyectos de portafolio y diarios).
*   **Actualización del Código en Tiempo Real**: Las modificaciones guardadas en la interfaz del CMS se escribirán de inmediato y directamente en los archivos Markdown físicos del repositorio del blog.
*   **Exclusión del Build Final (Aislado)**: El CMS operará estrictamente como una utilidad de entorno de desarrollo local. Sus dependencias y el código de su aplicación web se omiten de la compilación de producción en el directorio final `dist/`.
*   **Control de Ciclo de Vida**: El servidor del CMS finaliza su ejecución de inmediato al cerrar el proceso de Node en la terminal de comandos.

## Capabilities

### New Capabilities
- `dev-cms`: Aplicación CMS local interactiva que expone una interfaz visual en el navegador para leer, crear y modificar en tiempo real el contenido físico de las colecciones en `src/content/` (blog, posts, projects, journal), exclusivo para el entorno de desarrollo y aislado de la compilación de producción.

### Modified Capabilities
- Ninguna.

## Impact

*   **`package.json`**: Adición del script ejecutable `cms` y de las dependencias ligeras que requiera la aplicación CMS local (por ejemplo, un servidor web Express o una utilidad de edición rápida de archivos Markdown de forma local).
*   **`src/content/`**: Modificación programática en tiempo de ejecución de los archivos `.md` y `.mdx` contenidos en las colecciones del blog.
*   **`astro.config.mjs` / Proceso de Build**: Aseguramiento de que ningún recurso, página o script del CMS se compile o se incluya en el directorio distributivo final `dist/`.
