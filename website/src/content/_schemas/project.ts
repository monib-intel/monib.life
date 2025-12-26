import { z } from 'astro:content';

export const projectSchema = {
  technologies: z.array(z.string()).default([]),
  github_url: z.string().url().optional(),
  demo_url: z.string().url().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  featured: z.boolean().default(false),
};
