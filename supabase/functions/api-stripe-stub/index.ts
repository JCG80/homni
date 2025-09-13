import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    const method = req.method;

    console.log(`Stripe API stub called: ${method} ${action}`);

    // Log API request attempt
    const logData = {
      integration_id: '00000000-0000-0000-0000-000000000001', // Stripe integration ID
      request_method: method,
      request_url: `/api/stripe/${action}`,
      response_status: 200,
      response_time_ms: Math.floor(Math.random() * 100) + 50,
      request_body: method !== 'GET' ? await req.json().catch(() => ({})) : {},
      response_body: { mock: true, action }
    };

    await supabase.from('api_request_logs').insert(logData);

    let mockResponse = {};

    switch (action) {
      case 'create-customer':
        mockResponse = {
          id: 'cus_mock_' + Date.now(),
          email: 'test@example.com',
          created: Math.floor(Date.now() / 1000),
          mock: true
        };
        break;

      case 'create-subscription':
        mockResponse = {
          id: 'sub_mock_' + Date.now(),
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
          mock: true
        };
        break;

      case 'create-payment-intent':
        mockResponse = {
          id: 'pi_mock_' + Date.now(),
          client_secret: 'pi_mock_secret_' + Date.now(),
          status: 'requires_payment_method',
          amount: 5000,
          currency: 'nok',
          mock: true
        };
        break;

      case 'webhooks':
        mockResponse = {
          received: true,
          timestamp: Date.now(),
          event_type: 'payment_intent.succeeded',
          processed: true,
          mock: true
        };
        break;

      default:
        mockResponse = {
          message: `Stripe API stub endpoint: ${action}`,
          method,
          timestamp: new Date().toISOString(),
          mock: true,
          status: 'ready'
        };
    }

    return new Response(JSON.stringify(mockResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Stripe API stub:', error);
    
    // Log error
    await supabase.from('api_request_logs').insert({
      integration_id: '00000000-0000-0000-0000-000000000001',
      request_method: req.method,
      request_url: '/api/stripe/error',
      response_status: 500,
      response_time_ms: 0,
      error_message: error.message
    });

    return new Response(JSON.stringify({ 
      error: error.message,
      mock: true,
      ready_for_activation: true 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});