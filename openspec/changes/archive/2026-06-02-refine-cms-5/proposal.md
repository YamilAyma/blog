## Why

El CMS de desarrollo local requiere ajustes finales clave para mejorar la experiencia de usuario en dos frentes principales: la gestión de imágenes y el orden del historial de control de versiones. Actualmente, la subida de imágenes carece de personalización de nombre (lo que puede causar sobrescrituras accidentales), el historial de Git local se llena de commits repetitivos cada vez que se guarda un post, los archivos creados usan la extensión `.md` en lugar del estándar moderno `.mdx`, y la plantilla de la colección `posts` carece de atributos frontmatter esenciales para la visualización correcta del blog.

## What Changes

* **Personalización de Nombres de Imágenes y Validación:**
  * Al subir una imagen desde el PC, la interfaz solicitará al usuario un nombre personalizado para el archivo.
  * Se implementará una validación en tiempo real (tanto en el frontend como en el backend) que impedirá subir el archivo si el nombre ya existe en la carpeta física de assets seleccionada, sugiriendo al usuario cambiarlo.
  
* **Estrategia "Finalizar Redacción" con Git Squash y Push:**
  * En lugar de acumular micro-commits repetitivos en la rama principal, se añadirá el botón **"Finalizar Redacción"** (icono de compresión `🗜️`) en el menú flotante inferior del CMS.
  * Al activarlo, se abrirá un modal interactivo con la imagen `public/success_session.png` que informará al usuario en forma de lista que se consolidará (squash) el historial local y se subirá (push) a GitHub, recordando que puede continuar editando y que el CMS no se cerrará.
  * El commit consolidado recopilará todos los nombres de los commits individuales realizados en la sesión (obtenidos mediante `git log origin/main..HEAD`) y los incluirá en el cuerpo/descripción del commit final para mantener el historial detallado pero aplanado.

* **Creación de Archivos con Extensión MDX por Defecto y Mensaje de Ayuda:**
  * Todas las funciones de creación de nuevos recursos en las colecciones del CMS utilizarán la extensión `.mdx` por defecto. Si el usuario escribe una extensión explícita (como `.md`), se respetará su entrada.
  * Se agregará un texto aclaratorio debajo del campo de entrada de nombre del archivo en el modal explicativo de esta lógica de comportamiento.

* **Enriquecimiento del Frontmatter de la Colección `posts`:**
  * Al crear un nuevo recurso dentro de la colección `posts`, se auto-poblará con una plantilla de frontmatter que incluya los atributos clave: `image`, `imageAlt`, `title`, `copy`, `date`, `published`, `category`, `tags` y `socials` (con `linkedin`), coincidiendo exactamente con la estructura de posts visuales usada en el blog real.

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `dev-cms`: Refinar validaciones de assets, agregar estrategia de aplanamiento de Git e inyectar plantilla extendida para posts.

## Impact

* **Backend CMS (`scripts/cms/`):** Se adaptarán `api/content.js`, `api/media.js`, `api/git.js` y `server.js` para añadir soporte a la validación de archivos existentes y al comando de squash de Git.
* **Frontend CMS (`scripts/cms/public/`):** Se modificará el modal de carga de imágenes en `index.html` para incluir un campo de nombre de archivo con validación asíncrona, se ajustará el modal de creación de contenido para usar `.mdx` por defecto y se añadirá el botón "Aplanar Historial" en el menú flotante.
