/**
 * E2E Test: Complete lead flow from guest submission to admin pipeline management
 * Part of Hybrid Testability & QA Pass v3.1
 */

import { selectors } from '../support/dt';
import { ROUTES, PIPELINE_STAGES, USER_ROLES, TEST_PREFIXES } from '../support/constants';

describe('Lead Flow E2E', () => {
  const testLead = {
    title: `${TEST_PREFIXES.LEAD} ${Date.now()}`,
    description: 'E2E test lead for automated pipeline testing',
    category: 'insurance'
  };

  beforeEach(() => {
    // Cleanup any existing test data
    cy.cleanupTestData();
  });

  after(() => {
    // Final cleanup
    cy.cleanupTestData();
  });

  it('should complete full lead lifecycle: guest → lead → admin → distribute → pipeline', () => {
    // Step 1: Guest creates lead
    cy.log('🌟 Step 1: Guest creates lead');
    cy.visit(ROUTES.HOME);
    cy.createLeadUI(testLead);

    // Step 2: Admin logs in and views leads
    cy.log('👨‍💼 Step 2: Admin accesses lead management');
    cy.quickLoginAs(USER_ROLES.ADMIN);
    cy.goToAdminLeads();

    // Verify lead appears in table
    cy.get(selectors.admin.leadsTable)
      .should('contain', testLead.title);

    // Step 3: Distribute leads
    cy.log('📡 Step 3: Distribute leads to marketplace');
    cy.distributeLeads();

    // Verify lead status updated
    cy.assertLeadRowStage(testLead.title, PIPELINE_STAGES.NEW);

    // Step 4: Move through pipeline stages
    cy.log('🔄 Step 4: Progress through pipeline stages');
    
    // Open lead detail
    cy.openLeadDetailByTitle(testLead.title);

    // Move to in_progress
    cy.updateLeadStatus(PIPELINE_STAGES.IN_PROGRESS);
    
    // Go back to list and verify
    cy.goToAdminLeads();
    cy.assertLeadRowStage(testLead.title, PIPELINE_STAGES.IN_PROGRESS);

    // Move to won
    cy.openLeadDetailByTitle(testLead.title);
    cy.updateLeadStatus(PIPELINE_STAGES.WON);
    
    // Final verification
    cy.goToAdminLeads();
    cy.assertLeadRowStage(testLead.title, PIPELINE_STAGES.WON);

    cy.log('✅ Lead flow completed successfully');
  });

  it('should handle lead distribution idempotency', () => {
    cy.log('🔁 Testing lead distribution idempotency');
    
    // Create lead as guest
    cy.visit(ROUTES.HOME);
    cy.createLeadUI({
      ...testLead,
      title: `${testLead.title} Idempotency`
    });

    // Admin distributes multiple times
    cy.quickLoginAs(USER_ROLES.ADMIN);
    cy.goToAdminLeads();
    
    // First distribution
    cy.distributeLeads();
    
    // Second distribution (should be idempotent)
    cy.distributeLeads();
    
    // Should only have one assignment per lead
    cy.get(selectors.admin.leadsTable)
      .contains('tr', `${testLead.title} Idempotency`)
      .should('have.length', 1);
  });

  it('should show correct emoji mapping for pipeline stages', () => {
    cy.log('🎨 Testing pipeline stage emoji mapping');
    
    cy.visit(ROUTES.HOME);
    cy.createLeadUI({
      ...testLead,
      title: `${testLead.title} Emoji Test`
    });

    cy.quickLoginAs(USER_ROLES.ADMIN);
    cy.goToAdminLeads();
    
    // Check each stage has correct emoji
    const stages = [
      { stage: PIPELINE_STAGES.NEW, emoji: '✨' },
      { stage: PIPELINE_STAGES.IN_PROGRESS, emoji: '🚀' },
      { stage: PIPELINE_STAGES.WON, emoji: '🏆' },
      { stage: PIPELINE_STAGES.LOST, emoji: '❌' }
    ];

    stages.forEach(({ stage, emoji }) => {
      cy.openLeadDetailByTitle(`${testLead.title} Emoji Test`);
      cy.updateLeadStatus(stage as keyof typeof PIPELINE_STAGES);
      cy.goToAdminLeads();
      
      cy.get(selectors.admin.leadsTable)
        .contains('tr', `${testLead.title} Emoji Test`)
        .find(selectors.admin.leadPipelineStage)
        .should('contain', emoji);
    });
  });
});