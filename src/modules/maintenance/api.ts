import { supabase } from '@/lib/supabaseClient';

export type MaintenanceTask = {
  id: string; 
  title: string; 
  description: string; 
  seasons: string[]; 
  property_types: string[];
  frequency_months: number; 
  priority: 'Høy'|'Middels'|'Lav'; 
  estimated_time: string|null; 
  cost_estimate: number|null;
  version: string;
  created_at: string;
  updated_at: string;
};

export type UserTaskCompletion = {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
  note: string | null;
};

export type DueTask = {
  task_id: string;
  title: string;
  description: string;
  priority: string;
  frequency_months: number;
  last_completed: string | null;
  is_due: boolean;
};

export function getCurrentSeason(d = new Date()): 'Vinter'|'Vår'|'Sommer'|'Høst' {
  const m = d.getMonth() + 1; 
  if([12,1,2].includes(m)) return 'Vinter'; 
  if([3,4,5].includes(m)) return 'Vår'; 
  if([6,7,8].includes(m)) return 'Sommer'; 
  return 'Høst';
}

export async function listTasks(): Promise<MaintenanceTask[]> { 
  const { data, error } = await supabase
    .from('maintenance_tasks' as any)
    .select('*')
    .order('priority', { ascending: false })
    .order('title');
  
  if (error) throw error; 
  return (data || []) as unknown as MaintenanceTask[]; 
}

export async function listDueTasksForCurrentSeason(userId: string): Promise<DueTask[]> {
  const season = getCurrentSeason();
  const { data, error } = await supabase.rpc('maint_due_tasks' as any, { 
    p_user: userId, 
    p_season: season 
  });
  
  if (error) throw error; 
  return Array.isArray(data) ? data.filter((x: any) => x.is_due) : [];
}

export async function markCompleted(taskId: string, userId: string, note?: string): Promise<void> {
  const { error } = await supabase
    .from('user_task_log' as any)
    .insert({ 
      task_id: taskId, 
      user_id: userId, 
      note 
    });
  
  if (error) throw error;
}

export async function getUserCompletions(userId: string): Promise<UserTaskCompletion[]> {
  const { data, error } = await supabase
    .from('user_task_log' as any)
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
    
  if (error) throw error;
  return (data || []) as unknown as UserTaskCompletion[];
}

export async function createTask(task: Partial<MaintenanceTask>): Promise<MaintenanceTask> {
  const { data, error } = await supabase
    .from('maintenance_tasks' as any)
    .insert(task)
    .select()
    .single();
    
  if (error) throw error;
  return data as unknown as MaintenanceTask;
}

export async function updateTask(id: string, updates: Partial<MaintenanceTask>): Promise<MaintenanceTask> {
  const { data, error } = await supabase
    .from('maintenance_tasks' as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data as unknown as MaintenanceTask;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('maintenance_tasks' as any)
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}