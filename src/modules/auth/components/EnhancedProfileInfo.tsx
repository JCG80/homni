import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { updateProfile } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useProperties } from '@/modules/property/hooks/useProperties';
import { logger } from '@/utils/logger';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Edit3, 
  Home, 
  Calendar, 
  TrendingUp,
  Shield,
  Star,
  CheckCircle2
} from 'lucide-react';

export const EnhancedProfileInfo: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { properties } = useProperties();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    region: profile?.region || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        id: user.id,
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        region: formData.region,
      });
      
      await refreshProfile();
      toast({
        title: "Profil oppdatert",
        description: "Din brukerprofil ble oppdatert.",
      });
      setIsEditing(false);
    } catch (error) {
      logger.error('Error updating profile', { error });
      toast({
        title: "Feil ved oppdatering",
        description: "Kunne ikke oppdatere brukerprofil. Vennligst prøv igjen.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getProfileCompleteness = () => {
    const fields = [
      profile?.full_name,
      profile?.phone,
      profile?.address,
      profile?.region,
      user?.email
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const getProfileLevel = () => {
    const completeness = getProfileCompleteness();
    const propertyCount = properties?.length || 0;
    
    if (completeness >= 80 && propertyCount >= 3) return { level: 'Expert', color: 'bg-gradient-to-r from-purple-500 to-pink-500' };
    if (completeness >= 60 && propertyCount >= 1) return { level: 'Advanced', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
    if (completeness >= 40) return { level: 'Intermediate', color: 'bg-gradient-to-r from-green-500 to-emerald-500' };
    return { level: 'Beginner', color: 'bg-gradient-to-r from-orange-500 to-yellow-500' };
  };

  if (!user || !profile) {
    return null;
  }

  const profileLevel = getProfileLevel();
  const completeness = getProfileCompleteness();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 opacity-10 ${profileLevel.color}`} />
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} />
                <AvatarFallback className="text-xl font-bold">{getInitials(profile.full_name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{profile.full_name || 'Anonym bruker'}</h2>
                  <Badge variant="secondary" className={`${profileLevel.color} text-white border-0`}>
                    {profileLevel.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {user.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </div>
                  )}
                  {profile.region && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.region}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Rediger
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="details">Detaljer</TabsTrigger>
          <TabsTrigger value="activity">Aktivitet</TabsTrigger>
          <TabsTrigger value="preferences">Innstillinger</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Profile Completeness */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Profil fullført
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Fremgang</span>
                  <span className="font-medium">{completeness}%</span>
                </div>
                <Progress value={completeness} className="h-2" />
                {completeness < 100 && (
                  <p className="text-xs text-muted-foreground">
                    Fyll ut manglende felt for å fullføre profilen
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Property Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Mine eiendommer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{properties?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {properties?.length === 0 ? 'Ingen eiendommer registrert' : 
                   properties?.length === 1 ? 'eiendom registrert' : 
                   'eiendommer registrert'}
                </p>
              </CardContent>
            </Card>

            {/* Membership Duration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Medlem siden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString('no-NO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Ukjent'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registrert bruker
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Rediger profil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Fullt navn</Label>
                      <Input 
                        id="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange}
                        placeholder="Ditt fulle navn"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input 
                        id="phone" 
                        value={formData.phone} 
                        onChange={handleChange}
                        placeholder="Ditt telefonnummer"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Adresse</Label>
                      <Input 
                        id="address" 
                        value={formData.address} 
                        onChange={handleChange}
                        placeholder="Din adresse"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="region">Region</Label>
                      <Input 
                        id="region" 
                        value={formData.region} 
                        onChange={handleChange}
                        placeholder="Din region"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          fullName: profile.full_name || '',
                          phone: profile.phone || '',
                          address: profile.address || '',
                          region: profile.region || '',
                        });
                      }}
                      disabled={isSubmitting}
                    >
                      Avbryt
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Lagrer...' : 'Lagre endringer'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Profildetaljer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fullt navn</Label>
                      <p className="text-sm font-medium">{profile.full_name || 'Ikke angitt'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Telefon</Label>
                      <p className="text-sm font-medium">{profile.phone || 'Ikke angitt'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Adresse</Label>
                      <p className="text-sm font-medium">{profile.address || 'Ikke angitt'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Region</Label>
                      <p className="text-sm font-medium">{profile.region || 'Ikke angitt'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Siste aktivitet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Profil opprettet</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('no-NO') : 'Ukjent dato'}
                    </p>
                  </div>
                </div>
                
                {properties && properties.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Eiendommer registrert</p>
                      <p className="text-xs text-muted-foreground">
                        {properties.length} eiendom{properties.length !== 1 ? 'mer' : ''} lagt til
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferanser og innstillinger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">E-postvarsler</Label>
                    <p className="text-sm text-muted-foreground">Motta varsler om vedlikehold og oppdateringer</p>
                  </div>
                  <Button variant="outline" size="sm">Konfigurer</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Personvern</Label>
                    <p className="text-sm text-muted-foreground">Administrer dine personverninnstillinger</p>
                  </div>
                  <Button variant="outline" size="sm">Vis innstillinger</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Tilgangskontroll</Label>
                    <p className="text-sm text-muted-foreground">Kontroller hvem som kan se profilen din</p>
                  </div>
                  <Button variant="outline" size="sm">Administrer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};