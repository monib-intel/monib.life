#!/usr/bin/env node

import chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VAULT_PATH = path.resolve(__dirname, '../../vault');
const SYNC_SCRIPT = path.resolve(__dirname, './sync-vault.sh');

let isRunning = false;
let pendingSync = false;

async function syncVault() {
  if (isRunning) {
    pendingSync = true;
    return;
  }

  isRunning = true;
  console.log('🔄 Syncing vault to website...');

  try {
    const { stdout, stderr } = await execAsync(`bash "${SYNC_SCRIPT}"`);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('✅ Vault synced successfully');
  } catch (error) {
    console.error('❌ Error syncing vault:', error.message);
  } finally {
    isRunning = false;

    if (pendingSync) {
      pendingSync = false;
      syncVault();
    }
  }
}

console.log(`👀 Watching vault at: ${VAULT_PATH}`);
console.log('🚀 Initial sync...');

// Initial sync
await syncVault();

// Watch for changes
const watcher = chokidar.watch(VAULT_PATH, {
  ignored: [
    /(^|[\/\\])\../, // dotfiles
    '**/node_modules/**',
    '**/.obsidian/**',
    '**/.git/**',
  ],
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100
  }
});

watcher
  .on('add', (filePath) => {
    console.log(`📄 File added: ${path.relative(VAULT_PATH, filePath)}`);
    syncVault();
  })
  .on('change', (filePath) => {
    console.log(`📝 File changed: ${path.relative(VAULT_PATH, filePath)}`);
    syncVault();
  })
  .on('unlink', (filePath) => {
    console.log(`🗑️  File deleted: ${path.relative(VAULT_PATH, filePath)}`);
    syncVault();
  })
  .on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n👋 Stopping vault watcher...');
  watcher.close();
  process.exit(0);
});
