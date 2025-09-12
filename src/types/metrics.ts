/**
 * Consolidated metrics types for better type safety and consistency
 * Single source of truth for all metrics-related interfaces
 */

/**
 * Base metrics interface with common properties
 */
export interface BaseMetrics {
  timestamp?: string;
  metadata?: Record<string, any>;
}

/**
 * Dashboard metrics for admin views
 */
export interface DashboardMetrics extends BaseMetrics {
  totalLeads: number;
  assignedLeads: number;
  unassignedLeads: number;
  totalCompanies: number;
  activeCompanies: number;
  totalBudget: number;
  avgAssignmentCost: number;
  conversionRate: number;
  todayLeads: number;
  distributionSuccessRate: number;
}

/**
 * Company-specific metrics
 */
export interface CompanyMetrics extends BaseMetrics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  monthlyRevenue: number;
  avgLeadValue: number;
  totalCost: number;
  roi: number;
  activeUsers: number;
  revenue: number;
}

/**
 * Performance monitoring metrics
 */
export interface PerformanceMetrics extends BaseMetrics {
  componentName?: string;
  loadTime: number;
  renderTime?: number;
  pageLoadTime?: number;
  firstContentfulPaint?: number;
  first_contentful_paint?: number;
  largestContentfulPaint?: number;
  largest_contentful_paint?: number;
  cumulativeLayoutShift?: number;
  cumulative_layout_shift?: number;
  firstInputDelay?: number;
  first_input_delay?: number;
  page_route?: string;
  load_time_ms?: number;
  metric_name?: string;
  metric_unit?: string;
  service_name?: string;
  navigationTime?: number;
  cacheHitRate?: number;
  apiResponseTimes?: Record<string, number>;
  bundleSize?: number;
  memoryUsage?: number;
  networkLatency?: number;
  device_type?: string;
  network_type?: string;
}

/**
 * API and system metrics
 */
export interface ApiMetrics extends BaseMetrics {
  requestsPerMinute: number;
  errorRate: number;
  responseTime?: number;
  avgResponseTime?: number;
  uptime?: number;
  activeConnections?: number;
}

/**
 * Live/realtime metrics
 */
export interface LiveMetrics extends BaseMetrics {
  activeUsers: number;
  currentPageViews: number;
  typescript_errors?: number;
}

/**
 * Platform-wide metrics
 */
export interface PlatformMetrics extends BaseMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers?: number;
  totalCompanies: number;
  activeCompanies: number;
  totalLeads: number;
  platformRevenue: number;
  systemLoad?: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: number;
  errorRate?: number;
}

/**
 * System overview metrics
 */
export interface SystemMetrics extends BaseMetrics {
  totalUsers: number;
  activeCompanies: number;
  systemUptime: number;
  errorRate: number;
}

/**
 * Lead analytics metrics
 */
export interface LeadAnalyticsMetrics extends BaseMetrics {
  totalLeads: number;
  leadGrowth: number;
  conversionRate: number;
  avgLeadValue?: number;
  leadsByCategory?: Record<string, number>;
  total_leads?: number;
  conversion_rate?: number;
  conversionTrend?: number;
  activeAssignments?: number;
  autoAssignments?: number;
  manualAssignments?: number;
  revenueImpact?: number;
  averageResponseTime?: number;
  topCategories?: Array<{ name: string; count: number; percentage: number }>;
}

/**
 * User engagement metrics
 */
export interface UserMetrics extends BaseMetrics {
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
}

/**
 * Retention metrics
 */
export interface RetentionMetrics extends BaseMetrics {
  loginStreak: number;
  lastActiveDate: string;
  returnRate?: number;
  totalSessions?: number;
  engagementScore?: number;
}

/**
 * Revenue and financial metrics
 */
export interface RevenueMetrics extends BaseMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
}

/**
 * Property portfolio metrics
 */
export interface PropertyPortfolioMetrics extends BaseMetrics {
  totalProperties: number;
  activeListings: number;
  portfolioValue: number;
  monthlyRental: number;
  occupancyRate: number;
}

/**
 * Status metrics for system monitoring
 */
export interface StatusMetrics extends BaseMetrics {
  timestamp: string;
  phase: string;
  status: 'healthy' | 'warning' | 'error';
  details?: Record<string, any>;
}

/**
 * Lead performance tracking
 */
export interface LeadPerformanceMetrics extends BaseMetrics {
  total_leads: number;
  conversion_rate: number;
  avg_response_time: number;
  quality_score: number;
}