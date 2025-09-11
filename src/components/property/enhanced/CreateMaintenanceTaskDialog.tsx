import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { enhancedPropertyDocumentService } from '@/modules/property/api/enhancedDocuments';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface CreateMaintenanceTaskDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
}

const maintenanceCategories = [
  { value: 'hvac', label: 'Varme, ventilasjon og klimaanlegg' },
  { value: 'plumbing', label: 'Rørlegging og sanitær' },
  { value: 'electrical', label: 'Elektro' },
  { value: 'exterior', label: 'Utvendig vedlikehold' },
  { value: 'interior', label: 'Innvendig vedlikehold' },
  { value: 'garden', label: 'Hage og uteområder' },
  { value: 'security', label: 'Sikkerhet' },
  { value: 'other', label: 'Annet' }
];

const priorityLevels = [
  { value: 'low', label: 'Lav', color: 'text-green-600' },
  { value: 'medium', label: 'Middels', color: 'text-yellow-600' },
  { value: 'high', label: 'Høy', color: 'text-red-600' },
  { value: 'urgent', label: 'Kritisk', color: 'text-red-800' }
];

const recurringFrequencies = [
  { value: 'monthly', label: 'Månedlig' },
  { value: 'quarterly', label: 'Kvartalsvis' },
  { value: 'biannual', label: 'Halvårlig' },
  { value: 'annual', label: 'Årlig' }
];

export const CreateMaintenanceTaskDialog = ({
  propertyId,
  open,
  onOpenChange,
  onTaskCreated
}: CreateMaintenanceTaskDialogProps) => {
  const queryClient = useQueryClient();
  const [dueDate, setDueDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    estimated_cost: '',
    assigned_to: '',
    recurring_frequency: ''
  });

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const taskToCreate = {
        property_id: propertyId,
        title: taskData.title,
        description: taskData.description,
        category: taskData.category as any,
        priority: taskData.priority as any,
        status: 'pending' as const,
        due_date: dueDate?.toISOString().split('T')[0],
        estimated_cost: taskData.estimated_cost ? parseFloat(taskData.estimated_cost) : undefined,
        assigned_to: taskData.assigned_to || undefined,
        recurring_frequency: taskData.recurring_frequency as any || undefined
      };

      return await enhancedPropertyDocumentService.createMaintenanceTask(taskToCreate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-maintenance-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
      toast.success('Vedlikeholdsoppgave opprettet');
      resetForm();
      onTaskCreated();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Kunne ikke opprette vedlikeholdsoppgave');
    }
  });

  const resetForm = () => {
    setTaskData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      estimated_cost: '',
      assigned_to: '',
      recurring_frequency: ''
    });
    setDueDate(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim() || !taskData.category) {
      toast.error('Vennligst fyll ut påkrevde felt');
      return;
    }
    createTaskMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Opprett vedlikeholdsoppgave</DialogTitle>
          <DialogDescription>
            Legg til en ny vedlikeholdsoppgave for eiendommen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tittel *</Label>
            <Input
              id="title"
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="F.eks. Skifte filtermaljer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse</Label>
            <Textarea
              id="description"
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detaljert beskrivelse av oppgaven..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select 
                value={taskData.category} 
                onValueChange={(value) => setTaskData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg kategori" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioritet</Label>
              <Select 
                value={taskData.priority} 
                onValueChange={(value) => setTaskData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg prioritet" />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className={priority.color}>{priority.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Forfallsdato</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP', { locale: nb }) : 'Velg dato'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setShowCalendar(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_cost">Estimert kostnad (NOK)</Label>
              <Input
                id="estimated_cost"
                type="number"
                value={taskData.estimated_cost}
                onChange={(e) => setTaskData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Tildelt til</Label>
            <Input
              id="assigned_to"
              value={taskData.assigned_to}
              onChange={(e) => setTaskData(prev => ({ ...prev, assigned_to: e.target.value }))}
              placeholder="Navn på person/firma"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurring">Gjentakelse</Label>
            <Select 
              value={taskData.recurring_frequency} 
              onValueChange={(value) => setTaskData(prev => ({ ...prev, recurring_frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg intervall (valgfritt)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ingen gjentakelse</SelectItem>
                {recurringFrequencies.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? 'Oppretter...' : 'Opprett oppgave'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};