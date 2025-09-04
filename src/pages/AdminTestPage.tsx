/**
 * Admin test page for verifying system functionality
 */

import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { LeadDistributionTest } from '@/components/leads/LeadDistributionTest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/modules/auth/hooks';
import { TestTube, Users, TrendingUp, Settings } from 'lucide-react';

export const AdminTestPage: React.FC = () => {
  const { profile } = useAuth();

  if (!profile || !['admin', 'master_admin'].includes(profile.role || '')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You need admin privileges to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout title="System Tests">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <TestTube className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">System Tests</h1>
            <p className="text-muted-foreground">
              Test and verify system functionality
            </p>
          </div>
        </div>

        {/* System Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant="default" className="mb-2">
                  Active
                </Badge>
                <div className="text-sm text-muted-foreground">Lead Engine</div>
              </div>
              <div className="text-center">
                <Badge variant="default" className="mb-2">
                  Active
                </Badge>
                <div className="text-sm text-muted-foreground">Distribution</div>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">
                  Testing
                </Badge>
                <div className="text-sm text-muted-foreground">Notifications</div>
              </div>
              <div className="text-center">
                <Badge variant="default" className="mb-2">
                  Active
                </Badge>
                <div className="text-sm text-muted-foreground">Analytics</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Components */}
        <div className="grid gap-8">
          {/* Lead Distribution Test */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Lead Distribution Test
            </h2>
            <LeadDistributionTest />
          </div>

          {/* Future Test Components */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Company Management Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Company registration, activation, and budget management tests will be added here.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Database performance, response times, and load testing tools will be added here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};