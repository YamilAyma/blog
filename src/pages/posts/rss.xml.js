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
            const itemTitle = post.data.title || (post.data.copy 
                ? (post.data.copy.length > 80 
                    ? post.data.copy.substring(0, 77) + '...' 
                    : post.data.copy)
                : 'Post Visual');

            const itemSummary = post.data.copy || 'Post visual del blog';
            // Contenido extenso: Cuerpo MDX con delimitador <br/> para Make
            const bodyContent = post.body ? post.body.trim() : itemSummary;
            const contentWithDelimiters = bodyContent.replace(/\n/g, '<br/>');

            return {
                title: itemTitle,
                pubDate: post.data.date,
                description: itemSummary,
                link: `/posts/${post.id.replace(/\.(md|mdx)$/, "")}`,
                customData: `
                    <content:encoded><![CDATA[${contentWithDelimiters}]]></content:encoded>
                    <media:content 
                        url="${new URL(post.data.image.src, SITE.url)}" 
                        medium="image" 
                        type="image/png" 
                    >${post.data.imageAlt ? `\n                        <media:description type="plain">${post.data.imageAlt}</media:description>` : ''}
                    </media:content>`,
            };
        }),
        xmlns: {
            media: 'http://search.yahoo.com/mrss/',
            content: 'http://purl.org/rss/1.0/modules/content/',
        },
    });
}
