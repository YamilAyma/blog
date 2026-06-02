## MODIFIED Requirements

### Requirement: Desacoplamiento modular del backend Express
El backend del CMS local SHALL estar modularizado pragmáticamente separando responsabilidades en submódulos internos ES6 independientes bajo la carpeta `scripts/cms/api/`: `git.js`, `yamlFormatter.js`, `content.js` y `media.js`. Adicionalmente, el **frontend** del CMS SHALL seguir el mismo principio de modularidad: la SPA React embebida en `index.html` se descompondrá en archivos CSS, componentes `.js` y servicios independientes bajo `scripts/cms/public/`, cargados dinámicamente con el sistema `loadComponent()` existente. El archivo `index.html` se reducirá a un shell mínimo que solo declare CDNs, enlace el CSS externo, y monte el componente raíz `App.js`.

#### Scenario: Enlace modular de rutas en Express
- **WHEN** se arranca el servidor local `npm run cms`.
- **THEN** `server.js` importa asíncronamente los submódulos de la API, monta las rutas Express delegando el procesamiento lógico a cada submódulo especializado, manteniendo el archivo de arranque limpio y legible.

#### Scenario: Frontend modular con carga dinámica
- **WHEN** el navegador carga `index.html` del CMS.
- **THEN** el archivo HTML DEBE contener únicamente CDNs, enlace al CSS externo, el div `#root` y un script de arranque que cargue `App.js`. Todos los componentes, modales y servicios de API se cargan como módulos `.js` independientes mediante `loadComponent()`.
