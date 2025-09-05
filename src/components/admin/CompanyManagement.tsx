import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAdminFullData } from '@/hooks/useLeadsData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, DollarSign, Target, Mail, Phone } from 'lucide-react';

export const CompanyManagement: React.FC = () => {
  const { companies, loading, refetch } = useAdminFullData();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggleStatus = async (companyId: string, currentStatus: string) => {
    setUpdating(companyId);
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('company_profiles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Selskap ${newStatus === 'active' ? 'aktivert' : 'deaktivert'}`
      });
      refetch();
    } catch (error) {
      console.error('Error updating company status:', error);
      toast({
        title: "Error", 
        description: "Feil ved oppdatering av selskapsstatus",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompanyStats = (companyId: string) => {
    // This would typically come from a separate query in a real app
    return {
      dailyBudget: (companies.find(c => c.id === companyId)?.metadata as any)?.daily_budget || 0,
      autoAccept: (companies.find(c => c.id === companyId)?.metadata as any)?.auto_accept || false,
      categories: (companies.find(c => c.id === companyId)?.metadata as any)?.categories || []
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Laster selskaper...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Totalt</p>
                <p className="text-2xl font-bold">{companies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Aktive</p>
                <p className="text-2xl font-bold">
                  {companies.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Premium</p>
                <p className="text-2xl font-bold">
                  {companies.filter(c => c.subscription_plan === 'premium').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>Selskaper ({companies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companies.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Ingen selskaper funnet.
              </p>
            ) : (
              companies.map((company) => {
                const stats = getCompanyStats(company.id);
                
                return (
                  <div key={company.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{company.name}</h3>
                          <Badge className={getStatusColor(company.status || 'inactive')}>
                            {company.status || 'inactive'}
                          </Badge>
                          <Badge className={getSubscriptionColor(company.subscription_plan || 'basic')}>
                            {company.subscription_plan || 'basic'}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mt-1">{company.industry}</p>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {company.contact_name && (
                            <span>Kontakt: <strong>{company.contact_name}</strong></span>
                          )}
                          {company.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {company.email}
                            </span>
                          )}
                          {company.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {company.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">Daglig budsjett</p>
                          <p className="font-semibold">{stats.dailyBudget} kr</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {company.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                          </span>
                          <Switch
                            checked={company.status === 'active'}
                            onCheckedChange={() => handleToggleStatus(company.id, company.status || 'inactive')}
                            disabled={updating === company.id}
                          />
                          {updating === company.id && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Kategorier</p>
                        <div className="flex flex-wrap gap-1">
                          {stats.categories.length > 0 ? (
                            stats.categories.map((category: string) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Ingen kategorier</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Moduler</p>
                        <div className="flex flex-wrap gap-1">
                          {company.modules_access && company.modules_access.length > 0 ? (
                            company.modules_access.map((module: string) => (
                              <Badge key={module} variant="outline" className="text-xs">
                                {module}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Ingen moduler</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm text-muted-foreground">
                        Auto-aksepter leads: <strong>{stats.autoAccept ? 'Ja' : 'Nei'}</strong>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Opprettet: {new Date(company.created_at || '').toLocaleDateString('no-NO')}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};