import React from 'react';
import { DashboardWidget } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import { Lead } from '@/types/leads-canonical';

interface EnhancedLeadKanbanWidgetProps {
  title?: React.ReactNode;
  className?: string;
  filteredLeads?: Lead[];
  onAddLead?: () => void;
}

export const EnhancedLeadKanbanWidget: React.FC<EnhancedLeadKanbanWidgetProps> = ({ 
  title = "My Leads",
  className,
  filteredLeads,
  onAddLead
}) => {
  const { 
    columns, 
    isLoading, 
    isUpdating, 
    leadCounts, 
    updateLeadStatus,
    refreshLeads
  } = useKanbanBoard({ filteredLeads });
  
  const handleRefresh = () => {
    refreshLeads();
  };

  return (
    <DashboardWidget 
      title={
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-2">
          <div className="flex items-center gap-2">
            <span>{title}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleRefresh}
              disabled={isUpdating}
            >
              <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Nye: {leadCounts.new}</Badge>
            <Badge variant="secondary">I gang: {leadCounts.in_progress}</Badge>
            <Badge variant="secondary">Vunnet: {leadCounts.won}</Badge>
            <Badge variant="secondary">Tapt: {leadCounts.lost}</Badge>
          </div>
        </div>
      }
      className={className}
    >
      <LeadKanbanBoard 
        columns={columns}
        onLeadStatusChange={updateLeadStatus}
        onAddLead={onAddLead}
        isLoading={isLoading}
        isUpdating={isUpdating}
      />
    </DashboardWidget>
  );
};