// Modal de Confirmación de Borrado Físico
export function DeleteConfirmationModal({ isOpen, filename, onConfirm, onClose, t }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-50 flex flex-col gap-4 animate-scale-up">
        <div className="flex items-center gap-3 text-red-500 border-b pb-2 border-red-50">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-xl font-bold text-gray-800">¿Eliminar Recurso?</h3>
        </div>
        
        <p className="text-xs font-semibold text-gray-500 leading-relaxed">
          ¿Estás completamente seguro de que deseas eliminar físicamente el archivo <span className="font-mono text-red-500 bg-red-50 px-1.5 py-0.5 rounded font-bold">{filename}</span> de tu repositorio? Esta acción es irreversible y realizará un commit de eliminación de forma automática en Git.
        </p>

        <div className="flex justify-end gap-3 mt-2 border-t pt-3 border-gray-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Confirmar Borrado ✕
          </button>
        </div>
      </div>
    </div>
  );
}
