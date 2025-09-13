import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Sparkles, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomeHeaderProps {
  userName: string;
  isNewUser?: boolean;
}

/**
 * Personalized welcome header with context-aware messaging
 */
export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ 
  userName, 
  isNewUser = false 
}) => {
  const navigate = useNavigate();

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'God morgen';
    if (hour < 18) return 'God dag';
    return 'God kveld';
  };

  const getWelcomeMessage = () => {
    if (isNewUser) {
      return {
        greeting: `Velkommen til Homni, ${userName}!`,
        subtitle: 'La oss hjelpe deg komme i gang med dine første forespørsler.',
        badge: { text: 'Ny bruker', variant: 'default' as const, icon: <Crown className="w-3 h-3" /> }
      };
    }

    return {
      greeting: `${getTimeBasedGreeting()}, ${userName}`,
      subtitle: 'Her er din personlige oversikt over forespørsler og aktivitet.',
      badge: null
    };
  };

  const welcome = getWelcomeMessage();

  return (
    <div className="space-y-4">
      {/* Main Welcome */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {welcome.greeting}
            </h1>
            {welcome.badge && (
              <Badge variant={welcome.badge.variant} className="flex items-center gap-1">
                {welcome.badge.icon}
                {welcome.badge.text}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {welcome.subtitle}
          </p>
        </div>

        {/* Primary CTA */}
        <Button 
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          onClick={() => navigate('/')}
        >
          <Plus className="w-4 h-4" />
          Ny forespørsel
        </Button>
      </div>

      {/* Success Indicator for New Users */}
      {isNewUser && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Din konto er opprettet! Du kan nå sende forespørsler til våre partnere.
          </span>
        </div>
      )}
    </div>
  );
};