import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useRolePreview } from '@/contexts/RolePreviewContext';
import { useAuth } from '@/modules/auth/hooks';
import { ALL_ROLES } from '@/types/auth';
import type { UserRole } from '@/types/auth';

export const RoleSwitcher: React.FC = () => {
  const { isAdmin, isMasterAdmin, role: actualRole } = useAuth();
  const { previewRole, setPreviewRole, isPreviewMode, canUsePreview } = useRolePreview();

  // Only show to admins
  if (!canUsePreview || (!isAdmin && !isMasterAdmin)) {
    return null;
  }

  const currentDisplayRole = isPreviewMode ? previewRole : (actualRole as UserRole);

  const handleRoleChange = (value: string) => {
    if (value === 'reset') {
      setPreviewRole(null);
    } else if (ALL_ROLES.includes(value as UserRole)) {
      setPreviewRole(value as UserRole);
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    const names: Record<UserRole, string> = {
      guest: 'Gjest',
      user: 'Bruker',
      company: 'Bedrift',
      content_editor: 'Innholdsredaktør',
      admin: 'Admin',
      master_admin: 'Master Admin'
    };
    return names[role];
  };

  return (
    <div className="flex items-center gap-2">
      {isPreviewMode && (
        <Badge variant="secondary" className="text-xs">
          <Eye className="h-3 w-3 mr-1" />
          Se som
        </Badge>
      )}
      
      <Select 
        value={isPreviewMode ? previewRole! : 'reset'} 
        onValueChange={handleRoleChange}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={currentDisplayRole ? getRoleDisplayName(currentDisplayRole) : 'Velg rolle'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="reset">
            <div className="flex items-center gap-2">
              <span>🔵</span>
              <span>Min rolle ({actualRole ? getRoleDisplayName(actualRole as UserRole) : 'Ukjent'})</span>
            </div>
          </SelectItem>
          {ALL_ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                <span>{getRoleDisplayName(role)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};