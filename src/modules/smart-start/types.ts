import { UserRole } from '@/modules/auth/normalizeRole';
import { ServiceCategory as BaseServiceCategory } from '@/types/service-types';

export interface SmartStartProps {
  className?: string;
  defaultRole?: UserRole;
  onComplete?: (data: any) => void;
}

export interface SearchStep {
  id: number;
  name: string;
  description: string;
  required: boolean;
}

// Extend base ServiceCategory with SmartStart-specific fields
export interface ServiceCategory extends BaseServiceCategory {
  icon: string;
  roles: UserRole[];
}

export interface SearchFlowData {
  role?: UserRole;
  service?: string;
  serviceName?: string;
  postalCode?: string;
  location?: string;
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
  metadata?: Record<string, any>;
}