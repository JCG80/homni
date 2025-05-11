
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader, FileText, BarChart3, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModuleAccessManager } from './ModuleAccessManager';
import { CompanyProfile } from '../types/types';

interface CompanyDetailViewProps {
  company: CompanyProfile;
  onClose: () => void;
  onUpdate: () => void;
}

export function CompanyDetailView({ company, onClose, onUpdate }: CompanyDetailViewProps) {
  const [activeTab, setActiveTab] = useState('purchases');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch company's purchase history
  const { data: purchases = [], isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['company-purchases', company.id],
    queryFn: async () => {
      // This would be populated from a real purchases table
      // For demonstration, returning mock data
      return [
        { 
          id: '1', 
          type: 'lead', 
          amount: 1500, 
          date: new Date().toISOString(), 
          description: 'Kjøp av 5 leads innen kategori: Bolig' 
        },
        { 
          id: '2', 
          type: 'ad', 
          amount: 3000, 
          date: new Date(Date.now() - 86400000).toISOString(), 
          description: 'Kjøp av 10 annonsevisninger i 30 dager' 
        }
      ];
    }
  });
  
  // Fetch company's statistics
  const { data: stats = {}, isLoading: isLoadingStats } = useQuery({
    queryKey: ['company-stats', company.id],
    queryFn: async () => {
      // This would be calculated from real data
      // For demonstration, returning mock data that matches our type
      return {
        leadsWonPercentage: 65,
        avgResponseTime: '2.5 timer',
        customerRating: 4.2,
        monthlyTrend: 'increasing'
      };
    }
  });
  
  // Fetch company's notes and module access
  const { data: companyData, isLoading: isLoadingCompany, error: companyError } = useQuery({
    queryKey: ['company-details', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from<CompanyProfile>('company_profiles')
        .select('*')
        .eq('id', company.id)
        .single();
      
      if (error) throw error;
      
      // Set the notes if available
      if (data?.metadata?.admin_notes) {
        setNotes(data.metadata.admin_notes);
      }
      
      return data;
    }
  });
  
  const saveNotes = async () => {
    setIsSaving(true);
    try {
      // Get the current metadata
      const currentMetadata = companyData?.metadata || {};
      
      // Update the metadata with the new notes
      const { error } = await supabase
        .from<CompanyProfile>('company_profiles')
        .update({
          metadata: {
            ...currentMetadata,
            admin_notes: notes
          }
        })
        .eq('id', company.id);
      
      if (error) throw error;
      
      toast({
        title: 'Notater lagret',
        description: 'Dine notater ble lagret.',
      });
      
      onUpdate();
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke lagre notater.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('nb-NO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Ugyldig dato';
    }
  };

  // Error rendering helper
  const renderError = (message: string) => (
    <div className="flex flex-col items-center justify-center p-8 text-red-500">
      <AlertCircle className="h-10 w-10 mb-2" />
      <p>{message}</p>
      <Button 
        variant="outline" 
        onClick={() => window.location.reload()} 
        className="mt-4"
      >
        Prøv igjen
      </Button>
    </div>
  );

  if (companyError) {
    return renderError(`Kunne ikke laste bedriftsdata: ${companyError instanceof Error ? companyError.message : 'Ukjent feil'}`);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium">Bedriftsnavn:</p>
          <p className="text-lg">{company.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Kontaktperson:</p>
          <p className="text-lg">{company.contact_name ?? 'Ikke angitt'}</p>
        </div>
        <div>
          <p className="text-sm font-medium">E-post:</p>
          <p className="text-lg">{company.email ?? 'Ikke angitt'}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Telefon:</p>
          <p className="text-lg">{company.phone ?? 'Ikke angitt'}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Abonnement:</p>
          <p className="text-lg capitalize">{company.subscription_plan ?? 'Ikke angitt'}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Status:</p>
          <p className="text-lg">{company.status === 'active' ? 'Aktiv' : company.status === 'blocked' ? 'Blokkert' : 'Inaktiv'}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="purchases">Kjøpshistorikk</TabsTrigger>
          <TabsTrigger value="statistics">Konverteringsstatistikk</TabsTrigger>
          <TabsTrigger value="notes">Interne notater</TabsTrigger>
          <TabsTrigger value="access">Modultilgang</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchases">
          {isLoadingPurchases ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-2">Laster kjøpshistorikk...</span>
            </div>
          ) : purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{purchase.description}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">Type:</p>
                        <p className="text-sm capitalize">{purchase.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Beløp:</p>
                        <p className="text-sm">{purchase.amount} kr</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Dato:</p>
                        <p className="text-sm">{formatDate(purchase.date)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Ingen kjøpshistorikk funnet for denne bedriften.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="statistics">
          {isLoadingStats ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-2">Laster statistikk...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Konverteringsrate for leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{company.leadsWonPercentage ?? stats.leadsWonPercentage ?? 0}%</div>
                  <p className="text-sm text-muted-foreground">
                    Prosent av mottatte leads som resulterte i vunnet oppdrag
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Gjennomsnittlig responstid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{company.avgResponseTime ?? stats.avgResponseTime ?? 'N/A'}</div>
                  <p className="text-sm text-muted-foreground">
                    Hvor raskt bedriften vanligvis svarer på nye leads
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Kundetilfredshet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{company.customerRating ?? stats.customerRating ?? 0}/5</div>
                  <p className="text-sm text-muted-foreground">
                    Gjennomsnittlig rating fra kunder
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Månedlig trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2 capitalize">{company.monthlyTrend ?? stats.monthlyTrend ?? 'Stabil'}</div>
                  <p className="text-sm text-muted-foreground">
                    Trend for konverteringsrate den siste måneden
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="notes">
          {isLoadingCompany ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-2">Laster notater...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-medium">Interne notater</h3>
              </div>
              <Textarea 
                placeholder="Skriv interne notater om denne bedriften her..."
                className="min-h-[200px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={saveNotes} 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Lagrer...
                    </>
                  ) : 'Lagre notater'}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="access">
          {isLoadingCompany ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-2">Laster modultilgang...</span>
            </div>
          ) : company.user_id ? (
            <ModuleAccessManager 
              userId={company.user_id} 
              onUpdate={onUpdate}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Ingen bruker tilknyttet denne bedriften.
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={onClose}>Lukk</Button>
      </div>
    </div>
  );
}
