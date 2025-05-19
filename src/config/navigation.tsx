
import {
  Home,
  Users,
  Building,
  FileText,
  Settings,
  BarChart,
  Layers,
  ShieldCheck,
  Activity,
  FilePlus,
} from "lucide-react";
import { UserRole } from "@/modules/auth/utils/roles/types";

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType;
  children?: NavItem[];
  description?: string;
}

// Shared navigation items that appear in multiple role dashboards
const sharedNavItems: Record<string, NavItem> = {
  home: {
    title: "Home",
    href: "/dashboard",
    icon: Home,
    description: "Overview of your dashboard",
  },
  settings: {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Manage your account settings",
  },
};

// Role-specific navigation configurations
export const navConfig: Record<UserRole, NavItem[]> = {
  member: [
    sharedNavItems.home,
    {
      title: "My Properties",
      href: "/dashboard/properties",
      icon: Building,
      description: "View and manage your properties",
    },
    {
      title: "Documents",
      href: "/dashboard/documents",
      icon: FileText,
      description: "Access your property documents",
    },
    sharedNavItems.settings,
  ],
  
  company: [
    sharedNavItems.home,
    {
      title: "Leads",
      href: "/dashboard/leads",
      icon: Activity,
      description: "Manage your customer leads",
    },
    {
      title: "Lead Kanban",
      href: "/dashboard/leads/kanban",
      icon: Layers,
      description: "Kanban view of your leads",
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart,
      description: "View your business analytics",
    },
    sharedNavItems.settings,
  ],
  
  content_editor: [
    sharedNavItems.home,
    {
      title: "Content",
      href: "/dashboard/content",
      icon: FilePlus,
      description: "Manage website content",
    },
    {
      title: "Media Library",
      href: "/dashboard/media",
      icon: FileText,
      description: "Manage media files",
    },
    sharedNavItems.settings,
  ],
  
  admin: [
    sharedNavItems.home,
    {
      title: "Companies",
      href: "/dashboard/admin/companies",
      icon: Building,
      description: "Manage company accounts",
    },
    {
      title: "Members",
      href: "/dashboard/admin/members",
      icon: Users,
      description: "Manage member accounts",
    },
    {
      title: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
      description: "System settings",
    },
  ],
  
  master_admin: [
    sharedNavItems.home,
    {
      title: "Companies",
      href: "/dashboard/admin/companies",
      icon: Building,
      description: "Manage company accounts",
    },
    {
      title: "Members",
      href: "/dashboard/admin/members",
      icon: Users,
      description: "Manage member accounts",
    },
    {
      title: "System",
      href: "/dashboard/admin/system",
      icon: ShieldCheck,
      description: "System administration",
    },
    {
      title: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
      description: "Master system settings",
    },
  ],
  
  anonymous: [
    {
      title: "Home",
      href: "/",
      icon: Home,
      description: "Return to home page",
    },
    {
      title: "Login",
      href: "/login",
      icon: Users,
      description: "Login to your account",
    },
  ],
};

// Helper function to get navigation items based on user role
export function getNavigation(role: UserRole = 'anonymous'): NavItem[] {
  return navConfig[role] || navConfig.anonymous;
}
