'use client'

import { useEffect, useState } from 'react'
import { filterGraph } from '@/lib/graph-client'
import { GraphNode, GraphEdge } from '@/types'
import { OrgRoamGraph } from '@/components/graph/OrgRoamGraph'
import Link from 'next/link'
import { 
  NetworkIcon, 
  SearchIcon, 
  FilterIcon, 
  RotateCcwIcon,
  InfoIcon
} from 'lucide-react'

export default function GraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [filteredNodes, setFilteredNodes] = useState<GraphNode[]>([])
  const [filteredEdges, setFilteredEdges] = useState<GraphEdge[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['thought', 'project', 'skill', 'experience'])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load graph data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/graph')
        if (!response.ok) {
          throw new Error('Failed to fetch graph data')
        }
        const graphData = await response.json()
        setNodes(graphData.nodes)
        setEdges(graphData.edges)
        setFilteredNodes(graphData.nodes)
        setFilteredEdges(graphData.edges)
      } catch (error) {
        console.error('Error loading graph data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Apply filters
  useEffect(() => {
    const filtered = filterGraph(nodes, edges, {
      nodeTypes: selectedTypes,
      search: searchQuery
    })
    setFilteredNodes(filtered.nodes)
    setFilteredEdges(filtered.edges)
  }, [nodes, edges, selectedTypes, searchQuery])

  const nodeTypeColors = {
    thought: '#3B82F6',
    project: '#10B981', 
    skill: '#8B5CF6',
    experience: '#F59E0B'
  }

  const nodeTypeLabels = {
    thought: 'Thoughts',
    project: 'Projects',
    skill: 'Skills',
    experience: 'Experience'
  }

  const toggleNodeType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const resetView = () => {
    setSearchQuery('')
    setSelectedTypes(['thought', 'project', 'skill', 'experience'])
    setSelectedNode(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <NetworkIcon className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading knowledge graph...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <NetworkIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Knowledge Graph</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Org-roam-ui inspired graph visualization. Drag nodes, zoom to explore, 
            and hover to highlight connections between thoughts, projects, skills, and experiences.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Node Type Filters */}
            <div className="flex items-center space-x-2">
              <FilterIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Show:</span>
              {Object.entries(nodeTypeLabels).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => toggleNodeType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTypes.includes(type)
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedTypes.includes(type) 
                      ? nodeTypeColors[type as keyof typeof nodeTypeColors]
                      : undefined
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Reset Button */}
            <button
              onClick={resetView}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RotateCcwIcon className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Graph Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredNodes.length}</div>
            <div className="text-sm text-gray-600">Nodes</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredEdges.length}</div>
            <div className="text-sm text-gray-600">Connections</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {new Set(filteredNodes.flatMap(n => n.data.tags || [])).size}
            </div>
            <div className="text-sm text-gray-600">Topics</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {new Set(filteredNodes.map(n => n.type)).size}
            </div>
            <div className="text-sm text-gray-600">Types</div>
          </div>
        </div>

        {/* Org-Roam Style Graph Visualization */}
        <div className="mb-6" style={{ height: '70vh', minHeight: '600px' }}>
          <OrgRoamGraph 
            nodes={filteredNodes} 
            edges={filteredEdges}
            onNodeClick={(node) => {
              console.log('Clicked node:', node.data.title)
              setSelectedNode(node)
            }}
            onNodeHover={(node) => node && console.log('Hovered:', node.data.title)}
          />
        </div>

        {/* Node List and Details */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Nodes ({filteredNodes.length})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredNodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedNode?.id === node.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: nodeTypeColors[node.type as keyof typeof nodeTypeColors] }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {node.data.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {node.data.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 capitalize">
                          {node.type}
                        </span>
                        {node.data.url && (
                          <Link
                            href={node.data.url}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Node Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Node Details
            </h2>
            {selectedNode ? (
              <div className="content-card border-l-4 border-red-500">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600">Selected Node</span>
                </div>
                <div className="flex items-start space-x-3 mb-4">
                  <div
                    className="w-6 h-6 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: nodeTypeColors[selectedNode.type as keyof typeof nodeTypeColors] }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {selectedNode.data.title}
                    </h3>
                    <span className="text-sm text-gray-500 capitalize">
                      {selectedNode.type}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                  {selectedNode.data.description}
                </p>

                {selectedNode.data.tags && selectedNode.data.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.data.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.data.date && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Date</h4>
                    <p className="text-gray-600 text-sm">{selectedNode.data.date}</p>
                  </div>
                )}

                {selectedNode.data.url && (
                  <Link
                    href={selectedNode.data.url}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Content
                  </Link>
                )}
              </div>
            ) : (
              <div className="content-card text-center">
                <InfoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Click on a node to see its details and connections.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <InfoIcon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900 mb-2">
                How to Use the Knowledge Graph
              </h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• <strong>Search:</strong> Use the search bar to find specific content</li>
                <li>• <strong>Filter:</strong> Toggle node types to focus on specific content areas</li>
                <li>• <strong>Explore:</strong> Click on nodes to see detailed information</li>
                <li>• <strong>Navigate:</strong> Use the "View Content" button to jump to full articles</li>
                <li>• <strong>Connections:</strong> Hover over nodes to highlight relationships</li>
                <li>• <strong>Drag:</strong> Drag nodes to reposition them in the graph</li>
                <li>• <strong>Zoom:</strong> Scroll to zoom in and out of the graph</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}