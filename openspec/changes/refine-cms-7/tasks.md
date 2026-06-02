## 1. Configuración y Backend de Recursos

- [x] 1.1 Crear archivo de configuración predeterminada `scripts/cms/config.json` con límites de peligro de usos de recursos
- [x] 1.2 Implementar endpoint `GET /api/resources` en el backend para obtener metadatos y conteo de usos de recursos
- [x] 1.3 Implementar endpoint `POST /api/resources/upload` en el backend con soporte de guardado en subcarpetas específicas
- [x] 1.4 Implementar endpoint `DELETE /api/resources` para eliminar físicamente archivos de recursos con Git commit automático
- [x] 1.5 Implementar endpoint `POST /api/resources/replace` para reemplazar archivos multimedia con Git commit automático

## 2. Dependency Tracker (Rastreador de Dependencias)

- [x] 2.1 Crear algoritmo recursivo de Dependency Tracker en `scripts/cms/api/media.js` que busque referencias en disco
- [x] 2.2 Implementar el endpoint `POST /api/resources/rename` en el backend que ejecute el renombrado físico y el Dependency Tracker
- [x] 2.3 Validar que el tracker reemplace y reescriba con éxito las referencias YAML y Markdown en todos los posts de `src/content/`
- [x] 2.4 Asegurar que el Dependency Tracker registre un commit automatizado en Git para cada post modificado

## 3. Interfaz del CMS y Componente de Biblioteca de Recursos

- [x] 3.1 Mover el menú de hamburguesa flotante a la esquina inferior derecha en la hoja de estilos y los componentes del frontend
- [x] 3.2 Crear el botón flotante selector de modo al lado de la hamburguesa con iconos de `🖼️` / `✍️`
- [x] 3.3 Implementar el componente `ResourceLibrary.js` con navegación en árbol y cuadrícula de tarjetas de imágenes
- [x] 3.4 Añadir edición de nombres con doble clic directamente sobre el nombre de la Card (confirmar con Enter)
- [x] 3.5 Interceptar click derecho en las Cards de recursos para activar/desactivar marcadores de remoción rápida

## 4. Modal Dividido, Sonidos Tiernos y Animación de Transición

- [x] 4.1 Crear modal interactivo Split View al hacer clic en una Card de recursos con animación fluida de despeje de Cards
- [x] 4.2 Hacer responsive el modal dividido en dispositivos móviles (apilamiento en columna)
- [x] 4.3 Integrar tooltip de información `(i)` enriquecido con metadatos del recurso
- [x] 4.4 Implementar el generador de sonido chime tierno usando Web Audio API (`AudioContext`) e integrarlo a los Toasts de notificaciones
- [x] 4.5 Agregar transition de blur de 2s sobre la pantalla principal al cambiar de modos o secciones

## 5. Validación, Evals y Pruebas

- [x] 5.1 Escribir pruebas mock para verificar el comportamiento de los endpoints CRUD de la biblioteca de recursos
- [x] 5.2 Validar que el CMS compile y se ejecute limpiamente con `npm run dev` sin regresiones
