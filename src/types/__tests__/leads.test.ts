
import { describe, test, expect } from 'vitest';
import { isValidLeadStatus, LEAD_STATUSES, mapDbToLeadSettings, normalizeStatus, statusToPipeline } from '../leads';

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
      expect(isValidLeadStatus('📥 new')).toBe(false); // emoji statuses should be invalid now
    });
  });

  describe('normalizeStatus', () => {
    test('should normalize legacy emoji statuses to clean slugs', () => {
      expect(normalizeStatus('📥 new')).toBe('new');
      expect(normalizeStatus('👀 qualified')).toBe('qualified');
      expect(normalizeStatus('✅ converted')).toBe('converted');
      expect(normalizeStatus('🏆 won')).toBe('converted');
      expect(normalizeStatus('❌ lost')).toBe('lost');
    });

    test('should handle already normalized statuses', () => {
      expect(normalizeStatus('new')).toBe('new');
      expect(normalizeStatus('qualified')).toBe('qualified');
      expect(normalizeStatus('converted')).toBe('converted');
    });

    test('should default to "new" for invalid statuses', () => {
      expect(normalizeStatus('invalid')).toBe('new');
      expect(normalizeStatus('')).toBe('new');
    });
  });

  describe('statusToPipeline', () => {
    test('should map statuses to correct pipeline stages', () => {
      expect(statusToPipeline('new')).toBe('new');
      expect(statusToPipeline('converted')).toBe('won');
      expect(statusToPipeline('lost')).toBe('lost');
      expect(statusToPipeline('qualified')).toBe('in_progress');
      expect(statusToPipeline('contacted')).toBe('in_progress');
      expect(statusToPipeline('negotiating')).toBe('in_progress');
      expect(statusToPipeline('paused')).toBe('in_progress');
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
