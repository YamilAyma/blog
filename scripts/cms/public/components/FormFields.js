const { useState, useEffect } = React;

// Componente de previsualización de imágenes tolerante a fallos
export function ImagePreview({ src, t, onClick }) {
  const [hasError, setHasError] = useState(false);

  // Reiniciar estado de error al cambiar la ruta
  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src) {
    return (
      <div 
        className="w-12 h-12 shrink-0 rounded-xl border border-dashed border-gray-200 bg-gray-100/50 flex items-center justify-center text-gray-400 text-sm font-black shadow-inner" 
        title={t.img_not_found}
      >
        ?
      </div>
    );
  }

  if (hasError) {
    return (
      <div 
        className="w-12 h-12 shrink-0 rounded-xl border border-red-100 bg-red-50 flex items-center justify-center text-red-400 text-sm font-black cursor-help shadow-inner" 
        title={t.img_not_found}
      >
        ?
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50 cursor-zoom-in hover:scale-105 transition-all shadow-xs"
    >
      <img 
        src={src} 
        alt="Previsualización" 
        className="h-full w-full object-cover" 
        onError={() => setHasError(true)} 
      />
    </div>
  );
}

// Componente reutilizable para campos de carga de imágenes individuales
function ImageLoaderField({ label, value, onChange, onOpenUploader, t }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="block text-xs font-bold text-gray-500">{label}</label>
      <div className="flex gap-2 items-center">
        <ImagePreview 
          src={value} 
          t={t} 
          onClick={() => value && window.openLightbox && window.openLightbox(value)} 
        />
        <input
          type="text"
          className="flex-1 cms-input px-3 py-2 rounded-xl text-xs font-medium"
          placeholder="ej: /assets/images/foto.png o https://ejemplo.com/img.png"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={onOpenUploader}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
        >
          {t.upload_pc || '📂 Subir PC'}
        </button>
      </div>
    </div>
  );
}

// Componente interactivo para arrays dinámicos de imágenes (Proyectos)
function ArrayListField({ label, values = [], onChange, onOpenUploader, t }) {
  const handleItemChange = (index, val) => {
    const nextList = [...values];
    nextList[index] = val;
    onChange(nextList);
  };

  const handleRemove = (index) => {
    const nextList = values.filter((_, i) => i !== index);
    onChange(nextList);
  };

  const handleAdd = () => {
    onChange([...values, '']);
  };

  return (
    <div className="flex flex-col gap-2 w-full border-t pt-3 mt-1">
      <div className="flex items-center justify-between border-b pb-1">
        <label className="block text-xs font-bold text-gray-500">{label}</label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] font-bold bg-[#d88a75] text-white px-2 py-0.5 rounded-lg hover:bg-[#c27c69] transition-all"
        >
          {t.add_image}
        </button>
      </div>
      
      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {values.map((val, idx) => (
          <div key={idx} className="flex gap-2 items-center w-full">
            <ImagePreview 
              src={val} 
              t={t} 
              onClick={() => val && window.openLightbox && window.openLightbox(val)} 
            />
            <input
              type="text"
              className="flex-1 cms-input px-3 py-2 rounded-xl text-xs font-medium"
              placeholder="ej: ../../assets/images/projects/img.png"
              value={val || ''}
              onChange={e => handleItemChange(idx, e.target.value)}
            />
            <button
              type="button"
              onClick={() => onOpenUploader(`imagenes[${idx}]`)}
              className="px-2.5 py-2 bg-gray-50 hover:bg-gray-100 border rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
            >
              📂
            </button>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="px-2 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 rounded-xl text-xs font-bold transition-all"
            >
              ✕
            </button>
          </div>
        ))}
        {values.length === 0 && (
          <span className="text-[10px] text-gray-400 italic text-center py-2">Sin imágenes asociadas</span>
        )}
      </div>
    </div>
  );
}

// Reproductor Miniatura de YouTube
function YouTubePreview({ videoId, t }) {
  if (!videoId) return null;
  return (
    <div className="flex flex-col gap-1.5 w-full mt-2 border-t pt-3">
      <label className="block text-xs font-bold text-gray-500">{t.youtube_preview}</label>
      <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-100 bg-black shadow-inner">
        <iframe
          src={`https://www.youtube.com/embed/${videoId.trim()}`}
          title="YouTube Video Player"
          className="w-full h-full border-none"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

// Componente controlado para tags que evita la pérdida de foco al digitar comas o espacios
function TagsField({ label, value = [], onChange, t }) {
  const [inputValue, setInputValue] = useState('');

  // Sincronizar estado local cuando cambia el valor externo (por ejemplo, al cambiar de entrada)
  useEffect(() => {
    if (Array.isArray(value)) {
      setInputValue(value.join(', '));
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleBlur = () => {
    // Dividir por comas y espacios, limpiar cada tag y remover duplicados/vacíos
    const tagsArray = inputValue
      .split(/[\s,]+/)
      .map(tag => tag.trim())
      .filter(Boolean);
    onChange(tagsArray);
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      <input 
        type="text" 
        className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
        placeholder="ej: svelte, vite, sharp (separa con espacios o comas)"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)} 
        onBlur={handleBlur}
      />
    </div>
  );
}

export function FormFields({ 
  entry = {}, 
  entryData = { metadata: {} }, 
  updateMeta, 
  onOpenUploader,
  collections = {},
  t 
}) {
  if (!entryData.metadata) return null;
  const meta = entryData.metadata;

  switch (entry.collection) {
    case 'projects':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-lg font-black border-b pb-2 text-[#d88a75]">{t.project_info}</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.title}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                value={meta.title || ''} 
                onChange={e => updateMeta('title', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.description}</label>
              <textarea 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs h-24 leading-relaxed font-medium" 
                value={meta.description || ''} 
                onChange={e => updateMeta('description', e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t.period}</label>
                <input 
                  type="text" 
                  className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                  value={meta.periodo || ''} 
                  onChange={e => updateMeta('periodo', e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t.order}</label>
                <input 
                  type="number" 
                  className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                  value={meta.order || 0} 
                  onChange={e => updateMeta('order', parseInt(e.target.value))} 
                />
              </div>
            </div>
          </div>

          <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-lg font-black border-b pb-2 text-[#d88a75]">{t.media}</h3>
            
            <ImageLoaderField
              label={t.featured_image}
              value={meta.image}
              onChange={val => updateMeta('image', val)}
              onOpenUploader={() => onOpenUploader('image')}
              t={t}
            />

            <ArrayListField
              label="Lista de Imágenes Adicionales (imagenes)"
              values={meta.imagenes}
              onChange={list => updateMeta('imagenes', list)}
              onOpenUploader={onOpenUploader}
              t={t}
            />

            <TagsField
              label={t.tags}
              value={meta.tags}
              onChange={val => updateMeta('tags', val)}
              t={t}
            />
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.video}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                value={meta.videoYoutube || ''} 
                onChange={e => updateMeta('videoYoutube', e.target.value)} 
              />
              <YouTubePreview videoId={meta.videoYoutube} t={t} />
            </div>
          </div>
        </div>
      );
    
    case 'blog':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-lg font-black border-b pb-2 text-[#d88a75]">{t.post_info}</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.title}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                value={meta.title || ''} 
                onChange={e => updateMeta('title', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.description_summary}</label>
              <textarea 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs h-24 leading-relaxed font-medium" 
                value={meta.description || ''} 
                onChange={e => updateMeta('description', e.target.value)} 
              />
            </div>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={meta.published !== false} 
                  onChange={e => updateMeta('published', e.target.checked)} 
                  className="w-4 h-4 rounded accent-[#d88a75]" 
                />
                {t.published}
              </label>
            </div>
          </div>

          <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-lg font-black border-b pb-2 text-[#d88a75]">{t.metadata_layout}</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.category}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                value={meta.category || 'General'} 
                onChange={e => updateMeta('category', e.target.value)} 
              />
            </div>
            
            <ImageLoaderField
              label="Imagen de Portada (image)"
              value={meta.image}
              onChange={val => updateMeta('image', val)}
              onOpenUploader={() => onOpenUploader('image')}
              t={t}
            />

            <TagsField
              label={t.tags}
              value={meta.tags}
              onChange={val => updateMeta('tags', val)}
              t={t}
            />
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.layout}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                placeholder="ej: ../../layouts/BlogPost.astro"
                value={meta.layout || ''} 
                onChange={e => updateMeta('layout', e.target.value)} 
              />
            </div>
          </div>
        </div>
      );

    case 'posts':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-lg font-black border-b pb-2 text-[#d88a75]">{t.micro_post}</h3>
            
            <ImageLoaderField
              label={t.image_required}
              value={meta.image}
              onChange={val => updateMeta('image', val)}
              onOpenUploader={() => onOpenUploader('image')}
              t={t}
            />

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.img_alt}</label>
              <textarea 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs h-16 leading-relaxed font-medium" 
                value={meta.imageAlt || ''} 
                onChange={e => updateMeta('imageAlt', e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.copy_message}</label>
              <textarea 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs h-24 leading-relaxed font-medium" 
                value={meta.copy || ''} 
                onChange={e => updateMeta('copy', e.target.value)} 
              />
            </div>
          </div>

          <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-lg font-black border-b pb-2 text-[#d88a75]">{t.classification}</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Fecha de Publicación</label>
              <input 
                type="date" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                value={meta.date || ''} 
                onChange={e => updateMeta('date', e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.category}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                value={meta.category || 'General'} 
                onChange={e => updateMeta('category', e.target.value)} 
              />
            </div>
            <TagsField
              label={t.tags}
              value={meta.tags}
              onChange={val => updateMeta('tags', val)}
              t={t}
            />
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={meta.published !== false} 
                  onChange={e => updateMeta('published', e.target.checked)} 
                  className="w-4 h-4 rounded accent-[#d88a75]" 
                />
                {t.published}
              </label>
            </div>
          </div>
        </div>
      );

    case 'journal':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-lg font-black border-b pb-2 text-[#d88a75]">{t.journal_label}</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.entry_title}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                value={meta.title || ''} 
                onChange={e => updateMeta('title', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.opt_description}</label>
              <textarea 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs h-24 leading-relaxed font-medium" 
                value={meta.description || ''} 
                onChange={e => updateMeta('description', e.target.value)} 
              />
            </div>
          </div>

          <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-lg font-black border-b pb-2 text-[#d88a75]">{t.project_relation}</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.project_select}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                value={meta.project || ''} 
                onChange={e => updateMeta('project', e.target.value)} 
              />
            </div>
            
            <ImageLoaderField
              label="Imagen Ilustrativa (image)"
              value={meta.image}
              onChange={val => updateMeta('image', val)}
              onOpenUploader={() => onOpenUploader('image')}
              t={t}
            />

            <TagsField
              label={t.tags}
              value={meta.tags}
              onChange={val => updateMeta('tags', val)}
              t={t}
            />
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={meta.published !== false} 
                  onChange={e => updateMeta('published', e.target.checked)} 
                  className="w-4 h-4 rounded accent-[#d88a75]" 
                />
                {t.published}
              </label>
            </div>
          </div>
        </div>
      );

    case 'pages':
      return (
        <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
          <h3 className="text-lg font-black border-b pb-2 text-[#d88a75]">Página Estática</h3>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{t.title}</label>
            <input 
              type="text" 
              className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
              value={meta.title || ''} 
              onChange={e => updateMeta('title', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{t.description}</label>
            <textarea 
              className="w-full cms-input px-3 py-2 rounded-xl text-xs h-24 leading-relaxed font-medium" 
              value={meta.description || ''} 
              onChange={e => updateMeta('description', e.target.value)} 
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
          <h3 className="text-lg font-black border-b pb-2 text-[#d88a75]">{t.generic_metadata}</h3>
          {Object.keys(meta).map(k => (
            <div key={k}>
              <label className="block text-xs font-bold text-gray-500 mb-1 capitalize">{k}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                value={meta[k] || ''} 
                onChange={e => updateMeta(k, e.target.value)} 
              />
            </div>
          ))}
        </div>
      );
  }
}
