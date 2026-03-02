import { THEMES, DEFAULT_THEME_ID, CATEGORY_THEMES, type Theme } from '../config/themes';

/** Clave para almacenar la preferencia de tema en localStorage */
export const THEME_KEY = 'blog-theme-preference';
/** Clave para almacenar si el fondo personalizado está activo */
export const BACKGROUND_KEY = 'blog-bg-enabled';

/** Preferencias de tema disponibles */
export type ThemePreference = 'auto' | 'light' | 'dark';

/**
 * Obtiene la preferencia de tema guardada en localStorage.
 * @returns La preferencia del usuario, o 'auto' si no hay ninguna guardada
 */
export function getThemePreference(): ThemePreference {
  if (typeof localStorage !== 'undefined' && localStorage.getItem(THEME_KEY)) {
    return localStorage.getItem(THEME_KEY) as ThemePreference;
  }
  return 'auto';
}

/**
 * Guarda la preferencia de tema y notifica el cambio.
 * @param pref - La preferencia a guardar ('auto', 'light' o 'dark')
 */
export function setThemePreference(pref: ThemePreference) {
  localStorage.setItem(THEME_KEY, pref);
  window.dispatchEvent(new Event('theme-change'));
}

/** Obtiene si el fondo personalizado está activado en localStorage */
export function getBackgroundEnabled(): boolean {
  if (typeof localStorage !== 'undefined' && localStorage.getItem(BACKGROUND_KEY)) {
    return localStorage.getItem(BACKGROUND_KEY) === 'true';
  }
  return false;
}

/** Activa/desactiva el fondo personalizado y notifica el cambio */
export function setBackgroundEnabled(enabled: boolean) {
  localStorage.setItem(BACKGROUND_KEY, enabled ? 'true' : 'false');
  window.dispatchEvent(new Event('background-change'));
}

/**
 * Obtiene un tema por su ID.
 * @param id - El ID del tema a buscar
 * @returns El tema encontrado, o el primer tema si no existe
 */
export function getThemeById(id: string): Theme {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

/**
 * Aplica el tema correspondiente basándose en:
 * 1. Preferencia del usuario (oscuro fuerza tema oscuro)
 * 2. Preferencia del sistema (si es 'auto')
 * 3. Categoría del post (para temas claros)
 * 
 * @param category - Categoría opcional del post actual
 */
export function applyTheme(category?: string) {
  const preference = getThemePreference();
  let themeId = DEFAULT_THEME_ID;

  // Detectar si el sistema o el usuario prefiere modo oscuro
  const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const wantsDark = preference === 'dark' || (preference === 'auto' && systemDark);

  if (wantsDark) {
    // Modo oscuro: siempre usa el tema 'dark'
    themeId = 'dark';
    document.documentElement.classList.add('dark');
  } else {
    // Modo claro: respeta la categoría del post si existe
    document.documentElement.classList.remove('dark');
    if (category && CATEGORY_THEMES[category]) {
      themeId = CATEGORY_THEMES[category];
    } else {
      themeId = DEFAULT_THEME_ID;
    }
  }

  const theme = getThemeById(themeId);
  if (!theme) return;

  const root = document.documentElement;

  // Fondo personalizado: si el usuario lo activó, usar los datos del tema
  const bgEnabled = typeof window !== 'undefined' && getBackgroundEnabled();
  if (bgEnabled && theme.background) {
    // color sólido de fondo puede venir de background.color o del color normal
    if (theme.background.color) {
      root.style.setProperty('--color-background', theme.background.color);
    }
    // imagen (cadena CSS completa, p.ej. url('...'))
    if (theme.background.image) {
      root.style.setProperty('--site-background-image', theme.background.image);
    } else {
      root.style.setProperty('--site-background-image', 'none');
    }
    // parámetros adicionales (repeat, size, position)
    root.style.setProperty('--site-background-repeat', theme.background.repeat || 'repeat');
    if (theme.background.size) {
      root.style.setProperty('--site-background-size', theme.background.size);
    }
    if (theme.background.position) {
      root.style.setProperty('--site-background-position', theme.background.position);
    }
    root.classList.add('bg-image');
  } else {
    root.style.setProperty('--site-background-image', 'none');
    root.style.setProperty('--site-background-repeat', 'no-repeat');
    root.style.setProperty('--site-background-size', 'cover');
    root.style.setProperty('--site-background-position', 'center');
    root.classList.remove('bg-image');
  }

  // Colores principales
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-border', theme.colors.border);

  // Tipografías
  root.style.setProperty('--font-heading', theme.fonts.heading);
  root.style.setProperty('--font-body', theme.fonts.body);

  // Colores de UI
  root.style.setProperty('--ui-site-title', theme.ui.siteTitle);
  root.style.setProperty('--ui-nav-link', theme.ui.navLink);
  root.style.setProperty('--ui-nav-link-hover', theme.ui.navLinkHover);

  // Colores de Markdown
  root.style.setProperty('--md-h1', theme.markdown.h1);
  root.style.setProperty('--md-h2', theme.markdown.h2);
  root.style.setProperty('--md-h3', theme.markdown.h3);
  root.style.setProperty('--md-h4', theme.markdown.h4);
  root.style.setProperty('--md-h5', theme.markdown.h5);
  root.style.setProperty('--md-h6', theme.markdown.h6);
  root.style.setProperty('--md-p', theme.markdown.p);
  root.style.setProperty('--md-bold', theme.markdown.bold);
  root.style.setProperty('--md-italic', theme.markdown.italic);
  root.style.setProperty('--md-a', theme.markdown.a);
  root.style.setProperty('--md-a-hover', theme.markdown.aHover);
  root.style.setProperty('--md-code', theme.markdown.code);
  root.style.setProperty('--md-code-bg', theme.markdown.codeBg);
  root.style.setProperty('--md-blockquote', theme.markdown.blockquote);
  root.style.setProperty('--md-blockquote-border', theme.markdown.blockquoteBorder);
  root.style.setProperty('--md-hr', theme.markdown.hr);
}

// Se ejecuta al cargar el script en el navegador
if (typeof window !== 'undefined') {
    // Obtener categoría del post actual (si existe)
    const category = document.body.dataset.category;
    applyTheme(category);
    
    // Escuchar cambios de preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(category));
    
    // Escuchar cambios manuales de tema
    window.addEventListener('theme-change', () => applyTheme(category));
    // Escuchar cambios del fondo personalizado
    window.addEventListener('background-change', () => applyTheme(category));
}
