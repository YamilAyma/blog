const { useState } = React;

// Componente recursivo para renderizar nodos del árbol de archivos
function TreeNode({ node, collection, onSelect, activeFilename, t, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(true);
  const paddingLeft = `${depth * 12 + 12}px`;

  if (node.type === 'file') {
    const isActive = activeFilename === node.filename;
    return (
      <button
        onClick={() => onSelect(collection, node.filename)}
        style={{ paddingLeft }}
        className={`w-full text-left py-1.5 pr-3 rounded-lg text-xs font-medium truncate transition-all flex items-center gap-2 ${
          isActive
            ? 'bg-[#d88a75] text-white shadow-xs font-semibold'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <span>📄</span>
        <span class="truncate">{node.name}</span>
      </button>
    );
  }

  // Si es directorio (carpeta)
  return (
    <div className="flex flex-col w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ paddingLeft }}
        className="w-full text-left py-1.5 pr-3 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-all"
      >
        <span className="flex items-center gap-2 truncate">
          <span>{isOpen ? '📂' : '📁'}</span>
          <span class="truncate">{node.name}</span>
        </span>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-bold">
          {node.filesCount}
        </span>
      </button>
      
      {isOpen && (
        <div className="flex flex-col gap-0.5 mt-0.5 border-l border-gray-100 ml-3">
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              collection={collection}
              onSelect={onSelect}
              activeFilename={activeFilename}
              t={t}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ 
  collections = {}, 
  activeCollection, 
  setActiveCollection, 
  activeEntry, 
  onSelectEntry, 
  onOpenNewModal, 
  searchQuery, 
  setSearchQuery,
  lang,
  setLang,
  t 
}) {
  
  // Filtrado de búsquedas
  const filterTree = (nodes, query) => {
    if (!query) return nodes;
    return nodes.map(node => {
      if (node.type === 'file') {
        const matches = node.name.toLowerCase().includes(query.toLowerCase()) || 
                        node.slug.toLowerCase().includes(query.toLowerCase());
        return matches ? node : null;
      }
      // Si es directorio, filtrar sus hijos recursivamente
      const filteredChildren = filterTree(node.children, query).filter(Boolean);
      if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren, filesCount: filteredChildren.length };
      }
      return null;
    }).filter(Boolean);
  };

  const getActiveCollectionTree = () => {
    const rawNodes = collections[activeCollection] || [];
    return filterTree(rawNodes, searchQuery);
  };

  const activeTree = getActiveCollectionTree();

  // Calcular conteo total de archivos de forma recursiva
  const countTotalFiles = (nodes) => {
    let count = 0;
    nodes.forEach(node => {
      if (node.type === 'file') {
        count++;
      } else {
        count += countTotalFiles(node.children);
      }
    });
    return count;
  };

  return (
    <aside className="w-64 cms-sidebar flex flex-col h-full shrink-0">
      
      {/* Encabezado */}
      <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Icono" className="w-8 h-8 rounded-lg shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-[#d88a75]">{t.cms_title}</h1>
            <span className="text-[10px] text-gray-400 font-bold uppercase">{t.cms_subtitle}</span>
          </div>
        </div>
        
        {/* Selector de idioma i18n */}
        <button
          onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          className="text-xs font-bold bg-[#d88a75]/10 text-[#d88a75] border border-[#d88a75]/20 px-2 py-0.5 rounded-lg hover:bg-[#d88a75]/20 transition-all uppercase"
        >
          {lang}
        </button>
      </div>

      {/* Selector de Colecciones */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{t.collections}</label>
        <nav className="flex flex-col gap-1">
          {Object.keys(collections).map(col => {
            const count = countTotalFiles(collections[col] || []);
            return (
              <button
                key={col}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                  activeCollection === col 
                    ? 'bg-[#d88a75]/10 text-[#d88a75] border-l-4 border-[#d88a75]' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                onClick={() => {
                  setActiveCollection(col);
                  setSearchQuery('');
                }}
              >
                <span className="capitalize">{col}</span>
                <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full text-gray-500 font-bold">{count}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Explorador de Archivos en Árbol */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase">{t.entries}</label>
          <button 
            onClick={onOpenNewModal}
            className="text-[10px] font-bold bg-[#d88a75] text-white px-2 py-1 rounded-lg hover:bg-[#c27c69] transition-all"
          >
            {t.new_btn}
          </button>
        </div>

        {/* Buscador Rápido */}
        <input 
          type="text" 
          placeholder={t.search_placeholder} 
          className="w-full cms-input px-3 py-1.5 rounded-xl text-xs mb-2"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <div className="flex flex-col gap-1 overflow-x-hidden">
          {activeTree.map((node, index) => (
            <TreeNode
              key={index}
              node={node}
              collection={activeCollection}
              onSelect={onSelectEntry}
              activeFilename={activeEntry?.filename}
              t={t}
            />
          ))}
          {activeTree.length === 0 && (
            <span className="text-xs text-gray-400 italic text-center py-4">{t.no_entries}</span>
          )}
        </div>
      </div>

    </aside>
  );
}
