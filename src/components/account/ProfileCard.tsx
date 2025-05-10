
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Edit } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const ProfileCard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const handleEditProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Mine detaljer
          </h3>
        </div>
      </div>
      <div className="px-5 py-4">
        {profile ? (
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Navn:</span> {profile.full_name || 'Ikke angitt'}</p>
            <p><span className="font-medium">E-post:</span> {profile.email || 'Ikke angitt'}</p>
            <p><span className="font-medium">Telefon:</span> {profile.phone || 'Ikke angitt'}</p>
            <p><span className="font-medium">Adresse:</span> {profile.address || 'Ikke angitt'}</p>
          </div>
        ) : (
          <p className="text-gray-500">Laster profil...</p>
        )}
      </div>
      <div className="px-5 pb-5 pt-2">
        <Button 
          onClick={handleEditProfile} 
          className="w-full"
          variant="outline"
        >
          <Edit className="h-4 w-4 mr-2" /> Rediger profil
        </Button>
      </div>
    </div>
  );
};
