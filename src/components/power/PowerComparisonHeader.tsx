
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const PowerComparisonHeader: React.FC = () => {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">Homni</Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="outline">Logg inn</Button>
          </Link>
          <Link to="/register">
            <Button>Registrer</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
