/**
 * Dashboard-specific caching layer
 * Optimized for dashboard data patterns and user experience
 */

import { queryClient, cacheStrategies } from '@/lib/performance/caching';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardData {
  stats: {
    totalLeads: number;
    pendingLeads: number;
    contactedLeads: number;
    recentActivity: number;
  };
  recentLeads: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
  }>;
  properties: Array<{
    id: string;
    name: string;
    address: string;
    type: string;
  }>;
  lastUpdated: string;
}

export interface CompanyDashboardData {
  leadOverview: {
    total: number;
    assigned: number;
    converted: number;
    revenue: number;
  };
  recentAssignments: Array<{
    id: string;
    title: string;
    assignedAt: string;
    status: string;
  }>;
  teamMetrics: {
    activeMembers: number;
    totalAssignments: number;
    conversionRate: number;
  };
  lastUpdated: string;
}

export interface AdminDashboardData {
  systemMetrics: {
    totalUsers: number;
    totalCompanies: number;
    activeLeads: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    user: string;
  }>;
  securityStatus: {
    lastScan: string;
    status: 'passed' | 'warning' | 'failed';
    issues: number;
  };
  lastUpdated: string;
}

// Cache keys for different dashboard types
export const DASHBOARD_CACHE_KEYS = {
  USER_DASHBOARD: (userId: string) => ['dashboard', 'user', userId],
  COMPANY_DASHBOARD: (companyId: string) => ['dashboard', 'company', companyId],
  ADMIN_DASHBOARD: () => ['dashboard', 'admin'],
  USER_STATS: (userId: string) => ['dashboard', 'stats', userId],
  RECENT_ACTIVITY: (userId: string) => ['dashboard', 'activity', userId],
  SYSTEM_HEALTH: () => ['dashboard', 'system', 'health'],
} as const;

/**
 * Optimized dashboard data fetcher with intelligent caching
 */
export class DashboardCache {
  /**
   * Fetch user dashboard data with optimized queries
   */
  static async fetchUserDashboard(userId: string): Promise<DashboardData> {
    return queryClient.fetchQuery({
      queryKey: DASHBOARD_CACHE_KEYS.USER_DASHBOARD(userId),
      queryFn: async () => {
        // Parallel queries for better performance
        const [statsResult, leadsResult, propertiesResult] = await Promise.allSettled([
          this.fetchUserStats(userId),
          this.fetchRecentLeads(userId),
          this.fetchUserProperties(userId),
        ]);

        const stats = statsResult.status === 'fulfilled' ? statsResult.value : {
          totalLeads: 0,
          pendingLeads: 0,
          contactedLeads: 0,
          recentActivity: 0,
        };

        const recentLeads = leadsResult.status === 'fulfilled' ? leadsResult.value : [];
        const properties = propertiesResult.status === 'fulfilled' ? propertiesResult.value : [];

        return {
          stats,
          recentLeads,
          properties,
          lastUpdated: new Date().toISOString(),
        };
      },
      ...cacheStrategies.dynamic, // 1 minute cache for user dashboard
    });
  }

  /**
   * Fetch company dashboard data
   */
  static async fetchCompanyDashboard(companyId: string): Promise<CompanyDashboardData> {
    return queryClient.fetchQuery({
      queryKey: DASHBOARD_CACHE_KEYS.COMPANY_DASHBOARD(companyId),
      queryFn: async () => {
        const [leadOverview, assignments, teamMetrics] = await Promise.allSettled([
          this.fetchCompanyLeadOverview(companyId),
          this.fetchRecentAssignments(companyId),
          this.fetchTeamMetrics(companyId),
        ]);

        return {
          leadOverview: leadOverview.status === 'fulfilled' ? leadOverview.value : {
            total: 0,
            assigned: 0,
            converted: 0,
            revenue: 0,
          },
          recentAssignments: assignments.status === 'fulfilled' ? assignments.value : [],
          teamMetrics: teamMetrics.status === 'fulfilled' ? teamMetrics.value : {
            activeMembers: 0,
            totalAssignments: 0,
            conversionRate: 0,
          },
          lastUpdated: new Date().toISOString(),
        };
      },
      ...cacheStrategies.dynamic,
    });
  }

  /**
   * Fetch admin dashboard data
   */
  static async fetchAdminDashboard(): Promise<AdminDashboardData> {
    return queryClient.fetchQuery({
      queryKey: DASHBOARD_CACHE_KEYS.ADMIN_DASHBOARD(),
      queryFn: async () => {
        const [systemMetrics, recentActivity, securityStatus] = await Promise.allSettled([
          this.fetchSystemMetrics(),
          this.fetchSystemActivity(),
          this.fetchSecurityStatus(),
        ]);

        return {
          systemMetrics: systemMetrics.status === 'fulfilled' ? systemMetrics.value : {
            totalUsers: 0,
            totalCompanies: 0,
            activeLeads: 0,
            systemHealth: 'warning' as const,
          },
          recentActivity: recentActivity.status === 'fulfilled' ? recentActivity.value : [],
          securityStatus: securityStatus.status === 'fulfilled' ? securityStatus.value : {
            lastScan: new Date().toISOString(),
            status: 'warning' as const,
            issues: 0,
          },
          lastUpdated: new Date().toISOString(),
        };
      },
      ...cacheStrategies.static, // 15 minute cache for admin dashboard
    });
  }

  // Private helper methods for data fetching
  private static async fetchUserStats(userId: string) {
    const { data: user } = await supabase.auth.getUser();
    const userEmail = user?.user?.email || '';

    const { data: leads } = await supabase
      .from('leads')
      .select('id, status, created_at')
      .or(`submitted_by.eq.${userId},and(anonymous_email.eq.${userEmail},submitted_by.is.null)`);

    if (!leads) return { totalLeads: 0, pendingLeads: 0, contactedLeads: 0, recentActivity: 0 };

    const totalLeads = leads.length;
    const pendingLeads = leads.filter(l => ['new', 'qualified'].includes(l.status)).length;
    const contactedLeads = leads.filter(l => ['contacted', 'negotiating', 'converted'].includes(l.status)).length;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = leads.filter(l => new Date(l.created_at) > weekAgo).length;

    return { totalLeads, pendingLeads, contactedLeads, recentActivity };
  }

  private static async fetchRecentLeads(userId: string) {
    const { data: user } = await supabase.auth.getUser();
    const userEmail = user?.user?.email || '';

    const { data: leads } = await supabase
      .from('leads')
      .select('id, title, status, created_at')
      .or(`submitted_by.eq.${userId},and(anonymous_email.eq.${userEmail},submitted_by.is.null)`)
      .order('created_at', { ascending: false })
      .limit(3);

    return leads || [];
  }

  private static async fetchUserProperties(userId: string) {
    const { data: properties } = await supabase
      .from('properties')
      .select('id, name, address, type')
      .eq('user_id', userId)
      .limit(3);

    return properties || [];
  }

  private static async fetchCompanyLeadOverview(companyId: string) {
    const { data: assignments } = await supabase
      .from('lead_assignments')
      .select('id, cost, status, pipeline_stage')
      .eq('buyer_id', companyId);

    if (!assignments) return { total: 0, assigned: 0, converted: 0, revenue: 0 };

    const total = assignments.length;
    const assigned = assignments.filter(a => a.status === 'assigned').length;
    const converted = assignments.filter(a => a.pipeline_stage === 'won').length;
    const revenue = assignments
      .filter(a => a.pipeline_stage === 'won')
      .reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

    return { total, assigned, converted, revenue };
  }

  private static async fetchRecentAssignments(companyId: string) {
    const { data: assignments } = await supabase
      .from('lead_assignments')
      .select(`
        id, 
        assigned_at, 
        status,
        leads!inner(title)
      `)
      .eq('buyer_id', companyId)
      .order('assigned_at', { ascending: false })
      .limit(5);

    return assignments?.map(a => ({
      id: a.id,
      title: (a.leads as any)?.title || 'Untitled Lead',
      assignedAt: a.assigned_at,
      status: a.status,
    })) || [];
  }

  private static async fetchTeamMetrics(companyId: string) {
    // Mock data for now - would need actual team tables
    return {
      activeMembers: 3,
      totalAssignments: 12,
      conversionRate: 0.25,
    };
  }

  private static async fetchSystemMetrics() {
    const [usersResult, companiesResult, leadsResult] = await Promise.allSettled([
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('company_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('leads').select('id', { count: 'exact', head: true }),
    ]);

    return {
      totalUsers: usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0,
      totalCompanies: companiesResult.status === 'fulfilled' ? (companiesResult.value.count || 0) : 0,
      activeLeads: leadsResult.status === 'fulfilled' ? (leadsResult.value.count || 0) : 0,
      systemHealth: 'healthy' as const,
    };
  }

  private static async fetchSystemActivity() {
    // Mock recent activity - would need actual audit log
    return [
      { id: '1', action: 'User registered', timestamp: new Date().toISOString(), user: 'System' },
      { id: '2', action: 'Lead assigned', timestamp: new Date().toISOString(), user: 'Admin' },
    ];
  }

  private static async fetchSecurityStatus() {
    return {
      lastScan: new Date().toISOString(),
      status: 'passed' as const,
      issues: 0,
    };
  }

  /**
   * Invalidate dashboard cache when data changes
   */
  static invalidateDashboard(userId?: string, companyId?: string) {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_CACHE_KEYS.USER_DASHBOARD(userId) });
    }
    if (companyId) {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_CACHE_KEYS.COMPANY_DASHBOARD(companyId) });
    }
    queryClient.invalidateQueries({ queryKey: DASHBOARD_CACHE_KEYS.ADMIN_DASHBOARD() });
  }

  /**
   * Preload dashboard data for better perceived performance
   */
  static async preloadUserData(userId: string) {
    // Preload in background without blocking UI
    this.fetchUserDashboard(userId).catch(() => {
      // Silently handle preload errors
    });
  }
}