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

    console.log(`SendGrid API stub called: ${method} ${action}`);

    let requestData = {};
    if (method !== 'GET') {
      try {
        requestData = await req.json();
      } catch {
        requestData = {};
      }
    }

    // Log API request attempt
    const logData = {
      integration_id: '00000000-0000-0000-0000-000000000003', // SendGrid integration ID
      method,
      endpoint: `/api/sendgrid/${action}`,
      status_code: 202,
      success: true,
      response_time_ms: Math.floor(Math.random() * 150) + 75,
      request_data: requestData,
      response_data: { mock: true, action }
    };

    await supabase.from('api_request_logs').insert(logData);

    let mockResponse = {};

    switch (action) {
      case 'send-email':
        mockResponse = {
          message_id: 'mock_msg_' + Date.now(),
          status: 'queued',
          accepted: [(requestData as any)?.to || 'test@example.com'],
          rejected: [],
          mock: true,
          ready_for_activation: true
        };
        break;

      case 'send-template':
        mockResponse = {
          message_id: 'mock_template_' + Date.now(),
          template_id: (requestData as any)?.template_id || 'd-123456789',
          status: 'queued',
          mock: true
        };
        break;

      case 'verify-webhook':
        mockResponse = {
          verified: true,
          webhook_id: 'mock_webhook_' + Date.now(),
          events: ['delivered', 'opened', 'clicked', 'bounced'],
          mock: true
        };
        break;

      case 'get-stats':
        mockResponse = {
          stats: [{
            date: new Date().toISOString().split('T')[0],
            stats: [{
              metrics: {
                blocks: Math.floor(Math.random() * 5),
                bounce_drops: Math.floor(Math.random() * 3),
                bounces: Math.floor(Math.random() * 10),
                clicks: Math.floor(Math.random() * 100) + 50,
                deferred: Math.floor(Math.random() * 5),
                delivered: Math.floor(Math.random() * 500) + 200,
                invalid_emails: Math.floor(Math.random() * 2),
                opens: Math.floor(Math.random() * 300) + 100,
                processed: Math.floor(Math.random() * 600) + 300,
                requests: Math.floor(Math.random() * 650) + 350,
                spam_report_drops: 0,
                spam_reports: Math.floor(Math.random() * 2),
                unique_clicks: Math.floor(Math.random() * 80) + 40,
                unique_opens: Math.floor(Math.random() * 250) + 100,
                unsubscribe_drops: 0,
                unsubscribes: Math.floor(Math.random() * 5)
              }
            }]
          }],
          mock: true
        };
        break;

      default:
        mockResponse = {
          message: `SendGrid API stub endpoint: ${action}`,
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
    console.error('Error in SendGrid API stub:', error);
    
    // Log error
    await supabase.from('api_request_logs').insert({
      integration_id: '00000000-0000-0000-0000-000000000003',
      method: req.method,
      endpoint: '/api/sendgrid/error',
      status_code: 500,
      success: false,
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