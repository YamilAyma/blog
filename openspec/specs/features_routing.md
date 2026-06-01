# Especificación Técnica: Features & Routing (Búsqueda, Tags y Funcionalidades Interactivas)

Esta especificación detalla el funcionamiento de los mecanismos de búsqueda interactiva en tiempo de ejecución, el sistema de taxonomía y agrupación por etiquetas (tags), y la lógica detrás del enrutamiento dinámico anidado para el diario de desarrollo (journal) de proyectos.

---

## 1. Búsqueda Interactiva en Tiempo de Ejecución

La búsqueda interactiva y el filtrado por categorías/tags se realizan en el cliente para ofrecer una experiencia fluida e instantánea:

*   **Implementación de React/Svelte**: Componentes cliente dinámicos capturan de forma reactiva la entrada del usuario mediante un campo de búsqueda (`searchQuery`).
*   **Campos de Coincidencia**: El algoritmo de filtrado evalúa en tiempo real los metadatos y campos de texto de las colecciones cargadas:
    *   **Título**: Coincidencias insensibles a mayúsculas y minúsculas.
    *   **Cuerpo / Resumen**: Coincidencias de texto libre dentro de los campos descriptivos o del contenido principal.
    *   **Tags**: Iteración recursiva en los arrays de tags de cada entrada para comprobar si el término buscado está presente en alguna de las etiquetas.

---

## 2. Taxonomía y Agrupación por Tags (`src/pages/tags/`)

El sistema de tags provee una forma no jerárquica de organizar los posts, micro-posts y proyectos:

*   **Páginas Dinámicas (`src/pages/tags/[tag].astro`)**: Astro genera rutas estáticas individuales para cada etiqueta detectada en las colecciones.
*   **Lógica de Agrupación (`getStaticPaths`)**: 
    1.  Se recuperan todas las colecciones relevantes (`blog`, `posts`, `projects`, `journal`).
    2.  Se extraen todos los tags de forma aplanada (`flatMap`).
    3.  Se eliminan duplicados y se normalizan las cadenas (ej: convertir a minúsculas y quitar espacios en blanco) para crear una lista de tags únicos.
    4.  Para cada tag, se genera una ruta física (`/tags/[tag]/`) e internamente se filtran todas las entradas que posean dicho tag en sus metadatos de frontmatter.

---

## 3. Ruteo Dinámico del Diario de Proyectos (`/proyectos/[project]/diario/[...slug]`)

La bitácora de desarrollo (diario) se conecta intrínsecamente con los proyectos del portafolio mediante un ruteador dinámico avanzado alojado en `src/pages/proyectos/[project]/diario/[...slug].astro`.

### 3.1. Lógica de Generación de Rutas (`getStaticPaths`)
Astro pre-calcula los pares de parámetros necesarios (`project` y `slug`) en tiempo de compilación analizando las relaciones entre colecciones:
1.  Se obtienen todas las entradas de la colección `journal` mediante `getCollection("journal")`.
2.  Para cada entrada (`entry`), se evalúa el campo referencial `project` (slug vinculante del proyecto al que pertenece el diario).
3.  Se sanitizan y limpian las extensiones físicas de archivos (`.md`/`.mdx`) de los slugs.
4.  Se calcula el `entrySlug` relativo de forma que si el nombre del archivo contiene el prefijo del proyecto (ej: `mi-proyecto/dia-1.md`), se extrae solo el slug del diario correspondiente (`dia-1`).
5.  Se genera el retorno de parámetros para cada combinación estructurada de proyecto y diario:
    ```typescript
    return {
        params: { 
            project: projectSlug,
            slug: entrySlug 
        },
        props: { entry },
    };
    ```

### 3.2. Vinculación y Renderizado MDX Híbrido
*   **Renderizado de Contenido**: Se utiliza la función nativa `render(entry)` de Astro 5, que proporciona el componente procesado `<Content />` y los encabezados (`headings`).
*   **Inyección de Breadcrumbs (Migas de Pan)**: El ruteador carga la colección completa de proyectos con `getCollection("projects")` y busca aquel cuyo identificador coincida con el parámetro `project`. Esto permite inyectar migas de pan interactivas de forma dinámica:
    `Portafolio -> [Nombre del Proyecto] -> Bitácora -> [Título del Diario]`.
*   **Componentes Especiales MDX**: Se inyecta un diccionario de componentes globales de React/Astro en el flujo de renderizado de Markdown, enriqueciendo el texto sin necesidad de importaciones locales:
    *   `<TLDR />`: Resumen ejecutivo destacado en cabeceras de diarios.
    *   `<FAQs />` y `<FAQItem />`: Estructura interactiva de acordeón de Preguntas Frecuentes.
    *   `<Quote />` (y sus alias semánticos `<Cita />` y `<Opinion />`): Citas enriquecidas y formateadas en la UI.
    *   `<img />` (mapeado al componente `<MDXImage />`): Carga y optimización dinámica de imágenes dentro de la narrativa Markdown.
    *   `<References />`: Sección de pie de página para atribuir enlaces y bibliografías utilizadas.
