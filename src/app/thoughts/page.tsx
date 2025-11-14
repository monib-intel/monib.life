import { getAllThoughts } from '@/lib/content'
import Link from 'next/link'
import { formatDate } from '@/utils'
import { PenToolIcon, ClockIcon, TagIcon } from 'lucide-react'

export const metadata = {
  title: 'Thoughts & Articles',
  description: 'Personal writings, technical insights, and reflections on technology, development, and life.',
}

export default async function ThoughtsPage() {
  const thoughts = getAllThoughts()
  const featuredThoughts = thoughts.filter(t => t.frontmatter.featured)
  const regularThoughts = thoughts.filter(t => !t.frontmatter.featured)

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <PenToolIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Thoughts & Articles</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Personal writings, technical insights, and reflections on technology, development, and life.
            Each piece connects to projects, experiences, and other ideas in the knowledge graph.
          </p>
        </div>

        {/* Featured Thoughts */}
        {featuredThoughts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredThoughts.map((thought) => (
                <article key={thought.slug} className="content-card">
                  <Link href={`/thoughts/${thought.slug}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {thought.frontmatter.title}
                    </h3>
                  </Link>
                  
                  {thought.frontmatter.description && (
                    <p className="text-gray-600 mb-4">
                      {thought.frontmatter.description}
                    </p>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {formatDate(thought.frontmatter.date)}
                    </div>
                    
                    {thought.frontmatter.readingTime && (
                      <div className="flex items-center">
                        <span>{thought.frontmatter.readingTime} min read</span>
                      </div>
                    )}
                  </div>
                  
                  {thought.frontmatter.tags && thought.frontmatter.tags.length > 0 && (
                    <div className="flex items-center mt-3 flex-wrap gap-2">
                      <TagIcon className="w-4 h-4 text-gray-400" />
                      {thought.frontmatter.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* All Thoughts */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {featuredThoughts.length > 0 ? 'All Thoughts' : 'Latest Thoughts'}
          </h2>
          
          <div className="space-y-6">
            {regularThoughts.map((thought) => (
              <article key={thought.slug} className="content-card">
                <Link href={`/thoughts/${thought.slug}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                    {thought.frontmatter.title}
                  </h3>
                </Link>
                
                {thought.frontmatter.description && (
                  <p className="text-gray-600 mb-4">
                    {thought.frontmatter.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {formatDate(thought.frontmatter.date)}
                    </div>
                    
                    {thought.frontmatter.readingTime && (
                      <span>{thought.frontmatter.readingTime} min read</span>
                    )}
                  </div>
                  
                  {thought.frontmatter.tags && thought.frontmatter.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      {thought.frontmatter.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {thought.frontmatter.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{thought.frontmatter.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {thoughts.length === 0 && (
          <div className="text-center py-12">
            <PenToolIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No thoughts yet</h3>
            <p className="text-gray-600">
              Check back soon for new articles and insights!
            </p>
          </div>
        )}

        {/* Graph Connection Note */}
        {thoughts.length > 0 && (
          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-blue-900">Explore Connections</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Each thought connects to related projects, skills, and experiences. 
                  Visit the <Link href="/graph" className="underline hover:text-blue-800">
                    interactive graph
                  </Link> to explore these relationships visually.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}