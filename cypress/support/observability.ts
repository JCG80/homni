/**
 * Enhanced Cypress commands for observability and monitoring
 * Part of Hybrid Testability & Enhanced Observability v4.0
 */

import { ROUTES, USER_ROLES, PIPELINE_STAGES } from './constants';

declare global {
  namespace Cypress {
    interface Chainable {
      // Enhanced observability commands
      logTestPhase(phase: string, status: 'started' | 'completed' | 'failed', metadata?: any): Chainable<void>;
      updateSystemStatus(data: { phase: string; status: string; testName: string; metadata?: any }): Chainable<void>;
      
      // Degraded mode testing
      enableDegradedMode(): Chainable<void>;
      verifyDegradedModeUI(): Chainable<void>;
      verifyNormalModeRestored(): Chainable<void>;
      
      // Performance monitoring
      startPerformanceMonitoring(testName: string): Chainable<void>;
      endPerformanceMonitoring(): Chainable<void>;
      
      // Enhanced error handling
      captureErrorContext(errorType: string, context?: any): Chainable<void>;
      
      // System health checks
      verifySystemHealth(): Chainable<void>;
      checkSystemStatusBanner(expectedStatus?: 'healthy' | 'degraded' | 'critical'): Chainable<void>;
    }
  }
}

// Test phase logging with structured metadata
Cypress.Commands.add('logTestPhase', (phase: string, status: 'started' | 'completed' | 'failed', metadata = {}) => {
  const testName = Cypress.currentTest?.title || 'unknown-test';
  
  cy.task('log', {
    level: status === 'failed' ? 'error' : 'info',
    message: `Test phase: ${phase} - ${status}`,
    metadata: {
      testName,
      phase,
      status,
      timestamp: new Date().toISOString(),
      ...metadata
    }
  });
});

// System status update for real-time monitoring
Cypress.Commands.add('updateSystemStatus', (data) => {
  const testName = Cypress.currentTest?.title || 'unknown-test';
  
  cy.task('updateSystemStatus', {
    ...data,
    testName,
    metadata: {
      spec: Cypress.spec.name,
      browser: Cypress.browser.name,
      ...data.metadata
    }
  });
});

// Enable degraded mode for testing system resilience
Cypress.Commands.add('enableDegradedMode', () => {
  cy.logTestPhase('degraded-mode-activation', 'started');
  
  cy.task('testDegradedMode').then(() => {
    cy.logTestPhase('degraded-mode-activation', 'completed');
    
    // Wait for degraded mode to take effect
    cy.wait(2000);
  });
});

// Verify degraded mode UI components
Cypress.Commands.add('verifyDegradedModeUI', () => {
  cy.logTestPhase('degraded-mode-verification', 'started');
  
  // Check for SystemStatusBanner degraded state
  cy.get('[data-testid="system-status-banner"]', { timeout: 10000 })
    .should('be.visible')
    .and('contain', 'Begrenset funksjonalitet');
  
  // Check for degraded mode notices in forms
  cy.get('[data-testid="degraded-mode-notice"]')
    .should('be.visible');
  
  // Verify fallback behavior is active
  cy.get('[data-testid="offline-indicator"]')
    .should('be.visible');
  
  cy.logTestPhase('degraded-mode-verification', 'completed');
});

// Verify normal mode is restored
Cypress.Commands.add('verifyNormalModeRestored', () => {
  cy.logTestPhase('normal-mode-verification', 'started');
  
  // Wait for restoration
  cy.wait(8000);
  
  // Verify SystemStatusBanner shows healthy state
  cy.get('[data-testid="system-status-banner"]')
    .should('not.contain', 'Begrenset funksjonalitet');
  
  // Verify degraded mode notices are gone
  cy.get('[data-testid="degraded-mode-notice"]')
    .should('not.exist');
  
  cy.logTestPhase('normal-mode-verification', 'completed');
});

// Performance monitoring
Cypress.Commands.add('startPerformanceMonitoring', (testName: string) => {
  const startTime = Date.now();
  
  cy.window().then((win) => {
    // Store start time for performance calculations
    win.cypressPerformanceStart = startTime;
    win.cypressTestName = testName;
  });
  
  cy.logTestPhase('performance-monitoring', 'started', { testName, startTime });
});

Cypress.Commands.add('endPerformanceMonitoring', () => {
  cy.window().then((win) => {
    const endTime = Date.now();
    const startTime = win.cypressPerformanceStart || endTime;
    const testName = win.cypressTestName || 'unknown';
    const duration = endTime - startTime;
    
    // Get performance navigation timing if available
    const performanceData = {
      testName,
      duration,
      startTime,
      endTime,
      navigationTiming: win.performance?.timing || null,
      memoryInfo: (win.performance as any)?.memory || null
    };
    
    cy.task('collectPerformanceMetrics', performanceData);
    cy.logTestPhase('performance-monitoring', 'completed', performanceData);
  });
});

// Enhanced error context capture
Cypress.Commands.add('captureErrorContext', (errorType: string, context = {}) => {
  cy.window().then((win) => {
    const errorData = {
      errorType,
      timestamp: new Date().toISOString(),
      testName: Cypress.currentTest?.title || 'unknown',
      spec: Cypress.spec.name,
      url: win.location.href,
      userAgent: win.navigator.userAgent,
      viewport: {
        width: win.innerWidth,
        height: win.innerHeight
      },
      localStorage: { ...win.localStorage },
      sessionStorage: { ...win.sessionStorage },
      ...context
    };
    
    cy.task('log', {
      level: 'error',
      message: `Error context captured: ${errorType}`,
      metadata: errorData
    });
    
    // Take screenshot for visual context
    cy.screenshot(`error-${errorType}-${Date.now()}`);
  });
});

// System health verification
Cypress.Commands.add('verifySystemHealth', () => {
  cy.logTestPhase('system-health-check', 'started');
  
  // Check for critical error indicators
  cy.get('body').should('not.contain', 'Application Error');
  cy.get('body').should('not.contain', 'Something went wrong');
  
  // Verify essential components are loaded
  cy.get('[data-testid="main-navigation"]', { timeout: 10000 })
    .should('be.visible');
  
  // Check console for critical errors (in dev mode)
  cy.window().then((win) => {
    // This would need to be enhanced with actual console error checking
    cy.logTestPhase('system-health-check', 'completed', {
      url: win.location.href,
      readyState: win.document.readyState
    });
  });
});

// System status banner verification
Cypress.Commands.add('checkSystemStatusBanner', (expectedStatus = 'healthy') => {
  const statusMessages = {
    healthy: 'Systemet kjører normalt',
    degraded: 'Begrenset funksjonalitet',
    critical: 'Kritiske tjenester er utilgjengelige'
  };
  
  if (expectedStatus === 'healthy') {
    // For healthy state, banner might not be visible
    cy.get('[data-testid="system-status-banner"]')
      .should('not.exist')
      .or('not.contain', statusMessages.degraded)
      .and('not.contain', statusMessages.critical);
  } else {
    // For degraded/critical states, banner should be visible
    cy.get('[data-testid="system-status-banner"]')
      .should('be.visible')
      .and('contain', statusMessages[expectedStatus]);
  }
  
  cy.logTestPhase('system-status-verification', 'completed', { expectedStatus });
});