## 1. Configuración Inicial e Infraestructura

- [x] 1.1 Crear la estructura física de directorios para la utilidad local del CMS bajo `scripts/cms/`
- [x] 1.2 Instalar las dependencias de soporte necesarias para el servidor del CMS local (`express`, `yaml`, `open`, etc.)
- [x] 1.3 Incorporar el comando ejecutable `"cms": "node scripts/cms/server.js"` dentro de la sección de scripts de `package.json`

## 2. API REST del Servidor CMS (Node/Express)

- [x] 2.1 Implementar endpoint de lectura global para escanear y listar dinámicamente todos los archivos `.md` y `.mdx` contenidos en `src/content/` agrupados por colección
- [x] 2.2 Implementar endpoint detallado para leer un archivo específico, extrayendo el contenido y parseando el frontmatter YAML mediante la librería de YAML
- [x] 2.3 Implementar endpoint de persistencia física para reescribir un archivo existente, codificando metadatos YAML correctos y guardando los cambios de inmediato
- [x] 2.4 Implementar endpoint de creación para generar un archivo nuevo con el frontmatter por defecto pre-poblado basándose en la colección seleccionada

## 3. Interfaz de Usuario del CMS (Desarrollo Local)

- [x] 3.1 Construir el panel de control web del CMS con visualización de listados, filtros rápidos de búsqueda y formularios interactivos para metadatos (inputs para tags, checkbox para `published`, selecciones de categorías)
- [x] 3.2 Implementar un editor Markdown visual interactivo con vista previa y botón de guardado en la interfaz de la página
- [x] 3.3 Conectar los componentes e interacciones de la interfaz de usuario web local con la API REST del servidor mediante flujos asíncronos (`fetch`)

## 4. Pruebas y Validación

- [x] 4.1 Verificar que la ejecución de `npm run cms` abre de forma automática el navegador en el puerto local y carga todas las colecciones correctamente
- [x] 4.2 Probar la escritura en caliente modificando una bitácora o post en la UI y validando que el archivo físico local se reescribe conservando la integridad de sus esquemas Zod
- [x] 4.3 Ejecutar `npm run build` en el blog y comprobar que el directorio distributivo productivo final `dist/` no incluye ningún archivo, script o dependencia perteneciente al CMS
