import { supabase } from '@/lib/supabaseClient';
import { ApiError } from '@/utils/apiHelpers';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

/**
 * User Preferences API - Lead submission preferences and categories
 */

export interface LeadSubmissionPreferences {
  preferred_categories: string[];
  default_contact_method: 'email' | 'phone' | 'sms';
  notification_preferences: {
    email_updates: boolean;
    sms_updates: boolean;
    push_notifications: boolean;
    assignment_alerts: boolean;
    status_updates: boolean;
  };
  location_preferences: {
    default_location?: string;
    search_radius_km?: number;
    include_remote_services: boolean;
  };
  budget_preferences: {
    typical_budget_range?: string;
    currency: 'NOK' | 'EUR' | 'USD';
    show_budget_in_requests: boolean;
  };
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  parent_category?: string;
  subcategories?: string[];
  is_popular: boolean;
  average_price_range?: string;
}

/**
 * Fetch user's lead submission preferences
 */
export async function fetchUserPreferences(userId?: string): Promise<LeadSubmissionPreferences | null> {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!targetUserId) {
      throw new Error('User ID required');
    }

    logger.info('Fetching user preferences', { module: 'userPreferencesApi', userId: targetUserId });

    const { data, error } = await supabase
      .from('user_profiles')
      .select('metadata, notification_preferences, ui_preferences')
      .eq('user_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError('fetchUserPreferences', error);
    }

    if (!data) return null;

    // Extract preferences from user profile data
    const metadata = (data.metadata as any) || {};
    const notificationPrefs = (data.notification_preferences as any) || {};
    
    const preferences: LeadSubmissionPreferences = {
      preferred_categories: metadata.preferred_categories || [],
      default_contact_method: metadata.default_contact_method || 'email',
      notification_preferences: {
        email_updates: notificationPrefs.email_updates ?? true,
        sms_updates: notificationPrefs.sms_updates ?? false,
        push_notifications: notificationPrefs.push_notifications ?? true,
        assignment_alerts: notificationPrefs.assignment_alerts ?? true,
        status_updates: notificationPrefs.status_updates ?? true,
      },
      location_preferences: {
        default_location: metadata.default_location,
        search_radius_km: metadata.search_radius_km || 50,
        include_remote_services: metadata.include_remote_services ?? true,
      },
      budget_preferences: {
        typical_budget_range: metadata.typical_budget_range,
        currency: metadata.currency || 'NOK',
        show_budget_in_requests: metadata.show_budget_in_requests ?? false,
      },
    };

    return preferences;
  } catch (error) {
    logger.error('Failed to fetch user preferences', { module: 'userPreferencesApi' }, error);
    throw new ApiError('fetchUserPreferences', error);
  }
}

/**
 * Update user's lead submission preferences
 */
export async function updateUserPreferences(
  preferences: Partial<LeadSubmissionPreferences>
): Promise<boolean> {
  try {
    logger.info('Updating user preferences', { module: 'userPreferencesApi' });

    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User not authenticated');
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Update metadata with lead-specific preferences
    if (preferences.preferred_categories || 
        preferences.default_contact_method || 
        preferences.location_preferences ||
        preferences.budget_preferences) {
      
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('metadata')
        .eq('user_id', user.user.id)
        .single();

      const currentMetadata = (currentProfile?.metadata as any) || {};
      const updatedMetadata = Object.assign({}, currentMetadata);
      
      if (preferences.preferred_categories) {
        updatedMetadata.preferred_categories = preferences.preferred_categories;
      }
      if (preferences.default_contact_method) {
        updatedMetadata.default_contact_method = preferences.default_contact_method;
      }
      if (preferences.location_preferences) {
        updatedMetadata.default_location = preferences.location_preferences.default_location;
        updatedMetadata.search_radius_km = preferences.location_preferences.search_radius_km;
        updatedMetadata.include_remote_services = preferences.location_preferences.include_remote_services;
      }
      if (preferences.budget_preferences) {
        updatedMetadata.typical_budget_range = preferences.budget_preferences.typical_budget_range;
        updatedMetadata.currency = preferences.budget_preferences.currency;
        updatedMetadata.show_budget_in_requests = preferences.budget_preferences.show_budget_in_requests;
      }
      
      updateData.metadata = updatedMetadata;
    }

    // Update notification preferences
    if (preferences.notification_preferences) {
      updateData.notification_preferences = preferences.notification_preferences;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.user.id);

    if (error) {
      throw new ApiError('updateUserPreferences', error);
    }

    toast({
      title: "Innstillinger oppdatert",
      description: "Dine preferanser er oppdatert",
    });

    return true;
  } catch (error) {
    logger.error('Failed to update user preferences', { module: 'userPreferencesApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke oppdatere innstillinger",
      variant: "destructive",
    });
    throw new ApiError('updateUserPreferences', error);
  }
}

/**
 * Fetch available service categories
 */
export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  try {
    logger.info('Fetching service categories', { module: 'userPreferencesApi' });

    // Return static categories since service_categories table doesn't exist yet
    return [
      { id: '1', name: 'Elektro', is_popular: true, average_price_range: '500-5000' },
      { id: '2', name: 'VVS', is_popular: true, average_price_range: '800-8000' },
      { id: '3', name: 'Bygg og anlegg', is_popular: true, average_price_range: '1000-50000' },
      { id: '4', name: 'Maling', is_popular: true, average_price_range: '300-3000' },
      { id: '5', name: 'Takarbeid', is_popular: false, average_price_range: '2000-25000' },
      { id: '6', name: 'Rørleggerarbeid', is_popular: true, average_price_range: '500-5000' },
      { id: '7', name: 'Oppvarming', is_popular: false, average_price_range: '1500-15000' },
      { id: '8', name: 'Isolasjon', is_popular: false, average_price_range: '1000-10000' },
      { id: '9', name: 'Vinduer og dører', is_popular: false, average_price_range: '2000-20000' },
      { id: '10', name: 'Hagearbeid', is_popular: true, average_price_range: '200-2000' },
    ];
  } catch (error) {
    logger.error('Failed to fetch service categories', { module: 'userPreferencesApi' }, error);
    throw new ApiError('fetchServiceCategories', error);
  }
}

/**
 * Get popular categories based on user activity
 */
export async function fetchPopularCategories(limit = 10): Promise<ServiceCategory[]> {
  try {
    logger.info('Fetching popular categories', { module: 'userPreferencesApi', limit });

    // Use static popular categories since RPC function doesn't exist yet
    const allCategories = await fetchServiceCategories();
    return allCategories.filter(cat => cat.is_popular).slice(0, limit);
  } catch (error) {
    logger.error('Failed to fetch popular categories', { module: 'userPreferencesApi' }, error);
    throw new ApiError('fetchPopularCategories', error);
  }
}

/**
 * Save user's category preferences based on usage
 */
export async function updateCategoryPreferences(categories: string[]): Promise<boolean> {
  try {
    logger.info('Updating category preferences', { module: 'userPreferencesApi', categories });

    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User not authenticated');
    }

    // Get current metadata first
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('metadata')
      .eq('user_id', user.user.id)
      .single();

    const currentMetadata = (currentProfile?.metadata as any) || {};
    const updatedMetadata = Object.assign({}, currentMetadata, { preferred_categories: categories });

    const { error } = await supabase
      .from('user_profiles')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.user.id);

    if (error) {
      throw new ApiError('updateCategoryPreferences', error);
    }

    return true;
  } catch (error) {
    logger.error('Failed to update category preferences', { module: 'userPreferencesApi' }, error);
    throw new ApiError('updateCategoryPreferences', error);
  }
}

/**
 * Get user's recent lead categories for quick access
 */
export async function fetchRecentCategories(userId?: string, limit = 5): Promise<string[]> {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!targetUserId) {
      throw new Error('User ID required');
    }

    logger.info('Fetching recent categories', { module: 'userPreferencesApi', userId: targetUserId });

    const { data, error } = await supabase
      .from('leads')
      .select('category')
      .eq('submitted_by', targetUserId)
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Get more to dedupe

    if (error) {
      throw new ApiError('fetchRecentCategories', error);
    }

    // Extract unique categories, maintaining order
    const uniqueCategories = [...new Set(data.map(lead => lead.category))];
    return uniqueCategories.slice(0, limit);
  } catch (error) {
    logger.error('Failed to fetch recent categories', { module: 'userPreferencesApi' }, error);
    return [];
  }
}