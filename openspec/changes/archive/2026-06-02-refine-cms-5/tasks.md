## 1. Validación de Imágenes y Nombres Personalizados

- [x] 1.1 Crear el endpoint `GET /api/media/check-exists` en `scripts/cms/server.js` (o en `api/media.js`) para verificar de forma asíncrona la existencia de un archivo de imagen en la carpeta destino seleccionada.
- [x] 1.2 Modificar la interfaz del cargador de imágenes `ImageUploaderModal` en `scripts/cms/public/index.html` agregando un campo de entrada para el nombre personalizado de la imagen (por defecto pre-poblado con el nombre sanitizado del archivo original).
- [x] 1.3 Implementar validación asíncrona en el frontend que consulte `/api/media/check-exists` al cambiar de nombre de archivo o carpeta destino, y mantenga deshabilitado el botón "Subir Imagen" si hay colisión, mostrando una alerta visual.
- [x] 1.4 Modificar `uploadMedia` en `scripts/cms/api/media.js` y el endpoint `POST /api/media` para usar el nombre de archivo personalizado ingresado por el usuario en lugar del original.

## 2. Botón "Finalizar Redacción" con Git Squash y Push

- [x] 2.1 Implementar el endpoint `POST /api/git-squash` en `scripts/cms/server.js` (o en `api/git.js`) que lea los commits locales pendientes (`git log origin/main..HEAD`), ejecute un soft reset (`git reset --soft origin/main`), cree un commit consolidado incluyendo todos los commits en su descripción y active el comando `git push` de forma directa.
- [x] 2.2 Diseñar y añadir el botón **"Finalizar Redacción"** en el menú flotante inferior del CMS (`index.html`) con un estilo de tarjeta, icono de compresión `🗜️` y texto completo.
- [x] 2.3 Desarrollar el modal interactivo de confirmación en la SPA (`index.html`) que muestre la ilustración `success_session.png`, exponga en una lista informativa que se consolidarán los cambios de la sesión y se subirán a GitHub, y recuerde en el texto que se puede continuar redactando.
- [x] 2.4 Programar la llamada frontend hacia `/api/git-squash` al pulsar "Confirmar y Subir" en el modal, mostrando notificaciones Toast de carga, éxito y fallos.

## 3. Extensión MDX por Defecto y Plantillas Enriquecidas

- [x] 3.1 Modificar la lógica de creación de entradas en `index.html` (modal de nueva entrada) para sugerir la extensión `.mdx` por defecto.
- [x] 3.2 Añadir una nota aclaratoria inferior en el modal de nueva entrada (`index.html`) debajo del campo de nombre que explique: "Nota: Si no especificas extensión, se creará como .mdx por defecto. Si escribes .md u otra, se respetará la selección".
- [x] 3.3 Ajustar el backend en `POST /api/content/:collection` para que, si el nombre del nuevo archivo no tiene extensión, se asigne automáticamente `.mdx` por defecto (respetando si el usuario escribe `.md` u otra de forma explícita).
- [x] 3.4 Enriquecer y extender la plantilla de la colección `posts` en `scripts/cms/server.js` para inyectar una estructura inicial completa que incluya: `image`, `imageAlt`, `title`, `copy`, `date`, `published`, `category`, `tags` y `socials` (con `linkedin`).
