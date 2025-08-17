
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from 'lucide-react';
import { KanbanColumn, LeadKanbanBoardProps } from './types';

export const LeadKanbanBoard: React.FC<LeadKanbanBoardProps> = ({
  columns,
  onLeadStatusChange,
  isLoading,
  isUpdating
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading leads...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => (
        <Card key={column.id} className="h-fit">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {column.count}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {column.leads.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No leads
                </p>
              ) : (
                column.leads.map((lead) => (
                  <Card key={lead.id} className="p-2 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="text-xs font-medium mb-1 truncate">
                      {lead.title}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {lead.category}
                    </div>
                    {lead.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {lead.description}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
