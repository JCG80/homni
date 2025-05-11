
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export const PowerComparisonHeader = () => {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">HomniPower</span>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/strom" className="text-primary font-medium">Strømavtaler</Link>
            <Link to="/forsikring" className="text-muted-foreground hover:text-foreground transition-colors">Forsikring</Link>
            <Link to="/companies" className="text-muted-foreground hover:text-foreground transition-colors">Leverandører</Link>
          </nav>
          
          <div className="flex space-x-4">
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex">
              Logg inn
            </Link>
            <Link to="/register" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              Registrer deg
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
