/**
 * Unified Navigation Component - Plugin-driven navigation system
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePluginSystem } from '@/hooks/usePluginSystem';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Folder, 
  Home, 
  Settings, 
  BarChart3,
  Users,
  FileText,
  Shield,
  Zap
} from 'lucide-react';

const iconMap = {
  search: Search,
  folder: Folder,
  home: Home,
  settings: Settings,
  'bar-chart': BarChart3,
  users: Users,
  'file-text': FileText,
  shield: Shield,
  zap: Zap
};

export const UnifiedNavigation: React.FC = () => {
  const location = useLocation();
  const { navigationItems, isInitialized } = usePluginSystem();
  const navigation = navigationItems.map(item => ({
    name: item.id,
    title: item.title,
    href: item.href,
    icon: item.icon,
    category: item.metadata?.category || 'core'
  }));

  if (!isInitialized) {
    return (
      <nav className="space-y-2">
        <div className="h-10 bg-muted/50 rounded animate-pulse" />
        <div className="h-10 bg-muted/50 rounded animate-pulse" />
        <div className="h-10 bg-muted/50 rounded animate-pulse" />
      </nav>
    );
  }

  if (navigation.length === 0) {
    return (
      <nav className="space-y-2">
        <div className="text-sm text-muted-foreground p-2">
          Ingen moduler tilgjengelig
        </div>
      </nav>
    );
  }

  // Group navigation items by category
  const groupedNav = navigation.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof navigation[0][]>);

  const categoryOrder = ['core', 'analytics', 'admin'];
  const categoryLabels = {
    core: 'Kjernemodulser',
    analytics: 'Analyse',
    admin: 'Administrasjon'
  };

  return (
    <nav className="space-y-6">
      {categoryOrder.map(category => {
        const items = groupedNav[category];
        if (!items || items.length === 0) return null;

        return (
          <div key={category} className="space-y-2">
            {/* Category Header */}
            <div className="px-2 py-1">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {categoryLabels[category as keyof typeof categoryLabels] || category}
              </h3>
            </div>

            {/* Navigation Items */}
            <div className="space-y-1">
              {items.map(item => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                const isActive = location.pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {IconComponent && (
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Plugin System Status */}
      <div className="px-3 py-2 mt-8 border-t">
        <div className="text-xs text-muted-foreground">
          Plugin System: {isInitialized ? '✅ Aktiv' : '⏳ Laster...'}
        </div>
        <div className="text-xs text-muted-foreground">
          Moduler: {navigation.length}
        </div>
      </div>
    </nav>
  );
};

export default UnifiedNavigation;