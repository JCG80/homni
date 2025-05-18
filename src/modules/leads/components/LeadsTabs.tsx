
import React, { useMemo } from 'react';
import { useLeadsList } from '../hooks/useLeads';
import { LeadRow } from './LeadRow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Lead } from '@/types/leads';

export const LeadsTabs = () => {
  const { leads, isLoading, error } = useLeadsList();

  // Group leads by category using useMemo for performance
  const groupedLeads = useMemo(() => {
    if (!leads || leads.length === 0) return {
      insurance: [],
      property: [],
      finance: [],
      other: []
    };

    return {
      insurance: leads.filter(lead => lead.category?.toLowerCase().includes('insurance') || 
                                      lead.category?.toLowerCase().includes('forsikring')),
      property: leads.filter(lead => lead.category?.toLowerCase().includes('property') || 
                                     lead.category?.toLowerCase().includes('eiendom')),
      finance: leads.filter(lead => lead.category?.toLowerCase().includes('finance') || 
                                    lead.category?.toLowerCase().includes('finans')),
      other: leads.filter(lead => {
        const category = lead.category?.toLowerCase();
        return !category?.includes('insurance') && 
               !category?.includes('forsikring') && 
               !category?.includes('property') && 
               !category?.includes('eiendom') && 
               !category?.includes('finance') && 
               !category?.includes('finans');
      })
    };
  }, [leads]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    // Use toast to show error message
    toast.error("Kunne ikke laste inn leads");
    
    return (
      <div className="p-4 text-center text-red-500">
        <p>Det oppstod en feil ved lasting av leads.</p>
        <p className="text-sm">{error instanceof Error ? error.message : 'Ukjent feil'}</p>
      </div>
    );
  }

  // Function to render table with leads
  const renderLeadsTable = (categoryLeads: Lead[]) => (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-2">Tittel</th>
            <th className="text-left p-2">Kategori</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Dato</th>
          </tr>
        </thead>
        <tbody>
          {categoryLeads.length > 0 ? (
            categoryLeads.map(lead => (
              <LeadRow key={lead.id} lead={lead} />
            ))
          ) : (
            <tr>
              <td colSpan={4} className="p-4 text-center">Ingen leads funnet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">Alle ({leads.length})</TabsTrigger>
        <TabsTrigger value="insurance">Forsikring ({groupedLeads.insurance.length})</TabsTrigger>
        <TabsTrigger value="property">Eiendom ({groupedLeads.property.length})</TabsTrigger>
        <TabsTrigger value="finance">Finans ({groupedLeads.finance.length})</TabsTrigger>
        <TabsTrigger value="other">Andre ({groupedLeads.other.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        {renderLeadsTable(leads)}
      </TabsContent>

      <TabsContent value="insurance">
        {renderLeadsTable(groupedLeads.insurance)}
      </TabsContent>

      <TabsContent value="property">
        {renderLeadsTable(groupedLeads.property)}
      </TabsContent>

      <TabsContent value="finance">
        {renderLeadsTable(groupedLeads.finance)}
      </TabsContent>

      <TabsContent value="other">
        {renderLeadsTable(groupedLeads.other)}
      </TabsContent>
    </Tabs>
  );
};
