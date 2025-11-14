import { getResumeData } from '@/lib/content'
import Link from 'next/link'
import { formatDate, formatDateShort } from '@/utils'
import { 
  UserIcon, 
  DownloadIcon, 
  ExternalLinkIcon, 
  BriefcaseIcon,
  GraduationCapIcon,
  AwardIcon,
  NetworkIcon,
  CalendarIcon,
  StarIcon,
  MailIcon,
  GlobeIcon
} from 'lucide-react'

export const metadata = {
  title: 'Resume - Professional Experience',
  description: 'Interactive resume showcasing professional experience, skills, education, and career highlights with connection mapping.',
}

export default async function ResumePage() {
  const resumeData = getResumeData()

  if (!resumeData) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume data not available</h3>
            <p className="text-gray-600">
              Resume information is currently being updated.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <UserIcon className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Professional Experience</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Interactive resume showcasing career highlights, skills, and achievements 
            with connections to projects and learning experiences.
          </p>
          
          {/* Download Resume */}
          <div className="flex items-center justify-center space-x-4">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download PDF
            </a>
            
            <div className="flex items-center space-x-4 text-gray-600">
              {resumeData.personal.email && (
                <a 
                  href={`mailto:${resumeData.personal.email}`}
                  className="flex items-center hover:text-purple-600 transition-colors"
                >
                  <MailIcon className="w-4 h-4 mr-1" />
                  Email
                </a>
              )}
              
              {resumeData.personal.website && (
                <a 
                  href={resumeData.personal.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-purple-600 transition-colors"
                >
                  <GlobeIcon className="w-4 h-4 mr-1" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Personal Summary */}
        <section className="content-card mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {resumeData.personal.name}
              </h2>
              <p className="text-lg text-purple-600 font-medium mb-3">
                {resumeData.personal.title}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {resumeData.personal.summary}
              </p>
              {resumeData.personal.location && (
                <p className="text-gray-500 mt-2">
                  📍 {resumeData.personal.location}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Experience Timeline */}
        <section id="experience" className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <BriefcaseIcon className="w-6 h-6 mr-2 text-purple-600" />
            Work Experience
          </h2>
          
          <div className="space-y-8">
            {resumeData.experience.map((exp: any, index: number) => (
              <div key={exp.id} className="content-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {exp.title}
                    </h3>
                    <p className="text-lg text-purple-600 font-medium">
                      {exp.company}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {exp.location}
                    </p>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {formatDateShort(exp.startDate)} - {exp.endDate ? formatDateShort(exp.endDate) : 'Present'}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <ul className="space-y-2">
                    {exp.description.map((item: string, idx: number) => (
                      <li key={idx} className="text-gray-700 flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <AwardIcon className="w-4 h-4 mr-1 text-purple-600" />
                      Key Achievements
                    </h4>
                    <ul className="space-y-1">
                      {exp.achievements.map((achievement: string, idx: number) => (
                        <li key={idx} className="text-gray-700 flex items-start">
                          <StarIcon className="w-4 h-4 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Skills:</span>
                  {exp.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Matrix */}
        <section id="skills" className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Skills & Expertise
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {['technical', 'framework', 'tool', 'soft'].map(category => {
              const categorySkills = resumeData.skills.filter((skill: any) => skill.category === category)
              if (categorySkills.length === 0) return null
              
              return (
                <div key={category} className="content-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                    {category === 'technical' ? 'Programming Languages' : 
                     category === 'framework' ? 'Frameworks & Libraries' :
                     category === 'tool' ? 'Tools & Platforms' : 'Soft Skills'}
                  </h3>
                  
                  <div className="space-y-3">
                    {categorySkills.map((skill: any) => (
                      <div key={skill.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{skill.name}</span>
                          {skill.endorsed && (
                            <span className="text-purple-600">
                              <StarIcon className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map(level => (
                              <div
                                key={level}
                                className={`w-2 h-2 rounded-full ${
                                  level <= skill.level ? 'bg-purple-600' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          {skill.years && (
                            <span className="text-xs text-gray-500">
                              {skill.years}y
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Education */}
        {resumeData.education && resumeData.education.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <GraduationCapIcon className="w-6 h-6 mr-2 text-purple-600" />
              Education
            </h2>
            
            <div className="space-y-6">
              {resumeData.education.map((edu: any) => (
                <div key={edu.id} className="content-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {edu.degree}
                      </h3>
                      <p className="text-purple-600 font-medium">
                        {edu.institution}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {edu.location}
                      </p>
                      
                      {edu.gpa && (
                        <p className="text-gray-700 mt-2">
                          GPA: {edu.gpa}
                        </p>
                      )}
                      
                      {edu.honors && edu.honors.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">Honors: </span>
                          {edu.honors.join(', ')}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      {formatDate(edu.graduationDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {resumeData.certifications && resumeData.certifications.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <AwardIcon className="w-6 h-6 mr-2 text-purple-600" />
              Certifications
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {resumeData.certifications.map((cert: any, index: number) => (
                <div key={index} className="content-card">
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="text-purple-600">{cert.issuer}</p>
                  <p className="text-gray-500 text-sm">{formatDate(cert.date)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Graph Connection CTA */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-start">
            <NetworkIcon className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900 mb-2">
                Explore Career Connections
              </h3>
              <p className="text-gray-700 mb-4">
                See how skills, experiences, and projects connect in the interactive knowledge graph. 
                Discover the relationships between different roles, technologies, and learning paths.
              </p>
              <Link 
                href="/graph?filter=experience,skill"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <NetworkIcon className="w-4 h-4 mr-2" />
                View Career Graph
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}