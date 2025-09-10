
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadSettingsForm } from '../components/LeadSettingsForm';

export const LeadSettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Lead-innstillinger</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lead-distribusjon</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadSettingsForm />
        </CardContent>
      </Card>
    </div>
  );
};
