import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserProfileCard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (!user || !profile) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Laster profilinformasjon...</p>
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  const handleEditProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.metadata?.avatar_url} alt={profile.full_name || ''} />
          <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
            {getInitials(profile.full_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">
            {profile.full_name || 'Ingen navn satt'}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {profile.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{profile.email || user.email}</span>
        </div>
        
        {profile.phone && (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{profile.phone}</span>
          </div>
        )}
        
        {profile.metadata?.address && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">
              {profile.metadata.address}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-2">
        <Button 
          onClick={handleEditProfile}
          variant="outline" 
          size="sm" 
          className="w-full flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Rediger profil
        </Button>
      </div>
    </div>
  );
};