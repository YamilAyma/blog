// Modal de Confirmación de Finalizar Redacción (Squash & Push)
export function FinalizarRedaccionModal({ isOpen, onConfirm, onClose, t }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 flex flex-col gap-4 animate-scale-up">
        
        {/* Header del Modal */}
        <div className="flex items-center gap-3 border-b pb-2">
          <span className="text-2xl select-none">🗜️</span>
          <h3 className="text-xl font-bold text-gray-800">Finalizar Redacción</h3>
        </div>

        {/* Imagen Ilustrativa */}
        <div className="rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 select-none shadow-inner py-4">
          <img 
            src="/success_session.png" 
            alt="Éxito de Redacción" 
            className="max-h-36 object-contain"
            onError={(e) => {
              e.target.src = "https://cdn-icons-png.flaticon.com/512/4436/4436481.png";
            }}
          />
        </div>

        {/* Cuerpo del Modal */}
        <div className="text-xs font-semibold text-gray-600 flex flex-col gap-2 leading-relaxed">
          <p>Se consolidarán todos los cambios locales pendientes para tu proyecto de forma segura:</p>
          
          <ul className="list-disc pl-5 flex flex-col gap-1.5 text-gray-500 font-medium">
            <li>Se realizará un <strong>aplanado de historial (Squash)</strong> unificando todos los micro-commits intermedios.</li>
            <li>Se mantendrá la <strong>lista de cambios detallada</strong> en la descripción del commit unificado.</li>
            <li>Se subirá la publicación directamente a <strong>GitHub (Git Push)</strong>.</li>
          </ul>

          <div className="mt-2 p-2.5 bg-[#d88a75]/5 text-[#d88a75] rounded-xl border border-[#d88a75]/10 font-bold">
            💡 Nota: El CMS permanecerá abierto y podrás continuar editando o creando nuevo contenido después.
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="flex justify-end gap-3 mt-2 border-t pt-3 border-gray-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer"
          >
            Seguir Editando
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-[#d88a75] hover:bg-[#c27c69] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Confirmar y Subir 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
