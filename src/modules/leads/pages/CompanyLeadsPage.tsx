
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { DashboardLayout } from '@/components/dashboard';
import { FileText, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface CompanyLead {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  service: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  createdAt: string;
}

// Mock data for the demo
const mockLeads: CompanyLead[] = [
  {
    id: '1',
    customerName: 'Ole Nordmann',
    email: 'ole@example.com',
    phone: '98765432',
    service: 'Forsikring',
    status: 'new',
    createdAt: '2023-05-10T14:30:00Z',
  },
  {
    id: '2',
    customerName: 'Kari Hansen',
    email: 'kari@example.com',
    phone: '92345678',
    service: 'Strøm',
    status: 'contacted',
    createdAt: '2023-05-09T10:15:00Z',
  },
  {
    id: '3',
    customerName: 'Lars Andersen',
    email: 'lars@example.com',
    phone: '91234567',
    service: 'Boliglån',
    status: 'qualified',
    createdAt: '2023-05-08T16:45:00Z',
  },
];

export const CompanyLeadsPage: React.FC = () => {
  const { profile } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const getStatusLabel = (status: CompanyLead['status']) => {
    switch (status) {
      case 'new': return { label: 'Ny', variant: 'default' };
      case 'contacted': return { label: 'Kontaktet', variant: 'secondary' };
      case 'qualified': return { label: 'Kvalifisert', variant: 'primary' };
      case 'converted': return { label: 'Konvertert', variant: 'success' };
      case 'lost': return { label: 'Tapt', variant: 'destructive' };
      default: return { label: status, variant: 'default' };
    }
  };
  
  const filteredLeads = mockLeads
    .filter(lead => filter === 'all' || lead.status === filter)
    .filter(lead => 
      lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.service.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  return (
    <DashboardLayout title="Bedriftsforespørsler">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Bedriftsforespørsler</h1>
            <p className="text-muted-foreground">
              Administrer innkommende forespørsler for {profile?.full_name || 'din bedrift'}
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-muted' : ''}
                >
                  Alle
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFilter('new')}
                  className={filter === 'new' ? 'bg-muted' : ''}
                >
                  Nye
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFilter('contacted')}
                  className={filter === 'contacted' ? 'bg-muted' : ''}
                >
                  Kontaktet
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="list">Liste</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-12 border rounded-md bg-muted/20">
                    <p className="text-lg mb-2">Ingen forespørsler funnet</p>
                    <p className="text-muted-foreground">
                      Ingen forespørsler matcher dine søkekriterier. Prøv å justere søket eller filteret.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Kunde</th>
                          <th className="px-4 py-2 text-left font-medium">Kontaktinfo</th>
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
                              <td className="px-4 py-3 font-medium">{lead.customerName}</td>
                              <td className="px-4 py-3">
                                <div>{lead.email}</div>
                                <div className="text-sm text-muted-foreground">{lead.phone}</div>
                              </td>
                              <td className="px-4 py-3">{lead.service}</td>
                              <td className="px-4 py-3">
                                <Badge variant={status.variant as any}>
                                  {status.label}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {new Date(lead.createdAt).toLocaleDateString('no-NO')}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button size="sm" variant="outline">Vis detaljer</Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="kanban">
                <div className="text-center py-12 border rounded-md bg-muted/20">
                  <p className="text-lg mb-2">Kanban-visning</p>
                  <p className="text-muted-foreground">
                    Kanban-visning for forespørsler kommer snart.
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

export default CompanyLeadsPage;
