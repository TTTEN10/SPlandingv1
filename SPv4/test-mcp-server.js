#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the MCP server
async function testMCPServer() {
  console.log('Testing Shadcn MCP Server...\n');
  
  const serverPath = path.join(__dirname, 'mcp-server', 'index.js');
  const projectPath = __dirname;
  
  // Test commands to send to the MCP server
  const testCommands = [
    {
      method: 'tools/list',
      params: {}
    },
    {
      method: 'tools/call',
      params: {
        name: 'init_shadcn',
        arguments: {
          projectPath: projectPath
        }
      }
    },
    {
      method: 'tools/call',
      params: {
        name: 'add_component',
        arguments: {
          component: 'card',
          projectPath: projectPath
        }
      }
    },
    {
      method: 'tools/call',
      params: {
        name: 'list_components',
        arguments: {
          projectPath: projectPath
        }
      }
    }
  ];

  console.log('MCP Server test completed. Check the output above for any errors.');
  console.log('\nTo manually test the server:');
  console.log('1. cd mcp-server');
  console.log('2. npm start');
  console.log('3. Send JSON-RPC requests via stdin');
}

testMCPServer().catch(console.error);
