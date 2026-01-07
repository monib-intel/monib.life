import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export interface NavItem {
  label: string;
  href: string;
}

/**
 * Check if directory has any markdown files
 */
async function hasMarkdownFiles(dirPath: string): Promise<boolean> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true, recursive: true });
    return entries.some(entry => entry.isFile() && entry.name.endsWith('.md'));
  } catch {
    return false;
  }
}

/**
 * Map vault directory names to their corresponding routes
 */
const ROUTE_MAPPING: Record<string, string> = {
  'Articles': '/articles',
  'Objectives': '/objectives',
  'Projects': '/projects',
  'Resume': '/resume',
};

/**
 * Get navigation items from vault directory structure
 * Only includes directories with at least one markdown file
 */
export async function getNavItems(): Promise<NavItem[]> {
  try {
    // Vault is at ../vault relative to the website directory
    // process.cwd() should be the website directory during build
    const vaultPath = join(process.cwd(), '..', 'vault');

    // Read directory contents
    const entries = await readdir(vaultPath, { withFileTypes: true });

    // Filter to only directories with content
    const navItems: NavItem[] = [];

    for (const entry of entries) {
      // Only directories
      if (!entry.isDirectory()) continue;
      // Exclude hidden folders (starting with .)
      if (entry.name.startsWith('.')) continue;

      // Check if directory has any markdown files
      const dirPath = join(vaultPath, entry.name);
      const hasContent = await hasMarkdownFiles(dirPath);

      if (hasContent) {
        // Use mapped route if available, otherwise use directory name
        const href = ROUTE_MAPPING[entry.name] || `/${entry.name}`;

        navItems.push({
          label: entry.name,
          href,
        });
      }
    }

    return navItems.sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    console.error('Error reading vault directory for navigation:', error);
    return [];
  }
}
