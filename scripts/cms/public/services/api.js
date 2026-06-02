// Servicios de API centralizados del CMS
// Todas las llamadas fetch al backend se centralizan aquí

export async function fetchAllContent() {
  const res = await fetch('/api/content');
  return res.json();
}

export async function fetchEntry(collection, filename) {
  const res = await fetch(`/api/content/${collection}/${filename}`);
  return res.json();
}

export async function saveEntry(collection, filename, entryData) {
  const res = await fetch(`/api/content/${collection}/${filename}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entryData)
  });
  return res.json();
}

export async function createEntry(collection, filename, targetDir) {
  const res = await fetch(`/api/content/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, targetDir })
  });
  if (res.status === 409) {
    throw new Error('El archivo ya existe en esa ubicación.');
  }
  return res.json();
}

export async function deleteEntry(collection, filename) {
  const res = await fetch(`/api/content/${collection}/${filename}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function validateAssets(paths) {
  const res = await fetch(`/api/validate-assets?paths=${encodeURIComponent(paths.join(','))}`);
  return res.json();
}

export async function gitPush() {
  const res = await fetch('/api/git-push', { method: 'POST' });
  return res.json();
}

export async function gitSquash() {
  const res = await fetch('/api/git-squash', { method: 'POST' });
  return res.json();
}

export async function fetchContentFolders(collection) {
  const res = await fetch(`/api/content-folders/${collection}`);
  return res.json();
}

export async function createContentFolder(collection, parentPath, newFolderName) {
  const res = await fetch(`/api/content-folders/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parentPath, newFolderName })
  });
  if (res.status === 409) {
    throw new Error('La carpeta ya existe.');
  }
  return res.json();
}
