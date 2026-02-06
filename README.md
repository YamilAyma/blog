# Blog

![BlogView](https://i.imgur.com/nu6wh19.png)

Blog personal construido con Astro 5, TailwindCSS v4 y MDX.

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
date: 2026-02-10
published: true  # false para ocultar
socials:
  linkedin: https://linkedin.com/...
---

Contenido del post con saltos de línea...
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

### Configuración del sitio

Edita `src/config.ts` para cambiar:
- Título del sitio
- Descripción
- Autor
- Enlaces sociales

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
