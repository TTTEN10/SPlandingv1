# SafePsy Shadcn MCP Server Integration

This document describes the Model Context Protocol (MCP) server integration for managing shadcn/ui components in the SafePsy platform. The MCP server enables programmatic component management, automated UI development, and seamless integration with AI assistants.

## Overview

The SafePsy MCP server provides a comprehensive solution for managing shadcn/ui components programmatically. It enables developers and AI assistants to add, manage, and retrieve UI components without manual intervention, streamlining the development process.

## Architecture

### Core Components
- **MCP Server**: Node.js server implementing MCP protocol
- **Component Manager**: Handles shadcn/ui component operations
- **File System Interface**: Manages component files and configurations
- **Configuration Handler**: Manages shadcn/ui project setup
- **TypeScript Integration**: Full TypeScript support for type safety

### Supported Operations
- **add_component**: Add new shadcn/ui components
- **list_components**: List available components in the project
- **init_shadcn**: Initialize shadcn/ui configuration
- **get_component_code**: Retrieve component source code
- **update_component**: Update existing components
- **remove_component**: Remove components from project

## Installation and Setup

### Prerequisites
- Node.js 18+
- npm 8+
- Git
- Access to shadcn/ui registry

### 1. Install MCP Server Dependencies
```bash
cd mcp-server
npm install
```

### 2. Configure MCP Server
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
        "LOG_LEVEL": "info",
        "COMPONENT_REGISTRY_URL": "https://ui.shadcn.com"
      }
    }
  }
}
EOF
```

### 3. Initialize Frontend Project
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

### 4. Start MCP Server
```bash
cd mcp-server

# Development mode
npm run dev

# Production mode
npm start
```

## Available Scripts

### MCP Server
- `npm start` - Start production server
- `npm run dev` - Development mode with file watching
- `npm test` - Run tests
- `npm run lint` - Code linting

### Frontend Integration
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Code linting

## MCP Server Tools

### 1. add_component
Adds a new shadcn/ui component to the project.

**Parameters:**
- `component` (string): Component name (e.g., "button", "card", "input")
- `projectPath` (string): Path to the frontend project

**Example:**
```bash
curl -X POST http://localhost:3000/mcp/tools/add_component \
  -H "Content-Type: application/json" \
  -d '{
    "component": "button",
    "projectPath": "/path/to/frontend"
  }'
```

### 2. list_components
Lists all available components in the project.

**Parameters:**
- `projectPath` (string): Path to the frontend project

**Example:**
```bash
curl -X POST http://localhost:3000/mcp/tools/list_components \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/path/to/frontend"
  }'
```

### 3. init_shadcn
Initializes shadcn/ui configuration in a new project.

**Parameters:**
- `projectPath` (string): Path to the frontend project

**Example:**
```bash
curl -X POST http://localhost:3000/mcp/tools/init_shadcn \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/path/to/frontend"
  }'
```

### 4. get_component_code
Retrieves the source code for a specific component.

**Parameters:**
- `component` (string): Component name
- `projectPath` (string): Path to the frontend project

**Example:**
```bash
curl -X POST http://localhost:3000/mcp/tools/get_component_code \
  -H "Content-Type: application/json" \
  -d '{
    "component": "button",
    "projectPath": "/path/to/frontend"
  }'
```

### 5. update_component
Updates an existing component with the latest version.

**Parameters:**
- `component` (string): Component name
- `projectPath` (string): Path to the frontend project

### 6. remove_component
Removes a component from the project.

**Parameters:**
- `component` (string): Component name
- `projectPath` (string): Path to the frontend project

### 3. Configuration

The MCP server configuration is stored in `mcp-config.json`:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "node",
      "args": ["/Users/thibauttenenbaum/Desktop/SPv3.4/mcp-server/index.js"],
      "env": {}
    }
  }
}
```

## Usage

### Running the MCP Server

```bash
cd mcp-server
npm start
```

### Using with AI Assistants

The MCP server can be integrated with AI assistants that support the Model Context Protocol. The server provides tools for:

- Automatically adding components when requested
- Managing component libraries
- Retrieving component code for analysis
- Initializing shadcn/ui in new projects

### Manual Component Addition

You can also manually add components using the shadcn CLI:

```bash
cd frontend
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── button.jsx
│   │   │       └── [other components]
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── App.js
│   │   └── index.css
│   ├── components.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── mcp-server/
│   ├── index.js
│   └── package.json
└── mcp-config.json
```

## Example Usage

The App.js file demonstrates the integration with shadcn/ui components:

```jsx
import { Button } from './components/ui/button';

// Different button variants
<Button>Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="destructive">Destructive Button</Button>
<Button size="lg">Large Button</Button>
```

## Security Considerations

### Access Control
- **Authentication**: Secure MCP server access
- **Authorization**: Role-based component management
- **Path Validation**: Prevent directory traversal attacks
- **Input Sanitization**: Validate all component names and paths

### File System Security
- **Permission Validation**: Check file system permissions
- **Path Restrictions**: Limit operations to project directories
- **Backup Creation**: Automatic backups before modifications
- **Rollback Support**: Ability to revert changes

### Network Security
- **HTTPS**: Secure communication in production
- **Rate Limiting**: Prevent abuse and DoS attacks
- **Input Validation**: Comprehensive parameter validation
- **Error Handling**: Secure error messages

## Monitoring and Maintenance

### Health Monitoring
- **Service Health**: MCP server status monitoring
- **Component Status**: Component availability tracking
- **Performance Metrics**: Response time and throughput
- **Error Tracking**: Comprehensive error logging

### Maintenance Procedures
- **Regular Updates**: Keep components up to date
- **Security Patches**: Apply security updates promptly
- **Performance Optimization**: Monitor and optimize performance
- **Documentation Updates**: Keep documentation current

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
