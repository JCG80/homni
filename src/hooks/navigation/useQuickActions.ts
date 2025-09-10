import { useMemo } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/modules/auth/normalizeRole';
import { 
  Plus, 
  Search, 
  FileText, 
  Users, 
  Settings, 
  BarChart3,
  MapPin,
  Bell,
  Star,
  Home
} from 'lucide-react';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  badge?: {
    count?: number;
    variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
  };
}

export const useQuickActions = () => {
  const { role, isAuthenticated } = useAuth();

  const quickActions = useMemo((): QuickAction[] => {
    if (!isAuthenticated) {
      return [
        {
          id: 'smart-start',
          title: 'SmartStart',
          description: 'Finn tjenester for ditt hjem',
          href: '/services/smart-start',
          icon: Search,
          shortcut: 'Cmd+K'
        },
        {
          id: 'services',
          title: 'Tjenester',
          description: 'Utforsk alle tjenester',
          href: '/services',
          icon: Star
        }
      ];
    }

    // Role-specific quick actions
    switch (role as UserRole) {
      case 'user':
        return [
          {
            id: 'smart-start',
            title: 'Ny SmartStart',
            description: 'Start nytt søk etter tjenester',
            href: '/services/smart-start',
            icon: Plus,
            shortcut: 'Cmd+N'
          },
          {
            id: 'profile',
            title: 'Min profil',
            description: 'Rediger profilinformasjon',
            href: '/dashboard/user/profile',
            icon: Settings
          },
          {
            id: 'favorites',
            title: 'Favoritter',
            description: 'Se lagrede tjenester',
            href: '/dashboard/user/favorites',
            icon: Star
          },
          {
            id: 'notifications',
            title: 'Varsler',
            description: 'Se dine varsler',
            href: '/dashboard/user/notifications',
            icon: Bell,
            badge: { count: 3, variant: 'warning' }
          }
        ];

      case 'company':
        return [
          {
            id: 'new-lead',
            title: 'Nye leads',
            description: 'Se potensielle kunder',
            href: '/dashboard/company/leads',
            icon: Users,
            badge: { count: 12, variant: 'success' }
          },
          {
            id: 'create-service',
            title: 'Ny tjeneste',
            description: 'Opprett ny tjeneste',
            href: '/dashboard/company/services/new',
            icon: Plus,
            shortcut: 'Cmd+N'
          },
          {
            id: 'analytics',
            title: 'Statistikk',
            description: 'Se ytelsesdata',
            href: '/dashboard/company/analytics',
            icon: BarChart3
          },
          {
            id: 'territory',
            title: 'Dekningsområde',
            description: 'Administrer dekningsområde',
            href: '/dashboard/company/territory',
            icon: MapPin
          }
        ];

      case 'content_editor':
        return [
          {
            id: 'create-content',
            title: 'Nytt innhold',
            description: 'Opprett nytt innhold',
            href: '/dashboard/content-editor/create',
            icon: Plus,
            shortcut: 'Cmd+N'
          },
          {
            id: 'manage-content',
            title: 'Administrer innhold',
            description: 'Rediger eksisterende innhold',
            href: '/dashboard/content-editor/manage',
            icon: FileText
          },
          {
            id: 'review-queue',
            title: 'Ventende godkjenning',
            description: 'Innhold som venter på godkjenning',
            href: '/dashboard/content-editor/review',
            icon: Bell,
            badge: { count: 5, variant: 'warning' }
          }
        ];

      case 'admin':
        return [
          {
            id: 'user-management',
            title: 'Brukere',
            description: 'Administrer brukere',
            href: '/dashboard/admin/users',
            icon: Users
          },
          {
            id: 'insights',
            title: 'SmartStart Insights',
            description: 'Analyser og rapporter',
            href: '/dashboard/admin/insights',
            icon: BarChart3
          },
          {
            id: 'system-settings',
            title: 'Systeminnstillinger',
            description: 'Konfigurer systemet',
            href: '/dashboard/admin/settings',
            icon: Settings
          },
          {
            id: 'notifications',
            title: 'Systemvarsler',
            description: 'Kritiske systemvarsler',
            href: '/dashboard/admin/notifications',
            icon: Bell,
            badge: { count: 2, variant: 'destructive' }
          }
        ];

      case 'master_admin':
        return [
          {
            id: 'system-overview',
            title: 'Systemoversikt',
            description: 'Overordnet systemstatus',
            href: '/dashboard/master-admin/overview',
            icon: Home
          },
          {
            id: 'insights',
            title: 'SmartStart Insights',
            description: 'Avanserte analyser',
            href: '/dashboard/admin/insights',
            icon: BarChart3
          },
          {
            id: 'user-management',
            title: 'Alle brukere',
            description: 'Administrer alle brukere',
            href: '/dashboard/master-admin/users',
            icon: Users
          },
          {
            id: 'system-config',
            title: 'Systemkonfigurasjon',
            description: 'Avanserte innstillinger',
            href: '/dashboard/master-admin/config',
            icon: Settings
          },
          {
            id: 'alerts',
            title: 'Systemalarmener',
            description: 'Kritiske systemalarmener',
            href: '/dashboard/master-admin/alerts',
            icon: Bell,
            badge: { count: 1, variant: 'destructive' }
          }
        ];

      default:
        return [];
    }
  }, [role, isAuthenticated]);

  const getQuickActionById = (id: string) => {
    return quickActions.find(action => action.id === id);
  };

  const getQuickActionsByCategory = (hasNotifications: boolean = false) => {
    return quickActions.filter(action => 
      hasNotifications ? action.badge : !action.badge
    );
  };

  return {
    quickActions,
    getQuickActionById,
    getQuickActionsByCategory,
  };
};