import React, { useState } from 'react';
import { Brain, Leaf } from 'lucide-react';
import './App.css';

// Alternative Logo 6 Component - Gradient Heads
const AlternativeLogo6 = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className="alternative-logo">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#1E995E' }} />
        <stop offset="100%" style={{ stopColor: '#6A5B9A' }} />
      </linearGradient>
    </defs>
    
    {/* Background gradient rectangle */}
    <rect width="40" height="40" rx="8" fill="url(#logoGradient)" />
    
    {/* Background head outline (larger, behind) */}
    <ellipse
      cx="22"
      cy="18"
      rx="8"
      ry="10"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      strokeOpacity="0.7"
    />
    
    {/* Foreground head (solid, smaller) */}
    <ellipse
      cx="16"
      cy="16"
      rx="6"
      ry="8"
      fill="white"
    />
  </svg>
);

function App() {
  const [email, setEmail] = useState('');

  const handleEmailSignup = (e) => {
    e.preventDefault();
    console.log('Email signup:', email);
    // Handle email signup logic here
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo">
              <AlternativeLogo6 size={36} />
              <h1 className="logo-text font-primary">SafePsy</h1>
            </div>
            
            {/* Tagline */}
            <p className="tagline font-secondary">
              We protect your data so you can focus on your well-being.
            </p>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="main">
        <div className="container">
          <div className="hero-content">
            {/* Left Side - Text Content */}
            <div className="hero-text">
              <h1 className="hero-title font-primary">
                Revolutionizing Online Therapy with Privacy-First Technology
              </h1>
              <p className="hero-description font-secondary">
                SafePsy offers a secure, AI-powered platform for online counseling, powered by blockchain and digital identity.
              </p>
              
              <div className="hero-buttons">
                <button className="btn-primary">
                  Start as Patient
                </button>
                <button className="btn-secondary">
                  Join as Therapist
                </button>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hero-illustration">
              {/* Monitor */}
              <div className="monitor">
                <div className="monitor-screen">
                  <div className="screen-content">
                    <div className="avatar">
                      <div className="avatar-inner"></div>
                    </div>
                    <div className="video-label font-secondary">Video Call</div>
                  </div>
                </div>
              </div>
              
              {/* Person sitting on monitor */}
              <div className="person">
                <div className="person-figure">
                  {/* Head */}
                  <div className="person-head"></div>
                  {/* Body */}
                  <div className="person-body"></div>
                </div>
              </div>
              
              {/* Phone below monitor */}
              <div className="phone">
                <div className="phone-screen">
                  <div className="phone-lines">
                    <div className="phone-line"></div>
                    <div className="phone-line"></div>
                    <div className="phone-line"></div>
                    <div className="phone-line"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            {/* Left Side - Text */}
            <div className="cta-text">
              <h2 className="cta-title font-primary">Be the First to Know</h2>
              <p className="cta-description font-secondary">Get early access to Safepsy's launch</p>
            </div>
            
            {/* Right Side - Email Signup */}
            <div className="cta-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
              <button
                onClick={handleEmailSignup}
                className="btn-primary"
              >
                Join our waitlist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mid-Page Slogan */}
      <section className="slogan-section">
        <div className="container">
          <h2 className="slogan font-primary text-primary-color">
            Secure. Ethical. Human-centered.
          </h2>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <h3 className="footer-title font-primary">Contact</h3>
            <div className="footer-links">
              <p className="font-secondary">contact@safepsy.com</p>
              <p className="font-secondary">Instagram</p>
              <p className="font-secondary">LinkedIn</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
