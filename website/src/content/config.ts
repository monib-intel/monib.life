import { defineCollection, z } from 'astro:content';
import { baseSchema } from './_schemas/base';
import { bookSummarySchema } from './_schemas/book-summary';
import { projectSchema } from './_schemas/project';
import { resumeSchema } from './_schemas/resume';

// Content collection for all markdown content from the vault
const contentCollection = defineCollection({
  type: 'content',
  schema: z.union([
    // Regular page (default - no type specified)
    z.object({
      type: z.literal('page').optional(),
      ...baseSchema,
    }),
    // Book summary page
    z.object({
      type: z.literal('book-summary'),
      ...baseSchema,
      ...bookSummarySchema,
    }),
    // Project page
    z.object({
      type: z.literal('project'),
      ...baseSchema,
      ...projectSchema,
    }),
    // Resume page
    z.object({
      type: z.literal('resume'),
      ...baseSchema,
      ...resumeSchema,
    }),
  ]),
});

export const collections = {
  content: contentCollection,
};
