# Especificación Técnica: System Overview (Arquitectura, Rutas y SEO)

Esta especificación técnica detalla la infraestructura general del blog, el mapeo de enrutamiento del sitio y la arquitectura de optimización SEO y gestión de activos visuales.

---

## 1. Pila Tecnológica Central

El blog se construye como un sitio estático moderno con alto rendimiento y una estética retro-tierna, utilizando las siguientes tecnologías clave:

*   **Astro v5**: Framework principal enfocado en el rendimiento y la generación estática (SSG). Utiliza arquitectura de islas para cargar JavaScript únicamente donde es estrictamente necesario.
*   **React v19**: Empleado para componentes interactivos dinámicos en la UI (islas de Astro) que requieren gestión de estado compleja en el cliente.
*   **Tailwind CSS v4**: Motor CSS que se integra mediante el plugin nativo de Vite (`@tailwindcss/vite`) para un renderizado y pre-procesado de estilos ultra veloz.
*   **GSAP (GreenSock Animation Platform)**: Utilizado para orquestar animaciones fluidas y micro-interacciones interactivas de alta fidelidad en la interfaz.
*   **Astro MDX Integration**: Soporte nativo para mezclar Markdown interactivo con componentes en las colecciones de contenido.

---

## 2. Mapa Completo de Enrutamiento (`src/pages/`)

Astro utiliza un sistema de ruteo basado en archivos en el directorio `src/pages/`. La estructura actual del enrutamiento es la siguiente:

| Ruta del Sitio | Archivo en la Base de Código | Tipo de Contenido / Propósito |
| :--- | :--- | :--- |
| `/` | `src/pages/index.astro` | Página de inicio. Landing page de presentación con listado de últimas novedades, animaciones y accesos principales. |
| `/portafolio` | `src/pages/portafolio.astro` | Portafolio completo interactivo de proyectos de Yamil Ayma. |
| `/404` | `src/pages/404.astro` | Página personalizada para el manejo de enlaces rotos o recursos no encontrados. |
| `/[...slug]` | `src/pages/[...slug].astro` | Ruteador dinámico general para páginas institucionales estáticas generadas a partir de la colección `pages` (ej: Sobre Mí, Contacto). |
| `/blog` | `src/pages/blog/` | Índice y paginación de artículos tradicionales de formato largo. |
| `/posts` | `src/pages/posts/` | Micro-blogging. Bitácora rápida con mensajes cortos e imágenes interactivas. |
| `/proyectos` | `src/pages/proyectos/index.astro` | Índice del portafolio estructurado de proyectos. |
| `/proyectos/[...slug]` | `src/pages/proyectos/[...slug].astro` | Ficha técnica y visualización interactiva detallada de un proyecto individual del portafolio. |
| `/proyectos/[project]/diario/[...slug]` | `src/pages/proyectos/[project]/diario/[...slug].astro` | Entrada individual de la bitácora de desarrollo (diario) asociada directamente a un proyecto específico. |
| `/tags` | `src/pages/tags/` | Índice de etiquetas generales y ruteadores dinámicos que agrupan contenidos por tópicos específicos. |

---

## 3. Estrategias de SEO y Sitemaps

La visibilidad en motores de búsqueda es un requisito principal. Se implementa un ecosistema SEO optimizado con las siguientes características:

### 3.1. Aplanamiento de Sitemaps (`flat-sitemap.js`)
Por defecto, la integración `@astrojs/sitemap` de Astro genera un índice de sitemaps (`sitemap-index.xml`) y sitemaps parciales (`sitemap-0.xml`). Esto genera problemas de procesamiento en Google Search Console. 

Para resolverlo, se ha implementado un script de post-compilación (`scripts/flat-sitemap.js`) ejecutado automáticamente tras `npm run build`:
1.  Verifica la existencia de `sitemap-0.xml`.
2.  Renombra `sitemap-0.xml` a `sitemap.xml` para tener el nombre tradicional que consumen los indexadores.
3.  Elimina de forma segura el archivo redundante `sitemap-index.xml` para evitar conflictos en Search Console.

### 3.2. Generación de Feeds RSS
Se incluye la integración `@astrojs/rss` para compilar un canal de suscripción RSS que expone dinámicamente las últimas entradas del blog bajo la ruta accesible `/rss.xml`.

---

## 4. Gestión de Imágenes y Assets

El sistema de assets visuales está diseñado para optimizar el rendimiento de red y estructurar la identidad del blog:

*   **Optimización Automática**: Las imágenes locales alojadas en `src/assets/` se procesan mediante el componente nativo de optimización visual de Astro, reduciendo el peso y convirtiendo a formatos eficientes de última generación en el momento del build.
*   **Assets Estáticos de Interfaz**:
    *   **Avatar de Perfil**: Imagen del autor cargada dinámicamente desde el CDN de GitHub (`https://avatars.githubusercontent.com/u/177412646`).
    *   **Stickers de Categorías**: Stickers temáticos correspondientes a cada categoría del blog (IA, Dev, Tutorial, General) localizados en `src/assets/images/stickers/`.
*   **Imágenes Híbridas (Proyectos)**: La colección de proyectos soporta almacenamiento de imágenes locales procesadas por Astro y URLs externas absolutas (CDN) en el mismo array de imágenes mediante validaciones condicionales de tipo unión en Zod.
