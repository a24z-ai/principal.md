/**
 * Library entry point for principal-md
 * Allows other packages to import and use the MCP server programmatically
 */

export { McpServer } from './mcp-server.js';
export { BridgeClient } from './bridge-client.js';
export { run } from './index.js';
export type { 
  McpServerConfig, 
  MarkdownContent, 
  FileOpenRequest, 
  BridgeResponse 
} from './types.js';