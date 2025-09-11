import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Filter } from 'lucide-react';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import { LeadSearchFilters } from '../LeadSearchFilters';
import { CreateLeadModal } from '../CreateLeadModal';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import { useLeadFilters } from '../../hooks/useLeadFilters';

export const KanbanWithCreateLead: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    columns, 
    isLoading, 
    isUpdating, 
    leadCounts, 
    updateLeadStatus,
    refreshLeads,
    leads
  } = useKanbanBoard();
  
  const {
    filters,
    setFilters,
    resetFilters,
    filteredLeads,
    totalCount,
    filteredCount
  } = useLeadFilters(leads || []);

  const handleRefresh = () => {
    refreshLeads();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <CardTitle>Lead Kanban</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Nye: {leadCounts.new}</Badge>
                <Badge variant="secondary">I gang: {leadCounts.in_progress}</Badge>
                <Badge variant="secondary">Vunnet: {leadCounts.won}</Badge>
                <Badge variant="secondary">Tapt: {leadCounts.lost}</Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              
              <Button size="sm" onClick={handleRefresh} disabled={isLoading} className="gap-2">
                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Oppdater
              </Button>
              
              <CreateLeadModal onLeadCreated={handleRefresh} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {showFilters && (
            <div className="mb-6">
              <LeadSearchFilters 
                filters={filters}
                onFiltersChange={setFilters}
                onReset={resetFilters}
                totalCount={totalCount}
                filteredCount={filteredCount}
              />
            </div>
          )}
          
          <LeadKanbanBoard 
            columns={columns}
            onLeadStatusChange={updateLeadStatus}
            isLoading={isLoading}
            isUpdating={isUpdating}
          />
        </CardContent>
      </Card>
    </div>
  );
};