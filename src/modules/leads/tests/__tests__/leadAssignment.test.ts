
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { assignLeadToProvider } from '../../utils/leadAssignment';
import { distributeLeadToProvider } from '../../strategies/strategyFactory';
import { supabase } from '@/integrations/supabase/client';
import { createTestLead } from '../utils';
import { withRetry } from '@/utils/apiRetry';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis()
  }
}));

vi.mock('../../strategies/strategyFactory', () => ({
  distributeLeadToProvider: vi.fn()
}));

vi.mock('@/utils/apiRetry', () => ({
  withRetry: vi.fn((fn) => fn())
}));

describe('Lead Assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should successfully assign lead when provider found', async () => {
    // Mock provider distribution
    (distributeLeadToProvider as any).mockResolvedValue('provider-123');
    
    // Mock successful lead update
    (supabase.from as any).mockReturnThis();
    (supabase.update as any).mockReturnThis();
    (supabase.eq as any).mockReturnValue({ error: null });
    
    // Mock successful history log
    (supabase.insert as any).mockReturnValue({ error: null });
    
    const testLead = createTestLead({ 
      submitted_by: 'user-123',
      id: 'lead-123',
      category: 'plumbing'
    });
    
    const result = await assignLeadToProvider(testLead, 'category_match');
    
    expect(result).toBe(true);
    expect(distributeLeadToProvider).toHaveBeenCalledWith('category_match', 'plumbing');
    
    // Check that lead was updated correctly
    expect(supabase.from).toHaveBeenCalledWith('leads');
    expect(supabase.update).toHaveBeenCalledWith({
      company_id: 'provider-123',
      status: 'assigned',
      updated_at: expect.any(String)
    });
    expect(supabase.eq).toHaveBeenCalledWith('id', 'lead-123');
    
    // Check that history was logged
    expect(supabase.from).toHaveBeenCalledWith('lead_history');
    expect(supabase.insert).toHaveBeenCalledWith({
      lead_id: 'lead-123',
      assigned_to: 'provider-123',
      method: 'auto',
      previous_status: 'new',
      new_status: 'assigned'
    });
  });
  
  it('should return false when no provider found', async () => {
    (distributeLeadToProvider as any).mockResolvedValue(null);
    
    const testLead = createTestLead({ 
      submitted_by: 'user-123',
      id: 'lead-123',
      category: 'plumbing'
    });
    
    const result = await assignLeadToProvider(testLead, 'category_match');
    
    expect(result).toBe(false);
    expect(distributeLeadToProvider).toHaveBeenCalledWith('category_match', 'plumbing');
    expect(supabase.update).not.toHaveBeenCalled();
  });
  
  it('should return false when lead update fails', async () => {
    (distributeLeadToProvider as any).mockResolvedValue('provider-123');
    
    // Mock failed lead update
    (supabase.from as any).mockReturnThis();
    (supabase.update as any).mockReturnThis();
    (supabase.eq as any).mockReturnValue({ error: { message: 'Update failed' } });
    
    const testLead = createTestLead({ 
      submitted_by: 'user-123',
      id: 'lead-123',
      category: 'plumbing'
    });
    
    const result = await assignLeadToProvider(testLead, 'category_match');
    
    expect(result).toBe(false);
  });
  
  it('should still return true when lead update succeeds but history logging fails', async () => {
    (distributeLeadToProvider as any).mockResolvedValue('provider-123');
    
    // Mock successful lead update but failed history log
    (supabase.from as any).mockImplementation((table) => {
      if (table === 'leads') {
        return {
          update: () => ({
            eq: () => ({ error: null })
          })
        };
      } else {
        return {
          insert: () => ({ error: { message: 'History log failed' } })
        };
      }
    });
    
    const testLead = createTestLead({ 
      submitted_by: 'user-123',
      id: 'lead-123',
      category: 'plumbing'
    });
    
    const result = await assignLeadToProvider(testLead, 'category_match');
    
    // We still consider it a success even if history logging fails
    expect(result).toBe(true);
  });
  
  it('should handle errors during processing', async () => {
    (distributeLeadToProvider as any).mockRejectedValue(new Error('Strategy error'));
    
    const testLead = createTestLead({ 
      submitted_by: 'user-123',
      id: 'lead-123',
      category: 'plumbing'
    });
    
    const result = await assignLeadToProvider(testLead, 'category_match');
    
    expect(result).toBe(false);
  });
});
