/**
 * Database Query Optimization Utilities
 */

// Query optimization patterns
export const optimizedQueries = {
  // Batch queries for better performance
  batchUserData: `
    WITH user_data AS (
      SELECT 
        up.*,
        cp.name as company_name,
        cp.status as company_status,
        COUNT(l.id) as lead_count
      FROM user_profiles up
      LEFT JOIN company_profiles cp ON up.company_id = cp.id
      LEFT JOIN leads l ON l.submitted_by = up.user_id
      WHERE up.user_id = $1
      GROUP BY up.id, cp.id
    )
    SELECT * FROM user_data;
  `,

  // Optimized dashboard metrics with single query
  dashboardMetrics: `
    WITH metrics AS (
      SELECT 
        COUNT(DISTINCT l.id) as total_leads,
        COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'converted') as converted_leads,
        COUNT(DISTINCT cp.id) as active_companies,
        COUNT(DISTINCT up.id) as total_users,
        AVG(CASE WHEN l.status = 'converted' THEN 1 ELSE 0 END) as conversion_rate
      FROM leads l
      FULL OUTER JOIN company_profiles cp ON cp.status = 'active'
      FULL OUTER JOIN user_profiles up ON up.deleted_at IS NULL
      WHERE l.created_at >= NOW() - INTERVAL '30 days'
    )
    SELECT * FROM metrics;
  `,

  // Optimized lead listing with pagination
  paginatedLeads: `
    SELECT 
      l.*,
      up.full_name as submitted_by_name,
      cp.name as company_name
    FROM leads l
    LEFT JOIN user_profiles up ON l.submitted_by = up.user_id
    LEFT JOIN company_profiles cp ON l.company_id = cp.id
    WHERE l.deleted_at IS NULL
    ORDER BY l.created_at DESC
    LIMIT $1 OFFSET $2;
  `,

  // Analytics query with aggregation
  analyticsData: `
    SELECT 
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as count,
      status,
      category
    FROM leads 
    WHERE created_at >= $1 AND created_at <= $2
    GROUP BY DATE_TRUNC('day', created_at), status, category
    ORDER BY date DESC;
  `,
};

// Database indexing recommendations
export const indexRecommendations = [
  {
    table: 'leads',
    indexes: [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_company_status ON leads(company_id, status) WHERE company_id IS NOT NULL;',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_submitted_by_created ON leads(submitted_by, created_at DESC) WHERE submitted_by IS NOT NULL;',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_category ON leads(category);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_anonymous_email ON leads(anonymous_email) WHERE anonymous_email IS NOT NULL;',
    ],
  },
  {
    table: 'user_profiles',
    indexes: [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id) WHERE company_id IS NOT NULL;',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_active ON user_profiles(user_id) WHERE deleted_at IS NULL;',
    ],
  },
  {
    table: 'company_profiles',
    indexes: [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_profiles_status ON company_profiles(status);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_profiles_tags ON company_profiles USING GIN(tags);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_profiles_budget ON company_profiles(current_budget) WHERE current_budget > 0;',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_profiles_active ON company_profiles(id) WHERE deleted_at IS NULL;',
    ],
  },
  {
    table: 'analytics_events',
    indexes: [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_type_created ON analytics_events(event_type, created_at DESC);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);',
    ],
  },
];

// Query performance monitoring
export const queryPerformanceMonitor = {
  // Track slow queries
  trackSlowQuery: (queryName: string, duration: number, threshold = 1000) => {
    if (duration > threshold) {
      console.warn(`[SLOW QUERY] ${queryName} took ${duration}ms`);
      
      // In production, send to monitoring service
      if (import.meta.env.PROD) {
        // Send to analytics/monitoring
        fetch('/api/performance/slow-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queryName,
            duration,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Silently fail to avoid cascading issues
        });
      }
    }
  },

  // Wrapper for timing database queries
  timeQuery: async <T>(queryName: string, queryFn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await queryFn();
      const duration = performance.now() - start;
      queryPerformanceMonitor.trackSlowQuery(queryName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`[QUERY ERROR] ${queryName} failed after ${duration}ms:`, error);
      throw error;
    }
  },
};

// Connection pool optimization
export const connectionOptimization = {
  // Recommended Supabase pool settings
  poolSettings: {
    // For high-traffic applications
    production: {
      pool_size: 15,
      pool_timeout: 10,
      pool_recycle: 300,
      pool_pre_ping: true,
    },
    // For development
    development: {
      pool_size: 5,
      pool_timeout: 10,
      pool_recycle: -1,
      pool_pre_ping: true,
    },
  },

  // Query batching utilities
  batchQueries: async (queries: Array<{ query: string; params?: any[] }>) => {
    // Execute multiple queries in a single transaction
    const batchQuery = `
      BEGIN;
      ${queries.map((q, i) => `-- Query ${i + 1}\n${q.query};`).join('\n')}
      COMMIT;
    `;
    
    return batchQuery;
  },
};

// Performance monitoring queries
export const performanceQueries = {
  // Get table sizes and analyze growth
  tableSizes: `
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
      pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  `,

  // Identify missing indexes
  missingIndexes: `
    SELECT 
      schemaname,
      tablename,
      attname,
      n_distinct,
      correlation
    FROM pg_stats 
    WHERE schemaname = 'public'
    AND n_distinct > 100
    ORDER BY n_distinct DESC;
  `,

  // Query performance stats
  queryStats: `
    SELECT 
      query,
      calls,
      total_time,
      mean_time,
      rows
    FROM pg_stat_statements 
    WHERE query LIKE '%public.%'
    ORDER BY mean_time DESC
    LIMIT 20;
  `,
};