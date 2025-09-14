
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { showLeadProcessingNotifications } from '../../utils/leadNotifications';
import { toast } from "@/hooks/use-toast";

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('Lead Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('showLeadProcessingNotifications', () => {
    it('should not show notifications when showToasts is false', () => {
      // Arrange
      const options = {
        showToasts: false,
        totalLeads: 5,
        assignedCount: 3
      };
      
      // Act
      showLeadProcessingNotifications(options);
      
      // Assert
      expect(toast).not.toHaveBeenCalled();
    });
    
    it('should show error notification when error is provided', () => {
      // Arrange
      const testError = new Error('Test error');
      const options = {
        showToasts: true,
        totalLeads: 5,
        assignedCount: 0,
        error: testError
      };
      
      // Act
      showLeadProcessingNotifications(options);
      
      // Assert
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Test error',
        variant: 'destructive',
      });
    });
    
    it('should show success notification when leads are assigned', () => {
      // Arrange
      const options = {
        showToasts: true,
        totalLeads: 5,
        assignedCount: 3
      };
      
      // Act
      showLeadProcessingNotifications(options);
      
      // Assert
      expect(toast).toHaveBeenCalledWith({
        title: 'Leads distributed',
        description: 'Successfully assigned 3 of 5 leads',
        variant: 'default',
      });
    });
    
    it('should show no matches notification when no leads could be assigned', () => {
      // Arrange
      const options = {
        showToasts: true,
        totalLeads: 5,
        assignedCount: 0
      };
      
      // Act
      showLeadProcessingNotifications(options);
      
      // Assert
      expect(toast).toHaveBeenCalledWith({
        title: 'No matches found',
        description: 'Found leads but could not find matching companies',
        variant: 'destructive',
      });
    });
    
    it('should show no leads notification when no leads to process', () => {
      // Arrange
      const options = {
        showToasts: true,
        totalLeads: 0,
        assignedCount: 0
      };
      
      // Act
      showLeadProcessingNotifications(options);
      
      // Assert
      expect(toast).toHaveBeenCalledWith({
        title: 'No leads',
        description: 'No unassigned leads to process',
        variant: 'default',
      });
    });
    
    it('should handle non-Error objects as errors', () => {
      // Arrange
      const options = {
        showToasts: true,
        totalLeads: 0,
        assignedCount: 0,
        error: 'String error message' as unknown as Error
      };
      
      // Act
      showLeadProcessingNotifications(options);
      
      // Assert
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'An unknown error occurred',
        variant: 'destructive',
      });
    });
  });
});
