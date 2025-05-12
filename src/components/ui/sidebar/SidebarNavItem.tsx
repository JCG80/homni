
import React from 'react';
import { Button } from '@/components/ui/button';

interface SidebarNavItemProps {
  icon: React.ElementType;
  onClick: () => void;
  children: React.ReactNode;
}

export const SidebarNavItem = ({ icon: Icon, onClick, children }: SidebarNavItemProps) => {
  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      onClick={onClick}
    >
      <Icon size={16} className="mr-2" />
      <span>{children}</span>
    </Button>
  );
};
