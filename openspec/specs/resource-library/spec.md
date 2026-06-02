# resource-library Specification

## Purpose
TBD - created by archiving change refine-cms-7. Update Purpose after archive.
## Requirements
### Requirement: Mapeo y navegación del árbol de la Biblioteca de Recursos
La Biblioteca de Recursos MUST mapear y listar recursivamente todos los archivos de recursos físicos ubicados en los directorios `src/assets/` y `public/` del blog. El sistema SHALL proveer una interfaz amigable compuesta por un árbol de directorios jerárquico que respete las subcarpetas físicas, y un panel de visualización en cuadrícula (Grid) segmentado semánticamente por la carpeta seleccionada en el árbol.

#### Scenario: Exploración recursiva de la estructura de recursos
- **WHEN** el usuario hace clic en un subdirectorio del árbol de la Biblioteca de Recursos
- **THEN** el sistema escanea recursivamente el directorio y muestra dinámicamente el listado de archivos correspondientes a esa carpeta en la cuadrícula de recursos.

---

### Requirement: CRUD completo de activos físicos con Auto-Commit en Git
El sistema MUST permitir la administración completa de los archivos multimedia (CRUD) de la Biblioteca de Recursos: agregar imágenes nuevas cargadas de la PC, reemplazar archivos existentes conservando el mismo nombre, eliminar físicamente recursos y renombrar archivos. Cada una de estas acciones SHALL ser persistida físicamente en el disco local y desencadenar un commit automático local en Git con el mensaje `docs (Recurso) - Alterar recurso [nombre]` para preparar la sesión local para su consolidación final.

#### Scenario: Reemplazo exitoso de recurso existente
- **WHEN** el usuario selecciona un recurso en la biblioteca y sube un nuevo archivo para sustituirlo
- **THEN** el sistema sobrescribe el archivo en el disco, registra un commit automático local en Git y refresca la vista previa del recurso en tiempo real.

#### Scenario: Eliminación física de un recurso
- **WHEN** el usuario confirma la eliminación de un recurso desde la interfaz
- **THEN** el sistema borra físicamente el archivo del disco local mediante `fs.unlinkSync`, registra un commit automático local en Git y lo elimina de la cuadrícula visual de la biblioteca.

---

### Requirement: Notificaciones de Toast animadas con audio-chime tierno
Cada acción de la Biblioteca de Recursos que altere datos (crear, renombrar, eliminar, reemplazar) MUST registrar la acción detalladamente en la consola de logs del CMS y mostrar un Toast animado de notificación. Además, la aparición de cada Toast SHALL emitir un sonido corto y tierno de campana/chime sintetizado en caliente mediante osciladores de la API de Web Audio para garantizar una interacción sensorial agradable.

#### Scenario: Notificación y sonido de éxito en modificación de datos
- **WHEN** el sistema completa exitosamente una operación de guardado o alteración de datos de un recurso
- **THEN** el CMS muestra un Toast animado en pantalla con el resultado, registra el log de la operación y reproduce un chime auditivo sintetizado mediante `AudioContext` en el navegador.

---

### Requirement: Tarjetas de Recursos con Opciones y Edición Directa de Nombres
Cada archivo multimedia de la cuadrícula de recursos MUST renderizarse dentro de una Card visual que exponga una miniatura de la imagen (con carga perezosa y fallback seguro), el nombre completo del archivo y un botón interactivo de 3 puntitos para desplegar un menú de acciones rápidas. Asimismo, el sistema SHALL permitir editar el nombre del archivo en caliente haciendo doble click directamente sobre la etiqueta de texto del nombre, convirtiéndose en un input editable que confirma e implementa el cambio al presionar la tecla `Enter`.

#### Scenario: Edición rápida de nombre del archivo con Enter
- **WHEN** el usuario hace doble clic sobre el nombre de una imagen en su Card, escribe `nuevo-nombre.png` y presiona la tecla `Enter`
- **THEN** el sistema procesa la solicitud, renombra físicamente el archivo en el disco local y actualiza de inmediato la etiqueta visual.

---

### Requirement: Vista Previa en Modal Dividido con Animación de Despeje
Al hacer clic sobre la imagen de una Card de recursos, el sistema MUST iniciar una animación fluida que desplace y despeje temporalmente las demás Cards de la cuadrícula, y abrir un modal interactivo de pantalla completa dividida (Split View): la imagen ampliada al lado izquierdo y sus metadatos y acciones en el lado derecho. En pantallas móviles de ancho menor o igual a 768px, este modal SHALL adaptarse dinámicamente transformándose en un layout de columna vertical con la imagen arriba y las acciones detalladas debajo.

#### Scenario: Apertura de modal en pantalla dividida en desktop
- **WHEN** el usuario hace clic en la imagen de una Card en una resolución de pantalla de 1440px
- **THEN** el sistema oculta suavemente las demás Cards del Grid y despliega el modal interactivo con la imagen en el panel izquierdo y los campos y acciones rápidas en el panel derecho.

---

### Requirement: Eliminación Rápida mediante Click Derecho con Marcadores
El sistema MUST dar soporte para un flujo de eliminación rápida de activos. Al hacer clic derecho (menú contextual nativo interceptado) sobre cualquier Card de recurso de la biblioteca, el CMS SHALL activar globalmente en todas las Cards un marcador visual de remoción (icono de basura `❌` o similar). Al pulsar el marcador de cualquier Card, se SHALL proceder con el borrado inmediato del archivo previa confirmación ágil.

#### Scenario: Activación de marcadores rápidos por click derecho
- **WHEN** el usuario hace clic derecho sobre la Card de un recurso
- **THEN** el sistema intercepta el menú contextual del navegador y dibuja en la esquina de todas las Cards del Grid un botón de borrado directo.

---

### Requirement: Guardado Dirigido en Navegador de Directorios
Al subir una nueva imagen desde la PC en la Biblioteca de Recursos, el sistema MUST proveer un diálogo o navegador de directorios interactivo que permita explorar las subcarpetas físicas existentes de `src/assets/` y `public/`, dando la capacidad al usuario de elegir exactamente en qué subcarpeta desea almacenar el nuevo archivo de imagen de forma dinámica.

#### Scenario: Selección de subcarpeta de destino para nueva subida
- **WHEN** el usuario inicia la subida de un archivo multimedia local y selecciona la subcarpeta `src/assets/images/posts/` en el árbol de directorios de subida
- **THEN** el sistema escribe físicamente el nuevo archivo en el subdirectorio físico especificado y refresca la vista de dicha carpeta.

---

### Requirement: Sincronización Rigurosa de Referencias por Renombrado (Dependency Tracker)
Cuando se modifica el nombre de un archivo multimedia o se altera su ubicación física mediante renombrado, el backend del CMS MUST realizar un rastreo riguroso y automatizado (Dependency Tracker) sobre todos los archivos de contenido `.md` y `.mdx` del blog en `src/content/`. El sistema SHALL buscar de forma exhaustiva todas las ocurrencias y referencias exactas del recurso renombrado en los metadatos frontmatter y el cuerpo de los posts, y actualizarlas de manera automática para garantizar que no existan enlaces ni imágenes rotas en el blog.

#### Scenario: Actualización automática de rutas en posts tras renombrar imagen
- **WHEN** el usuario renombra la imagen `/assets/images/posts/antigua.png` a `/assets/images/posts/nueva.png`
- **THEN** el sistema renombra el archivo físico en el disco y busca y reemplaza todas las cadenas `/assets/images/posts/antigua.png` o referencias equivalentes en el contenido de todos los posts locales en tiempo real, guardando los cambios y registrando los commits automatizados.

---

### Requirement: Marcadores de Peligro Radiactivo y Tooltip de Info
El sistema MUST realizar un análisis de dependencia de recursos escaneando cuántas veces se utiliza cada imagen en los contenidos del blog. Las Cards de recursos especiales o de alto uso SHALL mostrar un marco de advertencia animado a rayas diagonales:
1.  **Límite de Advertencia Amarillo-Negro**: Si el recurso se utiliza más de 10 veces en el blog (o si corresponde a archivos críticos del sistema como `404.png`).
2.  **Límite Crítico Rojo-Negro**: Si el recurso se utiliza más de 50 veces en el blog.
Ambos límites SHALL ser completamente parametrizables mediante un archivo de configuración `scripts/cms/config.json`. Asimismo, al lado del nombre de cada imagen, se SHALL incluir un botón de información interactivo `(i)` que, al hacer clic, despliegue un tooltip enriquecido exponiendo el conteo de usos exacto, nombre completo, extensión, tamaño del archivo en KB/MB y la ruta física absoluta.

#### Scenario: Carga de límites desde archivo de configuración
- **WHEN** el CMS inicializa la Biblioteca de Recursos
- **THEN** el backend lee los límites de usos configurados en `scripts/cms/config.json` y calcula para cada imagen su cantidad de usos, pintando el borde con rayas amarillo-negro para las de +10 usos y rojo-negro para las de +50 usos.

