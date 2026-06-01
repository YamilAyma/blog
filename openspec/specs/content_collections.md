# Especificación Técnica: Content Collections (Significado y Esquemas de Colecciones)

Esta especificación detalla la estructura lógica de los datos y el sistema de modelado de contenidos basado en Astro Content Collections y validación estricta con esquemas Zod.

---

## 1. Significado Conceptual de las Colecciones

El blog gestiona cinco flujos de contenido distintos estructurados bajo `src/content/`:

1.  **`blog` (Artículos de Formato Largo)**: Destinado a publicaciones de carácter técnico, tutoriales y artículos detallados de análisis. Posee soporte completo para taxonomías de categorías y etiquetas.
2.  **`pages` (Páginas Estáticas)**: Módulos de contenido atemporal para la estructura base de la web que no representan publicaciones cronológicas (por ejemplo, "Sobre mí" o "Contacto").
3.  **`posts` (Micro-posts y Bitácoras Rápidas)**: Formato de micro-blogging ágil y dinámico para compartir reflexiones breves, capturas del día a día o actualizaciones de estado rápidas con enlaces a redes sociales integrados.
4.  **`projects` (Portafolio de Software)**: Fichas técnicas sumamente estructuradas que componen el portafolio de proyectos del desarrollador. Expone características clave, tecnologías utilizadas (con sus respectivas URLs de insignias), demos visuales y enlaces a repositorios de código.
5.  **`journal` (Diarios de Desarrollo)**: Registro histórico y diario que actúa como diario de desarrollo de proyectos. Permite documentar el proceso paso a paso de construcción del software y está asociado directamente a su respectivo proyecto mediante una referencia de slug.

---

## 2. Esquemas de Validación y Tipos de Datos (Zod)

Cada colección de contenido se valida estrictamente en tiempo de compilación y desarrollo en el archivo `src/content/config.ts`:

### 2.1. Colección `blog`
*   **Loader**: Carga recursiva de archivos `.md` y `.mdx` localizados en `./src/content/blog`.
*   **Esquema de Validación**:
    ```typescript
    schema: ({ image }) => z.object({
      title: z.string(),                  // Título principal del artículo
      description: z.string(),            // Descripción o extracto SEO
      date: z.coerce.date(),              // Fecha de publicación
      published: z.boolean().default(true),// Control reactivo de visibilidad
      category: z.string().default('General'), // Categoría del artículo
      image: image().optional(),          // Imagen de portada local optimizada
      tags: z.array(z.string()).optional(),// Etiquetas asociadas
      layout: z.string().optional(),      // Plantilla de layout alternativa
    })
    ```

### 2.2. Colección `pages`
*   **Loader**: Carga recursiva de archivos `.md` y `.mdx` en `./src/content/pages`.
*   **Esquema de Validación**:
    ```typescript
    schema: z.object({
      title: z.string(),                  // Título de la página
      description: z.string().optional(), // Descripción SEO opcional
    })
    ```

### 2.3. Colección `posts`
*   **Loader**: Carga recursiva de archivos `.md` y `.mdx` en `./src/content/posts`.
*   **Esquema de Validación**:
    ```typescript
    schema: ({ image }) => z.object({
      image: image(),                     // Imagen obligatoria del micro-post
      imageAlt: z.string().optional(),    // Texto descriptivo alternativo
      title: z.string().optional(),       // Título opcional
      copy: z.string().optional(),        // Mensaje corto o descripción
      date: z.coerce.date(),              // Fecha del micro-post
      published: z.boolean().default(true),// Control reactivo de visibilidad
      category: z.string().default('General'), // Categoría interna
      tags: z.array(z.string()).optional(),// Lista de etiquetas
      socials: z.object({                 // Enlaces de redes sociales opcionales
        twitter: z.string().optional(),
        instagram: z.string().optional(),
        linkedin: z.string().optional(),
        facebook: z.string().optional(),
        tiktok: z.string().optional(),
      }).optional(),
    })
    ```

### 2.4. Colección `projects`
*   **Loader**: Carga recursiva de archivos `.md` y `.mdx` en `./src/content/projects`.
*   **Esquema de Validación**:
    ```typescript
    schema: ({ image }) => z.object({
      title: z.string(),                  // Título del proyecto
      description: z.string(),            // Descripción del proyecto
      image: image(),                     // Portada del proyecto (local optimizada)
      imagenes: z.array(z.union([         // Carrusel de imágenes con soporte híbrido
        image(),                          // Portadas locales optimizadas
        z.string().url()                  // URLs absolutas remotas (CDN)
      ])).optional(),
      periodo: z.string(),                // Rango temporal de ejecución (ej. "Mayo 2026")
      tags: z.array(z.string()).optional(),// Tags del proyecto
      features: z.array(z.string()).optional(), // Listado de características clave
      tecnologias: z.array(z.string()).optional(), // Lista de insignias SVG tecnológicas
      videoYoutube: z.string().optional(), // ID de video de YouTube opcional
      links: z.array(z.object({           // Enlaces (GitHub, Demo, Figma, etc.)
        type: z.string(),
        url: z.string(),
      })).optional(),
      order: z.number().default(0),       // Peso de ordenamiento en listados
    })
    ```

### 2.5. Colección `journal`
*   **Loader**: Carga recursiva de archivos `.md` y `.mdx` en `./src/content/journal`.
*   **Esquema de Validación**:
    ```typescript
    schema: ({ image }) => z.object({
      title: z.string(),                  // Título del registro diario
      description: z.string().optional(), // Resumen opcional
      date: z.coerce.date(),              // Fecha del registro
      project: z.string(),                // Slug vinculante al proyecto en projects
      image: image().optional(),          // Captura visual opcional (local optimizada)
      tags: z.array(z.string()).optional(),// Etiquetas
      published: z.boolean().default(true),// Control de publicación
    })
    ```

---

## 3. Mecánica Híbrida de Assets de Imágenes

Para garantizar versatilidad en la presentación de portafolios, la colección `projects` expone un esquema de imágenes híbrido.
*   **Validación Condicional (`z.union`)**: Permite que el array `imagenes` contenga tanto imágenes locales optimizadas mediante la utilidad `image()` de Astro (que las comprime a WebP y ajusta resolución en la compilación física), como direcciones remotas e insignias web tradicionales (`z.string().url()`) procedentes de repositorios externos o CDNs de insignias.

---

## 4. Pipeline de Publicación (Mecanismo de Borradores)

El sistema de compilación incorpora un control reactivo para la ocultación de contenido no finalizado (borradores o borradores de diario) utilizando el campo booleano `published` (cuyo valor por defecto es `true`):

*   **Lógica de Consulta Dinámica**: En los controladores y cargadores de rutas del blog, la recolección de contenido aplica filtros de la siguiente manera:
    ```typescript
    const activeEntries = (await getCollection('blog'))
      .filter(entry => entry.data.published === true);
    ```
*   **Comportamiento por Entornos**:
    *   **Desarrollo (`astro dev`)**: Los scripts pueden configurarse para permitir la visualización de archivos con `published: false` para revisión local.
    *   **Producción (`astro build`)**: Los filtros excluyen estrictamente las colecciones con `published: false` para evitar que enlaces rotos o contenido de prueba lleguen a los indexadores de búsqueda.
