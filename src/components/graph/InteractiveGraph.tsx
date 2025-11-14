'use client'

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Connection,
  BackgroundVariant,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { GraphNode, GraphEdge } from '@/types'

// Custom Node Components
const ThoughtNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-lg rounded-lg bg-blue-50 border-2 border-blue-200 min-w-[120px]">
    <div className="font-medium text-blue-900 text-sm">{data.title}</div>
    {data.tags && (
      <div className="text-xs text-blue-600 mt-1 opacity-75">
        {data.tags.slice(0, 2).join(', ')}
      </div>
    )}
  </div>
)

const ProjectNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-lg rounded-lg bg-green-50 border-2 border-green-200 min-w-[120px]">
    <div className="font-medium text-green-900 text-sm">{data.title}</div>
    {data.tags && (
      <div className="text-xs text-green-600 mt-1 opacity-75">
        {data.tags.slice(0, 2).join(', ')}
      </div>
    )}
  </div>
)

const SkillNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 shadow-lg rounded-lg bg-purple-50 border-2 border-purple-200 min-w-[100px]">
    <div className="font-medium text-purple-900 text-sm">{data.title}</div>
    <div className="text-xs text-purple-600 mt-1 opacity-75">Skill</div>
  </div>
)

const ExperienceNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-lg rounded-lg bg-orange-50 border-2 border-orange-200 min-w-[120px]">
    <div className="font-medium text-orange-900 text-sm">{data.title}</div>
    <div className="text-xs text-orange-600 mt-1 opacity-75">Experience</div>
  </div>
)

const nodeTypes = {
  thought: ThoughtNode,
  project: ProjectNode,
  skill: SkillNode,
  experience: ExperienceNode,
}

interface InteractiveGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onNodeClick?: (node: GraphNode) => void
}

export function InteractiveGraph({ nodes, edges, onNodeClick }: InteractiveGraphProps) {
  // Convert our graph data to React Flow format
  const reactFlowNodes: Node[] = useMemo(() => 
    nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node.data,
        onClick: () => onNodeClick?.(node),
      },
    }))
  , [nodes, onNodeClick])

  const reactFlowEdges: Edge[] = useMemo(() => 
    edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: edge.type === 'related',
      style: {
        stroke: edge.type === 'related' ? '#3B82F6' : '#6B7280',
        strokeWidth: 2,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: edge.type === 'related' ? '#3B82F6' : '#6B7280',
      },
    }))
  , [edges])

  const [internalNodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes)
  const [internalEdges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Update internal state when props change
  useMemo(() => {
    setNodes(reactFlowNodes)
  }, [reactFlowNodes, setNodes])

  useMemo(() => {
    setEdges(reactFlowEdges)
  }, [reactFlowEdges, setEdges])

  return (
    <div className="w-full h-[600px] bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <ReactFlow
        nodes={internalNodes}
        edges={internalEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-left"
      >
        <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
        <MiniMap 
          className="bg-white border border-gray-200 rounded-lg"
          nodeColor={(node) => {
            switch (node.type) {
              case 'thought': return '#3B82F6'
              case 'project': return '#10B981'
              case 'skill': return '#8B5CF6'
              case 'experience': return '#F59E0B'
              default: return '#6B7280'
            }
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E5E7EB" />
        
        <Panel position="top-left" className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-2">Graph Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>Thoughts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>Projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span>Skills</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span>Experience</span>
            </div>
          </div>
        </Panel>

        <Panel position="top-right" className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-1">Interactive Graph</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Drag to pan</div>
            <div>• Scroll to zoom</div>
            <div>• Click nodes to explore</div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}