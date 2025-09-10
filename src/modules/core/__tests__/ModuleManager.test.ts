/**
 * Core Module Manager Tests
 * Comprehensive testing of cross-module integration
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModuleManager } from '../ModuleManager';
import { leadEngineService } from '@/modules/leads/services/leadEngineService';
import { propertyManagementService } from '@/modules/property/services/propertyManagementService';
import { diySellingService } from '@/modules/sales/services/diySellingService';

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: 'test-id', name: 'Test Property' }, 
            error: null 
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: 'test-lead-id' }, 
            error: null 
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id', email: 'test@example.com' } }, 
        error: null 
      }))
    },
    rpc: vi.fn(() => Promise.resolve({ error: null }))
  }
}));

// Mock services
vi.mock('@/modules/leads/services/leadEngineService');
vi.mock('@/modules/property/services/propertyManagementService');
vi.mock('@/modules/sales/services/diySellingService');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('ModuleManager', () => {
  let moduleManager: ModuleManager;

  beforeEach(() => {
    moduleManager = new ModuleManager();
    vi.clearAllMocks();
  });

  describe('initializeUserJourney', () => {
    it('should fetch user data from all modules', async () => {
      const userId = 'test-user-id';
      
      const profile = await moduleManager.initializeUserJourney(userId);
      
      expect(profile).toMatchObject({
        user_id: userId,
        properties: expect.any(Array),
        active_leads: expect.any(Array),
        selling_processes: expect.any(Array),
        preferences: {
          lead_notifications: true,
          maintenance_reminders: true,
          market_insights: true,
        }
      });
    });
  });

  describe('generateCrossModuleInsights', () => {
    it('should generate market opportunity insight', async () => {
      // Mock service responses
      vi.mocked(diySellingService.getMarketAnalysis).mockResolvedValue({
        estimated_value: 6000000,
        comparable_sales: [],
        market_trends: {
          avg_days_on_market: 45,
          price_trend: 'stable' as const,
          demand_level: 'medium' as const,
        }
      });

      vi.mocked(propertyManagementService.generateValueReport).mockResolvedValue({
        property: { id: 'test-property' },
        value_estimate: 5000000,
        documentation_score: 85,
        maintenance_score: 90,
        total_investment: 200000,
        market_insights: {}
      });

      const insights = await moduleManager.generateCrossModuleInsights('test-user-id');
      
      const marketOpportunity = insights.find(i => i.type === 'market_opportunity');
      expect(marketOpportunity).toBeDefined();
      expect(marketOpportunity?.priority).toBe('high');
      expect(marketOpportunity?.modules).toContain('property');
      expect(marketOpportunity?.modules).toContain('leads');
      expect(marketOpportunity?.modules).toContain('sales');
    });

    it('should generate maintenance alert insight', async () => {
      vi.mocked(propertyManagementService.getMaintenanceTasks).mockResolvedValue([
        {
          id: 'task-1',
          property_id: 'test-property',
          title: 'Overdue Task',
          description: 'Test task',
          category: 'hvac' as const,
          priority: 'high' as const,
          due_date: '2023-01-01', // Past date
        }
      ]);

      const insights = await moduleManager.generateCrossModuleInsights('test-user-id');
      
      const maintenanceAlert = insights.find(i => i.type === 'maintenance_alert');
      expect(maintenanceAlert).toBeDefined();
      expect(maintenanceAlert?.priority).toBe('medium');
    });
  });

  describe('initiatePropertySale', () => {
    it('should orchestrate property sale across modules', async () => {
      const propertyId = 'test-property-id';

      // Mock all service responses
      vi.mocked(propertyManagementService.generateValueReport).mockResolvedValue({
        property: { id: propertyId, name: 'Test Property', address: 'Test Address' },
        value_estimate: 5000000,
        documentation_score: 85,
        maintenance_score: 90,
        total_investment: 200000,
        market_insights: {}
      });

      vi.mocked(diySellingService.initializeSellingProcess).mockResolvedValue({
        id: 'process-1',
        propertyId,
        status: 'initiated'
      });

      vi.mocked(diySellingService.getMarketAnalysis).mockResolvedValue({
        estimated_value: 5500000,
        comparable_sales: [],
        market_trends: {
          avg_days_on_market: 45,
          price_trend: 'stable' as const,
          demand_level: 'medium' as const,
        }
      });

      vi.mocked(diySellingService.calculateSellingCosts).mockReturnValue({
        total: 33000,
        breakdown: [
          { item: 'Test Cost', cost: 33000, description: 'Test' }
        ]
      });

      vi.mocked(leadEngineService.submitLead).mockResolvedValue({
        id: 'new-lead-id',
        status: 'new'
      });

      const result = await moduleManager.initiatePropertySale(propertyId);

      expect(result).toMatchObject({
        selling_process: expect.any(Object),
        market_analysis: expect.any(Object),
        documentation_score: expect.any(Number),
        estimated_costs: expect.any(Object)
      });

      // Verify all services were called
      expect(propertyManagementService.generateValueReport).toHaveBeenCalledWith(propertyId);
      expect(diySellingService.initializeSellingProcess).toHaveBeenCalledWith(propertyId);
      expect(leadEngineService.submitLead).toHaveBeenCalled();
    });
  });

  describe('convertLeadToProperty', () => {
    it('should convert lead with property details to property', async () => {
      const leadId = 'test-lead-id';

      vi.mocked(propertyManagementService.createProperty).mockResolvedValue({
        id: 'new-property-id',
        name: 'Converted Property',
        type: 'apartment',
        address: 'Test Address'
      });

      const result = await moduleManager.convertLeadToProperty(leadId);

      expect(result).toMatchObject({
        id: 'new-property-id',
        name: expect.any(String)
      });
      expect(propertyManagementService.createProperty).toHaveBeenCalled();
    });
  });

  describe('getDashboardData', () => {
    it('should compile unified dashboard data', async () => {
      const userId = 'test-user-id';

      const result = await moduleManager.getDashboardData(userId);

      expect(result).toMatchObject({
        metrics: {
          total_properties: expect.any(Number),
          active_leads: expect.any(Number),
          selling_processes: expect.any(Number),
          potential_savings: expect.any(Number)
        },
        insights: expect.any(Array),
        recent_activity: expect.any(Array),
        recommendations: expect.any(Array)
      });
    });

    it('should calculate potential savings correctly', async () => {
      const userId = 'test-user-id';

      const result = await moduleManager.getDashboardData(userId);
      
      // Should calculate savings based on selling processes
      expect(result.metrics.potential_savings).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully in initializeUserJourney', async () => {
      // Mock Supabase to throw error
      const { supabase } = await import('@/lib/supabaseClient');
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(
        moduleManager.initializeUserJourney('test-user-id')
      ).rejects.toThrow('Database error');
    });

    it('should handle missing property data in initiatePropertySale', async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      } as any);

      await expect(
        moduleManager.initiatePropertySale('non-existent-property')
      ).rejects.toThrow('Property not found');
    });
  });
});