
import { describe, test, expect } from 'vitest';
import { isValidLeadStatus, LEAD_STATUSES, mapDbToLeadSettings } from '../leads';

describe('Lead Types', () => {
  describe('LeadStatus validation', () => {
    test('should correctly identify valid lead statuses', () => {
      LEAD_STATUSES.forEach(status => {
        expect(isValidLeadStatus(status)).toBe(true);
      });
    });

    test('should reject invalid lead statuses', () => {
      expect(isValidLeadStatus('pending')).toBe(false);
      expect(isValidLeadStatus('closed')).toBe(false);
      expect(isValidLeadStatus('')).toBe(false);
      expect(isValidLeadStatus(null)).toBe(false);
      expect(isValidLeadStatus(undefined)).toBe(false);
    });
  });

  describe('mapDbToLeadSettings', () => {
    test('should correctly map database object to LeadSettings', () => {
      const dbData = {
        id: '123',
        strategy: 'round_robin',
        globally_paused: true,
        global_pause: false,
        agents_paused: false,
        filters: { categories: ['plumbing', 'electrical'], zipCodes: ['0123', '4567'] },
        budget: 1000,
        daily_budget: 100,
        monthly_budget: 3000,
        updated_at: '2025-05-01T12:00:00Z'
      };

      const result = mapDbToLeadSettings(dbData);
      
      expect(result.id).toBe('123');
      expect(result.strategy).toBe('round_robin');
      expect(result.globally_paused).toBe(true);
      expect(result.paused).toBe(true); // Should be true if globally_paused is true
      expect(result.categories).toEqual(['plumbing', 'electrical']);
      expect(result.zipCodes).toEqual(['0123', '4567']);
      expect(result.budget).toBe(1000);
    });

    test('should handle missing or empty filters', () => {
      const dbData = {
        id: '123',
        strategy: 'category_match',
        globally_paused: false,
        global_pause: true,
        agents_paused: false,
        filters: null,
        budget: 500,
        updated_at: '2025-05-01T12:00:00Z'
      };

      const result = mapDbToLeadSettings(dbData);
      
      expect(result.categories).toEqual([]);
      expect(result.zipCodes).toEqual([]);
      expect(result.paused).toBe(true); // Should be true if global_pause is true
    });
  });
});
