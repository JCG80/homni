import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { UserProfileCard } from '@/modules/auth/components/UserProfileCard';
import { EnhancedPropertiesWidget } from '@/modules/property/components/EnhancedPropertiesWidget';
import { MyRequestsWidget } from '@/modules/leads/components/MyRequestsWidget';
import { SmartQuickActions } from '@/components/dashboard/SmartQuickActions';
import { EnhancedProfileInfo } from '@/modules/auth/components/EnhancedProfileInfo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Home, MessageSquare, User, Settings } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function UserDashboard() {
  const { user, profile, isLoading, isAuthenticated } = useAuth();

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only show to user role
  if (!isLoading && profile?.role !== 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Min Dashboard - Homni</title>
        <meta name="description" content="Administrer dine eiendommer og forespørsler på ett sted" />
        <meta name="keywords" content="dashboard, eiendommer, forespørsler, privat bruker" />
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Velkommen, {profile?.full_name || user?.email}
            </h1>
            <p className="text-muted-foreground">
              Administrer dine eiendommer og forespørsler på ett sted
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = '/profile'}
            >
              <Settings className="h-4 w-4" />
              Innstillinger
            </Button>
          </div>
        </div>

        {/* Smart Quick Actions */}
        <SmartQuickActions />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* My Properties */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Mine Eiendommer
                </CardTitle>
                <Button 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => window.location.href = '/properties'}
                >
                  <Plus className="h-4 w-4" />
                  Legg til eiendom
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <EnhancedPropertiesWidget />
              </CardContent>
            </Card>

            {/* My Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mine Forespørsler
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.href = '/leads'}
                >
                  Se alle
                </Button>
              </CardHeader>
              <CardContent>
                <MyRequestsWidget />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile & Sidebar */}
          <div className="space-y-6">
            
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Min Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <EnhancedProfileInfo />
              </CardContent>
            </Card>

            {/* Recent Activity - Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Siste aktivitet</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground py-8">
                Ingen aktivitet ennå
              </CardContent>
            </Card>

            {/* Tips & Help - Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Tips & Hjelp</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground py-8">
                Kom i gang med å legge til din første eiendom
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}