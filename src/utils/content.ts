
/**
 * Calculates the estimated reading time for a given text.
 * @param content The text content to analyze.
 * @returns The estimated reading time in minutes.
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 0;
  const words = content.trim().split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generates the correct URL for a content entry based on its collection.
 * @param entry The content entry (from getCollection or getEntry).
 * @returns The absolute URL path for the entry.
 */
export function getEntryUrl(entry: any): string {
  const collection = entry.collection;
  const slug = entry.slug || entry.id.replace(/\.(md|mdx)$/, "");
  
  let baseUrl = "/blog/";
  
  if (collection === "posts") {
    baseUrl = "/posts/";
  } else if (collection === "journal") {
    const projectRef = entry.data.project;
    const projectSlug = typeof projectRef === 'string' 
        ? projectRef.replace(/\.(md|mdx)$/, "") 
        : projectRef.id.replace(/\.(md|mdx)$/, "");
    baseUrl = `/proyectos/${projectSlug}/diario/`;
    
    // If the entry ID starts with the projectSlug folder, remove it to avoid duplication in the final URL
    const idPath = entry.id.replace(/\.(md|mdx)$/, "");
    const relativeSlug = idPath.startsWith(`${projectSlug}/`) 
        ? idPath.substring(projectSlug.length + 1) 
        : idPath;
        
    return `${baseUrl}${relativeSlug}`;
  }
}

/**
 * Formats a date to a consistent string.
 * @param date The date to format.
 * @returns A formatted date string.
 */
export function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("es-ES", { dateStyle: "medium" });
}
