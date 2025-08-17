
import React from 'react';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '@/types/leads';

export const LeadKanbanBoard: React.FC = () => {
  const { columns, isLoading, updateLeadStatus } = useKanbanBoard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Laster kanban-tavle...</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await updateLeadStatus(leadId, newStatus);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <Card key={column.id} className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              {column.title}
              <Badge variant="secondary" className="ml-2">
                {column.leads.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {column.leads.map((lead) => (
              <Card key={lead.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{lead.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {lead.description || 'Ingen beskrivelse'}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {lead.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString('no-NO')}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
            {column.leads.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                Ingen leads
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
