export interface InsightsData {
  totalSubmissions: number;
  totalLeads: number;
  conversionRate: number;
  topPostcodes: PostcodeStats[];
  topServices: ServiceTypeStats[];
  dailyStats: DailyStats[];
  unmatchedNeeds: UnmatchedNeed[];
}

export interface PostcodeStats {
  postcode: string;
  count: number;
  leadCount: number;
  conversionRate: number;
  region?: string;
  avgResponseTime?: number;
}

export interface ServiceTypeStats {
  service: string;
  count: number;
  leadCount: number;
  conversionRate: number;
  avgValue?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface DailyStats {
  date: string;
  submissions: number;
  leads: number;
  conversionRate: number;
}

export interface UnmatchedNeed {
  postcode: string;
  service: string;
  count: number;
  lastSubmission: string;
  companyCount: number;
  gap: 'high' | 'medium' | 'low';
}

export interface InsightsFilters {
  dateRange?: {
    from: string;
    to: string;
  };
  postcode?: string;
  serviceType?: string;
  isCompany?: boolean;
  stepCompleted?: number;
}

export interface ExportData {
  type: 'csv' | 'excel';
  data: any[];
  filename: string;
}