const { useState, useEffect } = React;

// Modal de Carga de Imágenes Multimodal (con soporte de árbol y creación de carpetas)
export function ImageUploaderModal({ isOpen, onClose, onUploadSuccess, activeCollection, MediaFolderNode, t }) {
  const [file, setFile] = useState(null);
  const [targetDir, setTargetDir] = useState('images');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [customFilename, setCustomFilename] = useState('');
  const [filenameExists, setFilenameExists] = useState(false);

  useEffect(() => {
    if (file) {
      const cleanName = file.name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_\.]/g, '');
      setCustomFilename(cleanName);
    } else {
      setCustomFilename('');
      setFilenameExists(false);
    }
  }, [file]);

  useEffect(() => {
    if (customFilename && targetDir) {
      const delayDebounce = setTimeout(() => {
        fetch(`/api/media/check-exists?targetDir=${encodeURIComponent(targetDir)}&filename=${encodeURIComponent(customFilename)}`)
          .then(res => res.json())
          .then(data => {
            setFilenameExists(data.exists);
          })
          .catch(err => console.error('Error validating filename:', err));
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setFilenameExists(false);
    }
  }, [customFilename, targetDir]);

  // Árbol de carpetas de assets
  const [foldersTree, setFoldersTree] = useState([]);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
      setFile(null);
      setError('');
    }
  }, [isOpen]);

  const fetchFolders = () => {
    fetch('/api/media-folders')
      .then(res => res.json())
      .then(data => {
        setFoldersTree(data);
        
        // Pre-selección inteligente por defecto basada en la colección activa
        let defaultFolder = 'images';
        if (activeCollection === 'projects') {
          defaultFolder = 'images/projects';
        } else if (activeCollection === 'blog') {
          defaultFolder = 'images/blog';
        } else if (activeCollection === 'posts') {
          defaultFolder = 'images/posts';
        } else if (activeCollection === 'journal') {
          defaultFolder = 'images/journal';
        }

        const findPath = (nodes, path) => {
          for (const n of nodes) {
            if (n.relativePath === path) return true;
            if (n.children && findPath(n.children, path)) return true;
          }
          return false;
        };

        if (findPath(data, defaultFolder)) {
          setTargetDir(defaultFolder);
        } else if (data.length > 0) {
          setTargetDir(data[0].relativePath);
        } else {
          setTargetDir('images');
        }
      })
      .catch(err => console.error('Error al cargar carpetas:', err));
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);

    fetch('/api/media-folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentPath: targetDir,
        newFolderName: newFolderName
      })
    })
      .then(res => {
        if (res.status === 409) {
          alert('La carpeta ya existe.');
          throw new Error('Duplicada');
        }
        return res.json();
      })
      .then(data => {
        setIsCreatingFolder(false);
        setNewFolderName('');
        setShowNewFolderInput(false);
        // Recargar árbol de carpetas y seleccionar la nueva
        fetch('/api/media-folders')
          .then(res => res.json())
          .then(tree => {
            setFoldersTree(tree);
            setTargetDir(data.relativePath);
          });
      })
      .catch(err => {
        setIsCreatingFolder(false);
        console.error('Error creando carpeta:', err);
      });
  };

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    setError('');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64data = reader.result;

      fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: customFilename || file.name,
          targetDir: targetDir,
          image: base64data
        })
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al subir la imagen');
          return res.json();
        })
        .then(data => {
          setIsUploading(false);
          onUploadSuccess(data.url);
          onClose();
        })
        .catch(err => {
          setIsUploading(false);
          setError(err.message || 'Error en la subida');
        });
    };
  };

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-gray-100 flex flex-col gap-4 max-h-[90vh] overflow-hidden animate-scale-up">
        <h3 className="text-xl font-bold text-gray-800">Subir Imagen a Assets/</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Drag and Drop Area */}
          <div 
            className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer shrink-0 ${
              dragActive ? 'border-[#d88a75] bg-[#d88a75]/5' : 'border-gray-200 hover:border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input 
              id="file-upload-input"
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleFileChange}
            />
            <span className="text-2xl mb-1">📸</span>
            {file ? (
              <span className="text-xs font-semibold text-green-600 truncate max-w-sm">{file.name}</span>
            ) : (
              <span className="text-xs text-gray-400 font-semibold uppercase">Arrastra una imagen o haz clic para buscar</span>
            )}
          </div>

          {/* Campo para renombrar la imagen con validación de colisiones */}
          {file && (
            <div className="flex flex-col gap-1 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
              <label className="text-xs font-bold text-gray-500">Nombre de Archivo Personalizado</label>
              <input
                type="text"
                required
                placeholder="ej: mi_nueva_imagen.png"
                value={customFilename}
                onChange={e => setCustomFilename(e.target.value.replace(/\s+/g, '_'))}
                className={`w-full cms-input px-3 py-2 rounded-xl text-xs font-medium ${
                  filenameExists ? 'border-red-400 bg-red-50/20' : ''
                }`}
              />
              {filenameExists ? (
                <span className="text-[10px] text-red-500 font-bold mt-1">
                  ⚠️ Ya existe un archivo con ese nombre en esta carpeta. Elige otro.
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 mt-1 font-semibold">
                  Puedes personalizar el nombre del archivo. Mantén la extensión original para evitar fallos.
                </span>
              )}
            </div>
          )}

          {/* Selector de Árbol de Carpetas físicas de Assets */}
          <div className="flex flex-col gap-1.5 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
            <div className="flex items-center justify-between border-b pb-1">
              <label className="text-xs font-bold text-gray-500">Seleccionar Carpeta de Assets</label>
              <button
                type="button"
                onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                className="text-[10px] font-bold bg-[#d88a75]/10 text-[#d88a75] border border-[#d88a75]/20 px-2 py-0.5 rounded-lg hover:bg-[#d88a75]/20 transition-all cursor-pointer"
              >
                + Nueva Carpeta
              </button>
            </div>

            {/* Formulario rápido para crear subdirectorio físico */}
            {showNewFolderInput && (
              <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-[#d88a75]/20 mt-1">
                <span className="text-[10px] text-gray-400 font-bold max-w-40 truncate">
                  /{targetDir}/
                </span>
                <input
                  type="text"
                  className="flex-1 cms-input px-2 py-1 rounded-lg text-xs"
                  placeholder="Nombre (ej: posts-2026)"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                />
                <button
                  type="button"
                  disabled={isCreatingFolder || !newFolderName}
                  onClick={handleCreateFolder}
                  className="bg-[#d88a75] text-white px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingFolder ? 'Creando...' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewFolderInput(false); setNewFolderName(''); }}
                  className="text-xs text-gray-400 hover:text-gray-600 font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Ruta activa */}
            <div className="text-[10px] font-bold text-[#d88a75] bg-[#d88a75]/5 px-2 py-1 rounded-lg truncate mt-1">
              Ruta destino: <span className="font-mono text-gray-700">src/assets/{targetDir || '(raíz)'}</span>
            </div>

            {/* Contenedor del árbol colapsable */}
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1 border border-gray-200/60 rounded-lg p-2 bg-white mt-1">
              {foldersTree.map((node, idx) => (
                <MediaFolderNode
                  key={idx}
                  node={node}
                  selectedPath={targetDir}
                  onSelect={setTargetDir}
                />
              ))}
              {foldersTree.length === 0 && (
                <span className="text-[10px] text-gray-400 italic text-center py-2">Cargando árbol de carpetas...</span>
              )}
            </div>
          </div>

          {error && <span className="text-xs text-red-500 font-bold shrink-0">{error}</span>}

          <div className="flex justify-end gap-3 mt-2 shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={!file || isUploading || filenameExists}
              className="px-4 py-2 bg-[#d88a75] hover:bg-[#c27c69] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? 'Subiendo...' : 'Subir Imagen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
