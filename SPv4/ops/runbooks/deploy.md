# SafePsy Deployment Runbook

## Overview

This runbook provides comprehensive deployment procedures for the SafePsy decentralized identity platform. The platform consists of multiple microservices deployed using Docker Compose with support for both staging and production environments.

## Architecture Overview

### Services
- **Frontend**: React application (Port 80/8080)
- **Backend**: Node.js/TypeScript API (Port 3000/3002)
- **AI Chatbot**: AI-powered therapy assistant (Port 3001/3003)
- **MongoDB**: Primary database (Port 27017/27018)
- **Redis**: Caching layer (Port 6379/6380)
- **Nginx**: Reverse proxy and SSL termination (Port 443)

### Environments
- **Production**: `docker-compose.yml` (Ports: 80, 3000, 3001, 27017, 6379, 443)
- **Staging**: `docker-compose.staging.yml` (Ports: 8080, 3002, 3003, 27018, 6380)

## Prerequisites

### System Requirements
- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 18+
- Git
- 4GB+ RAM
- 20GB+ disk space

### Required Access
- Docker daemon access
- File system write permissions
- Network access for pulling images
- SSL certificates (for production)

### Environment Files
Ensure the following environment files are configured:
- `backend/.env`
- `ai-chatbot/.env`
- `backend/polygon-amoy.env.example` (for smart contracts)

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All tests pass (`npm test` in each service)
- [ ] Code linting passes (`npm run lint`)
- [ ] Security scan completed
- [ ] Dependencies updated and audited
- [ ] Database migrations reviewed

### 2. Environment Configuration
- [ ] Environment variables configured
- [ ] Database credentials updated
- [ ] API keys and secrets set
- [ ] SSL certificates available (production)
- [ ] Network configuration verified

### 3. Infrastructure
- [ ] Docker daemon running
- [ ] Required ports available
- [ ] Disk space sufficient
- [ ] Backup strategy in place
- [ ] Monitoring configured

## Deployment Procedures

### Production Deployment

#### Step 1: Pre-Deployment Backup
```bash
# Create database backup
./docker-manage.sh backup production

# Backup configuration files
tar -czf config-backup-$(date +%Y%m%d_%H%M%S).tar.gz \
  backend/.env \
  ai-chatbot/.env \
  nginx/nginx.conf \
  nginx/ssl/
```

#### Step 2: Build and Deploy
```bash
# Navigate to project root
cd /path/to/SPv3.4

# Build all images
./docker-manage.sh build production --no-cache

# Deploy services
./docker-manage.sh start production

# Verify deployment
./docker-manage.sh health production
```

#### Step 3: Post-Deployment Verification
```bash
# Check service status
./docker-manage.sh status production

# Verify endpoints
curl -f http://localhost:3000/health || echo "Backend health check failed"
curl -f http://localhost:3001/health || echo "AI Chatbot health check failed"
curl -f http://localhost:80 || echo "Frontend not accessible"

# Check logs for errors
./docker-manage.sh logs production --follow
```

### Staging Deployment

#### Step 1: Deploy to Staging
```bash
# Build staging images
./docker-manage.sh build staging --no-cache

# Deploy staging environment
./docker-manage.sh start staging

# Verify staging deployment
./docker-manage.sh health staging
```

#### Step 2: Staging Verification
```bash
# Test staging endpoints
curl -f http://localhost:3002/health
curl -f http://localhost:3003/health
curl -f http://localhost:8080

# Run integration tests
cd backend && npm run test:integration
cd ../frontend && npm run test:e2e
```

### Smart Contract Deployment

#### Polygon Amoy Testnet
```bash
cd backend

# Compile contracts
npm run compile:did

# Run tests
npm run test:did

# Deploy to Polygon Amoy
npm run deploy:did:amoy

# Verify contracts
npm run verify:amoy

# Check network health
npm run check:amoy:health
```

#### Production Mainnet
```bash
# Deploy to Polygon mainnet
npm run deploy:did:polygon

# Verify on Polygonscan
npm run verify:polygon
```

## Service-Specific Deployment

### Frontend Deployment
```bash
cd frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Test build locally
npm run test

# Deploy via Docker
docker-compose up -d frontend
```

### Backend Deployment
```bash
cd backend

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Run tests
npm run test

# Deploy via Docker
docker-compose up -d backend
```

### AI Chatbot Deployment
```bash
cd ai-chatbot

# Install dependencies
npm install

# Run tests
npm test

# Deploy via Docker
docker-compose up -d ai-chatbot
```

### Database Deployment
```bash
# Initialize MongoDB
docker-compose up -d mongodb

# Wait for initialization
sleep 30

# Verify database connection
docker exec safepsy-mongodb mongosh --eval "db.adminCommand('ping')"
```

## Configuration Management

### Environment Variables
```bash
# Backend environment
cat > backend/.env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://admin:safepsy_password@mongodb:27017/safepsy?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=your_jwt_secret
POLYGON_RPC_URL=your_polygon_rpc_url
PRIVATE_KEY=your_private_key
EOF

# AI Chatbot environment
cat > ai-chatbot/.env << EOF
NODE_ENV=production
PORT=3001
BACKEND_URL=http://backend:3000
OPENAI_API_KEY=your_openai_key
EOF
```

### SSL Configuration
```bash
# Generate SSL certificates (if not using Let's Encrypt)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/private.key \
  -out nginx/ssl/certificate.crt

# Update nginx configuration
cp nginx/nginx.conf.example nginx/nginx.conf
```

## Monitoring and Health Checks

### Health Check Endpoints
- Backend: `http://localhost:3000/health`
- AI Chatbot: `http://localhost:3001/health`
- Frontend: `http://localhost:80`
- Database: `docker exec safepsy-mongodb mongosh --eval "db.adminCommand('ping')"`

### Log Monitoring
```bash
# View all logs
./docker-manage.sh logs production

# View specific service logs
./docker-manage.sh logs production backend --follow

# View error logs only
docker-compose logs --tail=100 | grep -i error
```

### Performance Monitoring
```bash
# Check resource usage
docker stats

# Check disk usage
df -h

# Check memory usage
free -h
```

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check Docker daemon
docker info

# Check port conflicts
netstat -tulpn | grep :3000

# Check logs
./docker-manage.sh logs production backend
```

#### Database Connection Issues
```bash
# Check MongoDB status
docker exec safepsy-mongodb mongosh --eval "db.adminCommand('ping')"

# Check network connectivity
docker network ls
docker network inspect safepsy-network
```

#### Frontend Build Issues
```bash
# Clear npm cache
cd frontend && npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Emergency Procedures

#### Quick Service Restart
```bash
# Restart specific service
docker-compose restart backend

# Restart all services
./docker-manage.sh restart production
```

#### Database Recovery
```bash
# Restore from backup
./docker-manage.sh restore safepsy_backup_20240101_120000.tar.gz production
```

## Post-Deployment Tasks

### 1. Verification Checklist
- [ ] All services running
- [ ] Health checks passing
- [ ] SSL certificates valid
- [ ] Database connectivity confirmed
- [ ] API endpoints responding
- [ ] Frontend accessible
- [ ] Smart contracts deployed and verified

### 2. Monitoring Setup
- [ ] Log aggregation configured
- [ ] Alerting rules active
- [ ] Performance metrics collected
- [ ] Error tracking enabled

### 3. Documentation Update
- [ ] Deployment notes recorded
- [ ] Configuration changes documented
- [ ] Known issues logged
- [ ] Performance baselines established

## Rollback Procedures

If deployment fails, refer to the [Rollback Runbook](./rollback.md) for detailed rollback procedures.

## Security Considerations

### Pre-Deployment Security
- [ ] Environment variables secured
- [ ] SSL certificates valid
- [ ] Firewall rules configured
- [ ] Access controls in place
- [ ] Security headers enabled

### Post-Deployment Security
- [ ] Security scan completed
- [ ] Penetration testing scheduled
- [ ] Access logs monitored
- [ ] Vulnerability assessment planned

## Contact Information

### Emergency Contacts
- **DevOps Lead**: devops@safepsy.com
- **Security Team**: security@safepsy.com
- **On-Call Engineer**: +1-XXX-XXX-XXXX

### Escalation Procedures
1. **Level 1**: Development team
2. **Level 2**: DevOps team
3. **Level 3**: Security team
4. **Level 4**: Executive team

---

**Last Updated**: $(date)
**Version**: 1.0
**Next Review**: $(date -d "+3 months")
