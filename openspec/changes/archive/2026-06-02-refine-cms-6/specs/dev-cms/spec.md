## ADDED Requirements

### Requirement: Vista previa visual de imágenes locales a cargar
El modal de subida de imágenes SHALL mostrar una previsualización de la imagen cargada localmente en tiempo real antes de presionar el botón para confirmar la subida.

#### Scenario: Vista previa en caliente antes de confirmación
- **WHEN** el usuario selecciona una imagen local desde su ordenador en el modal de carga (ya sea arrastrando o usando el input file)
- **THEN** el modal de subida de imágenes SHALL mostrar una previsualización de la imagen cargada en tiempo real antes de presionar el botón "Cargar"

### Requirement: Selector de assets existentes con botón Escoger
El CMS SHALL ofrecer un botón interactivo llamado "Escoger" al lado de las opciones de subida local, que despliegue un modal con el árbol físico de directorios e imágenes de `src/assets/` y permita explorar, previsualizar en tiempo real y seleccionar una imagen existente para autocompletar la ruta en el campo del frontmatter.

#### Scenario: Apertura y exploración del árbol de assets existentes
- **WHEN** el usuario hace click en el botón "Escoger" en el panel de subida de imágenes
- **THEN** el sistema SHALL abrir un modal interactivo de navegación de assets que cargue el árbol físico de directorios e imágenes de `src/assets/`
- **AND** el botón de confirmación de subida local SHALL renombrarse a "Cargar"

#### Scenario: Vista previa en tiempo real de imagen seleccionada del árbol
- **WHEN** el usuario selecciona un archivo de imagen en el árbol de assets de imágenes existentes
- **THEN** el sistema SHALL mostrar una vista previa visual instantánea de la imagen seleccionada en caliente y autocompletar su ruta de asset en el campo al confirmar

### Requirement: Corrección de Tags con espacios y comas
El CMS SHALL limpiar y estructurar adecuadamente las etiquetas ingresadas por el usuario, permitiendo el ingreso de comas o espacios de forma fluida para delimitar múltiples tags sin alterar el array estructurado del frontmatter.

#### Scenario: Entrada de tags separada por espacios o comas
- **WHEN** el usuario introduce múltiples etiquetas en el campo de `tags` separadas por comas o espacios en el CMS
- **THEN** el sistema SHALL formatear y limpiar cada tag eliminando espacios en blanco innecesarios y convirtiendo la entrada en un array de strings limpio para persistirse en el frontmatter MDX

### Requirement: Layout principal responsivo en el CMS
El layout principal del CMS SHALL ser completamente responsivo para garantizar una correcta usabilidad en tablets y dispositivos portátiles de pantalla pequeña.

#### Scenario: Adaptabilidad del layout a pantallas móviles
- **WHEN** el ancho del viewport disminuye a un tamaño menor o igual a 1024px
- **THEN** el layout principal del CMS SHALL cambiar de su diseño tradicional de dos columnas en fila (Sidebar / Formulario) a un diseño en columna apilada para optimizar la experiencia de usuario
