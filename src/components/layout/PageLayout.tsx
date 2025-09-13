
import React, { ReactNode, useState } from 'react';
import { SmartBreadcrumbs } from '@/components/navigation/SmartBreadcrumbs';
import { Header } from './Header';
import { Footer } from './Footer';
import { LayoutSidebar } from './LayoutSidebar';
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "../ui/sheet";
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBreadcrumbs?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  hideHeaderOnScroll?: boolean;
}

export const PageLayout = ({ 
  children, 
  title, 
  description,
  showBreadcrumbs = true,
  showFooter = true,
  showSidebar = false,
  hideHeaderOnScroll = false
}: PageLayoutProps) => {
  const [activeTab, setActiveTab] = useState<string>('private');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);

  // Handle header visibility based on scroll (optional feature)
  React.useEffect(() => {
    if (!hideHeaderOnScroll) return;
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideHeaderOnScroll]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        className={hideHeaderOnScroll ? (scrolled ? 'translate-y-[-100%]' : '') : ''}
      />
      
      <div className="flex flex-grow">
        {/* Mobile Sidebar Trigger - Fixed position at bottom corner */}
        {showSidebar && isMobile && (
          <motion.div 
            className="fixed bottom-6 left-6 z-30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button 
                  size="icon" 
                  className="rounded-full shadow-lg bg-primary text-primary-foreground h-12 w-12"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
                <LayoutSidebar />
              </SheetContent>
            </Sheet>
          </motion.div>
        )}
        
        {/* Desktop Sidebar - Show only when showSidebar is true */}
        {showSidebar && !isMobile && (
          <motion.div 
            className="hidden md:block w-64 shrink-0 border-r h-[calc(100vh-64px)] sticky top-16 overflow-y-auto bg-background"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <LayoutSidebar />
          </motion.div>
        )}
        
        <main className="flex-grow">
          <motion.div 
            className={`container mx-auto px-4 py-4 md:py-8 ${showSidebar ? 'md:pl-8' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {showBreadcrumbs && <SmartBreadcrumbs />}
            
            {(title || description) && (
              <motion.div 
                className="mb-6 md:mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {title && <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>}
                {description && <p className="text-muted-foreground">{description}</p>}
              </motion.div>
            )}
            
            {children}
          </motion.div>
        </main>
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
};
