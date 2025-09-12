import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, User, Phone, Mail, Home, Calendar, Info, Tag, Clock, DollarSign } from 'lucide-react';
import { LeadWizardData } from '../SmartLeadWizard';

interface ReviewStepProps {
  data: LeadWizardData;
  onChange: (updates: Partial<LeadWizardData>) => void;
}

const URGENCY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const URGENCY_LABELS = {
  low: 'Lav prioritet',
  medium: 'Middels prioritet', 
  high: 'Høy prioritet'
};

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onChange }) => {
  const completionScore = Math.min(100, Math.max(20, 
    (data.title ? 20 : 0) + 
    (data.description.length > 50 ? 25 : data.description.length > 20 ? 15 : 0) + 
    (data.service_type ? 20 : 0) + 
    (data.property_address ? 15 : 0) + 
    (data.project_timeline ? 10 : 0) + 
    (data.additional_info ? 10 : 0)
  ));

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Se over din forespørsel</h3>
        <p className="text-muted-foreground">
          Kontroller at alt er riktig før du sender inn forespørselen
        </p>
      </div>

      {/* Quality Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Forespørsel kvalitet</p>
              <p className="text-sm text-muted-foreground">
                {completionScore >= 80 ? 'Utmerket! Du vil få gode tilbud.' :
                 completionScore >= 60 ? 'Bra! Vurder å legge til mer info.' :
                 'Grunnleggende. Mer info gir bedre tilbud.'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{completionScore}%</div>
              <p className="text-xs text-muted-foreground">komplett</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Grunninfo
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onChange({ /* go to step 1 */ })}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium">{data.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{data.category}</Badge>
            <Badge className={URGENCY_COLORS[data.urgency]}>
              <Clock className="h-3 w-3 mr-1" />
              {URGENCY_LABELS[data.urgency]}
            </Badge>
            {data.budget_range && (
              <Badge variant="outline">
                <DollarSign className="h-3 w-3 mr-1" />
                {data.budget_range}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Kontaktinfo
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onChange({ /* go to step 2 */ })}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{data.customer_name}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{data.customer_email}</span>
            </div>
            {data.customer_phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{data.customer_phone}</span>
              </div>
            )}
            <div className="flex items-center">
              <span className="text-sm">
                Foretrekker kontakt via <strong>{data.preferred_contact}</strong>
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1" />
            Best tid: {data.best_time}
          </div>
        </CardContent>
      </Card>

      {/* Service Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Prosjektdetaljer
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onChange({ /* go to step 3 */ })}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium">Tjeneste</p>
            <p className="text-sm text-muted-foreground">{data.service_type}</p>
          </div>
          
          {data.property_type && (
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{data.property_type}</span>
            </div>
          )}
          
          {data.property_address && (
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{data.property_address}</span>
            </div>
          )}
          
          {data.project_timeline && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{data.project_timeline}</span>
            </div>
          )}
          
          {data.additional_info && (
            <div>
              <p className="font-medium">Tilleggsinfo</p>
              <p className="text-sm text-muted-foreground">{data.additional_info}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What happens next */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Hva skjer nå?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
            <div>
              <p className="font-medium">Vi matcher din forespørsel</p>
              <p className="text-sm text-muted-foreground">Vårt system finner kvalifiserte leverandører i ditt område</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
            <div>
              <p className="font-medium">Du får tilbud</p>
              <p className="text-sm text-muted-foreground">Leverandører kontakter deg med tilpassede tilbud</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
            <div>
              <p className="font-medium">Du velger</p>
              <p className="text-sm text-muted-foreground">Sammenlign tilbud og velg den leverandøren som passer best</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};