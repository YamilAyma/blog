## Why

El CMS local de desarrollo del blog actual cuenta con un gran panel para editar entradas de texto, pero carece de un sistema integral y dedicado para la gestión visual de recursos multimedia y activos físicos (imágenes, SVGs y archivos en las carpetas `src/assets/` y `public/`). Los redactores no pueden explorar interactivamente la biblioteca de recursos independiente del flujo de posts, realizar operaciones CRUD directas sobre imágenes, ni renombrar archivos de forma segura sin romper referencias activas en otros artículos del blog. Además, el menú hamburguesa requiere reubicarse en el lateral derecho para alinearse con los estándares y se desea proveer una experiencia de usuario altamente fluida, onírica y agradable a través de transiciones suaves de cambio de modo.

## What Changes

*   **Reposicionamiento de Hamburguesa**: Reubicar el menú de hamburguesa flotante en la esquina inferior derecha (anteriormente en la izquierda).
*   **Selector Flotante de Biblioteca (Modos de Trabajo)**: Añadir un botón flotante estilizado con el icono `🖼️` al lado de la hamburguesa para alternar entre la vista del Editor de Contenidos y la Biblioteca de Recursos. Al entrar a la biblioteca, el icono cambia a `✍️`.
*   **Transición Onírica de Desenfoque**: Implementar una animación de transición visual con filtro de desenfoque (`blur`) y opacidad progresiva de 2 segundos al rotar y alternar entre los dos modos de trabajo del CMS.
*   **Biblioteca de Recursos Integral**:
    *   **Navegación e Interfaz**: Proveer un explorador jerárquico que mapee de forma amigable todas las carpetas físicas y archivos de imagen en `src/assets/` y `public/` del blog.
    *   **Notificaciones Auditivas**: El sistema emitirá sonidos tiernos sintetizados dinámicamente con la API de Web Audio en cada acción que altere datos e inicie notificaciones Toast.
    *   **Operaciones CRUD de Recursos**: Habilitar el reemplazo de imágenes, subida de nuevos recursos y eliminación física directa.
    *   **Visualización en Tarjetas**: Renderizar cada imagen en una Card con menú interactivo de 3 puntitos.
    *   **Previsualización Dinámica con Modal Dividido**: Al presionar una Card, se despejarán las demás mediante animación fluida y se abrirá un visor interactivo que divide la pantalla (imagen al lado izquierdo y metadatos/acciones a la derecha; apilamiento vertical en móviles).
    *   **Edición Rápida**: Habilitar la eliminación mediante click derecho con marcadores y la edición directa de nombre del archivo multimedia con doble click y confirmación con tecla `Enter`.
    *   **Sistema Riguroso de Dependencias de Recursos**: Cuando se altere el nombre de una imagen, el backend del CMS buscará automáticamente todas las ocurrencias y referencias exactas en las entradas de contenido `.md` y `.mdx` del blog, renombrándolas en caliente para evitar enlaces rotos.
    *   **Marcadores Radiactivos y Tooltips de Info**:
        *   Imágenes con +10 usos en el blog obtendrán un borde decorativo estilo radiactivo amarillo-negro.
        *   Imágenes con +50 usos obtendrán un borde rojo-negro.
        *   Los límites serán configurables mediante un archivo de configuración JSON local en el CMS.
        *   Un botón de info `i` desplegará un tooltip con metadatos extendidos (usos en el blog, tamaño en KB/MB, carpeta y extensión).

## Capabilities

### New Capabilities
- `resource-library`: Gestión visual, operaciones CRUD, notificaciones y sincronización automática de referencias del catálogo de recursos físicos del blog.

### Modified Capabilities
- `dev-cms`: Refinar el diseño, accesos flotantes, copys y transiciones estéticas de cambio de modo de trabajo en el panel principal.

## Impact

*   **scripts/cms/server.js** y **scripts/cms/api/**: Añadir endpoints de CRUD de recursos, escaneo de referencias de archivos cruzadas en contenidos, carga de configuraciones de límites radiactivos y listado de dependencias.
*   **scripts/cms/public/**:
    *   **components/App.js**: Para orquestar la transición de blur de 2s y coordinar el switch entre Biblioteca y Editor.
    *   **components/ResourceLibrary.js** [NEW]: Componente raíz de la nueva biblioteca de activos.
    *   **styles/cms.css**: Estilos responsivos, marcos radiactivos animados, transiciones oníricas y visualizaciones fluidas.
