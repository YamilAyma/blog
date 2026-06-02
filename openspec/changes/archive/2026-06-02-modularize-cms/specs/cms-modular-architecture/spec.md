## ADDED Requirements

### Requirement: CSS externo separado del HTML
El sistema SHALL servir todos los estilos del CMS (tokens de diseño, clases utilitarias, animaciones) desde un archivo CSS independiente (`styles/cms.css`) cargado mediante `<link>` en el `index.html`, en lugar de tenerlos embebidos en un bloque `<style>`.

#### Scenario: Carga de estilos desde archivo externo
- **WHEN** el navegador carga `index.html` del CMS
- **THEN** los tokens CSS (`--color-bg-light`, `--color-primary`, etc.), clases utilitarias (`.cms-card`, `.cms-input`) y animaciones (`fadeIn`, `scaleUp`, `slideIn`) SE DEBEN cargar desde `styles/cms.css` y aplicarse correctamente a toda la interfaz

#### Scenario: Tailwind v4 procesa el archivo externo
- **WHEN** el archivo `styles/cms.css` contiene directivas `@layer base` y clases utilitarias de Tailwind
- **THEN** Tailwind CSS v4 CDN DEBE procesarlas y generar las utilidades necesarias al igual que cuando estaban inline

### Requirement: Componentes de UI en archivos JS independientes
Cada componente React reutilizable (`MediaFolderNode`, `ToastContainer`) SHALL existir como un archivo `.js` individual en el directorio `components/` y ser cargable mediante la función `loadComponent()`.

#### Scenario: Carga dinámica de MediaFolderNode
- **WHEN** el CMS inicializa y `App.js` ejecuta `loadComponent('./components/MediaFolderNode.js')`
- **THEN** el componente `MediaFolderNode` DEBE estar disponible como módulo exportado y funcionar idénticamente al renderizar árboles de carpetas en modales

#### Scenario: Carga dinámica de ToastContainer
- **WHEN** el CMS inicializa y `App.js` ejecuta `loadComponent('./components/ToastContainer.js')`
- **THEN** el componente `ToastContainer` DEBE estar disponible y renderizar notificaciones toast correctamente

### Requirement: Modales en archivos JS independientes
Cada modal del CMS (`ImageUploaderModal`, `FinalizarRedaccionModal`, `LightboxModal`, `DeleteConfirmationModal`) SHALL existir como un archivo `.js` individual en `components/` con su propia exportación.

#### Scenario: Carga y uso de ImageUploaderModal
- **WHEN** `App.js` carga `ImageUploaderModal.js` y el usuario abre el modal de subida de imágenes
- **THEN** el modal DEBE funcionar con todas sus capacidades: drag-and-drop, selección de carpeta destino, validación de nombres duplicados y subida

#### Scenario: Carga y uso de FinalizarRedaccionModal
- **WHEN** `App.js` carga `FinalizarRedaccionModal.js` y el usuario activa "Finalizar Redacción"
- **THEN** el modal DEBE mostrar la imagen `success_session.png`, la lista informativa y los botones de confirmación

#### Scenario: Carga y uso de LightboxModal
- **WHEN** `App.js` carga `LightboxModal.js` y el usuario hace click en una imagen para zoom
- **THEN** el lightbox DEBE abrirse con animación, mostrar la imagen ampliada y cerrarse con Escape o click fuera

#### Scenario: Carga y uso de DeleteConfirmationModal
- **WHEN** `App.js` carga `DeleteConfirmationModal.js` y el usuario solicita borrar un recurso
- **THEN** el modal DEBE mostrar el nombre del archivo y los botones de confirmar/cancelar

### Requirement: Servicios de API centralizados
Las funciones de comunicación con el backend (fetch calls) SHALL centralizarse en un módulo `services/api.js` con funciones nombradas y reutilizables.

#### Scenario: Las funciones de API son accesibles desde App.js
- **WHEN** `App.js` carga `services/api.js` mediante `loadComponent()`
- **THEN** las funciones (`fetchContent`, `saveEntry`, `deleteEntry`, `gitPush`, `gitSquash`, `validateAssets`, `createEntry`, `checkFileExists`) DEBEN estar disponibles como exportaciones del módulo

#### Scenario: Los handlers del App usan las funciones centralizadas
- **WHEN** el usuario guarda contenido, elimina un recurso o ejecuta acciones de Git
- **THEN** la lógica DEBE delegar en las funciones de `api.js` en lugar de tener `fetch()` inline dentro de `App.js`

### Requirement: Componente App raíz como archivo externo
El componente `App()` SHALL extraerse a `components/App.js` y ser cargado dinámicamente desde `index.html` como punto de entrada principal de la SPA.

#### Scenario: index.html carga App.js como componente raíz
- **WHEN** el navegador carga `index.html`
- **THEN** `index.html` DEBE contener únicamente las declaraciones de CDN, la carga del CSS externo, el div `#root`, y un script que cargue y monte `App.js`

#### Scenario: App.js orquesta la carga de todos los sub-módulos
- **WHEN** `App.js` inicializa
- **THEN** DEBE ejecutar `Promise.all()` para cargar en paralelo todos los componentes modulares (Sidebar, FormFields, MarkdownEditor, i18n, MediaFolderNode, ToastContainer, modales, api.js) antes de renderizar

### Requirement: index.html reducido a shell mínimo
El archivo `index.html` SHALL reducirse a un shell ligero de ~50 líneas que solo contenga: CDNs de React, Babel y Tailwind; enlace al CSS externo; div `#root`; y un script de arranque que cargue `App.js`.

#### Scenario: index.html no contiene lógica de negocio
- **WHEN** se inspecciona el archivo `index.html` después de la modularización
- **THEN** NO DEBE contener componentes React, handlers de API, gestión de estado, ni lógica de UI — solo la función `loadComponent()` y la carga de `App.js`
