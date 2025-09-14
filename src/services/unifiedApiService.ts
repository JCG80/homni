/**
 * UNIFIED API SERVICE
 * Consolidates all API calls into a single, consistent service layer
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

/**
 * Base API response type
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Base API configuration
 */
interface ApiConfig {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  retries?: number;
  timeout?: number;
}

/**
 * Unified API Service - handles all API interactions
 */
export class UnifiedApiService {
  private static instance: UnifiedApiService;
  private baseConfig: ApiConfig = {
    showErrorToast: true,
    showSuccessToast: false,
    retries: 3,
    timeout: 30000
  };

  public static getInstance(): UnifiedApiService {
    if (!UnifiedApiService.instance) {
      UnifiedApiService.instance = new UnifiedApiService();
    }
    return UnifiedApiService.instance;
  }

  /**
   * Generic API call with unified error handling
   */
  async call<T>(
    operation: () => Promise<any>,
    config: ApiConfig = {}
  ): Promise<ApiResponse<T>> {
    const finalConfig = { ...this.baseConfig, ...config };
    
    try {
      const result = await operation();
      
      if (result.error) {
        if (finalConfig.showErrorToast) {
          toast({
            title: "Feil",
            description: result.error.message || "Noe gikk galt",
            variant: "destructive"
          });
        }
        
        logger.error('API Error:', {
          error: result.error,
          operation: operation.name
        });
        
        return {
          success: false,
          error: result.error.message || "Ukjent feil"
        };
      }

      if (finalConfig.showSuccessToast) {
        toast({
          title: "Suksess",
          description: "Operasjon fullført",
          variant: "default"
        });
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ukjent feil";
      
      if (finalConfig.showErrorToast) {
        toast({
          title: "Feil",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
      logger.error('API Exception:', {
        error,
        operation: operation.name
      });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Lead management API
   */
  leads = {
    getAll: () => this.call(
      async () => await supabase.from('leads').select('*'),
      { showErrorToast: true }
    ),
    
    getById: (id: string) => this.call(
      async () => await supabase.from('leads').select('*').eq('id', id).single(),
      { showErrorToast: true }
    ),
    
    create: (lead: any) => this.call(
      async () => await supabase.from('leads').insert(lead).select().single(),
      { showErrorToast: true, showSuccessToast: true }
    ),
    
    update: (id: string, updates: any) => this.call(
      async () => await supabase.from('leads').update(updates).eq('id', id).select().single(),
      { showErrorToast: true, showSuccessToast: true }
    )
  };

  /**
   * User profile management API
   */
  userProfiles = {
    getCurrent: () => this.call(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return await supabase.from('user_profiles').select('*').eq('user_id', user?.id).single();
      },
      { showErrorToast: true }
    ),
    
    update: (updates: any) => this.call(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return await supabase.from('user_profiles').update(updates).eq('user_id', user?.id).select().single();
      },
      { showErrorToast: true, showSuccessToast: true }
    )
  };

  /**
   * Company profile management API
   */
  companyProfiles = {
    getAll: () => this.call(
      async () => await supabase.from('company_profiles').select('*'),
      { showErrorToast: true }
    ),
    
    getById: (id: string) => this.call(
      async () => await supabase.from('company_profiles').select('*').eq('id', id).single(),
      { showErrorToast: true }
    ),
    
    create: (company: any) => this.call(
      async () => await supabase.from('company_profiles').insert(company).select().single(),
      { showErrorToast: true, showSuccessToast: true }
    ),
    
    update: (id: string, updates: any) => this.call(
      async () => await supabase.from('company_profiles').update(updates).eq('id', id).select().single(),
      { showErrorToast: true, showSuccessToast: true }
    )
  };

  /**
   * Module access management API
   */
  moduleAccess = {
    getUserModules: (userId?: string) => this.call(
      async () => await supabase.rpc('get_user_enabled_modules', { user_id: userId }),
      { showErrorToast: true }
    ),
    
    updateUserModules: (userId: string, moduleIds: string[], enabled: boolean) => this.call(
      async () => await supabase.rpc('bulk_update_user_module_access', {
        target_user_id: userId,
        module_ids: moduleIds,
        enable_access: enabled
      }),
      { showErrorToast: true, showSuccessToast: true }
    )
  };
}

// Export singleton instance
export const unifiedApi = UnifiedApiService.getInstance();