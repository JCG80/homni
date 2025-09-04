
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { DashboardLayout } from '@/components/dashboard';
import { FileText, Search, Filter, Eye, Edit, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminLeadsData } from '@/hooks/useLeadsData';
import { LeadStatus, STATUS_LABELS, LEAD_STATUSES } from '@/types/leads-consolidated';

export const AdminLeadsPage: React.FC = () => {
  const { profile } = useAuth();
  const { leads, stats, loading, error, refetch, updateLeadStatus } = useAdminLeadsData();
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const getStatusVariant = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'secondary';
      case 'qualified': return 'default';
      case 'contacted': return 'outline';
      case 'negotiating': return 'secondary';
      case 'converted': return 'default';
      case 'lost': return 'destructive';
      case 'paused': return 'secondary';
      default: return 'secondary';
    }
  };
  
  const filteredLeads = leads
    .filter(lead => filter === 'all' || lead.status === filter)
    .filter(lead => serviceFilter === 'all' || lead.category === serviceFilter)
    .filter(lead => 
      (lead.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (lead.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (lead.customer_phone?.includes(searchQuery) || false) ||
      lead.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  const categories = [...new Set(leads.map(lead => lead.category))];

  if (loading) {
    return <div className="p-6 text-center">Laster leads...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive mb-4">Feil ved lasting av leads: {error}</p>
        <Button onClick={refetch}>Prøv igjen</Button>
      </div>
    );
  }
  
  return (
    <DashboardLayout title="Administrator - Forespørsler">
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totalt antall leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">+{stats.todayCount} i dag</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Konverteringsrate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Siste 30 dager</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nye leads</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.new}</div>
              <p className="text-xs text-muted-foreground">Krever oppmerksomhet</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gjennomsnittlig verdi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageValue} kr</div>
              <p className="text-xs text-muted-foreground">Per lead</p>
            </CardContent>
          </Card>
        </div>

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
                <Select value={filter} onValueChange={(value) => setFilter(value as LeadStatus | 'all')}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statuser</SelectItem>
                    {LEAD_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{STATUS_LABELS[status]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Kategori filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle kategorier</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
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
                          <th className="px-4 py-2 text-left font-medium">Lead</th>
                          <th className="px-4 py-2 text-left font-medium">Kunde</th>
                          <th className="px-4 py-2 text-left font-medium">Kontaktinfo</th>
                          <th className="px-4 py-2 text-left font-medium">Kategori</th>
                          <th className="px-4 py-2 text-left font-medium">Status</th>
                          <th className="px-4 py-2 text-left font-medium">Dato</th>
                          <th className="px-4 py-2 text-right font-medium">Handlinger</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="border-t">
                            <td className="px-4 py-3 font-medium" data-testid="lead-title">
                              <div>{lead.title}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {lead.description}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{lead.customer_name || 'Anonym'}</div>
                              <div className="text-sm text-muted-foreground">
                                {lead.customer_email || lead.anonymous_email || 'Ingen epost'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>{lead.customer_email || lead.anonymous_email || '-'}</div>
                              <div className="text-sm text-muted-foreground">
                                {lead.customer_phone || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{lead.category}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge 
                                variant={getStatusVariant(lead.status)}
                                data-testid="lead-pipeline-stage"
                              >
                                {STATUS_LABELS[lead.status]}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(lead.created_at).toLocaleDateString('no-NO')}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                data-testid="distribute-leads-button"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {/* TODO: Open edit modal */}}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
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
