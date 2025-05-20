import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainNavigation } from './MainNavigation';
import { useAuth } from '@/modules/auth/hooks';
import { UserNav } from './UserNav';
import { Menu } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { LayoutSidebar } from './LayoutSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
}

export const Header = ({ activeTab, handleTabChange }: HeaderProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  
  const goToLogin = () => {
    navigate(activeTab === 'business' ? '/login?type=business' : '/login');
  };

  return (
    <header className="bg-white shadow-sm py-3 md:py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-bold text-primary flex items-center">
          Homni
        </Link>
        
        {/* Main Navigation - Desktop */}
        <MainNavigation />
        
        {/* Main Navigation - Mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Åpne meny</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
              <div className="py-4">
                <LayoutSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Auth/User Section */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Tabs
            defaultValue="private"
            value={activeTab}
            onValueChange={handleTabChange}
            className="hidden sm:block"
          >
            <TabsList className="bg-transparent">
              <TabsTrigger value="private" className="text-xs md:text-sm">Privatperson</TabsTrigger>
              <TabsTrigger value="business" className="text-xs md:text-sm">Bedrift</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isAuthenticated ? (
            <UserNav />
          ) : (
            <Button 
              variant="outline" 
              onClick={goToLogin}
              size={isMobile ? "sm" : "default"}
              className="whitespace-nowrap"
            >
              Logg inn
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
