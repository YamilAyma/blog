## MODIFIED Requirements

### Requirement: Automatización de Git (Auto-Commits locales y Git Push asíncrono)
El sistema SHALL automatizar la creación de commits locales en Git tras cada acción de edición o subida en caliente, y proveer un flujo asíncrono para ejecutar Git Push al repositorio remoto.

#### Scenario: Commit automático al guardar cambios
- **WHEN** el usuario realiza modificaciones en un post y pulsa "Guardar Cambios".
- **THEN** el sistema reescribe el archivo físico y de manera inmediata ejecuta en consola un comando Git local (`git add` y `git commit`) con el formato imperativo `docs (Contenido) - Actualizar entrada [slug] en [colección]`.

#### Scenario: Git Push asíncrono mediante menú flotante
- **WHEN** el usuario hace hover en el botón Hamburger flotante en la esquina inferior derecha y hace clic en "Ejecutar Git Push".
- **THEN** el sistema inicia un Toast de carga, ejecuta en el backend `git push origin main` asíncronamente y actualiza el Toast a éxito o error detallando la respuesta de la consola de Git.

---

## ADDED Requirements

### Requirement: Botón selector flotante de Biblioteca y Editor
El CMS MUST incorporar un botón flotante estilizado situado inmediatamente al lado de la hamburguesa de herramientas en la esquina inferior derecha. Este botón SHALL mostrar un icono de `🖼️` cuando el usuario esté en el Editor de Contenidos para permitirle cambiar a la Biblioteca de Recursos. Cuando el usuario se encuentre en la Biblioteca de Recursos, el botón SHALL cambiará su icono a `✍️` y su clic SHALL redirigir la interfaz de vuelta al Editor de Contenidos.

#### Scenario: Transición exitosa entre Editor y Biblioteca
- **WHEN** el usuario hace clic en el botón flotante con el icono `🖼️` en el Editor de Contenidos
- **THEN** la vista del CMS cambia a la Biblioteca de Recursos, el botón flotante actualiza su icono a `✍️` y se inicia una suave animación de transición.

---

### Requirement: Transición onírica de desenfoque
Al rotar y alternar entre las secciones principales (Editor de Contenidos y Biblioteca de Recursos) a través del botón selector flotante, el sistema MUST aplicar una transición visual de desenfoque (`blur`) sobre toda la pantalla con un efecto de cambio de opacidad progresivo de 2 segundos de duración para proporcionar un aspecto onírico o suave.

#### Scenario: Activación de la animación de transición al cambiar de sección
- **WHEN** el usuario pulsa el selector de modos del CMS para alternar la vista actual
- **THEN** el sistema aplica dinámicamente una clase CSS de animación que activa un filtro `blur` de hasta 8px y un fundido de opacidad con una transición constante de 2.0 segundos de duración antes de estabilizar la visualización final.
