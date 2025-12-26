/**
 * Rehype plugin to add target="_blank" and rel="noopener noreferrer" to external links
 */
import { visit } from 'unist-util-visit';

export function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties && node.properties.href) {
        const href = node.properties.href;

        // Check if link is external (starts with http:// or https://)
        const isExternal = typeof href === 'string' && /^https?:\/\//.test(href);

        if (isExternal) {
          // Add target="_blank" and rel="noopener noreferrer"
          node.properties.target = '_blank';
          node.properties.rel = 'noopener noreferrer';
        }
      }
    });
  };
}
