
import React from 'react';

interface SidebarContentProps {
  children: React.ReactNode;
}

export const SidebarContent = ({ children }: SidebarContentProps) => {
  return (
    <div className="space-y-4 py-4">
      {children}
    </div>
  );
};
