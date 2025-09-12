export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  resolved?: boolean;
}

export interface UserEngagement {
  user_id: string;
  session_duration: number;
  pages_visited: number;
  actions_taken: number;
  last_activity: string;
}

export interface FeatureAdoption {
  feature_name: string;
  usage_count: number;
  unique_users: number;
  adoption_rate: number;
  period: string;
}