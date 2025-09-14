
import { Button } from '@/components/ui/button';
import { Key, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';

interface CompanyActionsProps {
  email?: string;
}

export function CompanyActions({ email }: CompanyActionsProps) {
  const handleResetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Tilbakestilling av passord',
        description: 'E-post for tilbakestilling av passord er sendt.',
      });
    } catch (error) {
      logger.error('Failed to send password reset:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke sende e-post for tilbakestilling av passord.',
        variant: 'destructive',
      });
    }
  };
  
  const handleSendLoginDetails = async (email: string) => {
    try {
      // In a real implementation, you would send login details via email
      // For now, we'll just show a toast notification
      
      toast({
        title: 'Påloggingsdetaljer sendt',
        description: `En e-post med påloggingsdetaljer er sendt til ${email}.`,
      });
    } catch (error) {
      logger.error('Failed to send login details:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke sende e-post med påloggingsdetaljer.',
        variant: 'destructive',
      });
    }
  };

  if (!email) return null;

  return (
    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleResetPassword(email)}
        title="Tilbakestill passord"
      >
        <Key className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleSendLoginDetails(email)}
        title="Send påloggingsdetaljer"
      >
        <Mail className="h-4 w-4" />
      </Button>
    </div>
  );
}
