import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/modules/auth/hooks';
import { User, Mail, Phone, MapPin, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Min Profil - Homni</title>
        <meta name="description" content="Administrer din profil og innstillinger på Homni" />
      </Helmet>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Min Profil</h1>
            <p className="text-muted-foreground">
              Administrer din personlige informasjon og innstillinger
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personlig informasjon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Fornavn</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Skriv inn fornavn" 
                      defaultValue={profile?.full_name?.split(' ')[0] || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Etternavn</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Skriv inn etternavn"
                      defaultValue={profile?.full_name?.split(' ').slice(1).join(' ') || ''}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">E-post</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    E-postadressen kan ikke endres
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefonnummer</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+47 123 45 678"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input 
                    id="address" 
                    placeholder="Gate/vei, postnummer, sted"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifikasjoner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">E-post notifikasjoner</div>
                    <div className="text-sm text-muted-foreground">
                      Motta oppdateringer om dine forespørsler på e-post
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Aktivert
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS notifikasjoner</div>
                    <div className="text-sm text-muted-foreground">
                      Motta viktige oppdateringer på SMS
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Deaktivert
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Lagre endringer
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Kontoinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">E-post</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Kontorolle</div>
                    <div className="text-xs text-muted-foreground">Privatbruker</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hurtighandlinger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/properties')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Administrer eiendommer
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/leads')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Mine forespørsler
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;