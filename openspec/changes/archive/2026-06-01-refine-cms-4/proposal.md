## Why

Esta iteración (Iteración 4) busca enriquecer significativamente la experiencia del redactor dentro del editor Markdown del CMS local de desarrollo. 

La falta de visibilidad y documentación sobre qué componentes MDX/Astro personalizados están permitidos en el blog, y la imposibilidad de previsualizar el renderizado final del contenido de forma interactiva en tiempo real antes de compilar en producción, representan barreras de usabilidad. Esta iteración resuelve de forma integral estas necesidades centralizando el flujo en el editor del CMS.

## What Changes

*   **Menú de Componentes Personalizados (Custom Components)**: Inserción de una opción en la barra de herramientas del editor Markdown con un dropdown que lista los componentes MDX/Astro permitidos, cada uno acompañado por un icono personalizado y nombre del componente. Al hacer clic, se inserta el bloque de código del componente en la posición actual del cursor.
*   **Interfaz JSON de Documentación de Componentes**: Creación de un registro JSON estructurado en el CMS que sirve como especificación y documentación viva de cada componente (descripción, propiedades aceptadas y ejemplo de uso).
*   **Modal de Ayuda y Documentación**: Integración de un botón interactivo con el icono de interrogación `?` junto al dropdown de componentes que abre un modal con la explicación detallada y ejemplos prácticos del componente seleccionado.
*   **Vista Previa en Tiempo Real Sincronizada (Live Preview)**:
    *   **Panel Dividido (Split Pane)**: Diseño de una vista en dos columnas (Editor / Vista Previa) sincronizada al vuelo.
    *   **Renderizado Local Reactivo**: Un parser ligero en el cliente que interpreta la estructura Markdown/MDX y simula visualmente la estética de los componentes personalizados.
    *   **Iframe Astro HMR en Caliente**: Pestaña alternativa que carga en un `<iframe>` la página real del blog servida por el dev server de Astro (`http://localhost:4321/[colección]/[slug]`). Se recarga al guardar cambios.
    *   **Control del Estado Físico**: Si el archivo es nuevo o no se ha guardado físicamente en disco aún, las opciones de previsualización real se deshabilitan, mostrando un tooltip al pasar el ratón (hover) que indica que el desarrollador debe guardar el archivo para inicializar el recurso.

## Capabilities

### New Capabilities
<!-- Ninguna nueva capacidad de producción, todo local de desarrollo -->

### Modified Capabilities
- `dev-cms`: Enriquecer el editor Markdown con inserción de componentes personalizados, base de datos JSON de documentación, ayuda interactiva en modal y vista previa dual sincronizada (cliente en tiempo real e iframe Astro HMR).

## Impact

*   **Backend**: `scripts/cms/server.js` y `content.js` proveerán un nuevo endpoint `GET /api/custom-components` que lee y entrega la lista y documentación JSON de los componentes permitidos.
*   **Frontend**: `scripts/cms/public/index.html` y `MarkdownEditor.js` integrarán el dropdown de componentes, el modal de documentación, el panel de preview dividido (split-pane) reactivo y el soporte de iframe Astro dev sincronizado con control de existencia de archivo.
