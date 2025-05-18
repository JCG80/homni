
export interface Service {
  id: string;
  name: string;
  icon: string;
  category: string;
  description?: string;
  price?: number;
}

export interface ServicePreference {
  serviceId: string;
  selected: boolean;
}
