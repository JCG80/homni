import { defineConfig } from 'cypress';
import { logger } from './src/utils/logger';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // Enhanced logging integration
      on('task', {
        log({ level, message, metadata = {} }) {
          logger[level as keyof typeof logger](message, { 
            source: 'cypress-e2e', 
            testName: metadata.testName,
            ...metadata 
          });
          return null;
        },

        // Update system status for real-time monitoring
        updateSystemStatus({ phase, status, testName, metadata = {} }) {
          console.log(`[SYSTEM-STATUS] ${testName}: ${phase} - ${status}`, metadata);
          // Future: Integration with SystemStatusBanner via WebSocket/SSE
          return null;
        },

        // Test degraded mode by temporarily clearing env vars
        testDegradedMode() {
          const originalUrl = process.env.VITE_SUPABASE_URL;
          const originalKey = process.env.VITE_SUPABASE_ANON_KEY;
          
          // Clear Supabase config to simulate degraded mode
          delete process.env.VITE_SUPABASE_URL;
          delete process.env.VITE_SUPABASE_ANON_KEY;
          
          console.log('[DEGRADED-MODE] Activated - Supabase env cleared');
          
          // Restore after 5 seconds (enough for test)
          setTimeout(() => {
            process.env.VITE_SUPABASE_URL = originalUrl;
            process.env.VITE_SUPABASE_ANON_KEY = originalKey;
            console.log('[DEGRADED-MODE] Restored - Supabase env restored');
          }, 5000);
          
          return null;
        },

        // Database cleanup with enhanced logging
        'db:cleanupTestLeads'(prefix: string) {
          logger.info('Cleaning up test leads', { prefix, source: 'cypress-cleanup' });
          // Future: Supabase cleanup implementation
          return null;
        },

        // Generate test report data
        generateTestReport(testData: any) {
          const reportPath = `cypress/reports/test-${Date.now()}.json`;
          logger.info('Generating test report', { reportPath, testData });
          // Future: Write test report file
          return null;
        }
      });

      // Enhanced video recording - only on failure
      on('after:spec', (spec, results) => {
        if (results && results.video && results.stats.failures === 0) {
          // Delete video if test passed
          const fs = require('fs');
          try {
            fs.unlinkSync(results.video);
            logger.debug('Deleted video for passing test', { spec: spec.name });
          } catch (err) {
            logger.warn('Could not delete video', { spec: spec.name, error: err });
          }
        }
      });

      return config;
    },
  },

  // Enhanced video and screenshot configuration
  video: true,
  videoCompression: 32,
  screenshotOnRunFailure: true,
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  
  // Test isolation and retries
  testIsolation: true,
  retries: {
    runMode: 2,
    openMode: 0,
  },

  // Viewport configuration for responsive testing
  viewportWidth: 1280,
  viewportHeight: 720,

  // Enhanced timeouts for stability
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
  responseTimeout: 15000,

  // Environment variables for testing
  env: {
    // Test user credentials for different roles
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PASSWORD: 'password123',
    USER_EMAIL: 'user@example.com',
    USER_PASSWORD: 'password123',
    
    // Feature flags for testing
    ENABLE_DEGRADED_MODE_TEST: true,
    ENABLE_OBSERVABILITY: true,
    
    // Test data configuration
    TEST_DATA_PREFIX: 'E2E-Test',
    CLEANUP_AFTER_TESTS: true,
  },

  // Component testing configuration (future)
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
});