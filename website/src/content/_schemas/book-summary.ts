import { z } from 'astro:content';

export const bookSummarySchema = {
  author: z.string(),
  generated: z.string().optional(),
  reading_level: z.enum(['Inspectional', 'Analytical', 'Syntopical']).optional(),
  analytical_reading: z.boolean().default(false),
  publisher: z.string().optional(),
  publication_year: z.number().optional(),
  isbn: z.string().optional(),
};
