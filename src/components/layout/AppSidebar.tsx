
import React, { PropsWithChildren } from 'react';
import { LayoutSidebar } from './LayoutSidebar';

// Use PropsWithChildren to properly type the children prop
export const AppSidebar = ({ children }: PropsWithChildren<{}>) => {
  return (
    <LayoutSidebar>
      {children}
    </LayoutSidebar>
  );
};
