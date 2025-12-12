// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://yamilayma.github.io',
  base: '/', // Adjust if deploying to a subpath like /blog, but user said yamilayma.github.io (root)
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
    gfm: true,
  },
  integrations: [react(), sitemap(), mdx()]
});