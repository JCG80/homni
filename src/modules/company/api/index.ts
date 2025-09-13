/**
 * Company API Module - Centralized exports
 * 
 * This module provides all company-related API functions:
 * - Profile management
 * - Lead reception and pipeline management  
 * - Budget and billing operations
 */

// Company profile operations
export {
  fetchCompanyProfile,
  upsertCompanyProfile,
  updateCompanyBudget,
  fetchBudgetTransactions,
  fetchCompanyStats,
  type CompanyProfileData,
  type BudgetUpdateData,
} from './company-profiles';

// Lead management operations
export {
  fetchCompanyLeads,
  updateLeadPipeline,
  respondToLeadAssignment,
  fetchPipelineStats,
  completeLeadAssignment,
  type CompanyLead,
  type LeadAssignment,
  type PipelineUpdate,
} from './company-leads';

// Billing and budget operations
export {
  fetchBudgetStatus,
  addBudget,
  fetchSpendingHistory,
  fetchBudgetAlerts,
  updateBudgetSettings,
  checkBudgetAvailability,
  prepareStripeIntegration,
  type BudgetStatus,
  type SpendingHistory,
  type BudgetAlert,
} from './company-billing';