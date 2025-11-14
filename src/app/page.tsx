import Link from 'next/link'
import { ArrowRightIcon, NetworkIcon, PenToolIcon, FolderOpenIcon } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="text-gradient">
              monib.life
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A digital space where thoughts, projects, and experiences connect. 
            Explore the relationships between ideas through an interactive knowledge graph.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/graph" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <NetworkIcon className="w-5 h-5 mr-2" />
              Explore the Graph
            </Link>
            <Link 
              href="/thoughts" 
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Reading
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Three Interconnected Spaces
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Thoughts Card */}
            <div className="content-card">
              <div className="flex items-center mb-4">
                <PenToolIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Thoughts & Articles</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Personal writings, technical insights, and reflections. Each thought connects 
                to projects, experiences, and other ideas in the knowledge graph.
              </p>
              <Link 
                href="/thoughts" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Read thoughts
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Projects Card */}
            <div className="content-card">
              <div className="flex items-center mb-4">
                <FolderOpenIcon className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Projects</h3>
              </div>
              <p className="text-gray-600 mb-4">
                A portfolio of development work, experiments, and creative projects. 
                Explore the technologies and ideas that shaped each project.
              </p>
              <Link 
                href="/projects" 
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
              >
                View projects
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Resume Card */}
            <div className="content-card">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900">Professional Experience</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Interactive timeline of career highlights, skills, and achievements. 
                See how experiences connect to projects and learning.
              </p>
              <Link 
                href="/resume" 
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
              >
                View resume
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Graph Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <NetworkIcon className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            The Knowledge Graph
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Everything is connected. The interactive graph reveals relationships between 
            thoughts, projects, skills, and experiences. Discover unexpected connections 
            and explore content in a completely new way.
          </p>
          <Link 
            href="/graph" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
          >
            <NetworkIcon className="w-6 h-6 mr-2" />
            Enter the Graph
          </Link>
        </div>
      </section>
    </div>
  )
}