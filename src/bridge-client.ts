import * as http from 'node:http';
import type { MarkdownContent, FileOpenRequest, BridgeResponse } from './types.js';

export class BridgeClient {
  private readonly host: string;
  private readonly port: number;

  constructor(host: string = '127.0.0.1', port: number = 37123) {
    this.host = host;
    this.port = port;
  }

  private async request(endpoint: string, data: unknown, method: string = 'POST'): Promise<BridgeResponse> {
    return new Promise((resolve, reject) => {
      const postData = method === 'POST' ? JSON.stringify(data) : '';
      
      const options: http.RequestOptions = {
        hostname: this.host,
        port: this.port,
        path: endpoint,
        method: method,
        headers: method === 'POST' ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        } : {}
      };
      
      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode === 200) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.error || `HTTP ${res.statusCode}: ${responseData}`));
            }
          } catch (e) {
            reject(new Error(`Invalid response: ${responseData}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      if (method === 'POST') {
        req.write(postData);
      }
      req.end();
    });
  }

  async showMarkdown(content: MarkdownContent): Promise<BridgeResponse> {
    return this.request('/show-markdown', content);
  }

  async openMarkdownFile(request: FileOpenRequest): Promise<BridgeResponse> {
    return this.request('/open-markdown-file', request);
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.request('/health', {}, 'GET');
      return response.status === 'ok';
    } catch {
      return false;
    }
  }
}