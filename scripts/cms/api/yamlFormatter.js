import yaml from 'yaml';

export function parseFileContent(rawText) {
  const match = rawText.match(/^---\r?\n([\s\S]+?)\r?\n---([\s\S]*)/);
  if (!match) {
    return { metadata: {}, content: rawText };
  }
  
  const yamlText = match[1];
  const markdownBody = match[2];
  
  try {
    const metadata = yaml.parse(yamlText) || {};
    return { metadata, content: markdownBody.trim() };
  } catch (err) {
    console.error('Error parseando YAML:', err);
    return { metadata: {}, content: rawText, error: 'Error al parsear metadatos frontmatter' };
  }
}

export function serializeYaml(metadata) {
  const cleanMeta = { ...metadata };

  // Forzar una sola línea en descripciones
  if (cleanMeta.description) {
    cleanMeta.description = cleanMeta.description.toString().replace(/\r?\n|\r/g, ' ').trim();
  }
  if (cleanMeta.imageAlt) {
    cleanMeta.imageAlt = cleanMeta.imageAlt.toString().replace(/\r?\n|\r/g, ' ').trim();
  }

  // Crear Documento AST de YAML
  const doc = new yaml.Document(cleanMeta);

  // Formateador AST
  yaml.visit(doc, {
    Pair(key, pair) {
      // 1. Claves sin comillas (estilo PLAIN)
      if (pair.key && pair.key.type === 'SCALAR') {
        pair.key.type = 'PLAIN';
      }

      const propKey = pair.key && pair.key.value;

      // 2. Fechas sin comillas (estilo PLAIN)
      if (propKey === 'date') {
        if (pair.value && pair.value.type === 'SCALAR') {
          pair.value.type = 'PLAIN';
        }
        return;
      }

      // 3. Strings con comillas dobles en valores
      if (pair.value && pair.value.type === 'SCALAR' && typeof pair.value.value === 'string') {
        pair.value.type = 'QUOTE_DOUBLE';
      }
    },
    Seq(key, node) {
      node.flow = true; // Modo flujo (inline) para arrays simples
      
      // Strings con comillas dobles en elementos de arrays
      node.items.forEach(item => {
        if (item && item.type === 'SCALAR' && typeof item.value === 'string') {
          item.type = 'QUOTE_DOUBLE';
        }
      });
    }
  });

  return doc.toString({
    lineWidth: 0 // Evitar saltos de línea automáticos
  }).trim();
}
