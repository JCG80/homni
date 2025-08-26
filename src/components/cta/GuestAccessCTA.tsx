import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, User } from 'lucide-react';

interface GuestAccessCTAProps {
  title?: string;
  description?: string;
  linkTo?: string;
  buttonText?: string;
  className?: string;
}

export const GuestAccessCTA = ({
  title = "Fortsett som gjest",
  description = "Få tilbud uten å registrere deg. Du kan opprette konto senere.",
  linkTo = "/#wizard",
  buttonText = "Start sammenligning",
  className = ""
}: GuestAccessCTAProps) => {
  return (
    <div className={`bg-muted/50 rounded-lg p-6 text-center ${className}`}>
      <User className="h-8 w-8 text-primary mx-auto mb-3" />
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      <Button 
        asChild 
        variant="outline" 
        className="w-full"
      >
        <Link to={linkTo}>
          {buttonText} <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
};