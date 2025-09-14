
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Mail, Phone, Building } from 'lucide-react';
import { Lead, STATUS_LABELS } from '@/types/leads-canonical';
import { fetchLeadStatus } from '../api/lead-fetch';
import { LeadContactInfo } from '../components/LeadContactInfo';
import { CompanyLeadActions } from '../components/CompanyLeadActions';
import { useToast } from "@/hooks/use-toast";

export const LeadDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Ingen lead ID oppgitt');
      setIsLoading(false);
      return;
    }

    const loadLead = async () => {
      try {
        const response = await fetchLeadStatus(id);
        
        if (response.error || !response.data) {
          setError(response.error?.message || 'Kunne ikke hente lead');
          toast({
            title: 'Feil ved henting',
            description: 'Kunne ikke hente lead-detaljer',
            variant: 'destructive'
          });
          return;
        }

        setLead(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Uventet feil');
        toast({
          title: 'Feil ved henting',
          description: 'En uventet feil oppstod',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLead();
  }, [id, toast]);

  const handleLeadUpdate = async () => {
    if (!id) return;
    
    try {
      const response = await fetchLeadStatus(id);
      if (response.data) {
        setLead(response.data);
      }
    } catch (err) {
      console.error('Error refreshing lead:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Laster lead-detaljer...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/leads')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til leads
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Feil ved henting av lead</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error || 'Lead ikke funnet'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/leads')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til leads
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">{lead.title}</h1>
            <p className="text-muted-foreground">Lead ID: {lead.id}</p>
          </div>
        </div>
        
        <Badge variant="outline">
          {STATUS_LABELS[lead.status]}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead-informasjon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Beskrivelse</label>
                <p className="mt-1">{lead.description || 'Ingen beskrivelse oppgitt'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                  <p className="mt-1">{lead.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="mt-1">{lead.lead_type}</p>
                </div>
              </div>

              {lead.service_type && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tjenestetype</label>
                  <p className="mt-1">{lead.service_type}</p>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Opprettet: {new Date(lead.created_at).toLocaleDateString('no-NO')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Kundeinformasjon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.customer_name && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.customer_name}</span>
                </div>
              )}
              
              {lead.customer_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.customer_email}</span>
                </div>
              )}
              
              {lead.customer_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.customer_phone}</span>
                </div>
              )}

              {lead.company_id && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>Tildelt bedrift: {lead.company_id}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <LeadContactInfo lead={lead} />
          <CompanyLeadActions lead={lead} onLeadUpdate={handleLeadUpdate} />
        </div>
      </div>
    </div>
  );
};
