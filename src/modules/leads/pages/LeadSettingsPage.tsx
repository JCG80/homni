
import React from 'react';
import { LeadSettingsForm } from '../components/LeadSettingsForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { fetchLeadSettings, updateLeadSettings } from '../api/leadSettings';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { LeadSettings } from '@/types/leads';

export const LeadSettingsPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<LeadSettings | null>(null);
  
  // Fetch settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const settingsData = await fetchLeadSettings();
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to load lead settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
        toast({
          title: "Error loading settings",
          description: "Could not load lead distribution settings",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Function to update settings
  const handleUpdateSettings = async (updatedSettings: Partial<LeadSettings>) => {
    try {
      await updateLeadSettings(updatedSettings);
      // Refresh settings after update
      const newSettings = await fetchLeadSettings();
      setSettings(newSettings);
      
      toast({
        title: "Settings updated",
        description: "Lead distribution settings have been saved",
      });
      
      return true;
    } catch (err) {
      console.error('Failed to update settings:', err);
      toast({
        title: "Update failed",
        description: "Could not save lead distribution settings",
        variant: "destructive"
      });
      return false;
    }
  };
  
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
              <LeadSettingsForm />
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};
