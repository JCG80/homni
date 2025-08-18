import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { new_mode } = await req.json();
    
    if (!['personal', 'professional'].includes(new_mode)) {
      throw new Error('Invalid mode');
    }

    // Get current metadata
    const currentMeta = user.app_metadata || {};
    const allowedModes = currentMeta.allowed_modes || ['personal'];
    
    if (!allowedModes.includes(new_mode)) {
      throw new Error('Mode not allowed for this user');
    }

    // Update user metadata with new active mode
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          ...currentMeta,
          active_mode: new_mode
        }
      }
    );

    if (updateError) {
      throw updateError;
    }

    console.log(`User ${user.id} switched to ${new_mode} mode`);

    return new Response(
      JSON.stringify({ success: true, mode: new_mode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in switch-role function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});