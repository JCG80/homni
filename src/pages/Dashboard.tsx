
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, Home, FileText, MessageSquare } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gradient">Dashboard</h1>
      
      <div className="warm-card p-8 mb-8">
        <p className="text-xl mb-2">Velkommen til Homni dashbordet!</p>
        {user && (
          <p className="text-lg text-muted-foreground">Logget inn som: <span className="font-medium">{user.email}</span></p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/my-account" className="group">
          <div className="warm-card p-6 h-full hover:shadow-lg hover-lift group-hover:border-primary/20 border border-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Min side</h3>
            </div>
            <p className="text-muted-foreground">Administrer din profil og se dine tilbud, omtaler og meldinger.</p>
          </div>
        </Link>
        
        <Link to="/dashboard" className="group">
          <div className="warm-card p-6 h-full hover:shadow-lg hover-lift group-hover:border-primary/20 border border-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Hjem</h3>
            </div>
            <p className="text-muted-foreground">Gå til hjemmesiden og utforsk våre tjenester.</p>
          </div>
        </Link>
        
        <Link to="/lead-capture" className="group">
          <div className="warm-card p-6 h-full hover:shadow-lg hover-lift group-hover:border-primary/20 border border-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Leads</h3>
            </div>
            <p className="text-muted-foreground">Administrer og se dine leads og henvendelser.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
