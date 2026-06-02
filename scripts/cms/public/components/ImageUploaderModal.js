const { useState, useEffect } = React;

// Helper para calcular la ruta de asset relativa correcta según la ubicación del post
function calculateRelativeAssetPath(activeCollection, activeEntryFilename, assetRelativePath) {
  const contentFullPath = `content/${activeCollection}/${activeEntryFilename || 'default.mdx'}`;
  const slashCount = (contentFullPath.match(/\//g) || []).length;
  const prefix = '../'.repeat(slashCount);
  return `${prefix}assets/${assetRelativePath}`;
}

export function ImageUploaderModal({ 
  isOpen, 
  onClose, 
  onUploadSuccess, 
  activeCollection, 
  activeEntry,
  MediaFolderNode, 
  t 
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'browse'

  // --- Estados de Pestaña 'Cargar PC' (Subir) ---
  const [file, setFile] = useState(null);
  const [localPreviewSrc, setLocalPreviewSrc] = useState('');
  const [targetDir, setTargetDir] = useState('images');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [filenameExists, setFilenameExists] = useState(false);

  // --- Estados de Pestaña 'Escoger del Blog' (Explorar) ---
  const [existingFiles, setExistingFiles] = useState([]);
  const [selectedExistingFile, setSelectedExistingFile] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // --- Estados Comunes ---
  const [foldersTree, setFoldersTree] = useState([]);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Generar vista previa local en caliente para archivos de PC
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalPreviewSrc(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalPreviewSrc('');
    }
  }, [file]);

  // Sanitizar nombre de archivo inicial
  useEffect(() => {
    if (file) {
      const cleanName = file.name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_\.]/g, '');
      setCustomFilename(cleanName);
    } else {
      setCustomFilename('');
      setFilenameExists(false);
    }
  }, [file]);

  // Validar colisiones de nombres de archivos en caliente
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

  // Cargar lista de archivos de imágenes cuando cambia el targetDir o la pestaña es 'browse'
  useEffect(() => {
    if (isOpen && activeTab === 'browse' && targetDir) {
      setLoadingFiles(true);
      setSelectedExistingFile(null);
      fetch(`/api/media-files?targetDir=${encodeURIComponent(targetDir)}`)
        .then(res => res.json())
        .then(data => {
          setExistingFiles(data);
          setLoadingFiles(false);
        })
        .catch(err => {
          console.error('Error fetching media files:', err);
          setLoadingFiles(false);
        });
    }
  }, [isOpen, activeTab, targetDir]);

  // Inicializar carpetas al abrir modal
  useEffect(() => {
    if (isOpen) {
      fetchFolders();
      setFile(null);
      setError('');
      setSelectedExistingFile(null);
      setActiveTab('upload');
    }
  }, [isOpen]);

  const fetchFolders = () => {
    fetch('/api/media-folders')
      .then(res => res.json())
      .then(data => {
        setFoldersTree(data);
        
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

  // Confirmar la selección de una imagen existente
  const handleConfirmExisting = () => {
    if (!selectedExistingFile) return;
    const computedUrl = calculateRelativeAssetPath(
      activeCollection,
      activeEntry ? activeEntry.filename : '',
      selectedExistingFile.relativePath
    );
    onUploadSuccess(computedUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-gray-100 flex flex-col gap-3 max-h-[90vh] overflow-hidden animate-scale-up">
        
        {/* Header con tabs de navegación */}
        <div className="flex flex-col gap-2 shrink-0">
          <h3 className="text-xl font-bold text-gray-800">Cargar Recurso a Assets/</h3>
          
          <div className="flex border-b border-gray-100 mt-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'upload' ? 'border-[#d88a75] text-[#d88a75]' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              📁 Cargar PC
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('browse')}
              className={`flex-1 py-2 text-center text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'browse' ? 'border-[#d88a75] text-[#d88a75]' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              🔍 Escoger del Blog
            </button>
          </div>
        </div>

        {/* Cuerpo del Formulario / Explorador con scroll */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5">
          
          {/* TAB 1: Carga desde PC */}
          {activeTab === 'upload' && (
            <div className="flex flex-col gap-3.5">
              
              {/* Drag and Drop Box */}
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

              {/* Vista Previa de Imagen Local en caliente */}
              {localPreviewSrc && (
                <div className="w-full h-36 rounded-xl border border-gray-150 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 shadow-inner p-2 relative group animate-fade-in">
                  <img 
                    src={localPreviewSrc} 
                    alt="Vista Previa Local" 
                    className="max-h-full max-w-full object-contain rounded-lg transition-transform group-hover:scale-[1.02]" 
                  />
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider backdrop-blur-xs select-none">
                    Previsualización
                  </div>
                </div>
              )}

              {/* Campo para renombrar con prevención de colisiones */}
              {file && (
                <div className="flex flex-col gap-1 border border-gray-100 rounded-xl p-3 bg-gray-50/50 animate-scale-up">
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

            </div>
          )}

          {/* TAB 2: Escoger del Blog (Browser) */}
          {activeTab === 'browse' && (
            <div className="flex flex-col gap-3">
              
              {/* Grid de imágenes en la carpeta activa */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-500">Imágenes del Directorio</span>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto border border-gray-250/60 rounded-xl p-2.5 bg-white shadow-inner min-h-24">
                  {existingFiles.map((f, idx) => {
                    const imgUrl = `/src/${f.relativePath}`;
                    const isSelected = selectedExistingFile && selectedExistingFile.relativePath === f.relativePath;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedExistingFile(f)}
                        className={`flex flex-col items-center justify-between p-1.5 rounded-lg border text-center cursor-pointer transition-all hover:scale-[1.02] select-none ${
                          isSelected ? 'border-[#d88a75] bg-[#d88a75]/5 ring-2 ring-[#d88a75]/20 font-bold' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="w-full h-14 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100/80 shadow-xs">
                          <img 
                            src={imgUrl} 
                            alt={f.name} 
                            className="h-full w-full object-cover" 
                            onError={(e) => { e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50" y="55" font-size="12" text-anchor="middle" fill="%23ccc">?</text></svg>'; }} 
                          />
                        </div>
                        <span className="text-[9px] text-gray-500 truncate w-full mt-1.5 px-0.5" title={f.name}>{f.name}</span>
                      </div>
                    );
                  })}
                  {existingFiles.length === 0 && !loadingFiles && (
                    <div className="col-span-4 text-center text-xs text-gray-400 italic py-6">No se encontraron imágenes en este directorio.</div>
                  )}
                  {loadingFiles && (
                    <div className="col-span-4 text-center text-xs text-gray-400 italic py-6">Buscando imágenes...</div>
                  )}
                </div>
              </div>

              {/* Vista Previa del Asset Seleccionado */}
              {selectedExistingFile && (
                <div className="flex gap-3.5 items-center border border-[#d88a75]/20 bg-[#d88a75]/5 p-2.5 rounded-xl animate-fade-in shrink-0">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-white shrink-0 bg-white shadow-md flex items-center justify-center select-none">
                    <img 
                      src={`/src/${selectedExistingFile.relativePath}`} 
                      alt="Vista Previa" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#d88a75] block uppercase tracking-wider">Imagen Seleccionada</span>
                    <span className="text-xs font-semibold text-gray-700 truncate block mt-0.5">{selectedExistingFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmExisting}
                    className="px-4.5 py-2 bg-[#d88a75] hover:bg-[#c27c69] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Confirmar Selección
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Carpeta activa y árbol de carpetas colapsable (Común para ambos tabs) */}
          <div className="flex flex-col gap-1.5 border border-gray-100 rounded-xl p-3 bg-gray-50/50 shrink-0">
            <div className="flex items-center justify-between border-b pb-1">
              <span className="text-xs font-bold text-gray-500">Seleccionar Carpeta de Assets</span>
              <button
                type="button"
                onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                className="text-[10px] font-bold bg-[#d88a75]/10 text-[#d88a75] border border-[#d88a75]/20 px-2 py-0.5 rounded-lg hover:bg-[#d88a75]/20 transition-all cursor-pointer"
              >
                + Nueva Carpeta
              </button>
            </div>

            {/* Crear carpeta rápida */}
            {showNewFolderInput && (
              <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-[#d88a75]/20 mt-1 animate-scale-up">
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

            <div className="text-[10px] font-bold text-[#d88a75] bg-[#d88a75]/5 px-2 py-1 rounded-lg truncate mt-1">
              Ubicación activa: <span className="font-mono text-gray-700">src/assets/{targetDir || '(raíz)'}</span>
            </div>

            <div className="max-h-40 overflow-y-auto flex flex-col gap-1 border border-gray-200/60 rounded-lg p-2 bg-white mt-1">
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

        </div>

        {/* Footer con controles */}
        <div className="flex justify-end gap-3 mt-1.5 border-t pt-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          
          {activeTab === 'upload' && (
            <button 
              type="button"
              disabled={!file || isUploading || filenameExists}
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#d88a75] hover:bg-[#c27c69] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? 'Cargando...' : 'Cargar'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
