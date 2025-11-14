import { getProjectBySlug, getProjectSlugs, markdownToHtml } from '@/lib/content'
import { generateGraphData } from '@/lib/graph'
import { formatDate } from '@/utils'
import Link from 'next/link'
import { ArrowLeftIcon, ExternalLinkIcon, GithubIcon, NetworkIcon, CalendarIcon, TagIcon } from 'lucide-react'
import { notFound } from 'next/navigation'

type Props = {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = getProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const project = getProjectBySlug(params.slug)
  
  if (!project) {
    return {
      title: 'Project Not Found',
    }
  }

  return {
    title: project.frontmatter.title,
    description: project.frontmatter.description,
    keywords: project.frontmatter.technologies?.join(', '),
    openGraph: {
      title: project.frontmatter.title,
      description: project.frontmatter.description,
      type: 'website',
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const project = getProjectBySlug(params.slug)
  
  if (!project) {
    notFound()
  }

  const content = await markdownToHtml(project.content)
  
  // Get related content based on connections
  const { nodes, edges } = generateGraphData()
  const currentNodeId = `project-${project.slug}`
  const relatedNodes = edges
    .filter(edge => edge.source === currentNodeId || edge.target === currentNodeId)
    .map(edge => edge.source === currentNodeId ? edge.target : edge.source)
    .slice(0, 4)

  const relatedContent = nodes.filter(node => relatedNodes.includes(node.id))

  return (
    <div className="min-h-screen py-8">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            href="/projects" 
            className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>

        {/* Project Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {project.frontmatter.title}
              </h1>
              
              <div className="flex items-center space-x-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  project.frontmatter.status === 'completed' ? 'bg-green-100 text-green-700' :
                  project.frontmatter.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                  project.frontmatter.status === 'planned' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {project.frontmatter.status.replace('-', ' ')}
                </span>

                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {formatDate(project.frontmatter.date)}
                </div>

                {project.frontmatter.featured && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Project Links */}
            <div className="flex items-center space-x-2">
              {project.frontmatter.links?.live && (
                <a
                  href={project.frontmatter.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ExternalLinkIcon className="w-4 h-4 mr-2" />
                  Live Demo
                </a>
              )}
              
              {project.frontmatter.links?.github && (
                <a
                  href={project.frontmatter.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <GithubIcon className="w-4 h-4 mr-2" />
                  Source Code
                </a>
              )}

              {project.frontmatter.links?.demo && (
                <a
                  href={project.frontmatter.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Demo
                </a>
              )}
            </div>
          </div>

          <p className="text-xl text-gray-600 mb-6">
            {project.frontmatter.description}
          </p>

          {/* Technologies */}
          <div className="flex items-center flex-wrap gap-2 mb-8">
            <TagIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 mr-2">Technologies:</span>
            {project.frontmatter.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </header>

        {/* Project Images */}
        {project.frontmatter.images && project.frontmatter.images.length > 0 && (
          <section className="mb-8">
            <div className="grid gap-4 md:grid-cols-2">
              {project.frontmatter.images.map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={image}
                    alt={`${project.frontmatter.title} screenshot ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Project Content */}
        <div 
          className="markdown-content prose prose-lg prose-gray max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Related Content */}
        {relatedContent.length > 0 && (
          <section className="mb-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Related Content
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatedContent.map((node) => (
                <Link
                  key={node.id}
                  href={node.data.url || '#'}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                      node.type === 'thought' ? 'bg-blue-500' :
                      node.type === 'project' ? 'bg-green-500' :
                      node.type === 'skill' ? 'bg-purple-500' : 'bg-orange-500'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {node.data.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {node.data.description}
                      </p>
                      <span className="inline-block text-xs text-gray-500 capitalize">
                        {node.type}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Graph Connection CTA */}
        <div className="mb-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <NetworkIcon className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900 mb-2">
                Explore Technology Connections
              </h3>
              <p className="text-gray-700 mb-4">
                See how this project connects to other work, the technologies used, 
                and skills developed in the interactive knowledge graph.
              </p>
              <Link 
                href={`/graph?highlight=${currentNodeId}`}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <NetworkIcon className="w-4 h-4 mr-2" />
                View in Graph
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link 
              href="/projects" 
              className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              All Projects
            </Link>
            
            <div className="flex items-center space-x-4">
              {project.frontmatter.links?.live && (
                <a
                  href={project.frontmatter.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ExternalLinkIcon className="w-4 h-4 mr-2" />
                  Try Live Demo
                </a>
              )}
              
              <Link 
                href="/graph" 
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <NetworkIcon className="w-4 h-4 mr-2" />
                Explore Graph
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}