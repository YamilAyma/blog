## Context

El CMS local requiere optimizaciones de interacción en la carga de imágenes para evitar sobrescribir recursos existentes al usar nombres genéricos de PC, así como una solución práctica para el crecimiento desordenado de commits locales en Git. Además, se estandariza el uso del formato moderno `.mdx` por defecto en todo el blog y se añaden metadatos completos y consistentes para las publicaciones visuales de la galería.

## Goals / Non-Goals

**Goals:**
* Habilitar el renombrado opcional de imágenes al subirlas y validar la no existencia en el directorio físico destino para evitar colisiones.
* Ofrecer un botón flotante **"Finalizar Redacción"** y un endpoint en el CMS backend para colapsar (squash) todos los commits locales que se encuentren por delante de la rama de seguimiento remota (`origin/main`), conservando la lista de los títulos de commits locales en la descripción del commit consolidado, y proceder a subirlos a GitHub de forma directa.
* Mostrar un modal de confirmación con la ilustración `success_session.png` que explique el proceso al usuario y le recuerde que puede continuar redactando sin cerrar el CMS.
* Cambiar la extensión de creación predeterminada a `.mdx` en toda la interfaz y los endpoints de creación, respetando la extensión si el usuario la escribe de forma explícita, y añadir un mensaje informativo inferior en el campo.
* Expandir y sincronizar la plantilla de creación de `posts` con todos los campos del frontmatter requeridos por el blog real.

**Non-Goals:**
* Modificar las configuraciones de Git globales o forzar pushes remotos sin validaciones locales de autenticación.
* Reemplazar o alterar el formateador YAML actual ni cambiar la semántica de colecciones fuera de las refinadas.

## Decisions

### 1. Validación y Renombrado de Imágenes (Frontend & Backend)
* **Decisión:** Al seleccionar una imagen en `ImageUploaderModal`, se habilitará una caja de entrada de texto (`input`) pre-poblada con el nombre del archivo original (sanitizado).
* **Validación:** Al cambiar el nombre o al seleccionar la carpeta de destino, se enviará una petición a un nuevo endpoint `GET /api/media/check-exists?dir=...&filename=...`. Si existe el archivo, el frontend deshabilitará el botón de subida y mostrará un mensaje de advertencia.
* **Alternativa considerada:** Renombrar automáticamente agregando sufijos incrementales (ej: `imagen-1.png`). Se descarta ya que el usuario prefiere decidir conscientemente el nombre del recurso para mantener ordenados los posts.

### 2. Aplanado de Historial e Integración ("Finalizar Redacción")
* **Decisión:** Crear un nuevo endpoint en el backend `POST /api/git-squash`. 
  * Este endpoint determinará la rama remota de seguimiento actual (por defecto `origin/main`).
  * Consultará la lista de todos los commits individuales acumulados en la sesión mediante `git log origin/main..HEAD --format="- %s"`.
  * Ejecutará `git reset --soft origin/main` en la raíz del blog. Esto mantiene todos los cambios acumulados y los coloca listos para ser confirmados (staged).
  * Luego, ejecutará un único `git commit -m "docs (Contenido) - Consolidar y aplanar cambios locales del blog" -m "[Historial de cambios de la sesión]:\n[lista de commits]"` de forma que se preserve todo el historial descriptivo.
  * Seguidamente, ejecutará el comando asíncrono `git push origin main` (o la rama actual) para subirlos.
  * Si la subida o el squash fallan, informará en el Toast del frontend.
* **Alternativa considerada:** Usar `git rebase -i`. Se descarta debido a que es altamente interactivo y propenso a conflictos de fusión complejos, mientras que el `git reset --soft` es 100% automático, seguro y no destructivo de los archivos locales.

### 3. Extensión predeterminada de contenidos a `.mdx`
* **Decisión:** En la SPA (`index.html`) y en el endpoint de creación de recursos (`POST /api/content/:collection`), se forzará la inicialización a `.mdx` por defecto. Si el usuario escribe un nombre sin extensión, se le agregará `.mdx`. Si escribe una extensión manual como `.md`, se respetará. Se añadirá una nota aclaratoria debajo del campo en el formulario de la interfaz.

### 4. Plantilla de Frontmatter para `posts`
* **Decisión:** Actualizar el archivo `scripts/cms/server.js` (o en la API correspondiente) para que la plantilla inyectada por defecto al crear posts de la colección `posts` contenga exactamente la estructura y campos requeridos para coincidir con `recursos-2026-05-06.mdx`:
```yaml
---
image: ../../../assets/images/posts/[carpeta]/[nombre-imagen].png
imageAlt: 'Recopilación de recursos - [Fecha]'
title: 'Recursos para Desarrolladores - [Fecha]'
copy: 'Recursos de hoy: '
date: [Fecha-Actual]
published: true
category: 'General'
tags: ['posts', 'resources']
socials:
  linkedin: https://linkedin.com/in/yamilayma
---
```

## Risks / Trade-offs

* **[Risk]** Que el usuario intente hacer "Squash" pero no tenga una rama remota configurada o no haya commits previos de los cuales hacer seguimiento.
  * **Mitigation:** El backend validará si hay commits locales por delante de `origin/main`. Si no hay o da error, retornará un código informativo explicándole al usuario que el historial ya está al día.
