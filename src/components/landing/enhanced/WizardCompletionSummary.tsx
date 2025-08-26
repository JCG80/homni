import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building, 
  Phone, 
  Mail,
  ExternalLink
} from 'lucide-react';

interface WizardCompletionSummaryProps {
  formData: {
    role: 'private' | 'business';
    service: string;
    postalCode: string;
    propertyType: string;
    name: string;
    email: string;
    phone: string;
    companyName?: string;
  };
  leadId?: string;
  onNewRequest: () => void;
  onViewDashboard?: () => void;
}

const serviceNames: Record<string, string> = {
  handverkere: 'Håndverkere',
  energi: 'Energiløsninger', 
  okonomi: 'Boligøkonomi',
  tilgjengelighet: 'Tilgjengelighet',
  byggtjenester: 'Byggtjenester',
  vedlikehold: 'Vedlikehold'
};

export const WizardCompletionSummary = ({ 
  formData, 
  leadId, 
  onNewRequest, 
  onViewDashboard 
}: WizardCompletionSummaryProps) => {
  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Forespørsel sendt!</h2>
        <p className="text-muted-foreground">
          Vi matcher deg nå med de beste leverandørene
        </p>
        {leadId && (
          <Badge variant="outline" className="mt-2">
            Referanse: {leadId.slice(-8).toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Request Summary */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Building className="w-4 h-4" />
          Din forespørsel
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Tjeneste:</span>
            <p className="font-medium">{serviceNames[formData.service] || formData.service}</p>
          </div>
          
          <div>
            <span className="text-muted-foreground">Type:</span>
            <p className="font-medium">{formData.role === 'business' ? 'Bedrift' : 'Privat'}</p>
          </div>
          
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Område:
            </span>
            <p className="font-medium">{formData.postalCode}</p>
          </div>
          
          <div>
            <span className="text-muted-foreground">Eiendom:</span>
            <p className="font-medium">{formData.propertyType}</p>
          </div>
          
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              E-post:
            </span>
            <p className="font-medium">{formData.email}</p>
          </div>
          
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Telefon:
            </span>
            <p className="font-medium">{formData.phone}</p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Hva skjer nå?
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-sm">Forespørsel mottatt</p>
              <p className="text-xs text-muted-foreground">Akkurat nå</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-sm">Matching pågår</p>
              <p className="text-xs text-muted-foreground">De neste 2-4 timene</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-sm">Leverandører kontakter deg</p>
              <p className="text-xs text-muted-foreground">Innen 24 timer</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
            <div>
              <p className="font-medium text-sm">Få tilbud og sammenlign</p>
              <p className="text-xs text-muted-foreground">1-3 dager</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onNewRequest} variant="outline" className="flex-1">
          Send ny forespørsel
        </Button>
        
        {onViewDashboard && (
          <Button onClick={onViewDashboard} className="flex-1">
            Se mine forespørsler
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Help Section */}
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-center text-muted-foreground">
          Spørsmål? Kontakt oss på <strong>hei@homni.no</strong> eller <strong>22 12 34 56</strong>
        </p>
      </Card>
    </div>
  );
};