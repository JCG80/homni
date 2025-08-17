
import React from 'react';
import { Lead } from '@/types/leads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, User, Building } from 'lucide-react';

interface LeadContactInfoProps {
  lead: Lead;
}

export const LeadContactInfo: React.FC<LeadContactInfoProps> = ({ lead }) => {
  const getMetadataValue = (key: string): string => {
    if (!lead.metadata || typeof lead.metadata !== 'object') return 'Ikke angitt';
    const value = lead.metadata[key];
    return typeof value === 'string' ? value : 'Ikke angitt';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontaktinformasjon</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Kontaktperson: {getMetadataValue('contact_name')}</span>
        </div>
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>E-post: {getMetadataValue('email')}</span>
        </div>
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Telefon: {getMetadataValue('phone')}</span>
        </div>
        {lead.company_id && (
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Bedrift ID: {lead.company_id}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
