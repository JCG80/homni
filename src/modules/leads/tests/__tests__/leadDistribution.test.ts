
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isDistributionPaused, determineDistributionStrategy, processSingleLead } from '../../utils/processLeads';
import { getCurrentStrategy } from '../../utils/getCurrentStrategy';
import { fetchLeadSettings } from '../../api/leadSettings';
import { applyLeadFilters } from '../../utils/leadFiltering';
import { assignLeadToProvider } from '../../utils/leadAssignment';
import { withRetry } from '@/utils/apiRetry';
import { makeLead } from '../factories';

// Mock dependencies
vi.mock('../../api/leadSettings', () => ({
  fetchLeadSettings: vi.fn()
}));

vi.mock('../../utils/getCurrentStrategy', () => ({
  getCurrentStrategy: vi.fn()
}));

vi.mock('../../utils/leadFiltering', () => ({
  applyLeadFilters: vi.fn()
}));

vi.mock('../../utils/leadAssignment', () => ({
  assignLeadToProvider: vi.fn()
}));

vi.mock('@/utils/apiRetry', () => ({
  withRetry: vi.fn((fn) => fn())
}));

describe('Lead Distribution System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('isDistributionPaused', () => {
    it('should return true when lead settings indicate pause', async () => {
      (fetchLeadSettings as any).mockResolvedValue({ paused: true });
      
      const result = await isDistributionPaused();
      
      expect(result).toBe(true);
      expect(fetchLeadSettings).toHaveBeenCalledTimes(1);
    });

    it('should return false when lead settings indicate not paused', async () => {
      (fetchLeadSettings as any).mockResolvedValue({ paused: false });
      
      const result = await isDistributionPaused();
      
      expect(result).toBe(false);
      expect(fetchLeadSettings).toHaveBeenCalledTimes(1);
    });

    it('should return false when no lead settings found', async () => {
      (fetchLeadSettings as any).mockResolvedValue(null);
      
      const result = await isDistributionPaused();
      
      expect(result).toBe(false);
      expect(fetchLeadSettings).toHaveBeenCalledTimes(1);
    });

    it('should return false when error occurs', async () => {
      (fetchLeadSettings as any).mockRejectedValue(new Error('Database error'));
      
      const result = await isDistributionPaused();
      
      expect(result).toBe(false);
      expect(fetchLeadSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('determineDistributionStrategy', () => {
    it('should return provided strategy if available', async () => {
      const result = await determineDistributionStrategy('roundRobin');
      
      expect(result).toBe('roundRobin');
      expect(getCurrentStrategy).not.toHaveBeenCalled();
    });

    it('should use strategy from settings if no explicit strategy provided', async () => {
      const settings = { strategy: 'category_match' };
      
      const result = await determineDistributionStrategy(undefined, settings);
      
      expect(result).toBe('category_match');
      expect(getCurrentStrategy).not.toHaveBeenCalled();
    });

    it('should fetch strategy from database if none provided or in settings', async () => {
      (getCurrentStrategy as any).mockResolvedValue('roundRobin');
      
      const result = await determineDistributionStrategy(undefined, {});
      
      expect(result).toBe('roundRobin');
      expect(getCurrentStrategy).toHaveBeenCalledTimes(1);
    });
  });

  describe('processSingleLead', () => {
    it('should return false when lead fails filtering', async () => {
      (applyLeadFilters as any).mockReturnValue(false);
      
      const testLead = makeLead({ submitted_by: 'user-123' });
      const testSettings = { filters: { categories: ['plumbing'] } };
      
      const result = await processSingleLead(testLead, testSettings, 'category_match');
      
      expect(result).toBe(false);
      expect(applyLeadFilters).toHaveBeenCalledWith(testLead, testSettings);
      expect(assignLeadToProvider).not.toHaveBeenCalled();
    });

    it('should assign lead to provider when it passes filtering', async () => {
      (applyLeadFilters as any).mockReturnValue(true);
      (assignLeadToProvider as any).mockResolvedValue(true);
      
      const testLead = makeLead({ 
        submitted_by: 'user-123',
        category: 'plumbing'
      });
      const testSettings = { filters: { categories: ['plumbing'] } };
      
      const result = await processSingleLead(testLead, testSettings, 'category_match');
      
      expect(result).toBe(true);
      expect(applyLeadFilters).toHaveBeenCalledWith(testLead, testSettings);
      expect(assignLeadToProvider).toHaveBeenCalledWith(testLead, 'category_match');
    });
  });
});
