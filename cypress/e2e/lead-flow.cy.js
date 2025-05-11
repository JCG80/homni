
/// <reference types="cypress" />

describe('Lead Flow', () => {
  before(() => {
    // Log in as admin
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
  });

  it('should handle complete lead flow: submission, assignment, status update, conversion', () => {
    // 1. Create a new lead
    cy.visit('/leads/submit');
    cy.get('input[name="title"]').type('Test Lead');
    cy.get('textarea[name="description"]').type('This is a test lead for E2E testing');
    cy.get('select[name="category"]').select('Forsikring');
    cy.get('button[type="submit"]').click();
    
    // Verify submission success
    cy.contains('Lead submitted successfully').should('be.visible');
    
    // 2. Go to admin area and verify the lead is visible
    cy.visit('/admin/leads');
    cy.contains('Test Lead').should('be.visible');
    
    // 3. Distribute leads
    cy.contains('Fordel leads nå').click();
    cy.contains('Leads distribuert').should('be.visible');
    
    // 4. Verify lead status changed to "assigned"
    cy.contains('Test Lead')
      .parents('tr')
      .contains('assigned')
      .should('be.visible');
    
    // 5. Update lead status to "in_progress"
    cy.contains('Test Lead').click();
    cy.get('select[name="status"]').select('in_progress');
    cy.contains('Update Status').click();
    
    // 6. Verify status update
    cy.contains('Status updated successfully').should('be.visible');
    
    // 7. Convert lead to "won"
    cy.get('select[name="status"]').select('won');
    cy.contains('Update Status').click();
    
    // 8. Verify conversion
    cy.contains('Status updated successfully').should('be.visible');
    cy.contains('won').should('be.visible');
    
    // 9. Go back to leads list and verify status update persisted
    cy.visit('/admin/leads');
    cy.contains('Test Lead')
      .parents('tr')
      .contains('won')
      .should('be.visible');
  });
});
