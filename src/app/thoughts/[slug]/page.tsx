import { getThoughtBySlug, getThoughtSlugs, markdownToHtml } from '@/lib/content'
import { generateGraphData } from '@/lib/graph'
import { formatDate, calculateReadingTime } from '@/utils'
import Link from 'next/link'
import { ArrowLeftIcon, ClockIcon, TagIcon, NetworkIcon, CalendarIcon } from 'lucide-react'
import { notFound } from 'next/navigation'

type Props = {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = getThoughtSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const thought = getThoughtBySlug(params.slug)
  
  if (!thought) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: thought.frontmatter.title,
    description: thought.frontmatter.description,
    keywords: thought.frontmatter.tags?.join(', '),
    openGraph: {
      title: thought.frontmatter.title,
      description: thought.frontmatter.description,
      type: 'article',
      publishedTime: thought.frontmatter.date,
      tags: thought.frontmatter.tags,
    },
  }
}

export default async function ThoughtPage({ params }: Props) {
  const thought = getThoughtBySlug(params.slug)
  
  if (!thought) {
    notFound()
  }

  const content = await markdownToHtml(thought.content)
  const readingTime = calculateReadingTime(thought.content)
  
  // Get related content based on connections
  const { nodes, edges } = generateGraphData()
  const currentNodeId = `thought-${thought.slug}`
  const relatedNodes = edges
    .filter(edge => edge.source === currentNodeId || edge.target === currentNodeId)
    .map(edge => edge.source === currentNodeId ? edge.target : edge.source)
    .slice(0, 3) // Limit to 3 related items

  const relatedContent = nodes.filter(node => relatedNodes.includes(node.id))

  return (
    <div className="min-h-screen py-8">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            href="/thoughts" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Thoughts
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {thought.frontmatter.title}
          </h1>
          
          {thought.frontmatter.description && (
            <p className="text-xl text-gray-600 mb-6">
              {thought.frontmatter.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {formatDate(thought.frontmatter.date)}
            </div>
            
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {readingTime} min read
            </div>

            {thought.frontmatter.featured && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                Featured
              </span>
            )}
          </div>

          {thought.frontmatter.tags && thought.frontmatter.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mb-8">
              <TagIcon className="w-4 h-4 text-gray-400" />
              {thought.frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <div 
          className="markdown-content prose prose-lg prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Related Content */}
        {relatedContent.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
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
                      <p className="text-sm text-gray-600">
                        {node.data.description}
                      </p>
                      <span className="inline-block mt-2 text-xs text-gray-500 capitalize">
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
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <NetworkIcon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900 mb-2">
                Explore the Knowledge Graph
              </h3>
              <p className="text-gray-700 mb-4">
                See how this article connects to other thoughts, projects, and experiences 
                in the interactive knowledge graph.
              </p>
              <Link 
                href={`/graph?highlight=${currentNodeId}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <NetworkIcon className="w-4 h-4 mr-2" />
                View in Graph
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link 
              href="/thoughts" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              All Thoughts
            </Link>
            
            <Link 
              href="/graph" 
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <NetworkIcon className="w-4 h-4 mr-2" />
              Explore Graph
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}