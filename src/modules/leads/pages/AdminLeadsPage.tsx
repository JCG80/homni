
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { DashboardLayout } from '@/components/dashboard';
import { FileText, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminLead {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  status: 'new' | 'assigned' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
}

// Mock data for the demo
const mockLeads: AdminLead[] = [
  {
    id: '1',
    customerName: 'Ole Nordmann',
    email: 'ole@example.com',
    phone: '98765432',
    company: 'Trygg Forsikring AS',
    service: 'Bilforsikring',
    status: 'new',
    createdAt: '2023-05-10T14:30:00Z',
  },
  {
    id: '2',
    customerName: 'Kari Hansen',
    email: 'kari@example.com',
    phone: '92345678',
    company: 'Billig Strøm AS',
    service: 'Strømavtale',
    status: 'assigned',
    createdAt: '2023-05-09T10:15:00Z',
  },
  {
    id: '3',
    customerName: 'Lars Andersen',
    email: 'lars@example.com',
    phone: '91234567',
    company: 'Nordisk Bank',
    service: 'Boliglån',
    status: 'completed',
    createdAt: '2023-05-08T16:45:00Z',
  },
];

export const AdminLeadsPage: React.FC = () => {
  const { profile } = useAuth();
  const [filter, setFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const getStatusLabel = (status: AdminLead['status']) => {
    switch (status) {
      case 'new': return { label: 'Ny', variant: 'default' };
      case 'assigned': return { label: 'Tildelt', variant: 'secondary' };
      case 'processing': return { label: 'Under behandling', variant: 'primary' };
      case 'completed': return { label: 'Fullført', variant: 'success' };
      case 'rejected': return { label: 'Avvist', variant: 'destructive' };
      default: return { label: status, variant: 'default' };
    }
  };
  
  const filteredLeads = mockLeads
    .filter(lead => filter === 'all' || lead.status === filter)
    .filter(lead => serviceFilter === 'all' || lead.service === serviceFilter)
    .filter(lead => 
      lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  const services = [...new Set(mockLeads.map(lead => lead.service))];
  
  return (
    <DashboardLayout title="Administrator - Forespørsler">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Forespørselsadministrasjon</h1>
            <p className="text-muted-foreground">
              Administrer alle kundeforespørsler på tvers av tjenester
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Forespørselsoversikt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Søk forespørsler..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statuser</SelectItem>
                    <SelectItem value="new">Nye</SelectItem>
                    <SelectItem value="assigned">Tildelt</SelectItem>
                    <SelectItem value="processing">Under behandling</SelectItem>
                    <SelectItem value="completed">Fullført</SelectItem>
                    <SelectItem value="rejected">Avvist</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tjeneste filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle tjenester</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="list">Liste</TabsTrigger>
                <TabsTrigger value="analytics">Analyse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-12 border rounded-md bg-muted/20">
                    <p className="text-lg mb-2">Ingen forespørsler funnet</p>
                    <p className="text-muted-foreground">
                      Ingen forespørsler matcher dine søkekriterier. Prøv å justere søket eller filtrene.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full" data-testid="leads-table">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Kunde</th>
                          <th className="px-4 py-2 text-left font-medium">Kontaktinfo</th>
                          <th className="px-4 py-2 text-left font-medium">Bedrift</th>
                          <th className="px-4 py-2 text-left font-medium">Tjeneste</th>
                          <th className="px-4 py-2 text-left font-medium">Status</th>
                          <th className="px-4 py-2 text-left font-medium">Dato</th>
                          <th className="px-4 py-2 text-right font-medium">Handlinger</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.map((lead) => {
                          const status = getStatusLabel(lead.status);
                          return (
                            <tr key={lead.id} className="border-t">
                              <td className="px-4 py-3 font-medium" data-testid="lead-title">{lead.customerName}</td>
                              <td className="px-4 py-3">
                                <div>{lead.email}</div>
                                <div className="text-sm text-muted-foreground">{lead.phone}</div>
                              </td>
                              <td className="px-4 py-3">{lead.company}</td>
                              <td className="px-4 py-3">{lead.service}</td>
                              <td className="px-4 py-3">
                                <Badge 
                                  variant={status.variant as any}
                                  data-testid="lead-pipeline-stage"
                                >
                                  {status.label}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {new Date(lead.createdAt).toLocaleDateString('no-NO')}
                              </td>
                              <td className="px-4 py-3 text-right space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  data-testid="distribute-leads-button"
                                >
                                  Vis detaljer
                                </Button>
                                <Button size="sm" variant="outline">Rediger</Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="analytics">
                <div className="text-center py-12 border rounded-md bg-muted/20">
                  <p className="text-lg mb-2">Forespørselsanalyse</p>
                  <p className="text-muted-foreground">
                    Analytiske verktøy for forespørsler kommer snart.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminLeadsPage;
