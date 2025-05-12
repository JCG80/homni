
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { LeadCard } from './LeadCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Define lead types
export interface Lead {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  description: string;
  status: string;
  created_at: string;
  company_id: string;
}

// Define column types
interface Column {
  id: string;
  title: string;
  leadIds: string[];
}

interface LeadKanbanBoardProps {
  leads: Lead[];
  onLeadStatusChange: (leadId: string, newStatus: string) => void;
  isLoading?: boolean;
}

export const LeadKanbanBoard: React.FC<LeadKanbanBoardProps> = ({ 
  leads, 
  onLeadStatusChange,
  isLoading = false
}) => {
  // Status mapping for readability
  const statusMap: Record<string, { id: string, title: string }> = {
    'new': { id: 'new', title: 'Nye' },
    'in_progress': { id: 'in_progress', title: 'I arbeid' },
    'won': { id: 'won', title: 'Vunnet' },
    'lost': { id: 'lost', title: 'Tapt' }
  };
  
  // Convert leads to columns data structure
  const generateColumns = () => {
    const columns: Record<string, Column> = {};
    
    // Initialize empty columns
    Object.values(statusMap).forEach(status => {
      columns[status.id] = {
        id: status.id,
        title: status.title,
        leadIds: []
      };
    });
    
    // Add leads to appropriate columns
    leads.forEach(lead => {
      if (columns[lead.status]) {
        columns[lead.status].leadIds.push(lead.id);
      }
    });
    
    return columns;
  };
  
  const [columns, setColumns] = useState(generateColumns());
  
  // Construct a lead lookup map for quick access
  const leadMap = leads.reduce((acc, lead) => {
    acc[lead.id] = lead;
    return acc;
  }, {} as Record<string, Lead>);
  
  // Handle drag end event
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    
    // If there is no destination or the item was dropped back to the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Get source and destination column
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    
    // Update columns state
    const sourceLeadIds = Array.from(sourceColumn.leadIds);
    sourceLeadIds.splice(source.index, 1);
    
    const destLeadIds = Array.from(destColumn.leadIds);
    destLeadIds.splice(destination.index, 0, draggableId);
    
    const newColumns = {
      ...columns,
      [sourceColumn.id]: {
        ...sourceColumn,
        leadIds: sourceLeadIds
      },
      [destColumn.id]: {
        ...destColumn,
        leadIds: destLeadIds
      }
    };
    
    setColumns(newColumns);
    
    // Call the parent handler to update the lead status
    onLeadStatusChange(draggableId, destination.droppableId);
  };
  
  return (
    <div className="p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(columns).map(column => (
            <div key={column.id} className="bg-muted/30 rounded-md p-4">
              <h3 className="font-medium mb-4 flex items-center justify-between">
                {column.title}
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {column.leadIds.length}
                </span>
              </h3>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3 min-h-[200px]"
                  >
                    {column.leadIds.map((leadId, index) => {
                      const lead = leadMap[leadId];
                      return (
                        <Draggable key={leadId} draggableId={leadId} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <LeadCard lead={lead} />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      
      {isLoading && (
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
