
import React from 'react';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface AccountSectionProps {
  onLogout: () => Promise<void>;
}

export const AccountSection: React.FC<AccountSectionProps> = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await onLogout();
      toast({
        title: "Logget ut",
        description: "Du er nå logget ut av systemet",
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Feil ved utlogging",
        description: "Det oppstod en feil ved utlogging. Prøv igjen.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Konto
      </h2>
      <div className="space-y-1">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <LogOut size={16} />
          <span>Logg ut</span>
        </button>
      </div>
    </div>
  );
};
