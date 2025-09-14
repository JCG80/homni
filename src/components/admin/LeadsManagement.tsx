import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminFullData } from '@/hooks/useLeadsData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { logger } from '@/utils/logger';

export const LeadsManagement: React.FC = () => {
  const { leads, companies, loading, refetch } = useAdminFullData();
  const { toast } = useToast();

  const handleLeadAction = async (leadId: string, action: 'accept' | 'reject', companyId?: string) => {
    try {
      const newStatus = action === 'accept' ? 'contacted' : 'lost';
      
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('lead_history')
        .insert({
          lead_id: leadId,
          assigned_to: companyId || null,
          method: 'manual',
          previous_status: action === 'accept' ? 'qualified' : 'new',
          new_status: newStatus,
          metadata: {
            action,
            admin_action: true,
            timestamp: new Date().toISOString()
          }
        });

      toast({
        title: "Success",
        description: `Lead ${action === 'accept' ? 'akseptert' : 'avvist'}`
      });
      refetch();
    } catch (error) {
      logger.error(`Error ${action}ing lead:`, {}, error);
      toast({
        title: "Error",
        description: "Feil ved oppdatering av lead",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'qualified': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-green-100 text-green-800';
      case 'negotiating': return 'bg-orange-100 text-orange-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return 'Ikke tildelt';
    const company = companies.find(c => c.id === companyId);
    return company?.name || 'Ukjent selskap';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Laster leads...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Nye</p>
                <p className="text-2xl font-bold">{leads.filter(l => l.status === 'new').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Tildelt</p>
                <p className="text-2xl font-bold">{leads.filter(l => l.company_id).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Konvertert</p>
                <p className="text-2xl font-bold">{leads.filter(l => l.status === 'converted').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Tapt</p>
                <p className="text-2xl font-bold">{leads.filter(l => l.status === 'lost').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Leads ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Ingen leads funnet. Opprett noen test leads for å se dem her.
              </p>
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{lead.title}</h3>
                      <p className="text-muted-foreground">{lead.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Kategori: <strong>{lead.category}</strong></span>
                        <span>Type: <strong>{lead.lead_type || 'general'}</strong></span>
                        {lead.anonymous_email && (
                          <span>Email: <strong>{lead.anonymous_email}</strong></span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString('no-NO')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Tildelt: </span>
                      <strong>{getCompanyName(lead.company_id)}</strong>
                    </div>
                    
                    {lead.status === 'qualified' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLeadAction(lead.id, 'accept', lead.company_id || undefined)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aksepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLeadAction(lead.id, 'reject', lead.company_id || undefined)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Avvis
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};