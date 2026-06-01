const { useState, useEffect, useRef } = React;

export function MarkdownEditor({ value, onChange, entryId, t }) {
  const [text, setText] = useState(value || '');
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const timerRef = useRef(null);

  // Sincronizar el estado local cuando cambia de entrada (archivo)
  useEffect(() => {
    setText(value || '');
    undoStack.current = [];
    redoStack.current = [];
  }, [entryId]);

  // Al cambiar externamente (ej: si se guarda o formatea externamente)
  useEffect(() => {
    if (value !== text) {
      setText(value || '');
    }
  }, [value]);

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
    
    // Al tipear, hacemos debounce de 500ms para agrupar palabras en el historial
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
    
    // Guardar inmediatamente en el historial antes del cambio de formato
    saveToHistory(currentText);
    
    setText(newContent);
    onChange(newContent);
    
    // Reposicionar cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
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

  return (
    <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-black text-gray-800">{t.markdown_body}</h3>
        <div className="flex gap-2 text-xs text-gray-400 font-bold">
          <span>Ctrl+Z ({t.cancel || 'Deshacer'})</span>
          <span>•</span>
          <span>Ctrl+Y (Rehacer)</span>
        </div>
      </div>
      
      {/* Barra de Herramientas de Formato */}
      <div className="flex flex-wrap gap-1 bg-gray-50 p-2 rounded-xl border border-[var(--color-border)]">
        <button 
          type="button" 
          onClick={() => insertFormat('**', '**')} 
          className="px-2.5 py-1 text-xs font-bold rounded hover:bg-gray-200 transition-all" 
          title="Negrita"
        >
          B
        </button>
        <button 
          type="button" 
          onClick={() => insertFormat('*', '*')} 
          className="px-2.5 py-1 text-xs italic rounded hover:bg-gray-200 transition-all" 
          title="Itálica"
        >
          I
        </button>
        <button 
          type="button" 
          onClick={() => insertFormat('# ')} 
          className="px-2 py-1 text-xs font-bold rounded hover:bg-gray-200 transition-all" 
          title="Encabezado 1"
        >
          H1
        </button>
        <button 
          type="button" 
          onClick={() => insertFormat('## ')} 
          className="px-2 py-1 text-xs font-bold rounded hover:bg-gray-200 transition-all" 
          title="Encabezado 2"
        >
          H2
        </button>
        <button 
          type="button" 
          onClick={() => insertFormat('### ')} 
          className="px-2 py-1 text-xs font-bold rounded hover:bg-gray-200 transition-all" 
          title="Encabezado 3"
        >
          H3
        </button>
        <button 
          type="button" 
          onClick={() => insertFormat('- ')} 
          className="px-2 py-1 text-xs rounded hover:bg-gray-200 transition-all" 
          title="Lista Viñeta"
        >
          • Lista
        </button>
        <button 
          type="button" 
          onClick={() => insertFormat('[', '](url)')} 
          className="px-2 py-1 text-xs rounded hover:bg-gray-200 transition-all" 
          title="Insertar Enlace"
        >
          Enlace
        </button>
        <button 
          type="button" 
          onClick={() => insertFormat('![alt](', ')') } 
          className="px-2 py-1 text-xs rounded hover:bg-gray-200 transition-all" 
          title="Insertar Imagen"
        >
          Imagen
        </button>
        <button 
          type="button" 
          onClick={() => insertFormat('`', '`')} 
          className="px-2.5 py-1 text-xs font-mono rounded hover:bg-gray-200 transition-all" 
          title="Código Inline"
        >
          &lt;&gt;
        </button>
      </div>
      
      <textarea
        id="markdown-editor"
        className="w-full cms-input p-4 rounded-xl text-xs font-mono h-96 leading-relaxed"
        value={text}
        onChange={e => handleTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t.md_placeholder}
      />
    </div>
  );
}
