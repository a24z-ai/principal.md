#!/usr/bin/env node

/**
 * Standalone Principal MD MCP server
 * Provides markdown visualization tools via MCP
 */

import { McpServer } from './mcp-server.js';
import type { McpServerConfig } from './types.js';

export { McpServer } from './mcp-server.js';
export type { McpServerConfig, MarkdownContent, FileOpenRequest, BridgeResponse } from './types.js';

export function run(config?: Partial<McpServerConfig>): Promise<void> {
  const resolved: McpServerConfig = {
    name: 'principal-md',
    version: '0.1.0',
    bridgeHost: process.env.VSCODE_MCP_BRIDGE_HOST || '127.0.0.1',
    bridgePort: parseInt(process.env.VSCODE_MCP_BRIDGE_PORT || '37123', 10),
    ...config,
  };

  const server = new McpServer(resolved);
  return server.start();
}

// Allow running directly
if (require.main === module) {
  run().catch((err: unknown) => {
    console.error('Failed to start MCP server:', err);
    process.exit(1);
  });
}