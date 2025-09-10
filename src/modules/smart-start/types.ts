import { UserRole } from '@/modules/auth/normalizeRole';

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

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  popular?: boolean;
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