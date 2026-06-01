## 1. Registro de Componentes y Backend API

- [x] 1.1 Crear el archivo JSON de base de datos viva `scripts/cms/api/componentsRegistry.json` con la especificación de componentes permitidos (`Badge`, `Alert`, `Card`, etc.)
- [x] 1.2 Implementar el endpoint `GET /api/custom-components` en el submódulo `content.js` que lea y entregue el JSON
- [x] 1.3 Adaptar `scripts/cms/server.js` para registrar el nuevo endpoint de componentes de forma modular

## 2. Dropdown de Inserción y Lógica del Editor

- [x] 2.1 Modificar la barra de herramientas del editor Markdown en `MarkdownEditor.js` para añadir el selector dropdown de "Custom Components"
- [x] 2.2 Consumir de forma asíncrona la lista de componentes desde `/api/custom-components` para poblar el dropdown
- [x] 2.3 Programar la lógica de inyección de código de plantilla (`template`) en la posición actual del cursor (`selectionStart`/`selectionEnd`) de la caja de texto reenfocando el editor

## 3. Botón de Ayuda y Modal de Documentación

- [x] 3.1 Diseñar e integrar el botón interactivo de ayuda `?` en el toolbar junto al dropdown de componentes
- [x] 3.2 Crear un modal interactivo y animado de documentación en la SPA (`index.html`) con transiciones de CSS fluidas
- [x] 3.3 Programar el modal de documentación para renderizar la descripción detallada, la tabla de propiedades y la caja de código de ejemplo copiable del componente seleccionado

## 4. Diseño Split Pane y Vista Previa Rápida

- [x] 4.1 Reestructurar la distribución de la SPA en `index.html` para soportar un panel dividido ajustable en dos columnas (Editor a la izquierda, Vista Previa a la derecha)
- [x] 4.2 Desarrollar el componente de visualización reactivo local ("Vista Rápida") que procesa Markdown/MDX al vuelo
- [x] 4.3 Programar el parser liviano de la Vista Rápida para reemplazar de forma visual las etiquetas MDX de componentes personalizados con maquetas en HTML y estilos de Tailwind CSS

## 5. Sincronización del Iframe de Astro y Tooltips de Control

- [x] 5.1 Integrar un `<iframe>` de previsualización real en el panel derecho conectado con el servidor local de desarrollo de Astro (`http://localhost:4321`)
- [x] 5.2 Implementar un refresco asíncrono y transparente del `<iframe>` al guardar exitosamente los cambios físicos en el disco tras un retardo de 300ms de compilación
- [x] 5.3 Implementar la detección de archivos nuevos/inexistentes en disco para mantener deshabilitada la pestaña de Vista Real de Astro, guiando al usuario con un tooltip estético al pasar el ratón (hover)
