const { useState } = React;

// Componente de nodo individual de carpeta de media en el árbol recursivo
export function MediaFolderNode({ node, selectedPath, onSelect, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = selectedPath === node.relativePath;
  const paddingLeft = `${depth * 14 + 8}px`;

  return (
    <div className="flex flex-col w-full text-xs">
      <div className="flex items-center w-full">
        {node.children && node.children.length > 0 && (
          <button 
            type="button" 
            onClick={() => setIsOpen(!isOpen)}
            className="px-1 text-gray-400 hover:text-gray-600 text-[10px] cursor-pointer"
          >
            {isOpen ? '▼' : '▶'}
          </button>
        )}
        <button
          type="button"
          onClick={() => onSelect(node.relativePath)}
          style={{ paddingLeft: node.children && node.children.length > 0 ? '4px' : paddingLeft }}
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

      {isOpen && node.children && node.children.length > 0 && (
        <div className="flex flex-col gap-0.5 mt-0.5 border-l border-gray-100 ml-4">
          {node.children.map((child, idx) => (
            <MediaFolderNode
              key={idx}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
