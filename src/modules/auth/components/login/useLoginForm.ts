
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UseLoginFormProps } from '@/types/hooks';

// Enhanced validation schema with more helpful error messages
const formSchema = z.object({
  email: z.string()
    .email("Vennligst oppgi en gyldig e-postadresse")
    .min(1, "E-postadresse er påkrevd"),
  password: z.string()
    .min(1, "Passord er påkrevd")
    .min(6, "Passordet må være minst 6 tegn"),
});

export type LoginFormValues = z.infer<typeof formSchema>;

export const useLoginForm = ({ onSuccess, redirectTo, userType = 'private' }: UseLoginFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const maxRetries = 3;
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setCurrentAttempt(prev => prev + 1);
    
    try {
      console.log(`Logging in user: ${values.email} (type: ${userType})`);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        console.error("Login error:", signInError);
        setLastError(signInError);
        
        // Provide more user-friendly error messages
        if (signInError.message.includes("credentials")) {
          setError("Ugyldig e-postadresse eller passord");
        } else if (signInError.message.includes("email")) {
          setError("E-postadressen er ikke verifisert. Sjekk innboksen din.");
        } else {
          setError(signInError.message);
        }
        
        setIsSubmitting(false);
        return;
      }

      // Success handling
      console.log("Login success:", data);
      toast.success("Du er nå logget inn");
      
      // Handle any pending redirects
      let returnPath = redirectTo;
      
      // Check query parameters for a returnUrl
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrlParam = urlParams.get('returnUrl');
      
      if (returnUrlParam) {
        try {
          returnPath = decodeURIComponent(returnUrlParam);
          console.log(`Using return URL from query parameter: ${returnPath}`);
        } catch (error) {
          console.error("Error decoding return URL:", error);
        }
      }
      
      // Handle custom success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Redirect to the appropriate path
      if (returnPath) {
        navigate(returnPath, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      setLastError(error);
      setError(`En feil oppstod: ${error.message || 'Ukjent feil'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting,
    error,
    currentAttempt,
    maxRetries,
    lastError,
  };
};
