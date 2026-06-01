## Context

El blog almacena sus contenidos en colecciones de Astro (`src/content/`) como archivos físicos Markdown y MDX. Para ofrecer una experiencia interactiva sin añadir servicios en la nube ni bases de datos complejas, el CMS de desarrollo operará como una utilidad local desacoplada. Este sistema levantará una aplicación web que expondrá una interfaz web para interactuar directamente con la carpeta de contenidos del proyecto en el sistema de archivos del desarrollador en tiempo de ejecución local, mapeando un panel CRUD de alta fidelidad.

## Goals / Non-Goals

**Goals:**
*   Proveer un comando único `npm run cms` para ejecutar e interactuar visualmente con el blog en desarrollo.
*   Lograr la persistencia automática de las ediciones escribiendo directamente en la carpeta `src/content/` en tiempo real.
*   Mantener el CMS totalmente aislado de la compilación de producción de Astro para no generar sobrepeso en el bundle ni requerir configuraciones complejas de SSR.
*   Proveer formularios interactivos y autogenerados basados en los tipos de datos (Zod) de las colecciones.
*   Diseñar una interfaz altamente interactiva y modular basada en **Radix UI** primitives y **Tailwind CSS**.
*   Lograr la mimetización visual del CMS heredando dinámicamente las variables de color CSS de los temas activos del blog.

**Non-Goals:**
*   Implementar autenticación web, base de datos externa (como PostgreSQL) o roles de usuario avanzados. El CMS asume confianza plena dado que corre únicamente en la máquina local del desarrollador.
*   Desplegar el CMS a internet o compilarlo en la carpeta productiva `dist/`.

## Decisions

### 1. Arquitectura Desacoplada: Servidor REST Local (Node/Express) en `scripts/cms/`
Para implementar la funcionalidad sin interferir con la compilación estática (SSG) de Astro, se creará un servidor Node.js independiente localizado en la carpeta `scripts/cms/`.
*   **Razón**: Colocar el código y las vistas del CMS en un servidor Express o Node ligero en la carpeta de scripts evita que el compilador de Astro intente procesar o compilar las páginas del CMS durante el `npm run build`. Esto garantiza que la compilación de producción en `dist/` se mantenga limpia e inalterada, aislando al 100% el alcance de desarrollo.
*   **Alternativas consideradas**: Crear una integración de Astro o ruta dinámica en `src/pages/admin/` que use SSR. Se descartó porque complicaría la configuración del despliegue estático a GitHub Pages (el cual requiere obligatoriamente una compilación puramente estática SSG sin backend SSR activo).

### 2. Edición e Integridad del Frontmatter (YAML) mediante Librería Dedicada
Para leer y escribir las cabeceras de metadatos de los archivos Markdown sin corromper el formato, se utilizará la biblioteca `yaml` o `js-yaml` en el servidor Node.js.
*   **Razón**: Los archivos MDX/MD del blog utilizan esquemas estrictos de Zod. Manipular las cadenas de frontmatter con expresiones regulares manuales es propenso a errores de tabulación o sintaxis. Una librería dedicada garantiza la serialización correcta del YAML y resguarda la integridad de las colecciones de Astro.

### 3. Frontend Integrado con Radix UI Primitives y Tailwind CSS
La interfaz de usuario del CMS se construirá con componentes modulares basados en **Radix UI** primitives (como dialogs, tabs, dropdowns y tooltips) y estilizados con **Tailwind CSS**.
*   **Razón**: Radix UI proporciona componentes desestilizados y accesibles que simplifican el desarrollo de interfaces web complejas de administración (popovers, diálogos, etc.), permitiéndonos enfocar los estilos puramente en los tokens estéticos del proyecto.

### 4. Mimetización Estética Dinámica basada en Variables CSS
La interfaz web del CMS heredará y aplicará de forma directa las variables personalizadas `:root` del blog (`--color-background`, `--color-primary`, `--color-accent`, etc.).
*   **Razón**: Al cargar el script central de temas de la base de código (`src/utils/theme.ts`), la interfaz de usuario del CMS se pintará y adaptará automáticamente al tema seleccionado en el blog (`soft`, `tech`, `dark`), manteniendo una consistencia estética unificada sin necesidad de duplicar el motor de diseño.

### 5. Estructura de Panel CRUD Completo de Archivos Físicos
El flujo de visualización y edición en la UI del CMS se mapea en una distribución de dos secciones principales:
*   **Barra Lateral de Navegación (Sidebar)**:
    *   **Entries**: Filtros de acceso directo para las colecciones nucleares (`Blogs`, `Projects`, `Posts`).
    *   **Images**: Gestión de recursos visuales locales (`Stickers`, `Thumbnails`).
    *   **System**: Accesos a configuraciones de desarrollo y salida (`Settings`, `Logout`).
*   **Lienzo de Edición (Canvas Central)**:
    Organizado en tarjetas interactivas modulares que agrupan los metadatos específicos:
    *   *General Info*: Campos de texto plano (Título, Descripción, Periodo, Orden).
    *   *Project Media*: Módulo uploader de portada física e inputs URL, más carrusel dinámico de galería con reordenamiento interactivo.
    *   *Tags & Classification*: Chips y tags interactivos con botón de borrado rápido (`x`), e inputs de lista para añadir características (`Add Feature`).
    *   *Technologies*: Listado de insignias dinámicas que previsualizan los badges de `shields.io` con edición en caliente del color y logos.
    *   *External Links & Video*: Inputs para URLs externas (GitHub, Demo en Vercel) y el identificador de video de YouTube.
    *   *Markdown Editor*: Editor interactivo con barra de herramientas de formato (`B`, `I`, `H1`, listas, enlaces, imágenes) y vista previa de texto renderizado en tiempo real.

## Risks / Trade-offs

*   **[Riesgo: Conflicto de Puertos en Desarrollo]**
    *   *Mitigación*: El servidor del CMS local se configurará de manera predeterminada en un puerto alternativo no utilizado (ej: `http://localhost:3000` o `http://localhost:43210`) diferente al puerto por defecto que utiliza Astro (`4321`), evitando colisiones de red al ejecutar ambos servicios en paralelo.
*   **[Riesgo: Sobrescritura de Cambios No Guardados]**
    *   *Mitigación*: El CMS leerá del sistema de archivos en cada carga del recurso para asegurar que el desarrollador edite siempre la versión más reciente del código, y emitirá notificaciones de guardado exitoso en la UI al persistir los cambios.
