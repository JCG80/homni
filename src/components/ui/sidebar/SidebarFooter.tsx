
import React from 'react';

interface SidebarFooterProps {
  children: React.ReactNode;
}

export const SidebarFooter = ({ children }: SidebarFooterProps) => {
  return (
    <div className="px-3 py-2 mt-auto border-t">
      {children}
    </div>
  );
};
