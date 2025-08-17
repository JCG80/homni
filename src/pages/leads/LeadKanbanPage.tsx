import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Phone, Mail } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Lead {
  id: string;
  title: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: 'new' | 'in_progress' | 'won' | 'lost';
  created_at: string;
  budget?: string;
}

const mockLeads: Lead[] = [
  {
    id: '1',
    title: 'Boligforsikring for enebolig',
    contact_name: 'Ola Nordmann',
    contact_email: 'ola@example.com',
    contact_phone: '+47 123 45 678',
    status: 'new',
    created_at: '2024-01-15',
    budget: '5000 kr/år'
  },
  {
    id: '2',
    title: 'Innboforsikring for leilighet',
    contact_name: 'Kari Hansen',
    contact_email: 'kari@example.com',
    contact_phone: '+47 987 65 432',
    status: 'in_progress',
    created_at: '2024-01-14',
    budget: '2500 kr/år'
  }
];

const columns = [
  { id: 'new', title: 'Nye ✨', color: 'bg-blue-50 border-blue-200' },
  { id: 'in_progress', title: 'I gang 🚀', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'won', title: 'Vunnet 🏆', color: 'bg-green-50 border-green-200' },
  { id: 'lost', title: 'Tapt ❌', color: 'bg-red-50 border-red-200' }
];

export function LeadKanbanPage() {
  const [leads, setLeads] = React.useState(mockLeads);

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newLeads = [...leads];
    const draggedLead = newLeads.find(lead => lead.id === draggableId);
    
    if (draggedLead) {
      draggedLead.status = destination.droppableId as Lead['status'];
      setLeads(newLeads);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Lead Pipeline</h1>
          <p className="text-muted-foreground mt-2">
            Dra og slipp leads mellom stadier for å oppdatere status
          </p>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map(column => (
              <div key={column.id} className={`${column.color} rounded-lg p-4 min-h-[600px]`}>
                <h2 className="font-semibold mb-4 text-foreground">{column.title}</h2>
                
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {getLeadsByStatus(column.id).map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card className="cursor-move hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm font-medium">
                                    {lead.title}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>{lead.contact_name}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{lead.contact_email}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>{lead.contact_phone}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(lead.created_at).toLocaleDateString('no-NO')}</span>
                                  </div>
                                  
                                  {lead.budget && (
                                    <Badge variant="secondary" className="mt-2">
                                      {lead.budget}
                                    </Badge>
                                  )}
                                </CardContent>
                              </Card>
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
      </div>
    </div>
  );
}