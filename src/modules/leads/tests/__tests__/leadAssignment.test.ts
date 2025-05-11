
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { assignLeadToProvider } from '../../utils/leadAssignment';
import { supabase } from '@/integrations/supabase/client';
import { createTestLead } from '../utils';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis()
  }
}));

describe('Lead Assignment', () => {
  const mockFrom = supabase.from as unknown as ReturnType<typeof vi.fn>;
  const mockUpdate = supabase.from('').update as unknown as ReturnType<typeof vi.fn>;
  const mockInsert = supabase.from('').insert as unknown as ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should successfully assign a lead to a provider', async () => {
    const testLead = createTestLead({ 
      submitted_by: 'user-123',
      id: 'lead-123'
    });
    
    // Mock successful update
    mockUpdate.mockResolvedValue({ data: { id: 'lead-123' }, error: null });
    
    // Mock successful history insert
    mockInsert.mockResolvedValue({ data: { id: 'history-1' }, error: null });
    
    const result = await assignLeadToProvider(testLead as any, 'provider-123');
    
    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('leads');
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith('lead_history');
    expect(mockInsert).toHaveBeenCalled();
  });
  
  it('should handle errors when updating lead', async () => {
    const testLead = createTestLead({ 
      submitted_by: 'user-123',
      id: 'lead-456'
    });
    
    // Mock failed update
    mockUpdate.mockResolvedValue({ 
      data: null, 
      error: new Error('Database error') 
    });
    
    const result = await assignLeadToProvider(testLead as any, 'provider-123');
    
    expect(result).toBe(false);
    expect(mockFrom).toHaveBeenCalledWith('leads');
    expect(mockUpdate).toHaveBeenCalled();
    // History insert should not be called on lead update error
    expect(mockInsert).not.toHaveBeenCalled();
  });
  
  it('should handle errors when creating history record', async () => {
    const testLead = createTestLead({ 
      submitted_by: 'user-123',
      id: 'lead-789'
    });
    
    // Mock successful update but failed history insert
    mockUpdate.mockResolvedValue({ data: { id: 'lead-789' }, error: null });
    mockInsert.mockResolvedValue({ 
      data: null, 
      error: new Error('History error') 
    });
    
    const result = await assignLeadToProvider(testLead as any, 'provider-123');
    
    // Should still return true as the lead itself was updated
    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('leads');
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith('lead_history');
    expect(mockInsert).toHaveBeenCalled();
  });
  
  it('should handle missing lead ID gracefully', async () => {
    const testLead = createTestLead({ 
      submitted_by: 'user-123',
      // No ID provided
    });
    
    const result = await assignLeadToProvider(testLead as any, 'provider-123');
    
    expect(result).toBe(false);
    // Should not attempt database operations
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });
  
  it('should handle missing provider ID gracefully', async () => {
    const testLead = createTestLead({ 
      submitted_by: 'user-123',
      id: 'lead-123'
    });
    
    const result = await assignLeadToProvider(testLead as any, null);
    
    expect(result).toBe(false);
    // Should not attempt database operations
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
