import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Menu, X, ChevronRight, Star, Clock, User, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { getNavigation } from '@/config/navigation';
import { useNavigationPreferences, useQuickActions } from '@/hooks/navigation';
import { cn } from '@/lib/utils';
import { UserRole } from '@/modules/auth/normalizeRole';

interface SmartHamburgerMenuProps {
  className?: string;
}

export const SmartHamburgerMenu: React.FC<SmartHamburgerMenuProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { role, isAuthenticated, user, profile } = useAuth();
  const location = useLocation();
  const { preferences } = useNavigationPreferences();
  const { quickActions } = useQuickActions();
  
  const currentRole = isAuthenticated ? role : 'guest';
  const navItems = getNavigation(currentRole as UserRole);
  
  // Smart grouping of navigation items
  const primaryActions = navItems.filter(item => 
    ['dashboard', 'leads', 'property', 'sales'].some(key => item.href.includes(key))
  );
  
  const secondaryActions = navItems.filter(item => 
    ['documents', 'profile', 'account'].some(key => item.href.includes(key))
  );
  
  const favoriteRoutes = navItems.filter(item => 
    preferences.favoriteRoutes.includes(item.href)
  );
  
  const recentRoutes = preferences.recentRoutes
    .map(route => navItems.find(item => item.href === route))
    .filter(Boolean)
    .slice(0, 3);

  const closeMenu = () => setIsOpen(false);
  
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };
  
  const getNotificationCount = (href: string) => {
    const quickAction = quickActions.find(action => action.href === href);
    return quickAction?.badge?.count || 0;
  };

  const MenuSection: React.FC<{
    title: string;
    items: any[];
    icon?: React.ComponentType<{ className?: string }>;
  }> = ({ title, items, icon: Icon }) => {
    if (items.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2 py-1">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <div className="space-y-1">
          {items.map((item) => {
            if (!item) return null;
            const ItemIcon = item.icon;
            const active = isActive(item.href);
            const notificationCount = getNotificationCount(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeMenu}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                  active 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  {ItemIcon && <ItemIcon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {notificationCount > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                      {notificationCount}
                    </Badge>
                  )}
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          aria-label="Åpne meny"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-left">Meny</SheetTitle>
            <Button variant="ghost" size="icon" onClick={closeMenu}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {isAuthenticated && profile && (
            <div className="flex items-center gap-3 mt-3 p-3 bg-accent/50 rounded-lg">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile.full_name || 'Anonym bruker'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick Actions / Favorites */}
          {isAuthenticated && (
            <MenuSection
              title="Favoritter"
              items={favoriteRoutes}
              icon={Star}
            />
          )}
          
          {/* Recent Routes */}
          {isAuthenticated && recentRoutes.length > 0 && (
            <>
              <MenuSection
                title="Nylig besøkt"
                items={recentRoutes}
                icon={Clock}
              />
              <Separator />
            </>
          )}
          
          {/* Primary Actions */}
          <MenuSection
            title="Hovedfunksjoner"
            items={primaryActions}
          />
          
          <Separator />
          
          {/* Secondary Actions */}
          <MenuSection
            title="Konto & Innstillinger"
            items={secondaryActions}
            icon={Settings}
          />
          
          {/* Guest Actions */}
          {!isAuthenticated && (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md text-sm font-medium"
              >
                <User className="h-4 w-4" />
                Logg inn
              </Link>
            </div>
          )}
        </div>
        
        {/* Footer with quick settings */}
        {isAuthenticated && (
          <div className="border-t p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Rolle: {currentRole}</span>
              <Link
                to="/account"
                onClick={closeMenu}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Settings className="h-3 w-3" />
                Innstillinger
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};