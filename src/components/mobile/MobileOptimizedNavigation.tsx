import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Menu, 
  Home, 
  Mail, 
  FileText, 
  Search, 
  Calendar,
  BarChart3,
  Settings,
  User,
  Bell,
  X,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';

interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  role?: string[];
  children?: NavigationItem[];
}

export const MobileOptimizedNavigation: React.FC = () => {
  const { user, role, isAuthenticated } = useIntegratedAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      href: '/dashboard/user',
      icon: Home,
      role: ['user', 'company', 'admin', 'master_admin']
    },
    {
      id: 'requests',
      title: 'Mine forespørsler',
      href: '/leads',
      icon: Mail,
      badge: 'Ny',
      role: ['user', 'company']
    },
    {
      id: 'property',
      title: 'Eiendommer',
      href: '/property',
      icon: FileText,
      role: ['user', 'company'],
      children: [
        {
          id: 'property-dashboard',
          title: 'Oversikt',
          href: '/property',
          icon: Home
        },
        {
          id: 'property-documents',
          title: 'Dokumenter',
          href: '/property?tab=documents',
          icon: FileText
        },
        {
          id: 'property-maintenance',
          title: 'Vedlikehold',
          href: '/property?tab=maintenance',
          icon: Calendar
        }
      ]
    },
    {
      id: 'search',
      title: 'Søk tjenester',
      href: '/search',
      icon: Search
    },
    {
      id: 'analytics',
      title: 'Analyser',
      href: '/analytics',
      icon: BarChart3,
      role: ['admin', 'master_admin']
    },
    {
      id: 'settings',
      title: 'Innstillinger',
      href: '/settings',
      icon: Settings
    }
  ];

  const isItemActive = (href: string) => {
    return location.pathname === href || 
           (href !== '/' && location.pathname.startsWith(href));
  };

  const canAccessItem = (item: NavigationItem) => {
    if (!item.role) return true;
    return item.role.includes(role || 'anonymous');
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children) {
      toggleExpanded(item.id);
    } else {
      setIsOpen(false);
    }
  };

  const renderNavigationItem = (item: NavigationItem, isChild = false) => {
    if (!canAccessItem(item)) return null;

    const Icon = item.icon;
    const isActive = isItemActive(item.href);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        {item.href && !hasChildren ? (
          <Link
            to={item.href}
            onClick={() => handleItemClick(item)}
            className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            } ${isChild ? 'ml-4 pl-8' : ''}`}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
          </Link>
        ) : (
          <button
            onClick={() => handleItemClick(item)}
            className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors hover:bg-muted ${
              isChild ? 'ml-4 pl-8' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            {hasChildren && (
              <ChevronRight className={`h-4 w-4 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`} />
            )}
          </button>
        )}

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1">
            {item.children?.map(child => renderNavigationItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Homni</SheetTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {role === 'user' ? 'Bruker' : 
                     role === 'company' ? 'Bedrift' : 
                     role === 'admin' ? 'Administrator' : 
                     role === 'master_admin' ? 'Master Admin' : role}
                  </p>
                </div>
              </div>
            )}
          </SheetHeader>

          <Separator />

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {navigationItems.map(item => renderNavigationItem(item))}
            </nav>
          </div>

          <Separator />

          {/* Footer Actions */}
          <div className="p-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  <Bell className="h-4 w-4" />
                  Varsler
                  <Badge variant="destructive" className="ml-auto">
                    3
                  </Badge>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-red-600 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    // Handle logout
                    setIsOpen(false);
                  }}
                >
                  Logg ut
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Button className="w-full" onClick={() => setIsOpen(false)}>
                  Logg inn
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsOpen(false)}
                >
                  Registrer deg
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};