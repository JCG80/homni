import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Edit, Plus, Clock, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { WithFeatureFlag } from '@/modules/feature_flags/components/FeatureFlagProvider';
import { listTasks, createTask, updateTask, deleteTask, type MaintenanceTask } from '../api';

const seasons = ['Vinter', 'Vår', 'Sommer', 'Høst'];
const propertyTypes = ['Enebolig', 'Rekkehus', 'Leilighet', 'Tomannsbolig', 'Fritidsbolig'];
const priorities = ['Høy', 'Middels', 'Lav'];

const TaskForm = ({
  task,
  onClose,
  onSave,
  t
}: {
  task?: MaintenanceTask | null;
  onClose: () => void;
  onSave: (task: Partial<MaintenanceTask>) => void;
  t: any;
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    seasons: task?.seasons || [],
    property_types: task?.property_types || [],
    frequency_months: task?.frequency_months?.toString() || '12',
    priority: task?.priority || 'Middels',
    estimated_time: task?.estimated_time || '',
    cost_estimate: task?.cost_estimate?.toString() || '',
    version: task?.version || '0.1.0'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Tittel og beskrivelse er påkrevd');
      return;
    }
    if (formData.seasons.length === 0 || formData.property_types.length === 0) {
      toast.error('Velg minst én årstid og boligtype');
      return;
    }

    onSave({
      ...task,
      title: formData.title,
      description: formData.description,
      seasons: formData.seasons,
      property_types: formData.property_types,
      frequency_months: parseInt(formData.frequency_months),
      priority: formData.priority as 'Høy' | 'Middels' | 'Lav',
      estimated_time: formData.estimated_time || null,
      cost_estimate: formData.cost_estimate ? parseFloat(formData.cost_estimate) : null,
      version: formData.version
    });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(x => x !== item)
      : [...array, item];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="title">Tittel *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="F.eks. Rengjøre takrenner"
            required
          />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="description">Beskrivelse *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detaljert beskrivelse av vedlikeholdsoppgaven..."
            rows={3}
            required
          />
        </div>

        <div>
          <Label>Årstider *</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {seasons.map((season) => (
              <Button
                key={season}
                type="button"
                variant={formData.seasons.includes(season) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  seasons: toggleArrayItem(prev.seasons, season)
                }))}
              >
                {season}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Boligtyper *</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {propertyTypes.map((type) => (
              <Button
                key={type}
                type="button"
                variant={formData.property_types.includes(type) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  property_types: toggleArrayItem(prev.property_types, type)
                }))}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="frequency">Frekvens (måneder) *</Label>
          <Input
            id="frequency"
            type="number"
            min="1"
            max="60"
            value={formData.frequency_months}
            onChange={(e) => setFormData(prev => ({ ...prev, frequency_months: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="priority">Prioritet *</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'Høy' | 'Middels' | 'Lav' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {t(`maintenance.priority.${priority}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="estimated_time">Estimert tid</Label>
          <Input
            id="estimated_time"
            value={formData.estimated_time}
            onChange={(e) => setFormData(prev => ({ ...prev, estimated_time: e.target.value }))}
            placeholder="F.eks. 2 timer"
          />
        </div>

        <div>
          <Label htmlFor="cost_estimate">Kostnadsestimat (NOK)</Label>
          <Input
            id="cost_estimate"
            type="number"
            min="0"
            value={formData.cost_estimate}
            onChange={(e) => setFormData(prev => ({ ...prev, cost_estimate: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Avbryt
        </Button>
        <Button type="submit">
          {task ? 'Rediger' : 'Legg til oppgave'}
        </Button>
      </div>
    </form>
  );
};

export const MaintenanceAdmin = () => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [editDialog, setEditDialog] = useState<{ open: boolean; task: MaintenanceTask | null }>({ open: false, task: null });
  const [createDialog, setCreateDialog] = useState(false);

  // Query all tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['maintenance-tasks-admin'],
    queryFn: listTasks,
  });

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks-admin'] });
      toast.success(t('maintenance.messages.task_created'));
      setCreateDialog(false);
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Kunne ikke opprette oppgave');
    }
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MaintenanceTask> }) => 
      updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks-admin'] });
      toast.success(t('maintenance.messages.task_updated'));
      setEditDialog({ open: false, task: null });
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Kunne ikke oppdatere oppgave');
    }
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks-admin'] });
      toast.success(t('maintenance.messages.task_deleted'));
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('Kunne ikke slette oppgave');
    }
  });

  const handleCreateTask = (taskData: Partial<MaintenanceTask>) => {
    createMutation.mutate(taskData);
  };

  const handleUpdateTask = (taskData: Partial<MaintenanceTask>) => {
    if (editDialog.task) {
      updateMutation.mutate({
        id: editDialog.task.id,
        updates: taskData
      });
    }
  };

  const handleDeleteTask = (task: MaintenanceTask) => {
    if (confirm(`Er du sikker på at du vil slette "${task.title}"?`)) {
      deleteMutation.mutate(task.id);
    }
  };

  const tasksByPriority = {
    'Høy': tasks.filter(t => t.priority === 'Høy'),
    'Middels': tasks.filter(t => t.priority === 'Middels'),
    'Lav': tasks.filter(t => t.priority === 'Lav')
  };

  return (
    <WithFeatureFlag flagName="ENABLE_MAINTENANCE_ADMIN" fallbackValue={true}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('maintenance.admin')}</h1>
            <p className="text-muted-foreground">
              Administrer master vedlikeholdsoppgaver for alle brukere
            </p>
          </div>
          <Button onClick={() => setCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('maintenance.actions.add_task')}
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale oppgaver</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('maintenance.priority.Høy')} prioritet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{tasksByPriority['Høy'].length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('maintenance.priority.Middels')} prioritet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{tasksByPriority['Middels'].length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('maintenance.priority.Lav')} prioritet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{tasksByPriority['Lav'].length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Alle oppgaver ({tasks.length})</TabsTrigger>
            <TabsTrigger value="high">{t('maintenance.priority.Høy')} prioritet ({tasksByPriority['Høy'].length})</TabsTrigger>
            <TabsTrigger value="medium">{t('maintenance.priority.Middels')} ({tasksByPriority['Middels'].length})</TabsTrigger>
            <TabsTrigger value="low">{t('maintenance.priority.Lav')} ({tasksByPriority['Lav'].length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TasksGrid tasks={tasks} onEdit={(task) => setEditDialog({ open: true, task })} onDelete={handleDeleteTask} isLoading={isLoading} t={t} />
          </TabsContent>

          <TabsContent value="high">
            <TasksGrid tasks={tasksByPriority['Høy']} onEdit={(task) => setEditDialog({ open: true, task })} onDelete={handleDeleteTask} isLoading={isLoading} t={t} />
          </TabsContent>

          <TabsContent value="medium">
            <TasksGrid tasks={tasksByPriority['Middels']} onEdit={(task) => setEditDialog({ open: true, task })} onDelete={handleDeleteTask} isLoading={isLoading} t={t} />
          </TabsContent>

          <TabsContent value="low">
            <TasksGrid tasks={tasksByPriority['Lav']} onEdit={(task) => setEditDialog({ open: true, task })} onDelete={handleDeleteTask} isLoading={isLoading} t={t} />
          </TabsContent>
        </Tabs>

        {/* Create Dialog */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('maintenance.actions.add_task')}</DialogTitle>
              <DialogDescription>
                Legg til en ny master vedlikeholdsoppgave som vil være tilgjengelig for alle brukere.
              </DialogDescription>
            </DialogHeader>
            <TaskForm onClose={() => setCreateDialog(false)} onSave={handleCreateTask} t={t} />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, task: editDialog.task })}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('maintenance.actions.edit_task')}</DialogTitle>
              <DialogDescription>
                Oppdater oppgavens detaljer. Endringer påvirker alle brukere.
              </DialogDescription>
            </DialogHeader>
            <TaskForm task={editDialog.task} onClose={() => setEditDialog({ open: false, task: null })} onSave={handleUpdateTask} t={t} />
          </DialogContent>
        </Dialog>
      </div>
    </WithFeatureFlag>
  );
};

// Tasks Grid Component
const TasksGrid = ({ 
  tasks, 
  onEdit, 
  onDelete, 
  isLoading,
  t
}: { 
  tasks: MaintenanceTask[]; 
  onEdit: (task: MaintenanceTask) => void; 
  onDelete: (task: MaintenanceTask) => void;
  isLoading: boolean;
  t: any;
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('maintenance.messages.loading_tasks')}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Ingen oppgaver</h3>
          <p className="text-muted-foreground">Ingen vedlikeholdsoppgaver funnet for dette filteret.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <CardDescription className="line-clamp-2">{task.description}</CardDescription>
              </div>
              <Badge variant={task.priority === 'Høy' ? 'destructive' : task.priority === 'Middels' ? 'default' : 'secondary'}>
                {t(`maintenance.priority.${task.priority}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{task.frequency_months} måneder</span>
              </div>
              {task.estimated_time && (
                <div className="text-sm text-muted-foreground">
                  {t('maintenance.labels.estimated_time')}: {task.estimated_time}
                </div>
              )}
              {task.cost_estimate && (
                <div className="text-sm text-muted-foreground">
                  {t('maintenance.labels.cost_estimate')}: {task.cost_estimate} NOK
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Årstider:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.seasons.map((season) => (
                    <Badge key={season} variant="outline" className="text-xs">
                      {t(`maintenance.seasons.${season}`)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">Boligtyper:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.property_types.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {t(`maintenance.property_types.${type}`)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(task)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};