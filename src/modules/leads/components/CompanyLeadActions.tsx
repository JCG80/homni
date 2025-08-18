
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead, LeadStatus, STATUS_LABELS } from '@/types/leads';
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

  const handleStatusUpdate = async (newStatus: LeadStatus) => {
    try {
      await updateLeadStatus(lead.id, newStatus);
      
      toast({
        title: "Status oppdatert",
        description: `Lead status endret til ${STATUS_LABELS[newStatus]}`,
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
        <Badge variant="outline">{STATUS_LABELS[lead.status]}</Badge>
      </div>
      
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={() => handleStatusUpdate('qualified')}
          disabled={lead.status === 'qualified'}
        >
          Mark as Qualified
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => handleStatusUpdate('converted')}
          variant="default"
          disabled={lead.status === 'converted'}
        >
          Mark as Won
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => handleStatusUpdate('lost')}
          variant="destructive"
          disabled={lead.status === 'lost'}
        >
          Mark as Lost
        </Button>
      </div>
    </div>
  );
};
