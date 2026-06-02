## Why

Tras completar la base funcional del CMS de desarrollo (`dev-cms`), se requiere una primera iteración de mejoras para robustecer la usabilidad y la calidad del software. Esta iteración solucionará problemas de persistencia en el formato YAML del frontmatter de Astro (evitando roturas en textos multilínea y tags), optimizará el espacio en pantalla eliminando la vista previa redundante del editor Markdown, y proveerá una mejor experiencia de exploración con un árbol de carpetas interactivo, atajos de teclado del editor, carga multimodal de imágenes, internacionalización y una modularización completa de la base de código.

## What Changes

*   **Atajos de Teclado**: Soporte para atajos de teclado estándar en el editor Markdown: Ctrl+Z para deshacer y Ctrl+Y para rehacer.
*   **Renombrado Visual**: Modificación del encabezado visual principal de la marca en el Sidebar de "Yamil Ayma" a "Mi Blog".
*   **Editor Markdown Enriquecido**: Remoción del componente redundante de vista previa HTML (Preview) dentro del propio editor Markdown del CMS.
*   **Diseño Totalmente Responsive**: Adaptación completa de las columnas del CMS (Sidebar y Canvas) para garantizar una usabilidad táctil y móvil perfecta.
*   **Explorador de Contenidos en Árbol (Folder-based)**: Reemplazo del listado plano de entradas por un árbol de archivos visual e interactivo que respeta y expone la jerarquía real de subcarpetas del sistema de forma desplegable y recursiva, incluyendo el conteo total consolidado de archivos.
*   **Identidad Visual del CMS**: Empleo del archivo `/favicon.svg` nativo del blog como el icono del CMS en la pestaña del navegador.
*   **Tratamiento Estricto de Descripciones**: Formateo del campo `description` en el frontmatter para que se grabe obligatoriamente en una sola línea y envuelto en comillas dobles (`"description"`), evitando roturas en el compilador de Astro.
*   **Carga Multimodal de Imágenes**: Tres opciones interactivas para gestionar imágenes en el frontmatter:
    1.  Introducción directa del string de la URL.
    2.  Selector y cargador de archivos locales del PC con definición del destino físico del recurso mediante un modal de diálogo.
    3.  Carga y enlace directo vía URL externa absoluta.
*   **Internacionalización (i18n)**: Soporte multilingüe en la UI del CMS para alternar de forma interactiva entre los idiomas Inglés y Español.
*   **Modularización del Software (React + Vite o Estructura Modular)**: Reestructuración y desacoplamiento del archivo gigante de frontend `index.html` en componentes React reutilizables e independientes o transición a una librería/herramienta intermedia para asegurar la calidad de software y facilitar el mantenimiento.
*   **CRUD Específico de Blog**: Mapeo estricto del campo `layout` y de portadas (mostrando el campo vacío si el archivo Markdown no lo tenía pre-declarado) y guardado de tags y textos como strings envueltos.
*   **CRUD Específico de Proyectos**: Grabado estricto del campo `tags` como un array de strings YAML en formato clásico (`tags: ["ia", "docs"]`) y soporte para listas dinámicas complejas en el campo `imagenes`.

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `dev-cms`: Refinamiento y robustecimiento integral del CMS local de desarrollo para dar soporte adaptativo a todas las colecciones, gestionar carga local de imágenes, internacionalización, vista jerárquica de árbol y garantizar la integridad estricta del formateador de metadatos YAML.

## Impact

*   **`scripts/cms/` (Servidor y Frontend)**: Refactorización estructural completa y modularización en componentes aislados de React.
*   **`package.json`**: Adición de dependencias ligeras que puedan requerirse para la modularización o la gestión de imágenes locales en caliente.
*   **`src/content/`**: Escribir de forma rigurosa y estricta el YAML del frontmatter utilizando strings envueltos en comillas dobles y tags formateados como arrays clásicos de strings.
