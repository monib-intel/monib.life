import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import { ThoughtFrontmatter, ProjectFrontmatter, ThoughtWithContent, ProjectWithContent } from '@/types'

const contentDirectory = path.join(process.cwd(), 'content')
const thoughtsDirectory = path.join(contentDirectory, 'thoughts')
const projectsDirectory = path.join(contentDirectory, 'projects')

// Markdown processing
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml)
    .process(markdown)
  return result.toString()
}

// Thoughts/Articles
export function getThoughtSlugs(): string[] {
  if (!fs.existsSync(thoughtsDirectory)) {
    return []
  }
  return fs.readdirSync(thoughtsDirectory)
    .filter(name => name.endsWith('.md'))
    .map(name => name.replace(/\.md$/, ''))
}

export function getThoughtBySlug(slug: string): ThoughtWithContent | null {
  const fullPath = path.join(thoughtsDirectory, `${slug}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug,
    frontmatter: data as ThoughtFrontmatter,
    content,
  }
}

export function getAllThoughts(): ThoughtWithContent[] {
  const slugs = getThoughtSlugs()
  return slugs
    .map(slug => getThoughtBySlug(slug))
    .filter((thought): thought is ThoughtWithContent => thought !== null)
    .filter(thought => thought.frontmatter.published !== false)
    .sort((a, b) => {
      return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    })
}

export function getFeaturedThoughts(): ThoughtWithContent[] {
  return getAllThoughts().filter(thought => thought.frontmatter.featured)
}

// Projects
export function getProjectSlugs(): string[] {
  if (!fs.existsSync(projectsDirectory)) {
    return []
  }
  return fs.readdirSync(projectsDirectory)
    .filter(name => name.endsWith('.md'))
    .map(name => name.replace(/\.md$/, ''))
}

export function getProjectBySlug(slug: string): ProjectWithContent | null {
  const fullPath = path.join(projectsDirectory, `${slug}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug,
    frontmatter: data as ProjectFrontmatter,
    content,
  }
}

export function getAllProjects(): ProjectWithContent[] {
  const slugs = getProjectSlugs()
  return slugs
    .map(slug => getProjectBySlug(slug))
    .filter((project): project is ProjectWithContent => project !== null)
    .sort((a, b) => {
      return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    })
}

export function getFeaturedProjects(): ProjectWithContent[] {
  return getAllProjects().filter(project => project.frontmatter.featured)
}

// Resume Data
export function getResumeData() {
  const resumePath = path.join(contentDirectory, 'resume', 'resume-data.json')
  
  if (!fs.existsSync(resumePath)) {
    return null
  }

  const fileContents = fs.readFileSync(resumePath, 'utf8')
  return JSON.parse(fileContents)
}

// Search functionality
export function searchContent(query: string) {
  const thoughts = getAllThoughts()
  const projects = getAllProjects()
  const results = []

  const queryLower = query.toLowerCase()

  // Search thoughts
  for (const thought of thoughts) {
    const title = thought.frontmatter.title.toLowerCase()
    const description = (thought.frontmatter.description || '').toLowerCase()
    const content = thought.content.toLowerCase()
    const tags = (thought.frontmatter.tags || []).join(' ').toLowerCase()

    if (title.includes(queryLower) || 
        description.includes(queryLower) || 
        content.includes(queryLower) || 
        tags.includes(queryLower)) {
      
      let relevance = 0
      if (title.includes(queryLower)) relevance += 3
      if (description.includes(queryLower)) relevance += 2
      if (tags.includes(queryLower)) relevance += 2
      if (content.includes(queryLower)) relevance += 1

      results.push({
        type: 'thought',
        id: thought.slug,
        title: thought.frontmatter.title,
        description: thought.frontmatter.description || '',
        url: `/thoughts/${thought.slug}`,
        tags: thought.frontmatter.tags || [],
        date: thought.frontmatter.date,
        relevance
      })
    }
  }

  // Search projects
  for (const project of projects) {
    const title = project.frontmatter.title.toLowerCase()
    const description = project.frontmatter.description.toLowerCase()
    const content = project.content.toLowerCase()
    const technologies = project.frontmatter.technologies.join(' ').toLowerCase()

    if (title.includes(queryLower) || 
        description.includes(queryLower) || 
        content.includes(queryLower) || 
        technologies.includes(queryLower)) {
      
      let relevance = 0
      if (title.includes(queryLower)) relevance += 3
      if (description.includes(queryLower)) relevance += 2
      if (technologies.includes(queryLower)) relevance += 2
      if (content.includes(queryLower)) relevance += 1

      results.push({
        type: 'project',
        id: project.slug,
        title: project.frontmatter.title,
        description: project.frontmatter.description,
        url: `/projects/${project.slug}`,
        tags: project.frontmatter.technologies,
        date: project.frontmatter.date,
        relevance
      })
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance)
}

// Utility functions
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export function getUniqueValues<T>(items: T[], key: keyof T): string[] {
  const values = items.flatMap(item => {
    const value = item[key]
    if (Array.isArray(value)) {
      return value
    }
    return []
  })
  return Array.from(new Set(values))
}

export function getAllTags(): string[] {
  const thoughts = getAllThoughts()
  const projects = getAllProjects()
  
  const thoughtTags = getUniqueValues(thoughts, 'frontmatter').flatMap(fm => 
    (fm as any).tags || []
  )
  const projectTags = getUniqueValues(projects, 'frontmatter').flatMap(fm => 
    (fm as any).technologies || []
  )
  
  return Array.from(new Set([...thoughtTags, ...projectTags]))
}