#!/usr/bin/env tsx

/**
 * Build knowledge graph data from content collection
 * Extracts wikilinks and creates nodes/edges for D3.js visualization
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GraphNode {
  id: string;
  title: string;
  path: string;
  type: string;
  importance: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'wikilink' | 'backlink';
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

async function buildGraph() {
  console.log('Building knowledge graph...');

  // TODO: Implement graph building logic
  // This will be populated after wikilink plugin is created
  // For now, create an empty graph structure

  const graphData: GraphData = {
    nodes: [],
    edges: [],
  };

  const outputPath = path.join(__dirname, '../src/data/graph.json');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(graphData, null, 2));

  console.log('✓ Graph data written to src/data/graph.json');
}

buildGraph().catch(console.error);
