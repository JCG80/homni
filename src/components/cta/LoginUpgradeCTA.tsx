import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowRight } from 'lucide-react';

interface LoginUpgradeCTAProps {
  title?: string;
  description?: string;
  className?: string;
}

export const LoginUpgradeCTA = ({
  title = "Få full tilgang til alle funksjoner",
  description = "Logg inn eller opprett en konto for å få tilgang til avanserte verktøy og personlige anbefalinger.",
  className = ""
}: LoginUpgradeCTAProps) => {
  return (
    <div className={`bg-primary/5 border border-primary/20 rounded-lg p-6 text-center ${className}`}>
      <UserPlus className="h-8 w-8 text-primary mx-auto mb-3" />
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link to="/login">
            Logg inn <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link to="/register">
            Registrer deg
          </Link>
        </Button>
      </div>
    </div>
  );
};