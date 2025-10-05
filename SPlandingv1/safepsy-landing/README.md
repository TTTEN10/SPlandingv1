# SafePsy Landing Page

A production-ready landing page for SafePsy - the privacy-first online therapy platform. Built with modern web technologies and privacy-by-design principles, this landing page serves as the entry point for the SafePsy Global Platform.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Privacy by Design**: Default OFF IP hashing, configurable privacy protection
- **Accessibility**: WCAG AA compliant with semantic HTML and ARIA labels
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive test coverage with Vitest and React Testing Library
- **CI/CD**: Automated testing, linting, and Docker builds
- **Analytics**: Optional Plausible integration (privacy-friendly)
- **Security**: Rate limiting, input validation, and secure headers

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vitest** + **React Testing Library** for testing

### Backend
- **Node.js** + **Express** with TypeScript
- **Prisma** + **SQLite** for data persistence
- **Joi** for request validation
- **Helmet** for security headers
- **Rate limiting** for API protection

### Infrastructure
- **Docker** multi-stage builds
- **Docker Compose** for local development
- **Nginx** reverse proxy (production)
- **GitHub Actions** for CI/CD

## 📁 Project Structure

```
safepsy-landing/
├── apps/                    # Applications workspace
│   ├── web/                 # Vite + React + TypeScript frontend
│   │   ├── src/
│   │   │   ├── components/  # React components (Hero, Footer, etc.)
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── contexts/    # React contexts
│   │   │   └── types/       # TypeScript definitions
│   │   ├── public/          # Static assets
│   │   ├── vite.config.ts   # Vite configuration
│   │   ├── tailwind.config.ts # Tailwind CSS configuration
│   │   └── package.json
│   └── api/                 # Express + TypeScript backend
│       ├── src/
│       │   ├── index.ts     # Main Express server
│       │   ├── lib/         # Utility functions
│       │   └── routes/      # API routes
│       ├── prisma/          # Database schema
│       ├── dist/            # Compiled JavaScript
│       └── package.json
├── frontend/                # Legacy frontend (for reference)
├── backend/                 # Legacy backend (for reference)
├── tests/                   # Integration tests
├── public/                  # Shared static assets
├── package.json             # Workspace configuration
├── docker-compose.yml       # Docker services
├── Dockerfile              # Multi-stage build
├── nginx.conf              # Nginx configuration
├── README.md               # This file
├── DEVELOPMENT.md          # Development scripts
├── SPlanding-skeleton.md   # Detailed architecture documentation
└── PRIVACY-BY-DESIGN.md    # Privacy implementation guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (optional)

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/TTTEN10/SPglobalv1.git
   cd SPglobalv1/SPlandingv1/safepsy-landing
   npm install
   cd apps/web && npm install
   cd ../api && npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Root level
   cp env.example .env
   
   # Web application
   cp apps/web/env.example apps/web/.env
   
   # API application
   cp apps/api/env.example apps/api/.env
   
   # Edit the .env files with your settings
   ```

3. **Initialize database:**
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma db push
   ```

4. **Start development servers:**
   ```bash
   # From project root
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

### Docker Development

1. **Build and start services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Application: http://localhost:3001
   - Health check: http://localhost:3001/health

## 🧪 Testing

### Run all tests
```bash
npm run test
```

### Frontend tests
```bash
cd frontend
npm run test              # Run tests
npm run test:coverage     # Run with coverage
npm run test:ui          # Run with UI
```

### Backend tests
```bash
cd backend
npm run test              # Run tests
npm run test:coverage     # Run with coverage
```

## 🔧 Development Commands

### Root level
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run test             # Run all tests
npm run lint             # Lint all code
npm run format           # Format all code
npm run typecheck        # Type check all code
```

### Web Application
```bash
cd apps/web
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # ESLint
npm run format           # Prettier
npm run typecheck        # TypeScript check
npm run test             # Run tests
```

### API Application
```bash
cd apps/api
npm run dev              # Start with nodemon
npm run build            # Build TypeScript
npm run start            # Start production server
npm run lint             # ESLint
npm run format           # Prettier
npm run typecheck        # TypeScript check
npm run test             # Run tests
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
```

## 🚀 Deployment

### Docker Production

1. **Build the image:**
   ```bash
   docker build -t safepsy-landing .
   ```

2. **Run with environment variables:**
   ```bash
   docker run -p 3001:3001 \
     -e NODE_ENV=production \
     -e DATABASE_URL="file:./prod.db" \
     -e IP_HASHING_ENABLED=false \
     -e IP_SALT="your-secure-salt" \
     -v $(pwd)/data:/app/backend/data \
     safepsy-landing
   ```

### Docker Compose Production

1. **Set environment variables:**
   ```bash
   export IP_HASHING_ENABLED=false
   export IP_SALT="your-secure-random-salt"
   ```

2. **Start with nginx:**
   ```bash
   docker-compose --profile production up -d
   ```

### Manual Deployment

1. **Build applications:**
   ```bash
   npm run build
   ```

2. **Start API server:**
   ```bash
   cd apps/api
   npm start
   ```

3. **Serve web application:**
   ```bash
   # Serve apps/web/dist with any static file server
   # e.g., nginx, Apache, or CDN
   ```

## 🔒 Privacy & Security

### Privacy by Design Implementation

This application implements **privacy by design** principles with the following features:

#### IP Address Handling
- **Default OFF**: IP hashing is disabled by default for maximum privacy
- **Configurable**: Can be enabled via `IP_HASHING_ENABLED=true`
- **Secure Hashing**: Uses SHA-256 with configurable salt when enabled
- **No Raw Logging**: Raw IP addresses are never logged

#### Privacy Behavior
- **When `IP_HASHING_ENABLED=false` (default)**:
  - Raw IP addresses are NOT stored or logged
  - Placeholder `'IP_HASHING_DISABLED'` is used instead
  - Maximum privacy protection

- **When `IP_HASHING_ENABLED=true`**:
  - IP addresses are hashed using SHA-256 with salt
  - `ipHash = sha256(ip + SALT)`
  - Still provides privacy while enabling rate limiting

### Privacy Features
- **IP Hashing**: Client IPs are hashed with salt before storage (when enabled)
- **Email Deduplication**: Prevents duplicate subscriptions
- **No Raw Logging**: Sensitive data is not logged
- **Minimal Data Collection**: Only email addresses are stored
- **GDPR Compliant**: Privacy by design implementation

### Security Features
- **Helmet**: Security headers
- **Rate Limiting**: API protection
- **CORS**: Configured for specific origins
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Prisma ORM

### Environment Variables

#### API Application (apps/api/.env)
```bash
PORT=3001
NODE_ENV=production
DATABASE_URL="file:./prisma/prod.db"
FRONTEND_URL=https://your-domain.com

# Privacy by Design - IP Address Handling
IP_HASHING_ENABLED=false  # Default: OFF for maximum privacy
IP_SALT=your-secure-random-salt-change-this-in-production

PLAUSIBLE_DOMAIN=your-domain.com
```

#### Web Application (apps/web/.env)
```bash
VITE_PLAUSIBLE_DOMAIN=your-domain.com
VITE_API_URL=https://api.your-domain.com
```

## 📊 Analytics

Plausible Analytics integration is optional and privacy-friendly:

- **No cookies** or personal data collection
- **GDPR compliant** by design
- **Lightweight** (~1KB)
- **Self-hosted** option available

To enable:
1. Set `VITE_PLAUSIBLE_DOMAIN` in apps/web/.env
2. Set `PLAUSIBLE_DOMAIN` in apps/api/.env

## 🔐 Privacy Implementation Details

### IP Address Privacy Protection

The application implements a comprehensive privacy by design approach for IP address handling:

#### Configuration Options

1. **Maximum Privacy (Default)**:
   ```bash
   IP_HASHING_ENABLED=false
   ```
   - No IP addresses are stored or logged
   - Uses `'IP_HASHING_DISABLED'` placeholder
   - Maximum privacy protection

2. **Balanced Privacy**:
   ```bash
   IP_HASHING_ENABLED=true
   IP_SALT=your-secure-random-salt
   ```
   - IP addresses are hashed with SHA-256 + salt
   - Enables rate limiting while protecting privacy
   - Still prevents IP tracking

#### Implementation Files

- **`apps/api/src/lib/crypto.ts`**: Privacy utilities for API
- **`tests/subscribeRoute.test.ts`**: Tests for both privacy modes

#### Salt Generation

Generate a secure salt for production:
```bash
# Generate a secure random salt
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Compliance

This implementation supports:
- **GDPR**: Privacy by design principles
- **CCPA**: Minimal data collection
- **SOC 2**: Data protection requirements
- **HIPAA**: Privacy safeguards (if applicable)

## 🎨 Customization

### Branding
- Update colors in `apps/web/tailwind.config.ts`
- Modify copy in `apps/web/src/components/Hero.tsx`
- Replace logo and favicon in `apps/web/public/`

### Styling
- Tailwind classes in components
- Custom CSS in `apps/web/src/index.css`
- Responsive breakpoints: sm, md, lg, xl

### Content
- Hero section: `apps/web/src/components/Hero.tsx`
- Email signup: `apps/web/src/components/EmailSignup.tsx`
- Footer: `apps/web/src/components/Footer.tsx`

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors:**
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma db push
   ```

2. **Port conflicts:**
   - Web app: Change port in `apps/web/vite.config.ts`
   - API: Change `PORT` in `apps/api/.env`

3. **Build failures:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules apps/web/node_modules apps/api/node_modules
   npm install
   cd apps/web && npm install
   cd ../api && npm install
   ```

4. **Docker issues:**
   ```bash
   # Rebuild without cache
   docker-compose build --no-cache
   ```

5. **Privacy configuration issues:**
   ```bash
   # Check privacy settings
   echo $IP_HASHING_ENABLED
   echo $IP_SALT
   
   # Test IP hashing
   node -e "
   const crypto = require('crypto');
   const enabled = process.env.IP_HASHING_ENABLED === 'true';
   const salt = process.env.IP_SALT || 'default-salt';
   const ip = '192.168.1.1';
   const result = enabled ? crypto.createHash('sha256').update(ip + salt).digest('hex') : 'IP_HASHING_DISABLED';
   console.log('IP hashing enabled:', enabled);
   console.log('Test IP:', ip);
   console.log('Result:', result);
   "
   ```

### Debug Mode

Enable debug logging:
```bash
# API
cd apps/api
DEBUG=* npm run dev

# Web
cd apps/web
VITE_DEBUG=true npm run dev
```

## 📝 API Reference

### POST /api/subscribe

Subscribe to the waitlist.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully joined our waitlist! We'll notify you when SafePsy launches."
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "This email is already on our waitlist"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write tests for new features
- Use conventional commits
- Ensure accessibility compliance
- Maintain privacy-first principles
- **Privacy by Design**: Default to maximum privacy (IP_HASHING_ENABLED=false)
- **Test Privacy Features**: Include tests for both enabled/disabled privacy modes
- **Document Privacy Impact**: Document any changes that affect user privacy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: hello@safepsy.com
- **Issues**: GitHub Issues
- **Documentation**: This README

---

**SafePsy** - Secure. Ethical. Human-centered. 🛡️❤️👥
