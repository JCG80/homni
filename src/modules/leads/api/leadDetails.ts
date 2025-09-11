import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/leads-canonical';

export const fetchLeadById = async (leadId: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Transform the data to match Lead interface
  return {
    ...data,
    metadata: typeof data.metadata === 'string' 
      ? JSON.parse(data.metadata) 
      : (data.metadata || {})
  } as Lead;
};

export const updateLeadDetails = async (leadId: string, updates: Partial<Lead>): Promise<void> => {
  // Handle metadata field properly
  const updateData = {
    ...updates,
    metadata: updates.metadata ? JSON.stringify(updates.metadata) : undefined,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('leads')
    .update(updateData)
    .eq('id', leadId);

  if (error) {
    throw new Error(error.message);
  }
};