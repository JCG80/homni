import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Home } from 'lucide-react';

export type UserRole = 'private' | 'business';

interface RoleToggleProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  className?: string;
}

export const RoleToggle = ({ selectedRole, onRoleChange, className }: RoleToggleProps) => {
  return (
    <Tabs 
      value={selectedRole} 
      onValueChange={(value) => onRoleChange(value as UserRole)}
      className={className}
    >
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
        <TabsTrigger 
          value="private" 
          className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Home className="w-4 h-4" />
          Privatperson
        </TabsTrigger>
        <TabsTrigger 
          value="business" 
          className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Building2 className="w-4 h-4" />
          Bedrift
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};