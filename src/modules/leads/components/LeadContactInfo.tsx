
import React from 'react';
import { Lead } from '@/types/leads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, User, Building } from 'lucide-react';

interface LeadContactInfoProps {
  lead: Lead;
}

export const LeadContactInfo: React.FC<LeadContactInfoProps> = ({ lead }) => {
  // This is a placeholder component for contact information
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontaktinformasjon</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Kontaktperson: {lead.metadata?.contact_name || 'Ikke angitt'}</span>
        </div>
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>E-post: {lead.metadata?.email || 'Ikke angitt'}</span>
        </div>
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Telefon: {lead.metadata?.phone || 'Ikke angitt'}</span>
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
