import { 
  Home, 
  Users, 
  Building2, 
  Settings, 
  BarChart3, 
  FileText, 
  ShoppingCart, 
  User,
  Shield,
  Kanban
} from 'lucide-react';
import { UserRole } from '@/modules/auth/utils/roles/types';

export interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: UserRole[];
  children?: NavItem[];
  badge?: string;
}

export interface NavConfig {
  main: NavItem[];
  footer: NavItem[];
}

export const getNavConfig = (role: UserRole): NavConfig => {
  const baseItems: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
      roles: ['user', 'company', 'content_editor', 'admin', 'master_admin']
    }
  ];

  const leadItems: NavItem[] = [
    {
      title: 'Leads',
      url: '/leads',
      icon: Users,
      roles: ['user', 'company', 'admin', 'master_admin'],
      children: [
        {
          title: 'Lead List',
          url: '/leads',
          icon: Users,
          roles: ['user', 'company', 'admin', 'master_admin']
        },
        {
          title: 'Kanban Board',
          url: '/leads/kanban',
          icon: Kanban,
          roles: ['user', 'company', 'admin', 'master_admin']
        }
      ]
    }
  ];

  const companyItems: NavItem[] = [
    {
      title: 'Companies',
      url: '/companies',
      icon: Building2,
      roles: ['admin', 'master_admin']
    }
  ];

  const adminItems: NavItem[] = [
    {
      title: 'Admin',
      url: '/admin',
      icon: Shield,
      roles: ['admin', 'master_admin'],
      children: [
        {
          title: 'Users',
          url: '/admin/users',
          icon: Users,
          roles: ['admin', 'master_admin']
        },
        {
          title: 'Companies',
          url: '/admin/companies',
          icon: Building2,
          roles: ['admin', 'master_admin']
        },
        {
          title: 'Content',
          url: '/admin/content',
          icon: FileText,
          roles: ['content_editor', 'admin', 'master_admin']
        },
        {
          title: 'Analytics',
          url: '/admin/analytics',
          icon: BarChart3,
          roles: ['admin', 'master_admin']
        }
      ]
    }
  ];

  const marketplaceItems: NavItem[] = [
    {
      title: 'Marketplace',
      url: '/marketplace',
      icon: ShoppingCart,
      roles: ['company', 'admin', 'master_admin'],
      children: [
        {
          title: 'Lead Packages',
          url: '/marketplace/packages',
          icon: ShoppingCart,
          roles: ['admin', 'master_admin']
        },
        {
          title: 'Buyer Accounts',
          url: '/marketplace/buyers',
          icon: Users,
          roles: ['admin', 'master_admin']
        },
        {
          title: 'Lead Pipeline',
          url: '/marketplace/pipeline',
          icon: Kanban,
          roles: ['company']
        }
      ]
    }
  ];

  const profileItems: NavItem[] = [
    {
      title: 'Profile',
      url: '/profile',
      icon: User,
      roles: ['user', 'company', 'content_editor', 'admin', 'master_admin']
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
      roles: ['user', 'company', 'content_editor', 'admin', 'master_admin']
    }
  ];

  // Filter items based on role
  const filterByRole = (items: NavItem[]): NavItem[] => {
    return items
      .filter(item => item.roles.includes(role))
      .map(item => ({
        ...item,
        children: item.children ? filterByRole(item.children) : undefined
      }));
  };

  const mainNavItems = [
    ...baseItems,
    ...leadItems,
    ...companyItems,
    ...adminItems,
    ...marketplaceItems
  ];

  return {
    main: filterByRole(mainNavItems),
    footer: filterByRole(profileItems)
  };
};