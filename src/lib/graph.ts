import { GraphNode, GraphEdge } from '@/types'
import { getAllThoughts, getAllProjects, getResumeData } from './content'

// Graph generation utilities
export function generateGraphData(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const connections = new Map<string, Set<string>>()

  // Add thoughts as nodes
  const thoughts = getAllThoughts()
  thoughts.forEach((thought, index) => {
    const nodeId = `thought-${thought.slug}`
    
    nodes.push({
      id: nodeId,
      type: 'thought',
      data: {
        label: thought.frontmatter.title,
        title: thought.frontmatter.title,
        description: thought.frontmatter.description,
        tags: thought.frontmatter.tags,
        url: `/thoughts/${thought.slug}`,
        date: thought.frontmatter.date,
      },
      position: {
        x: Math.cos(index * 0.5) * 200,
        y: Math.sin(index * 0.5) * 200,
      },
    })

    // Store connections from frontmatter
    if (thought.frontmatter.connections) {
      connections.set(nodeId, new Set(thought.frontmatter.connections))
    }
  })

  // Add projects as nodes
  const projects = getAllProjects()
  projects.forEach((project, index) => {
    const nodeId = `project-${project.slug}`
    
    nodes.push({
      id: nodeId,
      type: 'project',
      data: {
        label: project.frontmatter.title,
        title: project.frontmatter.title,
        description: project.frontmatter.description,
        tags: project.frontmatter.technologies,
        url: `/projects/${project.slug}`,
        date: project.frontmatter.date,
      },
      position: {
        x: Math.cos((index + thoughts.length) * 0.5) * 300,
        y: Math.sin((index + thoughts.length) * 0.5) * 300,
      },
    })

    // Store connections from frontmatter
    if (project.frontmatter.connections) {
      connections.set(nodeId, new Set(project.frontmatter.connections))
    }
  })

  // Add resume skills as nodes
  const resumeData = getResumeData()
  if (resumeData && resumeData.skills) {
    resumeData.skills.forEach((skill: any, index: number) => {
      const nodeId = `skill-${skill.id}`
      
      nodes.push({
        id: nodeId,
        type: 'skill',
        data: {
          label: skill.name,
          title: skill.name,
          description: `${skill.category} skill - Level ${skill.level}/5`,
          tags: [skill.category],
          url: `/resume#skills`,
        },
        position: {
          x: Math.cos((index + thoughts.length + projects.length) * 0.3) * 150,
          y: Math.sin((index + thoughts.length + projects.length) * 0.3) * 150,
        },
      })

      // Store connections from skill data
      if (skill.connections) {
        connections.set(nodeId, new Set(skill.connections))
      }
    })
  }

  // Add experiences as nodes
  if (resumeData && resumeData.experience) {
    resumeData.experience.forEach((exp: any, index: number) => {
      const nodeId = `experience-${exp.id}`
      
      nodes.push({
        id: nodeId,
        type: 'experience',
        data: {
          label: exp.title,
          title: `${exp.title} at ${exp.company}`,
          description: exp.description[0] || '',
          tags: exp.skills || [],
          url: `/resume#experience`,
          date: exp.startDate,
        },
        position: {
          x: Math.cos((index + thoughts.length + projects.length) * 0.7) * 250,
          y: Math.sin((index + thoughts.length + projects.length) * 0.7) * 250,
        },
      })

      // Store connections from experience data
      if (exp.connections) {
        connections.set(nodeId, new Set(exp.connections))
      }
    })
  }

  // Create edges based on connections
  connections.forEach((targetIds, sourceId) => {
    targetIds.forEach(targetId => {
      // Find nodes that match the target connection ID
      const targetNodes = nodes.filter(node => 
        node.id.includes(targetId) || 
        node.data.title.toLowerCase().includes(targetId.toLowerCase()) ||
        (node.data.tags && node.data.tags.some(tag => 
          tag.toLowerCase().includes(targetId.toLowerCase())
        ))
      )

      targetNodes.forEach(targetNode => {
        if (targetNode.id !== sourceId) {
          edges.push({
            id: `${sourceId}-${targetNode.id}`,
            source: sourceId,
            target: targetNode.id,
            type: 'related',
            data: {
              label: 'related',
            },
          })
        }
      })
    })
  })

  // Create automatic connections based on shared tags/technologies
  const nodesByTag = new Map<string, GraphNode[]>()
  
  nodes.forEach(node => {
    if (node.data.tags) {
      node.data.tags.forEach(tag => {
        const normalizedTag = tag.toLowerCase()
        if (!nodesByTag.has(normalizedTag)) {
          nodesByTag.set(normalizedTag, [])
        }
        nodesByTag.get(normalizedTag)!.push(node)
      })
    }
  })

  // Add edges for shared tags (limit to avoid overcrowding)
  nodesByTag.forEach((tagNodes, tag) => {
    if (tagNodes.length > 1 && tagNodes.length <= 5) {
      for (let i = 0; i < tagNodes.length; i++) {
        for (let j = i + 1; j < tagNodes.length; j++) {
          const edgeId = `${tagNodes[i].id}-${tagNodes[j].id}-tag`
          const reverseEdgeId = `${tagNodes[j].id}-${tagNodes[i].id}-tag`
          
          // Check if edge already exists
          const existingEdge = edges.find(e => 
            e.id === edgeId || e.id === reverseEdgeId ||
            (e.source === tagNodes[i].id && e.target === tagNodes[j].id) ||
            (e.source === tagNodes[j].id && e.target === tagNodes[i].id)
          )
          
          if (!existingEdge) {
            edges.push({
              id: edgeId,
              source: tagNodes[i].id,
              target: tagNodes[j].id,
              type: 'uses',
              data: {
                label: tag,
                strength: 0.5,
              },
            })
          }
        }
      }
    }
  })

  return { nodes, edges }
}

// Graph filtering and search
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

// Graph layout utilities
export function applyForceLayout(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  // Simple force-directed layout implementation
  const iterations = 100
  const nodeMap = new Map(nodes.map(node => [node.id, { ...node }]))
  
  for (let i = 0; i < iterations; i++) {
    // Repulsion between all nodes
    nodeMap.forEach((node1, id1) => {
      nodeMap.forEach((node2, id2) => {
        if (id1 !== id2) {
          const dx = node1.position.x - node2.position.x
          const dy = node1.position.y - node2.position.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 100 / (distance * distance)
          
          node1.position.x += (dx / distance) * force
          node1.position.y += (dy / distance) * force
        }
      })
    })

    // Attraction along edges
    edges.forEach(edge => {
      const source = nodeMap.get(edge.source)
      const target = nodeMap.get(edge.target)
      
      if (source && target) {
        const dx = target.position.x - source.position.x
        const dy = target.position.y - source.position.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        const force = distance * 0.01
        
        source.position.x += (dx / distance) * force
        source.position.y += (dy / distance) * force
        target.position.x -= (dx / distance) * force
        target.position.y -= (dy / distance) * force
      }
    })

    // Damping
    nodeMap.forEach(node => {
      node.position.x *= 0.9
      node.position.y *= 0.9
    })
  }

  return Array.from(nodeMap.values())
}

// Utility functions
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

export function findShortestPath(
  startId: string, 
  endId: string, 
  edges: GraphEdge[]
): string[] | null {
  const visited = new Set<string>()
  const queue = [[startId]]
  
  while (queue.length > 0) {
    const path = queue.shift()!
    const currentId = path[path.length - 1]
    
    if (currentId === endId) {
      return path
    }
    
    if (visited.has(currentId)) {
      continue
    }
    
    visited.add(currentId)
    
    const connectedNodes = getConnectedNodes(currentId, edges)
    connectedNodes.forEach(nodeId => {
      if (!visited.has(nodeId)) {
        queue.push([...path, nodeId])
      }
    })
  }
  
  return null
}