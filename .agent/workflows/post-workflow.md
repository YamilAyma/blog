# Workflow de Mejora de Posts

Este archivo contiene las instrucciones para la IA al procesar nuevos posts del blog.

## Pasos del Proceso:

1. **Identificar cambios**: Usar `git status` para localizar archivos MDX en `src/content/posts/` que no han sido commiteados.
2. **Analizar Imágenes**: Leer la ruta de `image` en el frontmatter y analizar visualmente el archivo en `assets/images/posts/`.
3. **Rellenar Esquema (Surgical Update)**:
   - **title**: Crear un titular SEO potente (si no existe).
   - **imageAlt**: Redactar descripción técnica y accesible de la imagen (si no existe).
   - **copy**: Generar resumen de alto impacto de máx. 300 caracteres (SI NO EXISTE).
   - **body (Cuerpo)**: Transcribir o expandir el contenido de la infografía en párrafos claros (SI NO EXISTE).
4. **Validación**: Asegurar que el frontmatter sea válido y que el contenido MDX mantenga los hashtags originales.
5. **Notificar y Esperar**: Informar al usuario para que valide y revise el contenido generado. **NO realizar commit** automáticamente.

## Guía de Estilo y Voz (Mandatoria):

### Tono y Voz:

- **Humano y cercano**: Habla como un desarrollador amigable tomando un café con un colega.
- **Honesto y con criterio**: Prefiere la autenticidad ("estoy aprendiendo", "me parece un error") antes que la autoridad absoluta.
- **Sin Hype**: PROHIBIDO usar palabras como "revolucionario", "secreto", "brutal", "imperdible" o "el futuro es hoy".
- **Lenguaje**: Español natural y fluido. Usa frases como comunes con un poco técnico pero que ayude al lector a entender y ser claro.

### Estructura del Cuerpo:

- **Sin "Hooks" de manual**: No empieces con frases provocativas. Inicia con una observación real o reflexión directa.
- **Sin CTAs marketeros**: Nada de "¡Comenta abajo!" o "¡Dale like!". Cierra con un saludo natural o una pregunta abierta y genuina.
- **Brevedad**: Párrafos cortos. Si se puede decir en 3 líneas, no uses 6. Evita el "Broetry" (frases de una sola línea con muchos espacios).
- **Emojis**: Máximo 1 o 2 por post, y que sean sobrios como 👋, 💻, 💡.

### Enfoque de Contenido:

- Intersección de **Software, IA y eficiencia para PyMEs**.
- Posicionamiento como **"Filtro de calidad"**: Separar el ruido de la utilidad real.
- Valorar la **simplicidad sobre la complejidad**.

## Reglas de Oro:

- **Respetar contenido**: Si el usuario ya escribió un `copy` o un `body`, **NO sobrescribir**. Solo completar los campos vacíos.
- **Formato**: Usar saltos de línea normales (`\n`) para que el RSS los convierta automáticamente.
