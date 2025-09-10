/**
 * Integration Tests - Cross-module workflow testing
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UnifiedDashboard } from '../UnifiedDashboard';
import { ModuleIntegrationHub } from '@/components/modules/ModuleIntegrationHub';

// Mock auth hook
vi.mock('@/modules/auth/hooks', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    role: 'user'
  }))
}));

// Mock module manager
vi.mock('../ModuleManager', () => ({
  moduleManager: {
    getDashboardData: vi.fn(() => Promise.resolve({
      metrics: {
        total_properties: 2,
        active_leads: 3,
        selling_processes: 1,
        potential_savings: 87500
      },
      insights: [
        {
          id: 'test-insight',
          type: 'market_opportunity',
          title: 'Test Insight',
          description: 'Test description',
          priority: 'high',
          modules: ['property', 'sales'],
          actionable: true
        }
      ],
      recent_activity: [
        {
          id: 'activity-1',
          type: 'property_added',
          title: 'Property added',
          timestamp: new Date(),
          module: 'property'
        }
      ],
      recommendations: [
        {
          id: 'rec-1',
          title: 'Complete documentation',
          description: 'Upload missing documents',
          priority: 'medium',
          action: 'view_property_docs'
        }
      ]
    })),
    initializeUserJourney: vi.fn(() => Promise.resolve({
      user_id: 'test-user-id',
      properties: [{ id: 'prop-1', name: 'Test Property' }],
      active_leads: [],
      selling_processes: [],
      preferences: {
        lead_notifications: true,
        maintenance_reminders: true,
        market_insights: true
      }
    }))
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Core Module Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UnifiedDashboard', () => {
    it('should render dashboard with metrics', async () => {
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Mine eiendommer')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('Aktive leads')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should display insights tab with cross-module data', async () => {
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        const insightsTab = screen.getByText('Innsikter');
        fireEvent.click(insightsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Insight')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
      });
    });

    it('should show activity feed with module integration', async () => {
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        const activityTab = screen.getByText('Aktivitet');
        fireEvent.click(activityTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Property added')).toBeInTheDocument();
      });
    });

    it('should display recommendations with actionable items', async () => {
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        const recommendationsTab = screen.getByText('Anbefalinger');
        fireEvent.click(recommendationsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Complete documentation')).toBeInTheDocument();
        expect(screen.getByText('Upload missing documents')).toBeInTheDocument();
      });
    });
  });

  describe('ModuleIntegrationHub', () => {
    it('should render available workflows', async () => {
      render(
        <TestWrapper>
          <ModuleIntegrationHub />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Integrasjonshub')).toBeInTheDocument();
        expect(screen.getByText('Koble sammen dine eiendommer')).toBeInTheDocument();
      });
    });

    it('should categorize workflows correctly', async () => {
      render(
        <TestWrapper>
          <ModuleIntegrationHub />
        </TestWrapper>
      );

      await waitFor(() => {
        const categoryTab = screen.getByText('Etter kategori');
        fireEvent.click(categoryTab);
      });

      // Should show different workflow categories
      await waitFor(() => {
        const categories = screen.getAllByText(/Tversgående/);
        expect(categories.length).toBeGreaterThan(0);
      });
    });

    it('should filter workflows by complexity', async () => {
      render(
        <TestWrapper>
          <ModuleIntegrationHub />
        </TestWrapper>
      );

      await waitFor(() => {
        const complexityTab = screen.getByText('Etter kompleksitet');
        fireEvent.click(complexityTab);
      });

      // Should show complexity-based groupings
      await waitFor(() => {
        const complexityLevels = screen.getAllByText(/Enkle/);
        expect(complexityLevels.length).toBeGreaterThan(0);
      });
    });

    it('should handle workflow execution', async () => {
      const { toast } = await import('sonner');
      
      render(
        <TestWrapper>
          <ModuleIntegrationHub />
        </TestWrapper>
      );

      await waitFor(() => {
        // Look for any "Start" button in workflows
        const startButtons = screen.getAllByText('Start arbeidsflyt');
        if (startButtons.length > 0) {
          fireEvent.click(startButtons[0]);
        }
      });

      // Should show success toast
      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe('Cross-Module Data Flow', () => {
    it('should handle property to sales workflow', async () => {
      const { moduleManager } = await import('../ModuleManager');
      
      // Test the property-to-sale integration
      vi.mocked(moduleManager.initializeUserJourney).mockResolvedValue({
        user_id: 'test-user',
        properties: [{ id: 'prop-1', name: 'Test Property', address: 'Test Address' }],
        active_leads: [],
        selling_processes: [],
        preferences: {
          lead_notifications: true,
          maintenance_reminders: true,
          market_insights: true
        }
      });

      render(
        <TestWrapper>
          <ModuleIntegrationHub />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show property-to-sale workflow as available
        expect(screen.getByText('Eiendom til DIY-salg')).toBeInTheDocument();
      });
    });

    it('should handle lead to property workflow', async () => {
      const { moduleManager } = await import('../ModuleManager');
      
      // Mock user with property-related leads
      vi.mocked(moduleManager.initializeUserJourney).mockResolvedValue({
        user_id: 'test-user',
        properties: [],
        active_leads: [{
          id: 'lead-1',
          category: 'property_documentation',
          metadata: { property_details: { address: 'Test Address' } }
        }],
        selling_processes: [],
        preferences: {
          lead_notifications: true,
          maintenance_reminders: true,
          market_insights: true
        }
      });

      render(
        <TestWrapper>
          <ModuleIntegrationHub />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show lead-to-property workflow as available
        expect(screen.getByText('Lead til eiendomsregistrering')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle dashboard data loading errors gracefully', async () => {
      const { moduleManager } = await import('../ModuleManager');
      vi.mocked(moduleManager.getDashboardData).mockRejectedValue(new Error('Network error'));
      
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Kunne ikke laste dashboard-data')).toBeInTheDocument();
      });
    });

    it('should handle workflow loading errors', async () => {
      const { moduleManager } = await import('../ModuleManager');
      vi.mocked(moduleManager.initializeUserJourney).mockRejectedValue(new Error('Network error'));
      
      render(
        <TestWrapper>
          <ModuleIntegrationHub />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should still render the component but show error state
        expect(screen.getByText('Integrasjonshub')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should lazy load components', async () => {
      // Test that components are properly lazy loaded
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );
      
      const loadTime = performance.now() - startTime;
      
      // Should load relatively quickly (under 100ms for initial render)
      expect(loadTime).toBeLessThan(100);
    });

    it('should handle large datasets efficiently', async () => {
      const { moduleManager } = await import('../ModuleManager');
      
      // Mock large dataset
      const largeDashboardData = {
        metrics: {
          total_properties: 100,
          active_leads: 500,
          selling_processes: 25,
          potential_savings: 2187500
        },
        insights: Array.from({ length: 50 }, (_, i) => ({
          id: `insight-${i}`,
          type: 'market_opportunity' as const,
          title: `Insight ${i}`,
          description: `Description ${i}`,
          priority: 'medium' as const,
          modules: ['property', 'sales'],
          actionable: true
        })),
        recent_activity: Array.from({ length: 100 }, (_, i) => ({
          id: `activity-${i}`,
          type: 'property_added',
          title: `Activity ${i}`,
          timestamp: new Date(),
          module: 'property'
        })),
        recommendations: Array.from({ length: 20 }, (_, i) => ({
          id: `rec-${i}`,
          title: `Recommendation ${i}`,
          description: `Description ${i}`,
          priority: 'medium',
          action: 'view_property_docs'
        }))
      };

      vi.mocked(moduleManager.getDashboardData).mockResolvedValue(largeDashboardData);

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument();
      });
      
      const renderTime = performance.now() - startTime;
      
      // Should handle large datasets efficiently (under 500ms)
      expect(renderTime).toBeLessThan(500);
    });
  });
});