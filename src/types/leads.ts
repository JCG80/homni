
/**
 * CompanyProfile represents a company in the system
 */
export interface CompanyProfile {
  id: string;
  name: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  tags: string[];
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
  subscription_plan: string;
  modules_access: string[];
}
