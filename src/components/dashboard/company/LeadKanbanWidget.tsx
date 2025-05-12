
import React from 'react';
import { DashboardWidget } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import type { Lead } from './LeadKanbanBoard';

interface LeadKanbanWidgetProps {
  leads: Lead[];
  onLeadStatusChange: (leadId: string, newStatus: string) => void;
  isLoading: boolean;
  leadCounts: {
    new: number;
    in_progress: number;
    won: number;
    lost: number;
  };
}

export const LeadKanbanWidget: React.FC<LeadKanbanWidgetProps> = ({ 
  leads, 
  onLeadStatusChange, 
  isLoading,
  leadCounts
}) => {
  return (
    <DashboardWidget 
      title={
        <div className="flex justify-between items-center">
          <span>Mine Leads</span>
          <div className="flex gap-2">
            <Badge variant="secondary">Nye: {leadCounts.new}</Badge>
            <Badge variant="secondary">I arbeid: {leadCounts.in_progress}</Badge>
            <Badge variant="secondary">Vunnet: {leadCounts.won}</Badge>
            <Badge variant="secondary">Tapt: {leadCounts.lost}</Badge>
          </div>
        </div>
      }
    >
      <LeadKanbanBoard 
        leads={leads} 
        onLeadStatusChange={onLeadStatusChange}
        isLoading={isLoading}
      />
    </DashboardWidget>
  );
};
