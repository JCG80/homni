
import React from 'react';
import { Lead } from '@/types/leads-canonical';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, User, Building, Lock, MessageSquare } from 'lucide-react';
import { useContactAccess } from '@/hooks/useContactAccess';
import { useAuth } from '@/modules/auth/hooks';

interface LeadContactInfoProps {
  lead: Lead;
  companyId?: string;
  onMessageClick?: () => void;
}

export const LeadContactInfo: React.FC<LeadContactInfoProps> = ({ lead, companyId, onMessageClick }) => {
  const { user } = useAuth();
  const { 
    accessLevel, 
    canSeeContactInfo, 
    canSeeBasicInfo, 
    maskContactInfo 
  } = useContactAccess(lead.id, companyId);

  const getMetadataValue = (key: string): string => {
    if (!lead.metadata || typeof lead.metadata !== 'object') return 'Ikke angitt';
    const value = lead.metadata[key];
    return typeof value === 'string' ? value : 'Ikke angitt';
  };

  const getContactValue = (key: string, type: 'email' | 'phone' | 'name' = 'email'): string => {
    // First try direct lead fields (newer schema)
    let value = '';
    if (key === 'contact_name' && lead.customer_name) {
      value = lead.customer_name;
    } else if (key === 'email' && lead.customer_email) {
      value = lead.customer_email;
    } else if (key === 'phone' && lead.customer_phone) {
      value = lead.customer_phone;
    } else {
      // Fallback to metadata
      value = getMetadataValue(key);
    }

    if (value === 'Ikke angitt') return value;
    
    return maskContactInfo(value, type);
  };

  const isCompanyUser = user && companyId && user.id === companyId;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Kontaktinformasjon</CardTitle>
        {!canSeeContactInfo() && isCompanyUser && (
          <div className="flex items-center text-muted-foreground text-sm">
            <Lock className="h-4 w-4 mr-1" />
            Krever kjøp
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Kontaktperson: {getContactValue('contact_name', 'name')}</span>
        </div>
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>E-post: {getContactValue('email', 'email')}</span>
        </div>
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Telefon: {getContactValue('phone', 'phone')}</span>
        </div>

        {/* Communication Controls */}
        {canSeeBasicInfo() && onMessageClick && (
          <div className="pt-4 border-t">
            <Button
              onClick={onMessageClick}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {canSeeContactInfo() ? 'Send melding' : 'Send forespørsel'}
            </Button>
          </div>
        )}

        {/* Access Level Info */}
        {!canSeeContactInfo() && canSeeBasicInfo() && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <Lock className="h-4 w-4 inline mr-1" />
              Kjøp denne leaden for å få tilgang til full kontaktinformasjon
            </p>
          </div>
        )}

        {accessLevel === 'none' && companyId && (
          <div className="p-3 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive">
              Du har ikke tilgang til denne leaden. Kontakt administrator for mer informasjon.
            </p>
          </div>
        )}

        {lead.company_id && (
          <div className="flex items-center text-muted-foreground text-sm">
            <Building className="h-4 w-4 mr-2" />
            <span>Tildelt bedrift</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
