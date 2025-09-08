
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { DashboardLayout } from '@/components/dashboard';
import { FileText, Filter, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useCompanyLeadsData } from '@/hooks/useLeadsData';
import { LeadStatus, STATUS_LABELS } from '@/types/leads-canonical';
import { toast } from 'sonner';


export const CompanyLeadsPage: React.FC = () => {
  const { profile } = useAuth();
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { leads, stats, loading, error, updateLeadStatus, refetch } = useCompanyLeadsData();
  
  const getStatusVariant = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'default';
      case 'qualified': return 'secondary'; 
      case 'contacted': return 'outline';
      case 'negotiating': return 'secondary';
      case 'converted': return 'default';
      case 'lost': return 'destructive';
      case 'paused': return 'outline';
      default: return 'default';
    }
  };

  const handleStatusUpdate = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      toast.success(`Status oppdatert til ${STATUS_LABELS[newStatus]}`);
    } catch (error) {
      toast.error('Feil ved oppdatering av status');
    }
  };
  
  const filteredLeads = leads
    .filter(lead => filter === 'all' || lead.status === filter)
    .filter(lead => {
      const customerName = lead.metadata?.name || '';
      const customerEmail = lead.metadata?.email || '';
      const customerPhone = lead.metadata?.phone || '';
      
      return customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
             customerPhone.includes(searchQuery) ||
             lead.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
             lead.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  
  return (
    <DashboardLayout title="Bedriftsforespørsler">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Bedriftsforespørsler</h1>
              <p className="text-muted-foreground">
                Administrer innkommende forespørsler for {profile?.full_name || 'din bedrift'}
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Totalt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.byStatus.new}</div>
              <div className="text-xs text-muted-foreground">Nye</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.todayCount}</div>
              <div className="text-xs text-muted-foreground">I dag</div>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Forespørselsoversikt</span>
              <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
                {loading ? 'Oppdaterer...' : 'Oppdater'}
              </Button>
            </CardTitle>
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
                {loading ? (
                  <div className="text-center py-12 border rounded-md bg-muted/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Laster forespørsler...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 border rounded-md bg-destructive/10">
                    <p className="text-lg mb-2 text-destructive">Feil ved lasting</p>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={refetch} variant="outline">
                      Prøv igjen
                    </Button>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-12 border rounded-md bg-muted/20">
                    <p className="text-lg mb-2">Ingen forespørsler funnet</p>
                    <p className="text-muted-foreground">
                      {leads.length === 0 
                        ? 'Du har ikke mottatt noen forespørsler ennå.'
                        : 'Ingen forespørsler matcher dine søkekriterier. Prøv å justere søket eller filteret.'
                      }
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
                          const customerName = lead.metadata?.name || 'Ukjent';
                          const customerEmail = lead.metadata?.email || '';
                          const customerPhone = lead.metadata?.phone || '';
                          
                          return (
                            <tr key={lead.id} className="border-t hover:bg-muted/20">
                              <td className="px-4 py-3 font-medium">{customerName}</td>
                              <td className="px-4 py-3">
                                <div className="text-sm">{customerEmail}</div>
                                <div className="text-sm text-muted-foreground">{customerPhone}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium">{lead.category}</div>
                                <div className="text-xs text-muted-foreground">{lead.title}</div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={getStatusVariant(lead.status)}>
                                  {STATUS_LABELS[lead.status]}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground text-sm">
                                {new Date(lead.created_at).toLocaleDateString('no-NO', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  {lead.status === 'new' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(lead.id, 'contacted')}
                                      className="flex items-center gap-1"
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                      Kontakt
                                    </Button>
                                  )}
                                  
                                  {lead.status === 'contacted' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleStatusUpdate(lead.id, 'converted')}
                                        className="flex items-center gap-1"
                                      >
                                        <CheckCircle className="w-3 h-3" />
                                        Konverter
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(lead.id, 'lost')}
                                        className="flex items-center gap-1"
                                      >
                                        <XCircle className="w-3 h-3" />
                                        Tap
                                      </Button>
                                    </>
                                  )}
                                  
                                  {(lead.status === 'converted' || lead.status === 'lost') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusUpdate(lead.id, 'contacted')}
                                      className="flex items-center gap-1"
                                    >
                                      <Clock className="w-3 h-3" />
                                      Gjenåpne
                                    </Button>
                                  )}
                                </div>
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
