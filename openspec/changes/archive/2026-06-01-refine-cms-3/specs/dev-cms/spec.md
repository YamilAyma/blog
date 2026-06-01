## ADDED Requirements

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
