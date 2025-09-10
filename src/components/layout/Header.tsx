
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainNavigation } from './MainNavigation';
import { useAuth } from '@/modules/auth/hooks';
import { ProfileHeader } from './ProfileHeader';
import { Menu, Search } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { LayoutSidebar } from './LayoutSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNavigation } from './MobileNavigation';
import { RoleSwitcher } from '@/components/admin/RoleSwitcher';
import { QuickActionsDropdown } from '@/components/navigation';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/navigation/useKeyboardShortcuts';

interface HeaderProps {
  /** Allow passing through layout class names */
  className?: string;
}

export const Header = ({ className = '' }: HeaderProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isMasterAdmin } = useAuth();
  const isMobile = useIsMobile();
  const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useKeyboardShortcuts();
  
  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <header className={`bg-white shadow-sm py-3 md:py-4 sticky top-0 z-50 ${className}`}>
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
                {isAuthenticated ? (
                  <MobileNavigation />
                ) : (
                  <LayoutSidebar />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Auth/User Section */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Command Palette Trigger - Desktop only */}
          {isAuthenticated && !isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm hidden lg:inline">Search</span>
              <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          )}
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <QuickActionsDropdown variant="icon" className="hidden md:flex" />
              {(isAdmin || isMasterAdmin) && <RoleSwitcher />}
              <ProfileHeader />
            </div>
          ) : (
            <Button 
              variant="ghost" 
              onClick={goToLogin}
              size={isMobile ? "sm" : "default"}
              className="whitespace-nowrap"
            >
              Logg inn
            </Button>
          )}
        </div>
      </div>

      {/* Command Palette */}
      {isAuthenticated && (
        <CommandPalette 
          open={isCommandPaletteOpen} 
          onOpenChange={setIsCommandPaletteOpen} 
        />
      )}
    </header>
  );
};
