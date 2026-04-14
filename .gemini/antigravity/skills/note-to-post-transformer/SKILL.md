---
name: note-to-post-transformer
description: Use this skill to transform raw developer notes, exploration logs, and images into high-quality tutorial-style blog posts. Trigger when the user provides notes or asks to "convertir mis notas en un post" or "redactar entrada desde mi log".
---

# Note-to-Post Transformer

A specialized skill for converting raw technical exploration into polished, educational, and warm blog content. It follows an 80/20 expansion ratio (80% AI detail, 20% user notes).

## Input Format
- **Notes**: Bullet points, action logs, or loose technical thoughts.
- **Images**: Markdown links `![description](url)` with optional commentary.
- **Errors/Experiences**: Explicit mentions of failures, pivots, or "aha!" moments.

## Content Structure & Components

### 1. Frontmatter
Generate standard Astro/MDX frontmatter:
```yaml
---
title: 'Descriptive Title'
description: 'Engaging summary'
date: 'YYYY-MM-DD' (Today)
category: 'Dev' (or relevant)
tags: ['tag1', 'tag2']
image: 'main_image_url' (from notes or placeholder)
---
```

### 2. Mandatory IA Disclaimer
Immediately after the frontmatter, add:
*> Contenido generado mediante asistencia de IA basándose en notas y experiencias reales del autor.*

### 3. TLDR Component
Summarize the main points using the `<TLDR />` component:
```mdx
import TLDR from '@/components/mdx/TLDR.astro';

<TLDR title="Puntos Clave" points={[
  "Punto 1",
  "Punto 2",
  "..."
]} />
```

### 4. Sequential Process
Organize the content into sections with warm and friendly question-like titles. 
Examples: 
- `## ¿Por dónde empezamos?`
- `## ¿Qué nos detuvo? (El desafío técnico)`
- `## ¿Cómo lo solucionamos?`
- `## ¿Qué descubrimos al final?`

### 5. Educational Focus (Tutorial Style)
- Explain **why** things work or fail.
- Use code blocks with appropriate language tags.
- Integrate images strategically where they are mentioned in the notes.

### 6. Learning Section (Optional)
Include only if special learnings or "errors to avoid" are mentioned in the notes.

### 7. FAQ Component
Add an informative FAQ section at the end for teaching purposes:
```mdx
import FAQs from '@/components/mdx/FAQs.astro';
import FAQItem from '@/components/mdx/FAQItem.astro';

<FAQs title="Preguntas Frecuentes">
  <FAQItem question="¿Por qué sucedió X?">
    Explicación técnica simplificada.
  </FAQItem>
  <FAQItem question="...">
    ...
  </FAQItem>
</FAQs>
```

## Tone & Voice Guidelines
- **Warm & Friendly**: Developer-to-developer connection.
- **Honest**: Transparent about errors and the exploration process.
- **No Hype**: Avoid marketing buzzwords. Stick to authentic excitement.
- **Polished**: Respect standard Spanish grammar and technical casing (GitHub, VS Code, IA, etc.).
