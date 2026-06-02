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

### Requirement: Personalización de Nombre de Imagen con Validación de Duplicados
El sistema SHALL permitir al usuario especificar un nombre de archivo personalizado al subir imágenes locales desde su PC. Asimismo, el sistema SHALL realizar una validación en caliente para verificar si una imagen con el mismo nombre ya existe en el directorio de assets destino seleccionado y bloqueará la subida sugiriendo cambiar el nombre si hay colisión.

#### Scenario: Carga exitosa con nombre personalizado único
- **WHEN** el usuario arrastra o selecciona una imagen local en el modal de subida de imágenes del CMS, ingresa el nombre personalizado `mi-nueva-imagen` y el archivo no existe en el subdirectorio de assets destino seleccionado.
- **THEN** el sistema valida con éxito la disponibilidad del nombre, permite presionar "Subir Imagen" e inserta la ruta final de la imagen en el campo correspondiente del frontmatter.

#### Scenario: Carga bloqueada por nombre de archivo duplicado
- **WHEN** el usuario ingresa el nombre personalizado `mi-nueva-imagen` y ya existe un archivo con ese mismo nombre en la carpeta física de assets seleccionada.
- **THEN** el sistema muestra un mensaje de error destacando que el nombre de archivo ya existe en esa ubicación y mantiene deshabilitado el botón para confirmar la subida.

---

### Requirement: Botón Finalizar Redacción con Git Squash y Push
El sistema SHALL proveer una acción rápida y un botón en la barra flotante de herramientas del CMS llamado **"Finalizar Redacción"** (icono de compresión `🗜️` o check) que despliegue un modal interactivo con la imagen `public/success_session.png` y un mensaje estructurado en lista que informe al usuario que se procederá a consolidar (squash) los cambios de la sesión local y subirlos (push) a GitHub, recordando que el CMS no se cerrará y se puede continuar redactando. Asimismo, el commit consolidado SHALL incluir en su descripción una lista con los nombres de todos los commits individuales realizados durante la sesión.

#### Scenario: Flujo exitoso de Finalización de Redacción
- **WHEN** el usuario hace click en el botón flotante "Finalizar Redacción" en el menú, visualiza el modal informativo con la ilustración `success_session.png` y pulsa "Confirmar y Subir".
- **THEN** el backend del CMS lee los mensajes de los commits locales pendientes (`git log origin/main..HEAD --format=%s`), ejecuta un soft reset (`git reset --soft origin/main`), crea un commit consolidado que detalla en su cuerpo la lista de todos los commits de la sesión, inicia el push asíncrono a GitHub y muestra un Toast con el resultado de éxito sin interrumpir el CMS.

---

### Requirement: Extensión MDX por Defecto con Indicador de Ayuda
El sistema SHALL inicializar todos los nuevos archivos de contenido creados en cualquiera de las colecciones del CMS con la extensión `.mdx` por defecto (a menos que el usuario especifique explícitamente una extensión como `.md` en el nombre). Además, la interfaz de usuario en el modal de creación SHALL incluir una nota aclaratoria inferior debajo del campo de nombre que describa este comportamiento.

#### Scenario: Creación de archivo nuevo con extensión MDX por defecto y nota aclaratoria
- **WHEN** el usuario abre el modal de "Nueva Entrada".
- **THEN** visualiza un mensaje aclaratorio en la parte inferior del campo de nombre: "Nota: Si no especificas extensión, se creará como .mdx por defecto. Si escribes .md u otra, se respetará la selección". Al escribir un nombre sin extensión, se le asigna `.mdx` por defecto.

---

### Requirement: Plantilla Enriquecida para Colección posts
El sistema SHALL auto-poblar los nuevos archivos de la colección `posts` usando una plantilla de metadatos frontmatter enriquecida que contenga todos los atributos requeridos por la vista visual de la galería del blog.

#### Scenario: Inyección de frontmatter extendido para posts visuales
- **WHEN** el usuario crea una nueva entrada para la colección de `posts`.
- **THEN** el sistema inyecta una plantilla que contiene obligatoriamente: `image`, `imageAlt`, `title`, `copy`, `date`, `published`, `category`, `tags` y el bloque `socials` con la cuenta de `linkedin` pre-poblada.

