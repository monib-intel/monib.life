import { GraphNode, GraphEdge } from '@/types'

// Client-side graph filtering utilities (no Node.js dependencies)
export function filterGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  filters: {
    nodeTypes?: string[]
    tags?: string[]
    search?: string
  }
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  let filteredNodes = [...nodes]

  // Filter by node types
  if (filters.nodeTypes && filters.nodeTypes.length > 0) {
    filteredNodes = filteredNodes.filter(node => 
      filters.nodeTypes!.includes(node.type)
    )
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filteredNodes = filteredNodes.filter(node => 
      node.data.tags && node.data.tags.some(tag => 
        filters.tags!.some(filterTag => 
          tag.toLowerCase().includes(filterTag.toLowerCase())
        )
      )
    )
  }

  // Filter by search query
  if (filters.search && filters.search.trim()) {
    const searchLower = filters.search.toLowerCase()
    filteredNodes = filteredNodes.filter(node => 
      node.data.title.toLowerCase().includes(searchLower) ||
      (node.data.description && node.data.description.toLowerCase().includes(searchLower)) ||
      (node.data.tags && node.data.tags.some(tag => 
        tag.toLowerCase().includes(searchLower)
      ))
    )
  }

  // Filter edges to only include those between remaining nodes
  const nodeIds = new Set(filteredNodes.map(node => node.id))
  const filteredEdges = edges.filter(edge => 
    nodeIds.has(edge.source) && nodeIds.has(edge.target)
  )

  return { nodes: filteredNodes, edges: filteredEdges }
}

// Client-side utility functions
export function getNodeColor(type: string): string {
  const colors = {
    thought: '#3B82F6',   // Blue
    project: '#10B981',   // Green
    skill: '#8B5CF6',     // Purple
    experience: '#F59E0B', // Orange
    topic: '#EF4444',     // Red
  }
  return colors[type as keyof typeof colors] || '#6B7280'
}

export function getConnectedNodes(nodeId: string, edges: GraphEdge[]): string[] {
  const connected = new Set<string>()
  
  edges.forEach(edge => {
    if (edge.source === nodeId) {
      connected.add(edge.target)
    } else if (edge.target === nodeId) {
      connected.add(edge.source)
    }
  })
  
  return Array.from(connected)
}