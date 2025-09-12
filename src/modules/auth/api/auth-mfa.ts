
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { handleApiError, showErrorToast } from './auth-base';
import { logger } from '@/utils/logger';

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
      logger.error("MFA enrollment error:", error);
      showErrorToast(
        "MFA-oppsettsfeil",
        "Kunde ikke starte MFA-oppsett. Vennligst prøv igjen senere."
      );
      return { factorId: null, qr: null, uri: null, error };
    }
    
    return { 
      factorId: data.id,
      qr: data.totp.qr_code,
      uri: data.totp.uri,
      error: null 
    };
  } catch (error) {
    logger.error("Unexpected MFA setup error:", error);
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
      logger.error("MFA verification error:", error);
      showErrorToast(
        "MFA-verifiseringsfeil",
        "Ugyldig kode. Vennligst prøv igjen."
      );
      return { verified: false, error };
    }
    
    // Now verify the challenge with the code
    const verifyResult = await supabase.auth.mfa.verify({
      factorId,
      challengeId: data.id,
      code: verificationCode
    });
    
    if (verifyResult.error) {
      logger.error("MFA code verification error:", verifyResult.error);
      showErrorToast(
        "MFA-verifiseringsfeil",
        "Ugyldig kode. Vennligst prøv igjen."
      );
      return { verified: false, error: verifyResult.error };
    }
    
    // Fixed: Check if data exists and handle the result properly
    // The .verify() method doesn't return a "verified" property directly
    return { verified: !!verifyResult.data, error: null };
  } catch (error) {
    logger.error("Unexpected MFA verification error:", error);
    return { verified: false, error };
  }
};
