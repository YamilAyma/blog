## Why

El archivo `scripts/cms/public/index.html` es una SPA monolítica de ~1526 líneas y ~62KB que mezcla CSS (tokens, animaciones, componentes), lógica React (5 modales, handlers de API, gestión de estado) y JSX de layout en un solo archivo. Esto dificulta el mantenimiento, la legibilidad y la depuración. Algunos componentes ya fueron extraídos (`Sidebar.js`, `FormFields.js`, `MarkdownEditor.js`, `i18n.js`), pero el grueso de la lógica de la aplicación y los estilos siguen embebidos en el HTML.

## What Changes

- **Extraer CSS a archivo separado**: Mover todo el bloque `<style type="text/tailwindcss">` (tokens, animaciones, clases utilitarias del CMS) a un archivo `styles/cms.css` dedicado.
- **Extraer modales a componentes modulares**: Los 4 componentes de modal independientes (`ImageUploaderModal`, `FinalizarRedaccionModal`, `LightboxModal`, `DeleteConfirmationModal`) se moverán a archivos `.js` independientes en `components/`.
- **Extraer componentes de UI reutilizables**: `MediaFolderNode` y `ToastContainer` se moverán a `components/` como archivos independientes.
- **Extraer lógica de negocio del App**: Los handlers de API (`handleSave`, `handleGitPush`, `handleFinalizarRedaccion`, `handleDeleteEntry`, `handleCreateEntry`, etc.) se extraerán a un módulo `services/api.js` o `hooks/useAppActions.js`.
- **Reducir `index.html` a ~50 líneas**: El archivo resultante solo contendrá el `<head>` con CDNs, la importación del CSS externo, y la carga/render del componente `App.js`.
- **Extraer `App` a componente raíz modular**: Todo el componente `App()` se moverá a `components/App.js`, cargado dinámicamente vía el mismo sistema Babel existente.

## Capabilities

### New Capabilities
- `cms-modular-architecture`: Arquitectura modular del frontend CMS con separación de estilos, componentes de UI, modales y lógica de negocio en archivos independientes bajo `scripts/cms/public/`.

### Modified Capabilities
- `dev-cms`: Se refactoriza la estructura interna del frontend sin cambiar funcionalidad. Los endpoints del backend y la API no cambian. Solo cambia la organización del código del cliente.

## Impact

- **Archivos afectados**: `scripts/cms/public/index.html` (se reduce drásticamente), se crean ~8-10 nuevos archivos JS/CSS en `scripts/cms/public/`.
- **Dependencias**: Sin cambios. Se mantiene React 18 + Babel Standalone + Tailwind CSS v4 CDN.
- **Backend**: Sin cambios. Todos los endpoints de `server.js` permanecen iguales.
- **Riesgo**: Bajo. El sistema de carga dinámica con `loadComponent()` ya está probado con los componentes existentes. La refactorización es puramente de organización sin cambio funcional.
