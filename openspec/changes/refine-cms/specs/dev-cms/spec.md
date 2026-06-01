## ADDED Requirements

### Requirement: Atajos de Teclado en el Editor Markdown
El editor Markdown del CMS DEBE dar soporte para atajos de teclado estándar: Ctrl+Z para deshacer (undo) y Ctrl+Y para rehacer (redo) la última edición de texto efectuada.

#### Scenario: Deshacer texto con Ctrl+Z
- **WHEN** el desarrollador pulsa el atajo de teclado Ctrl+Z dentro del área de texto del editor Markdown
- **THEN** el editor revierte el texto al estado anterior de la última edición efectuada

#### Scenario: Rehacer texto con Ctrl+Y
- **WHEN** el desarrollador pulsa el atajo de teclado Ctrl+Y dentro del área de texto del editor Markdown
- **THEN** el editor restablece el texto al estado posterior antes de la última operación de deshacer

### Requirement: Explorador de Contenidos en Árbol (Folder-based)
El Sidebar de navegación del CMS DEBE renderizar un árbol de contenidos jerárquico e interactivo en lugar de una lista plana. Este árbol DEBE respetar y reflejar las subcarpetas físicas dentro de `src/content/` de forma recursiva, mostrando carpetas como desplegables interactivos y exponiendo el conteo total consolidado de archivos.

#### Scenario: Navegar por estructura de carpetas recursiva
- **WHEN** el desarrollador despliega una subcarpeta en la UI del explorador en árbol del CMS
- **THEN** el sistema revela de forma dinámica los archivos de contenido y subdirectorios anidados contenidos en ella, manteniendo el conteo de recursos del directorio padre intacto

### Requirement: Internacionalización (i18n)
La interfaz de usuario del CMS DEBE proveer soporte multilingüe nativo para los idiomas **Inglés** y **Español** mediante un selector interactivo.

#### Scenario: Cambiar idioma de la UI en tiempo real
- **WHEN** el desarrollador selecciona "EN" (English) en el selector de idioma de la UI
- **THEN** todas las etiquetas, campos de formularios y encabezados del CMS cambian instantáneamente al inglés

### Requirement: Carga Multimodal de Imágenes
Para cada campo de imagen en los metadatos del frontmatter, el CMS DEBE proveer tres opciones interactivas de carga:
1.  Escritura o pegado directo de la URL en el input.
2.  Carga de un archivo local de la PC mediante un File Uploader, abriendo un modal que permite seleccionar la ruta física en el repositorio donde se guardará el archivo de imagen.
3.  Ingreso de una URL externa absoluta.

#### Scenario: Subir imagen local desde la PC
- **WHEN** el desarrollador selecciona "Subir Imagen" e interactúa con el File Uploader del CMS
- **THEN** el CMS abre un modal permitiendo definir la ruta de guardado (dentro de `src/assets/` o similar) y escribe físicamente el archivo de imagen en el repositorio local, actualizando la propiedad del frontmatter

## MODIFIED Requirements

### Requirement: Edición Visual y Persistencia en Tiempo Real
El sistema DEBE proveer una interfaz web interactiva con formularios estructurados basados en los esquemas de frontmatter (Zod) de cada colección y un editor de texto enriquecido para el cuerpo Markdown. El CMS DEBE escribir directamente los cambios en los archivos físicos `.md` y `.mdx` en tiempo real sin base de datos.
**Formateo Estricto de YAML**:
1.  El campo `description` DEBE guardarse estrictamente en una sola línea y envuelto en comillas dobles (`"description"`) para evitar roturas de sintaxis multilínea.
2.  Las propiedades de texto general DEBE serializarse como cadenas de comillas dobles (`"texto"`).
3.  El campo `tags` de todas las colecciones DEBE guardarse como un array clásico de strings YAML (`tags: ["ia", "seo"]`), omitiendo el formato de lista con guiones.
4.  El campo `imagenes` de proyectos DEBE guardarse como un array clásico de strings YAML (`imagenes: ["ruta1", "ruta2"]`).

#### Scenario: Guardado estricto de YAML
- **WHEN** el desarrollador edita la descripción o tags de una entrada y hace clic en "Guardar"
- **THEN** el CMS reescribe el archivo físico en `src/content/` formateando la descripción en una sola línea con comillas dobles, los tags como un array de strings en una línea (`tags: ["a", "b"]`) y los textos entre comillas dobles

### Requirement: Lienzo de Edición CRUD Adaptativo
El CMS DEBE proveer un panel interactivo compuesto por un Sidebar izquierdo y un Canvas central que adapta dinámicamente su formulario de metadatos.
**Campos Faltantes y de Control**:
*   Si una colección no cuenta con un atributo declarado en su frontmatter (como el campo `layout` en blog, o `image` en una entrada), el CMS DEBE de todas formas renderizar el campo de texto vacío en el formulario de la UI listo para rellenarse y ser autoguardado.
*   El logotipo visual principal del Sidebar DEBE renombrarse de "Yamil Ayma" a "Mi Blog".
*   La app del CMS DEBE cargar e integrar el archivo `/favicon.svg` del blog como el icono del CMS.

#### Scenario: Autocompletado de campos omitidos
- **WHEN** el desarrollador abre una entrada del blog que carece del campo `layout` en su frontmatter original
- **THEN** la interfaz del CMS expone de todas formas el input editable correspondiente a `layout` vacío para su inserción

## REMOVED Requirements

### Requirement: Vista Previa del editor Markdown
**Reason**: Se remueve para optimizar el espacio de edición del texto en pantalla y evitar sobrecarga visual redundante, delegando la vista de previsualización al entorno local de desarrollo de Astro en caliente.
**Migration**: Ninguna.
