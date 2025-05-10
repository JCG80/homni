
export interface Service {
  id: string;
  name: string;
  icon: string;
  offerCount: number;
  description?: string;
  detailsRequired?: boolean;
}

export interface ServicePreference {
  serviceId: string;
  selected: boolean;
  details?: Record<string, any>;
}

export interface UserPreferences {
  userId: string;
  services: ServicePreference[];
  lastUpdated: string;
}

export interface ServiceLead {
  userId?: string;
  name?: string;
  email: string;
  phone?: string;
  services: ServicePreference[];
  source: string;
  createdAt: string;
}
