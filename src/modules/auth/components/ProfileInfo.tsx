
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { updateProfile } from '../api';
import { useAuth } from '../hooks/useAuth';
import { Profile } from '../types/types';

export const ProfileInfo: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        id: user.id,
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
    return null;
  }
  
  return (
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
  );
};
