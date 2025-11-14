# monib.life

Personal website for Monib Ahmed - A clean, modern digital presence featuring thoughts, projects, and professional experience.

## Project Overview

**monib.life** is Monib Ahmed's personal website built around three core components:

1. **📝 Thoughts & Articles** - Personal writings, insights, and technical articles
2. **🛠️ Projects** - Portfolio of development work and creative projects
3. **📄 Resume** - Professional experience and career highlights

The site serves as both a professional portfolio and a platform for sharing ideas and work with the community.

## Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn package manager  
- Git for version control
- Modern web browser for testing

### Development Environment
This project is developed in a **WSL2 (Debian) + Nix** environment:

**System Setup:**
- WSL2 with Debian-based distribution
- Zsh shell with Starship prompt
- Nix package manager for reproducible environments
- Intel corporate proxy configuration
- Configuration managed via ~/wsl-config repository

**Package Management Options:**
```bash
# Option 1: Install Node.js via Nix (recommended for reproducibility)
nix-env -iA nixpkgs.nodejs
nix-shell -p nodejs npm  # Temporary shell with Node.js

# Option 2: Use system Node.js (if already installed)
node --version
npm --version

# Option 3: Use Nix shell for project development
nix-shell -p nodejs npm yarn
```

**Proxy Considerations:**
All network requests automatically use proxy configuration:
- HTTP/HTTPS proxy: http://proxy-us.intel.com:912
- Git operations proxy-aware
- npm/yarn operations proxy-aware

### Getting Started

```bash
# Navigate to projects directory (using configured alias)
proj

# Clone the repository (if using git)
git clone <repository-url>
cd monib.life

# Set up development environment with Nix (recommended)
nix-shell -p nodejs npm yarn

# OR install Node.js globally via Nix
nix-env -iA nixpkgs.nodejs

# Install dependencies (when package.json is created)
npm install

# Start development server (framework dependent)
npm run dev
```

**Available Shell Aliases:**
```bash
proj        # cd ~/projects
config      # cd ~/wsl-config  
md <dir>    # mkdir -p <dir>
ll          # ls -la
gs          # git status
ga          # git add
gc          # git commit
```

## Tech Stack

*To be determined based on project requirements*

**Potential Technologies:**
- **Frontend Framework:** React, Next.js, Vue.js, or vanilla HTML/CSS/JS
- **Styling:** CSS, SCSS, Tailwind CSS, or styled-components
- **Build Tools:** Vite, Webpack, or framework-specific tooling
- **Hosting:** Vercel, Netlify, GitHub Pages, or custom hosting
- **CMS:** Headless CMS (Strapi, Contentful) or static content

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

## Features (Planned)

### Core Pages
- **Home** - Welcome page with navigation to three main sections
- **Thoughts** - Blog/articles listing and individual post pages
- **Projects** - Portfolio gallery with detailed project pages
- **Resume** - Interactive CV with download functionality
- **About** - Personal background and contact information

### Component-Specific Features

#### Thoughts & Articles
- **Markdown Support** - Rich text formatting for articles
- **Code Highlighting** - Syntax highlighting for technical content
- **Categories & Tags** - Content organization and filtering
- **Search** - Find articles by keywords
- **Reading Time** - Estimated reading duration
- **Social Sharing** - Share articles on social platforms

#### Projects Portfolio
- **Project Gallery** - Grid/list view of projects
- **Live Demos** - Links to working applications
- **Source Code** - GitHub repository links
- **Tech Stack Display** - Technologies used in each project
- **Project Details** - Comprehensive project descriptions
- **Image Galleries** - Screenshots and project visuals

#### Resume Section
- **Interactive Timeline** - Visual career progression
- **Skills Matrix** - Technical and soft skills display
- **PDF Download** - Professional resume download
- **Print Friendly** - Optimized for printing
- **Contact Integration** - Direct contact options
- **Recommendations** - Professional endorsements

### Technical Features
- **Responsive Design** - Mobile-first, works on all devices
- **Fast Loading** - Optimized performance and loading times
- **SEO Optimized** - Search engine friendly structure
- **Accessibility** - WCAG compliant design
- **Dark/Light Mode** - User preference support

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

## Deployment

### Hosting Options
- **Static Hosting:** GitHub Pages, Netlify, Vercel
- **CDN Integration:** CloudFlare for performance
- **Domain:** monib.life (custom domain setup)
- **SSL:** HTTPS enabled for security

### Environment Setup
```bash
# Development
npm run dev

# Build for production
npm run build

# Deploy (method dependent on hosting choice)
npm run deploy
```

## Performance Goals

- **Lighthouse Score:** 90+ in all categories
- **Page Load Time:** < 2 seconds on 3G
- **Core Web Vitals:** Pass all metrics
- **Accessibility Score:** WCAG AA compliance

## Maintenance

### Regular Tasks
- Content updates and new blog posts
- Dependency updates and security patches
- Performance monitoring and optimization
- SEO updates and improvements

### Monitoring
- Analytics setup (Google Analytics or privacy-focused alternative)
- Performance monitoring
- Uptime monitoring
- User feedback collection

---

## Contributing

This project follows the collaboration model documented in `AGENTS.md`. All contributions should be properly attributed to maintain transparency in the human-AI development process.

## License

*To be determined based on project requirements*

---

**Last Updated:** November 13, 2025
**Project Status:** Initial setup and planning phase