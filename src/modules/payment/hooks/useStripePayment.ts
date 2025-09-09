import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "@/components/ui/use-toast";

const stripePromise = loadStripe(
  'pk_test_51QwDliFST83rvPWBiTZ7N52P5JIqewmrb8L4rdUskmfNEVLhjLUScQKqmVmw2JjI9qQu9ToxmiLBKO9owBv8gmFH00SOCtRbLP'
);

export interface PaymentData {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export const useStripePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (paymentData: PaymentData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required for payments');
      }

      const { data, error: functionError } = await supabase.functions.invoke(
        'create-stripe-checkout',
        {
          body: {
            priceId: paymentData.priceId,
            successUrl: paymentData.successUrl || `${window.location.origin}/dashboard/success`,
            cancelUrl: paymentData.cancelUrl || `${window.location.origin}/pricing`,
            metadata: {
              userId: user.id,
              ...paymentData.metadata
            }
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Payment initialization failed');
      }

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Payment Processing",
        description: "Redirecting to secure payment checkout...",
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createPortalSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      const { data, error: functionError } = await supabase.functions.invoke(
        'create-stripe-portal',
        {
          body: {
            returnUrl: `${window.location.origin}/dashboard/billing`
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Portal access failed');
      }

      if (!data?.url) {
        throw new Error('No portal URL received');
      }

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Portal access failed';
      setError(errorMessage);
      
      toast({
        title: "Portal Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    createPortalSession,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};