
export type PropertyType = 
  | 'apartment' 
  | 'house' 
  | 'townhouse' 
  | 'cabin' 
  | 'commercial' 
  | 'land';

export type PropertyStatus = 
  | 'owned' 
  | 'rented' 
  | 'for_sale' 
  | 'sold' 
  | 'under_renovation';

export interface PropertyAddress {
  street: string;
  city: string;
  zip_code: string;
  municipality: string;
  county: string;
  country: string;
}

export interface Property {
  id: string;
  user_id: string;
  name: string;
  type: PropertyType;
  status?: PropertyStatus;
  address?: string; // Keep as string for backwards compatibility
  size?: number; // Keep as size for backwards compatibility
  purchase_date?: string;
  current_value?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyDocument {
  id: string;
  property_id: string;
  name: string;
  title?: string;
  document_type: string;
  documentType?: string; // Alias for compatibility
  file_path?: string;
  uploaded_at?: string;
  uploadedAt?: string; // Alias for compatibility
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTask {
  id: string;
  property_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyExpense {
  id: string;
  property_id: string;
  name: string;
  amount: number;
  date: string;
  recurring?: boolean;
  recurring_frequency?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyTransfer {
  id: string;
  property_id: string;
  previous_owner_id: string;
  new_owner_id: string;
  transfer_date: string;
  notes?: string;
}
