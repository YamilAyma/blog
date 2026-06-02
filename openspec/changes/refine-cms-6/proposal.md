## Why

El CMS local de desarrollo actual carece de ciertas facilidades críticas de experiencia de usuario al gestionar recursos y contenidos, lo que ralentiza la redacción:
1. Al arrastrar o cargar imágenes locales, no se muestra una vista previa visual antes de subirla, lo que reduce la confianza del redactor.
2. Al enlazar imágenes existentes en el blog, el usuario debe recordar y escribir manualmente la ruta física exacta, en lugar de poder explorar visualmente el árbol de assets en caliente con vista previa interactiva.
3. El campo de etiquetas (`tags`) en el formulario de edición no permite el ingreso de comas o espacios de forma fluida para separar elementos.
4. Algunos textos informativos del CMS pueden resultar técnicos ("Copy/Message" en lugar de "Copy / Mensaje a publicar") y la interfaz del layout principal no se adapta correctamente en pantallas de menor tamaño o tablets, reduciendo su usabilidad en entornos portátiles.

## What Changes

- **Vista Previa de Carga de Imagen**: El modal de subida de imágenes (`ImageUploaderModal`) mostrará una vista previa visual en tiempo real de la imagen local cargada (drag-and-drop o selector) antes de que sea confirmada y subida físicamente al servidor.
- **Selector de Assets Existentes (Botón "Escoger")**: Al lado del botón para seleccionar archivo local de PC, se agregará un botón llamado "Escoger". Al pulsarlo, se desplegará un modal con el árbol de directorios de assets de imágenes existentes del blog. Al seleccionar un archivo del árbol, se mostrará una vista previa interactiva de la imagen en tiempo real y permitirá seleccionarla para completar automáticamente la ruta en el campo.
- **Renombrado de Botón de Subida**: El botón de "Subir PC" se renombrará a "Cargar" para mayor consistencia de copy.
- **Mejoras de Textos y Copys**: El label del campo de frontmatter "Copy/Message" se cambiará a "Copy / Mensaje a publicar".
- **Fix de Campo de Tags**: Se corregirá el comportamiento del campo de tags para permitir el ingreso y separación fluida de múltiples etiquetas que incluyan comas o espacios (ej. convirtiéndolas en elementos de array limpios sin romper el formulario).
- **Layout Responsivo**: Se rediseñará el layout principal del CMS para garantizar que sea completamente responsive, adaptando el diseño de filas en desktop a un orden en columnas en viewports móviles y tablets.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `dev-cms`: Refinar el flujo de gestión de assets, tags y UI responsiva del CMS local.

## Impact

*   **scripts/cms/public/components/ImageUploaderModal.js**: Para el renombrado del botón, la vista previa local y la integración del botón "Escoger" con navegación de assets y previsualización.
*   **scripts/cms/public/components/FormFields.js**: Para mejorar el campo de tags y renombrar el label de "Copy/Message".
*   **scripts/cms/public/components/App.js**: Para enlazar los nuevos estados responsivos y pasar las funciones necesarias.
*   **scripts/cms/public/styles/cms.css**: Para los estilos de las nuevas vistas previas y media queries responsivas.
