import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 43210; // Puerto específico para evitar colisiones con Astro

const BLOG_ROOT = path.join(__dirname, '..', '..');
const CONTENT_DIR = path.join(BLOG_ROOT, 'src', 'content');

// Incrementar límite de tamaño para poder recibir imágenes en Base64 grandes
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Servir favicon.svg real del blog
app.get('/favicon.svg', (req, res) => {
  const favPath = path.join(BLOG_ROOT, 'public', 'favicon.svg');
  if (fs.existsSync(favPath)) {
    res.sendFile(favPath);
  } else {
    res.sendStatus(404);
  }
});

// Helper: sanitizar slugs y extensiones de archivos
function sanitizePath(col, filename) {
  const safeCol = path.basename(col);
  const safeFile = filename.replace(/\.\./g, '');
  return path.join(CONTENT_DIR, safeCol, safeFile);
}

// Helper: separar frontmatter y markdown body
function parseFileContent(rawText) {
  const match = rawText.match(/^---\r?\n([\s\S]+?)\r?\n---([\s\S]*)/);
  if (!match) {
    return { metadata: {}, content: rawText };
  }
  
  const yamlText = match[1];
  const markdownBody = match[2];
  
  try {
    const metadata = yaml.parse(yamlText) || {};
    return { metadata, content: markdownBody.trim() };
  } catch (err) {
    console.error('Error parseando YAML:', err);
    return { metadata: {}, content: rawText, error: 'Error al parsear metadatos frontmatter' };
  }
}

// Escaneo recursivo para construir el árbol jerárquico de subcarpetas físicas
function scanDir(baseDir, currentDir = '') {
  const fullPath = path.join(baseDir, currentDir);
  if (!fs.existsSync(fullPath)) return [];

  const items = fs.readdirSync(fullPath);
  const nodes = [];

  items.forEach(item => {
    const relativeItemPath = currentDir ? path.join(currentDir, item) : item;
    const itemFullPath = path.join(baseDir, relativeItemPath);
    const stat = fs.statSync(itemFullPath);

    // Reemplazar diagonales inversas en Windows para normalizar a '/'
    const safeRelativePath = relativeItemPath.replace(/\\/g, '/');

    if (stat.isDirectory()) {
      const children = scanDir(baseDir, safeRelativePath);
      // Sumar conteo total de archivos
      let filesCount = 0;
      children.forEach(c => {
        if (c.type === 'file') filesCount++;
        else filesCount += c.filesCount;
      });

      nodes.push({
        name: item,
        type: 'directory',
        relativePath: safeRelativePath,
        filesCount,
        children
      });
    } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
      nodes.push({
        name: item,
        type: 'file',
        filename: safeRelativePath,
        slug: safeRelativePath.replace(/\.(md|mdx)$/, ''),
        updatedAt: stat.mtime
      });
    }
  });

  // Ordenar directorios primero, luego archivos alfabéticamente
  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

// 1. Endpoint: Listar contenidos jerárquicos por colección
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
    res.status(500).json({ error: 'Error al escanear directorio', details: err.message });
  }
});

// 2. Endpoint: Leer una entrada específica (admite subcarpetas vía expresión regular)
app.get(/\/api\/content\/([^\/]+)\/(.+)/, (req, res) => {
  try {
    const collection = req.params[0];
    const filename = req.params[1];
    const filePath = sanitizePath(collection, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const rawText = fs.readFileSync(filePath, 'utf-8');
    const parsedData = parseFileContent(rawText);

    res.json(parsedData);
  } catch (err) {
    res.status(500).json({ error: 'Error al leer el archivo', details: err.message });
  }
});

// 3. Endpoint: Guardar cambios en archivo existente (admite subcarpetas vía expresión regular)
app.post(/\/api\/content\/([^\/]+)\/(.+)/, (req, res) => {
  try {
    const collection = req.params[0];
    const filename = req.params[1];
    const { metadata, content } = req.body;
    const filePath = sanitizePath(collection, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    if (!metadata || typeof content === 'undefined') {
      return res.status(400).json({ error: 'Faltan datos requeridos (metadata o content)' });
    }

    // Limpieza de metadatos según especificaciones
    const cleanMeta = { ...metadata };
    
    // Forzar que el campo 'description' esté en una sola línea
    if (cleanMeta.description) {
      cleanMeta.description = cleanMeta.description.toString().replace(/\r?\n|\r/g, ' ').trim();
    }

    // Crear Documento AST de YAML para forzar serialización estricta y limpia
    const doc = new yaml.Document(cleanMeta);
    
    // Forzar que los arrays simples se rendericen inline como [a, b] y todos los strings lleven comillas dobles
    yaml.visit(doc, {
      Seq(key, node) {
        node.flow = true; // Modo flujo (inline)
      },
      Scalar(key, node) {
        if (typeof node.value === 'string') {
          node.type = 'QUOTE_DOUBLE'; // Forzar comillas dobles en strings
        }
      }
    });

    const yamlString = doc.toString({
      lineWidth: 0, // Evitar que salte de línea para textos largos como la descripción
      doubleQuotedAsJSON: true // Forzar comillas dobles estilo JSON en strings
    }).trim();

    // Reconstruir archivo markdown con frontmatter
    const fileContent = `---\n${yamlString}\n---\n\n${content.trim()}\n`;

    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log(`✓ Archivo guardado y formateado por el CMS: ${filePath}`);

    res.json({ success: true, message: 'Archivo guardado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al escribir el archivo', details: err.message });
  }
});

// 4. Endpoint: Crear un nuevo archivo en una colección
app.post('/api/content/:collection', (req, res) => {
  try {
    const { collection } = req.params;
    const { filename, metadata = {}, content = '' } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'El nombre de archivo (filename) es requerido' });
    }

    let safeFilename = filename.trim();
    if (!safeFilename.endsWith('.md') && !safeFilename.endsWith('.mdx')) {
      safeFilename += '.md';
    }

    const filePath = sanitizePath(collection, safeFilename);

    if (fs.existsSync(filePath)) {
      return res.status(409).json({ error: 'El archivo ya existe' });
    }

    const defaultMeta = { ...metadata };
    const today = new Date().toISOString().split('T')[0];

    // Pre-poblar frontmatter según la colección
    if (Object.keys(defaultMeta).length === 0) {
      if (collection === 'blog') {
        defaultMeta.title = 'Nuevo Artículo';
        defaultMeta.description = 'Descripción del artículo';
        defaultMeta.date = today;
        defaultMeta.published = true;
        defaultMeta.category = 'General';
        defaultMeta.image = '';
        defaultMeta.tags = ['general'];
        defaultMeta.layout = '';
      } else if (collection === 'posts') {
        defaultMeta.date = today;
        defaultMeta.published = true;
        defaultMeta.category = 'General';
        defaultMeta.tags = [];
        defaultMeta.image = '';
        defaultMeta.copy = 'Mensaje corto de la bitácora...';
      } else if (collection === 'projects') {
        defaultMeta.title = 'Nuevo Proyecto';
        defaultMeta.description = 'Descripción detallada del proyecto';
        defaultMeta.periodo = '2026';
        defaultMeta.order = 0;
        defaultMeta.image = '';
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

    // Forzar línea única en descripción
    if (defaultMeta.description) {
      defaultMeta.description = defaultMeta.description.toString().replace(/\r?\n|\r/g, ' ').trim();
    }

    const doc = new yaml.Document(defaultMeta);
    yaml.visit(doc, {
      Seq(key, node) {
        node.flow = true; // Modo flujo (inline)
      },
      Scalar(key, node) {
        if (typeof node.value === 'string') {
          node.type = 'QUOTE_DOUBLE'; // Forzar comillas dobles en strings
        }
      }
    });

    const yamlString = doc.toString({
      lineWidth: 0,
      doubleQuotedAsJSON: true
    }).trim();

    const fileContent = `---\n${yamlString}\n---\n\n${content.trim() || '# ' + (defaultMeta.title || 'Nueva entrada')}\n`;

    const collectionPath = path.dirname(filePath);
    if (!fs.existsSync(collectionPath)) {
      fs.mkdirSync(collectionPath, { recursive: true });
    }

    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log(`✓ Archivo nuevo creado por el CMS: ${filePath}`);

    res.status(201).json({ success: true, message: 'Archivo creado con éxito', filename: safeFilename });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el archivo', details: err.message });
  }
});

// 5. Endpoint POST: Subida de imágenes locales decodificando Base64
app.post('/api/media', (req, res) => {
  try {
    const { filename, targetDir, image } = req.body;
    if (!filename || !image) {
      return res.status(400).json({ error: 'Faltan datos requeridos (filename o image)' });
    }

    // Extraer el base64 del Data URL
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Formato de imagen inválido' });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    
    // Carpeta física destino en assets
    let relativeDestDir = path.join('src', 'assets', 'images');
    if (targetDir === 'projects') {
      relativeDestDir = path.join('src', 'assets', 'images', 'projects');
    } else if (targetDir === 'blog') {
      relativeDestDir = path.join('src', 'assets', 'images', 'blog');
    }

    const destDir = path.join(BLOG_ROOT, relativeDestDir);

    // Asegurar existencia de la carpeta
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const safeFilename = path.basename(filename).replace(/\s+/g, '_');
    const destFilePath = path.join(destDir, safeFilename);

    // Guardar archivo binario
    fs.writeFileSync(destFilePath, buffer);
    console.log(`✓ Imagen física guardada por el CMS: ${destFilePath}`);

    // Calcular la ruta relativa que se guardará en el Frontmatter
    // Desde src/content/[colección]/ el acceso a src/assets/images/ es:
    let relativeUrl = '../../assets/images/' + safeFilename;
    if (targetDir === 'projects') {
      relativeUrl = '../../assets/images/projects/' + safeFilename;
    } else if (targetDir === 'blog') {
      relativeUrl = '../../assets/images/blog/' + safeFilename;
    }

    res.json({ success: true, url: relativeUrl });
  } catch (err) {
    res.status(500).json({ error: 'Error al subir la imagen', details: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 CMS de desarrollo listo en http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});
