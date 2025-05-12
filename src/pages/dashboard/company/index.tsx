
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardWidget } from '@/components/dashboard';
import { LeadKanbanBoard } from '@/components/dashboard/company/LeadKanbanBoard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApiCall } from '@/hooks/use-api-call';
import { toast } from '@/hooks/use-toast';
import { 
  BarChart, 
  CreditCard, 
  Megaphone,
  PlusCircle
} from 'lucide-react';

// Mock data for development
const MOCK_LEADS = [
  {
    id: "lead-001",
    customer_name: "Ola Nordmann",
    customer_email: "ola@nordmann.no",
    customer_phone: "+47 900 00 000",
    service_type: "Rørleggertjeneste",
    description: "Lekasje under vasken",
    status: "new",
    created_at: "2025-05-01T10:00:00Z",
    company_id: "comp-001"
  },
  {
    id: "lead-002",
    customer_name: "Kari Nordmann",
    customer_email: "kari@nordmann.no",
    customer_phone: "+47 911 11 111",
    service_type: "Malertjeneste",
    description: "Male stue før visning",
    status: "in_progress",
    created_at: "2025-05-02T14:30:00Z",
    company_id: "comp-001"
  },
  {
    id: "lead-003",
    customer_name: "Per Hansen",
    customer_email: "per@hansen.no",
    customer_phone: "+47 922 22 222",
    service_type: "Elektriker",
    description: "Bytte sikringer",
    status: "won",
    created_at: "2025-05-03T09:15:00Z",
    company_id: "comp-001"
  },
  {
    id: "lead-004",
    customer_name: "Lisa Olsen",
    customer_email: "lisa@olsen.no",
    customer_phone: "+47 933 33 333",
    service_type: "Snekker",
    description: "Bygge utendørs platting",
    status: "new",
    created_at: "2025-05-04T11:20:00Z",
    company_id: "comp-001"
  },
  {
    id: "lead-005",
    customer_name: "Erik Johansen",
    customer_email: "erik@johansen.no",
    customer_phone: "+47 944 44 444",
    service_type: "Vaskehjelp",
    description: "Flyttevask av leilighet",
    status: "in_progress",
    created_at: "2025-05-05T13:45:00Z",
    company_id: "comp-001"
  },
  {
    id: "lead-006",
    customer_name: "Morten Pedersen",
    customer_email: "morten@pedersen.no",
    customer_phone: "+47 955 55 555",
    service_type: "Gartner",
    description: "Beskjæring av hekk",
    status: "lost",
    created_at: "2025-05-06T15:30:00Z",
    company_id: "comp-001"
  },
  {
    id: "lead-007",
    customer_name: "Silje Hansen",
    customer_email: "silje@hansen.no",
    customer_phone: "+47 966 66 666",
    service_type: "Rørlegger",
    description: "Installere nytt toalett",
    status: "won",
    created_at: "2025-05-07T10:10:00Z",
    company_id: "comp-001"
  },
  {
    id: "lead-008",
    customer_name: "Thomas Nilsen",
    customer_email: "thomas@nilsen.no",
    customer_phone: "+47 977 77 777",
    service_type: "Elektriker",
    description: "Montere nye stikkontakter",
    status: "new",
    created_at: "2025-05-08T09:00:00Z",
    company_id: "comp-001"
  },
  {
    id: "lead-009",
    customer_name: "Kristin Larsen",
    customer_email: "kristin@larsen.no",
    customer_phone: "+47 988 88 888",
    service_type: "Snekker",
    description: "Reparere kjøkkenskap",
    status: "lost",
    created_at: "2025-05-09T14:20:00Z",
    company_id: "comp-001"
  }
];

const CompanyDashboard = () => {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const { call, isLoading } = useApiCall();
  
  // Update lead status
  const handleLeadStatusChange = async (leadId: string, newStatus: string) => {
    // Find the lead to update
    const leadToUpdate = leads.find(lead => lead.id === leadId);
    if (!leadToUpdate) return;
    
    // Optimistically update UI
    const oldStatus = leadToUpdate.status;
    const updatedLeads = leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);
    
    // Call API to update status
    try {
      await call(
        async () => {
          // In a real app, this would be an API call
          console.log(`Updating lead ${leadId} status to ${newStatus}`);
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          return { success: true };
        },
        {
          showSuccessToast: true,
          successToastMessage: `Lead oppdatert til ${newStatus}`,
          onError: () => {
            // Rollback on error
            setLeads(leads.map(lead => 
              lead.id === leadId ? { ...lead, status: oldStatus } : lead
            ));
          }
        }
      );
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };
  
  // Count leads by status
  const newLeads = leads.filter(lead => lead.status === 'new').length;
  const inProgressLeads = leads.filter(lead => lead.status === 'in_progress').length;
  const wonLeads = leads.filter(lead => lead.status === 'won').length;
  const lostLeads = leads.filter(lead => lead.status === 'lost').length;
  
  return (
    <DashboardLayout title="Bedrift Dashboard">
      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Nytt Lead
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Kjøp kreditter
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Megaphone className="h-4 w-4" />
          Annonser
        </Button>
      </div>
      
      {/* Main lead kanban board */}
      <div className="col-span-3 mb-6">
        <DashboardWidget title={
          <div className="flex justify-between items-center">
            <span>Mine Leads</span>
            <div className="flex gap-2">
              <Badge variant="secondary">Nye: {newLeads}</Badge>
              <Badge variant="secondary">I arbeid: {inProgressLeads}</Badge>
              <Badge variant="secondary">Vunnet: {wonLeads}</Badge>
              <Badge variant="secondary">Tapt: {lostLeads}</Badge>
            </div>
          </div>
        }>
          <LeadKanbanBoard 
            leads={leads} 
            onLeadStatusChange={handleLeadStatusChange}
            isLoading={isLoading}
          />
        </DashboardWidget>
      </div>
      
      {/* Stats widgets */}
      <DashboardWidget title="Abonnement Status">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <span>Aktive kreditter:</span>
            <Badge>24</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Abonnement:</span>
            <Badge variant="outline">Pro</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Neste fornying:</span>
            <span>01.06.2025</span>
          </div>
          <Button className="w-full mt-2">Oppgrader abonnement</Button>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Annonse Statistikk">
        <div className="flex items-center justify-center py-8 text-center">
          <div>
            <BarChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Annonse statistikk vil vises her</p>
          </div>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
