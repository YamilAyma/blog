## 1. Modularización y Refactorización del CMS

- [ ] 1.1 Crear el directorio de componentes del frontend en `scripts/cms/public/components/` y estructurar los archivos ESM modulares (`i18n.js`, `Sidebar.js`, `FormFields.js`, `MarkdownEditor.js`)
- [ ] 1.2 Actualizar el archivo `scripts/cms/public/index.html` para enlazar los componentes de React modulares mediante scripts de importación ESM
- [ ] 1.3 Modificar el encabezado del Sidebar para renombrar "Yamil Ayma" a "Mi Blog" e integrar el recurso `/favicon.svg` del blog como el icono de la pestaña web en el HTML
- [ ] 1.4 Garantizar la total responsividad de la maquetación CSS (Sidebar y Canvas central) en resoluciones móviles y tablets

## 2. Atajos de Teclado del Editor y Remoción de Preview

- [ ] 2.1 Eliminar el botón "Vista Previa" y el componente HTML condicional del editor Markdown en `index.html` y en el componente `MarkdownEditor.js`
- [ ] 2.2 Implementar en el `textarea` del editor la pila de historial en React con los escuchadores de teclado Ctrl+Z (Deshacer) y Ctrl+Y (Rehacer) reposicionando el cursor

## 3. Explorador de Carpetas en Árbol y Soporte i18n

- [ ] 3.1 Actualizar el backend (`server.js`) para escanear y entregar la jerarquía física recursiva de subcarpetas del sistema con conteo consolidado de recursos
- [ ] 3.2 Construir el componente React recursivo `<FolderTree />` en el Sidebar para mostrar desplegables interactivos de carpetas físicas
- [ ] 3.3 Implementar traducción de la interfaz al Español e Inglés controlable por un selector dinámico

## 4. Persistencia YAML y Cargador de Imágenes

- [ ] 4.1 Modificar la lógica de escritura en `server.js` para forzar que el YAML serializado guarde arrays en línea clásicos, descripciones en una línea envueltas en comillas dobles y textos generales entre comillas dobles
- [ ] 4.2 Configurar el formulario CRUD del CMS para exponer inputs vacíos listos para completarse si el archivo físico carece de metadatos (ej: portadas o `layout`)
- [ ] 4.3 Desarrollar el endpoint POST `/api/media` en el servidor Express para recibir y guardar imágenes físicas de la PC en `src/assets/images/` y diseñar la UI del modal de carga multimodal de imágenes
