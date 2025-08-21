import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { BridgeClient } from './bridge-client.js';
import type { McpServerConfig } from './types.js';

export class McpServer {
  private server: Server;
  private bridgeClient: BridgeClient;
  private config: McpServerConfig;

  constructor(config: McpServerConfig) {
    this.config = config;
    this.bridgeClient = new BridgeClient(config.bridgeHost, config.bridgePort);
    
    this.server = new Server({
      name: config.name,
      version: config.version
    }, {
      capabilities: {
        tools: {}
      }
    });

    this.registerTools();
  }

  private registerTools(): void {
    // Handle tools/call request
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      if (request.params.name === 'showMarkdownContent') {
        const args = request.params.arguments as any;
        
        try {
          const response = await this.bridgeClient.showMarkdown({
            content: args.content,
            title: args.title,
            metadata: args.metadata
          });
          
          return {
            content: [{
              type: 'text',
              text: response.message || 'Markdown content displayed successfully'
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Failed to display markdown: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
      
      if (request.params.name === 'openMarkdownFile') {
        const args = request.params.arguments as any;
        
        try {
          const response = await this.bridgeClient.openMarkdownFile({
            filePath: args.filePath,
            lineNumber: args.lineNumber
          });
          
          return {
            content: [{
              type: 'text',
              text: response.message || 'File opened successfully'
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Failed to open file: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }

      if (request.params.name === 'getAppInfo') {
        const isHealthy = await this.bridgeClient.checkHealth();
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              name: this.config.name,
              version: this.config.version,
              bridgeStatus: isHealthy ? 'connected' : 'disconnected',
              bridgeUrl: `http://${this.config.bridgeHost || '127.0.0.1'}:${this.config.bridgePort || 3043}`
            }, null, 2)
          }]
        };
      }

      throw new Error(`Unknown tool: ${request.params.name}`);
    });

    // Handle tools/list request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'showMarkdownContent',
            description: 'Display markdown content in VS Code Industrial Markdown view',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'Markdown content to display'
                },
                title: {
                  type: 'string',
                  description: 'Optional title for the document'
                },
                metadata: {
                  type: 'object',
                  description: 'Optional metadata for the document'
                }
              },
              required: ['content']
            }
          },
          {
            name: 'openMarkdownFile',
            description: 'Open a markdown file in VS Code',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the markdown file'
                },
                lineNumber: {
                  type: 'number',
                  description: 'Optional line number to jump to'
                }
              },
              required: ['filePath']
            }
          },
          {
            name: 'getAppInfo',
            description: 'Get information about the PrincipalMD extension and bridge status',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Log to stderr to avoid interfering with stdio protocol
    console.error(`[${this.config.name}] MCP server started`);
    console.error(`[${this.config.name}] Bridge: http://${this.config.bridgeHost || '127.0.0.1'}:${this.config.bridgePort || 3043}`);
  }
}