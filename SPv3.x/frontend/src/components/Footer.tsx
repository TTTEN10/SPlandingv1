import React from 'react'
import { Mail, Instagram, Linkedin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Footer: React.FC = () => {
  const navigate = useNavigate()

  return (
    <footer>
      <div className="container-max section-padding py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <a
              href="https://www.safepsy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-16 hover:drop-shadow-lg transition-all duration-200"
            >
              <img src="/LogoTransparent1.png" alt="SafePsy Logo" className="h-16" />
            </a>
            <p className="text-text-primary font-titillium font-regular">
              Smart, Secure, and Private Therapy<br />
              Powered by AI and Blockchain
            </p>
          </div>

          {/* Contact Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-titillium font-semibold text-text-primary">Contact</h4>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/contact-us')}
                className="flex items-center gap-3 text-text-primary hover:text-primary-600 transition-colors font-titillium font-regular"
                aria-label="Contact us"
              >
                <Mail className="w-5 h-5" />
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-bold hover:from-primary-700 hover:to-secondary-700 transition-all duration-200">
                  Contact
                </span>
              </button>
              <button
                onClick={() => navigate('/join-our-waitlist')}
                className="flex items-center gap-3 text-text-primary hover:text-primary-600 transition-colors font-titillium font-regular"
                aria-label="Join our waitlist"
              >
                <Mail className="w-5 h-5" />
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-bold hover:from-primary-700 hover:to-secondary-700 transition-all duration-200">
                  Join Waitlist
                </span>
              </button>
              <a
                href="https://instagram.com/safepsy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-text-primary hover:text-primary-600 transition-colors font-titillium font-regular"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
                @safepsy
              </a>
              <a
                href="https://linkedin.com/company/safepsy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-text-primary hover:text-primary-600 transition-colors font-titillium font-regular"
                aria-label="Connect with us on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
                SafePsy
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-titillium font-semibold text-text-primary">Legal</h4>
            <div className="space-y-2">
              <p className="text-sm font-noto font-light text-text-primary">
                © 2025 SafePsy. All rights reserved.
              </p>
              <button 
                onClick={() => navigate('/sap-policy')}
                className="text-sm font-noto font-light text-text-primary hover:text-primary-600 transition-colors text-left"
              >
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-bold hover:from-primary-700 hover:to-secondary-700 transition-all duration-200">
                  Security and Privacy Policy
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-text-primary/20 mt-8 pt-8 text-center">
          <p className="text-text-primary text-sm font-noto font-light">
            Built with privacy, security, and human-centered design.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
