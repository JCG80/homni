/**
 * Dev Doctor Configuration
 * 
 * This file allows you to customize Dev Doctor validation behavior.
 * All settings are optional - defaults will be used for missing values.
 */

module.exports = {
  // Sensitive tables that require strict RLS policies
  sensitiveTables: [
    'user_profiles',
    'profiles', 
    'users',
    'leads',
    'company_profiles',
    'todos',
    'properties',
    'documents',
    'payment_records',
    'admin_audit_log',
    'user_roles',
    'role_grants',
    'admin_actions_log',
    '_migration_log'
  ],
  
  // Required environment variables for your project
  requiredEnvVars: [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ],
  
  // Warning types to ignore (use with caution)
  ignoreWarnings: [
    // 'misplaced_packages',     // Ignore dev deps in production deps
    // 'typescript_version',     // Ignore TypeScript version warnings
    // 'eslint_compatibility'    // Ignore ESLint compatibility warnings
  ],
  
  // Notification channels (URLs from environment variables)
  notifications: {
    slack: process.env.SLACK_WEBHOOK_URL,
    teams: process.env.TEAMS_WEBHOOK_URL, 
    discord: process.env.DISCORD_WEBHOOK_URL,
    webhook: process.env.WEBHOOK_URL
  },
  
  // Custom validation rules
  customRules: {
    // Require specific packages for your project type
    requiredPackages: {
      '@supabase/supabase-js': 'Supabase integration',
      'react-router-dom': 'React routing',
      '@tanstack/react-query': 'Data fetching'
    },
    
    // Package version constraints
    versionConstraints: {
      'typescript': '>=4.9.0',
      'react': '>=18.0.0'
    }
  },
  
  // Security settings
  security: {
    // Additional security checks
    enableSecurityScan: true,
    
    // Vulnerability severity threshold
    vulnerabilityThreshold: 'moderate', // 'low', 'moderate', 'high', 'critical'
    
    // License compliance
    allowedLicenses: ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC']
  }
};