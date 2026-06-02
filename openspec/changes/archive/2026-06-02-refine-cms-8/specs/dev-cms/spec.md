## ADDED Requirements

### Requirement: Botón de Inserción Rápida de Imagen en Toolbar
El editor Markdown del CMS local MUST incluir un botón en su barra de herramientas para la inserción rápida de imágenes en formato estándar de Markdown (`![Descripción de la imagen](url)`). Al presionar este botón, el sistema SHALL inyectar la sintaxis de imagen en la posición exacta del cursor.

#### Scenario: Inserción exitosa de sintaxis de imagen
- **WHEN** el usuario pulsa el botón de inserción de imagen en la barra de herramientas del editor Markdown
- **THEN** el sistema inserta el snippet `![Descripción de la imagen](url)` en la posición del cursor e inicia el foco en él.

---

### Requirement: Persistencia de Vista del CMS en LocalStorage
El sistema MUST guardar dinámicamente en `localStorage` la vista activa del CMS (Editor de Contenidos o Biblioteca de Recursos) tras cada conmutación realizada por el usuario. Al iniciar o recargar la aplicación web, el CMS SHALL leer esta preferencia persistida para restaurar de forma transparente la última sección de trabajo del redactor.

#### Scenario: Restauración de la vista al recargar
- **WHEN** el usuario se encuentra en la Biblioteca de Recursos y refresca el navegador
- **THEN** la aplicación lee el localStorage al montar y auto-selecciona e inicia la interfaz directamente en la Biblioteca de Recursos.

---

## MODIFIED Requirements

### Requirement: Menú de Componentes Personalizados en Toolbar
El editor Markdown del CMS local SHALL incluir una opción en su barra de herramientas llamada "Custom Components" que despliegue un menú dropdown con el listado de componentes MDX/Astro registrados. Cada ítem del dropdown debe mostrar un icono descriptivo y el nombre del componente.

#### Scenario: Inserción exitosa de componente
- **WHEN** el usuario selecciona un componente del dropdown de "Custom Components"
- **THEN** el sistema inserta el bloque de código de plantilla del componente en la posición exacta del cursor en el editor.
