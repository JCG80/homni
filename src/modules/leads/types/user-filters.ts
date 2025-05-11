
/**
 * Types for user lead filter preferences
 */

export interface UserLeadFilter {
  id: string;
  user_id: string;
  filter_name: string | null;
  filter_data: {
    categories?: string[];
    zipCodes?: string[];
    status?: string;
    category?: string;
    dateRange?: {
      start?: string;
      end?: string;
    };
    searchTerm?: string;
    [key: string]: any;
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserFilterRequest {
  filter_name?: string;
  filter_data: UserLeadFilter['filter_data'];
  is_default?: boolean;
}

export interface UpdateUserFilterRequest {
  filter_name?: string;
  filter_data?: UserLeadFilter['filter_data'];
  is_default?: boolean;
}
