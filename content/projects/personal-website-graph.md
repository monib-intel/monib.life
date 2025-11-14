---
title: "Personal Website with Interactive Graph"
description: "A modern personal website built with Next.js featuring an interactive knowledge graph to explore connections between content."
date: "2025-01-10"
status: "in-progress"
featured: true
technologies: ["Next.js", "TypeScript", "React Flow", "D3.js", "Tailwind CSS"]
links:
  github: "https://github.com/monibahmed/monib.life"
  live: "https://monib.life"
images: 
  - "/images/projects/website-graph-view.png"
  - "/images/projects/website-mobile.png"
connections: ["welcome-to-digital-garden", "knowledge-graphs", "react-flow", "nextjs"]
---

# Personal Website with Interactive Graph

This project represents my vision of a **digital garden**—a personal website that goes beyond traditional blogging to create an interconnected web of thoughts, projects, and experiences.

## The Concept

Rather than organizing content chronologically like a typical blog, this site uses an **interactive graph** to show relationships between:

- 📝 **Thoughts & Articles** - Technical insights, personal reflections, and tutorials
- 🛠️ **Projects** - Portfolio pieces with detailed technology breakdowns  
- 📄 **Resume** - Professional experience with skill connections
- 🕸️ **Graph View** - Visual exploration of all content relationships

## Technical Implementation

### Architecture
- **Next.js 14** with TypeScript and App Router for modern React development
- **React Flow** for interactive node manipulation and graph rendering
- **D3.js** for advanced physics simulations and custom layouts
- **Tailwind CSS** for responsive design and component styling
- **Markdown + Frontmatter** for structured content management

### Key Features
- **Mobile-First Design** - Optimized for all screen sizes
- **Graph Visualization** - Interactive nodes showing content relationships
- **Content Management** - Markdown-based with automatic graph generation
- **Search & Filtering** - Find content across all sections
- **Mobile Editing** - Integration with Obsidian Mobile for on-the-go updates

### Graph System
The heart of the site is a custom graph system that automatically creates connections between:
- **Shared Technologies** - Projects using similar tech stacks
- **Related Topics** - Content covering similar themes
- **Skill Development** - How experiences built specific capabilities
- **Inspiration Links** - Ideas that influenced other work

## Development Approach

### Human-AI Collaboration
This project is built using a transparent **human-AI collaborative approach**:
- **Human Direction** - Vision, content strategy, and design decisions
- **AI Implementation** - Code generation, technical architecture, and optimization
- **Shared Documentation** - All contributions tracked in `AGENTS.md`

### Mobile-First Workflow
The entire content creation workflow is optimized for mobile editing:
1. **Obsidian Mobile** for writing and editing content
2. **Git Sync** for automatic repository updates  
3. **Auto-Deployment** via Vercel for instant publishing
4. **Graph Updates** that reflect new connections automatically

## Technical Challenges

### Graph Performance
Rendering large graphs with hundreds of nodes while maintaining smooth interaction required:
- **Virtualization** for handling large datasets
- **Smart Filtering** to reduce visual complexity
- **Efficient Layouts** using D3.js force simulations
- **Incremental Updates** for real-time graph changes

### Content Relationships
Automatically detecting and creating meaningful connections between content:
- **Frontmatter Analysis** for explicit connections
- **Tag Matching** for topic-based relationships
- **Technology Overlap** for project similarities
- **Semantic Analysis** for content themes

### Mobile Experience
Ensuring the graph interface works well on mobile devices:
- **Touch Gestures** for navigation and interaction
- **Responsive Layouts** that adapt to screen size
- **Performance Optimization** for mobile browsers
- **Simplified UI** for smaller screens

## Future Enhancements

### Advanced Graph Features
- **Clustering** - Group related nodes automatically
- **Time-Based Views** - Show content evolution over time
- **Search Integration** - Highlight graph paths based on queries
- **Export Options** - Share graph views as images or data

### Content Features
- **Comment System** - Enable discussion on thoughts and projects
- **Analytics** - Track popular content and navigation paths
- **RSS Feeds** - Subscribe to updates by category
- **Email Digest** - Weekly summaries of new content

### Technical Improvements
- **Offline Support** - Progressive Web App capabilities
- **Performance Monitoring** - Real-time performance insights
- **A/B Testing** - Optimize user experience based on data
- **Accessibility** - Enhanced support for screen readers and keyboard navigation

## Lessons Learned

Building this site has been a journey in balancing **technical innovation** with **practical usability**. Key insights:

1. **Graph Complexity** - Too many connections can overwhelm users
2. **Mobile Constraints** - Graph interfaces need careful mobile optimization
3. **Content Strategy** - Connection metadata is as important as the content itself
4. **Performance Balance** - Rich interactions vs. fast loading times

## Open Source

This project is **open source** and serves as a template for others building similar digital gardens. The codebase demonstrates:
- Modern Next.js architecture patterns
- Interactive graph implementation
- Content management workflows  
- Mobile-first development practices

---

*This project continues to evolve as I add new features and refine the user experience. The graph grows more interesting with each new piece of content.*