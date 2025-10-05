# SafePsy API Application

## 🚀 Overview

The SafePsy API Application is a Node.js/TypeScript backend service that provides RESTful API endpoints for the SafePsy platform. Built with Express.js, Prisma, and SQLite, it offers secure data management, email subscription handling, and comprehensive security features with privacy-by-design principles.

## 🛠 Tech Stack

### Core Technologies
- **Node.js 18+** - JavaScript runtime
- **TypeScript** - Full type safety implementation
- **Express.js** - Web application framework
- **Prisma** - Database ORM
- **SQLite** - Lightweight database

### Security & Validation
- **Joi** - Request validation
- **Helmet** - Security headers
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing
- **bcryptjs** - Password hashing

### Development Tools
- **Nodemon** - Development server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📁 Project Structure

```
apps/api/
├── src/
│   ├── index.ts            # Main Express server
│   ├── lib/                # Utility functions
│   │   ├── crypto.ts       # Privacy utilities
│   │   ├── validation.ts   # Validation schemas
│   │   └── logger.ts       # Logging utilities
│   └── routes/             # API routes
│       ├── subscribe.ts     # Email subscription
│       ├── health.ts       # Health check
│       └── index.ts        # Route index
├── prisma/                 # Database schema
│   ├── schema.prisma       # Prisma schema
│   └── dev.db              # SQLite database
├── dist/                   # Compiled JavaScript
├── package.json            # Dependencies and scripts
├── nodemon.json            # Nodemon configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔧 Key Features

### API Endpoints
- **Email Subscription**: Handle waitlist signups
- **Health Check**: Service monitoring
- **Admin Endpoints**: Subscriber management

### Privacy & Security
- **Privacy by Design**: Default OFF IP hashing
- **Rate Limiting**: API protection
- **Input Validation**: Request sanitization
- **Security Headers**: Comprehensive security
- **CORS Protection**: Cross-origin security

### Data Management
- **Prisma ORM**: Type-safe database operations
- **SQLite Database**: Lightweight data storage
- **Email Deduplication**: Prevent duplicate subscriptions
- **Audit Logging**: Complete request logging

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

1. **Install dependencies**
   ```bash
   cd SPlandingv1/safepsy-landing/apps/api
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```

3. **Configure environment**
   ```bash
   # .env
   PORT=3001
   NODE_ENV=production
   DATABASE_URL="file:./prisma/prod.db"
   FRONTEND_URL=https://your-domain.com
   
   # Privacy by Design - IP Address Handling
   IP_HASHING_ENABLED=false  # Default: OFF for maximum privacy
   IP_SALT=your-secure-random-salt-change-this-in-production
   
   PLAUSIBLE_DOMAIN=your-domain.com
   ```

4. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **API will be available at**
   ```
   http://localhost:3001
   ```

## 📋 Available Scripts

### Development
```bash
npm run dev              # Start with nodemon
npm run build            # Build TypeScript
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run typecheck        # TypeScript type checking
```

### Database
```bash
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
```

### Testing
```bash
npm run test             # Run tests
npm run test:watch       # Watch mode testing
npm run test:coverage    # Run with coverage
```

## 🔧 API Endpoints

### Email Subscription

#### POST `/api/subscribe`
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

### Health Check

#### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "safepsy-api",
  "version": "1.0.0",
  "uptime": "2d 5h 30m",
  "memory": {
    "used": "45.2MB",
    "free": "1.2GB"
  }
}
```

### Admin Endpoints

#### GET `/api/subscribers`
Get all subscribers (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "ipHash": "IP_HASHING_DISABLED",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🔒 Security Implementation

### Privacy by Design
```typescript
// Privacy utilities
export function getPrivacySafeIP(req: Request): string {
  const ipHashingEnabled = process.env.IP_HASHING_ENABLED === 'true'
  
  if (!ipHashingEnabled) {
    return 'IP_HASHING_DISABLED'
  }
  
  const clientIP = getClientIP(req)
  const salt = process.env.IP_SALT || 'default-salt'
  
  return crypto.createHash('sha256')
    .update(clientIP + salt)
    .digest('hex')
}
```

### Rate Limiting
```typescript
// Rate limiting middleware
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
})

app.use('/api', limiter)
```

### Input Validation
```typescript
// Validation schemas
import Joi from 'joi'

const subscribeSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
})

export function validateSubscribe(req: Request, res: Response, next: NextFunction) {
  const { error } = subscribeSchema.validate(req.body)
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    })
  }
  
  next()
}
```

### Security Headers
```typescript
// Security headers middleware
import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))
```

## 🗄️ Database Schema

### Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Subscriber {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  ipHash    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("subscribers")
}
```

### Database Operations
```typescript
// Database service
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class SubscriberService {
  async createSubscriber(email: string, ipHash: string) {
    return await prisma.subscriber.create({
      data: {
        email,
        ipHash
      }
    })
  }

  async getSubscriberByEmail(email: string) {
    return await prisma.subscriber.findUnique({
      where: { email }
    })
  }

  async getAllSubscribers() {
    return await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }
}
```

## 🧪 Testing

### Unit Testing
```typescript
// subscribeRoute.test.ts
import request from 'supertest'
import { app } from '../src/index'

describe('POST /api/subscribe', () => {
  test('should subscribe new email', async () => {
    const response = await request(app)
      .post('/api/subscribe')
      .send({ email: 'test@example.com' })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.message).toContain('Successfully joined')
  })

  test('should reject duplicate email', async () => {
    // First subscription
    await request(app)
      .post('/api/subscribe')
      .send({ email: 'duplicate@example.com' })

    // Second subscription
    const response = await request(app)
      .post('/api/subscribe')
      .send({ email: 'duplicate@example.com' })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('already on our waitlist')
  })
})
```

### Integration Testing
```typescript
// emailService.test.ts
import { EmailService } from '../src/lib/emailService'

describe('EmailService', () => {
  test('should validate email format', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'test+tag@example.org'
    ]

    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'test@',
      'test.example.com'
    ]

    validEmails.forEach(email => {
      expect(EmailService.isValidEmail(email)).toBe(true)
    })

    invalidEmails.forEach(email => {
      expect(EmailService.isValidEmail(email)).toBe(false)
    })
  })
})
```

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "start"]
```

### Environment Configuration
```bash
# Production environment variables
PORT=3001
NODE_ENV=production
DATABASE_URL="file:./prisma/prod.db"
FRONTEND_URL=https://safepsy.com

# Privacy settings
IP_HASHING_ENABLED=false
IP_SALT=your-production-salt

# Analytics
PLAUSIBLE_DOMAIN=safepsy.com
```

## 📊 Monitoring & Logging

### Request Logging
```typescript
// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const ipHash = getPrivacySafeIP(req)
    
    console.log({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ipHash,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    })
  })
  
  next()
}
```

### Error Handling
```typescript
// Error handling middleware
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error)
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  })
}
```

## 🔧 Configuration

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Nodemon Configuration
```json
// nodemon.json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node src/index.ts"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Regenerate Prisma client
   npx prisma generate
   
   # Reset database
   npx prisma db push --force-reset
   ```

2. **Port Conflicts**
   ```bash
   # Change port in .env
   PORT=3002
   ```

3. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Privacy Configuration Issues**
   ```bash
   # Check privacy settings
   echo $IP_HASHING_ENABLED
   echo $IP_SALT
   ```

## 📚 Resources

### Documentation
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Security Resources
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Rate Limit](https://github.com/nfriedly/express-rate-limit)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new endpoints
- Use conventional commits
- Ensure security best practices
- Maintain privacy-first principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

### Contact Information
- **API Team**: api@safepsy.com
- **Technical Issues**: tech@safepsy.com
- **Security Issues**: security@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Technical Lead**: tech-lead@safepsy.com

---

**SafePsy API Application** - Secure, Privacy-First Backend Service 🔒🚀
