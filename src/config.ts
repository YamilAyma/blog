/**
 * Configuración global del sitio.
 * Modifica estos valores para personalizar tu blog.
 */
export const SITE = {
  name: 'Inicio',
  title: 'Yamil Ayma — Desarrollo de Software y Blog Personal',
  description: 'Blog de Yamil Ayma: Tutoriales de desarrollo de software, proyectos de IA, automatización. Ideas y aprendizaje. Publicaciones',
  author: 'Yamil Ayma',
  imgProfile: 'https://avatars.githubusercontent.com/u/177412646',
  url: 'https://yamilayma.github.io',
  repo: 'https://github.com/yamilayma/blog',
  celebration: true, // Activa la animación de confeti al visitar el sitio por primera vez cada día
  cuteHeadings: true, // Activa un borde/contorno en los titulares para un estilo más esponjoso
  headingOutlineColor: '#ffffffff', // Color del borde de los titulares
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
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/yamilayma/',
    icon: 'linkedin',
  },
  {
    name: 'Email',
    href: 'mailto:yamilaymadev@gmail.com',
    icon: 'mail',
  },
  {
    name: 'Pinterest',
    href: 'https://es.pinterest.com/yamilaymaing/',
    icon: 'pinterest',
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
