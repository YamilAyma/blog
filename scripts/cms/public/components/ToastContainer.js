// Contenedor estético de Toasts en esquina
export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isWarn = toast.type === 'warn';
        const borderCol = isWarn ? 'border-yellow-500' : 'border-green-500';
        const titleCol = isWarn ? 'text-yellow-500' : 'text-green-600';
        return (
          <div 
            key={toast.id}
            className={`pointer-events-auto w-full bg-white border-l-4 ${borderCol} rounded-xl shadow-xl p-4 flex flex-col gap-1 border border-gray-100 animate-slide-in relative`}
          >
            <h4 className={`text-xs font-black ${titleCol} uppercase tracking-widest`}>{toast.title}</h4>
            <p className="text-xs font-semibold text-gray-500 leading-normal">{toast.message}</p>
            <button 
              onClick={() => onClose(toast.id)}
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 text-[10px] font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
