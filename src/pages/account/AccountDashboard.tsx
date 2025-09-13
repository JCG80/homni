import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  FileText,
  Edit3,
  Camera,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { useI18n } from '@/hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from '@/components/account/ProfileCard';
import { ContextualHelp } from '@/components/guidance/ContextualHelp';
import { GuidedTour } from '@/components/guidance/GuidedTour';

export const AccountDashboard = () => {
  const { t } = useI18n();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const profileCompleteness = calculateProfileCompleteness();

  function calculateProfileCompleteness(): number {
    if (!profile || !user) return 0;
    
    let completedFields = 0;
    const totalFields = 6; // Reduced from 8 since some fields don't exist
    
    if (profile.full_name) completedFields++;
    if (user.email) completedFields++;
    if (profile.phone) completedFields++;
    if (profile.address) completedFields++;
    if (profile.metadata?.preferences) completedFields++;
    if (profile.metadata?.interests) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  }

  const getCompletionColor = () => {
    if (profileCompleteness >= 80) return 'bg-green-500';
    if (profileCompleteness >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const quickActions = [
    {
      title: 'Rediger profil',
      description: 'Oppdater personlige opplysninger',
      icon: Edit3,
      href: '/account/profile/edit',
      badge: profileCompleteness < 80 ? 'Anbefalt' : null
    },
    {
      title: 'Varslinginnstillinger',
      description: 'Administrer e-post og push-varsler',
      icon: Bell,
      href: '/account/notifications'
    },
    {
      title: 'Sikkerhet',
      description: 'Passord og tofa-innstillinger',
      icon: Shield,
      href: '/account/security'
    },
    {
      title: 'Fakturering',
      description: 'Betalingsmetoder og fakturaer',
      icon: CreditCard,
      href: '/account/billing',
      condition: () => profile?.role === 'company'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      title: 'Profil oppdatert',
      description: 'Du oppdaterte din profil informasjon',
      timestamp: '2 timer siden',
      type: 'profile'
    },
    {
      id: '2',
      title: 'Ny forespørsel sendt',
      description: 'Forespørsel om «Takrengjøring» sendt til leverandører',
      timestamp: '1 dag siden',
      type: 'request'
    },
    {
      id: '3',
      title: 'Tilbud mottatt',
      description: 'Du har mottatt 2 nye tilbud',
      timestamp: '2 dager siden',
      type: 'offer'
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Min konto</h1>
        <p className="text-muted-foreground">
          Administrer profil, innstillinger og kontoopplysninger
        </p>
      </div>

      {/* Profile completion banner */}
      {profileCompleteness < 80 && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Fullfør profilen din ({profileCompleteness}%)
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-200">
                    En komplett profil hjelper leverandører gi deg bedre tilbud
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/account/profile/edit')}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Fullfør profil
              </Button>
            </div>
            <div className="mt-3">
              <div className="w-full bg-amber-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getCompletionColor()} transition-all duration-300`}
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Innstillinger</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Sikkerhet</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Fakturering</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6" data-tour="basic-info">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profil informasjon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileCard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6" data-tour="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Generelle innstillinger
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Språk</p>
                        <p className="text-sm text-muted-foreground">Velg ditt foretrukne språk</p>
                      </div>
                      <Badge variant="secondary">Norsk</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Tidssone</p>
                        <p className="text-sm text-muted-foreground">Oslo, Norge (CET)</p>
                      </div>
                      <Button variant="outline" size="sm">Endre</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Sikkerhet og tilgang
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Passord</p>
                        <p className="text-sm text-muted-foreground">Sist endret for 3 måneder siden</p>
                      </div>
                      <Button variant="outline" size="sm">Endre passord</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Tofaktor-autentisering</p>
                        <p className="text-sm text-muted-foreground">Ekstra sikkerhet for din konto</p>
                      </div>
                      <Badge variant="secondary">Ikke aktivert</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Fakturering og betaling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {profile?.role === 'company' 
                        ? 'Ingen betalingsmetoder registrert ennå'
                        : 'Faktureringsdetaljer er kun tilgjengelig for bedriftskontoer'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hurtighandlinger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions
                .filter(action => !action.condition || action.condition())
                .map((action) => (
                <Button
                  key={action.title}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => navigate(action.href)}
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="w-4 h-4" />
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{action.title}</span>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle>Siste aktivitet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border-l-2 border-muted pl-3 space-y-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contextual help and guided tour */}
      <ContextualHelp />
      <GuidedTour autoStart={true} tourId="profile-setup-tour" />
    </div>
  );
};