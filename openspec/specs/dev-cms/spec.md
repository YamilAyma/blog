# dev-cms Specification

## Purpose
TBD - created by archiving change refine-cms-3. Update Purpose after archive.
## Requirements
### Requirement: Servidor Local del CMS
El sistema DEBE proveer un script en `package.json` ejecutable mediante `npm run cms` que inicialice de forma local un servidor ligero del CMS únicamente en el entorno de desarrollo local. Este servidor DEBE detenerse inmediatamente al finalizar el proceso en la terminal de comandos.

#### Scenario: Lanzamiento exitoso del CMS
- **WHEN** el desarrollador ejecuta el comando `npm run cms` en la terminal
- **THEN** el sistema inicializa el servidor en un puerto local (ej: `http://localhost:3000` o similar) y abre de manera automática la interfaz web interactiva en el navegador

#### Scenario: Detención del CMS
- **WHEN** el desarrollador cierra el proceso en la terminal utilizando el atajo de teclado Ctrl+C
- **THEN** el servidor web local del CMS se apaga inmediatamente y libera el puerto de red asignado

---

### Requirement: Edición Visual y Persistencia en Tiempo Real
El sistema DEBE proveer una interfaz web interactiva con formularios estructurados basados en los esquemas de frontmatter (Zod) de cada colección y un editor de texto enriquecido para el cuerpo Markdown. El CMS DEBE escribir directamente los cambios en los archivos físicos `.md` y `.mdx` en tiempo real sin base de datos.
**Formateo Estricto de YAML**:
1.  El campo `description` DEBE guardarse estrictamente en una sola línea y envuelto en comillas dobles (`"description"`) para evitar roturas de sintaxis multilínea.
2.  Las propiedades de texto general DEBE serializarse como cadenas de comillas dobles (`"texto"`).
3.  El campo `tags` de todas las colecciones DEBE guardarse como un array clásico de strings YAML (`tags: ["ia", "seo"]`), omitiendo el formato de lista con guiones.
4.  El campo `imagenes` de proyectos DEBE guardarse como un array clásico de strings YAML (`imagenes: ["ruta1", "ruta2"]`).

#### Scenario: Guardado estricto de YAML
- **WHEN** el desarrollador edita la descripción o tags de una entrada y hace clic en "Guardar"
- **THEN** el CMS reescribe el archivo físico en `src/content/` formateando la descripción en una sola línea con comillas dobles, los tags como un array de strings en una línea (`tags: ["a", "b"]`) y los textos entre comillas dobles

### Requirement: Interfaz Modular y Consistencia Estética
La interfaz del CMS DEBE ser modular y construirse utilizando **Radix UI** primitives para garantizar un comportamiento accesible de los diálogos, modales, menús y popovers. Para asegurar una experiencia visual consistente con la identidad del blog, el CMS DEBE heredar dinámicamente las variables de color CSS globales del tema actualmente activo (`soft`, `tech`, `dark`).

#### Scenario: Adaptación cromática dinámica del CMS al tema activo
- **WHEN** el desarrollador cambia la preferencia de tema en el blog o visualiza un post con categoría dinámica y accede a la interfaz de administración del CMS
- **THEN** el CMS renderiza sus paneles, botones y fondos heredando de forma transparente las variables CSS globales (`--color-background`, `--color-primary`, `--color-accent`, etc.) asociadas al tema activo del blog

---

### Requirement: Lienzo de Edición CRUD Adaptativo
El CMS DEBE proveer un panel interactivo compuesto por un Sidebar izquierdo y un Canvas central que adapta dinámicamente su formulario de metadatos.
**Campos Faltantes y de Control**:
*   Si una colección no cuenta con un atributo declarado en su frontmatter (como el campo `layout` en blog, o `image` en una entrada), el CMS DEBE de todas formas renderizar el campo de texto vacío en el formulario de la UI listo para rellenarse y ser autoguardado.
*   El logotipo visual principal del Sidebar DEBE renombrarse de "Yamil Ayma" a "Mi Blog".
*   La app del CMS DEBE cargar e integrar el archivo `/favicon.svg` del blog como el icono del CMS.

#### Scenario: Autocompletado de campos omitidos
- **WHEN** el desarrollador abre una entrada del blog que carece del campo `layout` en su frontmatter original
- **THEN** la interfaz del CMS expone de todas formas el input editable correspondiente a `layout` vacío para su inserción

### Requirement: Aislamiento del Entorno de Producción
La aplicación web del CMS DEBE ser una herramienta aislada y exclusiva del entorno de desarrollo local. Su código fuente, dependencias exclusivas y vistas NO DEBEN compilarse ni incluirse en el empaquetado del directorio de producción final `dist/` al ejecutar el build.

#### Scenario: Exclusión del CMS en compilación final
- **WHEN** el desarrollador ejecuta el comando de empaquetado `npm run build`
- **THEN** el compilador de Astro construye el blog estático en `/dist` omitiendo en su totalidad cualquier recurso, código de interfaz o script relacionado con la aplicación del CMS

---

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
- **WHEN** el usuario hace hover en el botón Hamburger flotante en la esquina inferior derecha y hace clic en "Ejecutar Git Push".
- **THEN** el sistema inicia un Toast de carga, ejecuta en el backend `git push origin main` asíncronamente y actualiza el Toast a éxito o error detallando la respuesta de la consola de Git.

---

### Requirement: Desacoplamiento modular del backend Express
El backend del CMS local SHALL estar modularizado pragmáticamente separando responsabilidades en submódulos internos ES6 independientes bajo la carpeta `scripts/cms/api/`: `git.js`, `yamlFormatter.js`, `content.js` y `media.js`. Adicionalmente, el **frontend** del CMS SHALL seguir el mismo principio de modularidad: la SPA React embebida en `index.html` se descompondrá en archivos CSS, componentes `.js` y servicios independientes bajo `scripts/cms/public/`, cargados dinámicamente con el sistema `loadComponent()` existente. El archivo `index.html` se reducirá a un shell mínimo que solo declare CDNs, enlace el CSS externo, y monte el componente raíz `App.js`.

#### Scenario: Enlace modular de rutas en Express
- **WHEN** se arranca el servidor local `npm run cms`.
- **THEN** `server.js` importa asíncronamente los submódulos de la API, monta las rutas Express delegando el procesamiento lógico a cada submódulo especializado, manteniendo el archivo de arranque limpio y legible.

#### Scenario: Frontend modular con carga dinámica
- **WHEN** el navegador carga `index.html` del CMS.
- **THEN** el archivo HTML DEBE contener únicamente CDNs, enlace al CSS externo, el div `#root` y un script de arranque que cargue `App.js`. Todos los componentes, modales y servicios de API se cargan como módulos `.js` independientes mediante `loadComponent()`.

### Requirement: Menú de Componentes Personalizados en Toolbar
El editor Markdown del CMS local SHALL incluir una opción en su barra de herramientas llamada "Custom Components" que despliegue un menú dropdown con el listado de componentes MDX/Astro registrados. Cada ítem del dropdown debe mostrar un icono descriptivo y el nombre del componente.

#### Scenario: Inserción exitosa de componente
- **WHEN** el usuario selecciona un componente del dropdown de "Custom Components"
- **THEN** el sistema inserta el bloque de código de plantilla del componente en la posición exacta del cursor en el editor.

### Requirement: Interfaz de Documentación y Modal de Ayuda
El sistema SHALL proveer una especificación en formato JSON que liste y documente cada componente personalizado (nombre, icono, descripción, propiedades y ejemplo de uso). Al lado del dropdown en el toolbar, se SHALL incluir un botón con el icono de interrogación `?` que, al ser presionado, despliegue un modal interactivo con la documentación detallada del componente seleccionado.

#### Scenario: Visualización de ayuda de componente
- **WHEN** el usuario hace clic en el botón `?` de ayuda junto a un componente seleccionado.
- **THEN** el sistema abre un modal animado mostrando la descripción, las propiedades del componente y un ejemplo real de su código MDX de uso.

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

### Requirement: Vista previa visual de imágenes locales a cargar
El modal de subida de imágenes SHALL mostrar una previsualización de la imagen cargada localmente en tiempo real antes de presionar el botón para confirmar la subida.

#### Scenario: Vista previa en caliente antes de confirmación
- **WHEN** el usuario selecciona una imagen local desde su ordenador en el modal de carga (ya sea arrastrando o usando el input file)
- **THEN** el modal de subida de imágenes SHALL mostrar una previsualización de la imagen cargada en tiempo real antes de presionar el botón "Cargar"

### Requirement: Selector de assets existentes con botón Escoger
El CMS SHALL ofrecer un botón interactivo llamado "Escoger" al lado de las opciones de subida local, que despliegue un modal con el árbol físico de directorios e imágenes de `src/assets/` y permita explorar, previsualizar en tiempo real y seleccionar una imagen existente para autocompletar la ruta en el campo del frontmatter.

#### Scenario: Apertura y exploración del árbol de assets existentes
- **WHEN** el usuario hace click en el botón "Escoger" en el panel de subida de imágenes
- **THEN** el sistema SHALL abrir un modal interactivo de navegación de assets que cargue el árbol físico de directorios e imágenes de `src/assets/`
- **AND** el botón de confirmación de subida local SHALL renombrarse a "Cargar"

#### Scenario: Vista previa en tiempo real de imagen seleccionada del árbol
- **WHEN** el usuario selecciona un archivo de imagen en el árbol de assets de imágenes existentes
- **THEN** el sistema SHALL mostrar una vista previa visual instantánea de la imagen seleccionada en caliente y autocompletar su ruta de asset en el campo al confirmar

### Requirement: Corrección de Tags con espacios y comas
El CMS SHALL limpiar y estructurar adecuadamente las etiquetas ingresadas por el usuario, permitiendo el ingreso de comas o espacios de forma fluida para delimitar múltiples tags sin alterar el array estructurado del frontmatter.

#### Scenario: Entrada de tags separada por espacios o comas
- **WHEN** el usuario introduce múltiples etiquetas en el campo de `tags` separadas por comas o espacios en el CMS
- **THEN** el sistema SHALL formatear y limpiar cada tag eliminando espacios en blanco innecesarios y convirtiendo la entrada en un array de strings limpio para persistirse en el frontmatter MDX

### Requirement: Layout principal responsivo en el CMS
El layout principal del CMS SHALL ser completamente responsivo para garantizar una correcta usabilidad en tablets y dispositivos portátiles de pantalla pequeña.

#### Scenario: Adaptabilidad del layout a pantallas móviles
- **WHEN** el ancho del viewport disminuye a un tamaño menor o igual a 1024px
- **THEN** el layout principal del CMS SHALL cambiar de su diseño tradicional de dos columnas en fila (Sidebar / Formulario) a un diseño en columna apilada para optimizar la experiencia de usuario

### Requirement: Atajos de Teclado en el Editor Markdown
El editor Markdown del CMS DEBE dar soporte para atajos de teclado estándar: Ctrl+Z para deshacer (undo) y Ctrl+Y para rehacer (redo) la última edición de texto efectuada.

#### Scenario: Deshacer texto con Ctrl+Z
- **WHEN** el desarrollador pulsa el atajo de teclado Ctrl+Z dentro del área de texto del editor Markdown
- **THEN** el editor revierte el texto al estado anterior de la última edición efectuada

#### Scenario: Rehacer texto con Ctrl+Y
- **WHEN** el desarrollador pulsa el atajo de teclado Ctrl+Y dentro del área de texto del editor Markdown
- **THEN** el editor restablece el texto al estado posterior antes de la última operación de deshacer

### Requirement: Explorador de Contenidos en Árbol (Folder-based)
El Sidebar de navegación del CMS DEBE renderizar un árbol de contenidos jerárquico e interactivo en lugar de una lista plana. Este árbol DEBE respetar y reflejar las subcarpetas físicas dentro de `src/content/` de forma recursiva, mostrando carpetas como desplegables interactivos y exponiendo el conteo total consolidado de archivos.

#### Scenario: Navegar por estructura de carpetas recursiva
- **WHEN** el desarrollador despliega una subcarpeta en la UI del explorador en árbol del CMS
- **THEN** el sistema revela de forma dinámica los archivos de contenido y subdirectorios anidados contenidos en ella, manteniendo el conteo de recursos del directorio padre intacto

### Requirement: Internacionalización (i18n)
La interfaz de usuario del CMS DEBE proveer soporte multilingüe nativo para los idiomas **Inglés** y **Español** mediante un selector interactivo.

#### Scenario: Cambiar idioma de la UI en tiempo real
- **WHEN** el desarrollador selecciona "EN" (English) en el selector de idioma de la UI
- **THEN** todas las etiquetas, campos de formularios y encabezados del CMS cambian instantáneamente al inglés

### Requirement: Carga Multimodal de Imágenes
Para cada campo de imagen en los metadatos del frontmatter, el CMS DEBE proveer tres opciones interactivas de carga:
1.  Escritura o pegado directo de la URL en el input.
2.  Carga de un archivo local de la PC mediante un File Uploader, abriendo un modal que permite seleccionar la ruta física en el repositorio donde se guardará el archivo de imagen.
3.  Ingreso de una URL externa absoluta.

#### Scenario: Subir imagen local desde la PC
- **WHEN** el desarrollador selecciona "Subir Imagen" e interactúa con el File Uploader del CMS
- **THEN** el CMS abre un modal permitiendo definir la ruta de guardado (dentro de `src/assets/` o similar) y escribe físicamente el archivo de imagen en el repositorio local, actualizando la propiedad del frontmatter

### Requirement: Botón selector flotante de Biblioteca y Editor
El CMS MUST incorporar un botón flotante estilizado situado inmediatamente al lado de la hamburguesa de herramientas en la esquina inferior derecha. Este botón SHALL mostrar un icono de `🖼️` cuando el usuario esté en el Editor de Contenidos para permitirle cambiar a la Biblioteca de Recursos. Cuando el usuario se encuentre en la Biblioteca de Recursos, el botón SHALL cambiará su icono a `✍️` y su clic SHALL redirigir la interfaz de vuelta al Editor de Contenidos.

#### Scenario: Transición exitosa entre Editor y Biblioteca
- **WHEN** el usuario hace clic en el botón flotante con el icono `🖼️` en el Editor de Contenidos
- **THEN** la vista del CMS cambia a la Biblioteca de Recursos, el botón flotante actualiza su icono a `✍️` y se inicia una suave animación de transición.

---

### Requirement: Transición onírica de desenfoque
Al rotar y alternar entre las secciones principales (Editor de Contenidos y Biblioteca de Recursos) a través del botón selector flotante, el sistema MUST aplicar una transición visual de desenfoque (`blur`) sobre toda la pantalla con un efecto de cambio de opacidad progresivo de 2 segundos de duración para proporcionar un aspecto onírico o suave.

#### Scenario: Activación de la animación de transición al cambiar de sección
- **WHEN** el usuario pulsa el selector de modos del CMS para alternar la vista actual
- **THEN** el sistema aplica dinámicamente una clase CSS de animación que activa un filtro `blur` de hasta 8px y un fundido de opacidad con una transición constante de 2.0 segundos de duración antes de estabilizar la visualización final.

### Requirement: Botón de Inserción Rápida de Imagen en Toolbar
El editor Markdown del CMS local MUST incluir un botón en su barra de herramientas para la inserción rápida de imágenes en formato estándar de Markdown (`![Descripción de la imagen](url)`). Al presionar este botón, el sistema SHALL inyectar la sintaxis de imagen en la posición exacta del cursor.

#### Scenario: Inserción exitosa de sintaxis de imagen
- **WHEN** el usuario pulsa el botón de inserción de imagen en la barra de herramientas del editor Markdown
- **THEN** el sistema inserta el snippet `![Descripción de la imagen](url)` en la posición del cursor e inicia el foco en él.

---

### Requirement: Persistencia de Vista del CMS en LocalStorage
El sistema MUST guardar dinámicamente en `localStorage` la vista activa del CMS (Editor de Contenidos o Biblioteca de Recursos) tras cada conmutación realizada por el usuario. Al iniciar o recargar la aplicación web, el CMS SHALL leer esta preferencia persistida para restaurar de forma transparente la última sección de trabajo del redactor.

#### Scenario: Restauración de la vista al recargar
- **WHEN** el usuario se encuentra en la Biblioteca de Recursos y refresca el navegador
- **THEN** la aplicación lee el localStorage al montar y auto-selecciona e inicia la interfaz directamente en la Biblioteca de Recursos.

---

