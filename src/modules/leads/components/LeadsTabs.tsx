
import React from 'react';
import { useLeadsList } from '../hooks/useLeads';
import { LeadRow } from './LeadRow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export const LeadsTabs = () => {
  // Fix: useLeadsList() now properly returns leads, isLoading, and error
  const { leads, isLoading, error } = useLeadsList();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Det oppstod en feil ved lasting av leads.</p>
      </div>
    );
  }

  // Group leads by category
  const insuranceLeads = leads.filter(lead => lead.category === 'insurance' || lead.category === 'forsikring');
  const propertyLeads = leads.filter(lead => lead.category === 'property' || lead.category === 'eiendom');
  const financeLeads = leads.filter(lead => lead.category === 'finance' || lead.category === 'finans');
  const otherLeads = leads.filter(lead => 
    !['insurance', 'property', 'finance', 'forsikring', 'eiendom', 'finans'].includes(lead.category)
  );

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">Alle ({leads.length})</TabsTrigger>
        <TabsTrigger value="insurance">Forsikring ({insuranceLeads.length})</TabsTrigger>
        <TabsTrigger value="property">Eiendom ({propertyLeads.length})</TabsTrigger>
        <TabsTrigger value="finance">Finans ({financeLeads.length})</TabsTrigger>
        <TabsTrigger value="other">Andre ({otherLeads.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
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
              {leads.length > 0 ? (
                leads.map(lead => (
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
      </TabsContent>

      {/* Similar TabsContent components for other categories */}
      <TabsContent value="insurance">
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
              {insuranceLeads.length > 0 ? (
                insuranceLeads.map(lead => (
                  <LeadRow key={lead.id} lead={lead} />
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center">Ingen forsikrings-leads funnet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TabsContent>

      {/* Remaining tab content sections follow similar pattern */}
    </Tabs>
  );
};
