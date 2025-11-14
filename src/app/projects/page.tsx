import { getAllProjects } from '@/lib/content'
import Link from 'next/link'
import { formatDate } from '@/utils'
import { FolderOpenIcon, ExternalLinkIcon, GithubIcon, ClockIcon, TagIcon } from 'lucide-react'

export const metadata = {
  title: 'Projects Portfolio',
  description: 'A showcase of development work, experiments, and creative projects with technology breakdowns.',
}

export default async function ProjectsPage() {
  const projects = getAllProjects()
  const featuredProjects = projects.filter(p => p.frontmatter.featured)
  const regularProjects = projects.filter(p => !p.frontmatter.featured)

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FolderOpenIcon className="w-8 h-8 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Projects Portfolio</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A showcase of development work, experiments, and creative projects. 
            Each project connects to technologies, skills, and learning experiences in the knowledge graph.
          </p>
        </div>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured Projects</h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredProjects.map((project) => (
                <article key={project.slug} className="content-card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Link href={`/projects/${project.slug}`}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                          {project.frontmatter.title}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          project.frontmatter.status === 'completed' ? 'bg-green-100 text-green-700' :
                          project.frontmatter.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          project.frontmatter.status === 'planned' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.frontmatter.status.replace('-', ' ')}
                        </span>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {formatDate(project.frontmatter.date)}
                        </div>
                      </div>
                    </div>

                    {/* Project Links */}
                    <div className="flex items-center space-x-2">
                      {project.frontmatter.links?.live && (
                        <a
                          href={project.frontmatter.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                          title="Live Demo"
                        >
                          <ExternalLinkIcon className="w-5 h-5" />
                        </a>
                      )}
                      
                      {project.frontmatter.links?.github && (
                        <a
                          href={project.frontmatter.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                          title="Source Code"
                        >
                          <GithubIcon className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {project.frontmatter.description}
                  </p>
                  
                  {/* Technologies */}
                  <div className="flex items-center flex-wrap gap-2 mb-4">
                    <TagIcon className="w-4 h-4 text-gray-400" />
                    {project.frontmatter.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                  >
                    Learn More →
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* All Projects Grid */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {featuredProjects.length > 0 ? 'All Projects' : 'Latest Projects'}
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularProjects.map((project) => (
              <article key={project.slug} className="content-card">
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    project.frontmatter.status === 'completed' ? 'bg-green-100 text-green-700' :
                    project.frontmatter.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    project.frontmatter.status === 'planned' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.frontmatter.status.replace('-', ' ')}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    {project.frontmatter.links?.live && (
                      <a
                        href={project.frontmatter.links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                      </a>
                    )}
                    
                    {project.frontmatter.links?.github && (
                      <a
                        href={project.frontmatter.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                
                <Link href={`/projects/${project.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                    {project.frontmatter.title}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mb-4">
                  {project.frontmatter.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {formatDate(project.frontmatter.date)}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {project.frontmatter.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.frontmatter.technologies.length > 3 && (
                      <span className="text-gray-500 text-xs px-1">
                        +{project.frontmatter.technologies.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600">
              Check back soon for new projects and portfolio pieces!
            </p>
          </div>
        )}

        {/* Graph Connection Note */}
        {projects.length > 0 && (
          <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-green-900">Technology Connections</h3>
                <p className="text-sm text-green-700 mt-1">
                  Each project connects to the technologies used, related thoughts, and skills developed. 
                  Visit the <Link href="/graph" className="underline hover:text-green-800">
                    interactive graph
                  </Link> to explore these technology relationships.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}