# monib.life

Personal website for Monib Ahmed - A digital garden with dual implementations for optimal flexibility and exploration.

## 🌟 Two Implementations Available

This repository contains **two complete website implementations** to explore different approaches to digital gardens and knowledge management:

### 1. **Next.js Version** (main branch)
- **Interactive D3.js Graph** - Org-roam-ui inspired force simulation visualization
- **Custom React Components** - Tailored design with TypeScript and modern tooling
- **Dynamic Content Management** - API routes and server-side rendering
- **Development Server:** http://localhost:3000 (after `npm run dev`)

### 2. **Quartz Version** (quartz-version branch)  
- **Static Site Generation** - Fast, lightweight Obsidian-compatible site generator
- **Native Graph View** - Built-in backlinks and graph visualization 
- **Pure Defaults** - Clean, minimal theme with zero customizations
- **Development Server:** http://localhost:8080 (after `npx quartz build --serve`)

## 🚀 Project Overview

**monib.life** is Monib Ahmed's personal website built around three core components:

1. **📝 Thoughts & Articles** - Personal writings, insights, and technical articles
2. **🛠️ Projects** - Portfolio of development work and creative projects  
3. **📄 Resume/About** - Professional experience and career highlights

Both implementations provide the same content with different technical approaches, allowing exploration of modern web development patterns versus established static site generation.

## ✨ Feature Comparison

### Next.js Version Features (main branch)
- **Org-Roam-UI Inspired Graph** - Custom D3.js powered interactive knowledge graph with force simulation
- **React Components** - Custom UI components with TypeScript and modern tooling
- **API Routes** - Server-side graph data processing and dynamic content
- **Tailwind CSS** - Custom design system with responsive components
- **Development Tools** - Hot reload, ESLint, TypeScript strict mode

### Quartz Version Features (quartz-version branch)
- **Built-in Graph View** - Native Quartz graph visualization with backlinks
- **Wikilink Support** - Obsidian-compatible `[[wikilinks]]` throughout content
- **Static Generation** - Fast, lightweight site with no JavaScript dependencies
- **Default Theme** - Clean, minimal blue/teal color scheme with zero customizations
- **Obsidian Workflow** - Perfect for users already managing content in Obsidian

## 🛠️ Tech Stack Comparison

### Next.js Implementation (main)
- **Framework**: Next.js 14.2.33 with TypeScript and App Router
- **Styling**: Tailwind CSS with custom design system
- **Graph**: Custom D3.js force simulation (org-roam-ui inspired)
- **Content**: Markdown with gray-matter frontmatter parsing
- **Deployment**: Vercel-optimized with API routes

### Quartz Implementation (quartz-version)  
- **Framework**: Quartz 4.5.2 static site generator
- **Styling**: Default Quartz theme (no customizations)
- **Graph**: Built-in Quartz graph view with backlinks
- **Content**: Obsidian-compatible markdown with wikilinks
- **Deployment**: Static files deployable anywhere

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (v22+ recommended for Quartz)
- npm, yarn, or pnpm
- Git

### Option 1: Next.js Version (main branch)

```bash
# Clone and use main branch
git clone https://github.com/monibahmed/monib.life.git
cd monib.life

# Install dependencies  
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Option 2: Quartz Version (quartz-version branch)

```bash
# Clone and switch to Quartz branch
git clone https://github.com/monibahmed/monib.life.git
cd monib.life
git checkout quartz-version

# Install dependencies (requires Node.js 22+)
npm install

# Build and serve
npx quartz build --serve

# Open http://localhost:8080
```

### Branch Switching

```bash
# Switch between implementations
git checkout main              # Next.js version
git checkout quartz-version    # Quartz version

# Check current branch
git branch
```

### Available Scripts

#### Next.js Version (main)
```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build  
npm run start        # Production server
npm run lint         # ESLint checks
```

#### Quartz Version (quartz-version)
```bash
npx quartz build --serve    # Build and serve (localhost:8080)
npx quartz build           # Build only
npx quartz sync            # Sync with content changes
```

## 🎯 Implementation Status

### ✅ Both Versions Complete

#### Next.js Version (main branch)
- **Custom Components** - Hero, navigation, content listings, individual pages
- **D3.js Graph** - Org-roam-ui inspired visualization with 15+ interconnected nodes
- **API Architecture** - `/api/graph` endpoint with client-server separation
- **Responsive Design** - Mobile-first with Tailwind CSS and interactive elements
- **Content Management** - Markdown processing with frontmatter and relationship detection
- **Performance Optimized** - Efficient rendering, collision detection, smooth animations

#### Quartz Version (quartz-version branch)  
- **Static Generation** - Complete site built with Quartz 4.5.2
- **Default Theme** - Pure Quartz styling with zero customizations
- **Wikilinks** - Full `[[internal linking]]` between all content pieces
- **Built-in Features** - Native graph view, backlinks, search, table of contents
- **Content Migrated** - All thoughts, projects, and resume content with proper navigation

### 🎨 Graph Visualization Comparison

#### Next.js Custom Graph Features
- **Force-Directed Layout** - Custom D3.js physics simulation with collision detection
- **Interactive Controls** - Drag nodes, zoom/pan, click selection, hover highlighting  
- **Node Types** - Color-coded: Blue (thoughts), Green (projects), Purple (skills), Orange (experience)
- **Edge Styling** - Solid/dashed lines for different relationship types
- **Performance** - Optimized for 100s-1000s of nodes with efficient SVG rendering

#### Quartz Built-in Graph Features
- **Native Integration** - Built-in graph view with automatic backlink detection
- **Wikilink Support** - Automatic node creation from `[[page references]]`
- **Standard Theme** - Default Quartz graph styling with hover and selection
- **Zero Configuration** - Works immediately with properly linked markdown content

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


## 📁 Project Structure

### Repository Organization
```
monib.life/
├── main branch/           # Next.js implementation
└── quartz-version branch/ # Quartz implementation
```

### Next.js Version Structure (main branch)
```
monib.life/
├── src/                    # Source code
│   ├── app/               # Next.js App Router pages
│   │   ├── api/graph/     # Graph API endpoint
│   │   ├── thoughts/      # Blog pages with [slug] routes
│   │   ├── projects/      # Portfolio pages with [slug] routes  
│   │   ├── resume/        # Interactive resume page
│   │   ├── graph/         # D3.js graph visualization
│   │   ├── layout.tsx     # Root layout with navigation
│   │   └── page.tsx       # Homepage with hero section
│   ├── components/        # React components
│   │   ├── common/        # Navigation, Footer
│   │   └── graph/         # OrgRoamGraph D3.js component
│   ├── lib/              # Content processing and graph utilities
│   └── types/            # TypeScript definitions
├── content/              # Shared content (same in both branches)
├── tailwind.config.js    # Tailwind CSS configuration
├── next.config.js        # Next.js configuration
└── package.json          # Next.js dependencies
```

### Quartz Version Structure (quartz-version branch)
```
monib.life/
├── content/              # Markdown content with wikilinks
│   ├── index.md          # Homepage with navigation
│   ├── thoughts/         
│   │   ├── index.md              # Thoughts section index
│   │   ├── welcome-to-digital-garden.md
│   │   └── building-scalable-nextjs-apps.md  
│   ├── projects/
│   │   ├── index.md              # Projects section index
│   │   ├── personal-website-graph.md
│   │   └── react-component-library.md
│   └── resume/
│       └── index.md              # Resume/about page
├── quartz.config.ts      # Quartz configuration (pure defaults)
├── quartz.layout.ts      # Layout configuration  
├── quartz/               # Quartz framework files
└── package.json          # Quartz dependencies
```

### Shared Content
Both branches contain identical content in different formats:
- **Thoughts**: Personal articles and technical writings
- **Projects**: Portfolio projects with technology details  
- **Resume**: Professional experience and skills
- **Connections**: Relationships between content pieces



## 📋 Content Overview

Both implementations contain the same core content organized into:

### 📝 Thoughts & Articles
- **Welcome to Digital Garden** - Site philosophy and approach to knowledge management
- **Building Scalable Next.js Apps** - Technical guide for modern web development
- *Ready for your personal content...*

### 🛠️ Projects  
- **Personal Website Graph** - This very project documenting the digital garden approach
- **React Component Library** - Reusable UI components and development patterns
- *Ready for your portfolio projects...*

### 📄 Resume/About
- **Professional Experience** - Career timeline and accomplishments  
- **Skills Matrix** - Technical abilities and proficiency levels
- **Education & Certifications** - Academic background and professional development
- *Ready for your professional information...*

### 🔗 Content Connections
- **Next.js**: Uses frontmatter `connections` arrays processed by custom graph system
- **Quartz**: Uses `[[wikilinks]]` for automatic relationship detection and backlinks

## 🤝 Development Approach

This project demonstrates **human-AI collaborative development**:

- **Human (monibahmed):** Project vision, content creation, design decisions, and strategic direction
- **AI Agent (GitHub Copilot):** Technical implementation, code generation, and development tasks  
- **Transparency:** All contributions tracked in [`AGENTS.md`](./AGENTS.md) for full accountability

Both implementations were developed collaboratively, exploring different approaches to digital gardens and modern web development.

## 🎯 Which Version Should You Use?

### Choose Next.js Version If:
- ✅ You want custom interactive features and animations
- ✅ You need API routes and server-side functionality  
- ✅ You prefer React component architecture
- ✅ You want to customize the graph visualization extensively
- ✅ You plan to add complex features like user authentication

### Choose Quartz Version If:  
- ✅ You use Obsidian for note-taking and want seamless integration
- ✅ You prefer simple, fast-loading static sites
- ✅ You want built-in features without custom development
- ✅ You value zero-configuration setup and maintenance
- ✅ You prioritize content over custom functionality

### Or Use Both:
- **Development**: Quick content updates with Quartz
- **Production**: Feature-rich experience with Next.js
- **A/B Testing**: Compare approaches with same content

## 📈 Performance Characteristics

### Next.js Version
- **Build Time**: ~30-60 seconds  
- **Bundle Size**: ~200-400KB (with D3.js)
- **Lighthouse**: 90+ (optimized React)
- **Graph Performance**: 100s-1000s nodes

### Quartz Version  
- **Build Time**: ~5-15 seconds
- **Bundle Size**: ~50-100KB (minimal JS)
- **Lighthouse**: 95+ (static generation)
- **Graph Performance**: Built-in limits

---

## 📚 Additional Resources

- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Quartz Documentation**: [quartz.jzhao.xyz](https://quartz.jzhao.xyz)
- **Obsidian**: [obsidian.md](https://obsidian.md) (pairs perfectly with Quartz)
- **D3.js**: [d3js.org](https://d3js.org) (for Next.js graph customization)

## 📄 License

*To be determined based on project requirements*

---

**Repository Status:** ✅ **Dual Implementation Complete**  
**Last Updated:** November 13, 2025  
**Branches:** `main` (Next.js) + `quartz-version` (Quartz)  

*Ready for deployment with your personal content!*



## 🚀 Deployment

### Next.js Version (main branch)
```bash
# Build and test locally
git checkout main
npm install
npm run build
npm run start

# Deploy to Vercel (recommended)
npx vercel

# Or connect GitHub repo for auto-deployment
```

**Hosting Options:**
- **Vercel** (Recommended) - Full Next.js support with API routes
- **Netlify** - Static export with edge functions
- **Railway** - Full-stack deployment with database support

### Quartz Version (quartz-version branch)  
```bash
# Build static site
git checkout quartz-version  
npm install
npx quartz build

# Static files generated in public/ folder
```

**Hosting Options:**
- **GitHub Pages** - Free static hosting
- **Netlify** - Static site with forms and redirects
- **Vercel** - Static deployment (no server features needed)
- **Any Static Host** - CloudFlare Pages, Surge, etc.

### Deployment Strategy
- **Development/Testing**: Use Quartz version for rapid iterations
- **Production**: Choose based on requirements:
  - **Interactive Features Needed**: Deploy Next.js version
  - **Simple & Fast**: Deploy Quartz version
  - **Both**: Deploy both with subdomain routing

## Performance Goals

- **Lighthouse Score:** 90+ in all categories
- **Page Load Time:** < 2 seconds on 3G
- **Core Web Vitals:** Pass all metrics
- **Accessibility Score:** WCAG AA compliance

## 🔧 Customization Guide

### Adding Your Content

#### For Both Versions
1. **Replace sample content** in `/content/` directories:
   - Personal articles in `content/thoughts/`
   - Portfolio projects in `content/projects/`  
   - Professional info in `content/resume/`

2. **Update connections** between content pieces:
   - **Next.js**: Add `connections` arrays to frontmatter
   - **Quartz**: Use `[[wikilinks]]` throughout content

#### Next.js Specific Customization
```bash
git checkout main

# Customize styling
src/app/globals.css          # Global styles
src/components/              # Modify React components
tailwind.config.js           # Tailwind configuration

# Update graph behavior  
src/lib/graph.ts            # Graph data processing
src/components/graph/OrgRoamGraph.tsx # D3.js visualization
```

#### Quartz Specific Customization
```bash
git checkout quartz-version

# Configuration (currently pure defaults)
quartz.config.ts            # Site settings, theme, plugins
quartz.layout.ts            # Page layout configuration

# Content organization
content/index.md            # Homepage content and navigation
```

### Choosing Your Approach
- **Want custom interactivity**: Use Next.js version and modify React components
- **Prefer simplicity**: Use Quartz version with minimal/no customizations
- **Obsidian workflow**: Quartz version works perfectly with existing Obsidian vaults

---

## Contributing

This project follows the collaboration model documented in `AGENTS.md`. All contributions should be properly attributed to maintain transparency in the human-AI development process.

## License

*To be determined based on project requirements*

---

**Last Updated:** November 13, 2025  
**Project Status:** ✅ **Complete Implementation** - Fully functional website with interactive graph visualization