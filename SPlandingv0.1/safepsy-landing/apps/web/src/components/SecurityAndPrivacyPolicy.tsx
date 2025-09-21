import React from 'react'
import { ArrowLeft, Shield, Lock, Eye, Users, FileText, CheckCircle, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SecurityAndPrivacyPolicy: React.FC = () => {
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
                <span className="text-[1.4em]">Security and</span>{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent text-[1.2em] font-bold">
                  Privacy Policy
                </span>
              </h1>
              <p className="text-xl text-body leading-relaxed max-w-3xl mx-auto">
                Comprehensive data protection and security measures for your mental health journey
              </p>
            </div>

            {/* Security Overview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-lg border border-neutral-dark/20 mb-16">
              <h2 className="text-3xl lg:text-4xl text-heading mb-8 text-center">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Security Overview
                </span>
              </h2>
              <p className="text-lg text-body leading-relaxed text-center max-w-4xl mx-auto mb-12">
                SafePsy implements comprehensive security measures to protect user data, ensure privacy, 
                and maintain system integrity. Our multi-layer security model provides enterprise-grade 
                protection for your sensitive mental health information.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                    <Shield className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl text-heading">Network Security</h3>
                  <p className="text-body">
                    HTTPS/TLS encryption, security headers, rate limiting, and DDoS protection
                  </p>
                </div>
                
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-secondary-100 rounded-full flex items-center justify-center border border-secondary-200">
                    <Lock className="w-8 h-8 text-secondary-600" />
                  </div>
                  <h3 className="text-xl text-heading">Data Security</h3>
                  <p className="text-body">
                    AES-256 encryption, DID-based access control, and secure key management
                  </p>
                </div>
                
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-accent-100 rounded-full flex items-center justify-center border border-accent-200">
                    <Eye className="w-8 h-8 text-accent-600" />
                  </div>
                  <h3 className="text-xl text-heading">Application Security</h3>
                  <p className="text-body">
                    Input validation, authentication, session management, and CSRF protection
                  </p>
                </div>
                
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                    <Users className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl text-heading">Infrastructure Security</h3>
                  <p className="text-body">
                    Container security, network segmentation, monitoring, and incident response
                  </p>
                </div>
              </div>
            </div>

            {/* Encryption Standards */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-lg border border-neutral-dark/20 mb-16">
              <h2 className="text-3xl lg:text-4xl text-heading mb-12 text-center">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Encryption Standards
                </span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-2xl text-heading mb-4">Data Protection</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg text-heading">AES-256-GCM Encryption</h4>
                        <p className="text-body">Industry-standard encryption for all sensitive data at rest and in transit</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg text-heading">TLS 1.3</h4>
                        <p className="text-body">Latest transport layer security for secure data transmission</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg text-heading">PBKDF2 Key Derivation</h4>
                        <p className="text-body">100,000 iterations for secure key generation from user passwords</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg text-heading">SHA-256 Integrity</h4>
                        <p className="text-body">Data integrity verification and tamper detection</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl text-heading mb-4">Access Control</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg text-heading">DID-Based Authentication</h4>
                        <p className="text-body">Decentralized identity management with cryptographic key pairs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg text-heading">User-Controlled Keys</h4>
                        <p className="text-body">Users maintain control over their encryption keys (never stored on servers)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg text-heading">Role-Based Permissions</h4>
                        <p className="text-body">Granular access control for therapists and authorized personnel</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg text-heading">Audit Logging</h4>
                        <p className="text-body">Complete access logging and audit trails for all data operations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Protection Rights */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-lg border border-neutral-dark/20 mb-16">
              <h2 className="text-3xl lg:text-4xl text-heading mb-12 text-center">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Your Data Protection Rights
                </span>
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                    <Eye className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl text-heading text-center">Right to Access</h3>
                  <p className="text-body text-center">
                    Access all your personal data processed by SafePsy through our encrypted APIs within 30 days
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-secondary-100 rounded-full flex items-center justify-center border border-secondary-200">
                    <FileText className="w-8 h-8 text-secondary-600" />
                  </div>
                  <h3 className="text-xl text-heading text-center">Right to Rectification</h3>
                  <p className="text-body text-center">
                    Correct or update your personal data with encrypted data update mechanisms
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-accent-100 rounded-full flex items-center justify-center border border-accent-200">
                    <Lock className="w-8 h-8 text-accent-600" />
                  </div>
                  <h3 className="text-xl text-heading text-center">Right to Erasure</h3>
                  <p className="text-body text-center">
                    Complete data removal from all systems with cryptographic data deletion
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                    <Shield className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl text-heading text-center">Right to Portability</h3>
                  <p className="text-body text-center">
                    Export all your data in a structured, machine-readable format
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-secondary-100 rounded-full flex items-center justify-center border border-secondary-200">
                    <Users className="w-8 h-8 text-secondary-600" />
                  </div>
                  <h3 className="text-xl text-heading text-center">Right to Restrict Processing</h3>
                  <p className="text-body text-center">
                    Limit data processing for specific purposes or data types
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-accent-100 rounded-full flex items-center justify-center border border-accent-200">
                    <CheckCircle className="w-8 h-8 text-accent-600" />
                  </div>
                  <h3 className="text-xl text-heading text-center">Consent Management</h3>
                  <p className="text-body text-center">
                    Granular consent controls with immediate withdrawal capabilities
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-lg border border-neutral-dark/20 mb-16">
              <h2 className="text-3xl lg:text-4xl text-heading mb-12 text-center">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Regulatory Compliance
                </span>
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center border border-green-200">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl text-heading">GDPR</h3>
                  <p className="text-body">General Data Protection Regulation compliance with all data subject rights</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
                    <CheckCircle className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl text-heading">HIPAA</h3>
                  <p className="text-body">Health Insurance Portability and Accountability Act compliance</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center border border-purple-200">
                    <CheckCircle className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl text-heading">ISO 27001</h3>
                  <p className="text-body">Information Security Management System certification</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center border border-orange-200">
                    <CheckCircle className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-xl text-heading">APA/EFPA</h3>
                  <p className="text-body">American Psychological Association and European Federation compliance</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg text-heading mb-2">Privacy by Design</h3>
                    <p className="text-body">
                      SafePsy implements privacy-by-design principles throughout our platform. We minimize data collection, 
                      use end-to-end encryption, provide granular consent controls, and ensure users maintain control 
                      over their personal information. Our architecture is built from the ground up to protect your privacy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Categories */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-lg border border-neutral-dark/20 mb-16">
              <h2 className="text-3xl lg:text-4xl text-heading mb-12 text-center">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Data Categories & Processing
                </span>
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-neutral-300">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="border border-neutral-300 px-4 py-3 text-left text-heading">Data Type</th>
                      <th className="border border-neutral-300 px-4 py-3 text-left text-heading">Purpose</th>
                      <th className="border border-neutral-300 px-4 py-3 text-left text-heading">Retention</th>
                      <th className="border border-neutral-300 px-4 py-3 text-left text-heading">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Identity Data (DID)</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Identity verification and access control</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">User-controlled deletion</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Consent, Contract</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Health Data</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Therapy provision and progress tracking</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">7 years (regulatory)</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Consent, Vital Interests</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Communication Data</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Therapy conversations and sessions</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">30 days (configurable)</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Consent, Contract</td>
                    </tr>
                    <tr>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Technical Data</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Platform security and optimization</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">12 months</td>
                      <td className="border border-neutral-300 px-4 py-3 text-body">Legitimate Interests</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-lg border border-neutral-dark/20 mb-16">
              <h2 className="text-3xl lg:text-4xl text-heading mb-12 text-center">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Contact Information
                </span>
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                    <FileText className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl text-heading">Data Protection Officer</h3>
                  <p className="text-body">dpo@safepsy.com</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-secondary-100 rounded-full flex items-center justify-center border border-secondary-200">
                    <Shield className="w-8 h-8 text-secondary-600" />
                  </div>
                  <h3 className="text-xl text-heading">Privacy Questions</h3>
                  <p className="text-body">privacy@safepsy.com</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-accent-100 rounded-full flex items-center justify-center border border-accent-200">
                    <Lock className="w-8 h-8 text-accent-600" />
                  </div>
                  <h3 className="text-xl text-heading">Security Issues</h3>
                  <p className="text-body">security@safepsy.com</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                    <AlertTriangle className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl text-heading">Legal Inquiries</h3>
                  <p className="text-body">legal@safepsy.com</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl text-heading mb-6">
                Questions About Your Privacy?
              </h2>
              <p className="text-lg text-body mb-8 max-w-2xl mx-auto">
                We're committed to transparency and protecting your privacy. Contact us with any questions about our security measures or data protection practices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/')}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Back to Home
                </button>
                <a 
                  href="mailto:privacy@safepsy.com"
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Contact Privacy Team
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default SecurityAndPrivacyPolicy
