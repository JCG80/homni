
export interface InsuranceCompany {
  id: string;
  name: string;
  logo_url?: string | null;
  description?: string | null;
  customer_rating?: number | null;
  review_count?: number | null;
  is_featured?: boolean | null;
  is_published?: boolean | null;
  slug?: string | null;
  website_url?: string | null;
  sort_index?: number | null;
  created_at: string;
  updated_at: string;
}

export interface InsuranceType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyInsuranceType {
  id: string;
  company_id: string;
  type_id: string;
  created_at: string;
}

export interface CompanyReview {
  id: string;
  company_id: string;
  user_id?: string | null;
  title: string;
  content: string;
  rating: number;
  is_verified?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface InsuranceCompanyWithTypes extends InsuranceCompany {
  insurance_types?: InsuranceType[];
}
