import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Settings,
  DollarSign,
  User
} from 'lucide-react';
import { MaintenanceTask, enhancedPropertyDocumentService } from '@/modules/property/api/enhancedDocuments';
import { format, isAfter, isBefore } from 'date-fns';
import { nb } from 'date-fns/locale';

interface MaintenanceTaskListProps {
  propertyId: string;
  tasks: MaintenanceTask[];
  onTaskUpdate: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  category: MaintenanceTask['category'];
  priority: MaintenanceTask['priority'];
  due_date: string;
  estimated_cost: string;
  assigned_to: string;
  recurring_frequency?: MaintenanceTask['recurring_frequency'];
}

export const MaintenanceTaskList = ({ propertyId, tasks, onTaskUpdate }: MaintenanceTaskListProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    due_date: '',
    estimated_cost: '',
    assigned_to: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      due_date: '',
      estimated_cost: '',
      assigned_to: '',
    });
  };

  const handleCreateTask = async () => {
    if (!formData.title.trim()) return;

    try {
      await enhancedPropertyDocumentService.createMaintenanceTask({
        property_id: propertyId,
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        priority: formData.priority,
        status: 'pending',
        due_date: formData.due_date || undefined,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined,
        assigned_to: formData.assigned_to || undefined,
        recurring_frequency: formData.recurring_frequency,
      });

      resetForm();
      setShowCreateDialog(false);
      onTaskUpdate();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: MaintenanceTask['status']) => {
    try {
      const updates: Partial<MaintenanceTask> = { 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
      };
      
      await enhancedPropertyDocumentService.updateMaintenanceTask(taskId, updates);
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getFilteredTasks = () => {
    const now = new Date();
    
    switch (selectedFilter) {
      case 'pending':
        return tasks.filter(task => task.status === 'pending' || task.status === 'in_progress');
      case 'overdue':
        return tasks.filter(task => 
          (task.status === 'pending' || task.status === 'in_progress') &&
          task.due_date && isBefore(new Date(task.due_date), now)
        );
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      default:
        return tasks;
    }
  };

  const getPriorityColor = (priority: MaintenanceTask['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusColor = (status: MaintenanceTask['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getCategoryIcon = (category: MaintenanceTask['category']) => {
    switch (category) {
      case 'hvac': return '🌡️';
      case 'plumbing': return '🚿';
      case 'electrical': return '⚡';
      case 'exterior': return '🏠';
      case 'interior': return '🛋️';
      case 'garden': return '🌱';
      case 'security': return '🔒';
      default: return '🔧';
    }
  };

  const filteredTasks = getFilteredTasks();
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
    overdue: tasks.filter(t => 
      (t.status === 'pending' || t.status === 'in_progress') &&
      t.due_date && isBefore(new Date(t.due_date), new Date())
    ).length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="space-y-4">
      {/* Header with Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'Alle', count: taskCounts.all },
            { key: 'pending', label: 'Aktive', count: taskCounts.pending },
            { key: 'overdue', label: 'Forfalt', count: taskCounts.overdue },
            { key: 'completed', label: 'Fullført', count: taskCounts.completed },
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFilter(filter.key as any)}
            >
              {filter.label} ({filter.count})
            </Button>
          ))}
        </div>
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ny oppgave
        </Button>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">Ingen vedlikeholdsoppgaver</h4>
            <p className="text-muted-foreground text-center mb-4">
              Opprett din første vedlikeholdsoppgave for å holde eiendommen i god stand.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Opprett oppgave
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isOverdue = task.due_date && 
              (task.status === 'pending' || task.status === 'in_progress') &&
              isBefore(new Date(task.due_date), new Date());

            return (
              <Card key={task.id} className={isOverdue ? 'border-red-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Title and Category */}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCategoryIcon(task.category)}</span>
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={getPriorityColor(task.priority)}
                        >
                          {task.priority}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(isOverdue ? 'overdue' : task.status)}
                        >
                          {isOverdue ? 'Forfalt' : task.status}
                        </Badge>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}

                      {/* Details */}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {task.due_date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(task.due_date), 'dd.MM.yyyy', { locale: nb })}
                            </span>
                          </div>
                        )}
                        
                        {task.estimated_cost && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{task.estimated_cost.toLocaleString('no-NO')} kr</span>
                          </div>
                        )}
                        
                        {task.assigned_to && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{task.assigned_to}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {task.status !== 'completed' && (
                        <>
                          {task.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusChange(task.id, 'in_progress')}
                            >
                              Start
                            </Button>
                          )}
                          
                          <Button 
                            size="sm"
                            onClick={() => handleStatusChange(task.id, 'completed')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Fullfør
                          </Button>
                        </>
                      )}
                      
                      {task.status === 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(task.id, 'pending')}
                        >
                          Gjenåpne
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Opprett vedlikeholdsoppgave</DialogTitle>
            <DialogDescription>
              Legg til en ny vedlikeholdsoppgave for eiendommen.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Tittel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="F.eks. Service av varmepumpe"
              />
            </div>

            <div>
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detaljert beskrivelse av oppgaven..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: MaintenanceTask['category']) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hvac">🌡️ HVAC</SelectItem>
                    <SelectItem value="plumbing">🚿 Rørlegger</SelectItem>
                    <SelectItem value="electrical">⚡ Elektrisk</SelectItem>
                    <SelectItem value="exterior">🏠 Eksteriør</SelectItem>
                    <SelectItem value="interior">🛋️ Interiør</SelectItem>
                    <SelectItem value="garden">🌱 Hage</SelectItem>
                    <SelectItem value="security">🔒 Sikkerhet</SelectItem>
                    <SelectItem value="other">🔧 Annet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Prioritet</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: MaintenanceTask['priority']) => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Lav</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">Høy</SelectItem>
                    <SelectItem value="urgent">Akutt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="due_date">Forfallsdato</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="estimated_cost">Anslått kostnad (kr)</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="assigned_to">Tildelt til</Label>
              <Input
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                placeholder="Navn på person/firma"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Avbryt
            </Button>
            <Button onClick={handleCreateTask} disabled={!formData.title.trim()}>
              Opprett oppgave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};