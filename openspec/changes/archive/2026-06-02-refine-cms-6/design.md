## Context

Esta sexta iteración del CMS de desarrollo refina la experiencia de redactor mediante mejoras visuales de previsualización al subir imágenes locales, añade una exploración interactiva de assets existentes que ya se encuentran en el repositorio, corrige la entrada de etiquetas (tags) para admitir múltiples delimitadores, mejora el copy de "Copy/Message" y asegura el diseño responsive completo de la interfaz principal en viewports pequeños (móviles/tablets).

## Goals / Non-Goals

**Goals:**
*   Añadir previsualización visual inmediata en `ImageUploaderModal` de la imagen seleccionada localmente desde el PC.
*   Añadir un selector de assets existentes en el blog mediante un botón "Escoger" que despliega un navegador visual de assets en caliente y permite previsualizar e insertar la ruta.
*   Corregir el bug del campo de `tags` que pierde foco o impide digitar espacios/comas al usar un componente controlado con estado local que se confirma `onBlur`.
*   Cambiar los labels técnicos a textos más legibles para humanos ("Copy / Mensaje a publicar").
*   Asegurar que el layout principal del CMS se adapte a un diseño responsivo de fila en desktop a columna apilada en móviles.

**Non-Goals:**
*   Crear una API de base de datos externa para assets. Utilizar los endpoints de `/api/media-folders` y el listado de archivos físicos existentes en el backend.
*   Modificar la lógica de Git Auto-commits o compresión del historial.

## Decisions

### 1. Vista Previa de Imagen Local en Modal
*   **Enfoque**: En `ImageUploaderModal.js`, tras la selección o arrastre del archivo físico, utilizaremos `URL.createObjectURL(file)` para crear una URL en el navegador y asignarla al estado `localPreviewSrc`.
*   **Rationale**: Es instantáneo, no requiere procesamiento en el servidor ni consume ancho de banda antes de confirmar la carga.
*   **Alternativa**: Subir la imagen a una ruta `/tmp` temporal y obtener la URL, pero esto satura el disco con archivos huérfanos.

### 2. Selector de Assets Existentes (Botón "Escoger")
*   **Enfoque**: En `ImageUploaderModal.js`, añadiremos un botón de "Escoger" al lado del de cargar archivo. Al pulsarlo, el modal entra en modo "Selector de Assets". Presentamos el árbol colapsable y una lista de imágenes del directorio seleccionado. Al seleccionar una imagen existente, se muestra una vista previa a la derecha/abajo y se autocompleta la ruta correspondiente (ej. `/src/assets/images/posts/imagen.png`) al hacer clic en "Confirmar".
*   **Rationale**: Reutiliza el componente `MediaFolderNode` y aprovecha el árbol físico de directorios ya expuesto por `/api/media-folders` y el listado de archivos en assets.

### 3. Entrada de Tags Tolerante y Controlada (TagsField)
*   **Enfoque**: Crear un componente local `TagsField` en `FormFields.js` que gestione de manera aislada la cadena de texto editada por el usuario (`inputValue`). Al disparar el evento `onBlur` (pérdida de foco), limpia comas y espacios redundantes dividiendo mediante el regex `/[\s,]+/` y llama a `updateMeta` pasándole el array de strings limpio.
*   **Rationale**: Resuelve el problema clásico del cursor que se restablece al final o del salto de foco cuando el formulario de un componente controlado se regenera ante cambios rápidos de estado.

### 4. Layout Responsivo en `cms.css` y `App.js`
*   **Enfoque**: Modificar la estructura flex/grid en el layout principal del CMS en `App.js`. En lugar de `flex flex-row` incondicional, utilizar clases responsivas de CSS en `styles/cms.css` o Tailwind responsivo (`grid-cols-1 lg:grid-cols-12`, `flex-col lg:flex-row`).
*   **Rationale**: Mantener coherencia visual adaptando a columnas verticales automáticas en viewports inferiores a 1024px.

## Risks / Trade-offs

*   **[Riesgo]**: El renderizado del árbol de carpetas de assets puede resultar lento si hay miles de imágenes.
    *   *Mitigación*: Se escanean subcarpetas en caliente de forma jerárquica y el listado de archivos dentro de cada carpeta se realiza solo al hacer clic en ella, evitando sobrecargar la memoria.
