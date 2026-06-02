const { useState, useEffect, useRef } = React;

export function App({ loadComponent }) {
  // Módulos dinámicos cargados
  const [SidebarComp, setSidebarComp] = useState(null);
  const [FormFieldsComp, setFormFieldsComp] = useState(null);
  const [MarkdownEditorComp, setMarkdownEditorComp] = useState(null);
  const [translationsDict, setTranslationsDict] = useState(null);

  // Componentes modulares nuevos
  const [MediaFolderNodeComp, setMediaFolderNodeComp] = useState(null);
  const [ToastContainerComp, setToastContainerComp] = useState(null);
  const [LightboxModalComp, setLightboxModalComp] = useState(null);
  const [DeleteConfirmationModalComp, setDeleteConfirmationModalComp] = useState(null);
  const [ImageUploaderModalComp, setImageUploaderModalComp] = useState(null);
  const [FinalizarRedaccionModalComp, setFinalizarRedaccionModalComp] = useState(null);
  const [ResourceLibraryComp, setResourceLibraryComp] = useState(null);
  const [apiService, setApiService] = useState(null);

  // Estados de UI de Biblioteca de Recursos
  const [viewMode, setViewMode] = useState('editor'); // 'editor' o 'resources'
  const [transitioning, setTransitioning] = useState(false);

  // Estados de UI e idioma
  const [lang, setLang] = useState('es');
  const [collections, setCollections] = useState({});
  const [activeCollection, setActiveCollection] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado de recurso activo
  const [activeEntry, setActiveEntry] = useState(null);
  const [entryData, setEntryData] = useState({ metadata: {}, content: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Estado para crear un archivo nuevo
  const [showNewModal, setShowNewModal] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [saveTrigger, setSaveTrigger] = useState(0);

  // Árbol y creación de subcarpetas de CONTENIDOS
  const [contentFolders, setContentFolders] = useState([]);
  const [targetContentDir, setTargetContentDir] = useState('');
  const [showNewContentFolder, setShowNewContentFolder] = useState(false);
  const [newContentFolderName, setNewContentFolderName] = useState('');
  const [isCreatingContentFolder, setIsCreatingContentFolder] = useState(false);
  
  // Estado del cargador de imágenes
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState('');

  // Control del Sidebar responsivo en móviles
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loader centralizado e interactivo
  const [isLoading, setIsLoading] = useState(true);

  // Lightbox global de imágenes
  const [lightboxImg, setLightboxImg] = useState(null);

  // Modal de Confirmación de Borrado
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Modal de Confirmación de Squash (Finalizar Redacción)
  const [showSquashModal, setShowSquashModal] = useState(false);

  // Sistema de Toasts en esquina
  const [toasts, setToasts] = useState([]);

  // Control del menú flotante de acciones rápidas
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const quickActionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setQuickActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const handleCloseToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleViewMode = () => {
    setTransitioning(true);
    setTimeout(() => {
      setViewMode(prev => prev === 'editor' ? 'resources' : 'editor');
    }, 1000);
    setTimeout(() => {
      setTransitioning(false);
    }, 2000);
  };

  // Exponer el Lightbox en el objeto window para comunicación modular
  useEffect(() => {
    window.openLightbox = (src) => {
      setLightboxImg(src);
    };
    return () => {
      delete window.openLightbox;
    };
  }, []);

  // Cargar componentes de forma modular en caliente
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      loadComponent('./components/i18n.js'),
      loadComponent('./components/Sidebar.js'),
      loadComponent('./components/FormFields.js'),
      loadComponent('./components/MarkdownEditor.js'),
      loadComponent('./components/MediaFolderNode.js'),
      loadComponent('./components/ToastContainer.js'),
      loadComponent('./components/LightboxModal.js'),
      loadComponent('./components/DeleteConfirmationModal.js'),
      loadComponent('./components/ImageUploaderModal.js'),
      loadComponent('./components/FinalizarRedaccionModal.js'),
      loadComponent('./components/ResourceLibrary.js'),
      loadComponent('./services/api.js')
    ]).then(([i18nMod, sidebarMod, formFieldsMod, mdEditorMod, mediaFolderMod, toastMod, lightboxMod, deleteMod, uploaderMod, finalizarMod, resourceMod, apiMod]) => {
      setTranslationsDict(i18nMod.translations);
      setSidebarComp(() => sidebarMod.Sidebar);
      setFormFieldsComp(() => formFieldsMod.FormFields);
      setMarkdownEditorComp(() => mdEditorMod.MarkdownEditor);
      setMediaFolderNodeComp(() => mediaFolderMod.MediaFolderNode);
      setToastContainerComp(() => toastMod.ToastContainer);
      setLightboxModalComp(() => lightboxMod.LightboxModal);
      setDeleteConfirmationModalComp(() => deleteMod.DeleteConfirmationModal);
      setImageUploaderModalComp(() => uploaderMod.ImageUploaderModal);
      setFinalizarRedaccionModalComp(() => finalizarMod.FinalizarRedaccionModal);
      setResourceLibraryComp(() => resourceMod.ResourceLibrary);
      setApiService(apiMod);
      setIsLoading(false);
    }).catch(err => {
      console.error("Fallo al inicializar los componentes modulares del CMS:", err);
      setIsLoading(false);
    });
  }, []);

  // Cargar contenidos del backend al inicio
  useEffect(() => {
    if (!apiService) return;
    apiService.fetchAllContent()
      .then(data => {
        setCollections(data);
        if (data.projects && data.projects.length > 0) {
          selectEntry('projects', data.projects[0].filename);
        }
      })
      .catch(err => console.error('Error al cargar contenidos:', err));
  }, [apiService]);

  // Cargar árbol de carpetas de contenidos al abrir modal de nueva entrada
  useEffect(() => {
    if (showNewModal && apiService) {
      fetchContentFoldersLocal();
      setNewFilename('');
      setTargetContentDir('');
      setShowNewContentFolder(false);
    }
  }, [showNewModal, activeCollection, apiService]);

  const fetchContentFoldersLocal = () => {
    if (!apiService) return;
    apiService.fetchContentFolders(activeCollection)
      .then(data => {
        setContentFolders(data);
      })
      .catch(err => console.error('Error cargando carpetas de contenido:', err));
  };

  // Obtener traducción activa
  const t = translationsDict ? translationsDict[lang] : {};

  // Seleccionar una entrada del listado
  const selectEntry = (col, filename) => {
    if (!apiService) return;
    setIsLoading(true);
    apiService.fetchEntry(col, filename)
      .then(data => {
        setActiveEntry({ collection: col, filename });
        setEntryData(data);
        setMessage('');
        setSidebarOpen(false);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar entrada:', err);
        setIsLoading(false);
      });
  };

  // Guardar cambios con validación de assets y auto-commit
  const handleSave = () => {
    if (!activeEntry || !apiService) return;
    setIsSaving(true);
    setMessage('');

    const pathsToValidate = [];
    const meta = entryData.metadata || {};
    
    if (meta.image) pathsToValidate.push(meta.image);
    if (Array.isArray(meta.imagenes)) {
      meta.imagenes.forEach(img => {
        if (img) pathsToValidate.push(img);
      });
    }

    const performSave = () => {
      apiService.saveEntry(activeEntry.collection, activeEntry.filename, entryData)
        .then(data => {
          setIsSaving(false);
          if (data.success) {
            setMessage('✓ ' + (t.success_save || 'Guardado con éxito'));
            addToast('info', t.cms_title || 'CMS', '✓ Archivo persistido y comiteado localmente.');
            setSaveTrigger(prev => prev + 1);
            setTimeout(() => setMessage(''), 3000);
          } else {
            setMessage('Error: ' + data.error);
          }

        })
        .catch(err => {
          setIsSaving(false);
          setMessage('Error al conectar con el servidor');
        });
    };

    if (pathsToValidate.length > 0) {
      apiService.validateAssets(pathsToValidate)
        .then(validationResult => {
          const missingImages = Object.keys(validationResult).filter(p => !validationResult[p]);
          if (missingImages.length > 0) {
            addToast('warn', t.invalid_assets_warn || '⚠️ Imágenes no encontradas', 
              (t.invalid_assets_desc || 'Las siguientes imágenes no existen: ') + 
              missingImages.map(p => p.split('/').pop()).join(', ')
            );
          }
          performSave();
        })
        .catch(err => {
          console.error('Error validando assets:', err);
          performSave();
        });
    } else {
      performSave();
    }
  };

  // Crear nueva entrada en la subcarpeta física seleccionada
  const handleCreateEntry = (e) => {
    e.preventDefault();
    if (!newFilename || !apiService) return;

    apiService.createEntry(activeCollection, newFilename, targetContentDir)
      .then(data => {
        setShowNewModal(false);
        setNewFilename('');
        addToast('info', t.cms_title || 'CMS', '✓ Nueva entrada creada y comiteada localmente.');
        // Refrescar listados
        apiService.fetchAllContent()
          .then(cols => {
            setCollections(cols);
            selectEntry(activeCollection, data.filename);
          });
      })
      .catch(err => {
        if (err.message.includes('ya existe')) {
          alert(err.message);
        }
        console.error(err);
      });
  };

  // Crear subcarpeta de contenidos en caliente
  const handleCreateContentFolder = (e) => {
    e.preventDefault();
    if (!newContentFolderName.trim() || !apiService) return;
    setIsCreatingContentFolder(true);

    apiService.createContentFolder(activeCollection, targetContentDir, newContentFolderName)
      .then(data => {
        setIsCreatingContentFolder(false);
        setNewContentFolderName('');
        setShowNewContentFolder(false);
        fetchContentFoldersLocal();
        setTargetContentDir(data.relativePath);
      })
      .catch(err => {
        setIsCreatingContentFolder(false);
        if (err.message.includes('ya existe')) {
          alert(err.message);
        }
        console.error(err);
      });
  };

  // Eliminar físicamente el recurso y comitear
  const handleDeleteEntry = () => {
    if (!activeEntry || !apiService) return;
    setIsLoading(true);
    setShowDeleteModal(false);

    apiService.deleteEntry(activeEntry.collection, activeEntry.filename)
      .then(data => {
        if (data.success) {
          addToast('info', t.cms_title || 'CMS', '✕ Entrada eliminada y comiteada en Git.');
          // Refrescar listados
          apiService.fetchAllContent()
            .then(cols => {
              setCollections(cols);
              if (cols[activeCollection] && cols[activeCollection].length > 0) {
                const findFirstFile = (nodes) => {
                  for (const n of nodes) {
                    if (n.type === 'file') return n.filename;
                    if (n.children) {
                      const f = findFirstFile(n.children);
                      if (f) return f;
                    }
                  }
                  return null;
                };
                const firstFile = findFirstFile(cols[activeCollection]);
                if (firstFile) {
                  selectEntry(activeCollection, firstFile);
                } else {
                  setActiveEntry(null);
                  setIsLoading(false);
                }
              } else {
                setActiveEntry(null);
                setIsLoading(false);
              }
            });
        } else {
          alert('Error al borrar: ' + data.error);
          setIsLoading(false);
        }
      })
      .catch(err => {
        alert('Fallo de conexión');
        setIsLoading(false);
      });
  };

  // Ejecutar Git Push asíncronamente con Toast interactivo
  const handleGitPush = () => {
    if (!apiService) return;
    const toastId = Date.now();
    setToasts(prev => [...prev, {
      id: toastId,
      type: 'info',
      title: '🚀 Git Push',
      message: 'Enviando commits locales a GitHub (origin/main)...'
    }]);

    apiService.gitPush()
      .then(data => {
        setToasts(prev => prev.map(t => {
          if (t.id === toastId) {
            if (data.success) {
              return {
                ...t,
                type: 'info',
                title: '✅ Git Push Exitoso',
                message: 'Commits locales empujados a GitHub correctamente.'
              };
            } else {
              return {
                ...t,
                type: 'warn',
                title: '❌ Fallo en Git Push',
                message: 'Fallo: ' + (data.error || 'Fallo en origin')
              };
            }
          }
          return t;
        }));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 8000);
      })
      .catch(err => {
        setToasts(prev => prev.map(t => {
          if (t.id === toastId) {
            return {
              ...t,
              type: 'warn',
              title: '❌ Fallo en Git Push',
              message: 'Fallo al conectar con el servidor CMS.'
            };
          }
          return t;
        }));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 8000);
      });
  };

  // Ejecutar Git Squash y Git Push asíncronamente con Toast interactivo
  const handleFinalizarRedaccion = () => {
    if (!apiService) return;
    setShowSquashModal(false);
    const toastId = Date.now();
    setToasts(prev => [...prev, {
      id: toastId,
      type: 'info',
      title: '🗜️ Finalizando Redacción',
      message: 'Aplanando historial y enviando cambios a GitHub...'
    }]);

    apiService.gitSquash()
      .then(data => {
        setToasts(prev => prev.map(t => {
          if (t.id === toastId) {
            if (data.success) {
              return {
                ...t,
                type: 'info',
                title: '✅ Sesión Integrada',
                message: '¡Tus cambios locales se han aplanado y subido con éxito! Puedes seguir redactando.'
              };
            } else {
              return {
                ...t,
                type: 'warn',
                title: '❌ Error al finalizar',
                message: 'Fallo: ' + (data.error || 'Error de Git')
              };
            }
          }
          return t;
        }));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 8000);
      })
      .catch(err => {
        setToasts(prev => prev.map(t => {
          if (t.id === toastId) {
            return {
              ...t,
              type: 'warn',
              title: '❌ Error de Conexión',
              message: 'Fallo al conectar con el servidor CMS.'
            };
          }
          return t;
        }));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 8000);
      });
  };

  // Actualizar campos frontmatter
  const updateMeta = (key, val) => {
    const matchArray = key.match(/^([a-zA-Z0-9_]+)\[([0-9]+)\]$/);
    
    if (matchArray) {
      const fieldName = matchArray[1];
      const index = parseInt(matchArray[2]);
      
      setEntryData(prev => {
        const currentList = Array.isArray(prev.metadata[fieldName]) ? [...prev.metadata[fieldName]] : [];
        currentList[index] = val;
        return {
          ...prev,
          metadata: {
            ...prev.metadata,
            [fieldName]: currentList
          }
        };
      });
    } else {
      setEntryData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [key]: val
        }
      }));
    }
  };

  // Abrir modal de carga de imágenes
  const handleOpenUploader = (fieldName) => {
    setActiveImageField(fieldName);
    setUploaderOpen(true);
  };

  // Al completar carga de imagen
  const handleUploadSuccess = (imageUrl) => {
    updateMeta(activeImageField, imageUrl);
  };

  const transitionClass = transitioning ? 'transition-dreamy' : '';

  return (
    <div className={`flex flex-col lg:flex-row h-screen overflow-hidden relative ${transitionClass}`}>
      
      {/* Overlay de Carga Centralizado */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#FFFBEF]/80 flex items-center justify-center z-50 backdrop-blur-xs flex-col gap-3">
          <img 
            src="/loader.gif" 
            alt="Loading..." 
            className="w-16 h-16 object-contain animate-pulse" 
            onError={(e) => {
              e.target.style.display = 'none';
              const spinner = document.getElementById('loading-spinner-fallback');
              if (spinner) spinner.style.display = 'block';
            }}
          />
          <div 
            id="loading-spinner-fallback" 
            className="hidden animate-spin rounded-full h-10 w-10 border-b-2 border-[#d88a75]"
          ></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {t.loading || 'Iniciando panel modular...'}
          </span>
        </div>
      )}

      {viewMode === 'resources' && ResourceLibraryComp ? (
        <ResourceLibraryComp
          loadComponent={loadComponent}
          onClose={handleToggleViewMode}
          addToast={addToast}
          t={t}
        />
      ) : (
        <>
          {/* Botón flotante para abrir Sidebar en móviles */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[var(--color-border)] w-full shrink-0">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="Favicon" className="w-6 h-6" />
              <span className="font-bold text-sm text-gray-700">{t.cms_title}</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-3 py-1.5 bg-[#d88a75]/10 text-[#d88a75] border border-[#d88a75]/20 rounded-xl text-xs font-bold transition-all"
            >
              {sidebarOpen ? '✕ Cerrar' : '☰ Menú'}
            </button>
          </div>

          {/* Sidebar Izquierdo */}
          <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block shrink-0 h-[calc(100vh-60px)] lg:h-full z-40 bg-white`}>
            {SidebarComp && (
              <SidebarComp
                collections={collections}
                activeCollection={activeCollection}
                setActiveCollection={setActiveCollection}
                activeEntry={activeEntry}
                onSelectEntry={selectEntry}
                onOpenNewModal={() => setShowNewModal(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                lang={lang}
                setLang={setLang}
                t={t}
              />
            )}
          </div>

          {/* Área de Trabajo Principal */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col gap-6 lg:gap-8">
            
            {activeEntry ? (
              <>
                {/* Header del CMS */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 shrink-0">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-1">
                      <span className="capitalize">{activeEntry.collection}</span>
                      <span>/</span>
                      <span>{activeEntry.filename}</span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-black text-gray-800">
                      {t.edit_label} <span className="text-[#d88a75]">{entryData.metadata?.title || activeEntry.filename.replace(/\.(md|mdx)$/, '')}</span>
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {message && <span className="text-xs md:text-sm font-bold text-green-600 transition-all">{message}</span>}
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      Eliminar Recurso ✕
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-[#d88a75] hover:bg-[#c27c69] text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? t.saving : t.save_changes}
                    </button>
                  </div>
                </header>

                {/* Formulario Adaptativo & Markdown Editor */}
                <div className="flex flex-col gap-6 md:gap-8">
                  
                  {/* Formulario de Metadatos */}
                  {FormFieldsComp && (
                    <FormFieldsComp
                      entry={activeEntry}
                      entryData={entryData}
                      updateMeta={updateMeta}
                      onOpenUploader={handleOpenUploader}
                      collections={collections}
                      t={t}
                    />
                  )}

                  {/* Markdown Editor */}
                  {MarkdownEditorComp && (
                    <MarkdownEditorComp
                      value={entryData.content}
                      onChange={val => setEntryData(prev => ({ ...prev, content: val }))}
                      entryId={`${activeEntry.collection}/${activeEntry.filename}`}
                      saveTrigger={saveTrigger}
                      t={t}
                    />
                  )}

                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 py-12 md:py-20 text-center">
                <div className="text-5xl md:text-6xl mb-4">✍️</div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">{t.welcome_title}</h2>
                <p className="text-xs md:text-sm text-gray-500 max-w-md px-4">{t.welcome_desc}</p>
              </div>
            )}
          </main>
        </>
      )}

      {/* Modal de Nueva Entrada con Árbol de Carpetas */}
      {showNewModal && MediaFolderNodeComp && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 flex flex-col gap-4 max-h-[90vh] overflow-hidden animate-scale-up">
            <h3 className="text-xl font-bold text-gray-800">{t.new_entry_title}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.collections}: <span className="text-[#d88a75]">{activeCollection}</span></p>
            
            <form onSubmit={handleCreateEntry} className="flex flex-col gap-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t.filename_label}</label>
                <input 
                  type="text" 
                  placeholder="ej: mi-nuevo-post" 
                  required
                  className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium"
                  value={newFilename}
                  onChange={e => setNewFilename(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_\.]/g, ''))}
                />
                <span className="text-[10px] text-gray-400 mt-1 block font-semibold">
                  Nota: Si no especificas extensión, se creará como <strong>.mdx</strong> por defecto. Si escribes .md u otra, se respetará la selección.
                </span>
              </div>

              {/* Selector de Árbol de Carpetas de Contenidos */}
              <div className="flex flex-col gap-1.5 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <div className="flex items-center justify-between border-b pb-1">
                  <label className="text-xs font-bold text-gray-500">Seleccionar Carpeta de Contenido</label>
                  <button
                    type="button"
                    onClick={() => setShowNewContentFolder(!showNewContentFolder)}
                    className="text-[10px] font-bold bg-[#d88a75]/10 text-[#d88a75] border border-[#d88a75]/20 px-2 py-0.5 rounded-lg hover:bg-[#d88a75]/20 transition-all cursor-pointer"
                  >
                    + Nueva Carpeta
                  </button>
                </div>

                {/* Crear subcarpeta física de contenidos */}
                {showNewContentFolder && (
                  <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-[#d88a75]/20 mt-1">
                    <span className="text-[10px] text-gray-400 font-bold max-w-40 truncate">
                      /{targetContentDir || '(raíz)'}/
                    </span>
                    <input
                      type="text"
                      className="flex-1 cms-input px-2 py-1 rounded-lg text-xs"
                      placeholder="Nombre (ej: dev)"
                      value={newContentFolderName}
                      onChange={e => setNewContentFolderName(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={isCreatingContentFolder || !newContentFolderName}
                      onClick={handleCreateContentFolder}
                      className="bg-[#d88a75] text-white px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      {isCreatingContentFolder ? 'Creando...' : 'Crear'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewContentFolder(false); setNewContentFolderName(''); }}
                      className="text-xs text-gray-400 hover:text-gray-600 font-bold px-1"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="text-[10px] font-bold text-[#d88a75] bg-[#d88a75]/5 px-2 py-1 rounded-lg truncate mt-1">
                  Ubicación final: <span className="font-mono text-gray-700">src/content/{activeCollection}/{targetContentDir || '(raíz)'}</span>
                </div>

                {/* Contenedor del árbol colapsable de carpetas */}
                <div className="max-h-40 overflow-y-auto flex flex-col gap-1 border border-gray-200/60 rounded-lg p-2 bg-white mt-1">
                  {/* Nodo Raíz de la Colección */}
                  <button
                    type="button"
                    onClick={() => setTargetContentDir('')}
                    className={`text-left py-1.5 px-2 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer ${
                      targetContentDir === '' 
                        ? 'bg-[#d88a75]/10 text-[#d88a75] border-l-2 border-[#d88a75]' 
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span>📂</span>
                    <span>(Raíz de la colección)</span>
                  </button>

                  {contentFolders.map((node, idx) => (
                    <MediaFolderNodeComp
                      key={idx}
                      node={node}
                      selectedPath={targetContentDir}
                      onSelect={setTargetContentDir}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-2 shrink-0">
                <button 
                  type="button" 
                  onClick={() => { setShowNewModal(false); setNewFilename(''); }}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#d88a75] hover:bg-[#c27c69] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {t.create_resource}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Carga de Imágenes */}
      {ImageUploaderModalComp && (
        <ImageUploaderModalComp
          isOpen={uploaderOpen}
          onClose={() => setUploaderOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          activeCollection={activeCollection}
          activeEntry={activeEntry}
          MediaFolderNode={MediaFolderNodeComp}
          t={t}
        />
      )}

      {/* Modal Lightbox Animado */}
      {LightboxModalComp && (
        <LightboxModalComp
          src={lightboxImg}
          onClose={() => setLightboxImg(null)}
          t={t}
        />
      )}

      {/* Modal de Confirmación de Borrado Físico */}
      {DeleteConfirmationModalComp && (
        <DeleteConfirmationModalComp
          isOpen={showDeleteModal}
          filename={activeEntry?.filename}
          onConfirm={handleDeleteEntry}
          onClose={() => setShowDeleteModal(false)}
          t={t}
        />
      )}

      {/* Modal de Confirmación de Finalizar Redacción (Squash & Push) */}
      {FinalizarRedaccionModalComp && (
        <FinalizarRedaccionModalComp
          isOpen={showSquashModal}
          onConfirm={handleFinalizarRedaccion}
          onClose={() => setShowSquashModal(false)}
          t={t}
        />
      )}

      {/* Botón Selector de Vista Biblioteca / Editor */}
      {ResourceLibraryComp && !quickActionsOpen && (
        <button
          type="button"
          onClick={handleToggleViewMode}
          className="fixed bottom-6 right-24 bg-white text-gray-700 w-14 h-14 rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center text-xl font-bold cursor-pointer transition-all duration-300 select-none border-2 border-[#d88a75]/30 hover:scale-105 z-45"
          title={viewMode === 'editor' ? 'Ir a Biblioteca de Recursos' : 'Volver al Editor'}
        >
          {viewMode === 'editor' ? '🖼️' : '✍️'}
        </button>
      )}

      {/* Botón Flotante Hamburger de Acciones Rápidas */}
      <div className="fixed bottom-6 right-6 z-45" ref={quickActionsRef}>
        {/* Acciones del menú (se revelan al hacer click) */}
        {quickActionsOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-2.5 items-end animate-scale-up z-50">
            <button
              type="button"
              onClick={() => {
                setShowSquashModal(true);
                setQuickActionsOpen(false);
              }}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/80 rounded-xl shadow-lg px-4 py-3 transition-all cursor-pointer flex items-center gap-3.5 whitespace-nowrap text-xs font-black uppercase tracking-widest border-r-4 border-r-[#d88a75]"
            >
              <span className="text-base select-none">🗜️</span>
              <span>Finalizar Redacción</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setShowNewModal(true);
                setQuickActionsOpen(false);
              }}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/80 rounded-xl shadow-lg px-4 py-3 transition-all cursor-pointer flex items-center gap-3.5 whitespace-nowrap text-xs font-black uppercase tracking-widest border-r-4 border-r-[#d88a75]"
            >
              <span className="text-base select-none">📝</span>
              <span>Nueva Entrada</span>
            </button>
          </div>
        )}
        
        {/* Hamburguesa principal */}
        <button
          type="button"
          onClick={() => setQuickActionsOpen(!quickActionsOpen)}
          className={`bg-[#d88a75] hover:bg-[#c27c69] text-white w-14 h-14 rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center text-xl font-bold cursor-pointer transition-all duration-300 select-none border-2 border-white/30 ${
            quickActionsOpen ? 'rotate-90 bg-[#c27c69]' : ''
          }`}
        >
          ☰
        </button>
      </div>

      {/* Sistema de Notificaciones Toasts */}
      {ToastContainerComp && (
        <ToastContainerComp 
          toasts={toasts} 
          onClose={handleCloseToast} 
        />
      )}

    </div>
  );
}
