#!/usr/bin/env node

/**
 * Test script to verify port configuration works
 */

const { BridgeClient } = require('./dist/bridge-client.js');

async function testPortConfig() {
  console.log('Testing port configuration...\n');
  
  // Test 1: Default port (should work with existing bridge)
  console.log('1. Testing default port 37123...');
  const defaultClient = new BridgeClient('127.0.0.1', 37123);
  const defaultHealthy = await defaultClient.checkHealth();
  console.log(`   Port 37123: ${defaultHealthy ? '✅ Connected' : '❌ Not connected'}\n`);
  
  // Test 2: Custom port (should fail since no bridge is running there)
  console.log('2. Testing custom port 8080...');
  const customClient = new BridgeClient('127.0.0.1', 8080);
  const customHealthy = await customClient.checkHealth();
  console.log(`   Port 8080: ${customHealthy ? '✅ Connected' : '❌ Not connected (expected)'}\n`);
  
  // Test 3: Show configuration flexibility
  console.log('3. Configuration examples:');
  console.log('   - Default: new BridgeClient("127.0.0.1", 37123)');
  console.log('   - Custom:  new BridgeClient("localhost", 8080)');
  console.log('   - Remote:  new BridgeClient("192.168.1.100", 4000)');
  
  console.log('\n✅ Port configuration test completed!');
  console.log('\n📝 For other UI implementations:');
  console.log('   1. Create HTTP server on your chosen port');
  console.log('   2. Implement endpoints: GET /health, POST /show-markdown, POST /open-markdown-file');
  console.log('   3. Run: principal-md start --port <your-port>');
}

testPortConfig().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});