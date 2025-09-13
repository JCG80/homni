import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Settings, Bell, Mail, Heart, Home, MessageSquare, FileText } from 'lucide-react';
import { ProfileInfo } from '@/modules/auth/components/ProfileInfo';
import { ProfileCard } from '@/components/account/ProfileCard';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PageLayout } from '@/components/layout/PageLayout';

export const ConsolidatedAccountPage = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const userName = profile?.full_name || 'bruker';

  return (
    <PageLayout 
      title={`Hei, ${userName}!`}
      description="Administrer kontoen din, innstillinger og få oversikt over aktiviteten din."
      showBreadcrumbs={true}
    >
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Oversikt</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Innstillinger</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 hidden lg:flex">
            <Bell className="h-4 w-4" />
            Varsler
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileCard />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Hurtighandlinger
              </CardTitle>
              <CardDescription>
                Administrer kontoen din og få oversikt over aktiviteten din
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/leads">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Forespørsler
                  </Button>
                </Link>
                <Link to="/properties">
                  <Button variant="outline" className="w-full justify-start">
                    <Home className="h-4 w-4 mr-2" />
                    Mine eiendommer
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Min profil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Signup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Motta våre beste sparetips
              </CardTitle>
              <CardDescription>
                Hold deg oppdatert på markedet og få eksklusive tilbud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  className="flex-1"
                  placeholder="Din e-postadresse"
                  type="email"
                />
                <Button>
                  <Bell className="h-4 w-4 mr-2" /> 
                  Motta tips
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Partners */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Våre samarbeidspartnere
              </CardTitle>
              <CardDescription>
                Utforsk tilbud fra våre pålitelige partnere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link to="/partners/mortgage" className="flex items-center gap-1 text-primary hover:underline">
                  <Home className="h-4 w-4" /> Boliglånspartner
                </Link>
                <Link to="/partners/insurance" className="flex items-center gap-1 text-primary hover:underline">
                  <Bell className="h-4 w-4" /> Forsikringspartner
                </Link>
                <Link to="/partners/energy" className="flex items-center gap-1 text-primary hover:underline">
                  <Mail className="h-4 w-4" /> Energi-partner
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <ProfileInfo />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kontoinnstillinger</CardTitle>
              <CardDescription>
                Administrer din konto og personlige innstillinger
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Generelle innstillinger
                </Button>
                <Button variant="outline" className="justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Varslingsinnstillinger  
                </Button>
                <Button variant="outline" className="justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Personvern
                </Button>
                <Button variant="outline" className="justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  E-post preferanser
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Varslingsinnstillinger</CardTitle>
              <CardDescription>
                Kontroller hvilke varsler du vil motta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">E-postvarsler</p>
                    <p className="text-sm text-muted-foreground">Motta viktige oppdateringer på e-post</p>
                  </div>
                  <Button variant="outline" size="sm">Konfigurer</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push-varsler</p>
                    <p className="text-sm text-muted-foreground">Øyeblikkelige varsler i nettleseren</p>
                  </div>
                  <Button variant="outline" size="sm">Konfigurer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};