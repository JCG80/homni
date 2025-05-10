
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { updateProfile } from '../api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserProperties } from '@/modules/property/api'; // Updated import
import { Property } from '@/modules/property/types/propertyTypes';
import { PropertyList } from '@/modules/property/components/PropertyList';
import { AddPropertyForm } from '@/modules/property/components/AddPropertyForm';

export const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    setIsLoadingProperties(true);
    try {
      const userProperties = await getUserProperties();
      setProperties(userProperties);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const handlePropertyAdded = (property: Property) => {
    setProperties((prev) => [property, ...prev]);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        id: user!.id,
        full_name: fullName,
      });
      
      await refreshProfile();
      toast({
        title: "Profil oppdatert",
        description: "Din brukerprofil ble oppdatert.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Feil ved oppdatering",
        description: "Kunne ikke oppdatere brukerprofil. Vennligst prøv igjen.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg text-gray-600">Ingen profil funnet.</p>
          <Button 
            onClick={() => navigate('/login')} 
            className="mt-4"
          >
            Logg inn
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-4">
      <h1 className="text-3xl font-bold mb-6">Min profil</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profilinformasjon</TabsTrigger>
          <TabsTrigger value="properties">Mine eiendommer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Din brukerprofil</CardTitle>
              <CardDescription>
                Se og rediger din profilinformasjon
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Fullt navn</Label>
                    <Input 
                      id="fullName" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ditt fulle navn"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-post</Label>
                    <Input 
                      id="email" 
                      value={user.email || ''} 
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">E-postadresse kan ikke endres</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Rolle</Label>
                    <Input 
                      id="role" 
                      value={profile.role} 
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Fullt navn</p>
                    <p>{profile.full_name || 'Ikke angitt'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">E-post</p>
                    <p>{user.email || 'Ikke angitt'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Rolle</p>
                    <p>{profile.role}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Bruker-ID</p>
                    <p className="text-xs text-gray-500">{user.id}</p>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setFullName(profile.full_name || '');
                    }}
                    disabled={isSubmitting}
                  >
                    Avbryt
                  </Button>
                  <Button 
                    type="submit" 
                    onClick={handleUpdateProfile}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Lagrer...' : 'Lagre endringer'}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="ml-auto"
                >
                  Rediger profil
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="properties">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mine eiendommer</h2>
            <AddPropertyForm onSuccess={handlePropertyAdded} />
          </div>
          
          <PropertyList properties={properties} isLoading={isLoadingProperties} />
          
          {properties.length > 0 && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/properties')}
              >
                Se alle eiendommer
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
