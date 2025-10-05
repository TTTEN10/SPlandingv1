# SafePsy Scripts Directory

## 🚀 Overview

The SafePsy Scripts directory contains utility scripts for deployment, database management, and system administration across the SafePsy platform. These scripts provide automated solutions for common operational tasks and ensure consistent deployment procedures.

## 📁 Project Structure

```
scripts/
├── mongo-init.js          # MongoDB initialization script
├── deploy.sh              # Deployment script
├── backup.sh              # Database backup script
├── restore.sh              # Database restore script
├── health-check.sh         # Health check script
├── cleanup.sh              # Cleanup script
└── README.md              # This file
```

## 🔧 Available Scripts

### Database Scripts

#### MongoDB Initialization (`mongo-init.js`)
Initializes MongoDB with required databases, collections, and indexes.

**Usage:**
```bash
node scripts/mongo-init.js
```

**Features:**
- Creates SafePsy databases
- Sets up collections with proper indexes
- Configures user permissions
- Initializes audit collections

**Configuration:**
```javascript
// mongo-init.js configuration
const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    databases: ['safepsy', 'safepsy_staging', 'safepsy_audit'],
    collections: {
      safepsy: ['users', 'dids', 'conversations', 'sessions'],
      safepsy_staging: ['users', 'dids', 'conversations', 'sessions'],
      safepsy_audit: ['access_logs', 'security_events', 'compliance_logs']
    }
  }
}
```

#### Database Backup (`backup.sh`)
Creates automated backups of MongoDB databases.

**Usage:**
```bash
./scripts/backup.sh [environment] [backup_type]
```

**Examples:**
```bash
# Full backup of production database
./scripts/backup.sh production full

# Incremental backup of staging database
./scripts/backup.sh staging incremental

# Schema-only backup
./scripts/backup.sh production schema
```

**Features:**
- Full and incremental backups
- Schema-only backups
- Compressed backup files
- Automated cleanup of old backups
- Backup verification

#### Database Restore (`restore.sh`)
Restores MongoDB databases from backup files.

**Usage:**
```bash
./scripts/restore.sh [backup_file] [environment] [restore_type]
```

**Examples:**
```bash
# Restore full backup to production
./scripts/restore.sh backup_2024-01-01_full.tar.gz production full

# Restore schema to staging
./scripts/restore.sh backup_2024-01-01_schema.tar.gz staging schema
```

**Features:**
- Full and partial restores
- Schema-only restores
- Backup verification before restore
- Rollback capabilities
- Safety checks

### Deployment Scripts

#### Deployment Script (`deploy.sh`)
Automates the deployment process for SafePsy services.

**Usage:**
```bash
./scripts/deploy.sh [environment] [service] [version]
```

**Examples:**
```bash
# Deploy all services to production
./scripts/deploy.sh production all latest

# Deploy specific service to staging
./scripts/deploy.sh staging backend v1.2.3

# Deploy frontend to production
./scripts/deploy.sh production frontend latest
```

**Features:**
- Environment-specific deployments
- Service-specific deployments
- Version management
- Health checks after deployment
- Rollback capabilities
- Blue-green deployments

#### Health Check Script (`health-check.sh`)
Performs comprehensive health checks on SafePsy services.

**Usage:**
```bash
./scripts/health-check.sh [environment] [service]
```

**Examples:**
```bash
# Check all services in production
./scripts/health-check.sh production all

# Check specific service in staging
./scripts/health-check.sh staging backend

# Check database connectivity
./scripts/health-check.sh production database
```

**Features:**
- Service availability checks
- Database connectivity checks
- API endpoint health checks
- Performance metrics
- Security status checks
- Compliance verification

### Maintenance Scripts

#### Cleanup Script (`cleanup.sh`)
Performs system cleanup and maintenance tasks.

**Usage:**
```bash
./scripts/cleanup.sh [task] [environment]
```

**Examples:**
```bash
# Clean up old log files
./scripts/cleanup.sh logs production

# Clean up old backups
./scripts/cleanup.sh backups production

# Clean up temporary files
./scripts/cleanup.sh temp all

# Full cleanup
./scripts/cleanup.sh all production
```

**Features:**
- Log file cleanup
- Backup file cleanup
- Temporary file cleanup
- Docker image cleanup
- Database maintenance
- Disk space optimization

## 🔒 Security Features

### Access Control
```bash
# Script execution permissions
chmod +x scripts/*.sh
chmod 600 scripts/*.env
chmod 700 scripts/backup.sh
chmod 700 scripts/restore.sh
```

### Environment Validation
```bash
# Environment validation in scripts
if [ -z "$ENVIRONMENT" ]; then
  echo "Error: ENVIRONMENT variable is required"
  exit 1
fi

if [ ! -f "scripts/.env.$ENVIRONMENT" ]; then
  echo "Error: Environment file not found: scripts/.env.$ENVIRONMENT"
  exit 1
fi
```

### Audit Logging
```bash
# Audit logging for all script executions
log_script_execution() {
  local script_name=$1
  local environment=$2
  local user=$(whoami)
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
  echo "$timestamp,$user,$script_name,$environment" >> /var/log/safepsy/script_audit.log
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Docker and Docker Compose
- Bash shell
- Required environment variables

### Installation

1. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp scripts/.env.example scripts/.env.production
   cp scripts/.env.example scripts/.env.staging
   cp scripts/.env.example scripts/.env.development
   ```

2. **Configure environment files**
   ```bash
   # scripts/.env.production
   MONGODB_URI=mongodb://admin:password@mongodb:27017/safepsy?authSource=admin
   BACKUP_DIR=/var/backups/safepsy
   LOG_DIR=/var/log/safepsy
   DEPLOY_DIR=/opt/safepsy
   ```

3. **Set script permissions**
   ```bash
   chmod +x scripts/*.sh
   ```

4. **Test script execution**
   ```bash
   ./scripts/health-check.sh development all
   ```

## 📋 Script Documentation

### MongoDB Initialization Script

#### Purpose
Initializes MongoDB databases with required collections, indexes, and user permissions for the SafePsy platform.

#### Configuration
```javascript
// mongo-init.js
const { MongoClient } = require('mongodb')

const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    databases: {
      safepsy: {
        collections: {
          users: {
            indexes: [
              { key: { email: 1 }, unique: true },
              { key: { didHash: 1 }, unique: true },
              { key: { createdAt: 1 } }
            ]
          },
          dids: {
            indexes: [
              { key: { didHash: 1 }, unique: true },
              { key: { owner: 1 } },
              { key: { createdAt: 1 } }
            ]
          },
          conversations: {
            indexes: [
              { key: { userId: 1 } },
              { key: { createdAt: 1 } },
              { key: { encrypted: 1 } }
            ]
          }
        }
      }
    }
  }
}
```

#### Usage Examples
```bash
# Initialize production database
MONGODB_URI=mongodb://admin:password@mongodb:27017/safepsy?authSource=admin node scripts/mongo-init.js

# Initialize staging database
MONGODB_URI=mongodb://admin:password@mongodb-staging:27017/safepsy_staging?authSource=admin node scripts/mongo-init.js
```

### Deployment Script

#### Purpose
Automates the deployment of SafePsy services across different environments with proper health checks and rollback capabilities.

#### Configuration
```bash
# deploy.sh configuration
DEPLOY_CONFIGS=(
  "production:backend:3000:docker-compose.yml"
  "production:frontend:80:docker-compose.yml"
  "production:ai-chatbot:3001:docker-compose.yml"
  "staging:backend:3002:docker-compose.staging.yml"
  "staging:frontend:8080:docker-compose.staging.yml"
)
```

#### Usage Examples
```bash
# Deploy all services to production
./scripts/deploy.sh production all latest

# Deploy specific service
./scripts/deploy.sh production backend v1.2.3

# Deploy with health checks
./scripts/deploy.sh production all latest --health-check

# Deploy with rollback on failure
./scripts/deploy.sh production all latest --rollback-on-failure
```

### Backup Script

#### Purpose
Creates automated backups of MongoDB databases with compression, verification, and cleanup capabilities.

#### Configuration
```bash
# backup.sh configuration
BACKUP_TYPES=("full" "incremental" "schema")
RETENTION_DAYS=30
COMPRESSION_LEVEL=6
VERIFY_BACKUPS=true
```

#### Usage Examples
```bash
# Full backup
./scripts/backup.sh production full

# Incremental backup
./scripts/backup.sh production incremental

# Schema-only backup
./scripts/backup.sh production schema

# Backup with custom retention
./scripts/backup.sh production full --retention-days 60
```

### Health Check Script

#### Purpose
Performs comprehensive health checks on SafePsy services including availability, performance, and security status.

#### Configuration
```bash
# health-check.sh configuration
HEALTH_CHECK_ENDPOINTS=(
  "backend:http://localhost:3000/health"
  "frontend:http://localhost:80/health"
  "ai-chatbot:http://localhost:3001/health"
  "database:mongodb://localhost:27017/safepsy"
)
```

#### Usage Examples
```bash
# Check all services
./scripts/health-check.sh production all

# Check specific service
./scripts/health-check.sh production backend

# Check with detailed output
./scripts/health-check.sh production all --verbose

# Check with performance metrics
./scripts/health-check.sh production all --performance
```

## 🧪 Testing

### Script Testing
```bash
# Test MongoDB initialization
node scripts/mongo-init.js --test

# Test deployment script
./scripts/deploy.sh development all latest --dry-run

# Test backup script
./scripts/backup.sh development full --test

# Test health check script
./scripts/health-check.sh development all --test
```

### Integration Testing
```bash
# Test full deployment pipeline
./scripts/deploy.sh staging all latest
./scripts/health-check.sh staging all
./scripts/backup.sh staging full
```

## 🚀 Deployment

### Production Deployment
```bash
# Production deployment pipeline
./scripts/deploy.sh production all latest
./scripts/health-check.sh production all
./scripts/backup.sh production full
```

### Staging Deployment
```bash
# Staging deployment pipeline
./scripts/deploy.sh staging all latest
./scripts/health-check.sh staging all
```

### Development Setup
```bash
# Development setup
node scripts/mongo-init.js
./scripts/deploy.sh development all latest
./scripts/health-check.sh development all
```

## 📊 Monitoring & Logging

### Script Execution Logging
```bash
# Log all script executions
exec 1> >(tee -a /var/log/safepsy/scripts.log)
exec 2> >(tee -a /var/log/safepsy/scripts_error.log)
```

### Performance Monitoring
```bash
# Monitor script performance
time ./scripts/deploy.sh production all latest
time ./scripts/backup.sh production full
time ./scripts/health-check.sh production all
```

### Audit Trail
```bash
# Create audit trail for all operations
audit_operation() {
  local operation=$1
  local environment=$2
  local user=$(whoami)
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
  echo "$timestamp,$user,$operation,$environment" >> /var/log/safepsy/audit.log
}
```

## 🔧 Configuration

### Environment Configuration
```bash
# scripts/.env.production
MONGODB_URI=mongodb://admin:password@mongodb:27017/safepsy?authSource=admin
BACKUP_DIR=/var/backups/safepsy
LOG_DIR=/var/log/safepsy
DEPLOY_DIR=/opt/safepsy
HEALTH_CHECK_TIMEOUT=30
BACKUP_RETENTION_DAYS=30
```

### Script Configuration
```bash
# scripts/config.sh
export SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
export LOG_FILE="/var/log/safepsy/scripts.log"
export ERROR_LOG_FILE="/var/log/safepsy/scripts_error.log"
```

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Fix script permissions
   chmod +x scripts/*.sh
   chmod 600 scripts/*.env
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB connectivity
   mongosh --eval "db.adminCommand('ping')"
   
   # Check environment variables
   echo $MONGODB_URI
   ```

3. **Backup Failures**
   ```bash
   # Check backup directory permissions
   ls -la /var/backups/safepsy/
   
   # Check disk space
   df -h /var/backups/safepsy/
   ```

4. **Deployment Failures**
   ```bash
   # Check Docker status
   docker ps
   docker-compose ps
   
   # Check service logs
   docker-compose logs backend
   ```

## 📚 Resources

### Documentation
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)

### Best Practices
- [Shell Script Best Practices](https://google.github.io/styleguide/shellguide.html)
- [MongoDB Backup Best Practices](https://docs.mongodb.com/manual/core/backups/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new scripts
5. Submit a pull request

### Development Guidelines
- Follow shell scripting best practices
- Add error handling to all scripts
- Include comprehensive logging
- Ensure security best practices
- Maintain audit trail integrity

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

### Contact Information
- **DevOps Team**: devops@safepsy.com
- **Technical Issues**: tech@safepsy.com
- **Database Issues**: database@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **DevOps Lead**: devops@safepsy.com

---

**SafePsy Scripts** - Automated Operations & Maintenance 🔧🚀
