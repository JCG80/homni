
import React from 'react';
import { Card } from '@/components/ui/card';

interface LeadHistoryProps {
  leadId: string;
}

export const LeadHistory: React.FC<LeadHistoryProps> = ({ leadId }) => {
  // This is a placeholder component that would typically fetch history from an API
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Ingen historikk tilgjengelig.</p>
      <Card className="p-4 border border-dashed">
        <p className="text-center text-muted-foreground">Historikkfunksjon er under utvikling</p>
      </Card>
    </div>
  );
};
