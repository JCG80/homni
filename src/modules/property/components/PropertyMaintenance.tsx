import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Calendar,
  Wrench,
  DollarSign
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/propertyUtils';

interface MaintenanceTask {
  id: string;
  property_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  completed_at?: string;
  estimated_cost?: number;
  actual_cost?: number;
  assigned_to?: string;
  category: string;
}

interface PropertyMaintenanceProps {
  propertyId?: string;
}

export function PropertyMaintenance({ propertyId }: PropertyMaintenanceProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['maintenance-tasks', propertyId, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('property_maintenance_tasks')
        .select(`
          *,
          properties!inner(name, user_id)
        `)
        .eq('properties.user_id', user?.id);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query.order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as (MaintenanceTask & { properties: { name: string } })[];
    },
    enabled: !!user?.id
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<MaintenanceTask> }) => {
      const { data, error } = await supabase
        .from('property_maintenance_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
    }
  });

  const filteredTasks = tasks.filter(task => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'overdue') {
      return task.status === 'pending' && 
             task.due_date && 
             new Date(task.due_date) < new Date();
    }
    return task.status === selectedStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string, dueDate?: string) => {
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'in_progress') return <Wrench className="h-4 w-4 text-blue-600" />;
    if (dueDate && new Date(dueDate) < new Date()) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-gray-600" />;
  };

  const handleStatusUpdate = (taskId: string, newStatus: string) => {
    const updates: Partial<MaintenanceTask> = { status: newStatus as any };
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    updateTaskMutation.mutate({ taskId, updates });
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => 
      t.status === 'pending' && 
      t.due_date && 
      new Date(t.due_date) < new Date()
    ).length
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Vedlikehold {propertyId ? '' : '- Alle eiendommer'}
            </CardTitle>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ny oppgave
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{taskStats.total}</p>
              <p className="text-sm text-muted-foreground">Totalt</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
              <p className="text-sm text-muted-foreground">Venter</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
              <p className="text-sm text-muted-foreground">Pågående</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
              <p className="text-sm text-muted-foreground">Fullført</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
              <p className="text-sm text-muted-foreground">Forsinket</p>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key: 'all', label: 'Alle', count: taskStats.total },
              { key: 'pending', label: 'Venter', count: taskStats.pending },
              { key: 'in_progress', label: 'Pågående', count: taskStats.inProgress },
              { key: 'completed', label: 'Fullført', count: taskStats.completed },
              { key: 'overdue', label: 'Forsinket', count: taskStats.overdue }
            ].map(filter => (
              <Button
                key={filter.key}
                variant={selectedStatus === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(filter.key)}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>

          {/* Tasks list */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {selectedStatus === 'all' 
                  ? 'Ingen vedlikehold oppgaver registrert'
                  : `Ingen oppgaver i kategorien "${selectedStatus}"`
                }
              </div>
            ) : (
              filteredTasks.map(task => (
                <Card key={task.id} className="border-l-4" style={{
                  borderLeftColor: task.priority === 'high' ? 'rgb(220, 38, 38)' : 
                                   task.priority === 'medium' ? 'rgb(234, 179, 8)' : 
                                   'rgb(34, 197, 94)'
                }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(task.status, task.due_date)}
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)} variant="outline">
                            {task.priority === 'high' ? 'Høy' : 
                             task.priority === 'medium' ? 'Middels' : 'Lav'}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {!propertyId && task.properties && (
                            <span className="flex items-center gap-1">
                              <strong>{task.properties.name}</strong>
                            </span>
                          )}
                          
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Forfaller: {formatDate(task.due_date)}
                            </span>
                          )}
                          
                          {task.estimated_cost && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Estimert: {formatCurrency(task.estimated_cost)}
                            </span>
                          )}
                          
                          {task.actual_cost && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Faktisk: {formatCurrency(task.actual_cost)}
                            </span>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(task.id, 'in_progress')}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(task.id, 'completed')}
                          >
                            Fullfør
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}