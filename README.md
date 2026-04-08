# Blog

![BlogView](https://i.imgur.com/nu6wh19.png)

Blog personal de alto rendimiento construido con **Astro 5**, **React 19**, **Tailwind CSS v4**, **MDX** y animaciones avanzadas con **GSAP**.

## ✨ Características Principales

- 🚀 **Performance Extremo**: Basado en Astro para una carga instantánea y mínima hidratación JS.
- 🎨 **Diseño Moderno**: Interfaz premium con Tailwind CSS v4 y animaciones suaves con GSAP.
- 📖 **Contenido en MDX**: Escribe con el poder de Markdown y la flexibilidad de componentes React.
- 🛠️ **Gestión de Proyectos**: Portafolio dinámico con sistema de bitácora (diario de desarrollo).
- 🏷️ **Sistema de Tags Universal**: Navegación y agrupación de contenido (blog, proyectos, posts, bitácoras) mediante etiquetas dinámicas.
- 📰 **RSS Inteligente**: Feed automático para tus posts visuales.
- 📅 **Deploy Programado**: Publicación automática de entradas futuras mediante GitHub Actions.

## Acceso

### Clonar el repositorio

```bash
git clone https://github.com/yamilayma/blog.git
cd blog
```

### Instalar dependencias

```bash
npm install
```

### Iniciar servidor de desarrollo

```bash
npm run dev
```

El sitio estará disponible en `http://localhost:4321`

## Desarrollo

### Estructura del proyecto

```
src/
├── components/     # Componentes Astro (Header, Footer, etc.)
├── config/         # Configuración de temas
├── content/
│   ├── blog/       # Entradas del blog (.mdx)
│   ├── posts/      # Posts visuales (.mdx)
│   ├── journal/    # Bitácoras de proyectos (.mdx)
│   ├── projects/   # Detalles de proyectos (.mdx)
│   └── pages/      # Páginas estáticas (.mdx)
├── layouts/        # Layouts (Layout, BlogPost)
├── pages/          # Rutas del sitio
├── styles/         # Estilos CSS
└── utils/          # Utilidades (tema)
```

### Crear un nuevo post

1. Crear archivo en `src/content/posts/mi-post.mdx`:

```mdx
---
image: /images/posts/mi-imagen.png
imageAlt: 'Descripción técnica de la infografía'
title: 'Titular SEO Impactante' # Opcional
copy: 'Resumen de alto impacto para redes sociales' # Máx 300 caracteres
date: 2026-03-31
published: true # false para ocultar
category: 'General'
tags: ['IA', 'Automatización'] # Opcional
socials:
  linkedin: https://linkedin.com/in/usuario
  instagram: https://instagram.com/usuario
  twitter: https://x.com/usuario
---

Contenido del post ampliado aquí...
Usar saltos de línea normales para que el RSS los procese correctamente.
```

2. El post aparece en `/posts` si `published: true` y `date <= hoy`

### Crear una nueva entrada

1. Crear archivo en `src/content/blog/mi-entrada.mdx`:

```mdx
---
title: 'Título de mi entrada'
description: 'Descripción corta'
date: '2025-12-11'
category: 'Personal'
tags: ['tag1', 'tag2']
image: '/images/stickers/1200x630-og.png'
---

# Contenido aquí

Contenido en Markdown/MDX...
```

2. La entrada aparecerá automáticamente en `/blog`

### Editar páginas estáticas

Las páginas están en `src/content/pages/`:
- `sobre-mi.mdx` → `/sobre-mi`
- `contacto.mdx` → `/contacto`
- `galeria.mdx` → `/galeria`

### Personalizar temas

Edita `src/config/themes.ts` para modificar colores, fuentes y estilos.

### Crear un nuevo proyecto

1. Crear archivo en `src/content/projects/mi-proyecto.mdx`:

```mdx
---
title: 'Nombre del Proyecto'
description: 'Descripción corta del proyecto'
image: '/images/portfolio/projects/mi-imagen.png'
imagenes:
  - '/images/portfolio/projects/foto-1.png'
periodo: 'Enero 2024 - Presente'
tags: ['React', 'Astro']
features:
  - 'Funcionalidad A'
  - 'Funcionalidad B'
tecnologias:
  - 'https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=white'
links:
  - type: 'github'
    url: 'https://github.com/...'
  - type: 'demo'
    url: 'https://demo.com'
order: 1
---

## Descripción
Contenido en Markdown...
```

2. El proyecto aparecerá en `/portafolio` y tendrá su propia URL en `/proyectos/mi-proyecto`.

### Configuración del sitio

Edita `src/config.ts` para cambiar:
- Título del sitio
- Descripción
- Autor
- Enlaces sociales


### Crear una bitácora de proyecto

1. Localizar el slug del proyecto en `src/content/projects/` (ej: `mi-proyecto.mdx` → slug: `mi-proyecto`).
2. Crear archivo en `src/content/journal/mi-proyecto/mi-avance.mdx`:

```mdx
---
title: 'Título del avance'
description: 'Resumen corto'
date: 2026-03-31
project: 'mi-proyecto'
tags: ['Tag1', 'Tag2'] # Opcional
published: true
---

# Mi progreso de hoy

Contenido detallado con imágenes...
```

3. El avance aparecerá al final de la página del proyecto y en **"Entradas Recientes"** de la Home.

## 🧩 Componentes Especiales (MDX)

Puedes usar estos componentes enriquecidos en cualquier archivo `.mdx` (blog, diario, posts) para mejorar la legibilidad.

### 💡 TLDR (Resumen Rápido)
Ideal para dar un resumen ejecutivo al inicio de un post largo. Incluye una animación de entrada suave.

```mdx
<TLDR>
  Aquí va el resumen rápido de lo que el lector aprenderá o los puntos clave del artículo.
</TLDR>
```

### ❓ FAQs (Preguntas Frecuentes)
Crea una sección de acordeones interactivos. Los items se expanden verticalmente con una transición suave.

```mdx
<FAQs>
  <FAQItem question="¿Qué es este proyecto?">
    Es un sistema de gestión de contenido estático optimizado para velocidad.
  </FAQItem>
  <FAQItem question="¿Cómo puedo contribuir?">
    Haciendo un fork del repositorio y enviando un Pull Request.
  </FAQItem>
</FAQs>
```

### 💬 Quote / Cita / Opinión
Ideal para destacar testimonios, referencias externas o pensamientos importantes con un diseño limpio. Soporta los alias `<Quote>`, `<Cita>` y `<Opinion>`.

```mdx
<Quote cite="Yamil Ayma" role="Desarrollador" url="https://github.com/yamilayma">
  La modularización no es solo separar archivos, es definir cómo conversan las partes de un todo.
</Quote>
```

## Build

```bash
npm run build
```

Los archivos estáticos se generan en `dist/`

## Deploy

```bash
npm run deploy
```

El sitio está configurado para GitHub Pages. Sube los cambios a `main` y configura GitHub Pages para usar la carpeta `dist/` o GitHub Actions.

### Deploy programado (Posts)

El workflow `.github/workflows/scheduled-deploy.yml` ejecuta un build automatico cada día a las 5:00 AM UTC, permitiendo que los posts con fecha programada aparezcan automáticamente sin intervención manual.
