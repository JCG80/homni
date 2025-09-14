import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Call the cleanup function
    const { data, error } = await supabaseClient.rpc('cleanup_expired_roles')

    if (error) {
      console.error('Error cleaning up expired roles:', error)
      return new Response(
        JSON.stringify({ error: error.message }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get count of expired roles that were cleaned up
    const { data: expiredCount, error: countError } = await supabaseClient
      .from('user_roles')
      .select('id', { count: 'exact', head: true })
      .lt('expires_at', new Date().toISOString())

    const cleanedUp = expiredCount || 0

    console.log(`Cleaned up ${cleanedUp} expired roles`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleaned up ${cleanedUp} expired roles`,
        cleaned_up: cleanedUp,
        timestamp: new Date().toISOString()
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})