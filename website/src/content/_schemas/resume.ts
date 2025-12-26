import { z } from 'astro:content';

export const resumeSchema = {
  position: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
};
