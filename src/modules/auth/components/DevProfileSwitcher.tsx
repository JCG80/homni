
import React from 'react';
import { Button } from '@/components/ui/button';
import { DEV_USERS, switchDevUser } from '../utils/devProfiles';
import { UserRole } from '../utils/roles/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';

interface DevProfileSwitcherProps {
  currentKey: string | null;
  onSwitchUser: (profile: any) => void;
}

export const DevProfileSwitcher: React.FC<DevProfileSwitcherProps> = ({
  currentKey,
  onSwitchUser,
}) => {
  // Don't render in production
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  const handleSwitchUser = (key: string) => {
    const profile = switchDevUser(key);
    if (profile) {
      onSwitchUser(profile);
    }
  };

  // Get role color based on user role
  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'master_admin':
        return 'bg-red-600 text-white';
      case 'admin':
        return 'bg-orange-500 text-white';
      case 'company':
      case 'business':
        return 'bg-blue-600 text-white';
      case 'user':
      case 'member':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 border border-dashed border-yellow-500 text-yellow-700 hover:bg-yellow-50"
        >
          DEV
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Development Profiles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(DEV_USERS).map(([key, profile]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleSwitchUser(key)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full mr-3 ${getRoleColor(
                  profile.role
                )}`}
              >
                {profile.initials}
              </span>
              <span>{profile.name}</span>
            </div>
            {currentKey === key && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
