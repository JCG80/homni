import React from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { LeadPipelineBoard } from '@/modules/leads/components/ProviderDashboard/LeadPipelineBoard';

export default function ProviderPipelinePage() {
  return (
    <RequireAuth roles={['company']}>
      <div className="container mx-auto py-6">
        <LeadPipelineBoard />
      </div>
    </RequireAuth>
  );
}