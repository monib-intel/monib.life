# Human vs Agent Contributions Tracking

This document tracks contributions made to the monib.life website project, distinguishing between human users and AI agents to maintain transparency and accountability in development.

## Contributors

### Human Contributors
- **monibahmed** - Project owner and primary stakeholder

### AI Agents
- **GitHub Copilot** (Claude Sonnet 4) - AI programming assistant

## Project Overview

**monib.life** is a personal website project for Monib Ahmed. This document maintains a clear record of who contributed what to ensure proper attribution and accountability in a human-AI collaborative development environment.

## Change Log

### 2025-11-13

#### Initial Project Setup
**Agent Contributions:**
- Created project documentation structure (AGENTS.md, README.md)
- Established contribution tracking framework
- Set up collaborative development guidelines

**Human Contributions:**
- Initiated website project
- Requested documentation setup
- Provided project requirements and direction

#### Website Architecture Definition
**Agent Contributions:**
- Restructured README.md to reflect three-component architecture
- Detailed feature planning for thoughts/articles, projects, and resume sections
- Created comprehensive project structure documentation
- Defined component-specific features and technical requirements
- Organized content strategy by website component

**Human Contributions:**
- Defined core website structure: thoughts/articles, projects, resume
- Provided clear direction for website's main components
- Specified the three-part focus for the personal website

#### Technical Stack Selection & Advanced Features
**Agent Contributions:**
- Recommended Next.js 14 + TypeScript as primary framework
- Proposed React Flow + D3.js for interactive node graph visualization
- Designed Obsidian-compatible content management workflow
- Analyzed hosting options and recommended Vercel for deployment
- Created mobile editing workflow with Obsidian Mobile + Git sync
- Defined graph data structure for connecting content across components
- Planned auto-deployment pipeline from mobile edits to live site

**Human Contributions:**
- Requested Obsidian-like node graph functionality for content connections
- Specified need for mobile editing capabilities from iPhone
- Chose Obsidian Mobile as preferred editing solution
- Requested hosting analysis and deployment strategy

## Technical Decisions Summary

### Final Technology Stack (Pending Implementation)

#### Frontend Framework
- **Next.js 14** with TypeScript and App Router
- **React 18** for component architecture
- **Tailwind CSS** for styling and responsive design
- **Headless UI** for accessible component primitives

#### Graph Visualization
- **React Flow** for interactive node manipulation
- **D3.js** for advanced physics simulations and layouts
- Custom node types: thoughts, projects, skills, experiences, topics
- Connection types: related, uses, inspired_by, part_of

#### Content Management
- **Obsidian Mobile** as primary mobile editor
- **Git sync** for automatic repository updates
- **Markdown + Frontmatter** for structured content
- **Auto-linking** between related content pieces

#### Deployment & Hosting
- **Vercel** for hosting and auto-deployment
- **GitHub** for version control and CI/CD
- **Custom domain** setup for monib.life
- **Mobile-to-production** workflow via Git commits

#### Mobile Workflow
- **Obsidian Mobile** app for iPhone editing
- **Git plugin** for automatic sync to GitHub
- **Auto-deployment** triggered by repository updates
- **Draft/publish** workflow with content templates

### Site Architecture (Approved)

#### Core Components
1. **📝 Thoughts & Articles** - Blog posts with graph connections
2. **🛠️ Projects** - Portfolio with technology relationship mapping
3. **📄 Resume** - Interactive timeline with skill connections
4. **🕸️ Graph View** - Full interactive knowledge map exploration

#### Content Structure
```
content/
├── thoughts/           # Markdown articles with frontmatter
├── projects/          # Project data with tech stack connections
├── resume/           # Structured career and skills data
└── graph/            # Connection metadata and relationships
```

#### Key Features
- Interactive node graph showing content relationships
- Mobile editing with automatic deployment
- Search integration with graph highlighting
- Timeline views and content clustering
- Cross-component connection discovery

### Implementation Status
- **Planning Phase**: Complete ✅
- **Technical Decisions**: Finalized ✅
- **Architecture Design**: Approved ✅
- **Implementation**: Pending human review and approval

## Attribution Guidelines

### What Counts as Agent Contribution
- Code generation and implementation
- File structure creation
- Documentation writing
- Technical solution development
- Automated processes and tooling
- Design implementation from specifications

### What Counts as Human Contribution
- Project vision and requirements
- Design decisions and creative direction
- Content creation and copywriting
- User experience decisions
- Business logic and strategy
- Review and approval of agent work
- Manual configurations and deployments

## Change Tracking Format

For future changes, please use this format:

```markdown
### YYYY-MM-DD

#### [Description of Change Set]
**Agent Contributions:**
- Specific technical implementation 1
- Code generation task 2
- Documentation update 3

**Human Contributions:**
- Strategic decision 1
- Content creation 2
- Design approval 3
```

## Collaboration Workflow

1. **Human** provides project requirements, design direction, and content
2. **Agent** implements technical solutions and generates code
3. **Human** reviews, tests, and approves implementations
4. **Agent** documents technical decisions and implementations
5. Changes are committed with clear attribution
6. This document is updated to reflect all contributions

## Development Environment

### System Setup for AI Agents
Agents working on this project should be aware of the development environment:

**Operating System:** 
- WSL2 (Windows Subsystem for Linux) running Debian-based distribution
- Primary shell: Zsh with Starship prompt
- Configuration managed via ~/wsl-config repository

**Package Management:**
- **System packages:** APT (Debian package manager) 
- **Development packages:** Nix package manager for reproducible environments
- **Node.js packages:** npm/yarn for JavaScript dependencies
- **Proxy configuration:** Intel corporate network proxy (http://proxy-us.intel.com:912)

**Development Tools Available:**
- Git with proxy configuration
- Node.js and npm (installable via Nix)
- VS Code as primary editor
- Zsh with comprehensive aliases (~/wsl-config/aliases)
- Starship prompt for enhanced shell experience

**Key Considerations for Agents:**
- All network requests must use proxy configuration
- Nix can be used for installing development dependencies
- Shell commands should use Zsh syntax and available aliases
- File paths use Unix-style notation (WSL translates Windows paths)

### Installation Commands Reference
```bash
# Install Node.js via Nix
nix-env -iA nixpkgs.nodejs

# Install packages with npm (proxy-aware)
npm install <package>

# Quick navigation (available aliases)
proj        # Navigate to ~/projects
config      # Navigate to ~/wsl-config
md <dir>    # Create directory with parents (mkdir -p)
ll          # Detailed file listing (ls -la)
```

## Guidelines for Future Development

### Agent Responsibilities
- Implement technical features and functionality
- Generate and maintain code
- Create technical documentation
- Suggest improvements and optimizations
- Handle build processes and tooling
- Ensure code quality and best practices
- **Use Nix for reproducible dependency management**
- **Respect proxy configurations in all network operations**

### Human Responsibilities
- Define project vision and requirements
- Create content and copy
- Make design and UX decisions
- Provide feedback and direction
- Handle deployment and hosting decisions
- Ensure brand consistency and messaging

---

**Document Purpose:** This tracking system ensures transparency in human-AI collaborative web development and maintains clear accountability for all project contributions.

**Last Updated:** November 13, 2025