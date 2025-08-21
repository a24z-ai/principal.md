# Principal MD MCP Server

A standalone MCP (Model Context Protocol) server that enables AI assistants to display and manipulate markdown content in VS Code through the Memory Palace extension.

## Features

- **Display Markdown Content**: Show formatted markdown in VS Code's Industrial Markdown view
- **Open Markdown Files**: Open specific markdown files with optional line navigation
- **Bridge Communication**: Seamless integration with VS Code extension via HTTP bridge

## Installation

```bash
npm install -g @a24z/principal-md
```

Or use directly with npx:

```bash
npx @a24z/principal-md
```

## Quick Setup

For some editors, you can run the following commands for a one-click install:

**Cursor:**

[Install MCP Server](https://cursor.com/settings/mcp)

**Manual Integration**

```json
{
  "mcpServers": {
    "principal-md": {
      "command": "npx",
      "args": [
        "-y",
        "@a24z/principal-md"
      ],
      "env": {
        "VSCODE_MCP_BRIDGE_PORT": "37123",
        "VSCODE_MCP_BRIDGE_HOST": "127.0.0.1"
      }
    }
  }
}
```

**For Custom Ports:**

```json
{
  "mcpServers": {
    "principal-md": {
      "command": "npx",
      "args": [
        "-y",
        "@a24z/principal-md",
        "--port",
        "8080"
      ],
      "env": {
        "VSCODE_MCP_BRIDGE_PORT": "8080",
        "VSCODE_MCP_BRIDGE_HOST": "127.0.0.1"
      }
    }
  }
}
```

**Jules**

Refer to [Jules MCP configuration](https://docs.jules.sh/mcp); define a server named `principal-md` with the same command, args, and env.

### Automated Installation

#### For Claude Desktop

```bash
# Install with default port
principal-md install-claude

# Install with custom port
principal-md install-claude --port 8080
```

This will add the MCP server configuration to your Claude Desktop settings.

#### For Cursor

```bash
# Install with default port
principal-md install-cursor

# Install with custom port and host
principal-md install-cursor --port 8080 --host localhost
```

This will add the MCP server configuration to your Cursor settings.

## Prerequisites

1. **VS Code Memory Palace Extension**: Install and run the Memory Palace extension in VS Code
2. **HTTP Bridge**: Ensure the extension's HTTP bridge is running (default port: 37123)

## Usage

### As a Standalone Server

```bash
# Start the MCP server (default port 37123)
principal-md start

# Start with custom port
principal-md start --port 8080

# Start with custom host and port
principal-md start --host localhost --port 4000

# Using environment variables
VSCODE_MCP_BRIDGE_PORT=37124 principal-md start
```

### As a Library

```typescript
import { McpServer } from '@a24z/principal-md';

const server = new McpServer({
  name: 'principal-md',
  version: '0.1.0',
  bridgePort: 37123,
  bridgeHost: '127.0.0.1'
});

await server.start();
```

## Available Tools

### showMarkdownContent

Display markdown content in VS Code:

```json
{
  "content": "# Hello World\nThis is markdown content",
  "title": "My Document",
  "metadata": {}
}
```

### openMarkdownFile

Open a markdown file in VS Code:

```json
{
  "filePath": "/path/to/document.md",
  "lineNumber": 10
}
```

### getAppInfo

Get information about the extension and bridge status.

## Environment Variables

- `VSCODE_MCP_BRIDGE_HOST`: Bridge host address (default: `127.0.0.1`)
- `VSCODE_MCP_BRIDGE_PORT`: Bridge port (default: `37123`)

## Development

```bash
# Clone the repository
git clone https://github.com/a24z-ai/principal.md.git
cd principal.md

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## Architecture

```
AI Assistant → MCP Server (stdio) → HTTP Bridge → VS Code Extension → Markdown View
```

1. AI assistant calls MCP tool (e.g., `showMarkdownContent`)
2. MCP server receives the call via stdio protocol
3. Server makes HTTP POST to the bridge endpoint
4. VS Code extension receives and processes the request
5. Content appears in VS Code's markdown view

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Creating Custom UI Implementations

The principal-md MCP server is designed to work with any UI that implements the HTTP bridge protocol. Here's how to create your own UI implementation:

### 1. HTTP Bridge Requirements

Your UI needs to implement an HTTP server with these endpoints:

```typescript
// GET /health - Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Your UI Name',
    version: '1.0.0'
  });
});

// POST /show-markdown - Display markdown content
app.post('/show-markdown', (req, res) => {
  const { content, title, metadata } = req.body;
  // Display the markdown content in your UI
  res.json({ success: true, message: 'Content displayed' });
});

// POST /open-markdown-file - Open a markdown file
app.post('/open-markdown-file', (req, res) => {
  const { filePath, lineNumber } = req.body;
  // Open the file in your UI
  res.json({ success: true, message: 'File opened' });
});
```

### 2. Using Custom Ports

Start your UI's HTTP bridge on any available port, then configure the MCP server:

```bash
# Start MCP server with custom port
principal-md start --port 8080

# Install with custom configuration
principal-md install-claude --port 8080 --host localhost
```

### 3. Example Implementations

- **VS Code Extension**: See [Memory Palace VS Code extension](https://github.com/a24z-ai/principal.md)
- **Web UI**: Create an Express.js server with the required endpoints
- **Desktop App**: Use Electron, Tauri, or similar with embedded HTTP server
- **Terminal UI**: Use a lightweight HTTP server to bridge to terminal-based markdown viewers

## Support

For issues and questions, please visit [GitHub Issues](https://github.com/a24z-ai/principal.md/issues).