## ADDED Requirements

### Requirement: Servidor Local del CMS
El sistema DEBE proveer un script en `package.json` ejecutable mediante `npm run cms` que inicialice de forma local un servidor ligero del CMS únicamente en el entorno de desarrollo local. Este servidor DEBE detenerse inmediatamente al finalizar el proceso en la terminal de comandos.

#### Scenario: Lanzamiento exitoso del CMS
- **WHEN** el desarrollador ejecuta el comando `npm run cms` en la terminal
- **THEN** el sistema inicializa el servidor en un puerto local (ej: `http://localhost:3000` o similar) y abre de manera automática la interfaz web interactiva en el navegador

#### Scenario: Detención del CMS
- **WHEN** el desarrollador cierra el proceso en la terminal utilizando el atajo de teclado Ctrl+C
- **THEN** el servidor web local del CMS se apaga inmediatamente y libera el puerto de red asignado

### Requirement: Edición Visual y Persistencia en Tiempo Real
El sistema DEBE proveer una interfaz web interactiva con formularios estructurados basados en los esquemas de frontmatter (Zod) de cada colección y un editor de texto enriquecido para el cuerpo Markdown. El CMS DEBE leer los archivos físicos en `src/content/` al cargarse y escribir directamente los cambios en los archivos físicos `.md` y `.mdx` del repositorio local en tiempo real sin involucrar bases de datos externas.

#### Scenario: Listado y lectura de contenidos del blog
- **WHEN** el desarrollador accede a la interfaz de administración del CMS
- **THEN** el CMS escanea el directorio `src/content/` y muestra un listado organizado de todas las entradas disponibles pertenecientes a las colecciones `blog`, `pages`, `posts`, `projects` y `journal`

#### Scenario: Guardar cambios de una entrada en tiempo real
- **WHEN** el desarrollador modifica los campos del frontmatter (como título, fecha, tags, o el flag `published`) o el cuerpo Markdown de una entrada del diario (`journal`) en la UI del CMS y hace clic en "Guardar"
- **THEN** el CMS reescribe inmediatamente el archivo físico correspondiente en `src/content/journal/` con el nuevo formato estructurado del frontmatter y Markdown, lo cual es detectado instantáneamente por el motor de recarga rápida (HMR) de Astro

#### Scenario: Creación de un nuevo recurso de contenido
- **WHEN** el desarrollador selecciona "Crear Nuevo", completa los campos de frontmatter y contenido, y hace clic en "Crear"
- **THEN** el CMS genera y escribe de inmediato un archivo físico Markdown nuevo bajo el directorio correspondiente en `src/content/` con el slug sanitizado en kebab-case como nombre de archivo

### Requirement: Interfaz Modular y Consistencia Estética
La interfaz del CMS DEBE ser modular y construirse utilizando **Radix UI** primitives para garantizar un comportamiento accesible de los diálogos, modales, menús y popovers. Para asegurar una experiencia visual consistente con la identidad del blog, el CMS DEBE heredar dinámicamente las variables de color CSS globales del tema actualmente activo (`soft`, `tech`, `dark`).

#### Scenario: Adaptación cromática dinámica del CMS al tema activo
- **WHEN** el desarrollador cambia la preferencia de tema en el blog o visualiza un post con categoría dinámica y accede a la interfaz de administración del CMS
- **THEN** el CMS renderiza sus paneles, botones y fondos heredando de forma transparente las variables CSS globales (`--color-background`, `--color-primary`, `--color-accent`, etc.) asociadas al tema activo del blog

### Requirement: Lienzo de Edición CRUD Completo
El CMS DEBE proveer un panel interactivo compuesto por un Sidebar izquierdo para la navegación rápida de colecciones e imágenes, y un Canvas central con tarjetas estructuradas para todos los metadatos y contenido:
*   *General Info*: Título, Descripción, Periodo, Orden.
*   *Project Media*: Módulo file uploader y carrusel de galería de imágenes con borrado rápido.
*   *Tags & Classification*: Tags interactivos con borrado en chip (`x`) y características ordenables (`Add Feature`).
*   *Technologies*: Previsualización dinámica de insignias de `shields.io` con edición de colores y logos.
*   *External Links*: Entradas de texto específicas para enlaces de GitHub, demostraciones web y video de YouTube.
*   *Markdown Editor*: Editor enriquecido con barra de herramientas de formato (Negrita, Itálica, Encabezados, Listas, Enlaces, Imágenes) y previsualización de texto renderizado.

#### Scenario: Formateo y vista previa en el editor Markdown
- **WHEN** el desarrollador escribe en el Markdown Editor del CMS y hace clic en "Preview"
- **THEN** la interfaz renderiza dinámicamente una vista previa HTML estilizada de la publicación respetando las tipografías y el diseño estético general del blog

#### Scenario: Borrado de chips de tags
- **WHEN** el desarrollador hace clic en el botón `x` de un chip de tag en el módulo *Tags & Classification*
- **THEN** el tag se remueve de forma instantánea de la lista visual y se excluye del frontmatter al guardar

### Requirement: Aislamiento del Entorno de Producción
La aplicación web del CMS DEBE ser una herramienta aislada y exclusiva del entorno de desarrollo local. Su código fuente, dependencias exclusivas y vistas NO DEBEN compilarse ni incluirse en el empaquetado del directorio de producción final `dist/` al ejecutar el build.

#### Scenario: Exclusión del CMS en compilación final
- **WHEN** el desarrollador ejecuta el comando de empaquetado `npm run build`
- **THEN** el compilador de Astro construye el blog estático en `/dist` omitiendo en su totalidad cualquier recurso, código de interfaz o script relacionado con la aplicación del CMS
