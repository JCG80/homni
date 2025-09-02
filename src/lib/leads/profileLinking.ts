import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface ProfileData {
  full_name: string;
  email: string;
  phone?: string;
  role?: 'user' | 'company';
  metadata?: Record<string, any>;
}

/**
 * Links anonymous leads to a user account and creates/updates profile
 */
export const linkAnonymousLeadsAndCreateProfile = async (
  userId: string, 
  profileData: ProfileData
) => {
  try {
    logger.debug('Starting profile linking process', { userId, email: profileData.email });

    // Step 1: Link anonymous leads by email
    const { data: linkedLeads, error: linkError } = await supabase
      .from('leads')
      .update({ 
        submitted_by: userId, 
        attributed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('anonymous_email', profileData.email)
      .is('submitted_by', null)
      .select('id, title, created_at');

    if (linkError) {
      logger.error('Error linking anonymous leads', { error: linkError, userId });
      throw linkError;
    }

    logger.info('Anonymous leads linked', { 
      userId, 
      linkedCount: linkedLeads?.length || 0,
      leadIds: linkedLeads?.map(l => l.id) || []
    });

    // Step 2: Create or update user profile
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const profilePayload = {
      id: userId,
      user_id: userId,
      full_name: profileData.full_name,
      email: profileData.email,
      phone: profileData.phone,
      role: profileData.role || 'user',
      metadata: {
        ...((existingProfile?.metadata as Record<string, any>) || {}),
        ...((profileData.metadata as Record<string, any>) || {}),
        onboarding_completed: true,
        leads_linked_at: new Date().toISOString(),
        linked_leads_count: linkedLeads?.length || 0
      },
      updated_at: new Date().toISOString()
    };

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(profilePayload)
        .eq('id', userId);

      if (updateError) {
        logger.error('Error updating user profile', { error: updateError, userId });
        throw updateError;
      }

      logger.info('User profile updated', { userId });
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert(profilePayload);

      if (insertError) {
        logger.error('Error creating user profile', { error: insertError, userId });
        throw insertError;
      }

      logger.info('User profile created', { userId });
    }

    // Step 3: Create company profile if role is company
    if (profileData.role === 'company' && profileData.metadata?.companyName) {
      const { data: existingCompany } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const companyPayload = {
        user_id: userId,
        name: profileData.metadata.companyName,
        contact_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        metadata: {
          ...((existingCompany?.metadata as Record<string, any>) || {}),
          created_from_onboarding: true,
          linked_leads_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      };

      if (existingCompany) {
        const { error: updateCompanyError } = await supabase
          .from('company_profiles')
          .update(companyPayload)
          .eq('user_id', userId);

        if (updateCompanyError) {
          logger.error('Error updating company profile', { error: updateCompanyError, userId });
          // Don't throw - company profile is secondary
        } else {
          logger.info('Company profile updated', { userId });
        }
      } else {
        const { error: insertCompanyError } = await supabase
          .from('company_profiles')
          .insert(companyPayload);

        if (insertCompanyError) {
          logger.error('Error creating company profile', { error: insertCompanyError, userId });
          // Don't throw - company profile is secondary
        } else {
          logger.info('Company profile created', { userId });
        }
      }
    }

    return {
      linkedLeadsCount: linkedLeads?.length || 0,
      linkedLeads: linkedLeads || [],
      profileCreated: !existingProfile,
      profileUpdated: !!existingProfile
    };

  } catch (error) {
    logger.error('Profile linking process failed', { error, userId });
    throw error;
  }
};

/**
 * Check if a user has unlinked anonymous leads
 */
export const checkUnlinkedLeads = async (email: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('anonymous_email', email)
      .is('submitted_by', null);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    logger.error('Error checking unlinked leads', { error, email });
    return 0;
  }
};