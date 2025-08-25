
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { DashboardLayout } from '@/components/dashboard';
import { FileText, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface UserLead {
  id: string;
  companyName: string;
  service: string;
  status: 'pending' | 'processing' | 'responded' | 'completed' | 'cancelled';
  createdAt: string;
}

// Mock data for the demo
const mockLeads: UserLead[] = [
  {
    id: '1',
    companyName: 'Trygg Forsikring AS',
    service: 'Bilforsikring',
    status: 'pending',
    createdAt: '2023-05-10T14:30:00Z',
  },
  {
    id: '2',
    companyName: 'Billig Strøm AS',
    service: 'Strømavtale',
    status: 'responded',
    createdAt: '2023-05-09T10:15:00Z',
  },
  {
    id: '3',
    companyName: 'Nordisk Bank',
    service: 'Boliglån',
    status: 'completed',
    createdAt: '2023-05-08T16:45:00Z',
  },
];

export const UserLeadsPage: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const getStatusLabel = (status: UserLead['status']) => {
    switch (status) {
      case 'pending': return { label: 'Venter', variant: 'default' };
      case 'processing': return { label: 'Under behandling', variant: 'secondary' };
      case 'responded': return { label: 'Svart', variant: 'primary' };
      case 'completed': return { label: 'Fullført', variant: 'success' };
      case 'cancelled': return { label: 'Kansellert', variant: 'destructive' };
      default: return { label: status, variant: 'default' };
    }
  };
  
  const filteredLeads = mockLeads
    .filter(lead => filter === 'all' || lead.status === filter)
    .filter(lead => 
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.service.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  return (
    <DashboardLayout title="Mine forespørsler">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Mine forespørsler</h1>
            <p className="text-muted-foreground">
              Se status på dine sendte forespørsler
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
                  onClick={() => setFilter('pending')}
                  className={filter === 'pending' ? 'bg-muted' : ''}
                >
                  Venter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFilter('completed')}
                  className={filter === 'completed' ? 'bg-muted' : ''}
                >
                  Fullført
                </Button>
              </div>
            </div>
            
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-muted/20">
                <p className="text-lg mb-2">Ingen forespørsler funnet</p>
                <p className="text-muted-foreground">
                  Du har ingen aktive forespørsler for øyeblikket. Nye forespørsler vil vises her når du sender de inn.
                </p>
                <Button className="mt-4">Send ny forespørsel</Button>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
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
                          <td className="px-4 py-3 font-medium">{lead.companyName}</td>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserLeadsPage;
