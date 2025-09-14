import { useState, useEffect } from 'react';

export interface DevDoctorReport {
  timestamp: string;
  version: string;
  environment: {
    node_version: string;
    platform: string;
    ci: boolean;
  };
  summary: {
    status: 'success' | 'warning' | 'error';
    total_checks: number;
    passed: number;
    warnings: number;
    errors: number;
  };
  dependencies: {
    version_conflicts: boolean;
    corrupted_packages: number;
    misplaced_packages: number;
    details: Array<{
      type: string;
      packages?: string[];
      severity: string;
    }>;
  };
  supabase: {
    environment_configured: boolean;
    rls_policies_checked: boolean;
    critical_security_issues: string[];
    warnings: string[];
  };
  lovable: {
    integration_complete: boolean;
    missing_packages: string[];
    structure_issues: string[];
  };
  recommendations: Array<{
    category: string;
    priority: string;
    message: string;
    tables?: string[];
    checks?: string[];
  }>;
  artifacts: string[];
}

export interface DevDoctorStatus {
  report: DevDoctorReport | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

/**
 * Hook to fetch and manage Dev Doctor status reports
 * In production, this would fetch from CI artifacts or a status API
 * For now, provides structured mock data for development
 */
export const useDevDoctorStatus = (): DevDoctorStatus => {
  const [status, setStatus] = useState<DevDoctorStatus>({
    report: null,
    isLoading: true,
    lastUpdated: null,
    error: null
  });

  useEffect(() => {
    const fetchDevDoctorStatus = async () => {
      try {
        // TODO: In production, fetch from GitHub Actions artifacts API
        // const response = await fetch('/api/dev-doctor/latest');
        // const report = await response.json();
        
        // Mock data for development - represents a successful report
        const mockReport: DevDoctorReport = {
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          environment: {
            node_version: 'v20.11.0',
            platform: 'linux',
            ci: false
          },
          summary: {
            status: 'success',
            total_checks: 15,
            passed: 13,
            warnings: 2,
            errors: 0
          },
          dependencies: {
            version_conflicts: false,
            corrupted_packages: 0,
            misplaced_packages: 2,
            details: [
              {
                type: 'misplaced_packages',
                packages: ['typescript', '@types/node'],
                severity: 'warning'
              }
            ]
          },
          supabase: {
            environment_configured: true,
            rls_policies_checked: true,
            critical_security_issues: [],
            warnings: ['Manual RLS policy review recommended']
          },
          lovable: {
            integration_complete: true,
            missing_packages: [],
            structure_issues: []
          },
          recommendations: [
            {
              category: 'security',
              priority: 'medium',
              message: 'Review RLS policies for sensitive tables',
              tables: ['user_profiles', 'company_profiles'],
              checks: [
                'Verify policies check auth.uid() for user-specific data',
                'Ensure no "true" conditions on sensitive tables'
              ]
            }
          ],
          artifacts: ['dev-doctor-report.json']
        };

        setTimeout(() => {
          setStatus({
            report: mockReport,
            isLoading: false,
            lastUpdated: new Date(),
            error: null
          });
        }, 500); // Simulate network delay

      } catch (error) {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch Dev Doctor status'
        }));
      }
    };

    fetchDevDoctorStatus();

    // Refresh every 5 minutes in production
    const interval = setInterval(fetchDevDoctorStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return status;
};