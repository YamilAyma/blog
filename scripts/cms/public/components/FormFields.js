// Componente reutilizable para campos de carga de imágenes
function ImageLoaderField({ label, value, onChange, onOpenUploader, t }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="block text-xs font-bold text-gray-500">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 cms-input px-3 py-2 rounded-xl text-xs"
          placeholder="ej: /assets/images/foto.png o https://ejemplo.com/img.png"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={onOpenUploader}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
        >
          📂 Subir PC
        </button>
      </div>
      {value && (
        <div className="mt-2 w-full max-h-24 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center bg-gray-50 aspect-video max-w-40">
          <img src={value} alt="Previsualización" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}
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
                className="w-full cms-input px-3 py-2 rounded-xl text-xs h-24 leading-relaxed" 
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

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.tags}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs" 
                placeholder="ej: svelte, vite, sharp"
                value={Array.isArray(meta.tags) ? meta.tags.join(', ') : ''} 
                onChange={e => updateMeta('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.video}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                value={meta.videoYoutube || ''} 
                onChange={e => updateMeta('videoYoutube', e.target.value)} 
              />
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
                className="w-full cms-input px-3 py-2 rounded-xl text-xs h-24 leading-relaxed" 
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

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.tags}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs" 
                value={Array.isArray(meta.tags) ? meta.tags.join(', ') : ''} 
                onChange={e => updateMeta('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} 
              />
            </div>
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
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.copy_message}</label>
              <textarea 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs h-24 leading-relaxed" 
                value={meta.copy || ''} 
                onChange={e => updateMeta('copy', e.target.value)} 
              />
            </div>
          </div>

          <div className="cms-card p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-lg font-black border-b pb-2 text-[#d88a75]">{t.classification}</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.category}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs font-medium" 
                value={meta.category || 'General'} 
                onChange={e => updateMeta('category', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.tags}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs" 
                value={Array.isArray(meta.tags) ? meta.tags.join(', ') : ''} 
                onChange={e => updateMeta('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} 
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
                className="w-full cms-input px-3 py-2 rounded-xl text-xs h-24 leading-relaxed" 
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

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.tags}</label>
              <input 
                type="text" 
                className="w-full cms-input px-3 py-2 rounded-xl text-xs" 
                value={Array.isArray(meta.tags) ? meta.tags.join(', ') : ''} 
                onChange={e => updateMeta('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} 
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
              className="w-full cms-input px-3 py-2 rounded-xl text-xs h-24 leading-relaxed" 
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
