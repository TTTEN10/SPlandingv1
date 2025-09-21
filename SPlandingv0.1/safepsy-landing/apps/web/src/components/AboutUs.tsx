import React from 'react'
import { ArrowLeft, Shield, Heart, Users, Brain, Lock, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AboutUs: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-heading text-lg">
            <a href="https://www.safepsy.com" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <img src="/LogoTransparent1.png" alt="SafePsy Logo" className="h-16 transition-all duration-200 hover:drop-shadow-lg" />
            </a>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-web-safe hover:text-primary-600 transition-colors"
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
                <span className="text-[1.4em]">About</span>{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent text-[1.2em] font-bold">
                  SafePsy
                </span>
              </h1>
              <p className="text-xl text-body leading-relaxed max-w-3xl mx-auto">
                Smart, Secure, and Private Therapy<br />
                Powered by AI and Blockchain
              </p>
            </div>

            {/* Mission Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-lg border border-neutral-dark/20 mb-16">
              <h2 className="text-3xl lg:text-4xl text-heading mb-8 text-center">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Our Mission
                </span>
              </h2>
              <p className="text-lg text-body leading-relaxed text-center max-w-4xl mx-auto">
                SafePsy is revolutionizing mental health care by providing the most secure online psychotherapy service. 
                We combine cutting-edge AI technology with blockchain security to ensure your privacy while delivering 
                accessible, high-quality mental health support worldwide.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                  <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl text-heading">Secure</h3>
                <p className="text-body">
                  End-to-end encryption and blockchain technology ensure your privacy and data security
                </p>
              </div>
              
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 mx-auto bg-secondary-100 rounded-full flex items-center justify-center border border-secondary-200">
                  <Heart className="w-8 h-8 text-secondary-600" />
                </div>
                <h3 className="text-xl text-heading">Ethical</h3>
                <p className="text-body">
                  Compliant with APA guidelines, made by psychologists
                </p>
              </div>
              
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 mx-auto bg-accent-100 rounded-full flex items-center justify-center border border-accent-200">
                  <Users className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-xl text-heading">Human-centered</h3>
                <p className="text-body">
                  Technology that protects individuals and enhance global mental health accessibility
                </p>
              </div>
            </div>

            {/* Technology Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-lg border border-neutral-dark/20 mb-16">
              <h2 className="text-3xl lg:text-4xl text-heading mb-12 text-center">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Our Technology
                </span>
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                    <Brain className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl text-heading">AI-Powered</h3>
                  <p className="text-body">
                    Advanced artificial intelligence enhances therapy sessions while maintaining human connection
                  </p>
                </div>
                
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-secondary-100 rounded-full flex items-center justify-center border border-secondary-200">
                    <Lock className="w-8 h-8 text-secondary-600" />
                  </div>
                  <h3 className="text-xl text-heading">Blockchain Security</h3>
                  <p className="text-body">
                    Immutable records and decentralized storage protect your sensitive mental health data
                  </p>
                </div>
                
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-accent-100 rounded-full flex items-center justify-center border border-accent-200">
                    <Globe className="w-8 h-8 text-accent-600" />
                  </div>
                  <h3 className="text-xl text-heading">Global Access</h3>
                  <p className="text-body">
                    Breaking down barriers to mental health care with secure, accessible online therapy
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl text-heading mb-6">
                Ready to Experience the Future of Mental Health Care?
              </h2>
              <p className="text-lg text-body mb-8 max-w-2xl mx-auto">
                Join our waitlist to be among the first to experience secure, AI-enhanced therapy sessions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/')}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Join Our Waitlist
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AboutUs
