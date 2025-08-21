export interface McpServerConfig {
  name: string;
  version: string;
  bridgePort?: number;
  bridgeHost?: string;
}

export interface MarkdownContent {
  content: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface FileOpenRequest {
  filePath: string;
  lineNumber?: number;
}

export interface BridgeResponse {
  success?: boolean;
  status?: string;
  message?: string;
  error?: string;
  service?: string;
  version?: string;
}