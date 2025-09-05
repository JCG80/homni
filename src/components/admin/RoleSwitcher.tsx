import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useRolePreview } from '@/contexts/RolePreviewContext';
import { useAuth } from '@/modules/auth/hooks';
import { ALL_ROLES } from '@/types/auth';
import { routeForRole } from '@/config/routeForRole';
import type { UserRole } from '@/types/auth';

export const RoleSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isMasterAdmin, role: actualRole } = useAuth();
  const { previewRole, setPreviewRole, isPreviewMode, canUsePreview } = useRolePreview();

  // Auto-navigate when preview role changes
  useEffect(() => {
    if (isPreviewMode && previewRole) {
      const targetRoute = routeForRole(previewRole);
      navigate(targetRoute, { replace: true });
    } else if (!isPreviewMode && actualRole) {
      // When exiting preview mode, go back to actual role's dashboard
      const targetRoute = routeForRole(actualRole as UserRole);
      navigate(targetRoute, { replace: true });
    }
  }, [previewRole, isPreviewMode, actualRole, navigate]);

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