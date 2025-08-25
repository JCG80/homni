
import { UserRole } from '@/types/auth';

/**
 * This file serves as documentation for the complete navigation structure of the application.
 * It maps out routes, components, and user flows for each role.
 */

// Define layout slot types
type LayoutSlot = 'Header' | 'Sidebar' | 'MainContent' | 'Footer' | 'None';

// Define screen information structure
interface ScreenInfo {
  path: string;
  name: string;
  layoutSlots: LayoutSlot[];
  keyComponents: string[];
  primaryActions: string[];
  roles: UserRole[];
}

// Complete screen inventory
export const screenInventory: ScreenInfo[] = [
  // Public routes
  {
    path: '/',
    name: 'Home Page',
    layoutSlots: ['Header', 'MainContent', 'Footer'],
    keyComponents: ['ServiceSelector', 'ExampleTags', 'ServiceSelection'],
    primaryActions: ['Select Service', 'Browse Categories', 'Login'],
    roles: ['guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'],
  },
  {
    path: '/login',
    name: 'Login Page',
    layoutSlots: ['MainContent', 'Footer'],
    keyComponents: ['LoginForm', 'LoginTabs', 'QuickLogin'],
    primaryActions: ['Login', 'Switch Tab', 'Sign Up'],
    roles: ['guest'],
  },
  {
    path: '/register',
    name: 'Registration Page',
    layoutSlots: ['MainContent', 'Footer'],
    keyComponents: ['RegisterForm', 'RegisterTabs'],
    primaryActions: ['Register', 'Switch Tab'],
    roles: ['guest'],
  },
  
  // Lead routes
  {
    path: '/leads',
    name: 'Lead Management',
    layoutSlots: ['Header', 'Sidebar', 'MainContent', 'Footer'],
    keyComponents: ['LeadList', 'LeadFilter', 'LeadStatusBadge'],
    primaryActions: ['Filter Leads', 'View Lead Details', 'Change Lead Status'],
    roles: ['user', 'company', 'admin', 'master_admin'],
  },
  {
    path: '/leads/kanban',
    name: 'Lead Kanban Board',
    layoutSlots: ['Header', 'Sidebar', 'MainContent', 'Footer'],
    keyComponents: ['KanbanBoard', 'KanbanCard', 'LeadStatusBadge'],
    primaryActions: ['Drag Card', 'View Lead Details', 'Filter Leads'],
    roles: ['company', 'admin', 'master_admin'],
  },
  {
    path: '/leads/:id',
    name: 'Lead Details',
    layoutSlots: ['Header', 'Sidebar', 'MainContent', 'Footer'],
    keyComponents: ['LeadDetails', 'LeadStatusSelector', 'LeadHistory'],
    primaryActions: ['Update Status', 'Add Note', 'View History'],
    roles: ['user', 'company', 'admin', 'master_admin'],
  },
  
  // Dashboard routes
  {
    path: '/dashboard/user',
    name: 'User Dashboard',
    layoutSlots: ['Header', 'Sidebar', 'MainContent', 'Footer'],
    keyComponents: ['DashboardStats', 'LeadSummary', 'DocumentList'],
    primaryActions: ['View Stats', 'Access Documents', 'View Leads'],
    roles: ['user'],
  },
  {
    path: '/dashboard/company',
    name: 'Company Dashboard',
    layoutSlots: ['Header', 'Sidebar', 'MainContent', 'Footer'],
    keyComponents: ['DashboardKPIs', 'LeadSummary', 'LeadChart'],
    primaryActions: ['View KPIs', 'Filter Data', 'View Lead Details'],
    roles: ['company'],
  },
  {
    path: '/dashboard/content-editor',
    name: 'Content Editor Dashboard',
    layoutSlots: ['Header', 'Sidebar', 'MainContent', 'Footer'],
    keyComponents: ['ContentSummary', 'ContentList', 'DraftList'],
    primaryActions: ['Edit Content', 'Create Draft', 'Publish Content'],
    roles: ['content_editor'],
  },
  
  // Admin routes
  {
    path: '/admin/companies',
    name: 'Companies Management',
    layoutSlots: ['Header', 'Sidebar', 'MainContent', 'Footer'],
    keyComponents: ['CompanyList', 'CompanyFilter', 'CompanyDetails'],
    primaryActions: ['View Company', 'Edit Company', 'Deactivate Company'],
    roles: ['admin', 'master_admin'],
  },
  {
    path: '/admin/members',
    name: 'Users Management',
    layoutSlots: ['Header', 'Sidebar', 'MainContent', 'Footer'],
    keyComponents: ['UserList', 'UserFilter', 'UserDetails'],
    primaryActions: ['View User', 'Edit User', 'Deactivate User'],
    roles: ['admin', 'master_admin'],
  },
  {
    path: '/admin/system-modules',
    name: 'System Modules',
    layoutSlots: ['Header', 'Sidebar', 'MainContent', 'Footer'],
    keyComponents: ['ModuleList', 'ModuleDetails', 'ModuleToggle'],
    primaryActions: ['Enable Module', 'Disable Module', 'Configure Module'],
    roles: ['admin', 'master_admin'],
  },
  {
    path: '/admin/roles',
    name: 'Role Management',
    layoutSlots: ['Header', 'Sidebar', 'MainContent', 'Footer'],
    keyComponents: ['RoleList', 'RoleEditor', 'PermissionManager'],
    primaryActions: ['Edit Permissions', 'Create Role', 'Delete Role'],
    roles: ['master_admin'],
  },
  {
    path: '/admin/internal-access',
    name: 'Internal Access',
    layoutSlots: ['Header', 'Sidebar', 'MainContent', 'Footer'],
    keyComponents: ['AccessList', 'UserSelector', 'ModuleSelector'],
    primaryActions: ['Grant Access', 'Revoke Access', 'View Access History'],
    roles: ['master_admin'],
  },
];

// User flow definitions
export const userFlows = {
  guest: {
    title: 'Guest User Flow',
    steps: [
      { step: 1, path: '/', action: 'Select a service category' },
      { step: 2, path: '/select-services', action: 'Complete service form' },
      { step: 3, path: '/lead-capture', action: 'Provide contact details' },
      { step: 4, path: '/register', action: 'Create an account (optional)' },
      { step: 5, path: '/login', action: 'Login to track requests' },
    ],
  },
  user: {
    title: 'User Flow',
    steps: [
      { step: 1, path: '/login', action: 'Login with user credentials' },
      { step: 2, path: '/dashboard/user', action: 'View dashboard' },
      { step: 3, path: '/leads', action: 'Check leads/requests' },
      { step: 4, path: '/dashboard/documents', action: 'Access documents' },
      { step: 5, path: '/profile', action: 'Manage profile settings' },
    ],
  },
  company: {
    title: 'Company User Flow',
    steps: [
      { step: 1, path: '/login?type=business', action: 'Login with company credentials' },
      { step: 2, path: '/dashboard/company', action: 'View company dashboard' },
      { step: 3, path: '/leads', action: 'Manage incoming leads' },
      { step: 4, path: '/leads/kanban', action: 'Organize leads with Kanban' },
      { step: 5, path: '/dashboard/analytics', action: 'View analytics' },
    ],
  },
  admin: {
    title: 'Admin User Flow',
    steps: [
      { step: 1, path: '/login', action: 'Login with admin credentials' },
      { step: 2, path: '/admin/system-modules', action: 'Manage system modules' },
      { step: 3, path: '/admin/companies', action: 'Manage company accounts' },
      { step: 4, path: '/admin/members', action: 'Manage user accounts' },
      { step: 5, path: '/admin/leads', action: 'Overview all leads' },
    ],
  },
  master_admin: {
    title: 'Master Admin User Flow',
    steps: [
      { step: 1, path: '/login', action: 'Login with master admin credentials' },
      { step: 2, path: '/admin/system-modules', action: 'Manage system configuration' },
      { step: 3, path: '/admin/roles', action: 'Manage roles and permissions' },
      { step: 4, path: '/admin/internal-access', action: 'Control system access' },
      { step: 5, path: '/admin/companies', action: 'Manage companies' },
    ],
  },
};
