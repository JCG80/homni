import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, CheckCircle, Clock, Wrench, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthState } from '@/modules/auth/hooks/useAuthState';
import { listDueTasksForCurrentSeason, markCompleted, getUserCompletions, getCurrentSeason, type DueTask, type UserTaskCompletion } from '../api';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

const priorityColors = {
  'Høy': 'destructive',
  'Middels': 'default', 
  'Lav': 'secondary'
} as const;

const priorityIcons = {
  'Høy': AlertTriangle,
  'Middels': Clock,
  'Lav': Wrench
};

export const MaintenanceDashboard = () => {
  const { user } = useAuthState();
  const queryClient = useQueryClient();
  const [completionDialog, setCompletionDialog] = useState<{ open: boolean; task: DueTask | null }>({ open: false, task: null });
  const [completionNote, setCompletionNote] = useState('');
  const currentSeason = getCurrentSeason();

  // Query due tasks for current season
  const { data: dueTasks = [], isLoading: loadingDue } = useQuery({
    queryKey: ['maintenance-due-tasks', user?.id, currentSeason],
    queryFn: () => user?.id ? listDueTasksForCurrentSeason(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  // Query completed tasks
  const { data: completions = [], isLoading: loadingCompletions } = useQuery({
    queryKey: ['maintenance-completions', user?.id],
    queryFn: () => user?.id ? getUserCompletions(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  // Mark task as completed mutation
  const markCompletedMutation = useMutation({
    mutationFn: ({ taskId, note }: { taskId: string; note?: string }) => 
      user?.id ? markCompleted(taskId, user.id, note) : Promise.reject('No user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-due-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-completions'] });
      toast.success('Oppgave markert som fullført');
      setCompletionDialog({ open: false, task: null });
      setCompletionNote('');
    },
    onError: (error) => {
      console.error('Error completing task:', error);
      toast.error('Kunne ikke markere oppgave som fullført');
    }
  });

  const handleCompleteTask = (task: DueTask) => {
    setCompletionDialog({ open: true, task });
  };

  const handleConfirmCompletion = () => {
    if (completionDialog.task) {
      markCompletedMutation.mutate({
        taskId: completionDialog.task.task_id,
        note: completionNote.trim() || undefined
      });
    }
  };

  const upcomingTasks = dueTasks.filter(task => !task.is_due);
  const overdueTasks = dueTasks.filter(task => task.is_due && task.priority === 'Høy');
  const normalDueTasks = dueTasks.filter(task => task.is_due && task.priority !== 'Høy');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vedlikehold</h1>
          <p className="text-muted-foreground">
            Planlagte vedlikeholdsoppgaver for {currentSeason.toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{currentSeason} 2024</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritiske oppgaver</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">Krever umiddelbar oppmerksomhet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forfaller nå</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{normalDueTasks.length}</div>
            <p className="text-xs text-muted-foreground">Bør gjøres denne måneden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kommende</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingTasks.length}</div>
            <p className="text-xs text-muted-foreground">Planlagt for senere</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fullført i år</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completions.length}</div>
            <p className="text-xs text-muted-foreground">Vedlikeholdsoppgaver</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="due" className="space-y-4">
        <TabsList>
          <TabsTrigger value="due">Forfaller nå ({dueTasks.filter(t => t.is_due).length})</TabsTrigger>
          <TabsTrigger value="upcoming">Kommende ({upcomingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Fullført ({completions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="due" className="space-y-4">
          {loadingDue ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Laster oppgaver...</p>
            </div>
          ) : dueTasks.filter(t => t.is_due).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Alle oppgaver er oppdatert!</h3>
                <p className="text-muted-foreground">Ingen vedlikeholdsoppgaver forfaller akkurat nå.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* High priority tasks first */}
              {overdueTasks.map((task) => (
                <TaskCard key={task.task_id} task={task} onComplete={() => handleCompleteTask(task)} />
              ))}
              {normalDueTasks.map((task) => (
                <TaskCard key={task.task_id} task={task} onComplete={() => handleCompleteTask(task)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Ingen kommende oppgaver</h3>
                <p className="text-muted-foreground">Alle oppgaver for denne sesongen er aktuelle nå.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <TaskCard key={task.task_id} task={task} onComplete={() => handleCompleteTask(task)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loadingCompletions ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Laster fullførte oppgaver...</p>
            </div>
          ) : completions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Ingen fullførte oppgaver ennå</h3>
                <p className="text-muted-foreground">Fullførte vedlikeholdsoppgaver vises her.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completions.map((completion) => (
                <CompletionCard key={completion.id} completion={completion} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Completion Dialog */}
      <Dialog open={completionDialog.open} onOpenChange={(open) => setCompletionDialog({ open, task: completionDialog.task })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Marker som fullført</DialogTitle>
            <DialogDescription>
              {completionDialog.task?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="completion-note" className="text-sm font-medium">
                Notat (valgfritt)
              </label>
              <Textarea
                id="completion-note"
                placeholder="Beskriv hva som ble gjort, kostnader, eller andre notater..."
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCompletionDialog({ open: false, task: null })}
            >
              Avbryt
            </Button>
            <Button 
              onClick={handleConfirmCompletion}
              disabled={markCompletedMutation.isPending}
            >
              {markCompletedMutation.isPending ? 'Markerer...' : 'Marker som fullført'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onComplete }: { task: DueTask; onComplete: () => void }) => {
  const Icon = priorityIcons[task.priority as keyof typeof priorityIcons] || Wrench;
  
  return (
    <Card className={task.is_due && task.priority === 'Høy' ? 'border-destructive' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]}>
              <Icon className="h-3 w-3 mr-1" />
              {task.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Frekvens: {task.frequency_months} måneder
            {task.last_completed && (
              <span className="block">
                Sist fullført: {format(new Date(task.last_completed), 'PPP', { locale: nb })}
              </span>
            )}
          </div>
          <Button 
            onClick={onComplete}
            size="sm"
            variant={task.is_due ? 'default' : 'outline'}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marker som fullført
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Completion Card Component
const CompletionCard = ({ completion }: { completion: UserTaskCompletion }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Oppgave fullført</h4>
            {completion.note && (
              <p className="text-sm text-muted-foreground mt-1">{completion.note}</p>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center text-green-600 mb-1">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Fullført</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(completion.completed_at), 'PPP', { locale: nb })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};