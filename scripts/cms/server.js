import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 43210; // Puerto específico para evitar colisiones con el de Astro (4321)

const BLOG_ROOT = path.join(__dirname, '..', '..');
const CONTENT_DIR = path.join(BLOG_ROOT, 'src', 'content');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: sanitizar slugs y extensiones de archivos
function sanitizePath(col, filename) {
  const safeCol = path.basename(col);
  const safeFile = path.basename(filename);
  return path.join(CONTENT_DIR, safeCol, safeFile);
}

// Helper: separar frontmatter y markdown body
function parseFileContent(rawText) {
  // Regex para buscar el primer bloque de ---
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

// 1. Endpoint: Listar todos los contenidos por colección
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
      const files = fs.readdirSync(colPath).filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
      
      result[col] = files.map(file => {
        const filePath = path.join(colPath, file);
        const stat = fs.statSync(filePath);
        return {
          filename: file,
          slug: file.replace(/\.(md|mdx)$/, ''),
          updatedAt: stat.mtime
        };
      });
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al escanear directorio', details: err.message });
  }
});

// 2. Endpoint: Leer una entrada específica
app.get('/api/content/:collection/:filename', (req, res) => {
  try {
    const { collection, filename } = req.params;
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

// 3. Endpoint: Guardar y reescribir cambios en un archivo existente
app.post('/api/content/:collection/:filename', (req, res) => {
  try {
    const { collection, filename } = req.params;
    const { metadata, content } = req.body;
    const filePath = sanitizePath(collection, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    if (!metadata || typeof content === 'undefined') {
      return res.status(400).json({ error: 'Faltan datos requeridos (metadata o content)' });
    }

    // Convertir metadata a string YAML
    const yamlString = yaml.stringify(metadata).trim();
    // Reconstruir archivo markdown
    const fileContent = `---\n${yamlString}\n---\n\n${content.trim()}\n`;

    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log(`✓ Archivo modificado por el CMS: ${filePath}`);

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

    // Asegurarse de que termine en .md o .mdx
    let safeFilename = filename.trim();
    if (!safeFilename.endsWith('.md') && !safeFilename.endsWith('.mdx')) {
      safeFilename += '.md';
    }

    const filePath = sanitizePath(collection, safeFilename);

    if (fs.existsSync(filePath)) {
      return res.status(409).json({ error: 'El archivo ya existe' });
    }

    // Pre-poblar frontmatter por defecto según colección si está vacío
    const defaultMeta = { ...metadata };
    const today = new Date().toISOString().split('T')[0];

    if (Object.keys(defaultMeta).length === 0) {
      if (collection === 'blog') {
        defaultMeta.title = 'Nuevo Artículo';
        defaultMeta.description = 'Descripción del artículo';
        defaultMeta.date = today;
        defaultMeta.published = true;
        defaultMeta.category = 'General';
        defaultMeta.tags = ['general'];
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
        defaultMeta.features = [];
        defaultMeta.tecnologias = [];
        defaultMeta.links = [];
      } else if (collection === 'journal') {
        defaultMeta.title = 'Nueva Entrada de Bitácora';
        defaultMeta.date = today;
        defaultMeta.project = '';
        defaultMeta.published = true;
        defaultMeta.tags = [];
      } else if (collection === 'pages') {
        defaultMeta.title = 'Nueva Página';
        defaultMeta.description = 'Descripción SEO';
      }
    }

    // Convertir a string YAML
    const yamlString = yaml.stringify(defaultMeta).trim();
    const fileContent = `---\n${yamlString}\n---\n\n${content.trim() || '# ' + (defaultMeta.title || 'Nueva entrada')}\n`;

    // Crear el directorio de la colección si no existe
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 CMS de desarrollo listo en http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});
