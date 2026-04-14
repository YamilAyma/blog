---
name: blog-post-polisher
description: Use this skill to refine blog posts with technical linking, casing normalization, spelling correction, and accessibility. Trigger when the user asks to "mejorar un post", "pulir contenido", "optimizar SEO", "agregar links", or "revisar ortografía".
---
# Blog Post Polisher

A high-fidelity skill dedicated to the "production polish" of blog posts. It ensures technical accuracy, accessibility, and SEO quality while maintaining a human, developer-centric voice.

## Core Refinement Pillars

### 1. Spelling & Grammar (Spanish)

- **Strict Correction**: Fix all spelling errors, accentuation (tildes), and grammatical inconsistencies in Spanish.
- **Voice Preservation**: Maintain the "friendly developer" tone. Do not make it overly formal. Replace "stiff" phrases with natural developer speech.

### 2. Technical Casing & Naming

Normalize technical terms using the correct words. Always preserve the specified casing and symbols:

- **General**: GitHub, VS Code, IA (AI), RPA, Open Source, Localhost.
- **Stack**: Astro, Tailwind CSS, MDX, TypeScript, JavaScript, PHP, Next.js, Vercel, Node.js, React.
- **Concepts**: API, RSS, SSG, SEO, CRUD, KISS.

### 3. Strategic Strategic Linking

- **Official Sources**: Always prefer official documentation or high-authority sources (e.g., [https://github.com](https://github.com), [https://nextjs.org](https://nextjs.org), [https://www.php.net](https://www.php.net)).
- **Linking Density**: Only link the **first occurrence** of a keyword per post to keep the text clean.
- **Link Text**: The link should be wrapped around the keyword itself (e.g., `[GitHub](https://github.com)`).
- **Internal Backlinks**: Look for opportunities to link to other internal posts or projects in `src/content/`.
  - Base suggestions on categories and tags.
  - Format: `[texto](URLBASE/posts/slug)` or `[texto](URLBASE/projects/slug)`.
  - `URLBASE`: `https://yamilayma.github.io`.

### 4. Image Accessibility & Alt Text

- **Technical Alts**: Instead of generic descriptions like "captura de pantalla", analyze the context to create descriptive, technical, and accessible `alt` texts.
- **Example**: `![Captura de pantalla de los primeros commits de migración en GitHub](url)` instead of `![Captura](url)`.

### 5. Guía de Estilo (Tone & SEO)

- **No Hype**: Avoid marketing words such as "brutal", "revolucionario", "secreto", "increíble", "el futuro".
- **Heading Hierarchy**: Ensure a logical sequence of `H1` (title), `H2`, `H3`.
- **No Broetry**: Avoid single-sentence paragraphs separated by excessive vertical space. Use normal paragraphs (2-4 sentences).
- **RSS Compatibility**: Keep line breaks as simple `\n` characters.

## Workflow Sequence

1. **Scan**: Identify technical terms and images in the MDX file.
2. **Correct**: Fix spelling and casing throughout the text.
3. **Link**: Find official links for the first occurrence of each technical term.
4. **Polish Images**: Add descriptive `alt` texts to all images.
5. **Review**: Ensure the post doesn't sound promotional and adheres to the "friendly dev" voice.
