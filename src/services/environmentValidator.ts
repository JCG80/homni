/**
 * Enhanced Environment Validation Service
 * Provides detailed validation and graceful degradation for missing configurations
 */

import { getApiStatus, type ApiStatus } from './apiStatus';
import { logger } from '@/utils/logger';

export interface EnvironmentValidation {
  isValid: boolean;
  criticalIssues: string[];
  warnings: string[];
  suggestions: string[];
  degradationMode: 'none' | 'partial' | 'full';
}

export interface ServiceStatus {
  supabase: 'available' | 'missing' | 'misconfigured';
  authentication: 'enabled' | 'disabled';
  database: 'connected' | 'disconnected';
}

/**
 * Validate environment configuration with detailed feedback
 */
export const validateEnvironment = (): EnvironmentValidation => {
  const apiStatus = getApiStatus();
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Check for critical missing configurations
  if (apiStatus.missingConfigs.includes('VITE_SUPABASE_URL')) {
    criticalIssues.push('Supabase URL mangler - autentisering og database vil ikke fungere');
    suggestions.push('Sett VITE_SUPABASE_URL i miljøvariabler');
  }
  
  if (apiStatus.missingConfigs.includes('VITE_SUPABASE_ANON_KEY')) {
    criticalIssues.push('Supabase anonym nøkkel mangler - API-kall vil feile');
    suggestions.push('Sett VITE_SUPABASE_ANON_KEY i miljøvariabler');
  }
  
  // Check for warnings
  if (apiStatus.warnings.length > 0) {
    warnings.push(...apiStatus.warnings);
  }
  
  // Development-specific suggestions
  if (import.meta.env.MODE === 'development') {
    if (!apiStatus.isOperational) {
      suggestions.push('Kjør i demo-modus uten backend-funksjonalitet');
      suggestions.push('Kontakt utvikler for å sette opp Supabase-tilkobling');
    }
  }
  
  // Determine degradation mode
  let degradationMode: 'none' | 'partial' | 'full' = 'none';
  if (criticalIssues.length > 0) {
    degradationMode = apiStatus.missingConfigs.length >= 2 ? 'full' : 'partial';
  }
  
  return {
    isValid: criticalIssues.length === 0,
    criticalIssues,
    warnings,
    suggestions,
    degradationMode
  };
};

/**
 * Get service availability status
 */
export const getServiceStatus = (): ServiceStatus => {
  const apiStatus = getApiStatus();
  
  const supabaseStatus = apiStatus.isOperational 
    ? 'available' 
    : apiStatus.missingConfigs.length > 0 
      ? 'missing' 
      : 'misconfigured';
      
  return {
    supabase: supabaseStatus,
    authentication: supabaseStatus === 'available' ? 'enabled' : 'disabled',
    database: supabaseStatus === 'available' ? 'connected' : 'disconnected'
  };
};

/**
 * Log detailed environment validation results
 */
export const logEnvironmentValidation = (): void => {
  if (import.meta.env.MODE !== 'development') return;
  
  const validation = validateEnvironment();
  const serviceStatus = getServiceStatus();
  
  console.group('🔍 Detailed Environment Validation');
  
  if (validation.isValid) {
    console.info('✅ Environment is properly configured');
  } else {
    console.warn('⚠️ Environment issues detected');
    
    if (validation.criticalIssues.length > 0) {
      console.error('Critical Issues:');
      validation.criticalIssues.forEach(issue => console.error(`  • ${issue}`));
    }
    
    if (validation.warnings.length > 0) {
      console.warn('Warnings:');
      validation.warnings.forEach(warning => console.warn(`  • ${warning}`));
    }
    
    if (validation.suggestions.length > 0) {
      console.info('Suggestions:');
      validation.suggestions.forEach(suggestion => console.info(`  • ${suggestion}`));
    }
  }
  
  console.info('Service Status:', serviceStatus);
  console.info('Degradation Mode:', validation.degradationMode);
  console.groupEnd();
  
  // Structured logging for debugging
  logger.info('Environment validation complete', {
    module: 'environment',
    validation,
    serviceStatus,
    timestamp: new Date().toISOString()
  });
};

/**
 * Get user-friendly error messages for missing services
 */
export const getServiceErrorMessage = (service: keyof ServiceStatus): string => {
  const status = getServiceStatus();
  
  switch (service) {
    case 'supabase':
      if (status.supabase === 'missing') {
        return 'Backend-tjenester er ikke konfigurert. Appen kjører i demo-modus.';
      }
      if (status.supabase === 'misconfigured') {
        return 'Backend-konfigurasjonen er ikke komplett. Noen funksjoner kan være utilgjengelige.';
      }
      return '';
      
    case 'authentication':
      return status.authentication === 'disabled' 
        ? 'Autentisering er ikke tilgjengelig uten backend-konfigurasjon.' 
        : '';
        
    case 'database':
      return status.database === 'disconnected'
        ? 'Database-tilkobling er ikke tilgjengelig. Data vil ikke bli lagret.'
        : '';
        
    default:
      return '';
  }
};