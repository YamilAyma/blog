import fs from 'fs';
import path from 'path';
import { serializeYaml, parseFileContent } from './yamlFormatter.js';
import { gitCommit } from './git.js';

// Escaneo recursivo para construir el árbol jerárquico de contenidos
export function scanDir(baseDir, currentDir = '') {
  const fullPath = path.join(baseDir, currentDir);
  if (!fs.existsSync(fullPath)) return [];

  const items = fs.readdirSync(fullPath);
  const nodes = [];

  items.forEach(item => {
    const relativeItemPath = currentDir ? path.join(currentDir, item) : item;
    const itemFullPath = path.join(baseDir, relativeItemPath);
    const stat = fs.statSync(itemFullPath);

    const safeRelativePath = relativeItemPath.replace(/\\/g, '/');

    if (stat.isDirectory()) {
      const children = scanDir(baseDir, safeRelativePath);
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

  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

// Inyección de plantillas de contenido Markdown enriquecidas específicas por colección
export function getDefaultTemplate(collection, title = 'Nueva entrada') {
  const today = new Date().toISOString().split('T')[0];
  if (collection === 'blog') {
    return `# ${title}\n\n## Introducción\nEscribe una introducción cautivadora para tu artículo...\n\n## Desarrollo\nExplica detalladamente el tema aquí. Puedes usar listas, enlaces y bloques de código:\n- Primer punto clave\n- Segundo punto clave\n\n\`\`\`javascript\nconsole.log("¡Código de ejemplo!");\n\`\`\`\n\n## Conclusión\nResume las ideas principales y haz una llamada a la acción.`;
  } else if (collection === 'projects') {
    return `## Descripción\nResumen ejecutivo del proyecto y su propósito principal.\n\n## Características Clave\n- Detalle de la funcionalidad 1\n- Detalle de la funcionalidad 2\n\n## Despliegue e Instalación\nInstrucciones breves de cómo arrancar el proyecto localmente.`;
  } else if (collection === 'posts') {
    return `La clave de esta publicación corta...`;
  } else if (collection === 'journal') {
    return `## Exploración y Avances del Día (${today})\n- [x] Logro principal del desarrollo\n- [ ] Tarea pendiente para la siguiente iteración\n\n## Detalles Técnicos\nComentarios y fragmentos de código del desarrollo de hoy.`;
  } else {
    return `# ${title}\n\nContenido principal de la página.`;
  }
}

// Leer entrada física parseando YAML y Markdown
export function readEntry(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error('Archivo no encontrado');
  }
  const rawText = fs.readFileSync(filePath, 'utf-8');
  return parseFileContent(rawText);
}

// Guardar cambios en entrada existente y ejecutar Git Auto-Commit
export async function saveEntry(filePath, metadata, content, slug, collection) {
  const yamlString = serializeYaml(metadata);
  const fileContent = `---\n${yamlString}\n---\n\n${content.trim()}\n`;
  
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  console.log(`✓ Archivo modificado físicamente en: ${filePath}`);
  
  // Ejecutar auto-commit asíncrono de Git
  await gitCommit(filePath, 'update', slug, collection);
  return { success: true };
}

// Crear nueva entrada inyectando plantilla y ejecutar Git Auto-Commit
export async function createEntry(filePath, metadata, content, slug, collection) {
  const yamlString = serializeYaml(metadata);
  const fileContent = `---\n${yamlString}\n---\n\n${content}\n`;
  
  const collectionPath = path.dirname(filePath);
  if (!fs.existsSync(collectionPath)) {
    fs.mkdirSync(collectionPath, { recursive: true });
  }
  
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  console.log(`✓ Archivo nuevo creado físicamente en: ${filePath}`);
  
  // Ejecutar auto-commit asíncrono de Git
  await gitCommit(filePath, 'create', slug, collection);
  return { success: true };
}

// Borrar físicamente entrada y ejecutar Git Auto-Commit
export async function deleteEntry(filePath, slug, collection) {
  if (!fs.existsSync(filePath)) {
    throw new Error('Archivo no encontrado');
  }
  
  fs.unlinkSync(filePath);
  console.log(`✕ Archivo borrado físicamente en: ${filePath}`);
  
  // Ejecutar auto-commit asíncrono de Git (borrado)
  await gitCommit(filePath, 'delete', slug, collection);
  return { success: true };
}
