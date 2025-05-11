
import { supabase } from '@/integrations/supabase/client';
import { handleApiError, showErrorToast, showSuccessToast } from './auth-base';
import { toast } from '@/hooks/use-toast';

/**
 * Sign in user with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log(`Attempting login for: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Sign in error:", error);
      // Use toast to provide feedback about authentication errors
      if (error.message.includes('Invalid login credentials')) {
        showErrorToast(
          "Påloggingsfeil",
          "E-post eller passord er feil. Vennligst prøv igjen."
        );
      } else {
        showErrorToast("Påloggingsfeil", error.message);
      }
      return { user: null, error };
    }
    
    console.log("Login successful:", data.user);
    return { user: data.user, error: null };
  } catch (error) {
    console.error("Unexpected sign in error:", error);
    showErrorToast(
      "Teknisk feil",
      "En uventet feil oppstod ved pålogging. Vennligst prøv igjen senere."
    );
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
        showErrorToast(
          "Registreringsfeil",
          "E-postadressen er allerede registrert. Vennligst bruk en annen e-post eller prøv å logge inn."
        );
      } else {
        showErrorToast("Registreringsfeil", error.message);
      }
      return { user: null, error };
    }
    
    // Notify user about email verification if enabled in Supabase
    if (!data.session && data.user) {
      showSuccessToast(
        "Verifiser e-post",
        "Vi har sendt en bekreftelses-e-post. Vennligst sjekk innboksen din for å fullføre registreringen."
      );
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error("Unexpected sign up error:", error);
    showErrorToast(
      "Teknisk feil",
      "En uventet feil oppstod ved registrering. Vennligst prøv igjen senere."
    );
    return { user: null, error };
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      showErrorToast(
        "Utloggingsfeil",
        "Kunne ikke logge ut. Vennligst prøv igjen."
      );
    }
    
    return { error };
  } catch (error) {
    console.error("Unexpected sign out error:", error);
    return { error: error instanceof Error ? error : new Error('Unknown error during sign out') };
  }
};
