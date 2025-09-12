import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Mail, 
  Clock, 
  Shield, 
  UserPlus, 
  Search,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { LightRegistrationFlow } from '@/components/landing/LightRegistrationFlow';

interface AnonymousLead {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  metadata: any;
}

export const AnonymousLeadViewer = () => {
  const [email, setEmail] = useState('');
  const [leads, setLeads] = useState<AnonymousLead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchLeads = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Vennligst skriv inn en gyldig e-postadresse');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Search for leads with matching anonymous_email
      const { data, error } = await supabase
        .from('leads')
        .select('id, title, description, category, status, created_at, metadata')
        .eq('anonymous_email', email.toLowerCase())
        .is('submitted_by', null)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error searching leads:', error);
        toast.error('Feil ved søk etter forespørsler');
        return;
      }

      setLeads(data || []);
      
      if (!data || data.length === 0) {
        toast.info('Ingen forespørsler funnet for denne e-postadressen');
      } else {
        toast.success(`Fant ${data.length} forespørsel${data.length > 1 ? 'er' : ''}`);
      }
    } catch (error) {
      logger.error('Error searching leads:', error);
      toast.error('Feil ved søk etter forespørsler');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'converted':
        return 'bg-emerald-100 text-emerald-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Ny';
      case 'qualified':
        return 'Kvalifisert';
      case 'contacted':
        return 'Kontaktet';
      case 'converted':
        return 'Konvertert';
      case 'lost':
        return 'Tapt';
      default:
        return status;
    }
  };

  const handleRegistrationSuccess = () => {
    // Redirect to dashboard after successful registration
    window.location.href = '/dashboard';
  };

  if (showRegistration && email) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <LightRegistrationFlow
            email={email}
            role="private"
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setShowRegistration(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Se dine forespørsler</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Skriv inn e-postadressen du brukte når du sendte forespørselen for å se status og detaljer.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Finn dine forespørsler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email">E-postadresse</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@epost.no"
                  className="mt-1"
                  onKeyDown={(e) => e.key === 'Enter' && searchLeads()}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={searchLeads}
                  disabled={isSearching || !email}
                  className="min-w-[120px]"
                >
                  {isSearching ? 'Søker...' : 'Søk'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && leads.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Dine forespørsler ({leads.length})</h2>
            </div>

            <div className="space-y-4 mb-8">
              {leads.map((lead) => (
                <Card key={lead.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{lead.title}</h3>
                        <p className="text-muted-foreground mb-3">{lead.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(lead.created_at).toLocaleDateString('nb-NO')}
                          </span>
                          <span>Kategori: {lead.category}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>
                        {getStatusText(lead.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Registration CTA */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Hold bedre oversikt</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Opprett en gratis konto for å administrere alle forespørslene dine på ett sted, få varsler og se detaljert historikk.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowRegistration(true)}
                    className="min-w-[200px]"
                    size="lg"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Opprett gratis konto
                  </Button>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Automatisk koblet til dine forespørsler
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* No results message */}
        {hasSearched && leads.length === 0 && (
          <Card className="text-center p-8">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ingen forespørsler funnet</h3>
            <p className="text-muted-foreground mb-6">
              Vi fant ingen forespørsler knyttet til e-postadressen <strong>{email}</strong>.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Dette kan skyldes:
              </p>
              <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-1">
                <li>• Du har brukt en annen e-postadresse</li>
                <li>• Forespørselen er allerede tilknyttet en konto</li>
                <li>• Du har ikke sendt noen forespørsler ennå</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => setEmail('')}>
                  Prøv annen e-postadresse
                </Button>
                <Button asChild>
                  <Link to="/select-services">Send ny forespørsel</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}

{/* Info card for first-time visitors */}
        {!hasSearched && (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Første gang her?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Hvis du ikke har sendt noen forespørsler ennå, kan du starte her:
              </p>
              <Button variant="outline" asChild>
                <Link to="/select-services">Send din første forespørsel</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};