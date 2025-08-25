
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Home, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth/hooks';

export const PowerComparisonHeader = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <header className="bg-white border-b sticky top-0 z-40 w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">HomniPower</span>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Tilbake til Homni</span>
            </Link>
            <Link to="/strom" className="text-primary font-medium">Strømavtaler</Link>
            <Link to="/forsikring" className="text-muted-foreground hover:text-foreground transition-colors">Forsikring</Link>
          </nav>
          
          <div className="flex space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex">
                  Logg inn
                </Link>
                <Button asChild>
                  <Link to="/register" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    Registrer deg
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" className="flex items-center gap-1">
                <Link to="/dashboard">
                  <Shield className="h-4 w-4" />
                  <span>Min side</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
