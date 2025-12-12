/**
 * Definición de la interfaz Theme para personalización de colores, fuentes y estilos.
 * 
 * @property id - Identificador único del tema (ej: 'soft', 'dark', 'tech')
 * @property name - Nombre legible del tema
 * @property type - Tipo de tema: 'light' (claro) o 'dark' (oscuro)
 * @property colors - Colores principales del tema
 * @property fonts - Tipografías para títulos y cuerpo de texto
 * @property ui - Colores para elementos de interfaz (título del sitio, navegación)
 * @property markdown - Colores para elementos de contenido Markdown
 */
export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: {
    background: string;   // Color de fondo
    text: string;         // Color del texto principal
    primary: string;      // Color primario/acento
    accent: string;       // Color de acento secundario
    border: string;       // Color de bordes
  };
  fonts: {
    heading: string;      // Fuente para títulos (h1-h6)
    body: string;         // Fuente para párrafos y texto general
  };
  ui: {
    siteTitle: string;    // Color del título del sitio en el header
    navLink: string;      // Color de los enlaces de navegación
    navLinkHover: string; // Color de hover en navegación
  };
  markdown: {
    h1: string;           // Color de títulos h1
    h2: string;           // Color de títulos h2
    h3: string;           // Color de títulos h3
    h4: string;           // Color de títulos h4
    h5: string;           // Color de títulos h5
    h6: string;           // Color de títulos h6
    p: string;            // Color de párrafos
    bold: string;         // Color de texto en negritas
    italic: string;       // Color de texto en cursivas
    a: string;            // Color de enlaces
    aHover: string;       // Color de hover en enlaces
    code: string;         // Color del texto de código inline
    codeBg: string;       // Fondo del código inline
    blockquote: string;   // Color de texto en citas
    blockquoteBorder: string; // Borde izquierdo de citas
    hr: string;           // Color de línea horizontal
  };
}

/**
 * Lista de temas disponibles.
 */
export const THEMES: Theme[] = [
  {
    id: 'soft',
    name: 'Inspirado Everforest',
    type: 'light',
    colors: {
      background: '#FFFBEF',
      text: '#4A403A',
      primary: '#F2D2BD',
      accent: '#FFB7B2',
      border: 'rgba(74, 64, 58, 0.1)',
    },
    fonts: {
      heading: '"Comic Neue", cursive',
      body: '"Balsamiq Sans", sans-serif',
    },
    ui: {
      siteTitle: '#A6B0A0',
      navLink: '#DFA000',
      navLinkHover: '#f5cf6eff',
    },
    markdown: {
      h1: '#3A94C5',
      h2: '#3A94C5',
      h3: '#3A94C5',
      h4: '#4A9A8F',
      h5: '#5AAA9F',
      h6: '#6ABAAF',
      p: '#4A403A',
      bold: '#3A94C5',
      italic: '#6A605A',
      a: '#DF69BA',
      aHover: '#f187d0ff',
      code: '#C026D3',
      codeBg: 'rgba(192, 38, 211, 0.1)',
      blockquote: '#6A605A',
      blockquoteBorder: '#F2D2BD',
      hr: '#E5D5C5',
    },
  },
  {
    id: 'tech',
    name: 'Tech Blue',
    type: 'light',
    colors: {
      background: '#F0F4F8',
      text: '#1E293B',
      primary: '#A8C5E6',
      accent: '#3B82F6',
      border: 'rgba(30, 41, 59, 0.1)',
    },
    fonts: {
      heading: '"Inter", sans-serif',
      body: '"Roboto", sans-serif',
    },
    ui: {
      siteTitle: '#1E293B',
      navLink: '#475569',
      navLinkHover: '#3B82F6',
    },
    markdown: {
      h1: '#0F172A',
      h2: '#1E293B',
      h3: '#334155',
      h4: '#475569',
      h5: '#64748B',
      h6: '#94A3B8',
      p: '#334155',
      bold: '#0F172A',
      italic: '#475569',
      a: '#3B82F6',
      aHover: '#2563EB',
      code: '#0EA5E9',
      codeBg: 'rgba(14, 165, 233, 0.1)',
      blockquote: '#64748B',
      blockquoteBorder: '#3B82F6',
      hr: '#CBD5E1',
    },
  },
  {
    id: 'dark',
    name: 'Elegant Dark',
    type: 'dark',
    colors: {
      background: '#1C1917',
      text: '#E7E5E4',
      primary: '#7FBBB3',
      accent: '#84b9c9',
      border: 'rgba(231, 229, 228, 0.1)',
    },
    fonts: {
      heading: '"Comic Neue", cursive',
      body: '"Balsamiq Sans", sans-serif',
    },
    ui: {
      siteTitle: '#A6B0A0',
      navLink: '#DBBC7F',
      navLinkHover: '#faeed7ff',
    },
    markdown: {
      h1: '#7FBBB3',
      h2: '#7FBBB3',
      h3: '#7FBBB3',
      h4: '#8FCBC3',
      h5: '#9FDBD3',
      h6: '#AFEBE3',
      p: '#F4EAD5',
      bold: '#7FBBB3',
      italic: '#DBBC7F',
      a: '#DF69BA',
      aHover: '#ee99d3ff',
      code: '#22D3EE',
      codeBg: 'rgba(34, 211, 238, 0.1)',
      blockquote: '#f3efedff',
      blockquoteBorder: '#C4B5FD',
      hr: '#3A3A3A',
    },
  },
];

/** ID del tema por defecto cuando no hay preferencia del usuario */
export const DEFAULT_THEME_ID = 'soft';

/**
 * Mapeo de categorías de posts a IDs de temas.
 * Cuando un post tiene una categoría específica, usará el tema correspondiente.
 */
export const CATEGORY_THEMES: Record<string, string> = {
  'IA': 'soft',
  'Dev': 'soft',
  'Personal': 'soft',
  'General': 'soft',
  'Tutorial': 'soft',
};

/**
 * Mapeo de categorías a rutas de imágenes para el sticker.
 * Las imágenes deben estar en public/images/categories/
 */
const baseStickerPath = '/images/stickers/';
export const CATEGORY_IMAGES: Record<string, string> = {
  'IA': baseStickerPath + 'ia.png',
  'Dev': baseStickerPath + 'dev.png',
  'Tutorial': baseStickerPath + 'tutorial.png',
  'General': baseStickerPath + 'general.png',
  'default': baseStickerPath + 'default.png',
};
