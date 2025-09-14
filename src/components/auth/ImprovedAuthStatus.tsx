import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, LogOut, LogIn, Loader2, User, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ImprovedAuthStatus: React.FC = () => {
  const { isAuthenticated, user, profile, isLoading, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
        title: 'Sjekker innloggingsstatus...',
        description: 'Vennligst vent',
        color: 'text-blue-600'
      };
    }

    if (isAuthenticated && user && profile) {
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        title: `Innlogget som ${profile.full_name || user.email}`,
        description: `Rolle: ${role || 'Ikke satt'}`,
        color: 'text-green-600'
      };
    }

    if (isAuthenticated && user && !profile) {
      return {
        icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
        title: 'Profil ikke funnet',
        description: `Innlogget som ${user.email}, men profil mangler`,
        color: 'text-yellow-600'
      };
    }

    return {
      icon: <User className="h-5 w-5 text-gray-500" />,
      title: 'Ikke innlogget',
      description: 'Logg inn for å få tilgang til alle funksjoner',
      color: 'text-gray-600'
    };
  };

  const status = getStatusInfo();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          {status.icon}
          <div className="flex-1">
            <h3 className={`font-medium ${status.color}`}>
              {status.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {status.description}
            </p>
          </div>
        </div>

        {/* User Details */}
        {isAuthenticated && user && (
          <div className="space-y-2 mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">E-post:</span>
              <span className="text-sm">{user.email}</span>
            </div>
            {profile?.full_name && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Navn:</span>
                <span className="text-sm">{profile.full_name}</span>
              </div>
            )}
            {role && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rolle:</span>
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {role}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bruker-ID:</span>
              <span className="text-xs font-mono text-muted-foreground">
                {user.id.substring(0, 8)}...
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
                className="flex-1"
                disabled={isLoggingOut}
              >
                <User className="h-4 w-4 mr-2" />
                Min Profil
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                {isLoggingOut ? 'Logger ut...' : 'Logg ut'}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
              disabled={isLoading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Logg inn
            </Button>
          )}
        </div>

        {/* Debug Info in Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <strong>Debug:</strong>
            <pre className="mt-1 whitespace-pre-wrap">
              {JSON.stringify({
                isAuthenticated,
                hasUser: !!user,
                hasProfile: !!profile,
                role,
                isLoading
              }, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};