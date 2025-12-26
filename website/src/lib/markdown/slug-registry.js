/**
 * Slug registry for wikilink resolution
 * Maps page names to URLs using synchronous filesystem scanning
 */
import { globSync } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate multiple normalized variants of a page name for fuzzy matching
 */
function generateVariants(name) {
  const variants = new Set();

  // Original name
  variants.add(name.toLowerCase());

  // Without dashes
  variants.add(name.replace(/-/g, '').toLowerCase());

  // Without underscores
  variants.add(name.replace(/_/g, '').toLowerCase());

  // Without both dashes and underscores
  variants.add(name.replace(/[-_]/g, '').toLowerCase());

  // Replace dashes with spaces
  variants.add(name.replace(/-/g, ' ').toLowerCase());

  // Replace underscores with spaces
  variants.add(name.replace(/_/g, ' ').toLowerCase());

  // Replace both with spaces
  variants.add(name.replace(/[-_]/g, ' ').toLowerCase());

  return Array.from(variants);
}

/**
 * Convert file path to URL following Astro's routing logic
 * Matches the logic in [... slug].astro:14-34
 */
function fileToUrl(filePath) {
  let slug = filePath.replace(/\.md$/, '');

  // Handle index.md files
  if (slug.endsWith('/index')) {
    slug = slug.replace(/\/index$/, '');
  }

  // Normalize first segment to lowercase
  // e.g., Projects/blockchain-explorer → projects/blockchain-explorer
  // e.g., Articles/foo → articles/foo
  // e.g., Resume/doc → resume/doc
  const parts = slug.split('/');
  if (parts.length > 0) {
    const firstPart = parts[0];
    if (firstPart === 'Resume' || firstPart === 'Articles' || firstPart === 'Projects') {
      parts[0] = firstPart.toLowerCase();
      slug = parts.join('/');
    }
  }

  return '/' + slug;
}

/**
 * Build slug registry by scanning content directory
 * Returns a Map of normalized page names → URLs
 */
export function buildSlugRegistry() {
  const registry = new Map();

  // Find content directory (3 levels up from this file)
  const contentDir = path.join(__dirname, '..', '..', 'content', 'content');

  try {
    // Synchronously scan for all markdown files
    const files = globSync('**/*.md', { cwd: contentDir });

    for (const file of files) {
      // Skip index.md at root (has its own route)
      if (file === 'index.md') {
        continue;
      }

      const url = fileToUrl(file);

      // Extract filename without extension and path
      const basename = path.basename(file, '.md');

      // Also extract the full path without extension (for folder-based matching)
      const fullPathNoExt = file.replace(/\.md$/, '');

      // Generate variants for the basename
      const basenameVariants = generateVariants(basename);
      for (const variant of basenameVariants) {
        if (!registry.has(variant)) {
          registry.set(variant, url);
        }
      }

      // Also add variants for the full path (e.g., "Projects/blockchain-explorer")
      const fullPathVariants = generateVariants(fullPathNoExt);
      for (const variant of fullPathVariants) {
        if (!registry.has(variant)) {
          registry.set(variant, url);
        }
      }

      // Handle special case for section names (Articles, Projects, Resume)
      const parts = fullPathNoExt.split('/');
      if (parts.length > 0 && parts[0].match(/^(Resume|Articles|Projects)$/)) {
        const sectionVariants = generateVariants(parts[0]);
        for (const variant of sectionVariants) {
          // Only set if not already set (avoid overwriting specific pages)
          if (!registry.has(variant)) {
            registry.set(variant, '/' + parts[0].toLowerCase());
          }
        }
      }
    }

    return registry;
  } catch (error) {
    console.error('Error building slug registry:', error);
    return new Map();
  }
}

/**
 * Resolve a page name to a URL using the registry
 */
export function resolveSlug(pageName, registry) {
  if (!pageName) return null;

  // Normalize the page name
  const normalized = pageName.trim().toLowerCase();

  // Try exact match first
  if (registry.has(normalized)) {
    return registry.get(normalized);
  }

  // Try removing all special characters
  const cleaned = normalized.replace(/[^a-z0-9]/g, '');
  if (registry.has(cleaned)) {
    return registry.get(cleaned);
  }

  // Try partial match (fuzzy search) - find registry keys that contain or are contained by the cleaned name
  for (const [key, url] of registry.entries()) {
    const cleanedKey = key.replace(/[^a-z0-9]/g, '');
    if (cleanedKey === cleaned ||
        (cleanedKey.length > 3 && cleaned.length > 3 &&
         (cleanedKey.includes(cleaned) || cleaned.includes(cleanedKey)))) {
      return url;
    }
  }

  return null; // Dead link
}
