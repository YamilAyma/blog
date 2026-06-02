## 1. Backend Implementation

- [ ] 1.1 Configurar Express en server.js para servir estáticamente la carpeta public/ raíz del blog
- [ ] 1.2 Implementar en server.js la API GET /api/git-commits para obtener commits locales no enviados
- [ ] 1.3 Implementar en server.js la API POST /api/git-undo para realizar git reset --hard HEAD~1
- [ ] 1.4 Actualizar el archivo api/componentsRegistry.json con los componentes MDX reales del blog (TLDR, FAQs, Quote, References)

## 2. Frontend Layout & Tooltip Fixes

- [ ] 2.1 Modificar en ResourceLibrary.js los estilos o markup de la Card para evitar que el tooltip de Info sea atrapado y recortado por overflow: hidden
- [ ] 2.2 Agregar la advertencia contextual en la sección de Biblioteca sobre imágenes en formato Markdown escrito directo

## 3. Modales y Estado Persistente

- [ ] 3.1 Reemplazar window.confirm en ResourceLibrary.js con un modal React estilizado que muestre delete-resource.png como cabecera/icono
- [ ] 3.2 Implementar la persistencia de la sección activa (viewMode) del CMS usando localStorage en App.js
- [ ] 3.3 Agregar el botón flotante con icono de portapapeles 📋 al costado del botón de cambio de sección
- [ ] 3.4 Diseñar y codificar el modal de Actividad en App.js que renderice los commits locales no enviados y el botón interactivo para deshacer la última acción

## 4. Markdown Editor y Componentes

- [ ] 4.1 Añadir el botón en la toolbar del MarkdownEditor.js para inyectar sintaxis de imagen ![Descripción](url)
- [ ] 4.2 Actualizar el desplegable de componentes personalizados en MarkdownEditor.js para reflejar los componentes MDX reales sincronizados
