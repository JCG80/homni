/**
 * Custom Cypress commands for E2E testing
 * Part of Hybrid Testability & QA Pass v3.1
 */

import { selectors } from './dt';
import { ROUTES, USER_ROLES, TEST_PREFIXES, PIPELINE_STAGES } from './constants';

declare global {
  namespace Cypress {
    interface Chainable {
      quickLoginAs(role: keyof typeof USER_ROLES): Chainable<void>;
      createLeadUI(lead: { title: string; description: string; category: string }): Chainable<void>;
      goToAdminLeads(): Chainable<void>;
      distributeLeads(): Chainable<void>;
      openLeadDetailByTitle(title: string): Chainable<void>;
      updateLeadStatus(stage: keyof typeof PIPELINE_STAGES): Chainable<void>;
      assertLeadRowStage(title: string, stage: keyof typeof PIPELINE_STAGES): Chainable<void>;
      cleanupTestData(): Chainable<void>;
    }
  }
}

// Quick login without password (dev mode)
Cypress.Commands.add('quickLoginAs', (role: keyof typeof USER_ROLES) => {
  cy.visit(ROUTES.LOGIN);
  cy.get(selectors.auth[`quickLogin${role.charAt(0).toUpperCase() + role.slice(1)}` as keyof typeof selectors.auth])
    .click();
  cy.url().should('include', ROUTES.DASHBOARD);
});

// Create lead via UI
Cypress.Commands.add('createLeadUI', (lead) => {
  cy.get(selectors.leadForm.title).type(lead.title);
  cy.get(selectors.leadForm.description).type(lead.description);
  cy.get(selectors.leadForm.category).select(lead.category);
  
  // Intercept the POST request
  cy.intercept('POST', '/rest/v1/leads').as('createLead');
  
  cy.get(selectors.leadForm.submit).click();
  
  // Wait for API call to complete
  cy.wait('@createLead');
  
  // Verify success toast
  cy.get(selectors.toast.success).should('be.visible');
});

// Navigate to admin leads page
Cypress.Commands.add('goToAdminLeads', () => {
  cy.visit(ROUTES.ADMIN_LEADS);
  cy.get(selectors.admin.leadsTable).should('be.visible');
});

// Trigger lead distribution
Cypress.Commands.add('distributeLeads', () => {
  // Intercept the RPC call
  cy.intercept('POST', '/rest/v1/rpc/distribute_new_lead*').as('distributeLead');
  
  cy.get(selectors.admin.distributeButton).click();
  
  // Wait for distribution to complete
  cy.wait('@distributeLead');
});

// Open lead detail by title
Cypress.Commands.add('openLeadDetailByTitle', (title: string) => {
  cy.get(selectors.admin.leadsTable)
    .contains('tr', title)
    .find(selectors.admin.leadTitle)
    .click();
});

// Update lead status
Cypress.Commands.add('updateLeadStatus', (stage: keyof typeof PIPELINE_STAGES) => {
  cy.get(selectors.leadDetail.statusSelect).select(PIPELINE_STAGES[stage]);
  cy.get(selectors.leadDetail.statusUpdate).click();
  
  // Verify status was updated
  cy.get(selectors.leadDetail.statusValue).should('contain', PIPELINE_STAGES[stage]);
});

// Assert lead row shows correct stage
Cypress.Commands.add('assertLeadRowStage', (title: string, stage: keyof typeof PIPELINE_STAGES) => {
  cy.get(selectors.admin.leadsTable)
    .contains('tr', title)
    .find(selectors.admin.leadPipelineStage)
    .should('contain', PIPELINE_STAGES[stage]);
});

// Cleanup test data (calls backend cleanup function)
Cypress.Commands.add('cleanupTestData', () => {
  cy.task('db:cleanupTestLeads', TEST_PREFIXES.LEAD);
});