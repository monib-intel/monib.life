// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Custom plugins (will be created)
import { remarkWikilinks } from './src/lib/markdown/remark-wikilinks.js';
// import { remarkCallouts } from './src/lib/markdown/remark-callouts.js';
// import { rehypeHeadings } from './src/lib/markdown/rehype-headings.js';
import { rehypeExternalLinks } from './src/lib/markdown/rehype-external-links.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://monib.life',
  devToolbar: {
    enabled: false,
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // We'll use our own global styles
    }),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkWikilinks,
      // remarkCallouts, // TODO: Enable after creating the plugin
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeExternalLinks,
      // rehypeHeadings, // TODO: Enable after creating the plugin
    ],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ['pagefind'],
    },
  },
});
