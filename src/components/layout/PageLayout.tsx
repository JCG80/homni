
import React, { ReactNode } from 'react';
import { BreadcrumbNav } from './BreadcrumbNav';
import { Header } from './Header';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBreadcrumbs?: boolean;
}

export const PageLayout = ({ 
  children, 
  title, 
  description,
  showBreadcrumbs = true 
}: PageLayoutProps) => {
  return (
    <>
      <Header activeTab="private" handleTabChange={() => {}} />
      <div className="container mx-auto px-4 py-8">
        {showBreadcrumbs && <BreadcrumbNav />}
        
        {(title || description) && (
          <div className="mb-8">
            {title && <h1 className="text-3xl font-bold mb-2">{title}</h1>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        )}
        
        {children}
      </div>
    </>
  );
};
