import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Enhanced sample graph data for rich visualization
    const graphData = {
      nodes: [
        // Thoughts
        {
          id: 'thought-welcome',
          type: 'thought',
          data: {
            label: 'Digital Garden',
            title: 'Welcome to My Digital Garden', 
            description: 'An introduction to this interconnected space where thoughts, projects, and experiences come together.',
            tags: ['meta', 'introduction', 'digital-garden'],
            url: '/thoughts/welcome-to-digital-garden',
            date: '2025-01-15',
          },
          position: { x: 0, y: 0 },
        },
        {
          id: 'thought-nextjs',
          type: 'thought',
          data: {
            label: 'Scalable Next.js',
            title: 'Building Scalable Next.js Apps',
            description: 'Best practices and patterns for creating maintainable Next.js applications at scale.',
            tags: ['nextjs', 'react', 'web-development', 'architecture'],
            url: '/thoughts/building-scalable-nextjs-apps',
            date: '2025-01-10',
          },
          position: { x: 250, y: -100 },
        },
        
        // Projects
        {
          id: 'project-website',
          type: 'project',
          data: {
            label: 'Personal Website',
            title: 'monib.life',
            description: 'This website built with Next.js, featuring interactive graph visualization and content management.',
            tags: ['nextjs', 'typescript', 'tailwind', 'graph-visualization'],
            url: '/projects/personal-website',
            date: '2025-01-15',
          },
          position: { x: -200, y: 150 },
        },
        {
          id: 'project-component-lib',
          type: 'project',
          data: {
            label: 'Component Library',
            title: 'React Component Library',
            description: 'A comprehensive collection of reusable React components with TypeScript support.',
            tags: ['react', 'typescript', 'components', 'storybook'],
            url: '/projects/react-component-library',
            date: '2024-12-20',
          },
          position: { x: 200, y: 250 },
        },
        
        // Skills
        {
          id: 'skill-nextjs',
          type: 'skill',
          data: {
            label: 'Next.js',
            title: 'Next.js',
            description: 'React Framework - Level 5/5',
            tags: ['frontend', 'react', 'framework'],
            url: '/resume#skills',
          },
          position: { x: 450, y: 0 },
        },
        {
          id: 'skill-typescript',
          type: 'skill',
          data: {
            label: 'TypeScript',
            title: 'TypeScript',
            description: 'Programming Language - Level 5/5',
            tags: ['language', 'type-safety', 'javascript'],
            url: '/resume#skills',
          },
          position: { x: 400, y: 150 },
        },
        {
          id: 'skill-react',
          type: 'skill',
          data: {
            label: 'React',
            title: 'React',
            description: 'Frontend Library - Level 5/5',
            tags: ['frontend', 'javascript', 'library'],
            url: '/resume#skills',
          },
          position: { x: 350, y: -150 },
        },
        {
          id: 'skill-tailwind',
          type: 'skill',
          data: {
            label: 'Tailwind CSS',
            title: 'Tailwind CSS',
            description: 'CSS Framework - Level 4/5',
            tags: ['css', 'styling', 'framework'],
            url: '/resume#skills',
          },
          position: { x: -100, y: 300 },
        },
        
        // Experience
        {
          id: 'experience-fullstack',
          type: 'experience',
          data: {
            label: 'Full Stack Developer',
            title: 'Senior Full Stack Developer',
            description: 'Leading web application development with modern React and Node.js technologies.',
            tags: ['react', 'nodejs', 'typescript', 'leadership'],
            url: '/resume#experience',
            date: '2023-01-01',
          },
          position: { x: -400, y: -100 },
        },
        
        // Additional nodes to demonstrate scalability
        {
          id: 'thought-performance',
          type: 'thought',
          data: {
            label: 'Web Performance',
            title: 'Optimizing Web Performance',
            description: 'Strategies for building fast, responsive web applications.',
            tags: ['performance', 'optimization', 'web-vitals'],
            url: '/thoughts/web-performance',
            date: '2025-01-08',
          },
          position: { x: -150, y: -250 },
        },
        {
          id: 'skill-nodejs',
          type: 'skill',
          data: {
            label: 'Node.js',
            title: 'Node.js',
            description: 'Runtime Environment - Level 4/5',
            tags: ['backend', 'javascript', 'runtime'],
            url: '/resume#skills',
          },
          position: { x: -300, y: 50 },
        },
        {
          id: 'skill-postgresql',
          type: 'skill',
          data: {
            label: 'PostgreSQL',
            title: 'PostgreSQL',
            description: 'Database - Level 4/5',
            tags: ['database', 'sql', 'backend'],
            url: '/resume#skills',
          },
          position: { x: -450, y: 200 },
        },
        {
          id: 'project-api',
          type: 'project',
          data: {
            label: 'REST API',
            title: 'Enterprise REST API',
            description: 'Scalable REST API serving millions of requests with PostgreSQL and Redis.',
            tags: ['nodejs', 'postgresql', 'redis', 'api'],
            url: '/projects/enterprise-api',
            date: '2024-11-01',
          },
          position: { x: -350, y: -50 },
        },
        {
          id: 'thought-architecture',
          type: 'thought',
          data: {
            label: 'System Architecture',
            title: 'Microservices vs Monoliths',
            description: 'Comparing architectural patterns for modern web applications.',
            tags: ['architecture', 'microservices', 'scalability'],
            url: '/thoughts/microservices-architecture',
            date: '2024-12-15',
          },
          position: { x: 100, y: -300 },
        },
        {
          id: 'skill-docker',
          type: 'skill',
          data: {
            label: 'Docker',
            title: 'Docker & Kubernetes',
            description: 'Containerization - Level 4/5',
            tags: ['devops', 'containers', 'deployment'],
            url: '/resume#skills',
          },
          position: { x: 150, y: 400 },
        },
      ],
      edges: [
        // Thoughts to Projects
        {
          id: 'thought-nextjs-project-website',
          source: 'thought-nextjs',
          target: 'project-website',
          type: 'related',
          data: { label: 'implements' },
        },
        {
          id: 'thought-welcome-project-website',
          source: 'thought-welcome',
          target: 'project-website',
          type: 'related',
          data: { label: 'describes' },
        },
        
        // Projects to Skills (uses)
        {
          id: 'project-website-skill-nextjs',
          source: 'project-website',
          target: 'skill-nextjs',
          type: 'uses',
          data: { label: 'built with' },
        },
        {
          id: 'project-website-skill-typescript',
          source: 'project-website',
          target: 'skill-typescript',
          type: 'uses',
          data: { label: 'built with' },
        },
        {
          id: 'project-website-skill-tailwind',
          source: 'project-website',
          target: 'skill-tailwind',
          type: 'uses',
          data: { label: 'styled with' },
        },
        {
          id: 'project-component-lib-skill-react',
          source: 'project-component-lib',
          target: 'skill-react',
          type: 'uses',
          data: { label: 'built with' },
        },
        {
          id: 'project-component-lib-skill-typescript',
          source: 'project-component-lib',
          target: 'skill-typescript',
          type: 'uses',
          data: { label: 'built with' },
        },
        
        // Thoughts to Skills
        {
          id: 'thought-nextjs-skill-nextjs',
          source: 'thought-nextjs',
          target: 'skill-nextjs',
          type: 'uses',
          data: { label: 'explores' },
        },
        {
          id: 'thought-nextjs-skill-react',
          source: 'thought-nextjs',
          target: 'skill-react',
          type: 'uses',
          data: { label: 'explores' },
        },
        
        // Experience to Skills
        {
          id: 'experience-fullstack-skill-react',
          source: 'experience-fullstack',
          target: 'skill-react',
          type: 'uses',
          data: { label: 'applies' },
        },
        {
          id: 'experience-fullstack-skill-typescript',
          source: 'experience-fullstack',
          target: 'skill-typescript',
          type: 'uses',
          data: { label: 'applies' },
        },
        {
          id: 'experience-fullstack-skill-nextjs',
          source: 'experience-fullstack',
          target: 'skill-nextjs',
          type: 'uses',
          data: { label: 'applies' },
        },
        
        // Skill relationships
        {
          id: 'skill-react-skill-nextjs',
          source: 'skill-react',
          target: 'skill-nextjs',
          type: 'uses',
          data: { label: 'foundation for' },
        },
        
        // New connections for additional nodes
        {
          id: 'thought-performance-skill-react',
          source: 'thought-performance',
          target: 'skill-react',
          type: 'uses',
          data: { label: 'optimizes' },
        },
        {
          id: 'thought-performance-skill-nextjs',
          source: 'thought-performance',
          target: 'skill-nextjs',
          type: 'uses',
          data: { label: 'optimizes' },
        },
        {
          id: 'project-api-skill-nodejs',
          source: 'project-api',
          target: 'skill-nodejs',
          type: 'uses',
          data: { label: 'built with' },
        },
        {
          id: 'project-api-skill-postgresql',
          source: 'project-api',
          target: 'skill-postgresql',
          type: 'uses',
          data: { label: 'stores data in' },
        },
        {
          id: 'experience-fullstack-skill-nodejs',
          source: 'experience-fullstack',
          target: 'skill-nodejs',
          type: 'uses',
          data: { label: 'applies' },
        },
        {
          id: 'experience-fullstack-project-api',
          source: 'experience-fullstack',
          target: 'project-api',
          type: 'related',
          data: { label: 'worked on' },
        },
        {
          id: 'thought-architecture-project-api',
          source: 'thought-architecture',
          target: 'project-api',
          type: 'related',
          data: { label: 'discusses' },
        },
        {
          id: 'thought-architecture-skill-nodejs',
          source: 'thought-architecture',
          target: 'skill-nodejs',
          type: 'uses',
          data: { label: 'explores' },
        },
        {
          id: 'skill-docker-project-api',
          source: 'skill-docker',
          target: 'project-api',
          type: 'uses',
          data: { label: 'deploys' },
        },
      ]
    }
    
    return NextResponse.json(graphData)
  } catch (error) {
    console.error('Error generating graph data:', error)
    return NextResponse.json(
      { error: 'Failed to generate graph data' },
      { status: 500 }
    )
  }
}