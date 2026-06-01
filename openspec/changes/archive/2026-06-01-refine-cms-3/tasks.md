## 1. Modularización y Refactorización del Backend

- [x] 1.1 Crear directorio de submódulos `scripts/cms/api/` y los archivos ES6 base: `git.js`, `yamlFormatter.js`, `content.js` y `media.js`
- [x] 1.2 Mudar la lógica de parseado, stringificación AST YAML y sanitización de paths al módulo `yamlFormatter.js`
- [x] 1.3 Mudar la lógica de subida de imágenes, escaneo y creación de carpetas de media al módulo `media.js`
- [x] 1.4 Mudar la lógica de escaneo recursivo, lectura, guardado y borrado de contenidos a `content.js`
- [x] 1.5 Implementar submódulo de automatización Git `git.js` con las funciones `gitCommit` y `gitPush`
- [x] 1.6 Reestructurar `scripts/cms/server.js` para importar de forma limpia y delegar en los submódulos ESM de la API

## 2. Borrado Físico de Contenido y Confirmación Animada

- [x] 2.1 Agregar endpoint `DELETE /api/content/:collection/*` que borra físicamente el recurso y llama a Git Auto-Commit
- [x] 2.2 Diseñar el Modal de Confirmación de Borrado animado interactivo en `index.html` con transiciones de CSS (fade-in, scale-up)
- [x] 2.3 Añadir botón "Eliminar Recurso" en el header del CMS conectado con el Modal de Confirmación asíncrono

## 3. Árbol de Carpetas y Creación de Contenido Avanzado

- [x] 3.1 Actualizar el modal "Crear Nueva Entrada" para incluir la selección interactiva de subcarpetas en el árbol recursivo de contenidos
- [x] 3.2 Implementar soporte asíncrono para crear subdirectorios de contenido físicos en caliente desde el propio modal de creación
- [x] 3.3 Configurar plantillas iniciales enriquecidas por defecto (templates) específicas por tipo de colección para inicializar el cuerpo del markdown de los nuevos archivos

## 4. Botón Flotante Hamburger y Git Push

- [x] 4.1 Diseñar el botón de acciones rápidas flotante Hamburger en la esquina inferior izquierda con menú hover interactivo y micro-animaciones
- [x] 4.2 Crear endpoint `POST /api/git-push` para ejecutar de forma asíncrona `git push origin main` devolviendo la salida del comando
- [x] 4.3 Conectar la opción "Git Push" del menú flotante con el backend, gestionando el Toast de carga, éxito y error de consola de Git
