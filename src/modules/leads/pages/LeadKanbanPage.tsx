
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus } from 'lucide-react';
import { EnhancedLeadKanbanWidget } from '../components/kanban/EnhancedLeadKanbanWidget';
import { LeadForm } from '../components/LeadForm';
import { LeadSearchFilters } from '../components/LeadSearchFilters';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { useKanbanBoard } from '../hooks/useKanbanBoard';
import { DashboardLayout } from '@/components/dashboard';

export const LeadKanbanPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { leads, refreshLeads } = useKanbanBoard();
  const { 
    filters, 
    setFilters, 
    resetFilters, 
    filteredLeads,
    totalCount, 
    filteredCount 
  } = useLeadFilters(leads);

  const handleLeadCreated = () => {
    setIsCreateModalOpen(false);
    refreshLeads(); // Refresh the board after creating a new lead
  };
  
  return (
    <ProtectedRoute allowAnyAuthenticated>
      <DashboardLayout title="Lead Kanban Board">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake til dashboard
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold">Lead Kanban Board</h1>
                <p className="text-muted-foreground">
                  Administrer leads ved å dra og slippe mellom kolonner. Endringer lagres automatisk.
                </p>
              </div>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Ny Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Opprett Ny Lead</DialogTitle>
                </DialogHeader>
                <LeadForm onSuccess={handleLeadCreated} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <LeadSearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
            totalCount={totalCount}
            filteredCount={filteredCount}
          />

          {/* Enhanced Kanban Widget */}
          <EnhancedLeadKanbanWidget
            title={
              <div className="flex items-center gap-2">
                <span>Leads Oversikt</span>
                <span className="text-sm text-muted-foreground">
                  ({filteredCount} av {totalCount})
                </span>
              </div>
            } 
            className="mb-8"
            filteredLeads={filteredLeads}
            onAddLead={() => setIsCreateModalOpen(true)}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};
