
import React from 'react';
import { Link } from 'react-router-dom';

export const PowerComparisonFooter: React.FC = () => {
  return (
    <footer className="bg-card py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Homni AS. Alle rettigheter reservert.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/personvern" className="text-muted-foreground hover:text-foreground text-sm">
              Personvern
            </Link>
            <Link to="/vilkår" className="text-muted-foreground hover:text-foreground text-sm">
              Vilkår
            </Link>
            <Link to="/kontakt" className="text-muted-foreground hover:text-foreground text-sm">
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
