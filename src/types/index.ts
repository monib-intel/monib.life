// Graph types
export interface GraphNode {
  id: string;
  type: 'thought' | 'project' | 'skill' | 'experience' | 'topic';
  data: {
    label: string;
    title: string;
    description?: string;
    tags?: string[];
    url?: string;
    date?: string;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'related' | 'uses' | 'inspired_by' | 'part_of' | 'worked_on';
  data: {
    label?: string;
    strength?: number;
  };
}

// Content types
export interface ThoughtFrontmatter {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  published?: boolean;
  featured?: boolean;
  readingTime?: number;
  cover?: string;
  connections?: string[];
}

export interface ProjectFrontmatter {
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in-progress' | 'planned' | 'archived';
  featured?: boolean;
  technologies: string[];
  links?: {
    live?: string;
    github?: string;
    demo?: string;
  };
  images?: string[];
  connections?: string[];
}

export interface ResumeExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string[];
  skills: string[];
  achievements?: string[];
  connections?: string[];
}

export interface ResumeSkill {
  id: string;
  name: string;
  category: 'technical' | 'language' | 'tool' | 'framework' | 'soft';
  level: 1 | 2 | 3 | 4 | 5;
  years?: number;
  endorsed?: boolean;
  connections?: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  gpa?: string;
  honors?: string[];
  relevant?: string[];
}

// API response types
export interface ThoughtWithContent {
  frontmatter: ThoughtFrontmatter;
  content: string;
  slug: string;
}

export interface ProjectWithContent {
  frontmatter: ProjectFrontmatter;
  content: string;
  slug: string;
}

// Search and filtering types
export interface SearchFilters {
  type?: string[];
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  status?: string[];
}

export interface SearchResult {
  type: 'thought' | 'project' | 'experience' | 'skill';
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  date?: string;
  relevance: number;
}

// Graph visualization types
export interface GraphViewState {
  selectedNodes: string[];
  highlightedNodes: string[];
  filterBy: {
    nodeTypes: string[];
    edgeTypes: string[];
    tags: string[];
  };
  layout: 'force' | 'hierarchy' | 'circular' | 'grid';
  showMinimap: boolean;
  showControls: boolean;
}

// Component props types
export interface NavigationProps {
  currentPath: string;
}

export interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeSelect?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  className?: string;
}

export interface ContentCardProps {
  title: string;
  description: string;
  date?: string;
  tags?: string[];
  url: string;
  image?: string;
  type: 'thought' | 'project';
}

// Utility types
export type ContentType = 'thoughts' | 'projects' | 'resume' | 'graph';

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
}