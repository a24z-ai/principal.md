# Principal MD MCP Server

A standalone MCP (Model Context Protocol) server that enables AI assistants to display and manipulate markdown content in VS Code through the PrincipalMD extension.

## Features

- **Display Markdown Content**: Show formatted markdown in VS Code's Industrial Markdown view
- **Open Markdown Files**: Open specific markdown files with optional line navigation
- **Bridge Communication**: Seamless integration with VS Code extension via HTTP bridge

## Installation

```bash
npm install -g principal-md
```

Or use directly with npx:

```bash
npx principal-md
```

## Quick Setup

### For Claude Desktop

```bash
principal-md install-claude
```

This will add the MCP server configuration to your Claude Desktop settings.

### For Cursor

```bash
principal-md install-cursor
```

This will add the MCP server configuration to your Cursor settings.

## Prerequisites

1. **VS Code PrincipalMD Extension**: Install and run the PrincipalMD extension in VS Code
2. **HTTP Bridge**: Ensure the extension's HTTP bridge is running (default port: 3043)

## Usage

### As a Standalone Server

```bash
# Start the MCP server
principal-md start

# With custom bridge configuration
VSCODE_MCP_BRIDGE_PORT=3044 principal-md start
```

### As a Library

```typescript
import { McpServer } from 'principal-md';

const server = new McpServer({
  name: 'principal-md',
  version: '0.1.0',
  bridgePort: 3043,
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
- `VSCODE_MCP_BRIDGE_PORT`: Bridge port (default: `3043`)

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

## Support

For issues and questions, please visit [GitHub Issues](https://github.com/a24z-ai/principal.md/issues).