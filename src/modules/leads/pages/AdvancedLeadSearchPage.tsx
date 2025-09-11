import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { useKanbanBoard } from '../hooks/useKanbanBoard';
import { AdvancedLeadSearch } from '../components/filters/AdvancedLeadSearch';
import SimpleCreateModal from '../components/SimpleCreateModal';
import { EnhancedLeadKanbanWidget } from '../components/kanban/EnhancedLeadKanbanWidget';
import { EnhancedLeadFilters, DEFAULT_ENHANCED_FILTERS } from '../types/enhanced-lead-filters';
import { Lead } from '@/types/leads-canonical';

export const AdvancedLeadSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<EnhancedLeadFilters>(DEFAULT_ENHANCED_FILTERS);
  
  // Use kanban board hook to get leads
  const { leads, isLoading, refreshLeads } = useKanbanBoard();

  // Apply advanced filters to leads
  const filteredLeads = React.useMemo(() => {
    if (!leads) return [];
    
    let filtered = [...leads];

    // Search filter - enhanced with more fields
    if (advancedFilters.search) {
      const searchLower = advancedFilters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.title?.toLowerCase().includes(searchLower) ||
        lead.description?.toLowerCase().includes(searchLower) ||
        lead.customer_name?.toLowerCase().includes(searchLower) ||
        lead.customer_email?.toLowerCase().includes(searchLower) ||
        lead.customer_phone?.toLowerCase().includes(searchLower) ||
        lead.category?.toLowerCase().includes(searchLower) ||
        lead.anonymous_email?.toLowerCase().includes(searchLower) ||
        (lead.metadata && JSON.stringify(lead.metadata).toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (advancedFilters.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === advancedFilters.status);
    }

    // Category filter
    if (advancedFilters.category !== 'all') {
      filtered = filtered.filter(lead => lead.category === advancedFilters.category);
    }

    // Enhanced date range filter
    if (advancedFilters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      let endDate = new Date();
      
      switch (advancedFilters.dateRange) {
        case '7days':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case 'custom':
          if (advancedFilters.customDateStart) {
            cutoffDate = advancedFilters.customDateStart;
          }
          if (advancedFilters.customDateEnd) {
            endDate = advancedFilters.customDateEnd;
          }
          break;
      }

      if (advancedFilters.dateRange === 'custom') {
        filtered = filtered.filter(lead => {
          const leadDate = new Date(lead.created_at);
          return (!advancedFilters.customDateStart || leadDate >= cutoffDate) &&
                 (!advancedFilters.customDateEnd || leadDate <= endDate);
        });
      } else {
        filtered = filtered.filter(lead => 
          new Date(lead.created_at) >= cutoffDate
        );
      }
    }

    // Location filter
    if (advancedFilters.location) {
      const locationLower = advancedFilters.location.toLowerCase();
      filtered = filtered.filter(lead =>
        (lead.metadata?.postcode && lead.metadata.postcode.toLowerCase().includes(locationLower)) ||
        (lead.metadata?.location && lead.metadata.location.toLowerCase().includes(locationLower))
      );
    }

    // Value range filter
    if (advancedFilters.minValue || advancedFilters.maxValue) {
      filtered = filtered.filter(lead => {
        const leadValue = lead.metadata?.estimated_value || lead.metadata?.value || 0;
        return (!advancedFilters.minValue || leadValue >= advancedFilters.minValue) &&
               (!advancedFilters.maxValue || leadValue <= advancedFilters.maxValue);
      });
    }

    // Assignment filter
    if (advancedFilters.assignedTo && advancedFilters.assignedTo !== 'all') {
      if (advancedFilters.assignedTo === 'unassigned') {
        filtered = filtered.filter(lead => !lead.company_id);
      } else {
        filtered = filtered.filter(lead => lead.company_id === advancedFilters.assignedTo);
      }
    }

    // Source filter
    if (advancedFilters.source && advancedFilters.source !== 'all') {
      filtered = filtered.filter(lead =>
        lead.metadata?.source === advancedFilters.source ||
        lead.lead_type === advancedFilters.source
      );
    }

    return filtered;
  }, [leads, advancedFilters]);

  const handleLeadCreated = () => {
    refreshLeads();
    setShowCreateModal(false);
  };

  const resetFilters = () => {
    setAdvancedFilters(DEFAULT_ENHANCED_FILTERS);
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'master_admin', 'company']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Avansert lead-søk</h1>
              <p className="text-muted-foreground">
                Bruk avanserte filtre og lagrede søk for å finne nøyaktig de leadene du leter etter
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ny lead
            </Button>
          </div>

          <AdvancedLeadSearch
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            onReset={resetFilters}
            totalCount={leads?.length || 0}
            filteredCount={filteredLeads.length}
            suggestions={[
              'Elektrikerarbeid Oslo',
              'Takservice Bergen', 
              'VVS reparasjon',
              'Malingsarbeid',
              'Rørlegging'
            ]}
          />

          <EnhancedLeadKanbanWidget 
            filteredLeads={filteredLeads}
          />

          <SimpleCreateModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onLeadCreated={handleLeadCreated}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};