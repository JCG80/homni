
export type PropertyType = 'house' | 'cabin' | 'rental' | 'foreign';

export interface Property {
  id: string;
  user_id: string;
  name: string;
  type: PropertyType;
  address?: string;
  size?: number;
  purchase_date?: string;
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
