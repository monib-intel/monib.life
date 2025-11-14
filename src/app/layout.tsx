import './globals.css'
import { Inter } from 'next/font/google'
import { Navigation } from '@/components/common/Navigation'
import { Footer } from '@/components/common/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'Monib Ahmed - Developer & Thinker',
    template: '%s | Monib Ahmed'
  },
  description: 'Personal website featuring thoughts, projects, and professional experience with interactive connections.',
  keywords: ['developer', 'software engineer', 'portfolio', 'blog', 'resume', 'thoughts', 'projects'],
  authors: [{ name: 'Monib Ahmed' }],
  creator: 'Monib Ahmed',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://monib.life',
    title: 'Monib Ahmed - Developer & Thinker',
    description: 'Personal website featuring thoughts, projects, and professional experience.',
    siteName: 'monib.life',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monib Ahmed - Developer & Thinker',
    description: 'Personal website featuring thoughts, projects, and professional experience.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}