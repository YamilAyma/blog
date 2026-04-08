import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    published: z.boolean().default(true), // Control de publicación
    category: z.string().default('General'),
    image: image().optional(),
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
  schema: ({ image }) => z.object({
    image: image(),
    imageAlt: z.string().optional(),
    title: z.string().optional(),
    copy: z.string().optional(),
    date: z.coerce.date(),
    published: z.boolean().default(true), // Control de publicación
    category: z.string().default('General'), // Uso interno
    tags: z.array(z.string()).optional(),
    socials: z.object({
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      facebook: z.string().optional(),
      tiktok: z.string().optional(),
    }).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    image: image(),
    imagenes: z.array(z.union([image(), z.string().url()])).optional(), // Soporte para imágenes locales y remotas
    periodo: z.string(),
    tags: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    tecnologias: z.array(z.string()).optional(),
    videoYoutube: z.string().optional(),
    links: z.array(z.object({
      type: z.string(),
      url: z.string(),
    })).optional(),
    order: z.number().default(0),
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/journal' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    project: z.string(), // Slug del proyecto al que pertenece
    image: image().optional(),
    tags: z.array(z.string()).optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = { blog, pages, posts, projects, journal };
