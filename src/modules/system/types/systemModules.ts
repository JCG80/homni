
export interface SystemModule {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  requires_role?: string[];
  created_at: string;
  updated_at: string;
}
