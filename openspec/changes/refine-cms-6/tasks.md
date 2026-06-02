## 1. Backend: Listar Archivos de Assets

- [x] 1.1 Añadir en `server.js` un endpoint `/api/media-files` para escanear y retornar los archivos de imagen dentro de una carpeta de assets seleccionada.


## 2. Frontend: Vista Previa e Interfaz de Carga de Imagen

- [x] 2.1 Modificar `ImageUploaderModal.js` para añadir soporte de vista previa de imagen local usando un estado `localPreviewSrc` e inyectar un tag `<img>` en la UI.
- [x] 2.2 Cambiar el copy del botón de confirmación de "Subir Imagen" a "Cargar" para mayor consistencia de interfaz.

## 3. Frontend: Exploración y Selector de Assets Existentes (Botón Escoger)

- [x] 3.1 Añadir en el modal `ImageUploaderModal.js` un selector multimodal: una pestaña o sección para "Subir Archivo PC" y otra para "Escoger del Blog".
- [x] 3.2 Integrar el selector de imágenes existentes permitiendo hacer clic en un botón "Escoger" que expone el árbol recursivo de assets (`src/assets/images`).
- [x] 3.3 Consumir el endpoint `/api/media-files` para listar los archivos reales dentro de cada carpeta seleccionada.
- [x] 3.4 Habilitar una vista previa visual interactiva y en tiempo real de la imagen seleccionada del árbol, autocompletando la ruta al hacer clic en "Confirmar".


## 4. Frontend: Corrección de Tags e i18n Copys

- [x] 4.1 Crear el componente controlado `TagsField` en `FormFields.js` con estado local `inputValue` y trigger de confirmación en `onBlur` usando regex `/[\s,]+/`.
- [x] 4.2 Actualizar las definiciones del input `tags` en `FormFields.js` para utilizar el nuevo componente `TagsField`.
- [x] 4.3 Cambiar el label de traducción `copy_message` en `i18n.js` de `"Copy / Mensaje"` a `"Copy / Mensaje a publicar"` y adaptarlo en el formulario.


## 5. UI Responsiva Completa

- [x] 5.1 Modificar el layout principal en `App.js` o `cms.css` para utilizar clases responsivas (columnas apiladas en móviles y tablets ≤1024px).
- [x] 5.2 Probar visualmente en el navegador simulando dispositivos pequeños para asegurar una correcta visualización.

## 6. Pruebas Automáticas y Regresión

- [x] 6.1 Crear el script de regresión `scripts/cms/tests/verify_endpoints.js` con colecciones y assets mockeados para validar llamadas a endpoints clave.


