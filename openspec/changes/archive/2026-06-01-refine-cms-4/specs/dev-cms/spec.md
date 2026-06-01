## ADDED Requirements

### Requirement: Menú de Componentes Personalizados en Toolbar
El editor Markdown del CMS local SHALL incluir una opción en su barra de herramientas llamada "Custom Components" que despliegue un menú dropdown con el listado de componentes MDX/Astro registrados. Cada ítem del dropdown debe mostrar un icono descriptivo y el nombre del componente.

#### Scenario: Inserción exitosa de componente
- **WHEN** el usuario selecciona un componente del dropdown de "Custom Components".
- **THEN** el sistema inserta el bloque de código de plantilla del componente en la posición exacta del cursor en el editor.

---

### Requirement: Interfaz de Documentación y Modal de Ayuda
El sistema SHALL proveer una especificación en formato JSON que liste y documente cada componente personalizado (nombre, icono, descripción, propiedades y ejemplo de uso). Al lado del dropdown en el toolbar, se SHALL incluir un botón con el icono de interrogación `?` que, al ser presionado, despliegue un modal interactivo con la documentación detallada del componente seleccionado.

#### Scenario: Visualización de ayuda de componente
- **WHEN** el usuario hace clic en el botón `?` de ayuda junto a un componente seleccionado.
- **THEN** el sistema abre un modal animado mostrando la descripción, las propiedades del componente y un ejemplo real de su código MDX de uso.

---

### Requirement: Vista Previa en Tiempo Real Sincronizada (Live Preview)
El CMS SHALL ofrecer un modo de "Vista Previa" mediante un panel dividido (Split Pane) de dos columnas (Editor / Preview) que renderice el contenido del editor en tiempo real. 

#### Scenario: Renderizado reactivo local
- **WHEN** el usuario edita el texto Markdown o introduce un componente en el editor en tiempo real.
- **THEN** el sistema procesa el texto mediante un parser liviano e interactivo en el cliente y renderiza visualmente el resultado de forma instantánea en la columna de la derecha, simulando la apariencia del componente.

---

### Requirement: Iframe Astro Dev HMR Sincronizado
La sección de vista previa SHALL incluir una pestaña alternativa para cargar el iframe real del blog de desarrollo ejecutado por Astro (`http://localhost:4321/[colección]/[slug]`).

#### Scenario: Recarga de iframe Astro al guardar
- **WHEN** el usuario realiza cambios, pulsa "Guardar Cambios" y la pestaña del iframe Astro está activa.
- **THEN** el sistema guarda el archivo en el disco, lo cual activa el HMR de Astro, y recarga de forma transparente el iframe para reflejar el diseño final exacto del blog.

#### Scenario: Archivo no guardado deshabilitado
- **WHEN** el archivo de contenido es nuevo o no se ha persistido en disco y el usuario intenta activar la vista previa real de Astro.
- **THEN** el sistema mantiene deshabilitado el botón de la vista de iframe real, mostrando un tooltip al pasar el ratón que indica: "El contenido no existe aún en disco. Guarda el archivo para poder previsualizarlo".
