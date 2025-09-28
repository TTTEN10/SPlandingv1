# SafePsy Landing Page - Development Scripts

## Quick Start Commands

```bash
# Install all dependencies
npm install && cd frontend && npm install && cd ../backend && npm install

# Start development servers
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Environment Setup

1. Copy environment files:
   ```bash
   cp env.example .env
   cp frontend/env.example frontend/.env
   cp backend/env.example backend/.env
   ```

2. Generate secure IP salt:
   ```bash
   openssl rand -hex 32
   ```

3. Initialize database:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

## Docker Commands

```bash
# Development
docker-compose up --build

# Production
docker-compose --profile production up -d

# Clean up
docker-compose down -v
```

## Testing Commands

```bash
# All tests
npm run test

# Frontend only
cd frontend && npm run test

# Backend only
cd backend && npm run test

# With coverage
npm run test:coverage
```

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Generate secure IP salt
- [ ] Configure domain names
- [ ] Set up SSL certificates
- [ ] Configure analytics (optional)
- [ ] Test email functionality
- [ ] Verify security headers
- [ ] Run production tests
