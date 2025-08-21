#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { run } from './index.js';

type Command = 'start' | 'install-cursor' | 'install-claude' | 'help';

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

function installCursor(): void {
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

  config.mcpServers['principal-md'] = {
    command: 'npx',
    args: ['principal-md'],
    env: {
      VSCODE_MCP_BRIDGE_PORT: '3043',
      VSCODE_MCP_BRIDGE_HOST: '127.0.0.1'
    }
  };

  writeFileEnsured(configPath, JSON.stringify(config, null, 2));
  console.log(`Installed MCP server config for Cursor at ${configPath}`);
  console.log('\nNote: Make sure the VS Code PrincipalMD extension is running with the HTTP bridge enabled on port 3043');
}

function installClaude(): void {
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

  config.mcpServers['principal-md'] = {
    command: 'npx',
    args: ['principal-md'],
    env: {
      VSCODE_MCP_BRIDGE_PORT: '3043',
      VSCODE_MCP_BRIDGE_HOST: '127.0.0.1'
    }
  };

  writeFileEnsured(target, JSON.stringify(config, null, 2));
  console.log(`Installed MCP server config for Claude at ${target}`);
  console.log('\nNote: Make sure the VS Code PrincipalMD extension is running with the HTTP bridge enabled on port 3043');
}

function printHelp(): void {
  console.log(`principal-md <command>

Commands:
  start                Start the MCP server (stdio)
  install-cursor       Add MCP config to ~/.cursor/mcp.json
  install-claude       Add MCP config to ~/.claude.json (or ~/.config/claude/config.json)
  help                 Show this help

Environment Variables:
  VSCODE_MCP_BRIDGE_HOST   Bridge host (default: 127.0.0.1)
  VSCODE_MCP_BRIDGE_PORT   Bridge port (default: 3043)

Usage:
  1. Install the PrincipalMD VS Code extension
  2. Ensure the extension's HTTP bridge is running
  3. Run 'principal-md install-claude' or 'principal-md install-cursor'
  4. Restart Claude Desktop or Cursor
`);
}

async function main(): Promise<void> {
  const [, , cmdArg] = process.argv;
  const cmd: Command = (cmdArg as Command) || 'start';
  
  switch (cmd) {
    case 'start':
      await run();
      break;
    case 'install-cursor':
      installCursor();
      break;
    case 'install-claude':
      installClaude();
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