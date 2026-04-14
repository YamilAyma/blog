# Demostración del Proceso (Skill: note-to-post-transformer)

**Notas Originales:**
> Notas sobre Stylus y Google AI Studio. Encontré Stylus para cambiar el color de apps web de IA. Usé light-dark(color1, color2) para temas duales. Detecté clase hljs para el código. Publiqué dos estilos en userstyles.world. Adjunto imagen: ![Stylus UI](https://i.imgur.com/QuVsKhU.png) (mostrando las características de la herramienta).

**Post Generado (Simulación):**

```mdx
---
title: 'Personalizando la Web: Temas Duales para Google AI Studio'
description: 'Cómo logré transformar mi entorno de desarrollo utilizando Stylus y CSS moderno.'
date: '2026-04-14'
category: 'Dev'
tags: ['css', 'customization', 'ia', 'google']
image: 'https://i.imgur.com/QuVsKhU.png'
---

import TLDR from '@/components/mdx/TLDR.astro';
import FAQs from '@/components/mdx/FAQs.astro';
import FAQItem from '@/components/mdx/FAQItem.astro';

*> Contenido generado mediante asistencia de IA basándose en notas y experiencias reales del autor.*

¡Hola! Hoy quiero compartir algo que me estuvo rondando la cabeza: ¿podemos cambiar el aspecto de nuestras herramientas de IA favoritas? Resulta que sí, y el proceso es más divertido de lo que parece.

<TLDR title="Resumen de la Aventura" points={[
  "Uso de Stylus para inyección de CSS personalizado.",
  "Implementación de temas light/dark automáticos con CSS moderno.",
  "Identificación de selectores para sintaxis de código (hljs).",
  "Publicación de plantillas abiertas para la comunidad."
]} />

### ¿Por dónde empezamos?
Todo comenzó con una pregunta: ¿por qué conformarse con los colores por defecto? Buscando una forma de "hackear" positivamente la interfaz de Google AI Studio, encontré **Stylus**, una extensión de navegador diseñada para la personalización de estilos. Es increíble lo potente que resulta inyectar código CSS directamente sobre el sitio.

![Imagen de características de Stylus](https://i.imgur.com/QuVsKhU.png)
*Explorando las opciones de personalización en la interfaz de Stylus.*

### ¿Cómo logramos que sea dinámico?
Uno de los retos era mantener la flexibilidad entre el modo claro y el oscuro. Aquí es donde entra en juego la función `light-dark(color1, color2)`. Gracias a este enfoque moderno de CSS, pude definir ambos esquemas de color en un sol archivo, permitiendo que la interfaz cambie automáticamente según las preferencias del sistema.

### ¿Qué descubrimos al final?
Al profundizar en los selectores, noté que la clase `hljs` (de Highlight.js) maneja el resaltado de sintaxis en el código generado. Modificar esto fue la pieza que faltaba para un tema verdaderamente premium. Finalmente, decidí publicar los resultados en userstyles.world para que tú también puedas usarlos.

<FAQs title="Preguntas Frecuentes">
  <FAQItem question="¿Qué es la función light-dark()?">
    Es una función CSS que permite especificar dos valores de color (uno para modo claro y otro para oscuro) en una sola propiedad, eliminando la necesidad de múltiples media queries.
  </FAQItem>
  <FAQItem question="¿Es seguro usar Stylus?">
    Sí, es una extensión de código abierto muy popular entre desarrolladores para personalizar visualmente sitios web sin alterar su funcionalidad.
  </FAQItem>
</FAQs>
```
