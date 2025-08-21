#!/usr/bin/env node

/**
 * Test script to verify bridge communication
 */

const { BridgeClient } = require('./dist/bridge-client.js');

async function testBridge() {
  const client = new BridgeClient('127.0.0.1', 3043);
  
  console.log('Testing bridge connection...\n');
  
  // Test 1: Health check
  console.log('1. Testing health check...');
  const isHealthy = await client.checkHealth();
  console.log(`   Bridge health: ${isHealthy ? '✅ Connected' : '❌ Not connected'}\n`);
  
  if (!isHealthy) {
    console.error('Bridge is not responding. Make sure VS Code extension is running.');
    process.exit(1);
  }
  
  // Test 2: Show markdown content
  console.log('2. Testing showMarkdown...');
  try {
    const response = await client.showMarkdown({
      content: '# Test from principal-md\n\nThis is a test message from the principal-md MCP server.\n\n## Features\n- ✅ Bridge connection working\n- ✅ Markdown rendering\n- ✅ MCP server ready',
      title: 'Principal MD Test',
      metadata: { source: 'test-bridge.js' }
    });
    console.log(`   Response: ${response.success ? '✅ Success' : '❌ Failed'}`);
    if (response.message) {
      console.log(`   Message: ${response.message}`);
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n✅ Bridge communication test completed!');
}

testBridge().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});