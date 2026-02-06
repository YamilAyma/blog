import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    published: z.boolean().default(true), // Control de publicación
    category: z.string().default('General'),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    layout: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    image: z.string(),
    copy: z.string().optional(),
    date: z.coerce.date(),
    published: z.boolean().default(true), // Control de publicación
    category: z.string().default('General'), // Uso interno
    socials: z.object({
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      facebook: z.string().optional(),
      tiktok: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { blog, pages, posts };
