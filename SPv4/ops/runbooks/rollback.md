# SafePsy Rollback Runbook

## Overview

This runbook provides comprehensive rollback procedures for the SafePsy decentralized identity platform. Rollbacks may be necessary due to deployment failures, critical bugs, security vulnerabilities, or performance issues.

## Rollback Scenarios

### Critical Issues Requiring Immediate Rollback
- Service unavailability
- Data corruption
- Security breaches
- Performance degradation (>50% response time increase)
- Database connectivity issues
- SSL certificate failures

### Non-Critical Issues (Planned Rollback)
- Minor bugs with workarounds
- Performance optimizations
- Feature rollbacks
- Configuration changes

## Pre-Rollback Assessment

### 1. Impact Analysis
- [ ] Identify affected services
- [ ] Assess user impact
- [ ] Determine data integrity status
- [ ] Evaluate business continuity requirements
- [ ] Check for data loss risk

### 2. Rollback Strategy Selection
- **Full Rollback**: Complete system revert to previous version
- **Partial Rollback**: Revert specific services only
- **Database Rollback**: Revert database changes only
- **Configuration Rollback**: Revert configuration changes only

### 3. Communication Plan
- [ ] Notify stakeholders
- [ ] Update status page
- [ ] Prepare user communications
- [ ] Alert support team

## Rollback Procedures

### Emergency Rollback (Critical Issues)

#### Step 1: Immediate Response
```bash
# Stop all services immediately
./docker-manage.sh stop production

# Preserve current state for analysis
docker-compose logs > rollback-logs-$(date +%Y%m%d_%H%M%S).log

# Create emergency backup
./docker-manage.sh backup production
```

#### Step 2: Quick Rollback
```bash
# Rollback to previous version
git checkout HEAD~1

# Restore previous configuration
cp config-backup-*.tar.gz .
tar -xzf config-backup-*.tar.gz

# Rebuild and deploy previous version
./docker-manage.sh build production --no-cache
./docker-manage.sh start production
```

#### Step 3: Verification
```bash
# Verify rollback success
./docker-manage.sh health production

# Check critical endpoints
curl -f http://localhost:3000/health
curl -f http://localhost:80

# Monitor logs for errors
./docker-manage.sh logs production --follow
```

### Planned Rollback (Non-Critical Issues)

#### Step 1: Preparation
```bash
# Create rollback point
git tag rollback-$(date +%Y%m%d_%H%M%S)

# Backup current state
./docker-manage.sh backup production
tar -czf rollback-state-$(date +%Y%m%d_%H%M%S).tar.gz \
  backend/.env \
  ai-chatbot/.env \
  nginx/nginx.conf
```

#### Step 2: Gradual Rollback
```bash
# Rollback backend first
git checkout HEAD~1 -- backend/
cd backend && npm run build
docker-compose up -d backend

# Wait and verify
sleep 30
curl -f http://localhost:3000/health

# Rollback frontend
git checkout HEAD~1 -- frontend/
cd frontend && npm run build
docker-compose up -d frontend

# Rollback AI chatbot
git checkout HEAD~1 -- ai-chatbot/
cd ai-chatbot && npm install
docker-compose up -d ai-chatbot
```

### Database Rollback

#### MongoDB Rollback
```bash
# Stop services using database
docker-compose stop backend ai-chatbot

# Restore database from backup
./docker-manage.sh restore safepsy_backup_YYYYMMDD_HHMMSS.tar.gz production

# Restart services
docker-compose start backend ai-chatbot

# Verify data integrity
docker exec safepsy-mongodb mongosh --eval "
  use safepsy;
  db.users.countDocuments();
  db.sessions.countDocuments();
"
```

#### Redis Rollback
```bash
# Clear Redis cache
docker exec safepsy-redis redis-cli FLUSHALL

# Restart Redis
docker-compose restart redis

# Verify Redis connectivity
docker exec safepsy-redis redis-cli ping
```

### Smart Contract Rollback

#### Polygon Amoy Testnet
```bash
cd backend

# Check current contract state
npm run check:amoy:health

# Deploy previous contract version
git checkout HEAD~1 -- contracts/
npm run compile:did
npm run deploy:did:amoy

# Verify rollback
npm run verify:amoy
```

#### Production Mainnet
```bash
# Emergency contract pause (if supported)
npm run pause:contracts

# Deploy previous version
git checkout HEAD~1 -- contracts/
npm run compile:did
npm run deploy:did:polygon

# Verify on Polygonscan
npm run verify:polygon
```

## Service-Specific Rollback

### Frontend Rollback
```bash
cd frontend

# Rollback to previous version
git checkout HEAD~1

# Clear build cache
rm -rf build/ node_modules/

# Reinstall and rebuild
npm install
npm run build

# Deploy previous version
docker-compose up -d frontend
```

### Backend Rollback
```bash
cd backend

# Rollback code
git checkout HEAD~1

# Rollback dependencies
npm install

# Rebuild
npm run build

# Deploy
docker-compose up -d backend

# Verify API endpoints
curl -f http://localhost:3000/health
curl -f http://localhost:3000/api/did/health
```

### AI Chatbot Rollback
```bash
cd ai-chatbot

# Rollback code
git checkout HEAD~1

# Rollback dependencies
npm install

# Deploy
docker-compose up -d ai-chatbot

# Verify
curl -f http://localhost:3001/health
```

## Configuration Rollback

### Environment Variables
```bash
# Restore previous environment
cp backend/.env.backup backend/.env
cp ai-chatbot/.env.backup ai-chatbot/.env

# Restart services
docker-compose restart backend ai-chatbot
```

### Nginx Configuration
```bash
# Restore previous nginx config
cp nginx/nginx.conf.backup nginx/nginx.conf

# Test configuration
docker exec safepsy-nginx nginx -t

# Reload nginx
docker-compose restart nginx
```

### SSL Certificates
```bash
# Restore previous certificates
cp nginx/ssl/certificate.crt.backup nginx/ssl/certificate.crt
cp nginx/ssl/private.key.backup nginx/ssl/private.key

# Restart nginx
docker-compose restart nginx

# Verify SSL
openssl s_client -connect localhost:443 -servername safepsy.com
```

## Staging Environment Rollback

### Complete Staging Rollback
```bash
# Stop staging services
./docker-manage.sh stop staging

# Rollback staging code
git checkout HEAD~1

# Rebuild and deploy
./docker-manage.sh build staging --no-cache
./docker-manage.sh start staging

# Verify
./docker-manage.sh health staging
```

### Staging Database Rollback
```bash
# Restore staging database
./docker-manage.sh restore staging_backup_YYYYMMDD_HHMMSS.tar.gz staging

# Restart staging services
./docker-manage.sh start staging
```

## Rollback Verification

### Health Checks
```bash
# Comprehensive health check
./docker-manage.sh health production

# Individual service checks
curl -f http://localhost:3000/health || echo "Backend failed"
curl -f http://localhost:3001/health || echo "AI Chatbot failed"
curl -f http://localhost:80 || echo "Frontend failed"

# Database connectivity
docker exec safepsy-mongodb mongosh --eval "db.adminCommand('ping')"
docker exec safepsy-redis redis-cli ping
```

### Functional Testing
```bash
# Test critical user flows
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@safepsy.com","password":"testpass"}'

# Test DID operations
curl -X GET http://localhost:3000/api/did/health

# Test AI chatbot
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

### Performance Verification
```bash
# Check response times
time curl -f http://localhost:3000/health
time curl -f http://localhost:80

# Monitor resource usage
docker stats --no-stream

# Check error rates
./docker-manage.sh logs production | grep -i error | wc -l
```

## Post-Rollback Tasks

### 1. Immediate Actions
- [ ] Verify all services operational
- [ ] Confirm data integrity
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Update status page

### 2. Root Cause Analysis
- [ ] Analyze rollback logs
- [ ] Identify failure points
- [ ] Document lessons learned
- [ ] Update deployment procedures
- [ ] Schedule post-mortem meeting

### 3. Communication
- [ ] Notify stakeholders of resolution
- [ ] Update user communications
- [ ] Document incident timeline
- [ ] Share findings with team

### 4. Prevention Measures
- [ ] Update monitoring alerts
- [ ] Enhance testing procedures
- [ ] Improve deployment automation
- [ ] Strengthen rollback procedures

## Rollback Decision Matrix

| Issue Severity | Impact | Rollback Type | Timeline |
|----------------|--------|---------------|----------|
| Critical | Service Down | Emergency | < 5 minutes |
| High | Major Bugs | Planned | < 30 minutes |
| Medium | Minor Issues | Partial | < 2 hours |
| Low | Performance | Configuration | < 4 hours |

## Rollback Automation

### Automated Rollback Script
```bash
#!/bin/bash
# auto-rollback.sh

set -e

BACKUP_FILE=$1
ENVIRONMENT=${2:-production}

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file> [environment]"
    exit 1
fi

echo "Starting automated rollback..."
echo "Backup: $BACKUP_FILE"
echo "Environment: $ENVIRONMENT"

# Stop services
./docker-manage.sh stop $ENVIRONMENT

# Restore database
./docker-manage.sh restore $BACKUP_FILE $ENVIRONMENT

# Rollback code
git checkout HEAD~1

# Rebuild and deploy
./docker-manage.sh build $ENVIRONMENT --no-cache
./docker-manage.sh start $ENVIRONMENT

# Verify
./docker-manage.sh health $ENVIRONMENT

echo "Rollback completed successfully"
```

## Monitoring During Rollback

### Key Metrics to Monitor
- Service availability
- Response times
- Error rates
- Database connectivity
- Resource usage
- User impact

### Alert Thresholds
- Service down: Immediate alert
- Response time > 2s: Warning
- Error rate > 5%: Critical
- Database errors: Critical
- Memory usage > 90%: Warning

## Emergency Contacts

### Escalation Chain
1. **On-Call Engineer**: +1-XXX-XXX-XXXX
2. **DevOps Lead**: devops@safepsy.com
3. **Security Team**: security@safepsy.com
4. **Executive Team**: exec@safepsy.com

### Communication Channels
- **Slack**: #safepsy-incidents
- **PagerDuty**: Critical alerts
- **Email**: incidents@safepsy.com
- **Status Page**: status.safepsy.com

## Rollback Testing

### Regular Rollback Drills
- Monthly rollback exercises
- Quarterly disaster recovery tests
- Annual business continuity drills

### Test Scenarios
- Service failure rollback
- Database corruption recovery
- Configuration rollback
- Smart contract rollback

## Documentation Updates

After each rollback:
- [ ] Update this runbook
- [ ] Document new procedures
- [ ] Update troubleshooting guides
- [ ] Revise monitoring alerts
- [ ] Update contact information

---

**Last Updated**: $(date)
**Version**: 1.0
**Next Review**: $(date -d "+3 months")
**Approved By**: DevOps Lead
