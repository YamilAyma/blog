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
