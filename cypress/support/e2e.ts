/**
 * Enhanced Cypress support file with observability integration
 * Part of Hybrid Testability & Enhanced Observability v4.0
 */

// Import commands.ts using ES2015 syntax:
import './commands';
import './observability';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Enhanced global configuration
Cypress.on('uncaught:exception', (err) => {
  // Log uncaught exceptions for better debugging
  cy.task('log', {
    level: 'error',
    message: 'Uncaught exception in test',
    metadata: {
      error: err.message,
      stack: err.stack,
      testName: Cypress.currentTest?.title || 'unknown'
    }
  });

  // Don't fail the test on uncaught exceptions (configurable)
  if (Cypress.env('FAIL_ON_UNCAUGHT_EXCEPTION') === false) {
    return false;
  }
});

// Enhanced test lifecycle hooks
beforeEach(() => {
  // Log test start
  const testName = Cypress.currentTest?.title || 'unknown test';
  cy.task('log', {
    level: 'info',
    message: `Starting test: ${testName}`,
    metadata: {
      testName,
      spec: Cypress.spec.name,
      browser: Cypress.browser.name
    }
  });

  // Update system status
  cy.task('updateSystemStatus', {
    phase: 'test-started',
    status: 'in-progress',
    testName,
    metadata: {
      spec: Cypress.spec.name
    }
  });
});

afterEach(() => {
  const testName = Cypress.currentTest?.title || 'unknown test';
  const testState = Cypress.currentTest?.state || 'unknown';
  
  // Log test completion
  cy.task('log', {
    level: testState === 'passed' ? 'info' : 'error',
    message: `Test ${testState}: ${testName}`,
    metadata: {
      testName,
      testState,
      spec: Cypress.spec.name,
      browser: Cypress.browser.name
    }
  });

  // Update system status
  cy.task('updateSystemStatus', {
    phase: 'test-completed',
    status: testState === 'passed' ? 'success' : 'failed',
    testName,
    metadata: {
      testState,
      spec: Cypress.spec.name
    }
  });

  // Take screenshot on failure
  if (testState === 'failed') {
    const timestamp = new Date().getTime();
    cy.screenshot(`failed-${testName.replace(/\s+/g, '-')}-${timestamp}`);
  }
});

// Global error handling for better observability
Cypress.on('fail', (err) => {
  const testName = Cypress.currentTest?.title || 'unknown test';
  
  cy.task('log', {
    level: 'error',
    message: `Test failure: ${err.message}`,
    metadata: {
      testName,
      error: err.message,
      stack: err.stack,
      spec: Cypress.spec.name,
      browser: Cypress.browser.name
    }
  });

  // Capture error context
  cy.captureErrorContext('test-failure', {
    error: err.message,
    stack: err.stack
  });

  throw err; // Re-throw to maintain normal Cypress behavior
});

// Network request logging for observability
Cypress.on('before:browser:launch', (browser, launchOptions) => {
  // Enable network logging in Chrome
  if (browser.family === 'chromium') {
    launchOptions.args.push('--enable-logging');
    launchOptions.args.push('--log-level=0');
  }

  return launchOptions;
});

// Custom command to wait for app to be ready
Cypress.Commands.add('waitForAppReady', () => {
  cy.get('[data-testid="main-navigation"]', { timeout: 30000 }).should('be.visible');
  cy.get('body').should('not.contain', 'Loading...');
});

declare global {
  namespace Cypress {
    interface Chainable {
      waitForAppReady(): Chainable<void>;
    }
  }
}