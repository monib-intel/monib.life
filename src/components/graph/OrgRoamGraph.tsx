'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { GraphNode, GraphEdge } from '@/types'

interface OrgRoamGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onNodeClick?: (node: GraphNode) => void
  onNodeHover?: (node: GraphNode | null) => void
}

interface D3Node extends GraphNode {
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

interface D3Link extends GraphEdge {
  source: string | D3Node
  target: string | D3Node
}

export function OrgRoamGraph({ nodes, edges, onNodeClick, onNodeHover }: OrgRoamGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // Color scheme similar to org-roam-ui
  const getNodeColor = useCallback((node: D3Node, isHovered: boolean, isSelected: boolean) => {
    const baseColors = {
      thought: '#60A5FA',    // Blue
      project: '#34D399',    // Green  
      skill: '#A78BFA',      // Purple
      experience: '#FBBF24', // Amber
    }
    
    if (isSelected) return '#EF4444' // Red for selected
    if (isHovered) return '#F59E0B'  // Orange for hovered
    return baseColors[node.type as keyof typeof baseColors] || '#6B7280'
  }, [])

  const getNodeSize = useCallback((node: D3Node) => {
    // Size based on connections and type
    const baseSize = {
      thought: 8,
      project: 10,
      skill: 6,
      experience: 9,
    }
    
    const connections = edges.filter(e => 
      e.source === node.id || e.target === node.id
    ).length
    
    return (baseSize[node.type as keyof typeof baseSize] || 7) + Math.min(connections * 1.5, 8)
  }, [edges])

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = svgRef.current?.parentElement
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Initialize and update D3 simulation
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous render

    // Create containers
    const container = svg.append('g').attr('class', 'zoom-container')
    const linksContainer = container.append('g').attr('class', 'links')
    const nodesContainer = container.append('g').attr('class', 'nodes')

    // Prepare data
    const d3Nodes: D3Node[] = nodes.map(node => ({ ...node }))
    const d3Links: D3Link[] = edges.map(edge => ({ ...edge }))

    // Create simulation with stable, org-roam-ui style forces
    const simulation = d3.forceSimulation(d3Nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(d3Links)
        .id(d => d.id)
        .distance(80)
        .strength(0.2)
      )
      .force('charge', d3.forceManyBody()
        .strength(-300)
        .distanceMax(400)
      )
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => getNodeSize(d) + 8)
        .strength(0.8)
      )
      .alphaDecay(0.02)  // Slower decay for more stable settling
      .velocityDecay(0.3)  // More friction to prevent excessive movement

    simulationRef.current = simulation

    // Create links
    const link = linksContainer
      .selectAll('line')
      .data(d3Links)
      .enter()
      .append('line')
      .attr('class', 'graph-link')
      .style('stroke', '#374151')
      .style('stroke-opacity', 0.3)
      .style('stroke-width', (d) => d.type === 'related' ? 2 : 1)
      .style('stroke-dasharray', (d) => d.type === 'uses' ? '5,5' : 'none')

    // Create nodes
    const node = nodesContainer
      .selectAll('circle')
      .data(d3Nodes)
      .enter()
      .append('circle')
      .attr('class', 'graph-node')
      .attr('r', getNodeSize)
      .style('fill', d => getNodeColor(d, false, false))
      .style('stroke', '#ffffff')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .call(d3.drag<SVGCircleElement, D3Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.1).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          // Keep nodes fixed where user dragged them
          // d.fx = null
          // d.fy = null
        })
      )
      .on('click', (event, d) => {
        event.stopPropagation()
        setSelectedNode(d.id)
        onNodeClick?.(d)
        
        // Visual feedback for selection
        node.style('stroke', n => n.id === d.id ? '#EF4444' : '#ffffff')
        node.style('stroke-width', n => n.id === d.id ? 4 : 2)
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d.id)
        onNodeHover?.(d)
        
        // Highlight connected nodes and edges (without simulation restart)
        const connectedNodeIds = new Set<string>()
        d3Links.forEach(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id
          const targetId = typeof link.target === 'string' ? link.target : link.target.id
          
          if (sourceId === d.id) connectedNodeIds.add(targetId)
          if (targetId === d.id) connectedNodeIds.add(sourceId)
        })

        // Update node styles smoothly (preserve selection state)
        node.transition().duration(200)
          .style('opacity', n => n.id === d.id || connectedNodeIds.has(n.id) ? 1 : 0.3)
          .style('stroke-width', n => {
            if (n.id === selectedNode) return 4 // Keep selected node thick
            return n.id === d.id ? 3 : 2
          })
          
        link.transition().duration(200)
          .style('opacity', l => {
            const sourceId = typeof l.source === 'string' ? l.source : l.source.id
            const targetId = typeof l.target === 'string' ? l.target : l.target.id
            return sourceId === d.id || targetId === d.id ? 0.8 : 0.1
          })
          .style('stroke-width', l => {
            const sourceId = typeof l.source === 'string' ? l.source : l.source.id
            const targetId = typeof l.target === 'string' ? l.target : l.target.id
            return sourceId === d.id || targetId === d.id ? 3 : 1
          })
      })
      .on('mouseleave', () => {
        setHoveredNode(null)
        onNodeHover?.(null)
        
        // Reset all styles smoothly (preserve selection)
        node.transition().duration(300)
          .style('opacity', 1)
          .style('stroke-width', d => d.id === selectedNode ? 4 : 2)
          
        link.transition().duration(300)
          .style('opacity', 0.3)
          .style('stroke-width', d => d.type === 'related' ? 2 : 1)
      })

    // Create labels (only show for larger nodes or when zoomed in)
    const label = nodesContainer
      .selectAll('text')
      .data(d3Nodes.filter(d => getNodeSize(d) > 10))
      .enter()
      .append('text')
      .attr('class', 'graph-label')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#1F2937')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => d.data.title.length > 20 ? d.data.title.substring(0, 18) + '...' : d.data.title)

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
        
        // Adjust label visibility based on zoom level
        label.style('opacity', event.transform.k > 0.8 ? 1 : 0)
      })

    svg.call(zoom)
    
    // Click on empty space to deselect
    svg.on('click', (event) => {
      if (event.target === svg.node()) {
        setSelectedNode(null)
        node.style('stroke', '#ffffff').style('stroke-width', 2)
      }
    })

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as D3Node).x!)
        .attr('y1', d => (d.source as D3Node).y!)
        .attr('x2', d => (d.target as D3Node).x!)
        .attr('y2', d => (d.target as D3Node).y!)

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)

      label
        .attr('x', d => d.x!)
        .attr('y', d => d.y! + 4)
    })

    // Update node colors and selection state
    const updateNodeStyles = () => {
      node
        .style('fill', d => getNodeColor(d, d.id === hoveredNode, d.id === selectedNode))
        .style('stroke', d => d.id === selectedNode ? '#EF4444' : '#ffffff')
        .style('stroke-width', d => d.id === selectedNode ? 4 : 2)
    }

    updateNodeStyles()

    return () => {
      simulation.stop()
    }
  }, [nodes, edges, dimensions, getNodeColor, getNodeSize, onNodeClick, onNodeHover])
  
  // Update styles when selection changes
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    const node = svg.selectAll('.graph-node')
    
    node
      .style('fill', (d: any) => getNodeColor(d, d.id === hoveredNode, d.id === selectedNode))
      .style('stroke', (d: any) => d.id === selectedNode ? '#EF4444' : '#ffffff')
      .style('stroke-width', (d: any) => d.id === selectedNode ? 4 : 2)
  }, [selectedNode, hoveredNode, getNodeColor])

  // Fit graph to view
  const fitToView = useCallback(() => {
    if (!svgRef.current || !simulationRef.current) return
    
    const svg = d3.select(svgRef.current)
    const container = svg.select('.zoom-container')
    
    try {
      const bounds = container.node()?.getBBox()
      if (!bounds) return

      const fullWidth = dimensions.width
      const fullHeight = dimensions.height
      const width = bounds.width
      const height = bounds.height
      const midX = bounds.x + width / 2
      const midY = bounds.y + height / 2

      if (width === 0 || height === 0) return

      const scale = Math.min(fullWidth / width, fullHeight / height) * 0.8
      const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY]

      svg.transition()
        .duration(750)
        .call(
          d3.zoom<SVGSVGElement, unknown>().transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        )
    } catch (error) {
      console.warn('Could not fit graph to view:', error)
    }
  }, [dimensions])

  // Gently restart simulation
  const reheatSimulation = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.1).restart()
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={fitToView}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          Fit to View
        </button>
        <button
          onClick={reheatSimulation}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          Reheat
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 text-sm">
        <div className="font-medium text-gray-900 mb-2">Graph Navigation</div>
        <div className="space-y-1 text-xs text-gray-600">
          <div>• Drag nodes to reposition</div>
          <div>• Scroll to zoom</div>
          <div>• Hover to highlight connections</div>
          <div>• Click to select nodes</div>
        </div>
        
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Thoughts</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Projects</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <span>Skills</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <span>Experience</span>
          </div>
        </div>
      </div>

      {/* Performance info */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-gray-200 text-xs text-gray-600">
        {nodes.length} nodes • {edges.length} edges
      </div>
    </div>
  )
}