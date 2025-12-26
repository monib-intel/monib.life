#!/usr/bin/env tsx

/**
 * Extract creation and modification dates from git history
 * for content files that don't have explicit dates in frontmatter
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FileDates {
  [filePath: string]: {
    created: string;
    modified: string;
  };
}

async function extractGitDates() {
  console.log('Extracting git dates for content files...');

  const contentDir = path.join(__dirname, '../content');
  const vaultDir = path.join(__dirname, '../../vault');
  const dates: FileDates = {};

  try {
    // Get all markdown files in content directory
    const files = await getMarkdownFiles(contentDir);

    for (const file of files) {
      const relativePath = path.relative(contentDir, file);
      const vaultFile = path.join(vaultDir, relativePath);

      try {
        // Get creation date (first commit)
        const created = execSync(
          `git -C "${vaultDir}" log --follow --format=%aI --reverse "${relativePath}" | head -1`,
          { encoding: 'utf-8' }
        ).trim();

        // Get last modified date (latest commit)
        const modified = execSync(
          `git -C "${vaultDir}" log --follow --format=%aI -1 "${relativePath}"`,
          { encoding: 'utf-8' }
        ).trim();

        if (created && modified) {
          dates[relativePath] = { created, modified };
        }
      } catch (error) {
        // File may not be in git yet, skip
        console.warn(`Warning: Could not get git dates for ${relativePath}`);
      }
    }

    const outputPath = path.join(__dirname, '../src/data/git-dates.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(dates, null, 2));

    console.log(`✓ Extracted dates for ${Object.keys(dates).length} files`);
  } catch (error) {
    console.error('Error extracting git dates:', error);
  }
}

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getMarkdownFiles(fullPath)));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

extractGitDates().catch(console.error);
