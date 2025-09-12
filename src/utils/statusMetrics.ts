/**
 * Utility functions for status metrics collection and validation
 * Used by the automated status update system
 */

export interface StatusMetrics {
  timestamp: string;
  phase: string;
  completion_percentage: {
    documentation: number;
    code_quality: number;
    performance: number;
    security: number;
  };
  database_status: {
    rls_warnings: number;
    jsonb_indexes: number;
    constraints_complete: number;
  };
  typescript: {
    error_count: number;
    duplicates_found: number;
    bundle_size: string;
  };
  profile_counts: {
    guest: number;
    user: number;
    company: number;
    admin: number;
    master_admin: number;
  };
}

/**
 * Validates that a status file contains required sections
 */
export const validateStatusStructure = (content: string): { valid: boolean; missing: string[] } => {
  const requiredSections = [
    '## 📍 **NÅVÆRENDE FASE-STATUS**',
    '## 🗃️ **DATABASE-STATUS & FORBEDRINGER**',
    '## 🛠️ **TYPESCRIPT & TEKNISK GJELD**',
    '## 🚦 **NAVIGASJON & ARKITEKTUR**',
    '## 👥 **PROFILBASERT FREMDRIFT**',
    '## 🎯 **CORE FEATURES (Live i prod)**',
    '## 🚧 **IN PROGRESS (Utvikles nå)**',
    '## 📋 **BACKLOG PRIORITERING**',
    '## 🔒 **TECHNICAL DEBT**',
    '## 📊 **METRICS SNAPSHOT**'
  ];

  const missing = requiredSections.filter(section => !content.includes(section));
  
  return {
    valid: missing.length === 0,
    missing
  };
};

/**
 * Extracts current metrics from status content
 */
export const extractMetricsFromStatus = (content: string): Partial<StatusMetrics> => {
  const metrics: Partial<StatusMetrics> = {};

  // Extract TypeScript errors
  const tsErrorMatch = content.match(/\*\*TypeScript:\*\* (\d+) errors/);
  if (tsErrorMatch) {
    metrics.typescript = {
      error_count: parseInt(tsErrorMatch[1]),
      duplicates_found: 0,
      bundle_size: ""
    };
  }

  // Extract Supabase warnings
  const supabaseMatch = content.match(/(\d+) Supabase linter warnings/);
  if (supabaseMatch) {
    metrics.database_status = {
      rls_warnings: parseInt(supabaseMatch[1]),
      jsonb_indexes: 0,
      constraints_complete: 0
    };
  }

  // Extract bundle size
  const bundleMatch = content.match(/\*\*Bundle size:\*\* (\d+KB)/);
  if (bundleMatch && metrics.typescript) {
    metrics.typescript.bundle_size = bundleMatch[1];
  }

  return metrics;
};

/**
 * Updates status content with new metrics
 */
export const updateStatusWithMetrics = (content: string, metrics: StatusMetrics): string => {
  let updated = content;

  // Update timestamp
  const currentDate = new Date().toISOString().split('T')[0];
  updated = updated.replace(/\*Status per \d{4}-\d{2}-\d{2}/, `*Status per ${currentDate}`);

  // Update TypeScript errors
  if (metrics.typescript?.error_count !== undefined) {
    updated = updated.replace(
      /(\*\*TypeScript:\*\*) \d+ errors/,
      `$1 ${metrics.typescript.error_count} errors`
    );
  }

  // Update Supabase warnings
  if (metrics.database_status?.rls_warnings !== undefined) {
    updated = updated.replace(
      /(\d+) Supabase linter warnings/g,
      `${metrics.database_status.rls_warnings} Supabase linter warnings`
    );
  }

  // Update bundle size
  if (metrics.typescript?.bundle_size) {
    updated = updated.replace(
      /(\*\*Bundle size:\*\*) \d+KB/,
      `$1 ${metrics.typescript.bundle_size}`
    );
  }

  return updated;
};

/**
 * Mock function for development - simulates gathering live metrics
 */
export const gatherLiveMetrics = async (): Promise<StatusMetrics> => {
  // In production, this would call actual system APIs
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    timestamp: new Date().toISOString(),
    phase: "Phase 2B: Repository Standardization",
    completion_percentage: {
      documentation: 95,
      code_quality: 78,
      performance: 45,
      security: 34
    },
    database_status: {
      rls_warnings: 66,
      jsonb_indexes: 8,
      constraints_complete: 90
    },
    typescript: {
      error_count: 0,
      duplicates_found: 5,
      bundle_size: "180KB"
    },
    profile_counts: {
      guest: 0,
      user: 0,
      company: 0,
      admin: 1,
      master_admin: 1
    }
  };
};