## Context

El blog actual almacena sus contenidos en colecciones de Astro (`src/content/`) como archivos físicos Markdown y MDX. Para ofrecer una experiencia interactiva sin añadir servicios en la nube ni bases de datos complejas, el CMS de desarrollo operará como una utilidad local desacoplada. Este sistema levantará una aplicación web que expondrá una interfaz web para interactuar directamente con la carpeta de contenidos del proyecto en el sistema de archivos del desarrollador en tiempo de ejecución local.

## Goals / Non-Goals

**Goals:**
*   Proveer un comando único `npm run cms` para ejecutar e interactuar visualmente con el blog en desarrollo.
*   Lograr la persistencia automática de las ediciones escribiendo directamente en la carpeta `src/content/` en tiempo real.
*   Mantener el CMS totalmente aislado de la compilación de producción de Astro para no generar sobrepeso en el bundle ni requerir configuraciones complejas de SSR.
*   Proveer formularios interactivos y autogenerados basados en los tipos de datos (Zod) de las colecciones.

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

## Risks / Trade-offs

*   **[Riesgo: Conflicto de Puertos en Desarrollo]**
    *   *Mitigación*: El servidor del CMS local se configurará de manera predeterminada en un puerto alternativo no utilizado (ej: `http://localhost:3000` o `http://localhost:43210`) diferente al puerto por defecto que utiliza Astro (`4321`), evitando colisiones de red al ejecutar ambos servicios en paralelo.
*   **[Riesgo: Sobrescritura de Cambios No Guardados]**
    *   *Mitigación*: El CMS leerá del sistema de archivos en cada carga del recurso para asegurar que el desarrollador edite siempre la versión más reciente del código, y emitirá notificaciones de guardado exitoso en la UI al persistir los cambios.
