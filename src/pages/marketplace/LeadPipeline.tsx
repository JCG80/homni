import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'sonner';
import { Calendar, User, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const PIPELINE_STAGES = [
  { id: 'new', title: 'Nye Leads', emoji: '📥', color: 'bg-blue-50 border-blue-200' },
  { id: 'in_progress', title: 'I Arbeid', emoji: '🚀', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'won', title: 'Vunnet', emoji: '🏆', color: 'bg-green-50 border-green-200' },
  { id: 'lost', title: 'Tapt', emoji: '❌', color: 'bg-red-50 border-red-200' }
] as const;

export const LeadPipeline: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['buyer-lead-assignments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get user's company ID
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (!profile?.company_id) return [];

      const { data, error } = await supabase
        .from('lead_assignments')
        .select(`
          *,
          leads (
            id,
            title,
            description,
            category,
            created_at,
            metadata
          )
        `)
        .eq('buyer_id', profile.company_id)
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ assignmentId, newStage }: { assignmentId: string; newStage: string }) => {
      const { error } = await supabase
        .from('lead_assignments')
        .update({ pipeline_stage: newStage as any })
        .eq('id', assignmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-lead-assignments'] });
      toast.success('Lead status updated');
    },
    onError: (error) => {
      toast.error('Failed to update lead: ' + error.message);
    }
  });

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStage = destination.droppableId;
    
    updateStageMutation.mutate({
      assignmentId: draggableId,
      newStage
    });
  };

  const getAssignmentsByStage = (stage: string) => {
    return assignments?.filter(assignment => assignment.pipeline_stage === stage) || [];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Pipeline</h1>
        <p className="text-muted-foreground">
          Manage your purchased leads through the sales pipeline
        </p>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-4 gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const count = getAssignmentsByStage(stage.id).length;
          const totalValue = getAssignmentsByStage(stage.id).reduce((sum, assignment) => sum + (assignment.cost || 0), 0);
          
          return (
            <Card key={stage.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="text-lg">{stage.emoji}</span>
                  {stage.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  Total: NOK {totalValue.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pipeline Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {PIPELINE_STAGES.map((stage) => (
            <Card key={stage.id} className={`${stage.color} min-h-[500px]`}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="text-lg">{stage.emoji}</span>
                  {stage.title}
                  <Badge variant="secondary" className="ml-auto">
                    {getAssignmentsByStage(stage.id).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[400px] p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-accent/50' : ''
                      }`}
                    >
                      {getAssignmentsByStage(stage.id).map((assignment, index) => (
                        <Draggable
                          key={assignment.id}
                          draggableId={assignment.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-move transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                              }`}
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                  {assignment.leads?.title}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {assignment.leads?.category}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-3 h-3" />
                                    <span className="font-medium">NOK {assignment.cost}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {format(new Date(assignment.assigned_at), 'MMM dd, yyyy')}
                                    </span>
                                  </div>
                                  {assignment.leads?.description && (
                                    <p className="text-muted-foreground line-clamp-2">
                                      {assignment.leads.description}
                                    </p>
                                  )}
                                  {assignment.expires_at && new Date(assignment.expires_at) > new Date() && (
                                    <Badge variant="outline" className="text-xs">
                                      Expires {format(new Date(assignment.expires_at), 'MMM dd')}
                                    </Badge>
                                  )}
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
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>

      {assignments?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">{PIPELINE_STAGES.find(c => c.id === 'new')?.emoji || '📥'}</div>
            <h3 className="text-lg font-medium mb-2">No leads assigned yet</h3>
            <p className="text-muted-foreground">
              Once you subscribe to lead packages and leads are distributed, they will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};