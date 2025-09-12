/**
 * Test component to verify lead distribution functionality
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlayCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { logger } from '@/utils/logger';

export const LeadDistributionTest: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testLeadId, setTestLeadId] = useState('');

  const createTestLead = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          title: 'Test lead for distribution',
          description: 'Testing lead distribution system',
          category: 'forsikring',
          status: 'new',
          lead_type: 'visitor',
          metadata: {
            name: 'Test Customer',
            email: 'test@example.com',
            phone: '12345678',
            source: 'distribution_test'
          }
        })
        .select()
        .single();

      if (error) throw error;

      setTestLeadId(data.id);
      toast.success('Test lead created successfully');
      return data.id;
    } catch (error) {
      logger.error('Error creating test lead:', error);
      toast.error('Failed to create test lead');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const testDistribution = async (leadId?: string) => {
    if (!leadId && !testLeadId) {
      toast.error('No lead ID provided');
      return;
    }

    const id = leadId || testLeadId;
    setLoading(true);

    try {
      // Use the enhanced distribution function with budget management
      const { data, error } = await supabase
        .rpc('distribute_new_lead_v3', { lead_id_param: id });

      if (error) throw error;

      // Check if lead was assigned
      const { data: updatedLead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (leadError) throw leadError;

      let companyName = 'Unknown company';
      if (updatedLead.company_id) {
        const { data: company } = await supabase
          .from('company_profiles')
          .select('name')
          .eq('id', updatedLead.company_id)
          .single();
        
        companyName = company?.name || 'Unknown company';
      }

      setTestResult({
        success: true,
        leadId: id,
        assigned: !!updatedLead.company_id,
        assignedTo: companyName,
        distributionResult: data,
        leadData: updatedLead
      });

      toast.success(
        updatedLead.company_id 
          ? `Lead assigned to ${companyName}`
          : 'Lead created but not assigned (no matching companies)'
      );

    } catch (error) {
      logger.error('Distribution test failed:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Distribution test failed');
    } finally {
      setLoading(false);
    }
  };

  const runFullTest = async () => {
    try {
      const leadId = await createTestLead();
      await testDistribution(leadId);
    } catch (error) {
      // Error already handled in individual functions
    }
  };

  const cleanupTestLead = async () => {
    if (!testLeadId) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', testLeadId);

      if (error) throw error;

      setTestLeadId('');
      setTestResult(null);
      toast.success('Test lead cleaned up');
    } catch (error) {
      logger.error('Error cleaning up test lead:', error);
      toast.error('Failed to cleanup test lead');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Lead Distribution Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex gap-2">
          <Button
            onClick={runFullTest}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Run Full Test
          </Button>
          
          <Button
            onClick={createTestLead}
            disabled={loading}
            variant="outline"
          >
            Create Test Lead
          </Button>

          {testLeadId && (
            <Button
              onClick={cleanupTestLead}
              variant="destructive"
              size="sm"
            >
              Cleanup
            </Button>
          )}
        </div>

        {/* Manual Test */}
        <div className="flex gap-2">
          <Input
            placeholder="Lead ID to test distribution"
            value={testLeadId}
            onChange={(e) => setTestLeadId(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => testDistribution()}
            disabled={loading || !testLeadId}
            variant="secondary"
          >
            Test Distribution
          </Button>
        </div>

        {/* Results */}
        {testResult && (
          <Card className={testResult.success ? 'border-green-200' : 'border-red-200'}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {testResult.success ? 'Test Successful' : 'Test Failed'}
                </span>
              </div>

              {testResult.success ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Lead ID:</strong> {testResult.leadId}
                  </div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <Badge variant={testResult.assigned ? 'default' : 'secondary'}>
                      {testResult.assigned ? 'Assigned' : 'Not Assigned'}
                    </Badge>
                  </div>
                  {testResult.assigned && (
                    <div>
                      <strong>Assigned to:</strong> {testResult.assignedTo}
                    </div>
                  )}
                  <div>
                    <strong>Lead Status:</strong> {testResult.leadData?.status}
                  </div>
                  {testResult.distributionResult && (
                    <div>
                      <strong>Distribution Result:</strong>{' '}
                      {JSON.stringify(testResult.distributionResult, null, 2)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  <strong>Error:</strong> {testResult.error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
          <strong>How this works:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Creates a test lead with category "forsikring"</li>
            <li>• Calls distribute_new_lead_v3() function with budget management</li>
            <li>• Checks company budget before assignment</li>
            <li>• Deducts lead cost from company budget</li>
            <li>• Records budget transaction</li>
            <li>• Shows assignment result and remaining budget</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};