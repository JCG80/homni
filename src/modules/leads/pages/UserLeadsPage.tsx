
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { FileText, Search, Loader2, AlertCircle, LayoutGrid, List, TrendingUp, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyLeads } from '@/modules/leads/hooks/useMyLeads';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedLeadCard } from '@/modules/leads/components/EnhancedLeadCard';
import { LeadQualityScore } from '@/modules/leads/components/LeadQualityScore';
import { useAuth } from '@/modules/auth/hooks';

export const UserLeadsPage: React.FC = () => {
  const { user } = useAuth();
  const { leads, isLoading, error, refetch } = useMyLeads();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showScoring, setShowScoring] = useState(true);
  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());
  
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

  const handleToggleExpand = (leadId: string) => {
    const newExpanded = new Set(expandedLeads);
    if (newExpanded.has(leadId)) {
      newExpanded.delete(leadId);
    } else {
      newExpanded.add(leadId);
    }
    setExpandedLeads(newExpanded);
  };

  const getLeadStats = () => {
    const total = leads.length;
    const byStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byStatus };
  };

  const stats = getLeadStats();
  
  return (
    <DashboardLayout title="Mine forespørsler">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Mine forespørsler</h1>
              <p className="text-muted-foreground">
                Se status og kvalitetsscore på dine sendte forespørsler
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={showScoring}
                onCheckedChange={setShowScoring}
                id="show-scoring"
              />
              <label htmlFor="show-scoring" className="text-sm">
                Vis kvalitetsscore
              </label>
            </div>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Totalt</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">Konvertert</span>
              </div>
              <div className="text-2xl font-bold text-success">
                {stats.byStatus.converted || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="text-sm text-muted-foreground">Aktive</span>
              </div>
              <div className="text-2xl font-bold text-warning">
                {(stats.byStatus.new || 0) + (stats.byStatus.qualified || 0) + (stats.byStatus.contacted || 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Viser</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {filteredLeads.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
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
                  onClick={() => setFilter('qualified')}
                  className={filter === 'qualified' ? 'bg-muted' : ''}
                >
                  Kvalifisert
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
            
            {/* Content */}
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
            ) : viewMode === 'card' ? (
              <div className="space-y-4">
                {filteredLeads.map((lead) => (
                  <EnhancedLeadCard
                    key={lead.id}
                    lead={lead}
                    showScoring={showScoring}
                    showActions={true}
                    expanded={expandedLeads.has(lead.id)}
                    onToggleExpand={() => handleToggleExpand(lead.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Tittel</th>
                      <th className="px-4 py-2 text-left font-medium">Kategori</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                      {showScoring && <th className="px-4 py-2 text-left font-medium">Score</th>}
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
                          {showScoring && (
                            <td className="px-4 py-3">
                              <LeadQualityScore leadId={lead.id} compact={true} />
                            </td>
                          )}
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(lead.created_at).toLocaleDateString('no-NO')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleToggleExpand(lead.id)}
                            >
                              Vis detaljer
                            </Button>
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
