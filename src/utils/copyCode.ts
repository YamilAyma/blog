/**
 * Script para agregar botón de copiar código a los bloques pre
 * Se ejecuta en el cliente después de cargar la página
 */

function initCopyButtons() {
  const codeBlocks = document.querySelectorAll('.prose pre');
  
  codeBlocks.forEach((pre) => {
    // Evitar duplicados si ya existe un botón
    if (pre.querySelector('.code-copy-btn')) return;
    
    const button = document.createElement('button');
    button.className = 'code-copy-btn';
    button.textContent = 'Copiar';
    button.setAttribute('aria-label', 'Copiar código');
    
    button.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      const text = code ? code.textContent || '' : pre.textContent || '';
      
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = '¡Copiado!';
        button.classList.add('copied');
        
        setTimeout(() => {
          button.textContent = 'Copiar';
          button.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
        button.textContent = 'Error';
        setTimeout(() => {
          button.textContent = 'Copiar';
        }, 2000);
      }
    });
    
    pre.appendChild(button);
  });
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initCopyButtons);

// También ejecutar en navegación de Astro (View Transitions)
document.addEventListener('astro:page-load', initCopyButtons);
