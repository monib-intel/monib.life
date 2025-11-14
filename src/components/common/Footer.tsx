import { HeartIcon } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-gray-600 mb-4 md:mb-0">
            <span>Built with</span>
            <HeartIcon className="w-4 h-4 text-red-500" />
            <span>by Monib Ahmed</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>© 2025 Monib Ahmed</span>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/resume.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-700 transition-colors"
              >
                Resume (PDF)
              </a>
              <a 
                href="mailto:contact@monib.life"
                className="hover:text-gray-700 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>
            This site uses an interactive graph to connect thoughts, projects, and experiences.
            Navigate through the connections to discover relationships between content.
          </p>
        </div>
      </div>
    </footer>
  )
}