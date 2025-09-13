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

// Lead management operations (simplified)
// TODO: Implement company-leads.ts when lead_assignments table is ready

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