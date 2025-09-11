/**
 * Property Module Types
 * Type definitions for the home documentation and maintenance system
 */

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

export type MaintenanceStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'overdue' 
  | 'cancelled';

export type MaintenancePriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export type DocumentCategory = 
  | 'deed' 
  | 'insurance' 
  | 'warranty' 
  | 'inspection' 
  | 'maintenance' 
  | 'renovation' 
  | 'tax' 
  | 'other';

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
  status: PropertyStatus;
  address: PropertyAddress;
  size_sqm?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  year_built?: number;
  purchase_date?: string;
  purchase_price?: number;
  current_value?: number;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyDocument {
  id: string;
  property_id: string;
  name: string;
  category: DocumentCategory;
  file_url: string;
  file_size: number;
  mime_type: string;
  description?: string;
  tags?: string[];
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTask {
  id: string;
  property_id: string;
  title: string;
  description?: string;
  category: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  due_date?: string;
  completed_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  service_provider?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceCategory {
  id: string;
  name: string;
  description?: string;
  recommended_frequency?: number; // months
  is_seasonal?: boolean;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface PropertyValuation {
  id: string;
  property_id: string;
  estimated_value: number;
  source: 'manual' | 'automated' | 'professional';
  notes?: string;
  created_at: string;
}

export interface PropertyStats {
  totalProperties: number;
  totalValue: number;
  pendingTasks: number;
  overdueTasks: number;
  documentsCount: number;
  maintenanceCosts: number;
}

export interface PropertySummary {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  completionScore: number;
  documentsCount: number;
  documentsTotal: number;
  maintenanceTasksCount: number;
  maintenanceOverdue: number;
  imageUrl?: string;
}

// Form types
export interface CreatePropertyForm {
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  address: PropertyAddress;
  size_sqm?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  year_built?: number;
  purchase_date?: string;
  purchase_price?: number;
  description?: string;
}

export interface CreateMaintenanceTaskForm {
  title: string;
  description?: string;
  category: string;
  priority: MaintenancePriority;
  due_date?: string;
  estimated_cost?: number;
  service_provider?: string;
}

export interface DocumentUploadForm {
  name: string;
  category: DocumentCategory;
  description?: string;
  tags?: string[];
  expiry_date?: string;
  file: File;
}

// API response types
export interface PropertyResponse {
  properties: Property[];
  total: number;
}

export interface MaintenanceTasksResponse {
  tasks: MaintenanceTask[];
  overdue: number;
  pending: number;
  completed: number;
}

export interface DocumentsResponse {
  documents: PropertyDocument[];
  total_size: number;
  categories: Record<DocumentCategory, number>;
}