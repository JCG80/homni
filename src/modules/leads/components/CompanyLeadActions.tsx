
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead, LeadStatus, mapToEmojiStatus } from '@/types/leads';
import { updateLeadStatus } from '../api/lead-update';
import { useToast } from '@/hooks/use-toast';

interface CompanyLeadActionsProps {
  lead: Lead;
  onLeadUpdate: () => void;
}

export const CompanyLeadActions: React.FC<CompanyLeadActionsProps> = ({ 
  lead, 
  onLeadUpdate 
}) => {
  const { toast } = useToast();

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      // Convert string to LeadStatus and then to emoji status
      const emojiStatus = mapToEmojiStatus(newStatus);
      await updateLeadStatus(lead.id, emojiStatus as LeadStatus);
      
      toast({
        title: "Status oppdatert",
        description: `Lead status endret til ${newStatus}`,
      });
      
      onLeadUpdate();
    } catch (error: any) {
      toast({
        title: "Feil ved oppdatering",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Lead Actions</h3>
        <Badge variant="outline">{lead.status}</Badge>
      </div>
      
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={() => handleStatusUpdate('🚀 in_progress')}
          disabled={lead.status === '🚀 in_progress'}
        >
          Mark as In Progress
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => handleStatusUpdate('🏆 won')}
          variant="default"
          disabled={lead.status === '🏆 won'}
        >
          Mark as Won
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => handleStatusUpdate('❌ lost')}
          variant="destructive"
          disabled={lead.status === '❌ lost'}
        >
          Mark as Lost
        </Button>
      </div>
    </div>
  );
};
