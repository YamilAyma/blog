## Context

El CMS local de desarrollo del blog (`scripts/cms/`) sirve una SPA React transpilada en el cliente con Babel Standalone. El archivo `public/index.html` concentra actualmente ~1526 líneas con:
- **CSS**: Tokens de diseño (`--color-*`, `--font-*`), clases utilitarias (`.cms-card`, `.cms-input`), animaciones (`@keyframes fadeIn`, `scaleUp`, `slideIn`).
- **Componentes React**: 5 componentes independientes (`MediaFolderNode`, `ImageUploaderModal`, `FinalizarRedaccionModal`, `LightboxModal`, `DeleteConfirmationModal`, `ToastContainer`) + el componente raíz `App`.
- **Lógica de negocio**: ~15 handlers de API y estado en `App` (`handleSave`, `handleGitPush`, `handleFinalizarRedaccion`, `handleDeleteEntry`, `handleCreateEntry`, etc.).

Ya existe un sistema de carga dinámica (`loadComponent()`) que transpila archivos `.js` con Babel y los inyecta como módulos UMD. Cuatro componentes ya fueron extraídos con este patrón: `Sidebar.js`, `FormFields.js`, `MarkdownEditor.js`, `i18n.js`.

## Goals / Non-Goals

**Goals:**
- Reducir `index.html` a un archivo ligero (~50 líneas) que solo declare CDNs, cargue el CSS externo y monte `App.js`.
- Extraer todo el CSS a un archivo `styles/cms.css` enlazado con `<link>`.
- Mover cada modal y componente de UI a su propio archivo `.js` bajo `components/`.
- Centralizar los handlers de API en un módulo `services/api.js` reutilizable.
- Mantener 100% de funcionalidad existente sin cambios en el backend ni en la API.
- Preservar el patrón `loadComponent()` ya probado para cargar los nuevos módulos.

**Non-Goals:**
- Cambiar la tecnología de transpilación (seguimos con Babel Standalone en el cliente).
- Introducir un bundler (Vite, Webpack, etc.) — el CMS es deliberadamente sin build.
- Modificar endpoints del backend (`server.js`).
- Agregar nueva funcionalidad al CMS en esta iteración.

## Decisions

### 1. Estructura de directorios para el frontend

```
scripts/cms/public/
├── index.html              ← Shell reducido (~50 líneas)
├── styles/
│   └── cms.css             ← Tokens, utilitarios y animaciones
├── components/
│   ├── App.js              ← Componente raíz (antes inline en index.html)
│   ├── Sidebar.js          ← (ya existe)
│   ├── FormFields.js       ← (ya existe)
│   ├── MarkdownEditor.js   ← (ya existe)
│   ├── i18n.js             ← (ya existe)
│   ├── MediaFolderNode.js  ← NUEVO: árbol de carpetas
│   ├── ImageUploaderModal.js  ← NUEVO: modal de carga
│   ├── FinalizarRedaccionModal.js ← NUEVO: modal squash
│   ├── LightboxModal.js    ← NUEVO: lightbox zoom
│   ├── DeleteConfirmationModal.js ← NUEVO: modal borrado
│   └── ToastContainer.js   ← NUEVO: sistema de toasts
├── services/
│   └── api.js              ← NUEVO: funciones fetch centralizadas
├── loader.gif
└── favicon.svg
```

**Rationale**: Separar por responsabilidad (estilos, componentes de UI, servicios de datos) es el estándar de facto en SPAs. Mantener los componentes existentes en su ubicación actual (`components/`) y solo agregar los nuevos garantiza cero disrupciones.

### 2. Comunicación entre módulos cargados dinámicamente

Los componentes cargados con `loadComponent()` no pueden importarse entre sí con `import`. Se seguirá el patrón existente:
- Cada componente recibe sus dependencias como **props** desde `App.js`.
- Los servicios (`api.js`) se cargan como un módulo más y se pasan como contexto o se exponen en `window.__cms` temporalmente.
- `MediaFolderNode` se inyecta a los modales que lo necesitan como prop.

**Alternativa descartada**: Usar `window` como bus de estado global — más frágil y difícil de depurar.

### 3. CSS externo con Tailwind CSS v4

El bloque `<style type="text/tailwindcss">` se moverá a `styles/cms.css`. Tailwind CSS v4 CDN procesa `<style type="text/tailwindcss">` y `<link>` con `type="text/tailwindcss"` automáticamente, por lo que el enlace será:
```html
<link rel="stylesheet" href="./styles/cms.css" type="text/tailwindcss">
```

**Rationale**: Mantener el procesamiento en vivo de Tailwind sin cambiar la infraestructura.

### 4. Estrategia de migración incremental

Se moverán los componentes de menor a mayor complejidad:
1. **Paso 1**: CSS → `styles/cms.css`
2. **Paso 2**: Componentes atómicos sin dependencias internas (`MediaFolderNode`, `ToastContainer`)
3. **Paso 3**: Modales independientes (`LightboxModal`, `DeleteConfirmationModal`)
4. **Paso 4**: Modales con lógica de API (`ImageUploaderModal`, `FinalizarRedaccionModal`)
5. **Paso 5**: Servicios de API (`services/api.js`)
6. **Paso 6**: Componente `App.js` (con carga de todos los módulos)
7. **Paso 7**: Limpieza de `index.html` a shell mínimo

Cada paso debe ser funcional y verificable antes de avanzar al siguiente.

## Risks / Trade-offs

- **[Orden de carga]** → Los módulos deben cargarse en secuencia correcta: primero servicios y componentes atómicos, luego los que dependen de ellos. Mitigación: `App.js` orquesta toda la carga con `Promise.all()` como ya lo hace.
- **[Babel Standalone overhead]** → Cada archivo `.js` nuevo es una llamada `fetch()` + transpilación. Mitigación: los archivos son pequeños (~2-8KB) y se cargan en paralelo; el overhead total es insignificante para un CMS local de desarrollo.
- **[Cache del navegador]** → Archivos JS estáticos podrían cachearse y no reflejar cambios. Mitigación: ya se sirven con `express.static()` sin headers de cache agresivos, y al ser un CMS de desarrollo, el impacto es nulo.
- **[Tailwind CSS en archivo externo]** → Verificar que `type="text/tailwindcss"` funciona en `<link>` tags además de `<style>` tags con Tailwind v4 CDN. Si no funciona, fallback: mantener un `<style>` mínimo en `index.html` que importe el archivo CSS con `@import`.
