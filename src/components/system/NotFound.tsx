import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <div className="text-muted-foreground text-6xl mb-4">404</div>
        <h1 className="text-3xl font-bold text-foreground">Siden finnes ikke</h1>
        <p className="text-muted-foreground">
          Beklager, vi finner ikke siden du leter etter.
        </p>
        <Link 
          to="/" 
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Til forsiden
        </Link>
      </div>
    </div>
  );
}