
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { updateProfile } from '../api';
import { useAuth } from '../hooks/useAuth';

export const ProfileInfo: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
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
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };
  
  if (!user || !profile) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.profile_picture_url} alt={profile.full_name} />
          <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{profile.full_name || 'Anonym bruker'}</CardTitle>
          <CardDescription>
            {profile.role === 'user' ? 'Bruker' : 
              profile.role === 'company' ? 'Bedrift' : 
              profile.role === 'admin' ? 'Administrator' : 
              profile.role === 'master_admin' ? 'Hoved-administrator' : 
              'Gjest'}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
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
              <p className="text-sm font-medium">Telefon</p>
              <p>{profile.phone || 'Ikke angitt'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Adresse</p>
              <p>{profile.address || 'Ikke angitt'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Region</p>
              <p>{profile.region || 'Ikke angitt'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Rolle</p>
              <p>{profile.role}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Bruker-ID</p>
              <p className="text-xs text-gray-500">{user.id}</p>
            </div>
            
            {profile.preferences && Object.keys(profile.preferences).length > 0 && (
              <div>
                <p className="text-sm font-medium">Preferanser</p>
                <div className="text-xs text-gray-500 mt-1 p-2 bg-gray-50 rounded border">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(profile.preferences, null, 2)}</pre>
                </div>
              </div>
            )}
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
  );
};
