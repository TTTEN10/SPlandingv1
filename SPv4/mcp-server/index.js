#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ShadcnMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'shadcn-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'add_component',
            description: 'Add a shadcn/ui component to the project',
            inputSchema: {
              type: 'object',
              properties: {
                component: {
                  type: 'string',
                  description: 'Name of the component to add (e.g., button, card, input)',
                },
                projectPath: {
                  type: 'string',
                  description: 'Path to the project root',
                },
              },
              required: ['component', 'projectPath'],
            },
          },
          {
            name: 'list_components',
            description: 'List available shadcn/ui components',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Path to the project root',
                },
              },
              required: ['projectPath'],
            },
          },
          {
            name: 'init_shadcn',
            description: 'Initialize shadcn/ui in a project',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Path to the project root',
                },
              },
              required: ['projectPath'],
            },
          },
          {
            name: 'get_component_code',
            description: 'Get the source code for a specific component',
            inputSchema: {
              type: 'object',
              properties: {
                component: {
                  type: 'string',
                  description: 'Name of the component',
                },
                projectPath: {
                  type: 'string',
                  description: 'Path to the project root',
                },
              },
              required: ['component', 'projectPath'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'add_component':
            return await this.addComponent(args.component, args.projectPath);
          case 'list_components':
            return await this.listComponents(args.projectPath);
          case 'init_shadcn':
            return await this.initShadcn(args.projectPath);
          case 'get_component_code':
            return await this.getComponentCode(args.component, args.projectPath);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async addComponent(componentName, projectPath) {
    const frontendPath = path.join(projectPath, 'frontend');
    const componentsPath = path.join(frontendPath, 'src', 'components', 'ui');
    
    // Check if components.json exists
    const componentsJsonPath = path.join(frontendPath, 'components.json');
    if (!await fs.pathExists(componentsJsonPath)) {
      return {
        content: [
          {
            type: 'text',
            text: 'components.json not found. Please run init_shadcn first.',
          },
        ],
      };
    }

    // Create component file based on component name
    const componentCode = this.generateComponentCode(componentName);
    const componentPath = path.join(componentsPath, `${componentName}.jsx`);
    
    await fs.ensureDir(componentsPath);
    await fs.writeFile(componentPath, componentCode);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully added ${componentName} component to ${componentPath}`,
        },
      ],
    };
  }

  async listComponents(projectPath) {
    const frontendPath = path.join(projectPath, 'frontend');
    const componentsPath = path.join(frontendPath, 'src', 'components', 'ui');
    
    if (!await fs.pathExists(componentsPath)) {
      return {
        content: [
          {
            type: 'text',
            text: 'No components directory found. Run init_shadcn first.',
          },
        ],
      };
    }

    const files = await glob('*.jsx', { cwd: componentsPath });
    const components = files.map(file => path.basename(file, '.jsx'));

    return {
      content: [
        {
          type: 'text',
          text: `Available components: ${components.join(', ')}`,
        },
      ],
    };
  }

  async initShadcn(projectPath) {
    const frontendPath = path.join(projectPath, 'frontend');
    
    // Create components.json if it doesn't exist
    const componentsJsonPath = path.join(frontendPath, 'components.json');
    if (!await fs.pathExists(componentsJsonPath)) {
      const componentsJson = {
        "$schema": "https://ui.shadcn.com/schema.json",
        "style": "default",
        "rsc": false,
        "tsx": false,
        "tailwind": {
          "config": "tailwind.config.js",
          "css": "src/index.css",
          "baseColor": "slate",
          "cssVariables": true,
          "prefix": ""
        },
        "aliases": {
          "components": "src/components",
          "utils": "src/lib/utils"
        }
      };
      
      await fs.writeJson(componentsJsonPath, componentsJson, { spaces: 2 });
    }

    // Create utils file
    const utilsPath = path.join(frontendPath, 'src', 'lib', 'utils.js');
    await fs.ensureDir(path.dirname(utilsPath));
    
    if (!await fs.pathExists(utilsPath)) {
      const utilsCode = `import { clsx } from "clsx"

export function cn(...inputs) {
  return clsx(inputs)
}`;
      await fs.writeFile(utilsPath, utilsCode);
    }

    return {
      content: [
        {
          type: 'text',
          text: 'Successfully initialized shadcn/ui configuration',
        },
      ],
    };
  }

  async getComponentCode(componentName, projectPath) {
    const frontendPath = path.join(projectPath, 'frontend');
    const componentPath = path.join(frontendPath, 'src', 'components', 'ui', `${componentName}.jsx`);
    
    if (!await fs.pathExists(componentPath)) {
      return {
        content: [
          {
            type: 'text',
            text: `Component ${componentName} not found. Use add_component to create it.`,
          },
        ],
      };
    }

    const code = await fs.readFile(componentPath, 'utf-8');
    
    return {
      content: [
        {
          type: 'text',
          text: `Component code for ${componentName}:\n\n\`\`\`jsx\n${code}\n\`\`\``,
        },
      ],
    };
  }

  generateComponentCode(componentName) {
    // Basic component templates
    const templates = {
      button: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }`,
      card: `import * as React from "react"

import { cn } from "../../lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`,
    };

    return templates[componentName] || `import * as React from "react"
import { cn } from "../../lib/utils"

const ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  )
})
${componentName.charAt(0).toUpperCase() + componentName.slice(1)}.displayName = "${componentName.charAt(0).toUpperCase() + componentName.slice(1)}"

export { ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} }`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Shadcn MCP Server running on stdio');
  }
}

const server = new ShadcnMCPServer();
server.run().catch(console.error);
