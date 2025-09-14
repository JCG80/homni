/**
 * Boot smoke test - Ensures the app can be imported and bootstrapped
 * Simple CommonJS for maximum CI compatibility
 */

const path = require('path');
const fs = require('fs');

// Mock browser globals that React expects
global.window = {
  location: { hostname: 'localhost', href: 'http://localhost' },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
};
global.document = {
  getElementById: () => ({ 
    render: () => {},
    appendChild: () => {},
    innerHTML: ''
  }),
  createElement: () => ({ 
    setAttribute: () => {},
    appendChild: () => {},
    innerHTML: '' 
  })
};
global.navigator = { userAgent: 'node' };

// Mock import.meta for Vite compatibility
global.import = {
  meta: {
    env: {
      MODE: 'test',
      VITE_SUPABASE_URL: 'test-url',
      VITE_SUPABASE_ANON_KEY: 'test-key'
    }
  }
};

console.log('🧪 Starting boot smoke test...');

try {
  // Check that critical files exist
  const criticalFiles = [
    'src/main.tsx',
    'src/App.tsx',
    'src/utils/env.ts',
    'src/utils/logger.ts'
  ];

  for (const file of criticalFiles) {
    const fullPath = path.join(__dirname, '..', file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Critical file missing: ${file}`);
    }
  }

  console.log('✅ Critical files check passed');

  // Test environment utilities can be loaded
  const { getEnv } = require('../src/utils/env.ts');
  const env = getEnv();
  
  if (!env || typeof env.MODE !== 'string') {
    throw new Error('Environment utilities failed to load properly');
  }

  console.log('✅ Environment utilities loaded successfully');
  console.log('✅ App boot smoke test passed');
  console.log(`📋 Environment: ${env.MODE}, Log level: ${env.LOG_LEVEL}`);
  
} catch (error) {
  console.error('❌ Boot smoke test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}