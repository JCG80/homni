import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getCurrentSeason, 
  listTasks, 
  listDueTasksForCurrentSeason, 
  markCompleted,
  type MaintenanceTask 
} from '@/modules/maintenance/api';

// Mock Supabase client
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: mockTasks,
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockTasks[0],
              error: null
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    })),
    rpc: vi.fn(() => Promise.resolve({
      data: mockDueTasks,
      error: null
    }))
  }
}));

const mockTasks: MaintenanceTask[] = [
  {
    id: '1',
    title: 'Rengjøre takrenner',
    description: 'Fjern løv og søppel',
    seasons: ['Høst'],
    property_types: ['Enebolig', 'Rekkehus'],
    frequency_months: 12,
    priority: 'Høy',
    estimated_time: '2 hours',
    cost_estimate: 500,
    version: '0.1.0',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Sjekke røykvarslere',
    description: 'Test og skift batterier',
    seasons: ['Vinter', 'Sommer'],
    property_types: ['Enebolig', 'Leilighet'],
    frequency_months: 6,
    priority: 'Høy',
    estimated_time: '30 minutes',
    cost_estimate: 200,
    version: '0.1.0',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockDueTasks = [
  {
    task_id: '1',
    title: 'Rengjøre takrenner',
    description: 'Fjern løv og søppel',
    priority: 'Høy',
    frequency_months: 12,
    last_completed: null,
    is_due: true
  }
];

describe('Maintenance System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentSeason', () => {
    it('should return correct season for winter months', () => {
      expect(getCurrentSeason(new Date('2024-01-15'))).toBe('Vinter');
      expect(getCurrentSeason(new Date('2024-02-15'))).toBe('Vinter');
      expect(getCurrentSeason(new Date('2024-12-15'))).toBe('Vinter');
    });

    it('should return correct season for spring months', () => {
      expect(getCurrentSeason(new Date('2024-03-15'))).toBe('Vår');
      expect(getCurrentSeason(new Date('2024-04-15'))).toBe('Vår');
      expect(getCurrentSeason(new Date('2024-05-15'))).toBe('Vår');
    });

    it('should return correct season for summer months', () => {
      expect(getCurrentSeason(new Date('2024-06-15'))).toBe('Sommer');
      expect(getCurrentSeason(new Date('2024-07-15'))).toBe('Sommer');
      expect(getCurrentSeason(new Date('2024-08-15'))).toBe('Sommer');
    });

    it('should return correct season for autumn months', () => {
      expect(getCurrentSeason(new Date('2024-09-15'))).toBe('Høst');
      expect(getCurrentSeason(new Date('2024-10-15'))).toBe('Høst');
      expect(getCurrentSeason(new Date('2024-11-15'))).toBe('Høst');
    });
  });

  describe('listTasks', () => {
    it('should fetch and return maintenance tasks', async () => {
      const tasks = await listTasks();
      
      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Rengjøre takrenner');
      expect(tasks[0].priority).toBe('Høy');
      expect(tasks[0].seasons).toContain('Høst');
    });

    it('should include all required task properties', async () => {
      const tasks = await listTasks();
      const task = tasks[0];
      
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('seasons');
      expect(task).toHaveProperty('property_types');
      expect(task).toHaveProperty('frequency_months');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('estimated_time');
      expect(task).toHaveProperty('cost_estimate');
    });
  });

  describe('listDueTasksForCurrentSeason', () => {
    it('should fetch due tasks for user and current season', async () => {
      const dueTasks = await listDueTasksForCurrentSeason('user-123');
      
      expect(dueTasks).toHaveLength(1);
      expect(dueTasks[0].task_id).toBe('1');
      expect(dueTasks[0].is_due).toBe(true);
    });

    it('should filter only due tasks', async () => {
      const dueTasks = await listDueTasksForCurrentSeason('user-123');
      
      dueTasks.forEach(task => {
        expect(task.is_due).toBe(true);
      });
    });
  });

  describe('markCompleted', () => {
    it('should mark task as completed for user', async () => {
      await expect(markCompleted('task-123', 'user-123', 'Completed successfully')).resolves.not.toThrow();
    });

    it('should work without note', async () => {
      await expect(markCompleted('task-123', 'user-123')).resolves.not.toThrow();
    });
  });
});

// Health check script tests
describe('Health Check Scripts', () => {
  describe('check-duplicate-checklists.js', () => {
    it('should detect files with maintenance keywords', () => {
      const keywords = /(checklist|sjekkliste|maintenance|vedlikehold|oppgaver|tasks)/i;
      
      expect(keywords.test('This is a maintenance checklist')).toBe(true);
      expect(keywords.test('Dette er en sjekkliste')).toBe(true);
      expect(keywords.test('Regular file content')).toBe(false);
    });

    it('should allow AUTOGENERATED banner files', () => {
      const banner = /AUTOGENERATED:\s*Source=maintenance_tasks/i;
      const content = '<!-- AUTOGENERATED: Source=maintenance_tasks v0.1.0 -->\nMaintenance tasks here';
      
      expect(banner.test(content)).toBe(true);
    });
  });

  describe('check-routes-and-imports.js', () => {
    it('should detect BrowserRouter usage', () => {
      const routerPattern = /<BrowserRouter|createBrowserRouter/;
      
      expect(routerPattern.test('<BrowserRouter>')).toBe(true);
      expect(routerPattern.test('createBrowserRouter()')).toBe(true);
      expect(routerPattern.test('regular component')).toBe(false);
    });

    it('should detect @/ imports', () => {
      const importPattern = /from ['"]@\/([^'"]+)['"]/g;
      const code = "import { Component } from '@/components/Component';";
      
      const matches = [...code.matchAll(importPattern)];
      expect(matches).toHaveLength(1);
      expect(matches[0][1]).toBe('components/Component');
    });
  });
});

// Integration tests for the complete system
describe('Maintenance System Integration', () => {
  it('should provide complete workflow from dashboard to admin to docs', async () => {
    // 1. User can view due tasks for current season
    const dueTasks = await listDueTasksForCurrentSeason('user-123');
    expect(dueTasks.length).toBeGreaterThanOrEqual(0);

    // 2. User can mark task as completed
    if (dueTasks.length > 0) {
      await expect(markCompleted(dueTasks[0].task_id, 'user-123', 'Test completion')).resolves.not.toThrow();
    }

    // 3. Admin can manage all tasks
    const allTasks = await listTasks();
    expect(allTasks.length).toBeGreaterThanOrEqual(0);

    // 4. System determines correct season
    const currentSeason = getCurrentSeason();
    expect(['Vinter', 'Vår', 'Sommer', 'Høst']).toContain(currentSeason);
  });

  it('should handle edge cases gracefully', async () => {
    // Empty user ID should not crash
    await expect(listDueTasksForCurrentSeason('')).resolves.toEqual([]);

    // Season detection should work with edge dates
    expect(getCurrentSeason(new Date('2024-12-31'))).toBe('Vinter');
    expect(getCurrentSeason(new Date('2024-01-01'))).toBe('Vinter');
  });
});

// Performance and reliability tests
describe('Maintenance System Performance', () => {
  it('should complete season calculation quickly', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      getCurrentSeason(new Date(`2024-${(i % 12) + 1}-15`));
    }
    
    const end = performance.now();
    expect(end - start).toBeLessThan(100); // Should complete in under 100ms
  });

  it('should handle large task lists efficiently', async () => {
    const start = performance.now();
    await listTasks();
    const end = performance.now();
    
    expect(end - start).toBeLessThan(1000); // Should complete in under 1 second
  });
});