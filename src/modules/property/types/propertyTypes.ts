
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
  document_type: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
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
