
import React from 'react';

interface SidebarHeaderProps {
  children?: React.ReactNode;
}

export const SidebarHeader = ({ children }: SidebarHeaderProps) => {
  return (
    <div className="px-3 py-4 border-b">
      {children}
    </div>
  );
};
