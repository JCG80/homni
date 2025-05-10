
import React from 'react';
import { LeadSettingsForm } from '../components/LeadSettingsForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { useLeads } from '../hooks/useLeads';

export const LeadSettingsPage = () => {
  const { isLoading, error, settings, updateSettings } = useLeads();
  
  return (
    <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Lead Distribution Settings</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Configure Lead Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <LeadSettingsForm 
                initialSettings={settings} 
                onSubmit={updateSettings} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};
