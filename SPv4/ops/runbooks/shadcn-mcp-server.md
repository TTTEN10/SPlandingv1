# SafePsy Shadcn MCP Server Runbook

## Overview

This runbook provides comprehensive operational procedures for the SafePsy Shadcn MCP (Model Context Protocol) Server. The MCP server enables programmatic management of shadcn/ui components in React applications, providing tools for component addition, listing, initialization, and code retrieval.

## MCP Server Architecture

### Core Components
- **MCP Server**: Node.js server implementing MCP protocol
- **Component Manager**: Handles shadcn/ui component operations
- **File System Interface**: Manages component files and configurations
- **Configuration Handler**: Manages shadcn/ui project setup

### Supported Operations
- **add_component**: Add new shadcn/ui components
- **list_components**: List available components
- **init_shadcn**: Initialize shadcn/ui configuration
- **get_component_code**: Retrieve component source code

## Prerequisites

### Development Environment
- Node.js 18+
- npm 8+
- Git
- Access to shadcn/ui registry

### Required Dependencies
```json
{
  "@modelcontextprotocol/sdk": "^0.5.0",
  "fs-extra": "^11.1.1",
  "path": "^0.12.7",
  "glob": "^10.3.10"
}
```

### Project Structure Requirements
```
frontend/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   ├── lib/
│   │   └── utils.js      # Utility functions
│   └── App.js
├── components.json        # shadcn/ui configuration
├── tailwind.config.js    # Tailwind configuration
└── postcss.config.js     # PostCSS configuration
```

## Installation and Setup

### Step 1: Install Dependencies
```bash
cd mcp-server
npm install

# Verify installation
npm list @modelcontextprotocol/sdk
```

### Step 2: Configure MCP Server
```bash
# Update mcp-config.json
cat > mcp-config.json << EOF
{
  "mcpServers": {
    "shadcn": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
EOF
```

### Step 3: Initialize Frontend Project
```bash
cd frontend

# Install shadcn/ui dependencies
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Verify setup
ls -la components.json
ls -la src/lib/utils.js
```

## MCP Server Operations

### Starting the MCP Server

#### Development Mode
```bash
cd mcp-server
npm run dev

# Server starts with file watching
# Logs: MCP Server started on port 3000
```

#### Production Mode
```bash
cd mcp-server
npm start

# Server starts in production mode
# Logs: MCP Server running in production mode
```

### Component Management Operations

#### Adding Components
```bash
# Add a button component
curl -X POST http://localhost:3000/mcp/tools/add_component \
  -H "Content-Type: application/json" \
  -d '{
    "component": "button",
    "projectPath": "/path/to/frontend"
  }'

# Add multiple components
curl -X POST http://localhost:3000/mcp/tools/add_component \
  -H "Content-Type: application/json" \
  -d '{
    "component": "card",
    "projectPath": "/path/to/frontend"
  }'
```

#### Listing Components
```bash
# List all components
curl -X POST http://localhost:3000/mcp/tools/list_components \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/path/to/frontend"
  }'
```

#### Getting Component Code
```bash
# Get component source code
curl -X POST http://localhost:3000/mcp/tools/get_component_code \
  -H "Content-Type: application/json" \
  -d '{
    "component": "button",
    "projectPath": "/path/to/frontend"
  }'
```

#### Initializing Shadcn
```bash
# Initialize shadcn/ui configuration
curl -X POST http://localhost:3000/mcp/tools/init_shadcn \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/path/to/frontend"
  }'
```

## Deployment Procedures

### Local Development Deployment

#### Step 1: Start MCP Server
```bash
cd mcp-server
npm run dev

# Verify server is running
curl -f http://localhost:3000/health
```

#### Step 2: Configure Frontend Integration
```bash
cd frontend

# Ensure components.json exists
cat components.json

# Verify UI components directory
ls -la src/components/ui/

# Test component import
node -e "console.log(require('./src/components/ui/button.jsx'))"
```

### Production Deployment

#### Step 1: Build MCP Server
```bash
cd mcp-server
npm run build

# Verify build
ls -la dist/
```

#### Step 2: Deploy with Docker
```bash
# Create Dockerfile for MCP server
cat > mcp-server/Dockerfile << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Build and run
docker build -t safepsy-mcp-server .
docker run -d -p 3000:3000 --name safepsy-mcp-server safepsy-mcp-server
```

#### Step 3: Integrate with Main Application
```bash
# Update docker-compose.yml
cat >> docker-compose.yml << EOF

  # MCP Server
  mcp-server:
    build:
      context: ./mcp-server
      dockerfile: Dockerfile
    container_name: safepsy-mcp-server
    restart: unless-stopped
    ports:
      - "3004:3000"
    networks:
      - safepsy-network
EOF

# Deploy
docker-compose up -d mcp-server
```

## Monitoring and Health Checks

### Health Check Endpoints
```bash
# Basic health check
curl -f http://localhost:3000/health

# Detailed status
curl -f http://localhost:3000/status

# Component registry status
curl -f http://localhost:3000/components/status
```

### Log Monitoring
```bash
# View MCP server logs
docker logs safepsy-mcp-server

# Follow logs
docker logs -f safepsy-mcp-server

# Check for errors
docker logs safepsy-mcp-server | grep -i error
```

### Performance Monitoring
```bash
# Check resource usage
docker stats safepsy-mcp-server

# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/health

# Check component operations
curl -X POST http://localhost:3000/mcp/tools/list_components \
  -H "Content-Type: application/json" \
  -d '{"projectPath": "/path/to/frontend"}' \
  -w "@curl-format.txt" -o /dev/null -s
```

## Troubleshooting

### Common Issues

#### MCP Server Won't Start
```bash
# Check Node.js version
node --version

# Check dependencies
npm list

# Check port availability
netstat -tulpn | grep :3000

# Check logs
npm run dev
```

#### Component Addition Failures
```bash
# Verify project path
ls -la /path/to/frontend

# Check components.json
cat /path/to/frontend/components.json

# Verify UI directory
ls -la /path/to/frontend/src/components/ui/

# Check permissions
ls -la /path/to/frontend/src/components/
```

#### Configuration Issues
```bash
# Verify components.json format
cat frontend/components.json | jq .

# Check Tailwind configuration
cat frontend/tailwind.config.js

# Verify PostCSS configuration
cat frontend/postcss.config.js
```

### Error Resolution

#### Component Not Found
```bash
# List available components
curl -X POST http://localhost:3000/mcp/tools/list_components \
  -H "Content-Type: application/json" \
  -d '{"projectPath": "/path/to/frontend"}'

# Check shadcn/ui registry
curl -f https://ui.shadcn.com/api/components

# Reinitialize shadcn
curl -X POST http://localhost:3000/mcp/tools/init_shadcn \
  -H "Content-Type: application/json" \
  -d '{"projectPath": "/path/to/frontend"}'
```

#### File System Errors
```bash
# Check file permissions
ls -la /path/to/frontend/src/components/ui/

# Fix permissions
chmod -R 755 /path/to/frontend/src/components/

# Check disk space
df -h
```

## Security Considerations

### Access Control
- [ ] Restrict MCP server access to authorized users
- [ ] Implement authentication for MCP operations
- [ ] Validate project paths to prevent directory traversal
- [ ] Sanitize component names and parameters

### File System Security
- [ ] Validate file operations
- [ ] Prevent arbitrary file creation
- [ ] Implement path validation
- [ ] Use secure file permissions

### Network Security
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Validate input parameters
- [ ] Monitor for suspicious activity

## Performance Optimization

### Server Optimization
```bash
# Enable clustering for production
npm install cluster

# Configure memory limits
node --max-old-space-size=4096 index.js

# Enable compression
npm install compression
```

### Component Management Optimization
```bash
# Cache component registry
npm install node-cache

# Implement lazy loading
npm install lazy-load

# Optimize file operations
npm install fast-glob
```

## Backup and Recovery

### Configuration Backup
```bash
# Backup MCP configuration
tar -czf mcp-config-backup-$(date +%Y%m%d_%H%M%S).tar.gz \
  mcp-config.json \
  mcp-server/package.json \
  mcp-server/index.js

# Backup frontend configuration
tar -czf frontend-config-backup-$(date +%Y%m%d_%H%M%S).tar.gz \
  frontend/components.json \
  frontend/tailwind.config.js \
  frontend/postcss.config.js
```

### Component Backup
```bash
# Backup UI components
tar -czf ui-components-backup-$(date +%Y%m%d_%H%M%S).tar.gz \
  frontend/src/components/ui/

# Backup utility functions
tar -czf utils-backup-$(date +%Y%m%d_%H%M%S).tar.gz \
  frontend/src/lib/utils.js
```

### Recovery Procedures
```bash
# Restore MCP configuration
tar -xzf mcp-config-backup-YYYYMMDD_HHMMSS.tar.gz

# Restore frontend configuration
tar -xzf frontend-config-backup-YYYYMMDD_HHMMSS.tar.gz

# Restore components
tar -xzf ui-components-backup-YYYYMMDD_HHMMSS.tar.gz

# Restart services
docker-compose restart mcp-server frontend
```

## Testing Procedures

### Unit Testing
```bash
cd mcp-server
npm test

# Run specific tests
npm test -- --grep "add_component"
npm test -- --grep "list_components"
```

### Integration Testing
```bash
# Test MCP server integration
curl -X POST http://localhost:3000/mcp/tools/add_component \
  -H "Content-Type: application/json" \
  -d '{"component": "button", "projectPath": "/tmp/test-project"}'

# Verify component was added
ls -la /tmp/test-project/src/components/ui/
```

### End-to-End Testing
```bash
# Test complete workflow
npm run test:e2e

# Test with real frontend project
npm run test:integration
```

## Maintenance Procedures

### Regular Maintenance Tasks
- [ ] Update MCP SDK dependencies
- [ ] Update shadcn/ui components
- [ ] Review and update configuration
- [ ] Monitor performance metrics
- [ ] Clean up old component versions

### Dependency Updates
```bash
# Update MCP SDK
npm update @modelcontextprotocol/sdk

# Update other dependencies
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

### Component Updates
```bash
# Update shadcn/ui components
npx shadcn-ui@latest add button --overwrite
npx shadcn-ui@latest add card --overwrite

# Verify updates
npm run test:components
```

## Emergency Procedures

### Service Recovery
```bash
# Restart MCP server
docker-compose restart mcp-server

# Check service status
docker-compose ps mcp-server

# Verify functionality
curl -f http://localhost:3000/health
```

### Configuration Recovery
```bash
# Restore from backup
tar -xzf mcp-config-backup-YYYYMMDD_HHMMSS.tar.gz

# Restart services
docker-compose restart mcp-server

# Verify configuration
curl -f http://localhost:3000/status
```

### Component Recovery
```bash
# Restore components from backup
tar -xzf ui-components-backup-YYYYMMDD_HHMMSS.tar.gz

# Reinitialize shadcn
curl -X POST http://localhost:3000/mcp/tools/init_shadcn \
  -H "Content-Type: application/json" \
  -d '{"projectPath": "/path/to/frontend"}'
```

## Contact Information

### Development Team
- **MCP Server Lead**: mcp@safepsy.com
- **Frontend Team**: frontend@safepsy.com
- **DevOps Team**: devops@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **MCP Support**: mcp-support@safepsy.com
- **Technical Lead**: tech-lead@safepsy.com

---

**Last Updated**: $(date)
**Version**: 1.0
**Next Review**: $(date -d "+3 months")
**Approved By**: MCP Server Lead
