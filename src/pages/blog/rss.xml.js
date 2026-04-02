import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../../config';

export async function GET(context) {
    const blogPosts = await getCollection('blog');
    const journalEntries = await getCollection('journal');
    const now = new Date();
    
    // Combinar colecciones de blog y diario
    const allEntries = [...blogPosts, ...journalEntries]
        .filter(entry => {
            // Filtrar por publicados y fecha presente/pasada
            const isPublished = entry.data.published !== false;
            const isPast = entry.data.date <= now;
            return isPublished && isPast;
        })
        .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

    return rss({
        title: `${SITE.author} | Blog & Bitácora`,
        description: 'Artículos sobre desarrollo, IA, automatización y bitácora de proyectos escritos por Yamil Ayma.',
        site: context.site || SITE.url,
        items: allEntries.map((entry) => {
            const isJournal = "project" in entry.data;
            
            // Replicar lógica de rutas de index.astro
            const slug = entry.id.replace(/\.(md|mdx)$/, "");
            const link = isJournal 
                ? `/proyectos/${entry.data.project}/diario/${slug.split('/').pop()}`
                : `/blog/${slug}`;

            return {
                title: entry.data.title,
                pubDate: entry.data.date,
                description: entry.data.description || 'Entrada de blog',
                link: link,
            };
        }),
        customData: `<language>es-ES</language>`,
    });
}
