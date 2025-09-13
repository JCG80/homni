import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { Store, TrendingUp, Users, DollarSign, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyLeads } from '@/modules/leads/hooks/useMyLeads';
import { EnhancedLeadCard } from '@/modules/leads/components/EnhancedLeadCard';
import { useAuth } from '@/modules/auth/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const MarketplacePage: React.FC = () => {
  const { user } = useAuth();
  const { leads, isLoading, error } = useMyLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());

  // Mock company ID - in real app this would come from user profile
  const companyId = user?.id; // This should be the actual company ID from user profile

  const categories = Array.from(new Set(leads.map(lead => lead.category)));

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lead.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleToggleExpand = (leadId: string) => {
    const newExpanded = new Set(expandedLeads);
    if (newExpanded.has(leadId)) {
      newExpanded.delete(leadId);
    } else {
      newExpanded.add(leadId);
    }
    setExpandedLeads(newExpanded);
  };

  const getMarketplaceStats = () => {
    return {
      totalLeads: leads.length,
      availableLeads: leads.filter(l => !l.company_id).length,
      averagePrice: 750, // This would be calculated from actual pricing
      topCategory: categories[0] || 'Ingen'
    };
  };

  const stats = getMarketplaceStats();

  return (
    <DashboardLayout title="Lead Marketplace">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Lead Marketplace</h1>
              <p className="text-muted-foreground">
                Konkurrer om høykvalitets leads fra potensielle kunder
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Tilgjengelige leads</span>
              </div>
              <div className="text-2xl font-bold">{stats.availableLeads}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">Snitt pris</span>
              </div>
              <div className="text-2xl font-bold text-success">{stats.averagePrice} kr</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-warning" />
                <span className="text-sm text-muted-foreground">Totalt leads</span>
              </div>
              <div className="text-2xl font-bold text-warning">{stats.totalLeads}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Populær kategori</span>
              </div>
              <div className="text-lg font-bold">{stats.topCategory}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Tilgjengelige Leads</TabsTrigger>
            <TabsTrigger value="my-bids">Mine Bud</TabsTrigger>
            <TabsTrigger value="won">Vunne Leads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tilgjengelige Leads for Budgivning</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Søk i leads..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className={selectedCategory === 'all' ? 'bg-muted' : ''}
                    >
                      Alle kategorier
                    </Button>
                    {categories.slice(0, 3).map(category => (
                      <Button 
                        key={category}
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category ? 'bg-muted' : ''}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Available Leads */}
                {isLoading ? (
                  <div className="text-center py-8">Laster leads...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Ingen tilgjengelige leads funnet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLeads
                      .filter(lead => !lead.company_id) // Only show unassigned leads
                      .map((lead) => (
                        <EnhancedLeadCard
                          key={lead.id}
                          lead={lead}
                          companyId={companyId}
                          showScoring={true}
                          showBidding={true}
                          showActions={true}
                          expanded={expandedLeads.has(lead.id)}
                          onToggleExpand={() => handleToggleExpand(lead.id)}
                        />
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-bids" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mine Aktive Bud</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    Her vil dine aktive bud vises. Implementering kommer snart.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="won" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vunne Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLeads
                    .filter(lead => lead.company_id === companyId)
                    .map((lead) => (
                      <EnhancedLeadCard
                        key={lead.id}
                        lead={lead}
                        companyId={companyId}
                        showScoring={true}
                        showBidding={false}
                        showActions={true}
                        expanded={expandedLeads.has(lead.id)}
                        onToggleExpand={() => handleToggleExpand(lead.id)}
                      />
                    ))
                  }
                  
                  {filteredLeads.filter(lead => lead.company_id === companyId).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Du har ikke vunnet noen leads ennå</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};