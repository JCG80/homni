import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/modules/auth/hooks';
import { Mail, Phone, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { logger } from '@/utils/logger';

interface Lead {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  metadata: any;
}

export const LeadsOffersDashboard = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserLeads();
    }
  }, [user]);

  const fetchUserLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('submitted_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      logger.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'matched':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'matched':
        return <TrendingUp className="w-4 h-4" />;
      case 'contacted':
        return <Phone className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ingen forespørsler ennå</h3>
          <p className="text-muted-foreground mb-4">
            Gå tilbake til forsiden for å sende inn din første forespørsel
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Send ny forespørsel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dine forespørsler</h2>
          <p className="text-muted-foreground">
            Følg statusen på tilbudene dine og se når leverandører kontakter deg
          </p>
        </div>
        <Button onClick={() => window.location.href = '/'}>
          Ny forespørsel
        </Button>
      </div>

      <div className="grid gap-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{lead.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(lead.created_at), 'dd. MMM yyyy', { locale: nb })}
                  </p>
                </div>
                <Badge className={`${getStatusColor(lead.status)} flex items-center gap-1`}>
                  {getStatusIcon(lead.status)}
                  {lead.status === 'pending' ? 'Venter' : 
                   lead.status === 'matched' ? 'Matchet' : 
                   lead.status === 'contacted' ? 'Kontaktet' : 
                   lead.status === 'completed' ? 'Fullført' : lead.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm">{lead.description}</p>
                
                {lead.metadata && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {lead.metadata.service && (
                      <div>
                        <span className="font-medium">Tjeneste:</span> {lead.metadata.service}
                      </div>
                    )}
                    {lead.metadata.postalCode && (
                      <div>
                        <span className="font-medium">Postnummer:</span> {lead.metadata.postalCode}
                      </div>
                    )}
                    {lead.metadata.propertyType && (
                      <div>
                        <span className="font-medium">Eiendomstype:</span> {lead.metadata.propertyType}
                      </div>
                    )}
                    {lead.metadata.role && (
                      <div>
                        <span className="font-medium">Type:</span> {lead.metadata.role === 'business' ? 'Bedrift' : 'Privat'}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="text-xs">
                    {lead.category}
                  </Badge>
                  {lead.metadata?.source && (
                    <Badge variant="outline" className="text-xs">
                      {lead.metadata.source}
                    </Badge>
                  )}
                </div>

                {lead.status === 'pending' && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Vi jobber med forespørselen din</p>
                        <p className="text-blue-700">
                          Leverandører blir kontaktet nå. Du vil høre fra dem innen 24 timer.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {lead.status === 'matched' && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-green-900">Matchet med leverandører!</p>
                        <p className="text-green-700">
                          Kvalifiserte leverandører har mottatt forespørselen din og vil kontakte deg snart.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};