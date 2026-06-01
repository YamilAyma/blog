# Especificación Técnica: Client Utilities & Interactive Scripts (Scripts de Cliente y Utilidades)

Esta especificación técnica define el funcionamiento detallado de las utilidades JavaScript/TypeScript del lado del cliente y los servicios dinámicos de consulta y procesamiento de contenidos.

---

## 1. Motor Dinámico y Persistencia de Temas (`src/utils/theme.ts`)

El blog implementa un sistema dinámico para alternar temas visuales y fondos personalizados en el cliente, persistiendo la selección del usuario y escuchando cambios del sistema operativo.

### 1.1. Almacenamiento y Llaves de Persistencia
Se hace uso del objeto global `localStorage` en el navegador con dos claves específicas:
*   **`blog-theme-preference` (`THEME_KEY`)**: Almacena el modo seleccionado por el usuario. Opciones: `'auto'`, `'light'`, o `'dark'` (por defecto `'light'`).
*   **`blog-bg-enabled` (`BACKGROUND_KEY`)**: Booleano almacenado en formato cadena (`'true'` o `'false'`) que determina si el patrón de fondo personalizado del tema está activado.

### 1.2. Algoritmo de Aplicación de Estilos (`applyTheme`)
Cuando la página se carga o cambia una preferencia, la función ejecuta la siguiente lógica secuencial:
1.  **Detección de Oscuridad**:
    *   Si la preferencia del usuario es `'dark'`, o si está configurada en `'auto'` y el sistema operativo prefiere tema oscuro (`window.matchMedia('(prefers-color-scheme: dark)').matches`), se fuerza el tema `'dark'` y se agrega la clase `.dark` a `document.documentElement`.
2.  **Resolución de Tema Claro**:
    *   Si se prefiere tema claro, se remueve la clase `.dark` del elemento raíz.
    *   Se lee el atributo de datos de categoría del elemento `body` (`document.body.dataset.category`).
    *   Si existe y posee un tema claro asignado en el mapeo de categorías (`CATEGORY_THEMES`), se carga dicho tema. De lo contrario, se aplica el tema por defecto (`soft`).
3.  **Inyección de Variables CSS de Fondo**:
    *   Si el fondo personalizado está habilitado y el tema actual posee una configuración `background`, se inyectan las propiedades CSS correspondientes (`--site-background-image`, `--site-background-repeat`, `--site-background-size`, `--site-background-position`) y se añade la clase `.bg-image` al documento raíz.
    *   Si no está habilitado, se remueve la clase `.bg-image` y se restablece el fondo a planos por defecto.
4.  **Inyección General de Variables de Tema**:
    *   Se inyectan de forma dinámica en la raíz (`:root`) los tokens de color del tema (`--color-primary`, `--color-background`, `--color-text`, `--color-accent`, `--color-border`), tipografías (`--font-heading`, `--font-body`), interfaz de usuario (`--ui-site-title`, `--ui-nav-link`) y las variables de Markdown para textos (`--md-h1`, `--md-a`, `--md-code`, etc.).

### 1.3. Escuchas de Eventos Reactivos
Para asegurar cambios en caliente, el script registra escuchadores para:
*   Cambios en la preferencia de color del sistema operativo.
*   El evento personalizado `'theme-change'` (disparado al modificar la preferencia manual).
*   El evento personalizado `'background-change'` (disparado al alternar el fondo).

---

## 2. Copiado Interactivo de Código al Portapapeles (`src/utils/copyCode.ts`)

Para mejorar la usabilidad técnica, el script inyecta componentes de copia interactivos sobre todos los bloques de código renderizados a partir del Markdown de las publicaciones.

### 2.1. Inyección Dinámica del DOM (`initCopyButtons`)
1.  Busca todos los bloques pre de código dentro de contenedores de prosa (`.prose pre`).
2.  Evita la duplicación verificando si el elemento ya cuenta con un envoltorio.
3.  Crea e inserta un contenedor envolvente (`div` con la clase `.code-block-wrapper`) antes del bloque `pre`, moviendo el bloque al interior del wrapper.
4.  Crea un elemento `button` con la clase `.code-copy-btn`, añadiendo atributos de accesibilidad (`aria-label="Copiar código"`).

### 2.2. Evento del Portapapeles e Interacción
*   **Acción de Copiado**: Al hacer clic, el botón extrae el texto del elemento `code` interno (o el texto del `pre` en su defecto) y realiza la escritura asíncrona mediante `navigator.clipboard.writeText(text)`.
*   **Transiciones de Estado Visual**:
    *   **Éxito**: El texto del botón cambia a `'¡Copiado!'` y añade la clase estática `.copied`. Tras 2 segundos (`setTimeout`), se restablece al estado inicial.
    *   **Fallo**: Captura el error en la consola y cambia de estado temporalmente a `'Error'`.

### 2.3. Ciclo de Vida de Astro
Para garantizar que los botones se inyecten tras navegaciones parciales, el script se suscribe a dos eventos del navegador:
*   `DOMContentLoaded`: Carga clásica del documento HTML.
*   `astro:page-load`: Evento nativo de Astro disparado después de que una nueva página se carga cuando se utilizan transiciones de vista dinámicas (`View Transitions`).

---

## 3. Utilidades y Servicios de Datos de Contenido (`src/utils/`)

El procesamiento, ordenamiento y formato de los datos expone las siguientes funciones analíticas:

### 3.1. Consulta y Ordenamiento de Entradas (`collections.ts`)
La función `getSortedEntries` implementa un algoritmo de filtrado robusto y descarga concurrente:
1.  **Carga Paralela**: Utiliza `Promise.all` para ejecutar de manera concurrente las llamadas a `getCollection` para las colecciones solicitadas.
2.  **Filtrado por Publicación**: Excluye entradas donde `entry.data.published === false` (modo borrador).
3.  **Filtrado de Fechas Futuras**: Compara la fecha de la entrada con la fecha y hora actual del sistema (`new Date()`). Si la fecha de la publicación es posterior, es excluida automáticamente para evitar publicaciones prematuras accidentales.
4.  **Ordenamiento Cronológico**: Ordena las entradas resultantes de forma descendente (los más recientes primero).
5.  **Paginación**: Soporta un argumento opcional `limit` para realizar recortes en el número de elementos.

### 3.2. Taxonomía Global Aplanada (`collections.ts`)
La función `getAllUniqueTags` recopila y ordena todas las etiquetas disponibles:
*   Recupera de manera consolidada todas las entradas de `blog`, `projects`, `posts` y `journal`.
*   Aplanea los tags utilizando `flatMap()`.
*   Filtra duplicados envolviendo el resultado en un constructor `Set` y lo convierte a un array para devolverlo ordenado alfabéticamente mediante `.sort()`.

### 3.3. Análisis de Tiempos de Lectura (`content.ts`)
La función `calculateReadingTime` estima los minutos de lectura asumiendo una velocidad estándar:
*   Limpia espacios en blanco y divide el texto mediante expresiones regulares de espaciado (`/\s+/`) para contar palabras.
*   Calcula el tiempo estimando una velocidad constante de **200 palabras por minuto**.
*   Aplica `Math.ceil()` para asegurar que se devuelva un número entero superior (mínimo 1 minuto).

### 3.4. Motor de Resolución de URLs Dinámicas (`content.ts`)
La función `getEntryUrl` centraliza la resolución de enlaces para cualquier entrada de colección de Astro, devolviendo la URL absoluta adecuada:
*   **Colección `posts`**: Devuelve `/posts/[slug]`.
*   **Colección `projects`**: Devuelve `/proyectos/[slug]`.
*   **Colección `blog`**: Devuelve `/blog/[slug]`.
*   **Colección `journal`**: Lógica de resolución anidada:
    1.  Recupera el campo `project` del frontmatter y limpia extensiones `.md`/`.mdx` para obtener el slug del proyecto vinculante.
    2.  Establece la base de URL en `/proyectos/[projectSlug]/diario/`.
    3.  Limpia las carpetas redundantes del ID físico del diario (si el ID físico ya contiene la subcarpeta del proyecto) para evitar duplicación del slug en la URL final.
    4.  Retorna `/proyectos/[projectSlug]/diario/[relativeSlug]`.
