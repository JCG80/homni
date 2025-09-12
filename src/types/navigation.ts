export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: {
    count?: number;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  };
  children?: NavigationItem[];
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

export interface NavigationPreferences {
  favoriteRoutes: string[];
  recentRoutes: string[];
  hiddenItems: string[];
  customOrder?: string[];
}

export interface QuickAction extends NavigationItem {
  color?: string;
  priority?: number;
}