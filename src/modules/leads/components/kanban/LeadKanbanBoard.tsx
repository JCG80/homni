
import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { LeadStatus } from '@/types/leads';
import { KanbanColumn } from '../../hooks/useKanbanBoard';
import { LeadKanbanCard } from './LeadKanbanCard';
import { Loader2 } from 'lucide-react';

interface LeadKanbanBoardProps {
  columns: KanbanColumn[];
  onLeadStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  isLoading?: boolean;
  isUpdating?: boolean;
}

/**
 * LeadKanbanBoard - A drag-and-drop kanban board for managing leads
 * 
 * Usage:
 * <LeadKanbanBoard 
 *   columns={columns} 
 *   onLeadStatusChange={handleStatusChange} 
 *   isLoading={loading}
 *   isUpdating={updating}
 * />
 * 
 * Features:
 * - Drag-and-drop between columns to change lead status
 * - Responsive layout (4 columns on desktop, 2 on tablet, 1 on mobile)
 * - Loading and updating states with visual indicators
 * 
 * @param {Array} columns - Array of column objects with id, title, and leads
 * @param {Function} onLeadStatusChange - Callback when a lead's status changes
 * @param {Boolean} isLoading - Whether the board is loading data
 * @param {Boolean} isUpdating - Whether a status update is in progress
 */
export const LeadKanbanBoard: React.FC<LeadKanbanBoardProps> = ({ 
  columns, 
  onLeadStatusChange,
  isLoading = false,
  isUpdating = false
}) => {
  
  // Handle drag end event
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If there is no destination or the item was dropped back to the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Get the destination column status
    const newStatus = destination.droppableId as LeadStatus;
    
    // Call the handler to update lead status
    onLeadStatusChange(draggableId, newStatus);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Laster inn leads...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(column => (
            <div key={column.id} className="bg-muted/30 rounded-md p-4">
              <h3 className="font-medium mb-4 flex items-center justify-between">
                {column.title}
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {column.leads.length}
                </span>
              </h3>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3 min-h-[200px]"
                  >
                    {column.leads.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <LeadKanbanCard lead={lead} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      
      {isUpdating && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Oppdaterer lead status...</span>
          </div>
        </div>
      )}
    </div>
  );
};
