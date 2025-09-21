import React from 'react'
import { Shield, Heart, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Hero: React.FC = () => {
  const navigate = useNavigate()

  return (
    <section className="section-padding py-8 lg:py-12">
      <div className="container-max">
        {/* Main Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-12">
          {/* Left Column - Headline */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-heading leading-tight text-center">
                <span className="text-[1.4em]">Transforming</span>{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent text-[1.2em] font-bold">
                  Online-Therapy
                </span>{' '}
                <span className="font-normal">with</span> Ethical AI, Secured by Blockchain
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary text-lg px-8 py-4">
                Join Our Waitlist
              </button>
              <button 
                onClick={() => navigate('/about-us')}
                className="btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden h-96 lg:h-[500px] flex items-center justify-center">
              <img 
                src="/HeroTheme.png" 
                alt="SafePsy Platform Interface" 
                className="w-full h-full object-cover rounded-3xl"
              />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="text-center py-16">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-lg border border-neutral-dark/20">
            <h2 className="text-4xl lg:text-5xl text-heading mb-8">
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Secure. Ethical. Human-centered.
              </span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                  <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl text-heading">Secure</h3>
                <p className="text-body">
                  End-to-end encryption and blockchain technology ensure your privacy and data security
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-secondary-100 rounded-full flex items-center justify-center border border-secondary-200">
                  <Heart className="w-8 h-8 text-secondary-600" />
                </div>
                <h3 className="text-xl text-heading">Ethical</h3>
                <p className="text-body">
                  Compliant with APA guidelines, made by psychologists
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-accent-100 rounded-full flex items-center justify-center border border-accent-200">
                  <Users className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-xl text-heading">Human-centered</h3>
                <p className="text-body">
                  Technology that protects individuals and enhance global mental health accessibility
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
