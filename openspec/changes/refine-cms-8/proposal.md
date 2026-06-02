## Why

El CMS de desarrollo ha incorporado grandes capacidades de biblioteca de recursos en la iteración anterior, pero aún presenta pequeños fallos y carece de integración de historial de Git interactivo y atajos rápidos del editor. Específicamente, el tooltip de la Card de recurso se corta debido a la propiedad overflow del Grid, las imágenes físicas de `public/` (como `404.png` y `soft-bg.png`) no cargan porque Express no sirve el directorio `public/` del blog, y el diálogo de borrado usa confirmaciones javascript del navegador poco estilizadas. Además, los redactores necesitan que el CMS recuerde su último modo de trabajo (Editor o Biblioteca), un botón para insertar imágenes en la barra de herramientas del editor Markdown, la base de datos de componentes MDX sincronizada con los componentes reales (`README.md`), y una vista de Actividad para auditar los commits locales y poder deshacer (undo) la última acción directamente desde el CMS.

## What Changes

*   **Arreglo de Tooptip Cortado**: Solucionar el estilo del tooltip `(i)` de metadatos en las Cards para evitar que sea recortado por el contenedor de la tarjeta, garantizando una visualización correcta.
*   **Servicio de Assets de `public/`**: Configurar el backend Express para servir estáticamente la carpeta `public/` del blog, permitiendo que recursos críticos como `/404.png` y `/soft-bg.png` se carguen de inmediato en la UI.
*   **Nota Contextual en Biblioteca**: Añadir una advertencia en la Biblioteca de Recursos recordando que las imágenes escritas en formato Markdown directo (inline) no se auto-renombran por el Dependency Tracker.
*   **Modal de Confirmación de Borrado Custom**: Reemplazar el `window.confirm` clásico por un modal React estilizado que muestre la ilustración `delete-resource.png` arriba como icono.
*   **Persistencia de Modo en LocalStorage**: Guardar el modo activo del CMS (Editor o Biblioteca) en localStorage para recordar y restablecer la vista de trabajo al recargar la página.
*   **Modo de Actividad de Sesión y Git Undo Stack**:
    *   Agregar un botón con icono de portapapeles `📋` a la izquierda del selector flotante de vistas.
    *   Este botón abrirá un modal de Actividad que lista los commits Git locales realizados en la sesión que no hayan sido pusheados (`origin/main..HEAD`).
    *   Incluir un botón de "Quitar última acción" que deshaga el último commit local y revierta (rollback/hard-reset) los archivos físicamente a su estado original.
*   **Toolbar del Editor y Componentes Sincronizados**:
    *   Añadir el botón de inserción rápida de imagen (`![Alt](url)`) en la toolbar de `MarkdownEditor.js`.
    *   Actualizar `componentsRegistry.json` y la ayuda del editor con los componentes MDX reales del blog (`<TLDR>`, `<FAQs>`, `<Quote>`, `<References>`) descritos en el `README.md`.

## Capabilities

### New Capabilities
<!-- None, we are refining existing -->

### Modified Capabilities
- `dev-cms`: Refinar el editor, toolbar de Markdown, base de datos de componentes personalizados y configuración persistente.
- `resource-library`: Solucionar el servicio de imágenes físicas del blog, tooltips de Cards, modales de confirmación personalizados y el stack de actividad de Git.

## Impact

*   **scripts/cms/server.js**: Servir estáticamente `BLOG_ROOT/public/` e implementar los endpoints `/api/git-commits` y `/api/git-undo`.
*   **scripts/cms/api/componentsRegistry.json**: Reemplazar con la definición exacta de componentes MDX del blog.
*   **scripts/cms/public/**:
    *   **components/App.js**: Transiciones y botón selector de Actividad.
    *   **components/ResourceLibrary.js**: Corregir tooltip, custom confirm delete modal, y tip contextual.
    *   **components/MarkdownEditor.js**: Agregar botón de insertar imagen.
    *   **styles/cms.css**: Estilos de tooltips fijos, marcos de modal de borrado e interfaz de commits de Git.
