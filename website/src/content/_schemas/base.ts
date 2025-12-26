import { z } from 'astro:content';

export const baseSchema = {
  title: z.string(),
  description: z.string().optional(),
  created: z.coerce.date().optional(), // From git or frontmatter
  updated: z.coerce.date().optional(), // From git or frontmatter
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('published'),
};
