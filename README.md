# monib.life

Personal website for Monib Ahmed - A modern digital garden featuring thoughts, projects, and professional experience with interactive graph visualization.

## 🌟 Live Demo

**Development Server:** http://localhost:3000 (after `npm run dev`)  
**Production Site:** *Coming soon - ready for deployment*

## 🚀 Project Overview

**monib.life** is Monib Ahmed's personal website built around four interconnected components:

1. **📝 Thoughts & Articles** - Personal writings, insights, and technical articles
2. **🛠️ Projects** - Portfolio of development work and creative projects  
3. **📄 Resume** - Interactive professional experience and career highlights
4. **🕸️ Graph View** - Interactive knowledge graph showing connections between all content

The site serves as both a professional portfolio and a digital garden where ideas, projects, and experiences connect and evolve together.

## ✨ Key Features

- **Org-Roam-UI Inspired Graph** - D3.js powered interactive knowledge graph with force simulation
- **Mobile-First Design** - Responsive design optimized for all screen sizes and devices
- **Content Management** - Markdown + frontmatter with automatic relationship detection
- **Search & Filtering** - Find content across all sections with real-time graph highlighting
- **Interactive Navigation** - Drag, zoom, click nodes to explore content connections
- **Sample Content** - Pre-populated with example thoughts, projects, skills, and experiences
- **Production Ready** - Complete implementation ready for deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.33 with TypeScript and App Router
- **Styling**: Tailwind CSS with custom design system and responsive components
- **Graph Visualization**: D3.js force simulation with SVG rendering (org-roam-ui inspired)
- **Content**: Markdown with gray-matter frontmatter parsing and automatic relationships
- **UI Components**: Lucide React icons + custom interactive components
- **Development**: ESLint, TypeScript strict mode, Hot reload, proxy support
- **Deployment**: Ready for Vercel deployment with optimized build

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/monibahmed/monib.life.git
cd monib.life

# Configure proxy (if behind corporate firewall)
npm config set proxy http://proxy-us.intel.com:912
npm config set https-proxy http://proxy-us.intel.com:912

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🎯 Implementation Status

### ✅ Completed Features
- **Homepage** - Hero section with navigation to all sections
- **Thoughts Page** - Article listing with featured content and individual article pages
- **Projects Page** - Portfolio showcase with technology breakdowns and external links
- **Resume Page** - Interactive timeline with skills matrix and experience details
- **Graph Page** - Org-roam-ui inspired D3.js visualization with 15+ sample nodes
- **Navigation** - Responsive header with mobile menu and sticky positioning
- **Content System** - Markdown processing with frontmatter and relationship detection
- **API Routes** - `/api/graph` endpoint serving graph data for client-side rendering
- **Styling** - Complete Tailwind CSS design system with hover effects and transitions

### 🎨 Graph Visualization Features
- **Force-Directed Layout** - Nodes naturally organize by relationships using D3.js physics
- **Interactive Controls** - Drag nodes, zoom/pan, click to select, hover to highlight
- **Node Types** - Color-coded: Blue (thoughts), Green (projects), Purple (skills), Orange (experience)
- **Connection Types** - Solid lines (related), Dashed lines (uses), Dynamic edge highlighting
- **Scalable Architecture** - Designed to handle 100s-1000s of nodes smoothly
- **Visual Feedback** - Selected nodes get red borders, hover effects, smooth transitions
- **Performance Optimized** - Efficient rendering with collision detection and alpha decay

### Troubleshooting

#### Common Issues

**npm install hangs or fails:**
- Check proxy configuration: `npm config list`
- Clear npm cache: `npm cache clean --force`
- Try different registry: `npm install --registry https://registry.npmjs.org/`

**TypeScript errors:**
- Install dependencies first: `npm install`
- Check Node.js version: `node --version` (should be 18+)
- Restart VS Code after installing dependencies

**Port 3000 already in use:**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
npm run dev -- -p 3001
```

**Proxy authentication issues:**
```bash
# Use authenticated proxy
npm config set proxy http://username:password@proxy-us.intel.com:912
npm config set https-proxy http://username:password@proxy-us.intel.com:912
```

## 📁 Project Structure

```
monib.life/
├── src/                    # Source code
│   ├── app/               # Next.js App Router pages
│   │   ├── thoughts/      # Blog/articles pages
│   │   │   ├── page.tsx           # Thoughts listing page
│   │   │   └── [slug]/page.tsx    # Individual article pages
│   │   ├── projects/      # Portfolio pages  
│   │   │   ├── page.tsx           # Projects listing page
│   │   │   └── [slug]/page.tsx    # Individual project pages
│   │   ├── resume/        # Resume page
│   │   │   └── page.tsx           # Interactive resume
│   │   ├── graph/         # Graph visualization page
│   │   │   └── page.tsx           # Knowledge graph interface
│   │   ├── layout.tsx     # Root layout with navigation
│   │   ├── page.tsx       # Homepage
│   │   └── globals.css    # Global styles
│   ├── components/        # React components
│   │   ├── thoughts/      # Article-specific components
│   │   ├── projects/      # Project-specific components
│   │   ├── resume/        # Resume-specific components
│   │   ├── graph/         # Graph visualization components
│   │   └── common/        # Shared UI components
│   │       ├── Navigation.tsx     # Site navigation
│   │       └── Footer.tsx         # Site footer
│   ├── lib/              # Utility libraries
│   │   ├── content.ts     # Content management functions
│   │   └── graph.ts       # Graph data processing
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts       # All type definitions
│   └── utils/            # General utility functions
│       └── index.ts       # Utility functions
├── content/              # Content files
│   ├── thoughts/         # Markdown articles
│   │   ├── welcome-to-digital-garden.md
│   │   └── building-scalable-nextjs-apps.md
│   ├── projects/         # Project descriptions
│   │   ├── personal-website-graph.md
│   │   └── react-component-library.md
│   ├── resume/          # Resume data (JSON)
│   │   └── resume-data.json
│   └── graph/           # Graph metadata
├── public/              # Static assets
│   ├── images/          # Images and media
│   └── resume/          # Resume PDFs
├── AGENTS.md           # Human-AI collaboration tracking
├── README.md           # Project documentation
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── next.config.js      # Next.js configuration
```



## Site Architecture

### Three Core Components

#### 1. 📝 Thoughts & Articles
- Personal blog posts and technical articles
- Markdown-based content management
- Categories and tags for organization
- Search and filtering capabilities

#### 2. 🛠️ Projects
- Portfolio showcase with project details
- Live demos and source code links
- Technology stacks and descriptions
- Project images and documentation

#### 3. 📄 Resume
- Interactive resume/CV presentation
- Download options (PDF format)
- Skills and experience timeline
- Professional accomplishments

## Project Structure

```
monib.life/
├── README.md              # Project overview and documentation
├── AGENTS.md             # Human vs AI contribution tracking
├── package.json          # Dependencies and scripts (when created)
├── src/                  # Source code directory
│   ├── components/       # Reusable UI components
│   │   ├── thoughts/     # Blog/article components
│   │   ├── projects/     # Portfolio components
│   │   ├── resume/       # Resume/CV components
│   │   └── common/       # Shared UI elements
│   ├── pages/           # Page components or routes
│   │   ├── thoughts/     # Article pages
│   │   ├── projects/     # Project showcase pages
│   │   └── resume/       # Resume page
│   ├── content/         # Content files (markdown, JSON)
│   │   ├── articles/     # Blog posts and articles
│   │   ├── projects/     # Project data and descriptions
│   │   └── resume/       # Resume data
│   ├── styles/          # CSS/styling files
│   ├── assets/          # Images, fonts, and static assets
│   └── utils/           # Utility functions and helpers
├── public/              # Static files (images, favicon, resume PDFs)
└── docs/               # Additional documentation
```

## 🌟 Implemented Features

### ✅ Core Pages
- **Home** - Hero section with gradient text and feature cards linking to all sections
- **Thoughts** - Article listing with featured posts, tags, and individual markdown-rendered pages
- **Projects** - Portfolio showcase with status badges, technology tags, and external links
- **Resume** - Interactive timeline, skills matrix, and experience details with JSON data
- **Graph** - Org-roam-ui inspired knowledge visualization with D3.js force simulation

### ✅ Graph Visualization Features
- **Interactive Nodes** - Click to select, drag to reposition, hover to highlight connections
- **Force Simulation** - Physics-based layout with collision detection and natural organization
- **Node Types** - Color-coded content types (thoughts=blue, projects=green, skills=purple, experience=orange)
- **Edge Types** - Visual distinction between "related" and "uses" relationships
- **Zoom & Pan** - Mouse wheel zoom, drag to pan, fit-to-view and reheat controls
- **Performance** - Optimized for large graphs with efficient D3.js rendering

### ✅ Content Management
- **Markdown Support** - Full markdown parsing with frontmatter metadata
- **Relationships** - Automatic connection detection between content pieces
- **Sample Content** - Pre-populated with example articles, projects, skills, and experiences
- **API Integration** - Client-server architecture with `/api/graph` endpoint

### ✅ Technical Implementation
- **Responsive Design** - Mobile-first with responsive navigation and layouts
- **TypeScript** - Full type safety across components and data structures
- **Performance** - Optimized builds with code splitting and lazy loading
- **Developer Experience** - Hot reload, proxy support for corporate networks
- **Production Ready** - Built and tested, ready for Vercel deployment

## Development Workflow

### Collaboration Approach
This project uses a **human-AI collaborative development model**:

- **Human (monibahmed):** Provides vision, content, design decisions, and final approval
- **AI Agent:** Implements technical solutions, generates code, and handles development tasks
- **Transparency:** All contributions are tracked in `AGENTS.md`

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature: description"
git push origin feature/new-feature

# Create pull request for review
```

## Design Principles

### Visual Design
- **Clean & Minimal** - Focus on content without clutter
- **Professional** - Suitable for business and personal use
- **Modern** - Contemporary design trends and best practices
- **Consistent** - Unified design language throughout

### User Experience
- **Fast & Responsive** - Quick loading on all devices
- **Intuitive Navigation** - Easy to find content
- **Accessible** - Usable by everyone
- **Engaging** - Interactive elements where appropriate

## Content Strategy

### Target Audience
- **Professional contacts** - Colleagues, employers, clients
- **Technical community** - Developers, tech professionals
- **Personal network** - Friends, family, and acquaintances
- **General visitors** - Anyone interested in the content

### Content Strategy by Component

#### Thoughts & Articles Content
- **Technical tutorials** - Development guides and how-tos
- **Industry insights** - Thoughts on tech trends and practices
- **Personal reflections** - Life experiences and lessons learned
- **Project deep-dives** - Detailed exploration of development work
- **Opinion pieces** - Views on technology, tools, and methodologies

#### Projects Portfolio Content
- **Web applications** - Full-stack development projects
- **Mobile apps** - iOS/Android application work
- **Open source contributions** - Community projects and libraries
- **Client work** - Professional development projects (where permitted)
- **Experiments** - Proof-of-concepts and learning projects

#### Resume Content
- **Professional experience** - Career history with detailed accomplishments
- **Technical skills** - Programming languages, frameworks, tools
- **Education** - Formal education and certifications
- **Achievements** - Awards, recognitions, and milestones
- **Volunteer work** - Community involvement and contributions

## 🚀 Deployment

### Ready for Production
The website is complete and ready for deployment to:
- **Vercel** (Recommended) - Automatic deployments from GitHub
- **Netlify** - Static site hosting with form handling
- **GitHub Pages** - Free hosting for public repositories

### Build & Deploy
```bash
# Test production build locally
npm run build
npm run start

# Deploy to Vercel
npx vercel

# Or connect GitHub repo to Vercel for auto-deployment
```

### Environment Variables
No environment variables required - the site uses static generation and client-side API routes.

## Performance Goals

- **Lighthouse Score:** 90+ in all categories
- **Page Load Time:** < 2 seconds on 3G
- **Core Web Vitals:** Pass all metrics
- **Accessibility Score:** WCAG AA compliance

## 🔧 Customization & Maintenance

### Adding Your Content
1. **Replace sample content** in `/content/` folders with your actual:
   - Articles in `/content/thoughts/`
   - Projects in `/content/projects/`
   - Resume data in `/content/resume/resume-data.json`

2. **Update graph connections** by adding `connections` arrays to frontmatter

3. **Customize styling** in `/src/app/globals.css` and component files

### Regular Maintenance
- **Content updates** - Add new thoughts, projects, and experiences
- **Dependencies** - Keep packages updated with `npm update`
- **Performance** - Monitor with Lighthouse and Core Web Vitals
- **SEO** - Update meta tags and Open Graph data

---

## Contributing

This project follows the collaboration model documented in `AGENTS.md`. All contributions should be properly attributed to maintain transparency in the human-AI development process.

## License

*To be determined based on project requirements*

---

**Last Updated:** November 13, 2025  
**Project Status:** ✅ **Complete Implementation** - Fully functional website with interactive graph visualization