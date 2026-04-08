import { getCollection } from "astro:content";

/**
 * Common entry interface for processing various collections.
 */
export interface Entry {
  id: string;
  slug: string;
  collection: string;
  data: {
    title: string;
    description?: string;
    date: Date;
    published?: boolean;
    tags?: string[];
    [key: string]: any;
  };
}

/**
 * Fetches, filters, and sorts entries from multiple collections.
 * @param collections Array of collection names (e.g., ['blog', 'journal'])
 * @param limit Optional limit for number of entries
 * @returns Sorted array of entries
 */
export async function getSortedEntries(
  collections: string[],
  limit?: number
): Promise<any[]> {
  const now = new Date();
  
  // Fetch all entries from all requested collections
  const allEntriesPromises = collections.map(col => getCollection(col as any));
  const results = await Promise.all(allEntriesPromises);
  const allEntries = results.flat();

  // Filter and Sort
  const filtered = allEntries
    .filter((entry) => {
      // Basic publishing check
      if (entry.data.published === false) return false;
      // Future date check
      if (entry.data.date && entry.data.date > now) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = a.data.date?.valueOf() || 0;
      const dateB = b.data.date?.valueOf() || 0;
      return dateB - dateA;
    });

  return limit ? filtered.slice(0, limit) : filtered;
}

/**
 * Fetches all unique tags from across all content collections.
 */
export async function getAllUniqueTags(): Promise<string[]> {
    const allBlog = await getCollection("blog");
    const allProjects = await getCollection("projects" as any);
    const allPosts = await getCollection("posts" as any);
    const allJournal = await getCollection("journal" as any);

    const allEntries = [...allBlog, ...allProjects, ...allPosts, ...allJournal];
    const tags = [...new Set(allEntries.flatMap(entry => entry.data.tags || []))];
    
    return tags.sort();
}
