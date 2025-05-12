import React, { ReactNode, useState } from 'react';
import { BreadcrumbNav } from './BreadcrumbNav';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from '../ui/sidebar';
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "../ui/sheet";
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBreadcrumbs?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
}

export const PageLayout = ({ 
  children, 
  title, 
  description,
  showBreadcrumbs = true,
  showFooter = true,
  showSidebar = false
}: PageLayoutProps) => {
  const [activeTab, setActiveTab] = useState<string>('private');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeTab={activeTab} handleTabChange={handleTabChange} />
      
      <div className="flex flex-grow">
        {/* Mobile Sidebar Trigger */}
        <div className="md:hidden fixed bottom-4 left-4 z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="rounded-full shadow-lg bg-primary text-primary-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Desktop Sidebar - Show only when showSidebar is true */}
        {showSidebar && (
          <div className="hidden md:block w-64 shrink-0 border-r h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
            <Sidebar />
          </div>
        )}
        
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
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
};
