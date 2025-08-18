/**
 * Data test selector helper for Cypress tests
 * Supports both data-testid and data-cy for backward compatibility
 * Part of Hybrid Testability & QA Pass v3.1
 */

export const dt = (id: string) => `[data-testid="${id}"], [data-cy="${id}"]`;

// Common test selectors
export const selectors = {
  // Lead form
  leadForm: {
    title: dt('lead-title-input'),
    description: dt('lead-description-input'), 
    category: dt('lead-category-select'),
    submit: dt('lead-submit-button'),
  },
  
  // Admin interface
  admin: {
    leadsTable: dt('leads-table'),
    leadTitle: dt('lead-title'),
    leadPipelineStage: dt('lead-pipeline-stage'),
    distributeButton: dt('distribute-leads-button'),
  },
  
  // Lead detail
  leadDetail: {
    statusSelect: dt('lead-status-select'),
    statusUpdate: dt('lead-status-update'), 
    statusValue: dt('lead-status-value'),
  },
  
  // Auth
  auth: {
    quickLoginGuest: dt('quicklogin-guest'),
    quickLoginUser: dt('quicklogin-user'),
    quickLoginCompany: dt('quicklogin-company'),
    quickLoginAdmin: dt('quicklogin-admin'),
    quickLoginMasterAdmin: dt('quicklogin-master_admin'),
  },
  
  // Toast notifications
  toast: {
    success: dt('toast-success'),
    error: dt('toast-error'),
    warning: dt('toast-warning'),
    info: dt('toast-info'),
  },
} as const;