const { useState, useEffect, useRef } = React;

export function MarkdownEditor({ value, onChange, entryId, saveTrigger = 0, t }) {
  const [text, setText] = useState(value || '');
  const [customComponents, setCustomComponents] = useState([]);
  const [selectedCompName, setSelectedCompName] = useState('');
  
  // Modos de visualización: 'editor', 'preview-fast' (Vista Rápida), 'preview-astro' (Vista Astro), 'split' (Dividido)
  const [viewMode, setViewMode] = useState('editor');
  
  // Control de modal de documentación
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [docsComponent, setDocsComponent] = useState(null);

  // Control del dropdown de componentes personalizado
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Iframe reload timestamp
  const [iframeReloadTime, setIframeReloadTime] = useState(Date.now());

  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const timerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cargar componentes permitidos
  useEffect(() => {
    fetch('/api/custom-components')
      .then(res => res.json())
      .then(data => {
        if (data && data.components) {
          setCustomComponents(data.components);
          if (data.components.length > 0) {
            setSelectedCompName(data.components[0].name);
          }
        }
      })
      .catch(err => console.error('Error cargando componentes personalizados:', err));
  }, []);

  // Sincronizar el estado local cuando cambia de entrada (archivo)
  useEffect(() => {
    setText(value || '');
    undoStack.current = [];
    redoStack.current = [];
    setViewMode('editor');
  }, [entryId]);

  // Al cambiar externamente (ej: al guardar o formatear)
  useEffect(() => {
    if (value !== text) {
      setText(value || '');
    }
  }, [value]);

  // Forzar recarga de iframe Astro cuando se guarda el archivo
  useEffect(() => {
    if (saveTrigger > 0) {
      setTimeout(() => {
        setIframeReloadTime(Date.now());
      }, 300); // 300ms de delay para dar tiempo a la compilación HMR de Astro
    }
  }, [saveTrigger]);

  // Cerrar el dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToHistory = (currentVal) => {
    if (undoStack.current.length === 0 || undoStack.current[undoStack.current.length - 1] !== currentVal) {
      undoStack.current.push(currentVal);
      if (undoStack.current.length > 50) {
        undoStack.current.shift();
      }
      redoStack.current = []; // Limpiar rehacer
    }
  };

  const handleTextChange = (newVal) => {
    const prevVal = text;
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (undoStack.current.length === 0 || undoStack.current[undoStack.current.length - 1] !== prevVal) {
        undoStack.current.push(prevVal);
        if (undoStack.current.length > 50) {
          undoStack.current.shift();
        }
        redoStack.current = [];
      }
    }, 500);

    setText(newVal);
    onChange(newVal);
  };

  const insertFormat = (prefix, suffix = '') => {
    const textarea = document.getElementById('markdown-editor');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end);
    
    const replacement = prefix + selected + suffix;
    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);
    
    saveToHistory(currentText);
    
    setText(newContent);
    onChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const handleInsertComponent = (comp) => {
    insertFormat(comp.template || '');
    setDropdownOpen(false);
  };

  const handleOpenHelpModal = () => {
    const comp = customComponents.find(c => c.name === selectedCompName);
    if (comp) {
      setDocsComponent(comp);
      setDocsModalOpen(true);
    }
  };

  const handleKeyDown = (e) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    if (isCtrl && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      handleUndo();
    } else if (isCtrl && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
    }
  };

  const handleUndo = () => {
    if (undoStack.current.length > 0) {
      const nextVal = undoStack.current.pop();
      redoStack.current.push(text);
      setText(nextVal);
      onChange(nextVal);
    }
  };

  const handleRedo = () => {
    if (redoStack.current.length > 0) {
      const nextVal = redoStack.current.pop();
      undoStack.current.push(text);
      setText(nextVal);
      onChange(nextVal);
    }
  };

  // Parser estético liviano en el cliente para "Vista Rápida"
  const parseMarkdownToHtml = (markdown) => {
    if (!markdown) return '';
    
    let html = markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 1. Cabeceras
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-gray-800 mt-4 mb-2">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-black text-[#d88a75] mt-5 mb-2.5">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="text-xl font-black text-gray-800 mt-6 mb-3 border-b pb-1">$1</h2>');

    // 2. Negritas e Itálicas
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-800">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // 3. Enlaces e imágenes
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<div class="my-2"><img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-xs max-h-48 object-cover" /></div>');
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-[#d88a75] hover:underline font-bold">$1</a>');

    // 4. Bloques de código
    html = html.replace(/```(.*?)\r?\n([\s\S]*?)```/gm, '<pre class="bg-gray-800 text-gray-100 p-3 rounded-xl font-mono text-[10px] my-3 overflow-x-auto leading-normal"><code>$2</code></pre>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px] text-red-500 font-bold">$1</code>');

    // 5. Listas viñetas
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-xs text-gray-600 my-1 font-semibold">$1</li>');

    // 6. Saltos de línea y párrafos sencillos
    html = html.replace(/\r?\n\r?\n/g, '<p class="my-2.5 leading-relaxed text-xs text-gray-600 font-semibold"></p>');

    // 7. Decodificación simulada de Componentes Personalizados (MDX)
    
    // <Badge text="..." type="..." />
    html = html.replace(/&lt;Badge\s+text="([^"]*)"\s+type="([^"]*)"\s*\/&gt;/g, (match, text, type) => {
      let colors = 'bg-blue-50 text-blue-600 border border-blue-200';
      if (type === 'success') colors = 'bg-green-50 text-green-600 border border-green-200';
      if (type === 'warning') colors = 'bg-yellow-50 text-yellow-600 border border-yellow-200';
      if (type === 'danger') colors = 'bg-red-50 text-red-600 border border-red-200';
      return `<span class="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors}">${text}</span>`;
    });

    // <Alert type="..." title="...">...</Alert>
    html = html.replace(/&lt;Alert\s+type="([^"]*)"(?:\s+title="([^"]*)")?&gt;([\s\S]*?)&lt;\/Alert&gt;/g, (match, type, title, content) => {
      let colors = 'bg-blue-50/50 border-blue-200 text-blue-800';
      let icon = 'ℹ️';
      if (type === 'tip') { colors = 'bg-green-50/50 border-green-200 text-green-800'; icon = '💡'; }
      if (type === 'warning') { colors = 'bg-yellow-50/50 border-yellow-200 text-yellow-800'; icon = '⚠️'; }
      if (type === 'caution') { colors = 'bg-red-50/50 border-red-200 text-red-800'; icon = '🚨'; }
      
      const titleMarkup = title ? `<h4 class="font-bold text-xs uppercase tracking-wider mb-1">${icon} ${title}</h4>` : '';
      return `<div class="p-4 border-l-4 rounded-r-xl my-3 ${colors}">${titleMarkup}<div class="text-xs leading-normal font-semibold">${content}</div></div>`;
    });

    // <Card title="..." link="..." linkText="...">...</Card>
    html = html.replace(/&lt;Card\s+title="([^"]*)"(?:\s+link="([^"]*)")?(?:\s+linkText="([^"]*)")?&gt;([\s\S]*?)&lt;\/Card&gt;/g, (match, title, link, linkText, content) => {
      const button = link ? `<a href="${link}" target="_blank" class="inline-block mt-3 bg-[#d88a75] text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-[#c27c69] transition-all">${linkText || 'Ver'}</a>` : '';
      return `<div class="border rounded-xl p-4 bg-white shadow-xs my-3 flex flex-col gap-1 border-gray-100"><h4 class="font-bold text-gray-800 text-sm border-b pb-1 mb-2">🎴 ${title}</h4><div class="text-xs text-gray-500 font-semibold leading-relaxed">${content}</div>${button}</div>`;
    });

    // <Grid cols="...">...</Grid>
    html = html.replace(/&lt;Grid(?:\s+cols="([^"]*)")?&gt;([\s\S]*?)&lt;\/Grid&gt;/g, (match, cols, content) => {
      const colNum = cols || '2';
      return `<div class="grid grid-cols-1 md:grid-cols-${colNum} gap-4 my-4">${content}</div>`;
    });

    // <Button href="..." text="..." target="..." />
    html = html.replace(/&lt;Button\s+href="([^"]*)"\s+text="([^"]*)"(?:\s+target="([^"]*)")?\s*\/&gt;/g, (match, href, text, target) => {
      return `<a href="${href}" target="${target || '_self'}" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-black uppercase tracking-widest rounded-xl shadow-xs text-white bg-[#d88a75] hover:bg-[#c27c69] transition-all my-2">${text}</a>`;
    });

    return html;
  };

  // Calcular URL de previsualización real de Astro
  let entrySlug = '';
  let collectionName = '';
  if (entryId) {
    const parts = entryId.split('/');
    collectionName = parts[0];
    entrySlug = parts.slice(1).join('/').replace(/\.(md|mdx)$/, '');
  }
  const hasUnsavedChanges = text !== value;
  const astroPreviewUrl = `http://localhost:4321/${collectionName === 'pages' ? '' : collectionName + '/'}${entrySlug}`;

  return (
    <div className="cms-card p-4 md:p-6 rounded-2xl flex flex-col gap-4">
      {/* Cabecera del Editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-black text-gray-800">{t.markdown_body}</h3>
          {hasUnsavedChanges && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-50 border border-yellow-200 text-yellow-600 px-2 py-0.5 rounded-lg animate-pulse">
              Cambios sin guardar
            </span>
          )}
        </div>
        
        {/* Selector de modo de previsualización */}
        <div className="flex rounded-xl bg-gray-100 p-0.5 border text-xs font-bold shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'editor' ? 'bg-white shadow-xs text-[#d88a75]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            📝 {t.editor_label || 'Editor'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'split' ? 'bg-white shadow-xs text-[#d88a75]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🌓 {t.split_label || 'Dividido'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview-fast')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'preview-fast' ? 'bg-white shadow-xs text-[#d88a75]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            👁️ Vista Rápida
          </button>
          
          {/* Botón de Vista Real de Astro con Tooltip interactivo si hay cambios sin guardar */}
          <div className="relative group flex">
            <button
              type="button"
              disabled={hasUnsavedChanges}
              onClick={() => setViewMode('preview-astro')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                hasUnsavedChanges 
                  ? 'opacity-40 cursor-not-allowed text-gray-400' 
                  : viewMode === 'preview-astro' 
                    ? 'bg-white shadow-xs text-[#d88a75] cursor-pointer' 
                    : 'text-gray-500 hover:text-gray-700 cursor-pointer'
              }`}
            >
              🚀 Vista Real
            </button>
            {hasUnsavedChanges && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-[10px] font-bold p-2.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center leading-normal z-30">
                El contenido tiene cambios sin guardar. Guarda el archivo para poder previsualizarlo en vivo.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-width-[5px] border-solid border-color-[transparent] border-t-color-gray-800"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Barra de Herramientas de Formato y Componentes */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-2 rounded-xl border border-[var(--color-border)]">
        {/* Herramientas de Markdown estándar */}
        <div className="flex flex-wrap gap-1">
          <button 
            type="button" 
            onClick={() => insertFormat('**', '**')} 
            className="px-2.5 py-1 text-xs font-bold rounded hover:bg-gray-200 transition-all cursor-pointer" 
            title="Negrita"
          >
            B
          </button>
          <button 
            type="button" 
            onClick={() => insertFormat('*', '*')} 
            className="px-2.5 py-1 text-xs italic rounded hover:bg-gray-200 transition-all cursor-pointer" 
            title="Itálica"
          >
            I
          </button>
          <button 
            type="button" 
            onClick={() => insertFormat('## ')} 
            className="px-2 py-1 text-xs font-bold rounded hover:bg-gray-200 transition-all cursor-pointer" 
            title="Encabezado 2"
          >
            H2
          </button>
          <button 
            type="button" 
            onClick={() => insertFormat('### ')} 
            className="px-2 py-1 text-xs font-bold rounded hover:bg-gray-200 transition-all cursor-pointer" 
            title="Encabezado 3"
          >
            H3
          </button>
          <button 
            type="button" 
            onClick={() => insertFormat('- ')} 
            className="px-2 py-1 text-xs rounded hover:bg-gray-200 transition-all cursor-pointer" 
            title="Lista Viñeta"
          >
            • Lista
          </button>
          <button 
            type="button" 
            onClick={() => insertFormat('[', '](url)')} 
            className="px-2 py-1 text-xs rounded hover:bg-gray-200 transition-all cursor-pointer" 
            title="Insertar Enlace"
          >
            Enlace
          </button>
          <button 
            type="button" 
            onClick={() => insertFormat('`', '`')} 
            className="px-2.5 py-1 text-xs font-mono rounded hover:bg-gray-200 transition-all cursor-pointer" 
            title="Código Inline"
          >
            &lt;&gt;
          </button>
        </div>

        {/* Sección de Custom Components con Dropdown e Icono de Ayuda */}
        <div className="flex items-center gap-1.5 relative" ref={dropdownRef}>
          <div className="text-[10px] font-black uppercase text-gray-400 select-none mr-1">
            🧩 Componentes:
          </div>
          
          {/* Menú Dropdown Custom */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-white border hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer border-gray-200"
            >
              <span>🧩</span>
              <span>{selectedCompName || 'Elegir...'}</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 sm:left-0 mt-1 w-64 bg-white border border-gray-100 rounded-xl shadow-2xl z-40 py-1.5 flex flex-col gap-0.5 animate-scale-up max-h-72 overflow-y-auto">
                {customComponents.map((comp) => (
                  <button
                    key={comp.name}
                    type="button"
                    onClick={() => {
                      setSelectedCompName(comp.name);
                      handleInsertComponent(comp);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col gap-0.5 group/item cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-gray-700 group-hover/item:text-[#d88a75]">
                      <span>{comp.icon}</span>
                      <span>{comp.name}</span>
                    </div>
                    <span className="text-[9px] font-semibold text-gray-400 line-clamp-1">{comp.description}</span>
                  </button>
                ))}
                {customComponents.length === 0 && (
                  <span className="text-[10px] text-gray-400 italic text-center py-2">No hay componentes registrados</span>
                )}
              </div>
            )}
          </div>

          {/* Botón interactivo de ayuda "?" */}
          <button
            type="button"
            onClick={handleOpenHelpModal}
            className="w-7 h-7 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 rounded-lg text-xs font-black flex items-center justify-center shadow-xs transition-all cursor-pointer"
            title="Ver documentación del componente"
          >
            ?
          </button>
        </div>
      </div>
      
      {/* Contenedor del Editor / Previews */}
      <div className="flex flex-col md:flex-row gap-4 h-96 overflow-hidden">
        
        {/* Caja de Texto (Editor) */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <textarea
            id="markdown-editor"
            className="flex-1 cms-input p-4 rounded-xl text-xs font-mono h-full leading-relaxed resize-none overflow-y-auto"
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.md_placeholder}
          />
        )}
        
        {/* Columna Derecha: Vista Rápida local */}
        {(viewMode === 'preview-fast' || viewMode === 'split') && (
          <div className="flex-1 border border-gray-200/80 rounded-xl p-4 bg-[#fffdf0] h-full overflow-y-auto antialiased">
            <div className="border-b pb-1.5 mb-3 flex items-center justify-between select-none">
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">👁️ Vista Rápida Reactiva (Simulada)</span>
              <span className="text-[9px] font-black uppercase bg-[#d88a75]/10 text-[#d88a75] px-1.5 py-0.5 rounded">En tiempo real</span>
            </div>
            
            {/* Contenedor simulado del Blog */}
            <div 
              className="prose prose-sm max-w-none text-xs leading-relaxed font-semibold text-gray-600"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(text) || '<em class="text-gray-400 italic font-semibold">Comienza a escribir para ver la vista rápida...</em>' }}
            />
          </div>
        )}

        {/* Columna Derecha: Vista Real de Astro en Iframe */}
        {viewMode === 'preview-astro' && (
          <div className="flex-1 border border-gray-200/80 rounded-xl bg-white h-full overflow-hidden flex flex-col">
            <div className="border-b p-2 bg-gray-50 flex items-center justify-between select-none text-[9px] font-black text-gray-400 shrink-0">
              <span className="uppercase tracking-wider">🚀 Vista Real de Astro Dev</span>
              <button 
                type="button"
                onClick={() => setIframeReloadTime(Date.now())}
                className="text-[#d88a75] hover:underline"
              >
                🔄 Forzar Recarga
              </button>
            </div>
            <iframe
              src={`${astroPreviewUrl}?t=${iframeReloadTime}`}
              className="w-full flex-1 border-0"
              title="Astro Dev HMR Preview"
              key={`${entryId}-${iframeReloadTime}`}
              onError={() => console.error('Error al cargar la previsualización de Astro')}
            />
          </div>
        )}
      </div>

      {/* Modal de Documentación de Componentes */}
      {docsModalOpen && docsComponent && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-gray-100 flex flex-col gap-4 max-h-[85vh] overflow-hidden animate-scale-up">
            
            {/* Header del Modal */}
            <div className="flex items-center gap-2.5 border-b pb-2">
              <span className="text-2xl">{docsComponent.icon}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">Componente: <span className="text-[#d88a75]">&lt;{docsComponent.name} /&gt;</span></h3>
              </div>
              <button
                type="button"
                onClick={() => setDocsModalOpen(false)}
                className="text-gray-300 hover:text-gray-500 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 text-xs font-semibold leading-normal text-gray-600">
              <div>
                <h4 className="font-bold text-gray-800 uppercase tracking-widest text-[10px] mb-1">Descripción</h4>
                <p className="text-gray-500">{docsComponent.description}</p>
              </div>

              {/* Tabla de Propiedades */}
              <div>
                <h4 className="font-bold text-gray-800 uppercase tracking-widest text-[10px] mb-1.5">Propiedades Soportadas (Atributos)</h4>
                <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-100 text-[10px] uppercase text-gray-500 tracking-wider">
                        <th className="p-2 border-b">Propiedad</th>
                        <th className="p-2 border-b">Tipo</th>
                        <th className="p-2 border-b">Requerido</th>
                        <th className="p-2 border-b">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[11px]">
                      {docsComponent.properties.map(prop => (
                        <tr key={prop.name} className="hover:bg-white transition-all">
                          <td className="p-2 font-mono font-bold text-gray-800">{prop.name}</td>
                          <td className="p-2 font-mono text-gray-400">{prop.type}</td>
                          <td className="p-2">
                            {prop.required ? (
                              <span className="bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-black text-[9px] uppercase">Sí</span>
                            ) : (
                              <span className="text-gray-300 font-black text-[9px] uppercase">No</span>
                            )}
                          </td>
                          <td className="p-2 text-gray-500 font-medium">{prop.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ejemplo práctico */}
              <div>
                <h4 className="font-bold text-gray-800 uppercase tracking-widest text-[10px] mb-1">Ejemplo de Código</h4>
                <pre className="bg-gray-800 text-gray-100 p-3 rounded-xl font-mono text-[10px] leading-normal overflow-x-auto select-all">
                  <code>{docsComponent.example}</code>
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t pt-3 border-gray-50 shrink-0">
              <button
                type="button"
                onClick={() => setDocsModalOpen(false)}
                className="bg-[#d88a75] hover:bg-[#c27c69] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
