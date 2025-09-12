import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Phone, Mail, MessageSquare, Euro, Calendar, MapPin } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useCompanyLeadsData } from '@/hooks/useLeadsData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PIPELINE_STAGES = [
  { 
    id: 'new', 
    title: 'Nye leads ✨', 
    description: 'Nylig mottatte forespørsler',
    color: 'border-blue-500 bg-blue-50 dark:bg-blue-950'
  },
  { 
    id: 'contacted', 
    title: 'Kontaktet 📞', 
    description: 'Leads du har tatt kontakt med',
    color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
  },
  { 
    id: 'negotiating', 
    title: 'Forhandler 💬', 
    description: 'Aktive forhandlinger',
    color: 'border-orange-500 bg-orange-50 dark:bg-orange-950'
  },
  { 
    id: 'converted', 
    title: 'Vunnet 🏆', 
    description: 'Konverterte leads',
    color: 'border-green-500 bg-green-50 dark:bg-green-950'
  },
  { 
    id: 'lost', 
    title: 'Tapt ❌', 
    description: 'Ikke konverterte leads',
    color: 'border-red-500 bg-red-50 dark:bg-red-950'
  }
];

interface Lead {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service_type?: string;
  metadata?: any;
  anonymous_email?: string;
}

export const LeadPipelineBoard: React.FC = () => {
  const { leads, loading, refetch, updateLeadStatus } = useCompanyLeadsData();
  const { toast } = useToast();
  const [leadsByStage, setLeadsByStage] = useState<Record<string, Lead[]>>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    // Group leads by status/stage
    const grouped = leads.reduce((acc, lead) => {
      const stage = lead.status;
      if (!acc[stage]) acc[stage] = [];
      acc[stage].push(lead);
      return acc;
    }, {} as Record<string, Lead[]>);

    setLeadsByStage(grouped);
  }, [leads]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Find the lead being moved
    const lead = leads.find(l => l.id === draggableId);
    if (!lead) return;

    const newStatus = destination.droppableId;

    try {
      await updateLeadStatus(lead.id, newStatus as any);
      
      toast({
        title: "Lead status updated",
        description: `Moved "${lead.title}" to ${PIPELINE_STAGES.find(s => s.id === newStatus)?.title}`,
      });

      // Refresh data
      refetch();
    } catch (error) {
      console.error('Failed to update lead status:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getLeadValue = (lead: Lead): number => {
    // Estimate lead value based on category and metadata
    const estimates = {
      'elektriker': 15000,
      'rørlegger': 20000,
      'bygge': 50000,
      'tak': 30000,
      'maler': 12000,
      'snekker': 18000,
    };
    return estimates[lead.category as keyof typeof estimates] || 10000;
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lead Pipeline</h2>
          <p className="text-muted-foreground">
            Dra og slipp leads mellom stadier for å oppdatere status
          </p>
        </div>
        <Button variant="outline" onClick={refetch}>
          <Clock className="h-4 w-4 mr-2" />
          Oppdater
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className={`rounded-lg border-2 ${stage.color}`}>
              <div className="p-4 border-b">
                <h3 className="font-semibold">{stage.title}</h3>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary">
                    {leadsByStage[stage.id]?.length || 0} leads
                  </Badge>
                  {stage.id === 'converted' && (
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(
                        leadsByStage[stage.id]?.reduce((sum, lead) => sum + getLeadValue(lead), 0) || 0
                      )}
                    </span>
                  )}
                </div>
              </div>

              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 space-y-3 min-h-[400px] ${
                      snapshot.isDraggingOver ? 'bg-muted/50' : ''
                    }`}
                  >
                    {leadsByStage[stage.id]?.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-pointer transition-shadow hover:shadow-md ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                            }`}
                            onClick={() => setSelectedLead(lead)}
                          >
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium text-sm line-clamp-2">{lead.title}</h4>
                                {lead.metadata?.urgency && (
                                  <Badge className={getUrgencyColor(lead.metadata.urgency)}>
                                    {lead.metadata.urgency}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Badge variant="outline" className="mr-2">
                                  {lead.category}
                                </Badge>
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(lead.created_at).toLocaleDateString('nb-NO')}
                              </div>

                              {lead.customer_name && (
                                <div className="flex items-center text-xs">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarFallback className="text-xs">
                                      {lead.customer_name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">{lead.customer_name}</span>
                                </div>
                              )}

                              {lead.metadata?.property_address && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span className="truncate">{lead.metadata.property_address}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-primary">
                                  {formatCurrency(getLeadValue(lead))}
                                </span>
                                <div className="flex space-x-1">
                                  {lead.customer_email && (
                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  {lead.customer_phone && (
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
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

      {/* Lead Detail Modal would be here */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {selectedLead.title}
                <Button variant="ghost" onClick={() => setSelectedLead(null)}>
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lead details would go here */}
              <div className="space-y-2">
                <p><strong>Kategori:</strong> {selectedLead.category}</p>
                <p><strong>Status:</strong> {selectedLead.status}</p>
                <p><strong>Opprettet:</strong> {new Date(selectedLead.created_at).toLocaleString('nb-NO')}</p>
                {selectedLead.customer_name && (
                  <p><strong>Kunde:</strong> {selectedLead.customer_name}</p>
                )}
                {selectedLead.customer_email && (
                  <p><strong>E-post:</strong> {selectedLead.customer_email}</p>
                )}
                {selectedLead.service_type && (
                  <p><strong>Tjeneste:</strong> {selectedLead.service_type}</p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Ring
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send e-post
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Legg til notat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};