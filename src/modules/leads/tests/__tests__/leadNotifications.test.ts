
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { showLeadProcessingNotifications } from '../../utils/leadNotifications';
import { toast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('Lead Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should not show notifications when showToasts is false', () => {
    showLeadProcessingNotifications({
      showToasts: false,
      totalLeads: 5,
      assignedCount: 3
    });
    
    expect(toast).not.toHaveBeenCalled();
  });
  
  it('should show error notification when error is provided', () => {
    const testError = new Error('Test error');
    
    showLeadProcessingNotifications({
      showToasts: true,
      totalLeads: 5,
      assignedCount: 0,
      error: testError
    });
    
    expect(toast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Test error',
      variant: 'destructive',
    });
  });
  
  it('should show success notification when leads are assigned', () => {
    showLeadProcessingNotifications({
      showToasts: true,
      totalLeads: 5,
      assignedCount: 3
    });
    
    expect(toast).toHaveBeenCalledWith({
      title: 'Leads distributed',
      description: 'Successfully assigned 3 of 5 leads',
      variant: 'default',
    });
  });
  
  it('should show no matches notification when no leads could be assigned', () => {
    showLeadProcessingNotifications({
      showToasts: true,
      totalLeads: 5,
      assignedCount: 0
    });
    
    expect(toast).toHaveBeenCalledWith({
      title: 'No matches found',
      description: 'Found leads but could not find matching companies',
      variant: 'destructive',
    });
  });
  
  it('should show no leads notification when no leads to process', () => {
    showLeadProcessingNotifications({
      showToasts: true,
      totalLeads: 0,
      assignedCount: 0
    });
    
    expect(toast).toHaveBeenCalledWith({
      title: 'No leads',
      description: 'No unassigned leads to process',
      variant: 'default',
    });
  });
  
  it('should handle non-Error objects as errors', () => {
    showLeadProcessingNotifications({
      showToasts: true,
      totalLeads: 0,
      assignedCount: 0,
      error: 'String error message' as unknown as Error
    });
    
    expect(toast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'An unknown error occurred',
      variant: 'destructive',
    });
  });
});
