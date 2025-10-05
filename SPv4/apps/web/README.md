# SafePsy Web Application

## 🚀 Overview

The SafePsy Web Application is a modern React-based web application that provides the user interface for the SafePsy platform. Built with Vite, React 18, TypeScript, and Tailwind CSS, it offers a fast, responsive, and accessible user experience for therapy and mental health services.

## 🛠 Tech Stack

### Core Technologies
- **React 18** - Modern React with concurrent features
- **TypeScript** - Full type safety implementation
- **Vite** - Fast development and building
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### UI Components
- **shadcn/ui** - Modern component library
- **Lucide React** - Icon library
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library

### Development Tools
- **Vitest** - Fast unit testing
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Footer.tsx      # Footer component
│   │   ├── Hero.tsx        # Hero section
│   │   ├── EmailSignup.tsx # Email subscription form
│   │   ├── CookieBanner.tsx # GDPR cookie consent
│   │   ├── SEOHead.tsx     # SEO meta tags
│   │   └── ...             # Other components
│   ├── hooks/              # Custom React hooks
│   │   ├── useSEO.ts       # SEO configuration
│   │   └── useCookieConsent.ts # Cookie consent logic
│   ├── contexts/           # React contexts
│   │   └── ThemeContext.tsx # Theme management
│   ├── types/              # TypeScript definitions
│   │   └── seo.ts          # SEO types
│   ├── test/               # Test setup
│   │   └── setup.ts        # Vitest configuration
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
│   ├── Favicon.jpg
│   ├── HeroTheme.png
│   ├── Logotransparent.png
│   └── ...                 # Other assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.node.json      # Node.js TypeScript config
├── vitest.config.ts        # Testing configuration
└── postcss.config.cjs      # PostCSS configuration
```

## 🔧 Key Features

### Landing Page Components
- **Hero Section**: Main landing section with call-to-action
- **Email Signup**: Subscription form with validation
- **Cookie Banner**: GDPR-compliant consent management
- **SEO Head**: Dynamic meta tags and structured data
- **Header/Footer**: Navigation and footer components

### Privacy & Security
- **Privacy by Design**: Default OFF IP hashing
- **Cookie Consent**: GDPR-compliant cookie management
- **Analytics Integration**: Optional Plausible integration
- **Security Headers**: Comprehensive security implementation

### User Experience
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG AA compliance
- **Performance**: Optimized loading and rendering
- **SEO**: Search engine optimization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

1. **Install dependencies**
   ```bash
   cd SPlandingv1/safepsy-landing/apps/web
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```

3. **Configure environment**
   ```bash
   # .env
   VITE_PLAUSIBLE_DOMAIN=your-domain.com
   VITE_API_URL=https://api.your-domain.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📋 Available Scripts

### Development
```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run typecheck        # TypeScript type checking
```

### Testing
```bash
npm run test             # Run tests
npm run test:watch       # Watch mode testing
npm run test:coverage    # Run with coverage
npm run test:ui          # Run with UI
```

### Building
```bash
npm run build            # Production build
npm run build:analyze    # Analyze bundle size
npm run build:preview    # Preview build
```

## 🎨 Component Architecture

### Hero Component
```typescript
// Hero.tsx
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Secure Therapy Platform
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Privacy-first online therapy with decentralized identity
        </p>
        <Button size="lg" className="text-lg px-8 py-4">
          Join Waitlist
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  )
}
```

### Email Signup Component
```typescript
// EmailSignup.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function EmailSignup() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      setMessage(data.message)
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  )
}
```

### Cookie Banner Component
```typescript
// CookieBanner.tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
```

## 🔒 Privacy Implementation

### Privacy by Design
```typescript
// Privacy settings
export const PRIVACY_SETTINGS = {
  IP_HASHING_ENABLED: false, // Default OFF for maximum privacy
  ANALYTICS_ENABLED: false,  // Optional analytics
  COOKIES_ENABLED: false     // Cookie consent required
}
```

### Analytics Integration
```typescript
// Analytics hook
import { useEffect } from 'react'

export function useAnalytics() {
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
    
    if (consent === 'accepted' && domain) {
      // Load Plausible analytics
      const script = document.createElement('script')
      script.src = 'https://plausible.io/js/script.js'
      script.setAttribute('data-domain', domain)
      document.head.appendChild(script)
    }
  }, [])
}
```

## 🧪 Testing

### Component Testing
```typescript
// Hero.test.tsx
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/Hero'

test('renders hero section with correct content', () => {
  render(<Hero />)
  
  expect(screen.getByText('Secure Therapy Platform')).toBeInTheDocument()
  expect(screen.getByText('Join Waitlist')).toBeInTheDocument()
})
```

### Integration Testing
```typescript
// EmailSignup.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EmailSignup } from '@/components/EmailSignup'

test('submits email signup form', async () => {
  render(<EmailSignup />)
  
  const emailInput = screen.getByPlaceholderText('Enter your email')
  const submitButton = screen.getByText('Subscribe')
  
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
  fireEvent.click(submitButton)
  
  await waitFor(() => {
    expect(screen.getByText('Successfully joined our waitlist!')).toBeInTheDocument()
  })
})
```

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# The build output will be in the 'dist' directory
# Serve with any static file server
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Configuration
```bash
# Production environment variables
VITE_PLAUSIBLE_DOMAIN=safepsy.com
VITE_API_URL=https://api.safepsy.com
```

## 📊 Performance Optimization

### Code Splitting
```typescript
// Lazy load components
import { lazy, Suspense } from 'react'

const EmailSignup = lazy(() => import('@/components/EmailSignup'))

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailSignup />
    </Suspense>
  )
}
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Check for unused dependencies
npx depcheck
```

## 🔧 Configuration

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      }
    }
  },
  plugins: []
}

export default config
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript Errors**
   ```bash
   # Run type checking
   npm run typecheck
   
   # Check for missing types
   npm install @types/react @types/react-dom
   ```

3. **Styling Issues**
   ```bash
   # Check Tailwind configuration
   npm run build
   
   # Verify PostCSS configuration
   npx tailwindcss --init
   ```

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Testing Resources
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new components
- Use conventional commits
- Ensure accessibility compliance
- Maintain privacy-first principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

### Contact Information
- **Web Team**: web@safepsy.com
- **Technical Issues**: tech@safepsy.com
- **Security Issues**: security@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Technical Lead**: tech-lead@safepsy.com

---

**SafePsy Web Application** - Modern, Secure, User-Friendly Interface 🎨🔒
