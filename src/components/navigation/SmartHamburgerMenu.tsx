/**
 * Smart Hamburger Menu - Enhanced mobile navigation
 * Includes contextual suggestions and smart organization
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  Clock, 
  Zap,
  User,
  Search,
  Command
} from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/modules/auth/hooks';
import { useUnifiedNavigation } from '@/hooks/useUnifiedNavigation';
import { useNavigationPreferences } from '@/hooks/navigation/useNavigationPreferences';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { cn } from '@/lib/utils';

interface SmartHamburgerMenuProps {
  className?: string;
  onCommandPaletteOpen?: () => void;
}

export const SmartHamburgerMenu: React.FC<SmartHamburgerMenuProps> = ({
  className,
  onCommandPaletteOpen
}) => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { navigation, isLoading } = useUnifiedNavigation();
  const { preferences } = useNavigationPreferences();
  const { 
    quickSuggestions, 
    contextualSuggestions, 
    frequentRoutes, 
    navigationHistory 
  } = useSmartNavigation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter navigation items based on search
  const filteredNavigation = React.useMemo(() => {
    if (!searchQuery.trim()) return navigation.primary;
    
    const query = searchQuery.toLowerCase();
    return navigation.primary.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.href.toLowerCase().includes(query)
    );
  }, [navigation.primary, searchQuery]);

  const isActiveRoute = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleNavigate = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const openCommandPalette = () => {
    setIsOpen(false);
    onCommandPaletteOpen?.();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative p-2 hover:bg-accent/50 transition-colors",
            className
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Åpne navigasjonsmeny</span>
        </Button>
      </SheetTrigger>

      <SheetContent 
        side="left" 
        className="w-80 p-0 bg-background/95 backdrop-blur-sm"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigasjon</SheetTitle>
          <SheetDescription>Naviger gjennom applikasjonen</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Header with user info */}
          <div className="p-4 border-b bg-muted/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {profile?.display_name || user?.email || 'Bruker'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile?.role ? profile.role.replace('_', ' ') : 'Gjest'}
                </p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søk i navigasjon..."
                className="pl-10 h-9"
              />
            </div>
            
            {/* Command palette trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={openCommandPalette}
              className="w-full mt-2 justify-start text-xs"
            >
              <Command className="h-3 w-3 mr-2" />
              Åpne kommando palette
              <kbd className="ml-auto px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd>
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Smart suggestions - only if not searching */}
              {!searchQuery && (quickSuggestions.length > 0 || contextualSuggestions.length > 0) && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Foreslått for deg
                  </h3>
                  
                  <div className="space-y-1">
                    {[...contextualSuggestions, ...quickSuggestions].slice(0, 4).map((suggestion, index) => (
                      <motion.div
                        key={suggestion.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          asChild
                          variant="ghost"
                          className="w-full justify-start h-auto p-3 group"
                          onClick={handleNavigate}
                        >
                          <Link to={suggestion.href}>
                            <div className="flex items-center space-x-3 w-full">
                              {suggestion.icon && typeof suggestion.icon === 'function' && (
                                <suggestion.icon className="h-4 w-4 text-primary/70" />
                              )}
                              
                              <div className="flex-1 text-left">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    {suggestion.title}
                                  </span>
                                  
                                  {contextualSuggestions.includes(suggestion) && (
                                    <Badge variant="outline" className="text-xs">
                                      <Zap className="h-2 w-2 mr-1" />
                                      Smart
                                    </Badge>
                                  )}
                                </div>
                                
                                {suggestion.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {suggestion.description}
                                  </p>
                                )}
                              </div>
                              
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </div>
                          </Link>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent items - only if not searching */}
              {!searchQuery && navigationHistory.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nylig besøkt
                  </h3>
                  
                  <div className="space-y-1">
                    {navigationHistory.slice(0, 3).map((path, index) => {
                      const navItem = navigation.primary.find(item => item.href === path);
                      if (!navItem) return null;
                      
                      return (
                        <Button
                          key={path}
                          asChild
                          variant="ghost"
                          className="w-full justify-start h-auto p-3"
                          onClick={handleNavigate}
                        >
                          <Link to={path}>
                            <div className="flex items-center space-x-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{navItem.title}</span>
                            </div>
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Favorites - only if not searching */}
              {!searchQuery && preferences.favoriteRoutes?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Favoritter
                  </h3>
                  
                  <div className="space-y-1">
                    {preferences.favoriteRoutes.slice(0, 3).map((path) => {
                      const navItem = navigation.primary.find(item => item.href === path);
                      if (!navItem) return null;
                      
                      return (
                        <Button
                          key={path}
                          asChild
                          variant="ghost"
                          className="w-full justify-start h-auto p-3"
                          onClick={handleNavigate}
                        >
                          <Link to={path}>
                            <div className="flex items-center space-x-3">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{navItem.title}</span>
                            </div>
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Main navigation */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {searchQuery ? 'Søkeresultater' : 'Navigasjon'}
                </h3>
                
                <div className="space-y-1">
                  {filteredNavigation.map((item) => (
                    <Button
                      key={item.href}
                      asChild
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto p-3 group",
                        isActiveRoute(item.href) && "bg-accent text-accent-foreground"
                      )}
                      onClick={handleNavigate}
                    >
                      <Link to={item.href}>
                        <div className="flex items-center space-x-3 w-full">
                          {item.icon && typeof item.icon === 'function' && (
                            <item.icon className={cn(
                              "h-4 w-4",
                              isActiveRoute(item.href) 
                                ? "text-accent-foreground" 
                                : "text-muted-foreground"
                            )} />
                          )}
                          
                          <div className="flex-1 text-left">
                            <span className="text-sm font-medium">
                              {item.title}
                            </span>
                            
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                          
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Secondary navigation */}
              {navigation.secondary.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Konto
                    </h3>
                    
                    <div className="space-y-1">
                      {navigation.secondary.map((item) => (
                        <Button
                          key={item.href}
                          asChild
                          variant="ghost"
                          className="w-full justify-start h-auto p-3"
                          onClick={handleNavigate}
                        >
                          <Link to={item.href}>
                            <div className="flex items-center space-x-3">
                            {item.icon && typeof item.icon === 'function' && (
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                            )}
                              <span className="text-sm">{item.title}</span>
                            </div>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};