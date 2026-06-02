const { useState, useEffect, useRef } = React;

export function ResourceLibrary({ loadComponent, onClose, addToast, t }) {
  const [resourcesData, setResourcesData] = useState({ assetsTree: [], publicTree: [], resources: [], config: { warningLimit: 10, dangerLimit: 50 } });
  const [selectedRoot, setSelectedRoot] = useState('assets'); // 'assets' o 'public'
  const [selectedFolder, setSelectedFolder] = useState(''); // relative path
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modales y estados
  const [activeResource, setActiveResource] = useState(null); // Para modal Split View
  const [rightClickDeleteMode, setRightClickDeleteMode] = useState(false); // Activado por click derecho
  const [editingNameId, setEditingNameId] = useState(null); // ID del recurso editándose en caliente
  const [editingNameValue, setEditingNameValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  // Reproducir chime tierno con Web Audio API
  const playTenderChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 880; // La5

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 1320; // Quinta justa (Mi6)

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.45);
      osc2.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.error('Audio chime failed:', e);
    }
  };

  // Cargar recursos desde el backend
  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setResourcesData(data);
    } catch (err) {
      console.error('Error al cargar recursos:', err);
      addToast('error', 'Biblioteca', 'No se pudo escanear la biblioteca de recursos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Manejar renombrado físico y Dependency Tracker
  const handleRename = async (resource, newName) => {
    if (!newName || newName.trim() === '' || newName === resource.name) {
      setEditingNameId(null);
      return;
    }

    setIsRenaming(true);
    try {
      const res = await fetch('/api/resources/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullRelativePath: resource.fullRelativePath,
          newName: newName.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fallo al renombrar');
      }

      playTenderChime();
      addToast('success', 'Recurso Renombrado', `El recurso fue renombrado. Se actualizaron ${data.affectedFilesCount} archivos de contenido.`);
      
      // Si el recurso activo en el modal es el que se renombró, actualizar su estado
      if (activeResource && activeResource.fullRelativePath === resource.fullRelativePath) {
        setActiveResource(prev => ({
          ...prev,
          name: newName.trim(),
          fullRelativePath: data.newFullRelativePath,
          url: prev.url.substring(0, prev.url.lastIndexOf('/') + 1) + newName.trim()
        }));
      }

      loadResources();
    } catch (err) {
      addToast('error', 'Renombrar Recurso', err.message);
    } finally {
      setIsRenaming(false);
      setEditingNameId(null);
    }
  };

  // Reemplazar un archivo multimedia
  const handleReplace = async (resource, file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const res = await fetch('/api/resources/replace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullRelativePath: resource.fullRelativePath,
            image: e.target.result
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        playTenderChime();
        addToast('success', 'Recurso Reemplazado', `El recurso ${resource.name} fue reemplazado con éxito.`);
        
        // Refrescar caché del navegador agregando un timestamp
        if (activeResource && activeResource.fullRelativePath === resource.fullRelativePath) {
          setActiveResource(prev => ({ ...prev, url: `${prev.url.split('?')[0]}?t=${Date.now()}` }));
        }

        loadResources();
      } catch (err) {
        addToast('error', 'Reemplazar Recurso', err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  // Eliminar un archivo multimedia
  const handleDelete = async (resource) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar físicamente ${resource.name}? Esto podría romper referencias si se está usando en algún post.`)) {
      return;
    }

    try {
      const res = await fetch('/api/resources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullRelativePath: resource.fullRelativePath
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      playTenderChime();
      addToast('success', 'Recurso Eliminado', `El recurso ${resource.name} fue eliminado físicamente de forma exitosa.`);
      setActiveResource(null);
      loadResources();
    } catch (err) {
      addToast('error', 'Eliminar Recurso', err.message);
    }
  };

  // Subir nueva imagen desde PC a la carpeta destino
  const handleUploadNew = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Calcular carpeta de guardado elegida
    const targetDir = selectedRoot === 'assets' 
      ? `src/assets/${selectedFolder}`
      : `public/${selectedFolder}`;

    const reader = new FileReader();
    reader.onload = async (event) => {
      setIsUploading(true);
      try {
        const res = await fetch('/api/resources/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            targetDir,
            image: event.target.result
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        playTenderChime();
        addToast('success', 'Recurso Cargado', `La imagen ${file.name} fue subida y auto-comiteada con éxito.`);
        loadResources();
      } catch (err) {
        addToast('error', 'Cargar Recurso', err.message);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtrar recursos según búsqueda y selección de carpeta
  const filteredResources = resourcesData.resources.filter(res => {
    // 1. Filtrar por carpeta seleccionada
    const basePrefix = selectedRoot === 'assets' ? 'src/assets/' : 'public/';
    const expectedPrefix = selectedFolder ? `${basePrefix}${selectedFolder}/` : basePrefix;
    
    // Si hay una carpeta seleccionada, el recurso debe estar directamente en ella (o subcarpetas si queremos recursivo, pero hagámoslo directo para Grid)
    const inFolder = res.fullRelativePath.startsWith(expectedPrefix);
    if (!inFolder) return false;

    // 2. Filtrar por búsqueda
    if (searchQuery.trim() !== '') {
      return res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             res.relativePath.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  // Renderizar el árbol recursivo de carpetas
  const renderFolderTree = (nodes, currentPath = '') => {
    return nodes.map((node, idx) => {
      const isSelected = selectedFolder === node.relativePath;
      const hasChildren = node.children && node.children.length > 0;
      
      return (
        <div key={idx} className="flex flex-col text-xs pl-2.5">
          <div className="flex items-center w-full my-0.5">
            <button
              type="button"
              onClick={() => {
                setSelectedRoot(selectedRoot);
                setSelectedFolder(node.relativePath);
              }}
              className={`flex-1 text-left py-1.5 px-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all truncate cursor-pointer ${
                isSelected 
                  ? 'bg-[#d88a75]/10 text-[#d88a75] border-l-2 border-[#d88a75]' 
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <span>{isSelected ? '📂' : '📁'}</span>
              <span className="truncate">{node.name}</span>
            </button>
          </div>
          {node.children && node.children.length > 0 && renderFolderTree(node.children, node.relativePath)}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-screen w-full select-none bg-[#FFFBEF]">
      {/* Cabecera Superior */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200/60 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700 transition-all cursor-pointer text-base"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#694836] flex items-center gap-2">
              <span>🖼️</span> Biblioteca de Recursos
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Administrar assets/ y public/ del blog
            </p>
          </div>
        </div>

        {/* Búsqueda y Carga */}
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Buscar recurso..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full cms-input px-3.5 py-2.5 pl-9 rounded-xl text-xs"
            />
            <span className="absolute left-3.5 top-3.5 text-gray-400 text-xs">🔍</span>
          </div>

          <label className="flex items-center gap-2 bg-[#d88a75] hover:bg-[#c27c69] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer select-none">
            <span>📤</span>
            <span>{isUploading ? 'Subiendo...' : 'Cargar PC'}</span>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleUploadNew}
              className="hidden"
            />
          </label>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de Árbol */}
        <aside className="w-64 border-r border-gray-200/60 bg-white flex flex-col p-4 overflow-y-auto shrink-0 gap-4">
          {/* Origen de Datos (Assets vs Public) */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => { setSelectedRoot('assets'); setSelectedFolder(''); }}
              className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRoot === 'assets' ? 'bg-[#d88a75] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              src/assets/
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRoot('public'); setSelectedFolder(''); }}
              className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRoot === 'public' ? 'bg-[#d88a75] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              public/
            </button>
          </div>

          {/* Árbol recursivo */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between border-b pb-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Directorio Físico</label>
            </div>
            
            {/* Nodo Raíz */}
            <button
              type="button"
              onClick={() => setSelectedFolder('')}
              className={`text-left py-1.5 px-2 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer ${
                selectedFolder === '' 
                  ? 'bg-[#d88a75]/10 text-[#d88a75] border-l-2 border-[#d88a75]' 
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <span>📂</span>
              <span>(Raíz del directorio)</span>
            </button>

            {loading ? (
              <span className="text-[10px] text-gray-400 italic p-2">Escaneando árbol...</span>
            ) : (
              renderFolderTree(selectedRoot === 'assets' ? resourcesData.assetsTree : resourcesData.publicTree)
            )}
          </div>
        </aside>

        {/* Grid de Recursos */}
        <main 
          className="flex-1 p-6 overflow-y-auto"
          onContextMenu={(e) => {
            e.preventDefault();
            setRightClickDeleteMode(!rightClickDeleteMode);
          }}
        >
          {/* Banner de Ayuda / Indicador */}
          <div className="flex justify-between items-center bg-amber-50 border border-amber-200/60 p-3 rounded-xl mb-4 text-xs text-amber-800">
            <div>
              💡 <strong>Tip Contextual:</strong> Doble click sobre el nombre de una tarjeta para editar su archivo. Da <strong>Click Derecho</strong> en cualquier parte para activar marcadores de remoción rápida.
            </div>
            {rightClickDeleteMode && (
              <button 
                type="button"
                onClick={() => setRightClickDeleteMode(false)}
                className="bg-amber-800 text-white font-bold px-2 py-1 rounded-lg text-[10px] select-none hover:bg-amber-900"
              >
                Apagar Marcadores ✕
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 font-bold flex-col gap-2">
              <span className="text-2xl animate-spin">⏳</span>
              <span>Cargando recursos multimedia...</span>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400 font-bold flex-col gap-1">
              <span className="text-3xl">🖼️</span>
              <span>No se encontraron imágenes en esta carpeta.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredResources.map((res, idx) => {
                const isWarn = res.usagesCount > resourcesData.config.warningLimit && res.usagesCount <= resourcesData.config.dangerLimit;
                const isDanger = res.usagesCount > resourcesData.config.dangerLimit;
                const isCriticalSystem = res.name === '404.png';
                
                // Determinar clases de borde animado radiactivo
                let borderClass = 'border-gray-200/60';
                if (isDanger) {
                  borderClass = 'border-danger-radiactive';
                } else if (isWarn || isCriticalSystem) {
                  borderClass = 'border-warn-radiactive';
                }

                const isEditing = editingNameId === res.fullRelativePath;

                return (
                  <div 
                    key={idx} 
                    className={`cms-card flex flex-col rounded-2xl overflow-hidden relative group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border ${borderClass}`}
                  >
                    {/* Botón de Eliminación Rápida */}
                    {rightClickDeleteMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(res);
                        }}
                        className="absolute top-2.5 left-2.5 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full shadow-lg flex items-center justify-center font-bold text-xs cursor-pointer z-20 animate-scale-up select-none"
                        title="Borrado Rápido Físico"
                      >
                        ✕
                      </button>
                    )}

                    {/* Botón Info Tooltip */}
                    <div className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative group/tooltip">
                        <button
                          type="button"
                          className="bg-white/90 hover:bg-white text-gray-600 w-7 h-7 rounded-full shadow-md flex items-center justify-center font-bold text-xs cursor-pointer select-none"
                        >
                          i
                        </button>
                        <div className="absolute right-0 top-8 bg-gray-900/95 text-white p-3 rounded-xl shadow-xl w-56 text-[10px] leading-relaxed hidden group-hover/tooltip:block z-30 font-mono">
                          <div><strong>Nombre:</strong> {res.name}</div>
                          <div><strong>Extensión:</strong> {res.extension}</div>
                          <div><strong>Tamaño:</strong> {(res.sizeBytes / 1024).toFixed(1)} KB</div>
                          <div><strong>Usos en Blog:</strong> {res.usagesCount}</div>
                          <div className="truncate"><strong>Ruta:</strong> {res.fullRelativePath}</div>
                        </div>
                      </div>
                    </div>

                    {/* Previsualización de Imagen */}
                    <div 
                      onClick={() => setActiveResource(res)}
                      className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 cursor-pointer relative"
                    >
                      <img
                        src={res.url}
                        alt={res.name}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Badge de Usos */}
                      <span className={`absolute bottom-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm ${
                        res.usagesCount > 0 ? 'bg-[#d88a75] text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {res.usagesCount} {res.usagesCount === 1 ? 'uso' : 'usos'}
                      </span>
                    </div>

                    {/* Metadatos y Nombre */}
                    <div className="p-3.5 flex flex-col gap-1 bg-white flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-[#d88a75] px-2 py-1 rounded-lg text-xs font-bold text-gray-700 bg-white"
                          value={editingNameValue}
                          autoFocus
                          disabled={isRenaming}
                          onChange={e => setEditingNameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(res, editingNameValue);
                            if (e.key === 'Escape') setEditingNameId(null);
                          }}
                          onBlur={() => handleRename(res, editingNameValue)}
                        />
                      ) : (
                        <div 
                          onDoubleClick={() => {
                            setEditingNameId(res.fullRelativePath);
                            setEditingNameValue(res.name);
                          }}
                          className="text-xs font-bold text-gray-700 truncate cursor-text"
                          title="Doble click para renombrar en línea"
                        >
                          {res.name}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono mt-1 select-none">
                        <span>{res.extension.toUpperCase()}</span>
                        <span>{(res.sizeBytes / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal Split-View de Pantalla Completa */}
      {activeResource && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl h-5/6 flex flex-col md:flex-row relative animate-scale-up border border-gray-100">
            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={() => setActiveResource(null)}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 w-8 h-8 rounded-full shadow-md flex items-center justify-center font-bold text-sm cursor-pointer z-30 select-none"
            >
              ✕
            </button>

            {/* Panel Izquierdo: Previsualización Gigante */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100 relative">
              <img
                src={activeResource.url}
                alt={activeResource.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Panel Derecho: Datos y Acciones */}
            <div className="w-full md:w-96 p-6 flex flex-col overflow-y-auto bg-white select-none shrink-0 gap-6">
              <div>
                <span className="text-[9px] text-[#d88a75] font-black uppercase tracking-widest">Metadatos del Recurso</span>
                <h2 className="text-xl font-bold text-gray-800 break-words mt-1">{activeResource.name}</h2>
              </div>

              {/* Grid de Datos */}
              <div className="grid grid-cols-2 gap-4 border-y py-4 border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">Tamaño de archivo:</span>
                  <strong className="text-gray-700 font-mono">{(activeResource.sizeBytes / 1024).toFixed(1)} KB</strong>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Formato / Extensión:</span>
                  <strong className="text-gray-700 font-mono">{activeResource.extension.toUpperCase()}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block mb-0.5">Ruta en repositorio:</span>
                  <strong className="text-gray-700 font-mono text-[10px] break-all">{activeResource.fullRelativePath}</strong>
                </div>
              </div>

              {/* Tracker de dependencias */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  🔗 Dependencias del Recurso ({activeResource.usagesCount})
                </h3>
                {activeResource.usagesCount === 0 ? (
                  <p className="text-[10px] text-gray-400 italic">No se encontraron referencias a esta imagen en ningún post.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto border border-gray-100 rounded-xl p-2 bg-gray-50 flex flex-col gap-1.5 font-mono text-[9px] text-gray-600">
                    {activeResource.usages.map((u, i) => (
                      <div key={i} className="flex items-center gap-1.5 hover:bg-gray-100 p-1 rounded transition-colors truncate">
                        <span>📄</span>
                        <span className="truncate">{u}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón Reemplazar, Descargar y Eliminar */}
              <div className="flex flex-col gap-2.5 mt-auto border-t pt-4 border-gray-100">
                <label className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all">
                  <span>🔄</span> Reemplazar Archivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleReplace(activeResource, e.target.files[0])}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => handleDelete(activeResource)}
                  className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border border-red-100"
                >
                  🗑️ Eliminar Físicamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
