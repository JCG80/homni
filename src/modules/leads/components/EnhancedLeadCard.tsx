import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  MessageSquare, 
  Clock, 
  MapPin, 
  User,
  Building2,
  Star,
  TrendingUp,
  Gavel
} from 'lucide-react';
import { Lead, getStatusDisplay } from '@/types/leads-canonical';
import { LeadQualityScore } from './LeadQualityScore';
import { LeadContactInfo } from './LeadContactInfo';
import { ControlledMessageThread } from '@/modules/messaging/components/ControlledMessageThread';
import { CompetitiveBidding } from '@/modules/marketplace/components/CompetitiveBidding';
import { useContactAccess } from '@/hooks/useContactAccess';
import { useLeadScoring } from '@/hooks/useLeadScoring';
import { useAuth } from '@/modules/auth/hooks';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

interface EnhancedLeadCardProps {
  lead: Lead;
  companyId?: string;
  showActions?: boolean;
  showScoring?: boolean;
  showBidding?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export const EnhancedLeadCard: React.FC<EnhancedLeadCardProps> = ({
  lead,
  companyId,
  showActions = true,
  showScoring = true,
  showBidding = false,
  expanded = false,
  onToggleExpand
}) => {
  const { user } = useAuth();
  const [showMessages, setShowMessages] = useState(false);
  const { canSeeContactInfo, hasAnyAccess } = useContactAccess(lead.id, companyId);
  const { pricing, getScoreGrade, getScoreColor } = useLeadScoring(lead.id);

  const isCompanyUser = user && companyId;
  const canSendMessages = canSeeContactInfo();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">
              {lead.title}
            </CardTitle>
            
            <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-2">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{lead.category}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(lead.created_at), {
                    addSuffix: true,
                    locale: nb
                  })}
                </span>
              </div>
              {lead.company_id && (
                <div className="flex items-center space-x-1">
                  <Building2 className="h-3 w-3" />
                  <span>Tildelt</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {getStatusDisplay(lead.status)}
              </Badge>
              
              {pricing && (
                <Badge 
                  variant="outline"
                  className="text-xs"
                >
                  <Star className="h-3 w-3 mr-1" />
                  {getScoreGrade(pricing.score)} - {(pricing.base_price_cents / 100).toLocaleString('nb-NO')} kr
                </Badge>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleExpand}
              >
                <Eye className="h-4 w-4 mr-1" />
                {expanded ? 'Lukk' : 'Vis detaljer'}
              </Button>
              
              {isCompanyUser && hasAnyAccess() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMessages(!showMessages)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Meldinger
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lead Description */}
        <p className="text-sm text-muted-foreground">
          {lead.description}
        </p>

        {/* Customer Info (basic always visible) */}
        {lead.customer_name && (
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Kunde: {lead.customer_name}</span>
          </div>
        )}

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-6 border-t pt-4">
            {/* Quality Scoring */}
            {showScoring && (
              <LeadQualityScore 
                leadId={lead.id} 
                compact={!expanded}
                showRecalculate={user?.id === lead.submitted_by}
              />
            )}

            {/* Contact Information */}
            <LeadContactInfo 
              lead={lead}
              companyId={companyId}
              onMessageClick={() => setShowMessages(true)}
            />

            {/* Competitive Bidding */}
            {showBidding && pricing && (
              <CompetitiveBidding
                leadId={lead.id}
                leadTitle={lead.title}
                companyId={companyId}
                initialPrice={pricing.base_price_cents}
                canPlaceBids={!!isCompanyUser}
              />
            )}

            {/* Message Thread */}
            {showMessages && (
              <ControlledMessageThread
                leadId={lead.id}
                leadTitle={lead.title}
                canSendMessages={canSendMessages}
              />
            )}
          </div>
        )}

        {/* Compact Quality Score */}
        {!expanded && showScoring && (
          <LeadQualityScore 
            leadId={lead.id} 
            compact={true}
          />
        )}

        {/* Action Buttons */}
        {showActions && !expanded && (
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleExpand}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Vis detaljer
            </Button>
            
            {showBidding && isCompanyUser && (
              <Button
                variant="default"
                size="sm"
                onClick={onToggleExpand}
                className="flex-1"
              >
                <Gavel className="h-4 w-4 mr-2" />
                Legg inn bud
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};