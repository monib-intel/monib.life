/**
 * Remark plugin to transform Obsidian wikilinks into standard markdown links
 * Handles: [[note]], [[note|alias]], [[note#heading]], ![[image]]
 */
import { visit } from 'unist-util-visit';
import { buildSlugRegistry, resolveSlug } from './slug-registry.js';

/**
 * Slugify heading text to match Astro's heading anchor generation
 */
function slugifyHeading(heading) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Parse a wikilink match into its components
 */
function parseWikilink(match) {
  const isEmbed = match.startsWith('!');
  const content = match.replace(/^!?\[\[|\]\]$/g, '');

  let pageName = content;
  let heading = null;
  let alias = null;

  // Check for heading and/or alias
  // Format: [[page#heading|alias]] or [[page#heading]] or [[page|alias]]

  // Split by | first (alias separator)
  const pipeParts = content.split('|');
  if (pipeParts.length > 1) {
    alias = pipeParts[1].trim();
    pageName = pipeParts[0].trim();
  }

  // Split by # (heading separator)
  const hashParts = pageName.split('#');
  if (hashParts.length > 1) {
    pageName = hashParts[0].trim();
    heading = hashParts[1].trim();
  }

  return {
    pageName: pageName.trim(),
    heading,
    alias,
    isEmbed,
  };
}

/**
 * Create an mdast link node
 */
function createLinkNode(url, text) {
  return {
    type: 'link',
    url: url,
    children: [{ type: 'text', value: text }],
    data: {
      hProperties: {
        className: ['wikilink'],
      },
    },
  };
}

/**
 * Create an mdast image node
 */
function createImageNode(url, alt) {
  return {
    type: 'image',
    url: url,
    alt: alt,
    data: {
      hProperties: {
        className: ['wikilink-embed'],
      },
    },
  };
}

/**
 * Create an HTML node for dead links
 */
function createDeadLinkNode(pageName, displayText) {
  return {
    type: 'html',
    value: `<span class="wikilink-dead" title="Page not found: ${pageName}">${displayText}</span>`,
  };
}

/**
 * Process a single wikilink and return the appropriate node
 */
function transformWikilink(match, slugRegistry, file) {
  const { pageName, heading, alias, isEmbed } = parseWikilink(match);

  // Resolve page slug
  const resolvedUrl = resolveSlug(pageName, slugRegistry);

  if (!resolvedUrl) {
    // Dead link - log warning and create visual indicator
    if (file) {
      file.message(
        `Dead wikilink: ${match} - page "${pageName}" not found`,
        null,
        'remark-wikilinks:dead-link'
      );
    }
    return createDeadLinkNode(pageName, alias || pageName);
  }

  // Build final URL with heading fragment
  let finalUrl = resolvedUrl;
  if (heading) {
    const headingSlug = slugifyHeading(heading);
    finalUrl += `#${headingSlug}`;
  }

  // Create appropriate node
  if (isEmbed) {
    // Image embed
    return createImageNode(finalUrl, alias || pageName);
  } else {
    // Regular link
    const linkText = alias || pageName;
    return createLinkNode(finalUrl, linkText);
  }
}

/**
 * Split text by wikilinks and create alternating text/node array
 */
function processTextWithWikilinks(text, slugRegistry, file) {
  // Combined regex to match all wikilink formats
  // Must match in order: images first (has !), then various link formats
  const wikilinkRegex = /!?\[\[([^\]]+?)\]\]/g;

  const nodes = [];
  let lastIndex = 0;
  let match;

  while ((match = wikilinkRegex.exec(text)) !== null) {
    // Add text before the wikilink
    if (match.index > lastIndex) {
      nodes.push({
        type: 'text',
        value: text.slice(lastIndex, match.index),
      });
    }

    // Add the transformed wikilink node
    nodes.push(transformWikilink(match[0], slugRegistry, file));

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last wikilink
  if (lastIndex < text.length) {
    nodes.push({
      type: 'text',
      value: text.slice(lastIndex),
    });
  }

  return nodes;
}

/**
 * Main remark plugin function
 */
export function remarkWikilinks() {
  // Build slug registry once during initialization
  const slugRegistry = buildSlugRegistry();

  console.log(`Wikilink registry built with ${slugRegistry.size} entries`);

  return (tree, file) => {
    const nodesToProcess = [];

    // First pass: collect all text nodes that contain wikilinks
    visit(tree, 'text', (node, index, parent) => {
      if (node.value.includes('[[')) {
        nodesToProcess.push({ node, index, parent });
      }
    });

    // Second pass: process wikilinks in reverse order to maintain indices
    // This prevents index shifting issues when replacing nodes
    for (let i = nodesToProcess.length - 1; i >= 0; i--) {
      const { node, index, parent } = nodesToProcess[i];

      // Skip if no parent (shouldn't happen, but be safe)
      if (!parent || index === null || index === undefined) {
        continue;
      }

      // Process the text and get replacement nodes
      const replacementNodes = processTextWithWikilinks(node.value, slugRegistry, file);

      // Replace the text node with the new nodes
      parent.children.splice(index, 1, ...replacementNodes);
    }
  };
}
