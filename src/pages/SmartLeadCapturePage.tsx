import React from 'react';
import { SmartLeadWizard } from '@/modules/leads/components/SmartLeadCapture/SmartLeadWizard';

export default function SmartLeadCapturePage() {
  return (
    <div className="container mx-auto py-8">
      <SmartLeadWizard 
        onSuccess={() => {
          window.location.href = '/';
        }}
        onCancel={() => {
          window.location.href = '/';
        }}
      />
    </div>
  );
}