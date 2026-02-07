import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../../config';

export async function GET(context) {
    const posts = await getCollection('posts');
    const now = new Date();
    
    // Filtrar posts publicados y con fecha presente/pasada
    const publishedPosts = posts
        .filter(post => {
            if (!post.data.published) return false;
            if (post.data.date > now) return false;
            return true;
        })
        .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

    return rss({
        title: `${SITE.title} | Posts Visuales`,
        description: 'Posts visuales sobre automatización, marketing y SEO.',
        site: context.site,
        items: publishedPosts.map((post) => {
            const title = post.data.copy 
                ? (post.data.copy.length > 60 
                    ? post.data.copy.substring(0, 57) + '...' 
                    : post.data.copy)
                : 'Post Visual';

            return {
                title: title,
                pubDate: post.data.date,
                description: post.data.copy || 'Post visual del blog',
                link: `/posts/${post.id.replace(/\.(md|mdx)$/, "")}`,
                // Añadir imagen para Pinterest/LinkedIn (usando customData para el namespace de media)
                customData: `<media:content 
                    url="${new URL(post.data.image, SITE.url)}" 
                    medium="image" 
                    type="image/png" 
                />`,
            };
        }),
        xmlns: {
            media: 'http://search.yahoo.com/mrss/',
        },
    });
}
