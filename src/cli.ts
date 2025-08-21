#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { run } from './index.js';

type Command = 'start' | 'install-cursor' | 'install-claude' | 'help';

interface CliOptions {
  port?: number;
  host?: string;
}

function getHome(): string {
  const homedir = os.homedir();
  if (!homedir) {
    throw new Error('Unable to resolve home directory');
  }
  return homedir;
}

function writeFileEnsured(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
}

function parseCliArgs(): { command: Command; options: CliOptions } {
  const args = process.argv.slice(2);
  let command: Command = 'start';
  const options: CliOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--port' || arg === '-p') {
      const portStr = args[++i];
      const port = parseInt(portStr, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        console.error(`Invalid port: ${portStr}. Port must be between 1 and 65535.`);
        process.exit(1);
      }
      options.port = port;
    } else if (arg === '--host' || arg === '-h') {
      options.host = args[++i];
    } else if (arg === 'help' || arg === '--help') {
      command = 'help';
    } else if (!arg.startsWith('-')) {
      command = arg as Command;
    }
  }
  
  return { command, options };
}

function installCursor(options: CliOptions = {}): void {
  const configPath = path.join(getHome(), '.cursor', 'mcp.json');
  let existing: Record<string, unknown> = {};
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    existing = JSON.parse(content);
  } catch (_) {
    existing = {};
  }

  if (typeof existing !== 'object' || existing === null) {
    existing = {};
  }

  const config = existing as { mcpServers?: Record<string, unknown> };
  if (!config.mcpServers) config.mcpServers = {};

  const args = ['@a24z/principal-md'];
  const env: Record<string, string> = {};
  
  if (options.port) {
    args.push('--port', options.port.toString());
    env.VSCODE_MCP_BRIDGE_PORT = options.port.toString();
  } else {
    env.VSCODE_MCP_BRIDGE_PORT = '3043';
  }
  
  if (options.host) {
    args.push('--host', options.host);
    env.VSCODE_MCP_BRIDGE_HOST = options.host;
  } else {
    env.VSCODE_MCP_BRIDGE_HOST = '127.0.0.1';
  }

  config.mcpServers['principal-md'] = {
    command: 'npx',
    args,
    env
  };

  writeFileEnsured(configPath, JSON.stringify(config, null, 2));
  console.log(`Installed MCP server config for Cursor at ${configPath}`);
  console.log('\nNote: Make sure the VS Code PrincipalMD extension is running with the HTTP bridge enabled on port 3043');
}

function installClaude(options: CliOptions = {}): void {
  const candidates = [
    path.join(getHome(), '.claude.json'),
    path.join(getHome(), '.config', 'claude', 'config.json')
  ];
  let target = candidates.find(p => fs.existsSync(p));
  if (!target) target = candidates[0];

  let existing: Record<string, unknown> = {};
  try {
    const content = fs.readFileSync(target, 'utf8');
    existing = JSON.parse(content);
  } catch (_) {
    existing = {};
  }

  if (typeof existing !== 'object' || existing === null) {
    existing = {};
  }

  const config = existing as { mcpServers?: Record<string, unknown> };
  if (!config.mcpServers) config.mcpServers = {};

  const args = ['@a24z/principal-md'];
  const env: Record<string, string> = {};
  
  if (options.port) {
    args.push('--port', options.port.toString());
    env.VSCODE_MCP_BRIDGE_PORT = options.port.toString();
  } else {
    env.VSCODE_MCP_BRIDGE_PORT = '3043';
  }
  
  if (options.host) {
    args.push('--host', options.host);
    env.VSCODE_MCP_BRIDGE_HOST = options.host;
  } else {
    env.VSCODE_MCP_BRIDGE_HOST = '127.0.0.1';
  }

  config.mcpServers['principal-md'] = {
    command: 'npx',
    args,
    env
  };

  writeFileEnsured(target, JSON.stringify(config, null, 2));
  console.log(`Installed MCP server config for Claude at ${target}`);
  console.log('\nNote: Make sure the VS Code PrincipalMD extension is running with the HTTP bridge enabled on port 3043');
}

function printHelp(): void {
  console.log(`principal-md <command> [options]

Commands:
  start                Start the MCP server (stdio)
  install-cursor       Add MCP config to ~/.cursor/mcp.json
  install-claude       Add MCP config to ~/.claude.json (or ~/.config/claude/config.json)
  help                 Show this help

Options:
  --port, -p <port>    Bridge port (default: 3043)
  --host, -h <host>    Bridge host (default: 127.0.0.1)

Environment Variables:
  VSCODE_MCP_BRIDGE_HOST   Bridge host (default: 127.0.0.1)
  VSCODE_MCP_BRIDGE_PORT   Bridge port (default: 3043)

Examples:
  principal-md start                               # Use default port 3043
  principal-md start --port 8080                  # Use custom port
  principal-md install-claude --port 8080         # Install with custom port
  principal-md install-cursor --host localhost    # Install with custom host

Installation:
  npm install -g @a24z/principal-md
  # OR
  npx @a24z/principal-md

Usage:
  1. Install the PrincipalMD VS Code extension (or other compatible UI)
  2. Ensure the UI's HTTP bridge is running on the specified port
  3. Run 'principal-md install-claude' or 'principal-md install-cursor'
  4. Restart Claude Desktop or Cursor

For other UI implementations:
  The server communicates via HTTP bridge on the specified port.
  Implement endpoints: GET /health, POST /show-markdown, POST /open-markdown-file
`);
}

async function main(): Promise<void> {
  const { command, options } = parseCliArgs();
  
  switch (command) {
    case 'start':
      await run({
        bridgePort: options.port,
        bridgeHost: options.host
      });
      break;
    case 'install-cursor':
      installCursor(options);
      break;
    case 'install-claude':
      installClaude(options);
      break;
    case 'help':
    default:
      printHelp();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});