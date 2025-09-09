
import { describe, test, expect } from 'vitest';
import { parseLead } from '../utils/parseLead';
import { LEAD_STATUSES } from '@/types/leads-canonical';

describe('parseLead utility', () => {
  test('should correctly parse a valid lead object', () => {
    const rawData = {
      id: '123',
      title: 'Test Lead',
      description: 'Test Description',
      status: 'new',
      category: 'plumbing',
      zipCode: '0123',
      submitted_by: 'user-123',
      company_id: 'comp-123',
      created_at: '2023-01-01',
      updated_at: '2023-01-02'
    };

    const result = parseLead(rawData);
    
    expect(result.id).toBe('123');
    expect(result.title).toBe('Test Lead');
    expect(result.status).toBe('new');
  });

  test('should replace invalid status with "new"', () => {
    const rawData = {
      id: '123',
      title: 'Test Lead',
      status: 'invalid_status', // Invalid status
      category: 'plumbing',
      description: 'Test Description',
      submitted_by: 'user-123'
    };

    const result = parseLead(rawData);
    
    expect(result.status).toBe('new');
  });

  test('should handle missing fields gracefully', () => {
    const rawData = {
      id: '123',
      title: 'Minimal Lead',
      submitted_by: 'user-123'
    };

    const result = parseLead(rawData);
    
    expect(result.id).toBe('123');
    expect(result.title).toBe('Minimal Lead');
    expect(result.description).toBe('');
    expect(result.status).toBe('new');
    expect(result.category).toBe('');
    expect(result.submitted_by).toBe('user-123');
  });

  test('should recognize all valid status values', () => {
    LEAD_STATUSES.forEach(status => {
      const result = parseLead({ status, id: '1', title: 'Test', description: 'Test', category: 'Test', submitted_by: '1' });
      expect(result.status).toBe(status);
    });
  });
});
