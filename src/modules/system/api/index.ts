/**
 * System API Module - Centralized exports
 * 
 * This module provides system-level operations:
 * - Lead matching algorithms
 * - Real-time notifications
 * - Analytics and performance tracking
 */

// Lead matching operations
export {
  findBestMatches,
  calculateMatchScore,
  updateMatchingParameters,
  fetchMatchingStats,
  testMatchingAlgorithm,
  createMatchingOverride,
  analyzeMatchingFailures,
  type MatchingCriteria,
  type CompanyMatchResult,
  type MatchingEngineStats,
} from './lead-matching';

// Notification operations
export {
  sendNotification,
  notifyLeadAssignment,
  notifyStatusUpdate,
  notifyBudgetAlert,
  fetchUserNotifications,
  markNotificationsAsRead,
  updateNotificationPreferences,
  subscribeToUserNotifications,
  sendSystemAnnouncement,
  type NotificationData,
  type NotificationPreferences,
} from './notifications';

// Analytics operations
export {
  fetchLeadPerformanceMetrics,
  fetchCompanyPerformanceMetrics,
  fetchSystemHealthMetrics,
  trackAnalyticsEvent,
  fetchUserBehaviorAnalytics,
  generateAnalyticsReport,
  fetchRealtimeDashboardMetrics,
  setupAnalyticsAggregation,
  type LeadPerformanceMetrics,
  type CompanyPerformanceMetrics,
  type SystemHealthMetrics,
} from './analytics';