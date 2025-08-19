export interface Lead {
  id: string;
  title: string;
  description: string;
  location: string;
  leadType: 'buyer' | 'seller' | 'investor';
  priority: 'low' | 'medium' | 'high';
  estimatedValue?: number;
  contactInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadSearchCriteria {
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  propertyType?: 'apartment' | 'house' | 'commercial';
  leadType?: 'buyer' | 'seller' | 'investor';
}

export interface LeadDistributionResult {
  success: boolean;
  assignedBuyers: string[];
  totalCost: number;
  distributionStrategy: string;
}