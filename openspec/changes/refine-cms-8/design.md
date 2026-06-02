## Context

El CMS de desarrollo para el blog está operativo, pero necesita refinamientos para mejorar la usabilidad, consistencia y robustez en la gestión de recursos. Los problemas principales son el recorte de los tooltips de información de recursos, la falta de carga de imágenes estáticas ubicadas en la carpeta `public/` del blog, y un sistema tosco de confirmación de borrado (JS native alert). Además, el redactor carece de persistencia de sesión al recargar y control sobre sus últimas acciones locales no subidas en Git.

## Goals / Non-Goals

**Goals:**
*   **Visualización Correcta de Tooltips:** Asegurar que el tooltip de información técnica en las Cards de recursos se despliegue por encima del contenedor sin recortarse.
*   **Servicio Completo de Assets Estáticos:** Habilitar la carga directa de `/404.png`, `/soft-bg.png` y otros recursos en el CMS sirviendo la carpeta `public/` raíz del blog.
*   **Confirmación de Eliminación Amigable:** Sustituir `window.confirm` por un modal React personalizado que cargue `delete-resource.png` como cabecera.
*   **Persistencia del Estado del CMS:** Guardar en `localStorage` el último modo de trabajo (Editor o Biblioteca) y restablecerlo al recargar la página.
*   **Panel de Actividad de Sesión (Git Stack):** Implementar un visor de commits Git locales y un mecanismo para deshacer el último commit local (`git reset --hard HEAD~1`).
*   **Mejoras en el Editor Markdown:** Añadir un atajo para insertar imágenes en la barra de herramientas y sincronizar el registro de componentes con los componentes MDX reales del blog (`<TLDR>`, `<FAQs>`, `<Quote>`, `<References>`).

**Non-Goals:**
*   Deshacer acciones que involucren commits ya subidos al repositorio remoto (`origin/main`).
*   Soportar múltiples niveles de deshacer (undo recursivo más allá del último commit local interactivo).

## Decisions

### 1. Servicio de Assets Estáticos
Se configurará el servidor Express (`server.js`) para montar el directorio de assets públicos del blog.
*   **Alternativa A:** Copiar archivos de `public/` a la carpeta del CMS. (Inviable: duplica archivos y genera inconsistencia).
*   **Alternativa B (Elegida):** Servir estáticamente el directorio `BLOG_ROOT/public/` inmediatamente después del directorio público del CMS. De esta forma, el CMS podrá acceder a recursos como `/404.png` y `/soft-bg.png` de manera transparente.
    ```javascript
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(BLOG_ROOT, 'public')));
    ```

### 2. Panel de Actividad Local y Git Undo
Para ofrecer control sobre la actividad local en Git, se añadirán dos endpoints al servidor Express:
*   `GET /api/git-commits`: Obtiene la lista de commits locales no enviados al remoto usando `git log origin/main..HEAD --oneline` o similar.
*   `POST /api/git-undo`: Deshace el último commit en local con `git reset --hard HEAD~1`. Esto restaura físicamente los archivos. Se restringirá para ejecutar solo si existen commits en el stack local de forma que no afecte commits remotos.

### 3. Tooltip trapped in Grid/Card Container
El tooltip del botón de Info de cada Card de recurso se corta debido a que la tarjeta o el grid tienen `overflow: hidden` o restricciones de posicionamiento.
*   **Solución:** Modificar la Card para que la imagen tenga su propio contenedor con bordes redondeados y `overflow: hidden`, en lugar de aplicar `overflow: hidden` a toda la tarjeta. De esta manera, el contenedor principal de la tarjeta puede tener `overflow: visible`, permitiendo que el tooltip posicionado de forma absoluta se dibuje por fuera sin recortes.

### 4. Custom Delete Modal
Reemplazar el uso de `window.confirm` por un modal React personalizado que reciba el callback de eliminación. Se mostrará una imagen centralizada `delete-resource.png` en la parte superior del modal simulando un icono de advertencia.

### 5. Sincronización del Markdown Editor
*   Agregar un botón en la barra de herramientas del editor Markdown que inyecte `![Descripción](url)` en la posición actual del cursor.
*   Actualizar `componentsRegistry.json` con los esquemas de componentes listados en el `README.md` (`TLDR`, `FAQs`, `Quote`, `References`) para que la inserción de componentes especiales inserte la estructura MDX correcta.

## Risks / Trade-offs

*   **[Risk] Pérdida accidental de cambios no guardados al hacer git-undo.**
    *   *Mitigation:* El botón de "Quitar última acción" en el modal de Actividad advertirá explícitamente al usuario sobre los efectos destructivos de `git reset --hard` y requerirá una confirmación adicional.
*   **[Risk] Confusión entre commits locales y remotos.**
    *   *Mitigation:* Solo se mostrarán en la lista aquellos commits que pertenezcan al rango `origin/main..HEAD`. Si no hay commits locales pendientes de subir, el botón de "Quitar última acción" se deshabilitará.
