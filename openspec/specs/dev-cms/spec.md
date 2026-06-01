# dev-cms Specification

## Purpose
TBD - created by archiving change refine-cms-3. Update Purpose after archive.
## Requirements
### Requirement: Borrado físico de entradas de contenido
El sistema SHALL permitir la eliminación física y permanente de archivos `.md` o `.mdx` de contenidos del blog a través de la interfaz web, protegida por un modal de confirmación interactivo.

#### Scenario: Borrado exitoso con confirmación
- **WHEN** el usuario hace clic en "Eliminar Recurso" en el CMS, pulsa "Confirmar" en el modal de confirmación animado.
- **THEN** el sistema envía una petición `DELETE` al servidor, este elimina físicamente el archivo local mediante `fs.unlinkSync`, crea un commit automático en Git con el mensaje `docs (Contenido) - Eliminar entrada [slug] en [colección]`, notifica el éxito vía Toast y refresca el listado de contenidos.

---

### Requirement: Selección de directorios y creación de carpetas al crear contenido
El sistema SHALL permitir seleccionar visualmente qué subdirectorio dentro de `src/content/[colección]/` albergará el nuevo archivo creado, y proveerá una sección interactiva para crear subcarpetas físicas en caliente en el propio diálogo.

#### Scenario: Creación de archivo en subcarpeta seleccionada
- **WHEN** el usuario abre el modal de "Crear Nueva Entrada", selecciona una subcarpeta física en el árbol recursivo (o crea una nueva subcarpeta `dev` escribiendo su nombre y pulsando "Crear") y completa el slug.
- **THEN** el sistema escribe físicamente el nuevo archivo en `src/content/[colección]/[subcarpeta]/[slug].md`, crea un commit automático local en Git y refresca la navegación para auto-seleccionar la entrada creada.

---

### Requirement: Plantillas de contenido por defecto (Templates)
El sistema SHALL auto-poblar el cuerpo Markdown de los nuevos archivos creados inyectando plantillas de estructura predeterminada específicas por colección.

#### Scenario: Auto-poblado de estructura inicial
- **WHEN** el usuario crea una nueva entrada para la colección de `blog`.
- **THEN** el sistema inicializa el cuerpo del archivo con una plantilla enriquecida que contiene cabeceras `## Introducción`, `## Desarrollo`, bloques de enlaces y ejemplos MDX en lugar de crear un archivo vacío.

---

### Requirement: Automatización de Git (Auto-Commits locales y Git Push asíncrono)
El sistema SHALL automatizar la creación de commits locales en Git tras cada acción de edición o subida en caliente, y proveer un flujo asíncrono para ejecutar Git Push al repositorio remoto.

#### Scenario: Commit automático al guardar cambios
- **WHEN** el usuario realiza modificaciones en un post y pulsa "Guardar Cambios".
- **THEN** el sistema reescribe el archivo físico y de manera inmediata ejecuta en consola un comando Git local (`git add` y `git commit`) con el formato imperativo `docs (Contenido) - Actualizar entrada [slug] en [colección]`.

#### Scenario: Git Push asíncrono mediante menú flotante
- **WHEN** el usuario hace hover en el botón Hamburger flotante en la esquina inferior izquierda y hace clic en "Ejecutar Git Push".
- **THEN** el sistema inicia un Toast de carga, ejecuta en el backend `git push origin main` asíncronamente y actualiza el Toast a éxito o error detallando la respuesta de la consola de Git.

---

### Requirement: Desacoplamiento modular del backend Express
El backend del CMS local SHALL estar modularizado pragmáticamente separando responsabilidades en submódulos internos ES6 independientes bajo la carpeta `scripts/cms/api/`: `git.js`, `yamlFormatter.js`, `content.js` y `media.js`.

#### Scenario: Enlace modular de rutas en Express
- **WHEN** se arranca el servidor local `npm run cms`.
- **THEN** `server.js` importa asíncronamente los submódulos de la API, monta las rutas Express delegando el procesamiento lógico a cada submódulo especializado, manteniendo el archivo de arranque limpio y legible.

### Requirement: Menú de Componentes Personalizados en Toolbar
El editor Markdown del CMS local SHALL incluir una opción en su barra de herramientas llamada "Custom Components" que despliegue un menú dropdown con el listado de componentes MDX/Astro registrados. Cada ítem del dropdown debe mostrar un icono descriptivo y el nombre del componente.

#### Scenario: Inserción exitosa de componente
- **WHEN** el usuario selecciona un componente del dropdown de "Custom Components".
- **THEN** el sistema inserta el bloque de código de plantilla del componente en la posición exacta del cursor en el editor.

---

### Requirement: Interfaz de Documentación y Modal de Ayuda
El sistema SHALL proveer una especificación en formato JSON que liste y documente cada componente personalizado (nombre, icono, descripción, propiedades y ejemplo de uso). Al lado del dropdown en el toolbar, se SHALL incluir un botón con el icono de interrogación `?` que, al ser presionado, despliegue un modal interactivo con la documentación detallada del componente seleccionado.

#### Scenario: Visualización de ayuda de componente
- **WHEN** el usuario hace clic en el botón `?` de ayuda junto a un componente seleccionado.
- **THEN** el sistema abre un modal animado mostrando la descripción, las propiedades del componente y un ejemplo real de su código MDX de uso.

---

### Requirement: Vista Previa en Tiempo Real Sincronizada (Live Preview)
El CMS SHALL ofrecer un modo de "Vista Previa" mediante un panel dividido (Split Pane) de dos columnas (Editor / Preview) que renderice el contenido del editor en tiempo real. 

#### Scenario: Renderizado reactivo local
- **WHEN** el usuario edita el texto Markdown o introduce un componente en el editor en tiempo real.
- **THEN** el sistema procesa el texto mediante un parser liviano e interactivo en el cliente y renderiza visualmente el resultado de forma instantánea en la columna de la derecha, simulando la apariencia del componente.

---

### Requirement: Iframe Astro Dev HMR Sincronizado
La sección de vista previa SHALL incluir una pestaña alternativa para cargar el iframe real del blog de desarrollo ejecutado por Astro (`http://localhost:4321/[colección]/[slug]`).

#### Scenario: Recarga de iframe Astro al guardar
- **WHEN** el usuario realiza cambios, pulsa "Guardar Cambios" y la pestaña del iframe Astro está activa.
- **THEN** el sistema guarda el archivo en el disco, lo cual activa el HMR de Astro, y recarga de forma transparente el iframe para reflejar el diseño final exacto del blog.

#### Scenario: Archivo no guardado deshabilitado
- **WHEN** el archivo de contenido es nuevo o no se ha persistido en disco y el usuario intenta activar la vista previa real de Astro.
- **THEN** el sistema mantiene deshabilitado el botón de la vista de iframe real, mostrando un tooltip al pasar el ratón que indica: "El contenido no existe aún en disco. Guarda el archivo para poder previsualizarlo".

