# SafePsy MCP Server

## 🚀 Overview

The SafePsy MCP (Model Context Protocol) Server is a specialized service that provides programmatic access to shadcn/ui components for the SafePsy platform. It enables automated component management, generation, and integration across the SafePsy ecosystem.

## 🛠 Tech Stack

### Core Technologies
- **Node.js 18+** - JavaScript runtime
- **TypeScript** - Type safety (optional)
- **Express.js** - Web application framework
- **MCP Protocol** - Model Context Protocol implementation

### Component Management
- **shadcn/ui** - Component library integration
- **Radix UI** - Component primitives
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library

### Development Tools
- **Nodemon** - Development server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
mcp-server/
├── src/
│   ├── index.js           # Main MCP server
│   ├── components/        # Component definitions
│   │   ├── button.js      # Button component
│   │   ├── card.js        # Card component
│   │   ├── input.js       # Input component
│   │   └── ...            # Other components
│   ├── utils/             # Utility functions
│   │   ├── generator.js   # Component generator
│   │   ├── validator.js   # Component validator
│   │   └── formatter.js   # Code formatter
│   └── templates/         # Component templates
│       ├── component.template.js
│       ├── story.template.js
│       └── test.template.js
├── package.json           # Dependencies and scripts
├── nodemon.json           # Nodemon configuration
└── README.md              # This file
```

## 🔧 Key Features

### Component Management
- **Component Generation**: Automated component creation
- **Template System**: Reusable component templates
- **Validation**: Component structure validation
- **Formatting**: Code formatting and styling

### MCP Protocol Support
- **Tool Definitions**: MCP tool definitions for components
- **Resource Management**: Component resource management
- **Prompt Templates**: Predefined prompt templates
- **Integration**: Seamless integration with AI models

### shadcn/ui Integration
- **Component Library**: Full shadcn/ui component support
- **Custom Components**: SafePsy-specific components
- **Theme Integration**: Tailwind CSS theme support
- **Icon Integration**: Lucide React icon support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

1. **Install dependencies**
   ```bash
   cd SPv4/mcp-server
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```

3. **Configure environment**
   ```bash
   # .env
   PORT=3004
   NODE_ENV=development
   COMPONENT_LIBRARY_PATH=./src/components
   TEMPLATE_PATH=./src/templates
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **MCP Server will be available at**
   ```
   http://localhost:3004
   ```

## 📋 Available Scripts

### Development
```bash
npm run dev              # Start with nodemon
npm start                # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
```

### Component Management
```bash
npm run generate:component # Generate new component
npm run validate:components # Validate all components
npm run format:components   # Format all components
```

## 🔧 MCP Protocol Implementation

### Tool Definitions
```javascript
// Tool definitions for MCP
const tools = [
  {
    name: "generate_component",
    description: "Generate a new shadcn/ui component",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Component name"
        },
        type: {
          type: "string",
          enum: ["button", "card", "input", "form"],
          description: "Component type"
        },
        props: {
          type: "object",
          description: "Component properties"
        }
      },
      required: ["name", "type"]
    }
  },
  {
    name: "validate_component",
    description: "Validate component structure",
    inputSchema: {
      type: "object",
      properties: {
        componentPath: {
          type: "string",
          description: "Path to component file"
        }
      },
      required: ["componentPath"]
    }
  }
]
```

### Resource Management
```javascript
// Resource definitions
const resources = [
  {
    uri: "component://button",
    name: "Button Component",
    description: "shadcn/ui Button component",
    mimeType: "application/javascript"
  },
  {
    uri: "component://card",
    name: "Card Component",
    description: "shadcn/ui Card component",
    mimeType: "application/javascript"
  }
]
```

### Prompt Templates
```javascript
// Prompt templates for AI integration
const promptTemplates = [
  {
    name: "component_generation",
    template: `Generate a ${componentType} component with the following specifications:
    - Name: ${componentName}
    - Props: ${JSON.stringify(props)}
    - Style: ${style}
    - Accessibility: ${accessibility}
    
    Use shadcn/ui patterns and Tailwind CSS for styling.`
  },
  {
    name: "component_validation",
    template: `Validate the following component:
    ${componentCode}
    
    Check for:
    - TypeScript types
    - Accessibility attributes
    - Tailwind CSS classes
    - shadcn/ui patterns
    - Error handling`
  }
]
```

## 🎨 Component Generation

### Component Generator
```javascript
// Component generator utility
class ComponentGenerator {
  constructor(templatePath, outputPath) {
    this.templatePath = templatePath
    this.outputPath = outputPath
  }

  async generateComponent(name, type, props = {}) {
    const template = await this.loadTemplate(type)
    const componentCode = this.renderTemplate(template, {
      name,
      type,
      props: JSON.stringify(props, null, 2)
    })

    const filePath = path.join(this.outputPath, `${name}.tsx`)
    await fs.writeFile(filePath, componentCode)
    
    return {
      success: true,
      filePath,
      componentCode
    }
  }

  async loadTemplate(type) {
    const templatePath = path.join(this.templatePath, `${type}.template.js`)
    return await fs.readFile(templatePath, 'utf8')
  }

  renderTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match
    })
  }
}
```

### Component Templates
```javascript
// Button component template
const buttonTemplate = `import React from 'react'
import { Button } from '@/components/ui/button'
import { {{props}} } from './types'

interface {{name}}Props {
  {{props}}
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function {{name}}({
  {{props}},
  onClick,
  disabled = false,
  variant = 'default',
  size = 'default'
}: {{name}}Props) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      className="w-full"
    >
      {{children}}
    </Button>
  )
}
`
```

## 🔒 Security Features

### Input Validation
```javascript
// Input validation for component generation
const validateComponentInput = (input) => {
  const schema = Joi.object({
    name: Joi.string()
      .pattern(/^[A-Z][a-zA-Z0-9]*$/)
      .required()
      .messages({
        'string.pattern.base': 'Component name must start with uppercase letter and contain only alphanumeric characters'
      }),
    type: Joi.string()
      .valid('button', 'card', 'input', 'form', 'modal', 'table')
      .required(),
    props: Joi.object().optional()
  })

  const { error } = schema.validate(input)
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`)
  }

  return true
}
```

### Access Control
```javascript
// Access control for MCP operations
const checkAccess = (request) => {
  const apiKey = request.headers['x-api-key']
  const validApiKeys = process.env.API_KEYS?.split(',') || []
  
  if (!validApiKeys.includes(apiKey)) {
    throw new Error('Unauthorized access')
  }
  
  return true
}
```

## 🧪 Testing

### Unit Testing
```javascript
// Component generator tests
describe('ComponentGenerator', () => {
  test('should generate button component', async () => {
    const generator = new ComponentGenerator('./templates', './output')
    
    const result = await generator.generateComponent('TestButton', 'button', {
      text: 'Click me',
      variant: 'primary'
    })
    
    expect(result.success).toBe(true)
    expect(result.filePath).toContain('TestButton.tsx')
    expect(result.componentCode).toContain('export function TestButton')
  })
})
```

### Integration Testing
```javascript
// MCP server integration tests
describe('MCP Server', () => {
  test('should handle generate_component tool', async () => {
    const response = await request(app)
      .post('/mcp/tools/generate_component')
      .send({
        name: 'TestComponent',
        type: 'button',
        props: { text: 'Test' }
      })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.componentCode).toContain('TestComponent')
  })
})
```

## 🚀 Deployment

### Production Build
```bash
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

# Expose port
EXPOSE 3004

# Start application
CMD ["npm", "start"]
```

### Environment Configuration
```bash
# Production environment variables
PORT=3004
NODE_ENV=production
COMPONENT_LIBRARY_PATH=/app/components
TEMPLATE_PATH=/app/templates
API_KEYS=key1,key2,key3
```

## 📊 Monitoring & Logging

### Request Logging
```javascript
// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    console.log({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    })
  })
  
  next()
}
```

### Error Handling
```javascript
// Error handling middleware
const errorHandler = (error, req, res, next) => {
  console.error('MCP Server Error:', error)
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  })
}
```

## 🔧 Configuration

### Package Configuration
```json
// package.json
{
  "name": "@safepsy/mcp-server",
  "version": "1.0.0",
  "description": "MCP server for SafePsy component management",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "lint": "eslint src --ext .js",
    "lint:fix": "eslint src --ext .js --fix",
    "format": "prettier --write src/**/*.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "joi": "^17.9.0",
    "helmet": "^7.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### Nodemon Configuration
```json
// nodemon.json
{
  "watch": ["src"],
  "ext": "js,json",
  "ignore": ["src/**/*.test.js"],
  "exec": "node src/index.js"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Component Generation Failures**
   ```bash
   # Check template files
   ls -la src/templates/
   
   # Verify output directory permissions
   chmod 755 src/components
   ```

2. **MCP Protocol Errors**
   ```bash
   # Check MCP configuration
   curl http://localhost:3004/mcp/tools
   
   # Verify tool definitions
   curl http://localhost:3004/mcp/resources
   ```

3. **Port Conflicts**
   ```bash
   # Change port in .env
   PORT=3005
   ```

## 📚 Resources

### Documentation
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Express.js Documentation](https://expressjs.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Component Resources
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Lucide React Documentation](https://lucide.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines
- Follow JavaScript best practices
- Write tests for new features
- Use conventional commits
- Ensure MCP protocol compliance
- Maintain component consistency

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

### Contact Information
- **MCP Team**: mcp@safepsy.com
- **Technical Issues**: tech@safepsy.com
- **Component Issues**: components@safepsy.com

### Emergency Contacts
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Technical Lead**: tech-lead@safepsy.com

---

**SafePsy MCP Server** - Automated Component Management 🤖🎨
