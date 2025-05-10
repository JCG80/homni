
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '../types/types';
import { determineUserRole } from '../utils/roleUtils';
import { parseUserProfile } from '../utils/parseUserProfile';
import { UserRole } from '../utils/roles';
import { toast } from '@/hooks/use-toast';

/**
 * Get user profile by user ID
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    // Fetch user profile from the database
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    if (!data) {
      console.warn("No profile found for user ID:", userId);
      return null;
    }
    
    return parseUserProfile(data);
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return null;
  }
};

/**
 * Sign in user with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Sign in error:", error);
      // Use toast to provide feedback about authentication errors
      if (error.message.includes('Invalid login credentials')) {
        toast({
          title: "Påloggingsfeil",
          description: "E-post eller passord er feil. Vennligst prøv igjen.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Påloggingsfeil",
          description: error.message,
          variant: "destructive",
        });
      }
      return { user: null, error };
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error("Unexpected sign in error:", error);
    toast({
      title: "Teknisk feil",
      description: "En uventet feil oppstod ved pålogging. Vennligst prøv igjen senere.",
      variant: "destructive",
    });
    return { user: null, error };
  }
};

/**
 * Sign up user with email and password
 */
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error("Sign up error:", error);
      // Use toast to provide feedback about registration errors
      if (error.message.includes('email address is already registered')) {
        toast({
          title: "Registreringsfeil",
          description: "E-postadressen er allerede registrert. Vennligst bruk en annen e-post eller prøv å logge inn.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registreringsfeil",
          description: error.message,
          variant: "destructive",
        });
      }
      return { user: null, error };
    }
    
    // Notify user about email verification if enabled in Supabase
    if (!data.session && data.user) {
      toast({
        title: "Verifiser e-post",
        description: "Vi har sendt en bekreftelses-e-post. Vennligst sjekk innboksen din for å fullføre registreringen.",
      });
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error("Unexpected sign up error:", error);
    toast({
      title: "Teknisk feil",
      description: "En uventet feil oppstod ved registrering. Vennligst prøv igjen senere.",
      variant: "destructive",
    });
    return { user: null, error };
  }
};

/**
 * Create a user profile
 */
export const createProfile = async (profile: Partial<Profile> & { id: string }): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Profilfeil",
        description: "Kunne ikke opprette brukerprofil. Vennligst prøv igjen senere.",
        variant: "destructive",
      });
      return null;
    }
    
    return parseUserProfile(data);
  } catch (error) {
    console.error("Unexpected error creating profile:", error);
    return null;
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    // First, fetch the current user profile to get the existing metadata
    const { data: profileData, error: fetchError } = await supabase
      .from('user_profiles')
      .select('metadata')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching user profile metadata:", fetchError);
      toast({
        title: "Oppdateringsfeil",
        description: "Kunne ikke hente brukerinformasjon for rolleendring.",
        variant: "destructive",
      });
      return false;
    }
    
    // Get current metadata or initialize as empty object if it doesn't exist
    // Ensure it's treated as an object type by using type assertion and checking for null/undefined
    const currentMetadata = profileData?.metadata && typeof profileData.metadata === 'object' 
      ? profileData.metadata 
      : {};
    
    // Update the role in the metadata field, preserving other metadata
    const updatedMetadata = { 
      ...currentMetadata, 
      role: role 
    };
    
    // Now update the profile with the new metadata
    const { error } = await supabase
      .from('user_profiles')
      .update({ metadata: updatedMetadata })
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Rolleendringsfeil",
        description: "Kunne ikke oppdatere brukerrolle.",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Rolle oppdatert",
      description: `Bruker ${userId} har fått rollen ${role}.`,
    });
    
    return true;
  } catch (error) {
    console.error("Unexpected error updating user role:", error);
    return false;
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Utloggingsfeil",
        description: "Kunne ikke logge ut. Vennligst prøv igjen.",
        variant: "destructive",
      });
    }
    
    return { error };
  } catch (error) {
    console.error("Unexpected sign out error:", error);
    return { error: error instanceof Error ? error : new Error('Unknown error during sign out') };
  }
};

/**
 * Set up multi-factor authentication for a user
 */
export const setupMFA = async () => {
  try {
    // Start the enrollment process
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    });
    
    if (error) {
      console.error("MFA enrollment error:", error);
      toast({
        title: "MFA-oppsettsfeil",
        description: "Kunne ikke starte MFA-oppsett. Vennligst prøv igjen senere.",
        variant: "destructive",
      });
      return { factorId: null, qr: null, uri: null, error };
    }
    
    return { 
      factorId: data.id,
      qr: data.totp.qr_code,
      uri: data.totp.uri,
      error: null 
    };
  } catch (error) {
    console.error("Unexpected MFA setup error:", error);
    return { factorId: null, qr: null, uri: null, error };
  }
};

/**
 * Verify MFA challenge
 */
export const verifyMFA = async (factorId: string, challengeId: string, verificationCode: string) => {
  try {
    // Fixed: Use the correct parameters expected by Supabase MFA challenge API
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId,
      // Don't include code as a separate parameter since it's not supported by MFAChallengeParams
    });
    
    if (error) {
      console.error("MFA verification error:", error);
      toast({
        title: "MFA-verifiseringsfeil",
        description: "Ugyldig kode. Vennligst prøv igjen.",
        variant: "destructive",
      });
      return { verified: false, error };
    }
    
    // Now verify the challenge with the code
    const verifyResult = await supabase.auth.mfa.verify({
      factorId,
      challengeId: data.id,
      code: verificationCode
    });
    
    if (verifyResult.error) {
      console.error("MFA code verification error:", verifyResult.error);
      toast({
        title: "MFA-verifiseringsfeil",
        description: "Ugyldig kode. Vennligst prøv igjen.",
        variant: "destructive",
      });
      return { verified: false, error: verifyResult.error };
    }
    
    return { verified: verifyResult.data?.verified || false, error: null };
  } catch (error) {
    console.error("Unexpected MFA verification error:", error);
    return { verified: false, error };
  }
};

/**
 * Helper to get audit logs (requires Supabase Pro)
 * You can replace with your own implementation using a custom table if needed
 */
export const getAuditLogs = async (userId?: string, limit = 100) => {
  try {
    // This is a placeholder implementation since audit_logs table doesn't exist yet
    // We'll implement a mock for now and return empty array
    
    // Mock data for the UI to display
    const mockLogs = Array.from({ length: 5 }).map((_, index) => ({
      id: `log-${index}`,
      user_id: userId || 'system',
      action: ['login', 'logout', 'profile_update', 'password_change', 'settings_update'][Math.floor(Math.random() * 5)],
      details: { source: 'web', ip: '192.168.1.1' },
      created_at: new Date(Date.now() - index * 86400000).toISOString(),
      ip_address: '192.168.1.1'
    }));
    
    return { logs: mockLogs, error: null };
  } catch (error) {
    console.error("Unexpected error fetching audit logs:", error);
    return { logs: null, error };
  }
};
