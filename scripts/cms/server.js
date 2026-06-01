import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';
import { spawn } from 'child_process';
import net from 'net';

// Importar submódulos de la API modularizada
import { scanDir, readEntry, saveEntry, createEntry, deleteEntry, getDefaultTemplate, getCustomComponents } from './api/content.js';
import { scanFolders, createFolder, uploadMedia } from './api/media.js';
import { gitCommit, gitPush } from './api/git.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 43210; // Puerto del CMS local

const BLOG_ROOT = path.join(__dirname, '..', '..');
const CONTENT_DIR = path.join(BLOG_ROOT, 'src', 'content');
const ASSETS_DIR = path.join(BLOG_ROOT, 'src', 'assets');

// Middleware para cuerpos JSON grandes
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Mapear carpetas físicas de assets para previsualizar de inmediato
app.use('/assets', express.static(ASSETS_DIR));
app.use('/src/assets', express.static(ASSETS_DIR));

// Endpoint: Favicon real
app.get('/favicon.svg', (req, res) => {
  const favPath = path.join(BLOG_ROOT, 'public', 'favicon.svg');
  if (fs.existsSync(favPath)) {
    res.sendFile(favPath);
  } else {
    res.sendStatus(404);
  }
});

// Endpoint: Loader dinámico
app.get('/loader.gif', (req, res) => {
  const loaderCmsPath = path.join(__dirname, 'public', 'loader.gif');
  const loaderBlogPath = path.join(BLOG_ROOT, 'public', 'loader.gif');
  if (fs.existsSync(loaderCmsPath)) {
    res.sendFile(loaderCmsPath);
  } else if (fs.existsSync(loaderBlogPath)) {
    res.sendFile(loaderBlogPath);
  } else {
    res.sendStatus(404);
  }
});

// Helper: Sanitizar rutas y evitar Directory Traversal
function sanitizePath(col, filename) {
  const safeCol = path.basename(col);
  const safeFile = filename.replace(/\.\./g, '');
  return path.join(CONTENT_DIR, safeCol, safeFile);
}

// 1. Endpoint: Listar contenidos jerárquicos recursivos por colección
app.get('/api/content', (req, res) => {
  try {
    if (!fs.existsSync(CONTENT_DIR)) {
      return res.status(404).json({ error: 'Directorio src/content no encontrado' });
    }

    const collections = fs.readdirSync(CONTENT_DIR).filter(item => {
      return fs.statSync(path.join(CONTENT_DIR, item)).isDirectory();
    });

    const result = {};
    collections.forEach(col => {
      const colPath = path.join(CONTENT_DIR, col);
      result[col] = scanDir(colPath);
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al escanear contenidos', details: err.message });
  }
});

// 2. Endpoint GET: Leer entrada (comodín RegExp universal)
app.get(/\/api\/content\/([^\/]+)\/(.+)/, (req, res) => {
  try {
    const collection = req.params[0];
    const filename = req.params[1];
    const filePath = sanitizePath(collection, filename);

    const data = readEntry(filePath);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al leer el archivo', details: err.message });
  }
});

// 3. Endpoint POST: Guardar cambios y auto-comitear (RegExp universal)
app.post(/\/api\/content\/([^\/]+)\/(.+)/, async (req, res) => {
  try {
    const collection = req.params[0];
    const filename = req.params[1];
    const { metadata, content } = req.body;
    const filePath = sanitizePath(collection, filename);

    const slug = filename.replace(/\.(md|mdx)$/, '');
    
    // Guardar y auto-comitear
    const result = await saveEntry(filePath, metadata, content, slug, collection);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el archivo', details: err.message });
  }
});

// 4. Endpoint DELETE: Eliminar físicamente y auto-comitear (RegExp universal)
app.delete(/\/api\/content\/([^\/]+)\/(.+)/, async (req, res) => {
  try {
    const collection = req.params[0];
    const filename = req.params[1];
    const filePath = sanitizePath(collection, filename);

    const slug = filename.replace(/\.(md|mdx)$/, '');

    // Borrar y auto-comitear
    const result = await deleteEntry(filePath, slug, collection);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar el archivo', details: err.message });
  }
});

// 5. Endpoint POST: Crear nuevo recurso en subcarpeta elegida
app.post('/api/content/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const { filename, targetDir = '', metadata = {}, content = '' } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'El nombre de archivo (filename) es requerido' });
    }

    let safeFilename = filename.trim();
    if (!safeFilename.endsWith('.md') && !safeFilename.endsWith('.mdx')) {
      safeFilename += '.md';
    }

    // Calcular subcarpeta elegida en caliente
    const cleanTargetDir = targetDir.replace(/\.\./g, '');
    const relativeFilePath = cleanTargetDir ? path.join(cleanTargetDir, safeFilename) : safeFilename;
    const filePath = sanitizePath(collection, relativeFilePath);

    if (fs.existsSync(filePath)) {
      return res.status(409).json({ error: 'El archivo ya existe en esa ubicación' });
    }

    const defaultMeta = { ...metadata };
    const today = new Date().toISOString().split('T')[0];

    // Pre-poblar frontmatter por defecto si está vacío
    if (Object.keys(defaultMeta).length === 0) {
      if (collection === 'blog') {
        defaultMeta.title = 'Nuevo Artículo';
        defaultMeta.description = 'Descripción del artículo';
        defaultMeta.date = today;
        defaultMeta.published = true;
        defaultMeta.category = 'General';
        defaultMeta.image = '';
        defaultMeta.tags = ['general'];
        defaultMeta.layout = '../../layouts/BlogPost.astro';
      } else if (collection === 'posts') {
        defaultMeta.date = today;
        defaultMeta.published = true;
        defaultMeta.category = 'General';
        defaultMeta.tags = [];
        defaultMeta.image = '';
        defaultMeta.imageAlt = 'Descripción de la imagen';
        defaultMeta.copy = 'Copy corto del post...';
      } else if (collection === 'projects') {
        defaultMeta.title = 'Nuevo Proyecto';
        defaultMeta.description = 'Descripción detallada del proyecto';
        defaultMeta.periodo = '2026';
        defaultMeta.order = 0;
        defaultMeta.image = '';
        defaultMeta.imagenes = [];
        defaultMeta.tags = [];
        defaultMeta.videoYoutube = '';
      } else if (collection === 'journal') {
        defaultMeta.title = 'Nueva Entrada de Bitácora';
        defaultMeta.date = today;
        defaultMeta.description = '';
        defaultMeta.project = '';
        defaultMeta.published = true;
        defaultMeta.image = '';
        defaultMeta.tags = [];
      } else if (collection === 'pages') {
        defaultMeta.title = 'Nueva Página';
        defaultMeta.description = 'Descripción SEO';
      }
    }

    // Inyectar cuerpo Markdown inicial enriquecido
    const defaultContent = content.trim() || getDefaultTemplate(collection, defaultMeta.title);
    const slug = relativeFilePath.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');

    // Crear y auto-comitear
    const result = await createEntry(filePath, defaultMeta, defaultContent, slug, collection);
    res.json({ ...result, filename: relativeFilePath.replace(/\\/g, '/') });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el archivo', details: err.message });
  }
});

// 6. Endpoint GET: Escanear subcarpetas dentro de una colección física
app.get('/api/content-folders/:collection', (req, res) => {
  try {
    const { collection } = req.params;
    const baseColDir = path.join(CONTENT_DIR, path.basename(collection));
    if (!fs.existsSync(baseColDir)) {
      return res.json([]);
    }
    const folders = scanFolders(baseColDir);
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar subcarpetas', details: err.message });
  }
});

// 7. Endpoint POST: Crear una subcarpeta física dentro de una colección
app.post('/api/content-folders/:collection', (req, res) => {
  try {
    const { collection } = req.params;
    const { parentPath, newFolderName } = req.body;
    const baseColDir = path.join(CONTENT_DIR, path.basename(collection));

    const relativePath = createFolder(baseColDir, parentPath, newFolderName);
    res.json({ success: true, relativePath });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear subcarpeta', details: err.message });
  }
});

// 8. Endpoint GET: Obtener el árbol de carpetas de assets/
app.get('/api/media-folders', (req, res) => {
  try {
    if (!fs.existsSync(ASSETS_DIR)) {
      return res.json([]);
    }
    const folderTree = scanFolders(ASSETS_DIR);
    res.json(folderTree);
  } catch (err) {
    res.status(500).json({ error: 'Error al escanear assets', details: err.message });
  }
});

// 9. Endpoint POST: Crear una carpeta física en assets/
app.post('/api/media-folders', (req, res) => {
  try {
    const { parentPath, newFolderName } = req.body;
    const relativePath = createFolder(ASSETS_DIR, parentPath, newFolderName);
    res.json({ success: true, relativePath });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear carpeta de assets', details: err.message });
  }
});

// 10. Endpoint POST: Subir imagen Base64 y ejecutar Git Auto-Commit
app.post('/api/media', async (req, res) => {
  try {
    const { filename, targetDir, image } = req.body;
    const uploadResult = uploadMedia(BLOG_ROOT, filename, targetDir, image);

    // Auto-commit para la imagen subida en assets
    await gitCommit(uploadResult.destFilePath, 'media', uploadResult.safeFilename, 'assets');

    res.json({ success: true, url: uploadResult.relativeUrl });
  } catch (err) {
    res.status(500).json({ error: 'Error al subir imagen', details: err.message });
  }
});

// 11. Endpoint GET: Validar la existencia física de imágenes locales
app.get('/api/validate-assets', (req, res) => {
  try {
    const pathsQuery = req.query.paths;
    if (!pathsQuery) return res.json({});

    const pathsToCheck = pathsQuery.split(',');
    const result = {};

    pathsToCheck.forEach(imgUrl => {
      const cleanUrl = imgUrl.trim();
      if (!cleanUrl) return;

      if (/^https?:\/\//i.test(cleanUrl)) {
        result[cleanUrl] = true;
        return;
      }

      let absoluteImgPath = '';
      if (cleanUrl.startsWith('/src/assets/')) {
        absoluteImgPath = path.join(BLOG_ROOT, cleanUrl);
      } else {
        const normalPath = cleanUrl
          .replace(/^\.\.\/\.\.\/\.\.\//, '')
          .replace(/^\.\.\/\.\.\//, '')
          .replace(/^src\//, '');
        absoluteImgPath = path.join(BLOG_ROOT, 'src', normalPath);
      }

      result[cleanUrl] = fs.existsSync(absoluteImgPath);
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error en validación', details: err.message });
  }
});

// 12. Endpoint POST: Ejecutar Git Push asíncronamente
app.post('/api/git-push', async (req, res) => {
  try {
    const result = await gitPush();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Fallo al ejecutar Git Push', details: err.message });
  }
});

// 13. Endpoint GET: Obtener base de datos de componentes personalizados
app.get('/api/custom-components', (req, res) => {
  try {
    const data = getCustomComponents();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar componentes', details: err.message });
  }
});

let astroProcess = null;

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

async function startAstroDev() {
  const isPortInUse = await checkPort(4321);
  if (isPortInUse) {
    console.log('⚡ El servidor de desarrollo de Astro ya parece estar ejecutándose en el puerto 4321.');
    return;
  }

  console.log('🚀 Iniciando servidor de desarrollo de Astro en segundo plano...');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  astroProcess = spawn(npmCmd, ['run', 'dev'], {
    cwd: BLOG_ROOT,
    stdio: 'ignore',
    detached: false
  });

  astroProcess.on('error', (err) => {
    console.error('❌ Error al iniciar el servidor de Astro:', err);
  });

  astroProcess.unref();
}

function cleanup() {
  if (astroProcess) {
    console.log('Apagando servidor de desarrollo de Astro...');
    astroProcess.kill();
    astroProcess = null;
  }
}

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit();
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit();
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`\n🚀 CMS de desarrollo listo en http://localhost:${PORT}`);
  await startAstroDev();
  open(`http://localhost:${PORT}`);
});
