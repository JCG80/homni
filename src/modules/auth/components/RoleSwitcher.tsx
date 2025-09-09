
import { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { updateUserRole } from '../api';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../utils/roles';
import { toast } from '@/components/ui/use-toast';

export const RoleSwitcher = () => {
  const { profile, refreshProfile, isMasterAdmin } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!profile) return null;

  const currentRole = profile.role;
  
  const handleRoleChange = async (newRole: string) => {
    setIsUpdating(true);
    try {
      await updateUserRole(profile.id, newRole as UserRole);
      await refreshProfile();
      toast({
        title: 'Rolle oppdatert',
        description: `Du er nå innlogget som ${newRole}`,
      });
    } catch (error) {
      toast({
        title: 'Oppdateringsfeil',
        description: 'Kunne ikke endre rolle',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to get initials from user's full name
  const getInitials = () => {
    if (!profile.full_name) return 'U';
    return profile.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      
      <Select
        value={currentRole}
        onValueChange={handleRoleChange}
        disabled={isUpdating || !isMasterAdmin}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={currentRole} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="user">Bruker</SelectItem>
            <SelectItem value="company">Bedrift</SelectItem>
            {isMasterAdmin && (
              <>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="master_admin">Master Admin</SelectItem>
                <SelectItem value="content_editor">Innholdsredaktør</SelectItem>
              </>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
