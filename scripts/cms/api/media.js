import fs from 'fs';
import path from 'path';

// Escanear jerarquía de carpetas recursivamente (excluyendo archivos)
export function scanFolders(baseDir, currentDir = '') {
  const fullPath = path.join(baseDir, currentDir);
  if (!fs.existsSync(fullPath)) return [];

  const items = fs.readdirSync(fullPath);
  const folders = [];

  items.forEach(item => {
    const relativeItemPath = currentDir ? path.join(currentDir, item) : item;
    const itemFullPath = path.join(baseDir, relativeItemPath);
    const stat = fs.statSync(itemFullPath);

    if (stat.isDirectory()) {
      const safeRelativePath = relativeItemPath.replace(/\\/g, '/');
      folders.push({
        name: item,
        relativePath: safeRelativePath,
        children: scanFolders(baseDir, safeRelativePath)
      });
    }
  });

  return folders.sort((a, b) => a.name.localeCompare(b.name));
}

// Crear una nueva carpeta física dentro de assets/
export function createFolder(baseDir, parentPath, newFolderName) {
  const safeFolderName = newFolderName.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  const cleanParent = (parentPath || '').replace(/\.\./g, '');
  const targetDirPath = path.join(baseDir, cleanParent, safeFolderName);

  if (fs.existsSync(targetDirPath)) {
    throw new Error('La carpeta ya existe');
  }

  fs.mkdirSync(targetDirPath, { recursive: true });
  
  const relativePath = cleanParent 
    ? `${cleanParent.replace(/\/$/, '')}/${safeFolderName}` 
    : safeFolderName;

  return relativePath;
}

// Guardar imagen Base64 físicamente en assets/
export function uploadMedia(blogRoot, filename, targetDir, image) {
  const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Formato de imagen inválido');
  }

  const buffer = Buffer.from(matches[2], 'base64');
  
  // Carpeta destino relativa a src/assets/
  const cleanTargetDir = (targetDir || '').replace(/\.\./g, '');
  const relativeDestDir = path.join('src', 'assets', cleanTargetDir);
  const destDir = path.join(blogRoot, relativeDestDir);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const safeFilename = path.basename(filename).replace(/\s+/g, '_');
  const destFilePath = path.join(destDir, safeFilename);

  fs.writeFileSync(destFilePath, buffer);
  
  // Calcular ruta relativa compatible con importación de Astro
  const cleanTargetSlash = cleanTargetDir ? cleanTargetDir.replace(/\/$/, '') + '/' : '';
  const relativeUrl = `../../assets/${cleanTargetSlash}${safeFilename}`;

  return { relativeUrl, destFilePath, safeFilename };
}

// Verificar existencia de archivo de imagen físicamente
export function checkFileExists(blogRoot, targetDir, filename) {
  const cleanTargetDir = (targetDir || '').replace(/\.\./g, '');
  const safeFilename = path.basename(filename).replace(/\s+/g, '_');
  const destDir = path.join(blogRoot, 'src', 'assets', cleanTargetDir);
  const destFilePath = path.join(destDir, safeFilename);
  return fs.existsSync(destFilePath);
}

// Cargar la configuración local de límites
export function loadConfig() {
  try {
    const configPath = path.join(process.cwd(), 'scripts', 'cms', 'config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error al cargar config.json:', e);
  }
  return { warningLimit: 10, dangerLimit: 50 };
}

// Obtener todos los archivos .md y .mdx de forma recursiva en un directorio
export function getAllContentFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllContentFiles(fullPath, files);
    } else if (stat.isFile() && /\.(md|mdx)$/i.test(item)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Obtener todas las imágenes en un directorio recursivamente
export function getAllImages(baseDir, relativeRoot, currentDir = '', images = []) {
  const fullPath = path.join(baseDir, currentDir);
  if (!fs.existsSync(fullPath)) return images;

  const items = fs.readdirSync(fullPath);
  for (const item of items) {
    const relativeItemPath = currentDir ? path.join(currentDir, item) : item;
    const safeRelativePath = relativeItemPath.replace(/\\/g, '/');
    const itemFullPath = path.join(baseDir, safeRelativePath);
    const stat = fs.statSync(itemFullPath);

    if (stat.isDirectory()) {
      getAllImages(baseDir, relativeRoot, safeRelativePath, images);
    } else if (stat.isFile() && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item)) {
      const sizeBytes = stat.size;
      const extension = path.extname(item).toLowerCase();
      const fullRelativePath = `${relativeRoot}/${safeRelativePath}`;
      images.push({
        name: item,
        relativePath: safeRelativePath,
        fullRelativePath,
        extension,
        sizeBytes,
        absolutePath: itemFullPath
      });
    }
  }
  return images;
}

// Comprobar si un recurso se usa en un contenido
export function isResourceUsedInContent(content, resource) {
  if (!content.includes(resource.name)) return false;

  const cleanPath = resource.fullRelativePath.replace(/\\/g, '/');
  const pathWithoutSrc = cleanPath.replace(/^src\//, '');
  if (content.includes(pathWithoutSrc)) return true;

  if (content.includes(resource.relativePath)) return true;

  const escapedName = resource.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`['"\\(\\s]${escapedName}['"\\)\\s]`, 'i');
  if (regex.test(content)) return true;

  return false;
}

// Obtener el conteo de usos y archivos de cada recurso
export function getResourceUsages(blogRoot, resources) {
  const contentDir = path.join(blogRoot, 'src', 'content');
  const files = getAllContentFiles(contentDir);
  
  const fileContents = files.map(file => ({
    path: file,
    content: fs.readFileSync(file, 'utf8')
  }));

  const usages = {};
  for (const resource of resources) {
    usages[resource.fullRelativePath] = [];
    for (const item of fileContents) {
      if (isResourceUsedInContent(item.content, resource)) {
        usages[resource.fullRelativePath].push({
          filePath: item.path,
          relativePath: path.relative(blogRoot, item.path).replace(/\\/g, '/')
        });
      }
    }
  }
  return usages;
}

// Escanear todos los recursos en src/assets y public
export function scanAllResources(blogRoot) {
  const assetsDir = path.join(blogRoot, 'src', 'assets');
  const publicDir = path.join(blogRoot, 'public');

  const assetsImages = getAllImages(assetsDir, 'src/assets');
  const publicImages = getAllImages(publicDir, 'public');
  const allImages = [...assetsImages, ...publicImages];

  const usages = getResourceUsages(blogRoot, allImages);
  const config = loadConfig();

  const resources = allImages.map(img => {
    const imgUsages = usages[img.fullRelativePath] || [];
    
    // Determinar la URL para previsualización
    let url = '';
    if (img.fullRelativePath.startsWith('src/assets/')) {
      url = `/assets/${img.relativePath}`;
    } else if (img.fullRelativePath.startsWith('public/')) {
      url = `/${img.relativePath}`;
    }

    return {
      name: img.name,
      relativePath: img.relativePath,
      fullRelativePath: img.fullRelativePath,
      extension: img.extension,
      sizeBytes: img.sizeBytes,
      url,
      usages: imgUsages.map(u => u.relativePath),
      usagesCount: imgUsages.length
    };
  });

  return {
    assetsTree: scanFolders(assetsDir),
    publicTree: scanFolders(publicDir),
    resources,
    config
  };
}

// Renombrar físicamente un recurso y actualizar referencias en posts (Dependency Tracker)
export async function renameResource(blogRoot, fullRelativePath, newName) {
  const cleanPath = fullRelativePath.replace(/\.\./g, '');
  const absolutePath = path.join(blogRoot, cleanPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error('El archivo original no existe');
  }

  const dir = path.dirname(absolutePath);
  const newAbsolutePath = path.join(dir, newName);

  if (fs.existsSync(newAbsolutePath)) {
    throw new Error('Ya existe un archivo con ese nombre en esa ubicación');
  }

  // Renombrar archivo físico
  fs.renameSync(absolutePath, newAbsolutePath);

  // Calcular el nuevo fullRelativePath
  const newFullRelativePath = path.join(path.dirname(cleanPath), newName).replace(/\\/g, '/');

  // Ejecutar el Dependency Tracker
  const oldName = path.basename(cleanPath);
  const contentDir = path.join(blogRoot, 'src', 'content');
  const files = getAllContentFiles(contentDir);
  const { gitCommit } = await import('./git.js');

  const affectedFiles = [];
  const escapedOldName = oldName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  // Reemplazar solo cuando es parte de una ruta o está envuelto
  const regex = new RegExp(`([\\/\\s"\\'\\(])${escapedOldName}(?=[\\s"\\'\\)]|$)`, 'g');

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(oldName)) {
      const newContent = content.replace(regex, `$1${newName}`);
      if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        affectedFiles.push(file);
        
        // Auto-commit para cada post modificado
        const fileSlug = path.basename(file, path.extname(file));
        const collection = path.basename(path.dirname(file));
        await gitCommit(file, 'resource_update_ref', `${oldName} -> ${newName} en ${fileSlug}`, collection);
      }
    }
  }

  // Auto-commit para la imagen renombrada
  await gitCommit(newAbsolutePath, 'resource_rename', `${oldName} -> ${newName}`, 'assets');

  return {
    success: true,
    newFullRelativePath,
    affectedFilesCount: affectedFiles.length
  };
}

// Eliminar físicamente un recurso y comitear
export async function deleteResource(blogRoot, fullRelativePath) {
  const cleanPath = fullRelativePath.replace(/\.\./g, '');
  const absolutePath = path.join(blogRoot, cleanPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error('El archivo no existe');
  }

  fs.unlinkSync(absolutePath);

  const { gitCommit } = await import('./git.js');
  const filename = path.basename(cleanPath);
  await gitCommit(absolutePath, 'resource_delete', filename, 'assets');

  return { success: true };
}

// Reemplazar una imagen existente y comitear
export async function replaceResource(blogRoot, fullRelativePath, imageBase64) {
  const cleanPath = fullRelativePath.replace(/\.\./g, '');
  const absolutePath = path.join(blogRoot, cleanPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error('El archivo a reemplazar no existe');
  }

  const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Formato de imagen Base64 inválido');
  }

  const buffer = Buffer.from(matches[2], 'base64');
  fs.writeFileSync(absolutePath, buffer);

  const { gitCommit } = await import('./git.js');
  const filename = path.basename(cleanPath);
  await gitCommit(absolutePath, 'resource_replace', filename, 'assets');

  return { success: true };
}
