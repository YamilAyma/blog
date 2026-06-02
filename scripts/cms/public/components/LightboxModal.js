const { useEffect } = React;

// Modal Lightbox interactivo animado para zoom de imagen
export function LightboxModal({ src, onClose, t }) {
  if (!src) return null;

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in cursor-zoom-out"
    >
      <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center animate-scale-up">
        <img 
          src={src} 
          alt="Zoomed Image" 
          className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-white/10" 
          onClick={(e) => e.stopPropagation()}
        />
        <button 
          onClick={onClose}
          className="absolute top-[-40px] right-0 text-white font-bold bg-[#d88a75] hover:bg-[#c27c69] px-3 py-1 rounded-xl text-xs shadow-md transition-all cursor-pointer"
        >
          {t.close || 'Cerrar'} ✕
        </button>
      </div>
    </div>
  );
}
