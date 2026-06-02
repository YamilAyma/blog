## Context

Para robustecer la base del CMS local de desarrollo (`dev-cms`), se requiere implementar mejoras críticas en usabilidad y modularidad técnica. El sistema actual opera en un único archivo web gigante (`index.html`) que contiene todo el frontend de React. Esta iteración propone modularizar el código del frontend mediante importaciones nativas ESM del navegador para no introducir un bundler pesado, generalizar el formateador YAML del backend para evitar roturas sintácticas y añadir componentes interactivos enriquecidos para la gestión de imágenes y árboles de navegación física.

## Goals / Non-Goals

**Goals:**
*   Implementar un historial interactivo en el cliente para dar soporte a deshacer (Ctrl+Z) y rehacer (Ctrl+Y) en el editor.
*   Reestructurar el Sidebar para proveer un explorador jerárquico de carpetas recursivo con conteo consolidado de recursos.
*   Garantizar la integridad sintáctica de los archivos en `src/content/` forzando un formateo YAML clásico estricto (comillas dobles y arrays en línea).
*   Proveer traducción en tiempo real de la UI para idiomas Español e Inglés (i18n).
*   Modularizar el frontend desacoplando componentes en archivos independientes servidos dinámicamente mediante módulos ESM.
*   Implementar un cargador local de imágenes que escriba archivos físicos en el repositorio.

**Non-Goals:**
*   Introducir herramientas pesadas de compilación local para el CMS (como Webpack o Vite) que requieran procesos de construcción adicionales.
*   Soportar bases de datos externas.

## Decisions

### 1. Modularización del Frontend mediante Componentes ESM Nativos
Para evitar dependencias de compilación y mantener la ligereza de `npm run cms`, el código React se modularizará separando responsabilidades en la carpeta `scripts/cms/public/components/`:
*   `Sidebar.js`: Componente del explorador en árbol de colecciones y recursos.
*   `FormFields.js`: Formularios adaptativos según Zod schemas.
*   `MarkdownEditor.js`: Área de texto del editor con barra de formato y atajos.
*   `ImageUploader.js`: Diálogo modal de carga multimodal de imágenes.
*   `i18n.js`: Diccionario multilingüe de idiomas.
*   **Razón**: El uso de módulos ESM nativos del navegador (`<script type="text/babel" src="..." defer>`) permite cargar de forma limpia e independiente componentes React modularizados sin necesidad de configurar compiladores o empaquetadores locales, asegurando legibilidad, mantenibilidad y calidad en el código.

### 2. Historial de Edición Ligero (React State Undo/Redo)
Para implementar Ctrl+Z y Ctrl+Y en el editor, el componente `MarkdownEditor` mantendrá internamente un historial de estados:
*   **Estructura**: Dos pilas simples en el estado de React: `undoStack` (estados anteriores de texto) y `redoStack` (estados posteriores de texto).
*   **Captura**: Escucha del evento `keydown` en el elemento `textarea`. Al detectar Ctrl+Z o Ctrl+Y, previene el comportamiento por defecto y recupera de forma programática el estado correspondiente del historial, reposicionando el cursor de texto de manera limpia.

### 3. API REST y Renderizado Recursivo de Árboles
Para la visualización de subcarpetas en el Sidebar:
*   **Backend**: La API `/api/content` se actualizará para devolver un objeto de árbol recursivo, donde cada nodo representa una subcarpeta física o un archivo, calculando de manera consolidada y acumulativa el número de archivos.
*   **Frontend**: Se creará un componente React recursivo `<FolderTree />` en `Sidebar.js` que se llama a sí mismo para renderizar subcarpetas como elementos colapsables con animaciones de transición.

### 4. Serialización YAML Estricta (Format-Safe js-yaml/yaml)
Para garantizar la compatibilidad absoluta del frontmatter y evitar que el formateador rompa la validación de Astro:
*   **Tratamiento de Comillas y Arrays**: El motor de persistencia del backend de Express (`server.js`) configurará el stringificador de YAML para forzar el formato en línea clásico de arrays (`tags: ["ia", "seo"]`) en lugar de listas en bloque de múltiples líneas.
*   **Tratamiento de Cadenas**: El backend limpiará los saltos de línea del campo `description` y forzará la codificación entre comillas dobles (`"description text"`), impidiendo que se graben bloques multilínea propensos a roturas.

### 5. API de Subida de Imágenes Locales (`/api/media`)
*   Se implementará un endpoint POST `/api/media` en el servidor Express utilizando un cargador de archivos sencillo en Node.js (como `multer` o procesando el búfer Base64 directo).
*   El frontend abrirá un modal de diálogo donde el desarrollador podrá subir una imagen física desde su PC y especificar el directorio de destino dentro de `src/assets/images/`. Al subirla con éxito, el servidor escribe el archivo y el CMS vincula automáticamente la ruta relativa en el campo del frontmatter.

## Risks / Trade-offs

*   **[Riesgo: Consistencia del YAML al serializar]**
    *   *Mitigación*: Se realizarán pruebas exhaustivas de lectura y escritura consecutivas para asegurar que el stringificador de YAML no altere ni alterne entre listas de bloque y arrays de strings en líneas de forma inesperada.
*   **[Riesgo: Rendimiento al Cargar Módulos ESM en Navegadores]**
    *   *Mitigación*: Se mantendrá un número acotado de archivos de componentes independientes para evitar múltiples peticiones HTTP consecutivas en red de desarrollo local, asegurando tiempos de carga menores a 300ms.
