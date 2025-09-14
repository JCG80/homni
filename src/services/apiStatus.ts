/**
 * API Status Service
 * Centralized service for checking API operational status and configuration
 */

export interface ApiStatus {
  isOperational: boolean;
  missingConfigs: string[];
  message: string;
  warnings: string[];
}

export interface EnvironmentConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

/**
 * Get current API operational status
 */
export const getApiStatus = (): ApiStatus => {
  const missingConfigs: string[] = [];
  const warnings: string[] = [];
  
  // Check for Supabase URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === 'placeholder' || supabaseUrl === 'your-supabase-url-here') {
    missingConfigs.push('VITE_SUPABASE_URL');
  }
  
  // Check for Supabase Anon Key
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseKey || supabaseKey === 'placeholder' || supabaseKey === 'your-supabase-anon-key-here') {
    missingConfigs.push('VITE_SUPABASE_ANON_KEY');
  }

  // Check for development placeholders
  if (supabaseUrl?.includes('localhost') || supabaseUrl?.includes('127.0.0.1')) {
    warnings.push('Bruker lokal Supabase-instans');
  }

  const isOperational = missingConfigs.length === 0;

  return {
    isOperational,
    missingConfigs,
    warnings,
    message: isOperational 
      ? 'API er operativt og klargjort for bruk' 
      : `API er klargjort men ikke operativt - mangler konfiguration: ${missingConfigs.join(', ')}`
  };
};

/**
 * Get current environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  };
};

/**
 * Check if API call should be attempted
 */
export const shouldAttemptApiCall = (): boolean => {
  const status = getApiStatus();
  return status.isOperational;
};

/**
 * Log API status warnings to console
 */
export const logApiStatusWarnings = (): void => {
  const status = getApiStatus();
  
  if (!status.isOperational) {
    console.warn('⚠️ API Status:', status.message);
    console.info('ℹ️ For å aktivere full funksjonalitet, sett opp miljøvariabler i Lovable Environment');
  }
  
  if (status.warnings.length > 0) {
    status.warnings.forEach(warning => {
      console.info('ℹ️ API Warning:', warning);
    });
  }
};