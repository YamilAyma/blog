# Especificación Técnica: Themes & Aesthetics (Identidad Visual, Temas y Efectos)

Esta especificación técnica documenta el diseño visual, la tipografía, la paleta de colores y las micro-interacciones interactivas que definen la estética retro, tierna y minimalista ("Cute") del blog.

---

## 1. Filosofía Visual y Tipografías

La interfaz del blog está diseñada para alejarse de los layouts corporativos rígidos y ofrecer una atmósfera lúdica, reconfortante y amigable:

*   **Tipografía de Titulares (`heading`)**: **Comic Neue** (con caída de respaldo a cursiva). Aporta un aire manual, orgánico y amigable sin perder legibilidad.
*   **Tipografía de Lectura (`body`)**: **Balsamiq Sans** (con caída a sans-serif). Sus formas redondeadas y orgánicas generan una lectura cómoda y amena que encaja perfectamente con el diseño de stickers y elementos flotantes.
*   **Estilo "Esponjoso" (`cuteHeadings`)**: Los encabezados y botones tienen la propiedad opcional de renderizar contornos estéticos planos de color blanco o colores contrastantes (`headingOutlineColor`) para emular pegatinas o elementos recortados.

---

## 2. Temas de Color Disponibles (`src/config/themes.ts`)

El blog cuenta con tres temas visuales definidos en su motor de estilos. Cada uno ajusta los colores de fondo, texto, acentos, bordes, elementos de interfaz y de renderizado de Markdown:

### 2.1. Tema `soft` ("Inspirado Everforest" - Claro)
*   **ID**: `soft` (Tema por defecto)
*   **Colores de Fondo y Base**: Fondo crema cálido (`#FFFBEF`), texto marrón orgánico (`#694836ff`).
*   **Acentos**: Naranja/Melocotón suave (`#F2D2BD`), rosa acento (`#FFB7B2`).
*   **Texturas**: Imagen de fondo repetitiva con patrón SVG (`/bg/soft-bg.svg`).
*   **Tipografías**: Comic Neue y Balsamiq Sans.
*   **Estilo Markdown**: Títulos en azul cielo, enlaces en rosa vibrante y bloques de código en fucsia/magenta con fondos tenues.

### 2.2. Tema `tech` ("Tech Blue" - Claro y Profesional)
*   **ID**: `tech`
*   **Colores de Fondo y Base**: Fondo gris azulado frío (`#F0F4F8`), texto pizarra oscuro (`#1E293B`).
*   **Acentos**: Azul tecnológico acentuado (`#3B82F6`), azul tenue primario (`#A8C5E6`).
*   **Texturas**: Fondo plano minimalista sin patrones visuales.
*   **Tipografías**: Inter (para titulares) y Roboto (para cuerpo de texto) para un estilo más técnico y limpio.
*   **Estilo Markdown**: Títulos e indicaciones en tonos oscuros de Slate, enlaces en azul vibrante y bloques de código inline en cian claro.

### 2.3. Tema `dark` ("Elegant Dark" - Oscuro)
*   **ID**: `dark`
*   **Colores de Fondo y Base**: Fondo piedra carbón (`#1C1917`), texto arena suave (`#E7E5E4`).
*   **Acentos**: Verde pastel apagado (`#7FBBB3`), azul cobalto claro (`#84b9c9`).
*   **Tipografías**: Comic Neue y Balsamiq Sans.
*   **Estilo Markdown**: Títulos y destacados en verde pastel, enlaces en rosa vibrante y bloques de código inline en cian eléctrico de alto contraste.

---

## 3. Stickers Temáticos de Categorías

Para dar cohesión a las publicaciones, el blog utiliza un sistema de stickers visuales e interactivos mapeados en `src/config/themes.ts`:

| Categoría | Sticker Asociado (`CATEGORY_IMAGES`) | Descripción Corta en Popover (`CATEGORY_DESCRIPTIONS`) | Tema Asociado |
| :--- | :--- | :--- | :--- |
| **`IA`** | `../assets/images/stickers/ia.png` | Inteligencia Artificial y Automatización | `soft` |
| **`Dev`** | `../assets/images/stickers/dev.png` | Desarrollo de Software y Frontend | `soft` |
| **`Tutorial`** | `../assets/images/stickers/tutorial.png` | Guías paso a paso y tutoriales | `soft` |
| **`General`** | `../assets/images/stickers/general.png` | Contenido variado y notas rápidas | `soft` |
| **`Personal`** | *(Usa sticker default)* | Reflexiones y experiencias personales | `soft` |
| **`default`** | `../assets/images/stickers/default.png` | Bitácora Digital | `soft` |

---

## 4. Efectos Especiales e Interactivos

*   **Confeti de Bienvenida (`celebration`)**: Al activar la propiedad `celebration: true` en la configuración global (`src/config.ts`), el sitio ejecuta un disparador de confeti en el navegador la primera vez que un usuario visita el blog en el día (utilizando `localStorage` para registrar la fecha del último saludo y evitar saturación en visitas repetitivas).
*   **Mapeo de Temas por Categoría (`CATEGORY_THEMES`)**: Cuando el usuario navega a un post que pertenece a una categoría específica, el motor de estilos del blog cambia de forma transparente el tema base del sitio para adaptarse a la estética de dicha categoría.
