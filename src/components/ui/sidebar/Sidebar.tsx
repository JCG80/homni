
import React, { PropsWithChildren } from 'react';

/**
 * Base Sidebar component that provides the container for sidebar content
 * This is a simple wrapper component that just renders its children
 * All complex sidebar logic should be in LayoutSidebar.tsx
 */
export const Sidebar: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div className="pb-12">
      {children}
    </div>
  );
};
