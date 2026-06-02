## 1. Extracción de CSS

- [x] 1.1 Crear `scripts/cms/public/styles/cms.css` moviendo todo el contenido del bloque `<style type="text/tailwindcss">` del `index.html`
- [x] 1.2 Reemplazar el bloque `<style>` inline por un `<link>` que apunte al archivo CSS externo
- [x] 1.3 Verificar que Tailwind v4 CDN procesa las directivas `@layer base` desde el archivo externo

## 2. Extracción de Componentes Atómicos

- [x] 2.1 Crear `components/MediaFolderNode.js` extrayendo el componente `MediaFolderNode` con su exportación
- [x] 2.2 Crear `components/ToastContainer.js` extrayendo el componente `ToastContainer` con su exportación

## 3. Extracción de Modales

- [x] 3.1 Crear `components/LightboxModal.js` extrayendo el componente `LightboxModal`
- [x] 3.2 Crear `components/DeleteConfirmationModal.js` extrayendo el componente `DeleteConfirmationModal`
- [x] 3.3 Crear `components/ImageUploaderModal.js` extrayendo el componente (recibe `MediaFolderNode` como prop)
- [x] 3.4 Crear `components/FinalizarRedaccionModal.js` extrayendo el componente del modal de squash

## 4. Extracción de Servicios de API

- [x] 4.1 Crear `services/api.js` con funciones centralizadas: `fetchContent`, `saveEntry`, `deleteEntry`, `gitPush`, `gitSquash`, `validateAssets`, `createEntry`, `fetchContentFolders`, `createContentFolder`, `checkFileExists`

## 5. Extracción del Componente App

- [x] 5.1 Crear `components/App.js` moviendo toda la función `App()` y adaptando la carga de módulos para incluir los nuevos componentes extraídos
- [x] 5.2 Adaptar `App.js` para recibir los componentes y servicios cargados por `loadComponent()` y pasarlos como props a los sub-componentes

## 6. Reducción de index.html

- [x] 6.1 Reducir `index.html` a shell mínimo: CDNs, `<link>` CSS externo, `#root`, función `loadComponent()` y script de arranque que cargue y monte `App.js`
- [x] 6.2 Eliminar todo el código de componentes, handlers y lógica de negocio del `index.html`

## 7. Verificación

- [x] 7.1 Ejecutar `npm run cms` y validar que el CMS arranca sin errores de consola
- [x] 7.2 Verificar funcionalidad completa: navegar colecciones, editar contenido, guardar, eliminar, subir imágenes, finalizar redacción
- [x] 7.3 Verificar que el `index.html` resultante tiene ~50 líneas o menos

