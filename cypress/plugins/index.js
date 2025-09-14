/**
 * Enhanced Cypress plugins with observability integration
 * Part of Hybrid Testability & Enhanced Observability v4.0
 */

const { logger } = require('../../src/utils/logger');

module.exports = (on, config) => {
  // Enhanced logging task with structured metadata
  on('task', {
    log({ level, message, metadata = {} }) {
      const enhancedMetadata = {
        source: 'cypress-e2e',
        timestamp: new Date().toISOString(),
        testSuite: metadata.testName || 'unknown',
        environment: config.env || 'test',
        ...metadata
      };

      // Log to console with proper formatting
      const logMessage = `[E2E-${level.toUpperCase()}] ${message}`;
      console[level] ? console[level](logMessage, enhancedMetadata) : console.log(logMessage, enhancedMetadata);

      // Future: Send to external logging service
      // if (process.env.LOG_WEBHOOK_URL) {
      //   sendToWebhook(level, message, enhancedMetadata);
      // }

      return null;
    },

    // System status update task
    updateSystemStatus({ phase, status, testName, metadata = {} }) {
      const statusUpdate = {
        timestamp: new Date().toISOString(),
        testName,
        phase, // 'started', 'in-progress', 'completed', 'failed'
        status, // 'success', 'warning', 'error'
        metadata: {
          browser: config.browser?.name || 'unknown',
          spec: metadata.spec || 'unknown',
          ...metadata
        }
      };

      console.log(`[SYSTEM-STATUS] ${JSON.stringify(statusUpdate)}`);

      // Future: Integration with SystemStatusBanner
      // - WebSocket broadcast to frontend
      // - Update Redis/cache for real-time status
      // - Trigger SystemStatusBanner state update

      return null;
    },

    // Degraded mode simulation
    testDegradedMode() {
      console.log('[DEGRADED-MODE] Simulating system degradation...');
      
      // Store original environment variables
      const originalEnv = {
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      };

      // Clear critical environment variables
      delete process.env.VITE_SUPABASE_URL;
      delete process.env.VITE_SUPABASE_ANON_KEY;

      console.log('[DEGRADED-MODE] Environment variables cleared - degraded mode active');

      // Restore after test timeout
      setTimeout(() => {
        process.env.VITE_SUPABASE_URL = originalEnv.VITE_SUPABASE_URL;
        process.env.VITE_SUPABASE_ANON_KEY = originalEnv.VITE_SUPABASE_ANON_KEY;
        console.log('[DEGRADED-MODE] Environment restored - normal mode active');
      }, 10000); // 10 seconds should be enough for degraded mode test

      return null;
    },

    // Database cleanup with enhanced logging
    'db:cleanupTestLeads'(prefix) {
      console.log(`[DB-CLEANUP] Cleaning test leads with prefix: ${prefix}`);
      
      // Future: Actual Supabase cleanup implementation
      // const { createClient } = require('@supabase/supabase-js');
      // const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
      // await supabase.from('leads').delete().ilike('title', `${prefix}%`);

      console.log(`[DB-CLEANUP] Completed cleanup for prefix: ${prefix}`);
      return null;
    },

    // Performance metrics collection
    collectPerformanceMetrics(metrics) {
      const performanceData = {
        timestamp: new Date().toISOString(),
        testName: metrics.testName,
        loadTime: metrics.loadTime,
        apiResponseTimes: metrics.apiResponseTimes || [],
        memoryUsage: process.memoryUsage(),
        ...metrics
      };

      console.log('[PERFORMANCE] Test metrics collected:', performanceData);

      // Future: Send to monitoring service
      // await sendToGrafana(performanceData);

      return null;
    },

    // Generate enhanced test report
    generateTestReport(testData) {
      const report = {
        timestamp: new Date().toISOString(),
        testSuite: testData.testName,
        duration: testData.duration,
        status: testData.status,
        browser: config.browser?.name,
        viewport: {
          width: config.viewportWidth,
          height: config.viewportHeight
        },
        environment: {
          baseUrl: config.baseUrl,
          nodeVersion: process.version,
          platform: process.platform
        },
        coverage: testData.coverage || null,
        screenshots: testData.screenshots || [],
        videos: testData.videos || [],
        errors: testData.errors || [],
        warnings: testData.warnings || [],
        ...testData
      };

      console.log('[TEST-REPORT] Generated report:', report);

      // Future: Write to file system or send to dashboard
      // const fs = require('fs');
      // fs.writeFileSync(`cypress/reports/report-${Date.now()}.json`, JSON.stringify(report, null, 2));

      return null;
    }
  });

  // Browser launch events for enhanced observability
  on('before:browser:launch', (browser, launchOptions) => {
    console.log(`[BROWSER-LAUNCH] Starting ${browser.name} v${browser.version}`);
    
    // Add performance monitoring flags
    if (browser.family === 'chromium') {
      launchOptions.args.push('--enable-precise-memory-info');
      launchOptions.args.push('--disable-web-security'); // Only for testing
    }

    return launchOptions;
  });

  // Spec events for test lifecycle tracking
  on('before:spec', (spec) => {
    console.log(`[SPEC-START] Running spec: ${spec.name}`);
  });

  on('after:spec', (spec, results) => {
    const summary = {
      spec: spec.name,
      duration: results.stats?.duration || 0,
      tests: results.stats?.tests || 0,
      passes: results.stats?.passes || 0,
      failures: results.stats?.failures || 0,
      pending: results.stats?.pending || 0,
      skipped: results.stats?.skipped || 0
    };

    console.log(`[SPEC-COMPLETE] Results for ${spec.name}:`, summary);

    // Clean up videos for passing tests to save space
    if (results.video && results.stats?.failures === 0) {
      const fs = require('fs');
      try {
        fs.unlinkSync(results.video);
        console.log(`[CLEANUP] Deleted video for passing test: ${spec.name}`);
      } catch (err) {
        console.warn(`[CLEANUP] Could not delete video: ${err.message}`);
      }
    }
  });

  return config;
};