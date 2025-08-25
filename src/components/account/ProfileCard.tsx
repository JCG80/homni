
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Edit, Mail, Phone, Home } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigate } from 'react-router-dom';

export const ProfileCard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const handleEditProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="warm-card hover:shadow-lg transition-shadow duration-300">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Mine detaljer
          </h3>
        </div>
      </div>
      <div className="px-5 py-4">
        {profile ? (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary/80" />
              <span>{profile.full_name || 'Ikke angitt'}</span>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary/80" />
              <span>{profile.email || 'Ikke angitt'}</span>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-primary/80" />
              <span>{profile.phone || 'Ikke angitt'}</span>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4 text-primary/80" />
              <span>{profile.address || 'Ikke angitt'}</span>
            </p>
          </div>
        ) : (
          <p className="text-gray-500 flex items-center gap-2">
            <span className="animate-pulse h-4 w-4 bg-primary/20 rounded-full"></span>
            Laster profil...
          </p>
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
