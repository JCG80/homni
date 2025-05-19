
import React from 'react';
import { DashboardWidget } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';

interface LeadKanbanWidgetProps {
  title?: React.ReactNode;
  className?: string;
}

export const LeadKanbanWidget: React.FC<LeadKanbanWidgetProps> = ({ 
  title = "My Leads",
  className 
}) => {
  const { 
    columns, 
    isLoading, 
    isUpdating, 
    leadCounts, 
    updateLeadStatus,
    refreshLeads
  } = useKanbanBoard();
  
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
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">New: {leadCounts.new}</Badge>
            <Badge variant="secondary">In Progress: {leadCounts.in_progress}</Badge>
            <Badge variant="secondary">Won: {leadCounts.won}</Badge>
            <Badge variant="secondary">Lost: {leadCounts.lost}</Badge>
          </div>
        </div>
      }
      className={className}
    >
      <LeadKanbanBoard 
        columns={columns}
        onLeadStatusChange={updateLeadStatus}
        isLoading={isLoading}
        isUpdating={isUpdating}
      />
    </DashboardWidget>
  );
};
