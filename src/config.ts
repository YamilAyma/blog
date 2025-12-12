/**
 * Configuración global del sitio.
 * Modifica estos valores para personalizar tu blog.
 */
export const SITE = {
  title: 'Blog',
  description: 'Blog personal sobre ideas, proyectos y aprendizaje.',
  author: 'Yamil Ayma',
  url: 'https://yamilayma.github.io',
  repo: 'https://github.com/yamilayma/blog',
};

/**
 * Enlaces a redes sociales.
 * Se muestran en el footer del sitio.
 */
export const SOCIALS = [
  {
    name: 'GitHub',
    href: 'https://github.com/yamilayma',
    icon: 'github',
  },
  {
    name: 'Email',
    href: 'mailto:yamilaymadev@gmail.com',
    icon: 'mail',
  },
];

/**
 * Configuración de tema por defecto (legacy - ahora se usa themes.ts)
 * @deprecated Usar src/config/themes.ts para personalización completa
 */
export const THEME = {
  colors: {
    primary: '#FFFBEF',
    background: '#FFFDD0', 
    text: '#333333',
  },
  fonts: {
    heading: "'Comic Neue', sans-serif",
    body: "'Balsamiq Sans', sans-serif",
  },
};
