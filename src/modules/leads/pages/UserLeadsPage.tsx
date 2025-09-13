
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { FileText, Search, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMyLeads } from '@/modules/leads/hooks/useMyLeads';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const UserLeadsPage: React.FC = () => {
  const { leads, isLoading, error, refetch } = useMyLeads();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return { label: 'Ny', variant: 'default' };
      case 'qualified': return { label: 'Kvalifisert', variant: 'secondary' };
      case 'contacted': return { label: 'Kontaktet', variant: 'primary' };
      case 'negotiating': return { label: 'Forhandler', variant: 'warning' };
      case 'converted': return { label: 'Konvertert', variant: 'success' };
      case 'lost': return { label: 'Tapt', variant: 'destructive' };
      case 'paused': return { label: 'Pauset', variant: 'outline' };
      default: return { label: status || 'Ukjent', variant: 'default' };
    }
  };
  
  const filteredLeads = leads
    .filter(lead => filter === 'all' || lead.status?.toLowerCase() === filter)
    .filter(lead => 
      lead.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
            {error && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Kunne ikke laste forespørsler. <Button variant="link" onClick={refetch} className="p-0 h-auto">Prøv igjen</Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Søk i forespørsler..."
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
                  onClick={() => setFilter('converted')}
                  className={filter === 'converted' ? 'bg-muted' : ''}
                >
                  Konvertert
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Laster forespørsler...</span>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-muted/20">
                <p className="text-lg mb-2">
                  {leads.length === 0 ? 'Ingen forespørsler funnet' : 'Ingen forespørsler matcher søket'}
                </p>
                <p className="text-muted-foreground">
                  {leads.length === 0 
                    ? 'Du har ingen aktive forespørsler for øyeblikket. Nye forespørsler vil vises her når du sender de inn.'
                    : 'Prøv å endre søkekriteriene eller filteret.'
                  }
                </p>
                {leads.length === 0 && <Button className="mt-4">Send ny forespørsel</Button>}
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Tittel</th>
                      <th className="px-4 py-2 text-left font-medium">Kategori</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                      <th className="px-4 py-2 text-left font-medium">Dato</th>
                      <th className="px-4 py-2 text-right font-medium">Handlinger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => {
                      const status = getStatusLabel(lead.status);
                      return (
                        <tr key={lead.id} className="border-t hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">{lead.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {lead.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{lead.category}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={status.variant as any}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(lead.created_at).toLocaleDateString('no-NO')}
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
