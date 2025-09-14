import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright E2E test suite...');
  console.log(`📊 Running ${config.projects.length} browser projects`);
  console.log(`🌍 Base URL: ${config.use?.baseURL || 'http://localhost:8080'}`);
  console.log(`🔧 Workers: ${config.workers || 1}`);
  
  // Ensure test environment is ready
  const baseURL = config.use?.baseURL || 'http://localhost:8080';
  
  try {
    // Wait for development server to be ready
    await fetch(`${baseURL}/health`).catch(() => {
      console.log('⏳ Waiting for development server...');
    });
    
    console.log('✅ Development server is ready');
  } catch (error) {
    console.warn('⚠️  Could not verify development server status');
  }
  
  // Log test environment info
  console.log(`📅 Test run started at: ${new Date().toISOString()}`);
  console.log(`🏷️  Environment: ${process.env.NODE_ENV || 'development'}`);
}

export default globalSetup;