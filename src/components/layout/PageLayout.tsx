
import React, { ReactNode, useState } from 'react';
import { BreadcrumbNav } from './BreadcrumbNav';
import { Header } from './Header';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBreadcrumbs?: boolean;
  showFooter?: boolean;
}

export const PageLayout = ({ 
  children, 
  title, 
  description,
  showBreadcrumbs = true,
  showFooter = true
}: PageLayoutProps) => {
  const [activeTab, setActiveTab] = useState<string>('private');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeTab={activeTab} handleTabChange={handleTabChange} />
      <main className="flex-grow">
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
      </main>
      {showFooter && <Footer />}
    </div>
  );
};
