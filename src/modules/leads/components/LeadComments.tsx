
import React from 'react';
import { Card } from '@/components/ui/card';

interface LeadCommentsProps {
  leadId: string;
}

export const LeadComments: React.FC<LeadCommentsProps> = ({ leadId }) => {
  // This is a placeholder component that would typically fetch comments from an API
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">Ingen kommentarer funnet.</p>
      <Card className="p-4 border border-dashed">
        <p className="text-center text-muted-foreground">Kommentarfunksjon er under utvikling</p>
      </Card>
    </div>
  );
};
