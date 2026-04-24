// scripts/flat-sitemap.js
import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');
const sitemap0Path = path.join(distDir, 'sitemap-0.xml');
const sitemapIndexPath = path.join(distDir, 'sitemap-index.xml');
const finalSitemapPath = path.join(distDir, 'sitemap.xml');

console.log('🚀 Iniciando aplanado de sitemap...');

// Astro genera sitemap-0.xml y sitemap-index.xml por defecto
if (fs.existsSync(sitemap0Path)) {
  // Renombramos el sitemap que tiene las rutas al nombre clásico
  fs.renameSync(sitemap0Path, finalSitemapPath);
  console.log('✅ sitemap-0.xml renombrado a sitemap.xml');

  // Borramos el Index que confunde a Google Search Console
  if (fs.existsSync(sitemapIndexPath)) {
    fs.unlinkSync(sitemapIndexPath);
    console.log('🗑️ sitemap-index.xml eliminado');
  }
} else {
  console.log('⚠️ No se encontró sitemap-0.xml. Asegúrate de haber corrido astro build primero.');
}
