import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Footer from './Footer'

const JoinOurWaitlist: React.FC = () => {
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle waitlist form submission here
    console.log('Waitlist form submitted')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-heading text-lg">
            <a href="https://www.safepsy.com" target="_blank" rel="noopener noreferrer" className="h-14 hover:drop-shadow-lg transition-all duration-200">
              <img src="/LogoTransparent1.png" alt="SafePsy Logo" className="h-14" />
            </a>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[1.1em] text-web-safe hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="section-padding py-8 lg:py-12">
          <div className="container-max">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-heading leading-tight mb-6">
                <span className="text-[1.08em]">Join our</span>{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent text-[1.2em] font-bold">
                  Waitlist
                </span>
              </h1>
              <p className="text-xl text-body leading-relaxed max-w-3xl mx-auto">
                Be the first to experience SafePsy's revolutionary AI-powered therapy platform.
              </p>
              <p className="text-xl text-body leading-relaxed max-w-3xl mx-auto">
                Get early access and exclusive updates.
              </p>
            </div>

            {/* Waitlist Form */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-lg border border-neutral-dark/20 mb-16">
              <h2 className="text-2xl lg:text-3xl text-heading mb-8 text-center">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Get Early Access
                </span>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="block text-lg font-medium text-heading">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      className="w-full px-4 py-3 text-lg border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-lg font-medium text-heading">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 text-lg border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold text-lg px-12 py-4 rounded-xl hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Join Waitlist
                  </button>
                </div>
              </form>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default JoinOurWaitlist
