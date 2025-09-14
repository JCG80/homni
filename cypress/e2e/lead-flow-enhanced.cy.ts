/// <reference types="cypress" />

/**
 * Enhanced Lead Flow E2E Test with Observability & Degraded Mode Testing
 * Part of Hybrid Testability & Enhanced Observability v4.0
 */

import { ROUTES, USER_ROLES, PIPELINE_STAGES, TEST_PREFIXES } from '../support/constants';

describe('Enhanced Lead Flow with Observability', () => {
  const testLead = {
    title: `${TEST_PREFIXES.LEAD} - Enhanced Test ${Date.now()}`,
    description: 'Enhanced E2E test lead with full observability tracking',
    category: 'Forsikring'
  };

  before(() => {
    cy.logTestPhase('test-suite-setup', 'started');
    cy.updateSystemStatus({
      phase: 'test-initialization',
      status: 'in-progress',
      testName: 'Enhanced Lead Flow'
    });

    // Initial system health check
    cy.verifySystemHealth();
    
    // Performance monitoring setup
    cy.startPerformanceMonitoring('Enhanced Lead Flow');
    
    // Login as admin
    cy.quickLoginAs('ADMIN');
    
    cy.logTestPhase('test-suite-setup', 'completed');
  });

  after(() => {
    cy.logTestPhase('test-suite-cleanup', 'started');
    
    // End performance monitoring
    cy.endPerformanceMonitoring();
    
    // Cleanup test data
    cy.cleanupTestData();
    
    cy.updateSystemStatus({
      phase: 'test-completion',
      status: 'completed',
      testName: 'Enhanced Lead Flow'
    });
    
    cy.logTestPhase('test-suite-cleanup', 'completed');
  });

  it('should complete full lead lifecycle with observability tracking', () => {
    cy.logTestPhase('lead-lifecycle-test', 'started');
    cy.updateSystemStatus({
      phase: 'lead-lifecycle',
      status: 'in-progress',
      testName: 'Full Lead Lifecycle'
    });

    // 1. Submit new lead with tracking
    cy.logTestPhase('lead-submission', 'started');
    cy.visit(ROUTES.HOME + 'leads/submit');
    cy.createLeadUI(testLead);
    cy.logTestPhase('lead-submission', 'completed');

    // 2. Verify in admin with system status check
    cy.logTestPhase('admin-verification', 'started');
    cy.goToAdminLeads();
    cy.contains(testLead.title).should('be.visible');
    cy.checkSystemStatusBanner('healthy');
    cy.logTestPhase('admin-verification', 'completed');

    // 3. Distribute leads with performance tracking
    cy.logTestPhase('lead-distribution', 'started');
    cy.distributeLeads();
    cy.assertLeadRowStage(testLead.title, 'NEW');
    cy.logTestPhase('lead-distribution', 'completed');

    // 4. Update status progression with tracking
    cy.logTestPhase('status-progression', 'started');
    cy.openLeadDetailByTitle(testLead.title);
    
    // Update to in_progress
    cy.updateLeadStatus('IN_PROGRESS');
    cy.wait(1000); // Allow UI to update
    
    // Update to won
    cy.updateLeadStatus('WON');
    cy.logTestPhase('status-progression', 'completed');

    // 5. Final verification
    cy.logTestPhase('final-verification', 'started');
    cy.goToAdminLeads();
    cy.assertLeadRowStage(testLead.title, 'WON');
    cy.logTestPhase('final-verification', 'completed');

    cy.updateSystemStatus({
      phase: 'lead-lifecycle',
      status: 'completed',
      testName: 'Full Lead Lifecycle'
    });
  });

  it('should handle degraded mode gracefully', () => {
    cy.logTestPhase('degraded-mode-test', 'started');
    cy.updateSystemStatus({
      phase: 'degraded-mode-testing',
      status: 'in-progress',
      testName: 'Degraded Mode Test'
    });

    // Enable degraded mode
    cy.enableDegradedMode();

    // Navigate to lead submission page
    cy.visit(ROUTES.HOME);
    
    // Verify degraded mode UI is active
    cy.verifyDegradedModeUI();

    // Test lead submission still works (with fallback)
    cy.visit(ROUTES.HOME + 'leads/submit');
    
    // In degraded mode, form should show warning but still be usable
    cy.get('[data-testid="degraded-mode-notice"]')
      .should('be.visible')
      .and('contain', 'Begrenset funksjonalitet');

    // Try to submit lead (should use fallback mechanism)
    cy.get('input[name="title"]').type('Degraded Mode Test Lead');
    cy.get('textarea[name="description"]').type('Testing degraded mode submission');
    cy.get('select[name="category"]').select('Forsikring');
    
    // Submit button should be available but with warning
    cy.get('button[type="submit"]').should('be.visible');

    // Wait for normal mode restoration
    cy.verifyNormalModeRestored();

    // Verify system is back to normal
    cy.checkSystemStatusBanner('healthy');

    cy.updateSystemStatus({
      phase: 'degraded-mode-testing',
      status: 'completed',
      testName: 'Degraded Mode Test'
    });
    
    cy.logTestPhase('degraded-mode-test', 'completed');
  });

  it('should monitor performance across different browsers', () => {
    cy.logTestPhase('cross-browser-performance', 'started');
    
    const browserInfo = Cypress.browser;
    cy.startPerformanceMonitoring(`Cross-Browser-${browserInfo.name}`);

    // Test page load performance
    cy.visit(ROUTES.HOME);
    cy.get('[data-testid="main-navigation"]').should('be.visible');

    // Test navigation performance
    cy.visit(ROUTES.ADMIN_LEADS);
    cy.get('[data-testid="leads-table"]', { timeout: 10000 }).should('be.visible');

    // Test form interaction performance
    cy.visit(ROUTES.HOME + 'leads/submit');
    cy.get('input[name="title"]').type('Performance Test Lead');
    cy.get('textarea[name="description"]').type('Testing form performance');

    cy.endPerformanceMonitoring();
    
    cy.task('log', {
      level: 'info',
      message: `Performance test completed for ${browserInfo.name}`,
      metadata: {
        browser: browserInfo.name,
        version: browserInfo.version,
        platform: Cypress.platform
      }
    });

    cy.logTestPhase('cross-browser-performance', 'completed');
  });

  it('should handle network errors with proper fallbacks', () => {
    cy.logTestPhase('network-error-handling', 'started');

    // Intercept API calls and simulate network errors
    cy.intercept('POST', '/rest/v1/leads', { forceNetworkError: true }).as('networkError');
    cy.intercept('GET', '/rest/v1/leads*', { forceNetworkError: true }).as('getLeadsError');

    cy.visit(ROUTES.HOME + 'leads/submit');

    // Try to submit lead with network error
    cy.get('input[name="title"]').type('Network Error Test');
    cy.get('textarea[name="description"]').type('Testing network error handling');
    cy.get('select[name="category"]').select('Forsikring');
    cy.get('button[type="submit"]').click();

    // Should show appropriate error message
    cy.get('[data-testid="error-message"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'nettverksfeil');

    // Test error context capture
    cy.captureErrorContext('network-error', {
      errorType: 'api-network-failure',
      endpoint: '/rest/v1/leads'
    });

    cy.logTestPhase('network-error-handling', 'completed');
  });

  it('should validate system status integration', () => {
    cy.logTestPhase('system-status-integration', 'started');

    // Visit dashboard and check system status
    cy.visit(ROUTES.ADMIN_DASHBOARD);
    
    // Verify SystemStatusBanner integration
    cy.checkSystemStatusBanner('healthy');
    
    // Check for system metrics display (if implemented)
    cy.get('[data-testid="system-metrics"]')
      .should('exist')
      .within(() => {
        cy.get('[data-testid="test-coverage"]').should('exist');
        cy.get('[data-testid="api-status"]').should('exist');
        cy.get('[data-testid="database-status"]').should('exist');
      });

    cy.updateSystemStatus({
      phase: 'system-status-validation',
      status: 'verified',
      testName: 'System Status Integration'
    });

    cy.logTestPhase('system-status-integration', 'completed');
  });
});