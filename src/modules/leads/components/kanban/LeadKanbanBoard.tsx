
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader, Mail, Phone, Calendar, Tag, Plus } from 'lucide-react';
import { KanbanColumn, LeadKanbanBoardProps } from './types';
import { LeadDetailsModal } from './LeadDetailsModal';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

export const LeadKanbanBoard: React.FC<LeadKanbanBoardProps> = ({
  columns,
  onLeadStatusChange,
  onAddLead,
  isLoading,
  isUpdating
}) => {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading leads...</span>
      </div>
    );
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const targetColumn = columns.find(col => col.id === destination.droppableId);
    if (targetColumn) {
      onLeadStatusChange(draggableId, targetColumn.status);
    }
  };

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case 'new': return 'border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent';
      case 'in_progress': return 'border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent';
      case 'won': return 'border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent';
      case 'lost': return 'border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent';
      default: return 'border-l-gray-500';
    }
  };

  const getStatusIcon = (columnId: string) => {
    switch (columnId) {
      case 'new': return '✨';
      case 'in_progress': return '🚀';
      case 'won': return '🏆';
      case 'lost': return '❌';
      default: return '📋';
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {columns.map((column) => (
          <Card key={column.id} className={`flex flex-col h-fit min-h-[400px] border-l-4 ${getColumnColor(column.id)} transition-all hover:shadow-md`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(column.id)}</span>
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {column.count}
                  </Badge>
                  {onAddLead && column.id === 'new' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => onAddLead()}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-3">
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[300px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-muted/50 border-2 border-dashed border-primary' : ''
                    }`}
                  >
                    {column.leads.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground text-xs">
                          {column.id === 'new' ? 'Dra nye leads hit' : 'Ingen leads'}
                        </div>
                      </div>
                    ) : (
                      column.leads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 cursor-pointer hover:shadow-md transition-all border ${
                                snapshot.isDragging ? 'shadow-lg rotate-3 border-primary' : 'hover:border-primary/50'
                              } ${isUpdating ? 'opacity-60' : ''}`}
                              onClick={() => setSelectedLead(lead.id)}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-medium text-sm line-clamp-2 flex-1 pr-2">
                                    {lead.title}
                                  </h4>
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {lead.category}
                                  </Badge>
                                </div>
                                
                                {lead.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {lead.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {formatDistanceToNow(new Date(lead.created_at), { 
                                      addSuffix: true, 
                                      locale: nb 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedLead && (
        <LeadDetailsModal
          leadId={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={onLeadStatusChange}
        />
      )}
    </DragDropContext>
  );
};
