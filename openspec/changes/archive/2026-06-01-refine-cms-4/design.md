## Context

Para mejorar la eficiencia en la redacción de contenidos ricos en MDX y Astro, esta cuarta iteración del CMS de desarrollo propone centralizar e integrar la inserción de componentes personalizados (Custom Components) directamente en el editor de Markdown. A su vez, se habilita una base de datos de documentación viva en JSON para orientar al escritor sobre el uso de cada componente y se implementa una vista previa dual sincronizada (Split Pane en tiempo real junto a un iframe Astro HMR sincronizado) que simula y muestra exactamente el resultado visual final del blog de desarrollo.

## Goals / Non-Goals

**Goals:**
*   Registrar de forma estructurada los componentes MDX/Astro permitidos mediante un archivo JSON que sirve de base de datos viva.
*   Crear un dropdown interactivo en la barra de herramientas del editor que inserte la plantilla del componente elegido en la posición actual del cursor.
*   Diseñar un botón interactivo de ayuda `?` que despliega un modal con la documentación, propiedades y ejemplo práctico del componente.
*   Implementar una Vista Previa de doble columna (Split Pane) con dos pestañas de visualización:
    *   **Vista Rápida**: Parser en cliente que procesa instantáneamente Markdown y MDX simulando visualmente los componentes.
    *   **Vista Real (Astro)**: Iframe sincronizado con el puerto de desarrollo de Astro (`http://localhost:4321`) que recarga automáticamente al guardar cambios físicos en disco.
*   Deshabilitar el Iframe de Astro en caliente si el archivo de contenido es nuevo y no se ha guardado físicamente en disco aún, guiando al desarrollador mediante un tooltip.

**Non-Goals:**
*   Construir un compilador MDX completo en caliente en el cliente del CMS (lo cual requeriría importar motores pesados de bundling como Vite en el cliente).
*   Soportar edición visual del tipo WYSIWYG que altere la naturaleza del código Markdown puro del archivo.

## Decisions

### 1. Registro Centralizado en JSON y API de Componentes
*   **Decisión**: Crear un archivo de registro JSON `scripts/cms/api/componentsRegistry.json` que define la taxonomía de los componentes MDX/Astro autorizados del blog (ej: `Badge`, `Alert`, `Card`, `Grid`, `Collapsible`).
*   **Formato de Registro**:
    ```json
    {
      "components": [
        {
          "name": "Badge",
          "icon": "🏷️",
          "description": "Etiqueta visual pequeña para destacar categorías o estados.",
          "properties": [
            { "name": "text", "type": "string", "required": true, "description": "Texto a mostrar en la etiqueta" },
            { "name": "type", "type": "string", "required": false, "description": "Estilo visual: info, success, warning, danger" }
          ],
          "template": "<Badge text=\"Ejemplo\" type=\"info\" />",
          "example": "<Badge text=\"Astro\" type=\"success\" />"
        }
      ]
    }
    ```
*   **Endpoint del Servidor**: Se creará una ruta `GET /api/custom-components` en `content.js` que lee y entrega esta base de datos en formato JSON para que sea consumida por la SPA del CMS.

### 2. Barra de Herramientas y Dropdown en el Editor
*   **Decisión**: Añadir un selector `<select>` estilizado en la barra de herramientas superior del editor Markdown en `MarkdownEditor.js`.
*   **Inserción en Cursor**: Se calcula la posición del cursor (`selectionStart` y `selectionEnd`) en el elemento `<textarea>` para inyectar de forma quirúrgica el texto de plantilla (`template`) y reenfocar el editor.

### 3. Modal de Ayuda de Componentes
*   **Decisión**: Junto al dropdown en el toolbar se integrará un botón `?`. Al presionarse, lee el componente actualmente seleccionado y despliega un modal centrado con animación suave.
*   **Estructura del Modal**: Muestra de forma estética el nombre con icono, una tabla con las propiedades soportadas, su tipo, obligatoriedad y descripción, y un bloque de código MDX de ejemplo listo para copiar y pegar.

### 4. Vista Previa Sincronizada en Panel Dividido (Split Pane)
*   **Decisión**: La vista principal de edición del CMS se dividirá en una distribución de 2 columnas ajustables (50/50) al activar el modo de visualización.
*   **Dualidad de Pestañas en Preview**:
    1.  **Vista Rápida (Instantánea)**: El CMS ejecuta un parser de Markdown en el cliente que transforma texto plano en HTML estructurado y mapea de forma reactiva las etiquetas de componentes personalizados (como `<Badge />`) a contenedores estilizados en CSS con los colores y formas correctas del blog. Da respuesta inmediata al escribir.
    2.  **Vista Real (Astro Iframe)**: Se carga un `<iframe>` que apunta a `http://localhost:4321/[colección]/[slug]`.
        *   Al guardar los cambios físicos con "Guardar Cambios" y persistirse en disco, Astro regenera el HMR del archivo de inmediato. El CMS detecta el guardado exitoso y realiza una recarga automática del iframe de Astro.
*   **Protección contra Archivos Inexistentes**: Si el archivo es nuevo y no se ha guardado, el botón de Vista Astro estará deshabilitado con opacidad y un tooltip estético en hover indicará: *"El contenido no existe en disco. Guarda el archivo para poder previsualizarlo en vivo"*.

## Risks / Trade-offs

*   **[Riesgo: HMR de Astro no responde o el puerto está cerrado]**
    *   *Mitigación*: La Vista Rápida local del cliente proveerá una previsualización de respaldo reactiva en todo momento, garantizando que el redactor pueda continuar escribiendo e insertando componentes incluso si el dev server de Astro no está encendido en segundo plano.
*   **[Riesgo: Colisiones de HMR con múltiples recargas del iframe]**
    *   *Mitigación*: El recargado del iframe en el guardado se controlará mediante un breve retardo (`setTimeout` de 300ms) para dar tiempo a Astro a compilar la estructura MDX antes de refrescar el navegador embebido.
