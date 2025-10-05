# SafePsy Operations Runbooks Index

## Overview

This directory contains comprehensive operational runbooks for the SafePsy decentralized identity platform. These runbooks provide step-by-step procedures for deployment, maintenance, troubleshooting, and emergency response.

## Runbook Structure

### Core Operations
- **[Deployment Runbook](./deploy.md)** - Complete deployment procedures for all environments
- **[Rollback Runbook](./rollback.md)** - Emergency and planned rollback procedures
- **[Smart Contract Staging](./smart-contract-staging.md)** - Smart contract testing and deployment
- **[Shadcn MCP Server](./shadcn-mcp-server.md)** - MCP server operations and management
- **[Observability Boards](./observability-boards.md)** - Monitoring and alerting setup

## Quick Reference

### Emergency Procedures
| Issue | Runbook | Section | Contact |
|-------|---------|---------|---------|
| Service Down | [Rollback](./rollback.md) | Emergency Rollback | +1-XXX-XXX-XXXX |
| Security Breach | [Deployment](./deploy.md) | Security Considerations | security@safepsy.com |
| Data Corruption | [Rollback](./rollback.md) | Database Rollback | devops@safepsy.com |
| Performance Issues | [Observability](./observability-boards.md) | Troubleshooting | monitoring@safepsy.com |

### Deployment Procedures
| Environment | Runbook | Section | Timeline |
|-------------|---------|---------|----------|
| Production | [Deployment](./deploy.md) | Production Deployment | 30-60 minutes |
| Staging | [Deployment](./deploy.md) | Staging Deployment | 15-30 minutes |
| Smart Contracts | [Smart Contract](./smart-contract-staging.md) | Production Deployment | 20-40 minutes |
| MCP Server | [MCP Server](./shadcn-mcp-server.md) | Production Deployment | 10-20 minutes |

## Service Architecture

### Core Services
- **Frontend**: React application (Port 80/8080)
- **Backend**: Node.js/TypeScript API (Port 3000/3002)
- **AI Chatbot**: AI-powered therapy assistant (Port 3001/3003)
- **MongoDB**: Primary database (Port 27017/27018)
- **Redis**: Caching layer (Port 6379/6380)
- **Nginx**: Reverse proxy and SSL termination (Port 443)

### Supporting Services
- **MCP Server**: Shadcn component management (Port 3004)
- **Prometheus**: Metrics collection (Port 9090)
- **Grafana**: Visualization (Port 3001)
- **Elasticsearch**: Log storage (Port 9200)
- **Kibana**: Log visualization (Port 5601)
- **Jaeger**: Distributed tracing (Port 16686)

## Environment Overview

### Production Environment
- **Docker Compose**: `docker-compose.yml`
- **Ports**: 80, 3000, 3001, 27017, 6379, 443
- **Database**: `safepsy` (MongoDB)
- **Network**: `safepsy-network`

### Staging Environment
- **Docker Compose**: `docker-compose.staging.yml`
- **Ports**: 8080, 3002, 3003, 27018, 6380
- **Database**: `safepsy_staging` (MongoDB)
- **Network**: `safepsy-staging-network`

### Smart Contract Networks
- **Polygon Amoy**: Primary testnet (Chain ID: 80002)
- **Polygon Mainnet**: Production network (Chain ID: 137)
- **Ethereum Sepolia**: Ethereum testnet (Chain ID: 11155111)

## Operational Procedures

### Daily Operations
1. **Health Checks**: Monitor service status and performance
2. **Log Review**: Check for errors and anomalies
3. **Backup Verification**: Ensure backups are successful
4. **Security Monitoring**: Review security alerts and logs

### Weekly Operations
1. **Performance Review**: Analyze metrics and optimize
2. **Dependency Updates**: Check for security updates
3. **Capacity Planning**: Review resource utilization
4. **Documentation Updates**: Update runbooks and procedures

### Monthly Operations
1. **Security Audit**: Comprehensive security review
2. **Disaster Recovery Test**: Test backup and recovery procedures
3. **Performance Optimization**: Review and optimize system performance
4. **Compliance Review**: Ensure regulatory compliance

## Monitoring and Alerting

### Key Metrics
- **Availability**: Service uptime and health
- **Performance**: Response times and throughput
- **Security**: Authentication failures and suspicious activity
- **Business**: User registrations and DID creation rates

### Alert Thresholds
- **Critical**: Service down, security breach, data loss
- **Warning**: Performance degradation, resource limits
- **Info**: Maintenance notifications, status updates

### Monitoring Tools
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **ELK Stack**: Log aggregation and analysis
- **Jaeger**: Distributed tracing

## Security Considerations

### Access Control
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Regular access reviews and rotation
- Principle of least privilege

### Data Protection
- Encryption at rest and in transit
- Regular security audits
- Vulnerability scanning
- Incident response procedures

### Compliance
- RGPD compliance
- ISO 27001 standards
- APA guidelines
- EFPA requirements

## Emergency Contacts

### Escalation Chain
1. **Level 1**: On-Call Engineer (+1-XXX-XXX-XXXX)
2. **Level 2**: DevOps Lead (devops@safepsy.com)
3. **Level 3**: Security Team (security@safepsy.com)
4. **Level 4**: Executive Team (exec@safepsy.com)

### Communication Channels
- **Slack**: #safepsy-incidents
- **PagerDuty**: Critical alerts
- **Email**: incidents@safepsy.com
- **Status Page**: status.safepsy.com

## Training and Certification

### Required Training
- Docker and containerization
- Kubernetes orchestration
- Monitoring and observability
- Security best practices
- Emergency response procedures

### Certification Requirements
- AWS/Azure cloud certification
- Security certifications (CISSP, CISM)
- DevOps certifications (AWS DevOps, Azure DevOps)
- Blockchain and smart contract knowledge

## Documentation Standards

### Runbook Requirements
- Clear step-by-step procedures
- Prerequisites and dependencies
- Troubleshooting sections
- Contact information
- Regular review and updates

### Version Control
- Git-based documentation
- Regular review cycles
- Change approval process
- Version numbering system

## Compliance and Auditing

### Audit Requirements
- Regular security audits
- Compliance assessments
- Performance reviews
- Documentation audits

### Audit Trail
- All changes logged
- Access control monitoring
- Performance metrics tracking
- Incident documentation

## Continuous Improvement

### Process Improvement
- Regular runbook reviews
- Incident post-mortems
- Performance optimization
- Automation opportunities

### Technology Updates
- Regular dependency updates
- Security patch management
- Performance optimization
- New technology evaluation

---

**Last Updated**: $(date)
**Version**: 1.0
**Next Review**: $(date -d "+3 months")
**Approved By**: DevOps Lead
**Maintained By**: SafePsy Operations Team
