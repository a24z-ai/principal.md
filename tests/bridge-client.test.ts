import { BridgeClient } from '../src/bridge-client';

describe('BridgeClient', () => {
  let client: BridgeClient;

  beforeEach(() => {
    client = new BridgeClient('127.0.0.1', 3043);
  });

  describe('constructor', () => {
    it('should create instance with default values', () => {
      const defaultClient = new BridgeClient();
      expect(defaultClient).toBeDefined();
    });

    it('should create instance with custom host and port', () => {
      const customClient = new BridgeClient('localhost', 8080);
      expect(customClient).toBeDefined();
    });
  });

  describe('checkHealth', () => {
    it('should return false when bridge is not available', async () => {
      const result = await client.checkHealth();
      expect(result).toBe(false);
    });
  });
});